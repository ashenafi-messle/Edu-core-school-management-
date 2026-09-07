import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';

// POST /api/setup/seed-student-allocations - Seed student allocations for testing
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();


    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const seedSQL = `
      -- Create section allocations for students in Grade 12, Section A
      INSERT INTO public.section_allocations (
        id,
        school_id,
        student_id,
        section_configuration_id,
        grade_level,
        section_name,
        allocation_method,
        allocation_date,
        academic_year_id,
        created_at,
        updated_at
      ) VALUES
        -- yabsira jej - Grade 12, Section A
        (
          gen_random_uuid(),
          'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
          'f582cdf8-b0ca-4328-9e87-8b8ab3a2a4bc',
          '78e0855c-809d-4888-b04c-0500e8f27d80',
          'Grade 12',
          'Section A',
          'auto',
          CURRENT_TIMESTAMP,
          'd58c7141-7302-4b44-834f-7575902ba792',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        -- hermela  dejene - Grade 12, Section A
        (
          gen_random_uuid(),
          'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
          '06dc97cf-9738-403b-af60-34be656bbf88',
          '78e0855c-809d-4888-b04c-0500e8f27d80',
          'Grade 12',
          'Section A',
          'auto',
          CURRENT_TIMESTAMP,
          'd58c7141-7302-4b44-834f-7575902ba792',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        -- Ashenafi mesele (ADM-721511) - Grade 12, Section A
        (
          gen_random_uuid(),
          'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
          'fba806e5-f2d9-4ff1-a58f-141c55adde1f',
          '78e0855c-809d-4888-b04c-0500e8f27d80',
          'Grade 12',
          'Section A',
          'auto',
          CURRENT_TIMESTAMP,
          'd58c7141-7302-4b44-834f-7575902ba792',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ),
        -- amen - Grade 12, Section A
        (
          gen_random_uuid(),
          'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
          'e812f9ea-8c1e-4583-9530-9859e1973ba2',
          '78e0855c-809d-4888-b04c-0500e8f27d80',
          'Grade 12',
          'Section A',
          'auto',
          CURRENT_TIMESTAMP,
          'd58c7141-7302-4b44-834f-7575902ba792',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      ON CONFLICT DO NOTHING;
    `;

    // Try to execute the SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: seedSQL
    });

    if (error) {
      console.error('Error executing seed SQL:', error);
      return NextResponse.json(
        { error: `Failed to execute seed SQL: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student allocations seeded successfully',
      data
    });

  } catch (error) {
    console.error('Error in POST /api/setup/seed-student-allocations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
