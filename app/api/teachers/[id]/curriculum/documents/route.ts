import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);

  if (!supabaseAdmin) {
    return null;
  }
  
  if (!schoolId) {
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .single();
    
    if (school) {
      schoolId = school.id;
    }
  }
  
  return schoolId;
}

// GET /api/teachers/[id]/curriculum/documents - Get curriculum documents for a teacher
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
    
    const { id: teacherId } = await params;
    const schoolId = await getSchoolIdWithFallback(request);
    const { searchParams } = new URL(request.url);
    
    const documentType = searchParams.get('document_type');
    const subjectId = searchParams.get('subject_id');
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const status = searchParams.get('status');
    const folderId = searchParams.get('folder_id');

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

    // Build query for curriculum documents
    let query = supabaseAdmin
      .from('curriculum_documents')
      .select(`
        *,
        subjects:subject_id (id, subject_code, subject_name, category),
        academic_years:academic_year_id (id, year_name, is_active),
        folders:folder_id (id, folder_name, folder_type),
        creator:created_by (id, full_name, email),
        updater:updated_by (id, full_name, email)
      `)
      .eq('school_id', schoolId)
      .eq('teacher_id', teacherId);

    if (documentType) query = query.eq('document_type', documentType);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (academicYearId) query = query.eq('academic_year_id', academicYearId);
    if (gradeLevel) query = query.eq('grade_level', gradeLevel);
    if (sectionName) query = query.eq('section_name', sectionName);
    if (status) query = query.eq('status', status);
    if (folderId) query = query.eq('folder_id', folderId);

    const { data: documents, error: documentsError } = await query
      .order('created_at', { ascending: false });

    if (documentsError) {
      return NextResponse.json(
        { error: `Failed to retrieve curriculum documents: ${documentsError.message}` },
        { status: 400 }
      );
    }

    // Get shared documents
    const { data: sharedDocuments, error: sharedError } = await supabaseAdmin
      .from('curriculum_shares')
      .select(`
        document_id,
        share_type,
        status,
        expires_at,
        curriculum_documents (
          *,
          subjects:subject_id (id, subject_code, subject_name, category),
          academic_years:academic_year_id (id, year_name, is_active),
          folders:folder_id (id, folder_name, folder_type),
          creator:created_by (id, full_name, email)
        )
      `)
      .eq('school_id', schoolId)
      .eq('shared_with', teacher.user_id)
      .eq('status', 'active')
      .or('expires_at.is.null,expires_at.gt.now()');

    if (sharedError) {
      console.error('Error fetching shared documents:', sharedError);
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department
      },
      documents: documents || [],
      shared_documents: sharedDocuments?.map(share => ({
        ...share.curriculum_documents,
        share_type: share.share_type,
        expires_at: share.expires_at
      })) || [],
      total_documents: documents?.length || 0,
      total_shared: sharedDocuments?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/curriculum/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teachers/[id]/curriculum/documents - Create a new curriculum document
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
      title,
      description,
      document_type,
      subject_id,
      academic_year_id,
      grade_level,
      section_name,
      file_url,
      file_name,
      file_size,
      file_type,
      storage_path,
      folder_id,
      is_public,
      status
    } = body;

    // Validate required fields
    if (!title || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, document_type' },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes = ['syllabus', 'lesson_plan', 'teaching_material', 'assessment', 'reference'];
    if (!validDocumentTypes.includes(document_type)) {
      return NextResponse.json(
        { error: `Invalid document_type. Must be one of: ${validDocumentTypes.join(', ')}` },
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

    // If subject_id is provided, verify it exists and belongs to the school
    if (subject_id) {
      const { data: subject, error: subjectError } = await supabaseAdmin
        .from('subjects')
        .select('id')
        .eq('id', subject_id)
        .eq('school_id', schoolId)
        .single();

      if (subjectError || !subject) {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }
    }

    // If folder_id is provided, verify it exists and belongs to the teacher
    if (folder_id) {
      const { data: folder, error: folderError } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .single();

      if (folderError || !folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    // Create curriculum document
    const { data: document, error: documentError } = await supabaseAdmin
      .from('curriculum_documents')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        teacher_id: teacherId,
        subject_id: subject_id || null,
        title,
        description: description || null,
        document_type,
        academic_year_id: academic_year_id || null,
        grade_level: grade_level || null,
        section_name: section_name || null,
        file_url: file_url || null,
        file_name: file_name || null,
        file_size: file_size || null,
        file_type: file_type || null,
        storage_path: storage_path || null,
        folder_id: folder_id || null,
        is_public: is_public || false,
        status: status || 'published',
        published_at: status === 'draft' ? null : new Date().toISOString(),
        version: 1,
        created_by: teacher.user_id,
        updated_by: teacher.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (documentError) {
      return NextResponse.json(
        { error: `Failed to create curriculum document: ${documentError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        document_id: document.id,
        user_id: teacher.user_id,
        action: 'created',
        metadata: {
          document_type: document.document_type,
          title: document.title
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Curriculum document created successfully',
      document
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teachers/[id]/curriculum/documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
