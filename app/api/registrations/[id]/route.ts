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

    const { data: registration, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve registration: ${error.message}` },
        { status: 400 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: `Registration with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const updatePayload = { ...body };
    delete updatePayload.school_id;

    if (body.status) {
      const now = new Date().toISOString();
      
      switch (body.status) {
        case 'under_review':
          updatePayload.review_started_at = now;
          break;
        case 'approved':
          updatePayload.approved_at = now;
          break;
        case 'rejected':
          updatePayload.rejected_at = now;
          break;
        case 'enrolled':
          updatePayload.enrolled_at = now;
          break;
      }
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
        { error: `Failed to update registration: ${error.message}` },
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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete registration: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Registration with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}