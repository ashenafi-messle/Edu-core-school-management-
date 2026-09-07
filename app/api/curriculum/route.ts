import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum - Get all curriculum documents for the school
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
    
    // For development: if no school ID provided, get the first school from database
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
    const subject_id = searchParams.get('subject_id');
    const document_type = searchParams.get('document_type');
    const status = searchParams.get('status');
    const academic_year_id = searchParams.get('academic_year_id');
    const grade_level = searchParams.get('grade_level');
    const section_name = searchParams.get('section_name');
    const folder_id = searchParams.get('folder_id');

    let query = supabaseAdmin
      .from('curriculum_documents')
      .select('*')
      .eq('school_id', schoolId);

    if (teacher_id) query = query.eq('teacher_id', teacher_id);
    if (subject_id) query = query.eq('subject_id', subject_id);
    if (document_type) query = query.eq('document_type', document_type);
    if (status) query = query.eq('status', status);
    if (academic_year_id) query = query.eq('academic_year_id', academic_year_id);
    if (grade_level) query = query.eq('grade_level', grade_level);
    if (section_name) query = query.eq('section_name', section_name);
    if (folder_id) query = query.eq('folder_id', folder_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Curriculum documents table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch curriculum documents: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/curriculum:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/curriculum - Create a new curriculum document
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
    
    console.log('Received curriculum document creation request:', body);
    
    const {
      teacher_id,
      subject_id,
      title,
      description,
      document_type,
      academic_year_id,
      grade_level,
      section_name,
      file_url,
      file_name,
      file_size,
      file_type,
      storage_path,
      is_public,
      folder_id
    } = body;

    console.log('Extracted file fields:', {
      file_url,
      file_name,
      file_size,
      file_type,
      storage_path
    });

    if (!teacher_id || !title || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields: teacher_id, title, document_type' },
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

    // If subject_id is provided, verify it exists
    if (subject_id) {
      const { data: subject } = await supabaseAdmin
        .from('subjects')
        .select('id')
        .eq('id', subject_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!subject) {
        return NextResponse.json(
          { error: 'Subject not found in this school.' },
          { status: 400 }
        );
      }
    }

    // If folder_id is provided, verify it exists and belongs to the teacher
    if (folder_id) {
      const { data: folder } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('teacher_id', teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or does not belong to this teacher.' },
          { status: 400 }
        );
      }
    }

    const documentData = {
      school_id: schoolId,
      teacher_id,
      subject_id,
      title,
      description,
      document_type,
      academic_year_id,
      grade_level,
      section_name,
      file_url,
      file_name,
      file_size,
      file_type,
      storage_path,
      is_public: is_public || false,
      folder_id,
      status: body.status || 'published',
      published_at: body.status === 'draft' ? null : new Date().toISOString(),
      version: 1
    };

    console.log('Attempting to insert document with data:', documentData);

    const { data, error } = await supabaseAdmin
      .from('curriculum_documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Curriculum documents table does not exist in database. Please run the migration to create it.',
            requiresMigration: true
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create curriculum document: ${error.message}` },
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
