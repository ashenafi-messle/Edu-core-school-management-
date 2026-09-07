import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);
  
  if (!schoolId && supabaseAdmin) {
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .single();
    
    if (school) {
      schoolId = school.id;
    }
  }
  
  return schoolId;
}

// GET /api/school-schedule-settings - Get school schedule settings
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');

    let query = supabaseAdmin
      .from('school_schedule_settings')
      .select('*')
      .eq('school_id', schoolId);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    query = query.order('created_at', { ascending: false }).limit(1);

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('School schedule settings table does not exist yet, returning null');
        return NextResponse.json(null);
      }
      console.error('Error fetching school schedule settings:', error);
      return NextResponse.json(
        { error: `Failed to fetch school schedule settings: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/school-schedule-settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/school-schedule-settings - Create or update school schedule settings
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const {
      academic_year_id,
      period_duration_minutes,
      number_of_periods_per_day,
      school_start_time,
      school_end_time,
      lunch_break_enabled,
      lunch_break_duration_minutes,
      lunch_break_after_period,
      lunch_break_start_time,
      additional_breaks,
      days_of_operation
    } = body;

    if (!academic_year_id) {
      return NextResponse.json(
        { error: 'Missing required field: academic_year_id' },
        { status: 400 }
      );
    }

    // Check if settings already exist for this school and academic year
    const { data: existing } = await supabaseAdmin
      .from('school_schedule_settings')
      .select('id')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academic_year_id)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabaseAdmin
        .from('school_schedule_settings')
        .update({
          period_duration_minutes,
          number_of_periods_per_day,
          school_start_time,
          school_end_time,
          lunch_break_enabled,
          lunch_break_duration_minutes,
          lunch_break_after_period,
          lunch_break_start_time,
          additional_breaks,
          days_of_operation,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to update school schedule settings: ${error.message}` },
          { status: 400 }
        );
      }
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabaseAdmin
        .from('school_schedule_settings')
        .insert({
          school_id: schoolId,
          academic_year_id,
          period_duration_minutes: period_duration_minutes || 60,
          number_of_periods_per_day: number_of_periods_per_day || 7,
          school_start_time: school_start_time || '09:00:00',
          school_end_time: school_end_time || '15:45:00',
          lunch_break_enabled: lunch_break_enabled !== undefined ? lunch_break_enabled : true,
          lunch_break_duration_minutes: lunch_break_duration_minutes || 60,
          lunch_break_after_period: lunch_break_after_period || 4,
          lunch_break_start_time: lunch_break_start_time || '12:30:00',
          additional_breaks: additional_breaks || [],
          days_of_operation: days_of_operation || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          is_active: true
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'School schedule settings table does not exist in database. Please run the migration to create it.',
              requiresMigration: true
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: `Failed to create school schedule settings: ${error.message}` },
          { status: 400 }
        );
      }
      result = data;
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
