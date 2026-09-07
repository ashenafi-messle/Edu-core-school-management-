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

// GET /api/students/[id]/fee-status - Get fee status for a student
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
    
    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('payment_status');
    const academicYear = searchParams.get('academic_year');

    let query = supabaseAdmin
      .from('student_fee_status')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch fee status: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/students/[id]/fee-status - Create fee record for a student
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
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: studentId } = await params;
    const body = await request.json();
    
    const {
      fee_type,
      academic_year,
      semester,
      amount,
      due_date,
      discount_amount,
      discount_reason,
      notes
    } = body;

    if (!fee_type || !academic_year || !amount || !due_date) {
      return NextResponse.json(
        { error: 'Fee type, academic year, amount, and due date are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('student_fee_status')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        fee_type,
        academic_year,
        semester,
        amount,
        amount_paid: 0,
        due_date,
        payment_status: 'unpaid',
        discount_amount: discount_amount || 0,
        discount_reason,
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create fee record: ${error.message}` },
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