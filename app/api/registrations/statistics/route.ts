import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('status')
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve statistics' },
        { status: 500 }
      );
    }

    const stats = {
      total: data.length,
      pending: data.filter((r: any) => r.status === 'pending').length,
      under_review: data.filter((r: any) => r.status === 'under_review').length,
      approved: data.filter((r: any) => r.status === 'approved').length,
      rejected: data.filter((r: any) => r.status === 'rejected').length,
      enrolled: data.filter((r: any) => r.status === 'enrolled').length
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}