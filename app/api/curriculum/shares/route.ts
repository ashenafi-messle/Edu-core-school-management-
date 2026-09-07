import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/curriculum/shares - Get documents shared with current user
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    let schoolId = getSchoolId(request);
    
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json([]);
      }
    }
    
    const { searchParams } = new URL(request.url);
    const document_id = searchParams.get('document_id');
    const shared_with = searchParams.get('shared_with');

    let query = supabaseAdmin
      .from('curriculum_shares')
      .select('*')
      .eq('school_id', schoolId);

    if (document_id) {
      query = query.eq('document_id', document_id);
    }
    
    if (shared_with) {
      query = query.eq('shared_with', shared_with);
    } else {
      // If no specific user provided, get shares for current user
      // For now, return all active shares
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Curriculum shares table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch curriculum shares: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/curriculum/shares:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/curriculum/shares - Share a curriculum document with another user
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    let schoolId = getSchoolId(request);
    
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json(
          { error: 'No school found. Please create a school first.' },
          { status: 400 }
        );
      }
    }
    
    const body = await request.json();
    
    const {
      document_id,
      shared_with,
      share_type,
      expires_at
    } = body;

    if (!document_id || !shared_with) {
      return NextResponse.json(
        { error: 'Missing required fields: document_id, shared_with' },
        { status: 400 }
      );
    }

    // Verify document exists
    const { data: document } = await supabaseAdmin
      .from('curriculum_documents')
      .select('id, teacher_id')
      .eq('id', document_id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found in this school.' },
        { status: 400 }
      );
    }

    // Verify shared_with user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', shared_with)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: 'User to share with not found.' },
        { status: 400 }
      );
    }

    // Check if share already exists
    const { data: existing } = await supabaseAdmin
      .from('curriculum_shares')
      .select('id')
      .eq('document_id', document_id)
      .eq('shared_with', shared_with)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Document is already shared with this user.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_shares')
      .insert({
        school_id: schoolId,
        document_id,
        shared_with,
        shared_by: 'current_user_id', // TODO: Get from auth context
        share_type: share_type || 'view',
        status: 'active',
        expires_at
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Curriculum shares table does not exist in database. Please run the migration to create it.',
            requiresMigration: true
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create share: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
