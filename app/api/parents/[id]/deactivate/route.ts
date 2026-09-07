import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// PUT /api/parents/[id]/deactivate - Deactivate parent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
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
      .from('parents')
      .update({ status: 'inactive' })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to deactivate parent: ${error.message}` },
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
