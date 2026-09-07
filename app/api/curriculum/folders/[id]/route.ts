import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum/folders/[id] - Get a specific curriculum folder by ID
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
      .from('curriculum_folders')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve curriculum folder: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Curriculum folder not found.' },
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

// PUT /api/curriculum/folders/[id] - Update a curriculum folder
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

    // Verify folder exists
    const { data: existing } = await supabaseAdmin
      .from('curriculum_folders')
      .select('id, teacher_id, parent_folder_id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Curriculum folder not found.' },
        { status: 404 }
      );
    }

    // If parent_folder_id is being updated, verify it exists and belongs to the teacher
    if (body.parent_folder_id) {
      const { data: parentFolder } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', body.parent_folder_id)
        .eq('teacher_id', existing.teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found or does not belong to this teacher.' },
          { status: 400 }
        );
      }
    }

    // If folder_name is being updated, check for duplicates
    if (body.folder_name) {
      const parentFolderId = body.parent_folder_id !== undefined ? body.parent_folder_id : existing.parent_folder_id;
      const { data: duplicate } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('teacher_id', existing.teacher_id)
        .eq('parent_folder_id', parentFolderId || null)
        .eq('folder_name', body.folder_name)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in this location.' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_folders')
      .update(body)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update curriculum folder: ${error.message}` },
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

// DELETE /api/curriculum/folders/[id] - Delete a curriculum folder
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

    // Check if folder has documents
    const { data: documents } = await supabaseAdmin
      .from('curriculum_documents')
      .select('id')
      .eq('folder_id', id)
      .eq('school_id', schoolId)
      .limit(1);

    if (documents && documents.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder that contains documents. Please move or delete the documents first.' },
        { status: 400 }
      );
    }

    // Check if folder has subfolders
    const { data: subfolders } = await supabaseAdmin
      .from('curriculum_folders')
      .select('id')
      .eq('parent_folder_id', id)
      .eq('school_id', schoolId)
      .limit(1);

    if (subfolders && subfolders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder that contains subfolders. Please move or delete the subfolders first.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_folders')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete curriculum folder: ${error.message}` },
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
