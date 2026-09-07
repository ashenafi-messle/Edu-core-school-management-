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

// GET /api/students/[id] - Get a specific student with full details
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
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: identifier } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('include_details') === 'true';

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    let query = supabaseAdmin
      .from('students')
      .select(`
        *,
        parents:parent_id (
          id,
          full_name,
          relationship,
          emergency_contact
        ),
        users:user_id (
          id,
          email,
          phone,
          status
        )
      `)
      .eq('school_id', schoolId);
    query = isUuid ? query.or(`id.eq.${identifier},user_id.eq.${identifier}`) : query.eq('user_id', identifier);

    const { data: student, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch student: ${error.message}` },
        { status: 404 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch additional details if requested
    if (includeDetails) {
      const [academicRecords, disciplinaryRecords, feeStatus, activities, documents] = await Promise.all([
        supabaseAdmin
          .from('student_academic_records')
          .select('*')
          .eq('student_id', student.id)
          .order('academic_year', { ascending: false }),
        
        supabaseAdmin
          .from('student_disciplinary_records')
          .select('*')
          .eq('student_id', student.id)
          .order('incident_date', { ascending: false }),
        
        supabaseAdmin
          .from('student_fee_status')
          .select('*')
          .eq('student_id', student.id)
          .order('due_date', { ascending: true }),
        
        supabaseAdmin
          .from('student_activities')
          .select('*')
          .eq('student_id', student.id)
          .order('start_date', { ascending: false }),
        
        supabaseAdmin
          .from('student_documents')
          .select('*')
          .eq('student_id', student.id)
          .order('upload_date', { ascending: false })
      ]);

      return NextResponse.json({
        ...student,
        academic_records: academicRecords.data || [],
        disciplinary_records: disciplinaryRecords.data || [],
        fee_status: feeStatus.data || [],
        activities: activities.data || [],
        documents: documents.data || []
      });
    }

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update a student
export async function PUT(
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
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: identifier } = await params;
    const body = await request.json();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    let studentLookup = supabaseAdmin
      .from('students')
      .select('id, user_id, school_id')
      .eq('school_id', schoolId);
    studentLookup = isUuid
      ? studentLookup.or(`id.eq.${identifier},user_id.eq.${identifier}`)
      : studentLookup.eq('user_id', identifier);
    const { data: existingStudent, error: lookupError } = await studentLookup.maybeSingle();
    if (lookupError) return NextResponse.json({ error: `Failed to find student: ${lookupError.message}` }, { status: 400 });
    if (!existingStudent) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const studentId = existingStudent.id;
    
    const {
      parent_id,
      admission_number,
      full_name,
      grade_level,
      section,
      gender,
      email,
      phone,
      status
    } = body;

    // Check if admission number is being changed and if it conflicts
    if (admission_number) {
      const { data: existing } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('school_id', schoolId)
        .eq('admission_number', admission_number)
        .neq('id', studentId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'A student with this admission number already exists.' },
          { status: 409 }
        );
      }
    }

    const studentUpdates = Object.fromEntries(Object.entries({
      parent_id,
      admission_number,
      full_name,
      grade_level,
      section,
      gender,
      phone: body.phone,
      address: body.address,
      updated_at: new Date().toISOString()
    }).filter(([, value]) => value !== undefined));

    const { data, error } = await supabaseAdmin
      .from('students')
      .update(studentUpdates)
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update student: ${error.message}` },
        { status: 400 }
      );
    }

    // Update user account if email or phone provided
    if ((email !== undefined || phone !== undefined || status !== undefined) && data.user_id) {
      const userUpdates = Object.fromEntries(Object.entries({ email, phone, status, updated_at: new Date().toISOString() }).filter(([, value]) => value !== undefined));
      const { error: userError } = await supabaseAdmin.from('users').update(userUpdates).eq('id', data.user_id).eq('school_id', schoolId);
      if (userError) return NextResponse.json({ error: `Failed to update account details: ${userError.message}` }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(
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
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: studentId } = await params;

    const { error } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete student: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}