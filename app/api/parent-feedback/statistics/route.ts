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
      .from('parent_feedback')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve statistics' },
        { status: 500 }
      );
    }

    const stats = {
      total: data.length,
      pending: data.filter((f: any) => f.status === 'pending').length,
      in_progress: data.filter((f: any) => f.status === 'in_progress').length,
      resolved: data.filter((f: any) => f.status === 'resolved').length,
      closed: data.filter((f: any) => f.status === 'closed').length,
      by_type: {
        complaint: data.filter((f: any) => f.type === 'complaint').length,
        suggestion: data.filter((f: any) => f.type === 'suggestion').length,
        enquiry: data.filter((f: any) => f.type === 'enquiry').length,
        compliment: data.filter((f: any) => f.type === 'compliment').length
      },
      by_priority: {
        low: data.filter((f: any) => f.priority === 'low').length,
        normal: data.filter((f: any) => f.priority === 'normal').length,
        high: data.filter((f: any) => f.priority === 'high').length,
        urgent: data.filter((f: any) => f.priority === 'urgent').length
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}