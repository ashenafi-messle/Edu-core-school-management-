import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'enrolled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Verify registration exists
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: `Registration with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // Handle status transitions with timestamps
    const updatePayload: any = { status };
    const now = new Date().toISOString();
    
    switch (status) {
      case 'under_review':
        updatePayload.review_started_at = now;
        break;
      case 'approved':
        updatePayload.approved_at = now;
        break;
      case 'rejected':
        updatePayload.rejected_at = now;
        updatePayload.rejection_reason = reason;
        break;
      case 'enrolled':
        updatePayload.enrolled_at = now;
        break;
    }

    if (reason) {
      updatePayload.admin_notes = reason;
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update(updatePayload)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update registration status: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}