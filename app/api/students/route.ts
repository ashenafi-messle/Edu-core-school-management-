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

// GET /api/students - Get all students with optional filters
export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const gradeLevel = searchParams.get('grade_level');
    const section = searchParams.get('section');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const includeDetails = searchParams.get('include_details') === 'true';

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

    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }

    if (section) {
      query = query.eq('section', section);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch students: ${error.message}` },
        { status: 400 }
      );
    }

    // If include details, fetch additional data
    if (includeDetails && data) {
      const studentIds = data.map(s => s.id);
      
      // Fetch academic records
      const { data: academicRecords } = await supabaseAdmin
        .from('student_academic_records')
        .select('*')
        .in('student_id', studentIds)
        .order('academic_year', { ascending: false });

      // Fetch fee status
      const { data: feeStatus } = await supabaseAdmin
        .from('student_fee_status')
        .select('*')
        .in('student_id', studentIds)
        .eq('payment_status', 'overdue');

      // Add additional data to each student
      const enrichedData = data.map(student => ({
        ...student,
        academic_records: academicRecords?.filter(r => r.student_id === student.id) || [],
        overdue_fees: feeStatus?.filter(f => f.student_id === student.id) || []
      }));

      return NextResponse.json(enrichedData);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/students - Enroll a new student
export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { 
      user_id, 
      parent_id, 
      admission_number, 
      full_name, 
      grade_level, 
      section,
      gender,
      email,
      phone,
      address,
      blood_group,
      date_of_birth
    } = body;

    if (!admission_number || !full_name || !grade_level) {
      return NextResponse.json(
        { error: 'Admission number, full name, and grade level are required.' },
        { status: 400 }
      );
    }

    // Verify uniqueness of admission number per school
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('admission_number', admission_number)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Admission Number '${admission_number}' already exists in your school roster.` },
        { status: 400 }
      );
    }

    // Create user account if email provided
    let userId = user_id;
    if (email && !user_id) {
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          school_id: schoolId,
          email,
          full_name,
          role: 'student',
          phone,
          status: 'active'
        })
        .select()
        .single();

      if (userError) {
        return NextResponse.json(
          { error: `Failed to create user account: ${userError.message}` },
          { status: 400 }
        );
      }
      userId = newUser.id;
    }

    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({
        school_id: schoolId,
        user_id: userId,
        parent_id,
        admission_number,
        full_name,
        grade_level,
        section,
        gender
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to enroll student: ${error.message}` },
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