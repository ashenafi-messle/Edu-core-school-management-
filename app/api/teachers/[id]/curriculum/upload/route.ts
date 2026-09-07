import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'curriculum-documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for curriculum documents
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed'
];

// POST /api/teachers/[id]/curriculum/upload - Upload curriculum document
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
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const formData = await request.formData();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subjectId = formData.get('subject_id') as string;
    const academicYearId = formData.get('academic_year_id') as string;
    const gradeLevel = formData.get('grade_level') as string;
    const sectionName = formData.get('section_name') as string;
    const folderId = formData.get('folder_id') as string;
    const isPublic = formData.get('is_public') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, Word, PowerPoint, Excel, images, and ZIP files are allowed' },
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

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${schoolId}/${teacherId}/${documentType}/${timestamp}-${random}-${safeFileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseStorage.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Validate document type
    const validDocumentTypes = ['syllabus', 'lesson_plan', 'teaching_material', 'assessment', 'reference'];
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document_type. Must be one of: ${validDocumentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // If subject_id is provided, verify it exists
    if (subjectId) {
      const { data: subject, error: subjectError } = await supabaseAdmin
        .from('subjects')
        .select('id')
        .eq('id', subjectId)
        .eq('school_id', schoolId)
        .single();

      if (subjectError || !subject) {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }
    }

    // If folder_id is provided, verify it exists
    if (folderId) {
      const { data: folder, error: folderError } = await supabaseAdmin
        .from('curriculum_folders')
        .select('id')
        .eq('id', folderId)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .single();

      if (folderError || !folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    // Create curriculum document record
    const { data: document, error: documentError } = await supabaseAdmin
      .from('curriculum_documents')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        teacher_id: teacherId,
        subject_id: subjectId || null,
        title: title || file.name,
        description: description || null,
        document_type: documentType,
        academic_year_id: academicYearId || null,
        grade_level: gradeLevel || null,
        section_name: sectionName || null,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: fileName,
        folder_id: folderId || null,
        is_public: isPublic === 'true',
        status: 'published',
        published_at: new Date().toISOString(),
        version: 1,
        created_by: teacher.user_id,
        updated_by: teacher.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (documentError) {
      // Clean up uploaded file if document creation fails
      await supabaseStorage.storage
        .from(BUCKET_NAME)
        .remove([fileName]);
      
      return NextResponse.json(
        { error: `Failed to create curriculum document: ${documentError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        document_id: document.id,
        user_id: teacher.user_id,
        action: 'created',
        metadata: {
          document_type: document.document_type,
          title: document.title,
          file_name: file.name,
          file_size: file.size
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Curriculum document uploaded successfully',
      document,
      file_info: {
        url: urlData.publicUrl,
        path: fileName,
        size: file.size,
        type: file.type
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teachers/[id]/curriculum/upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
