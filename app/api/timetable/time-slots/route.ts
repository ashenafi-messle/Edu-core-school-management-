import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/timetable/time-slots - Get all time slots for the school
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
    
    const { data, error } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Time slots table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch time slots: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/timetable/time-slots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/timetable/time-slots - Create a new time slot
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
      slot_name,
      start_time,
      end_time,
      break_time,
      order_index
    } = body;

    if (!slot_name || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: slot_name, start_time, end_time' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('time_slots')
      .insert({
        school_id: schoolId,
        slot_name,
        start_time,
        end_time,
        break_time: break_time || false,
        order_index: order_index || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Time slots table does not exist in database. Please run the migration to create it.',
            requiresMigration: true
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create time slot: ${error.message}` },
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
