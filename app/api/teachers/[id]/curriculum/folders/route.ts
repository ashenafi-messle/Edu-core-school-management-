import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/curriculum/folders - Get curriculum folders for a teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const database = supabaseAdmin;
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    
    const folderType = searchParams.get('folder_type');
    const subjectId = searchParams.get('subject_id');
    const gradeLevel = searchParams.get('grade_level');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Build query for folders
    let query = supabaseAdmin
      .from('curriculum_folders')
      .select(`
        *,
        subjects:subject_id (id, subject_code, subject_name, category),
        parent:parent_folder_id (id, folder_name)
      `)
      .eq('school_id', schoolId)
      .eq('teacher_id', teacherId)
      .is('parent_folder_id', null); // Get root folders first

    if (folderType) query = query.eq('folder_type', folderType);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (gradeLevel) query = query.eq('grade_level', gradeLevel);

    const { data: rootFolders, error: rootError } = await query
      .order('sort_order', { ascending: true });

    if (rootError) {
      return NextResponse.json(
        { error: `Failed to retrieve folders: ${rootError.message}` },
        { status: 400 }
      );
    }

    // Get document counts for each folder
    const foldersWithCounts = await Promise.all(
      (rootFolders || []).map(async (folder) => {
        const { count } = await database
          .from('curriculum_documents')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id);

        return {
          ...folder,
          document_count: count || 0
        };
      })
    );

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id
      },
      folders: foldersWithCounts,
      total_folders: foldersWithCounts.length
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/curriculum/folders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teachers/[id]/curriculum/folders - Create a new curriculum folder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const { 
      folder_name,
      description,
      folder_type,
      subject_id,
      grade_level,
      section_name,
      parent_folder_id,
      sort_order
    } = body;

    // Validate required fields
    if (!folder_name) {
      return NextResponse.json(
        { error: 'Missing required field: folder_name' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // If parent_folder_id is provided, verify it exists and belongs to the teacher
    if (parent_folder_id) {
      const { data: parentFolder, error: parentError } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', parent_folder_id)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .single();

      if (parentError || !parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        );
      }
    }

    // Create folder
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('curriculum_folders')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        teacher_id: teacherId,
        parent_folder_id: parent_folder_id || null,
        folder_name,
        description: description || null,
        folder_type: folder_type || 'general',
        subject_id: subject_id || null,
        grade_level: grade_level || null,
        section_name: section_name || null,
        sort_order: sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (folderError) {
      return NextResponse.json(
        { error: `Failed to create folder: ${folderError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      folder
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teachers/[id]/curriculum/folders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
