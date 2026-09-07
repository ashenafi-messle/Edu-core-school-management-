import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/analytics - Get user statistics for the school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    const days = parseInt(searchParams.get('days') || '30'); // Number of periods to retrieve

    let dateStart: Date;
    if (period === 'daily') {
      dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - days);
    } else if (period === 'weekly') {
      dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - (days * 7));
    } else {
      dateStart = new Date();
      dateStart.setMonth(dateStart.getMonth() - days);
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_statistics')
      .select('*')
      .eq('school_id', schoolId)
      .eq('period_type', period)
      .gte('period_start', dateStart.toISOString().split('T')[0])
      .order('period_start', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve analytics: ${error.message}` },
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

// POST /api/analytics/calculate - Trigger statistics calculation
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    
    const schoolId = requireSchoolId(request);
    const body = await request.json();
    const { period } = body; // daily, weekly, monthly

    let functionName: string;
    if (period === 'daily') {
      functionName = 'calculate_daily_statistics';
    } else if (period === 'weekly') {
      functionName = 'calculate_weekly_statistics';
    } else if (period === 'monthly') {
      functionName = 'calculate_monthly_statistics';
    } else {
      return NextResponse.json(
        { error: 'Invalid period. Must be daily, weekly, or monthly.' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin.rpc(functionName, {
      school_uuid: schoolId
    });

    if (error) {
      return NextResponse.json(
        { error: `Failed to calculate statistics: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: `${period} statistics calculated successfully` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
