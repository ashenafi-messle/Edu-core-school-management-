import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/parents/[id]/profile - Get complete parent profile with associated students count
export async function GET(
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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (parentError || !parent) {
      return NextResponse.json(
        { error: `Parent with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // Get user information if linked
    let email, phone, profilePictureUrl, status;
    if (parent.user_id) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, phone, status, profile_picture_url')
        .eq('id', parent.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (user) {
        email = user.email;
        phone = user.phone;
        profilePictureUrl = user.profile_picture_url;
        status = user.status;
      }
    }

    // Count associated students
    const { count: studentsCount } = await supabaseAdmin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id)
      .eq('school_id', schoolId);

    return NextResponse.json({
      id: parent.id,
      user_id: parent.user_id,
      school_id: parent.school_id,
      full_name: parent.full_name,
      relationship: parent.relationship,
      emergency_contact: parent.emergency_contact,
      phone: phone,
      email: email,
      profile_picture_url: profilePictureUrl,
      status: status,
      created_at: parent.created_at,
      updated_at: parent.updated_at,
      associated_students_count: studentsCount || 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
