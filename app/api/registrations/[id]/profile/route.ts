import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data: registration, error: registrationError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: `Registration with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // Try to find matching student by phone or email
    let student = null;
    const { data: studentData } = await supabaseAdmin
      .from('students')
      .select('id, admission_number')
      .eq('school_id', schoolId)
      .or(`phone.eq.${registration.student_phone},email.eq.${registration.student_email}`)
      .maybeSingle();

    if (studentData) {
      student = studentData;
    }

    // Try to find matching parent by phone or email
    let parent = null;
    const { data: parentData } = await supabaseAdmin
      .from('parents')
      .select('id, user_id')
      .eq('school_id', schoolId)
      .or(`phone.eq.${registration.parent_phone},email.eq.${registration.parent_email}`)
      .maybeSingle();

    if (parentData) {
      parent = parentData;
    }

    return NextResponse.json({
      ...registration,
      student,
      parent
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}