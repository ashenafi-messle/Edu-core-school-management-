/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/admin/registrations/:id/files/:fileType - View/download student uploaded files
// fileType can be: birth_certificate, school_records, student_photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileType: string }> }
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
    const { id: registrationId, fileType } = await params;
    
    // Validate file type
    const validFileTypes = ['birth_certificate', 'school_records', 'student_photo'];
    if (!validFileTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be one of: birth_certificate, school_records, student_photo' },
        { status: 400 }
      );
    }
    
    // Map file type to database column
    const columnMap: Record<string, string> = {
      birth_certificate: 'birth_certificate_url',
      school_records: 'school_records_url',
      student_photo: 'student_photo_url'
    };
    
    const columnName = columnMap[fileType];
    
    // Fetch registration with the specific file URL
    const { data: registration, error } = await supabaseAdmin!
      .from('registrations')
      .select(columnName)
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching registration:', error);
      return NextResponse.json(
        { error: 'Failed to fetch registration', details: error.message },
        { status: 500 }
      );
    }
    
    const fileUrl = registration[columnName as keyof typeof registration] as string;
    
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'No file uploaded for this type' },
        { status: 404 }
      );
    }
    
    // Fetch the file from the URL
    // If it's a Supabase Storage URL, we can create a signed URL
    // If it's an external URL, we'll proxy it
    
    try {
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch file from storage' },
          { status: response.status }
        );
      }
      
      // Get file content
      const fileBuffer = await response.arrayBuffer();
      
      // Determine content type
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileType}_${registrationId}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
      
    } catch (fetchError) {
      console.error('Error fetching file from URL:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in admin registration file API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}