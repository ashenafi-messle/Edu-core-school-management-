import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/teachers/[id]/evaluations - Create teacher evaluation
export async function POST(
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
    const { id } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const {
      evaluation_type,
      category,
      description,
      academic_year,
      evaluator_id
    } = body;

    if (!evaluation_type || !category || !description || !academic_year) {
      return NextResponse.json(
        { error: 'Evaluation type, category, description, and academic year are required.' },
        { status: 400 }
      );
    }

    const evaluationData = {
      teacher_id: id,
      school_id: schoolId,
      evaluation_type,
      category,
      description,
      academic_year,
      evaluator_id,
      evaluation_date: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('teacher_evaluations')
      .insert([evaluationData])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create evaluation: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teachers/[id]/evaluations - Get evaluations for a teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('teacher_evaluations')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId);

    if (type) {
      query = query.eq('evaluation_type', type);
    }

    const { data, error } = await query.order('evaluation_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve evaluations: ${error.message}` },
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
