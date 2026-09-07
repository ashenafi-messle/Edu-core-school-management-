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
    const { response, resolved_by } = body;

    if (!response) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    // Verify feedback exists
    const { data: existing } = await supabaseAdmin
      .from('parent_feedback')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: `Feedback with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const resolvePayload = {
      response,
      resolved_by,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('parent_feedback')
      .update(resolvePayload)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to resolve feedback: ${error.message}` },
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