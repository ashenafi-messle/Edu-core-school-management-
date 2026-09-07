import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum/folders - Get all curriculum folders for a teacher
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    let schoolId = getSchoolId(request);
    
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json([]);
      }
    }
    
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get('teacher_id');

    let query = supabaseAdmin
      .from('curriculum_folders')
      .select('*')
      .eq('school_id', schoolId);

    if (teacher_id) {
      query = query.eq('teacher_id', teacher_id);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Curriculum folders table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch curriculum folders: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/curriculum/folders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/curriculum/folders - Create a new curriculum folder
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    let schoolId = getSchoolId(request);
    
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json(
          { error: 'No school found. Please create a school first.' },
          { status: 400 }
        );
      }
    }
    
    const body = await request.json();
    
    const {
      teacher_id,
      parent_folder_id,
      folder_name,
      description,
      folder_type,
      subject_id,
      grade_level,
      section_name,
      sort_order
    } = body;

    if (!teacher_id || !folder_name) {
      return NextResponse.json(
        { error: 'Missing required fields: teacher_id, folder_name' },
        { status: 400 }
      );
    }

    // Verify teacher exists in the school
    const { data: teacher } = await supabaseAdmin
      .from('teachers')
      .select('id')
      .eq('id', teacher_id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found in this school.' },
        { status: 400 }
      );
    }

    // If parent_folder_id is provided, verify it exists and belongs to the teacher
    if (parent_folder_id) {
      const { data: parentFolder } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', parent_folder_id)
        .eq('teacher_id', teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found or does not belong to this teacher.' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate folder name under the same parent
    const { data: existing } = await supabaseAdmin
      .from('curriculum_folders')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('parent_folder_id', parent_folder_id || null)
      .eq('folder_name', folder_name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_folders')
      .insert({
        school_id: schoolId,
        teacher_id,
        parent_folder_id,
        folder_name,
        description,
        folder_type: folder_type || 'general',
        subject_id,
        grade_level,
        section_name,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Curriculum folders table does not exist in database. Please run the migration to create it.',
            requiresMigration: true
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create curriculum folder: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
