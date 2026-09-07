import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PATCH /api/teachers/[id]/curriculum/documents/[documentId] - Update a curriculum document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id: teacherId, documentId } = await params;
    const schoolId = getSchoolId(request);
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Verify document exists and belongs to the teacher
    const { data: existingDocument, error: documentError } = await supabaseAdmin
      .from('curriculum_documents')
      .select('*')
      .eq('id', documentId)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (documentError || !existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // If updating to published status, set published_at timestamp
    if (body.status === 'published' && existingDocument.status !== 'published') {
      body.published_at = new Date().toISOString();
    }

    // If updating file, increment version
    if (body.file_url && body.file_url !== existingDocument.file_url) {
      body.version = (existingDocument.version || 0) + 1;
    }

    // Update document
    const { data: updatedDocument, error: updateError } = await supabaseAdmin
      .from('curriculum_documents')
      .update({
        ...body,
        updated_by: teacher.user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update document: ${updateError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        document_id: updatedDocument.id,
        user_id: teacher.user_id,
        action: 'edited',
        metadata: {
          title: updatedDocument.title,
          changes: Object.keys(body),
          version: updatedDocument.version
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Error in PATCH /api/teachers/[id]/curriculum/documents/[documentId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id]/curriculum/documents/[documentId] - Delete a curriculum document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id: teacherId, documentId } = await params;
    const schoolId = getSchoolId(request);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Verify document exists and belongs to the teacher
    const { data: existingDocument, error: documentError } = await supabaseAdmin
      .from('curriculum_documents')
      .select('*')
      .eq('id', documentId)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (documentError || !existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete document from database
    const { error: deleteError } = await supabaseAdmin
      .from('curriculum_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete document: ${deleteError.message}` },
        { status: 400 }
      );
    }

    // Delete file from storage if it exists
    if (existingDocument.storage_path) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabaseStorage.storage
          .from('curriculum-documents')
          .remove([existingDocument.storage_path]);
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue even if storage deletion fails
      }
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        document_id: documentId,
        user_id: teacher.user_id,
        action: 'deleted',
        metadata: {
          title: existingDocument.title,
          file_name: existingDocument.file_name
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/teachers/[id]/curriculum/documents/[documentId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
