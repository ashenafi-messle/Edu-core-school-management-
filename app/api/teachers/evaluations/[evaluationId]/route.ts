import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PUT /api/teachers/evaluations/[evaluationId] - Update evaluation
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
    
    const schoolId = getSchoolId(request);
    const { evaluationId } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const { evaluation_type, category, description } = body;

    const updateData: any = {};
    if (evaluation_type !== undefined) updateData.evaluation_type = evaluation_type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabaseAdmin
      .from('teacher_evaluations')
      .update(updateData)
      .eq('id', evaluationId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update evaluation: ${error.message}` },
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

// DELETE /api/teachers/evaluations/[evaluationId] - Delete evaluation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { evaluationId } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('teacher_evaluations')
      .delete()
      .eq('id', evaluationId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete evaluation: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
