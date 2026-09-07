import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;
    const body = await request.json();
    const { parent_id, student_id } = body;

    // Verify registration exists
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!registration) {
      return NextResponse.json(
        { error: `Registration with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // If student ID provided, update student with parent_id
    if (student_id && parent_id) {
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .update({ parent_id: parent_id })
        .eq('id', student_id)
        .eq('school_id', schoolId);

      if (studentError) {
        return NextResponse.json(
          { error: `Failed to link student to parent: ${studentError.message}` },
          { status: 400 }
        );
      }
    }

    // Update registration status to enrolled if both linked
    if (student_id && parent_id) {
      const { error: updateError } = await supabaseAdmin
        .from('registrations')
        .update({ 
          status: 'enrolled',
          enrolled_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('school_id', schoolId);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update registration status: ${updateError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Records linked successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}