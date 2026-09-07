import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum/[id] - Get a specific curriculum document by ID
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
    
    const schoolId = getSchoolId(request);
    const { id } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_documents')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve curriculum document: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Curriculum document not found.' },
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

// PUT /api/curriculum/[id] - Update a curriculum document
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
    
    const schoolId = getSchoolId(request);
    const { id } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Remove school_id from body to prevent tenant bypass
    delete body.school_id;

    // Verify document exists
    const { data: existing } = await supabaseAdmin
      .from('curriculum_documents')
      .select('id, teacher_id, version')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Curriculum document not found.' },
        { status: 404 }
      );
    }

    // If folder_id is being updated, verify it exists and belongs to the teacher
    if (body.folder_id) {
      const { data: folder } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', body.folder_id)
        .eq('teacher_id', existing.teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or does not belong to this teacher.' },
          { status: 400 }
        );
      }
    }

    // If status is being changed to published, set published_at and increment version
    if (body.status === 'published') {
      body.published_at = new Date().toISOString();
      body.version = (existing.version || 0) + 1;
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_documents')
      .update(body)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update curriculum document: ${error.message}` },
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

// DELETE /api/curriculum/[id] - Delete a curriculum document
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
    
    const schoolId = getSchoolId(request);
    const { id } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_documents')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete curriculum document: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ deleted: true, record: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
