import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/assignments/[id] - Get a specific assignment
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

    const { data, error } = await supabaseAdmin
      .from('assignments')
      .select('*, teachers(full_name, employee_id), subjects(subject_name, subject_code)')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve assignment: ${error.message}` },
        { status: 404 }
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

// PUT /api/assignments/[id] - Update an assignment
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
    
    const body = await request.json();
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    // Build update object with only provided fields
    const updates: any = {};
    const allowedFields = [
      'title', 'description', 'instructions', 'max_marks', 
      'due_date', 'status', 'attachments', 'grade_level', 
      'section_name', 'subject_id', 'academic_year_id'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const { data, error } = await supabaseAdmin
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update assignment: ${error.message}` },
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

// DELETE /api/assignments/[id] - Delete an assignment
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

    const { error } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete assignment: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}