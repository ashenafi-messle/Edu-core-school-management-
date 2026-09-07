/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

const BUCKET_NAME = 'curriculum-documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for curriculum files
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif'
];

export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teacherId = formData.get('teacher_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
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
        { error: 'Invalid file type. Only PDF, Word, PowerPoint, Excel, text, and image files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename with school and teacher context
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}/${teacherId}/${timestamp}-${random}.${fileExt}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to upload to Supabase Storage
    try {
      // First check if bucket exists
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.warn(`Storage bucket '${BUCKET_NAME}' does not exist. Creating bucket...`);
        
        // Try to create the bucket
        const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_TYPES
        });
        
        if (createError) {
          console.error('Failed to create storage bucket:', createError);
          return NextResponse.json({
            success: false,
            error: 'Storage bucket does not exist and could not be created. Please configure Supabase Storage.',
            details: createError.message
          }, { status: 500 });
        }
      }

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload file to storage', details: uploadError.message },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        path: fileName,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      });

    } catch (storageError) {
      console.error('Storage error:', storageError);
      
      // Fallback: Return file info without storage upload
      // This allows the system to work even if storage isn't configured
      return NextResponse.json({
        success: true,
        url: null, // No URL available
        path: null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        fallback: true // Indicate this is a fallback response
      });
    }

  } catch (error) {
    console.error('Error in curriculum upload API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
