import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search');
    const gradeLevel = searchParams.get('grade_level');
    const relationship = searchParams.get('relationship');

    // Build query for approved/enrolled registrations
    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('school_id', schoolId)
      .in('status', ['approved', 'enrolled']);

    // Apply search filter
    if (search) {
      query = query.or(
        `student_first_name.ilike.%${search}%,student_last_name.ilike.%${search}%,parent_first_name.ilike.%${search}%,parent_last_name.ilike.%${search}%`
      );
    }

    // Apply grade level filter
    if (gradeLevel) {
      query = query.eq('student_grade_level', gradeLevel);
    }

    // Apply relationship filter
    if (relationship) {
      query = query.eq('parent_relationship', relationship);
    }

    const { data: registrations, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch parent-student mappings' },
        { status: 500 }
      );
    }

    // Transform to mapping format
    const mappings = registrations.map((reg: any) => ({
      registration_id: reg.id,
      parent_id: undefined,
      student_id: undefined,
      parent_first_name: reg.parent_first_name,
      parent_last_name: reg.parent_last_name,
      parent_relationship: reg.parent_relationship,
      parent_phone: reg.parent_phone,
      parent_email: reg.parent_email,
      student_first_name: reg.student_first_name,
      student_last_name: reg.student_last_name,
      student_grade_level: reg.student_grade_level,
      student_phone: reg.student_phone,
      student_email: reg.student_email,
      status: reg.status,
      emergency_contact: reg.emergency_contact_name !== null && reg.emergency_contact_name !== undefined,
      created_at: reg.submitted_at
    }));

    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Error in mappings API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}