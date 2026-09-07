/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum/[id]/download - Download a curriculum document
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
    const { id: documentId } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required.' },
        { status: 400 }
      );
    }

    // Get the document details
    const { data: document, error } = await supabaseAdmin
      .from('curriculum_documents')
      .select('*')
      .eq('id', documentId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve document: ${error.message}` },
        { status: 400 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found.' },
        { status: 404 }
      );
    }

    // Check if document has a file URL
    if (!document.file_url) {
      return NextResponse.json(
        { error: 'No file available for download.' },
        { status: 400 }
      );
    }

    // Log the download activity
    try {
      // Note: In a real implementation, you'd get the user ID from authentication
      // For now, we'll log without user context
      await supabaseAdmin
        .from('curriculum_activity_log')
        .insert({
          school_id: schoolId,
          document_id: documentId,
          user_id: null, // Would be authenticated user ID in production
          action: 'downloaded',
          metadata: {
            file_name: document.file_name,
            file_size: document.file_size,
            file_type: document.file_type
          }
        });
    } catch (logError) {
      // Don't fail the download if logging fails
      console.error('Failed to log download activity:', logError);
    }

    const fileResponse = await fetch(document.file_url, { cache: 'no-store' });
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to retrieve file from storage (${fileResponse.status}).` },
        { status: 502 }
      );
    }

    const fileBody = await fileResponse.arrayBuffer();
    const safeFileName = String(document.file_name || 'curriculum-document').replace(/["\\\r\n]/g, '_');
    return new NextResponse(fileBody, {
      status: 200,
      headers: {
        'Content-Type': document.file_type || fileResponse.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': String(fileBody.byteLength),
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
        'Cache-Control': 'private, no-store'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/curriculum/[id]/download:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}