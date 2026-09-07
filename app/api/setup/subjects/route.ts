import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();


    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // SQL to create the subjects table
    const createSubjectsTableSQL = `
      CREATE TABLE IF NOT EXISTS public.subjects (
          id uuid NOT NULL DEFAULT gen_random_uuid(),
          school_id uuid NOT NULL,
          subject_code character varying NOT NULL,
          subject_name character varying NOT NULL,
          description text,
          category character varying DEFAULT 'Core',
          weekly_hours integer DEFAULT 4,
          status character varying DEFAULT 'Active',
          created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT subjects_pkey PRIMARY KEY (id),
          CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
          CONSTRAINT subjects_school_code_unique UNIQUE (school_id, subject_code)
      );

      CREATE INDEX IF NOT EXISTS idx_subjects_school ON public.subjects(school_id);
      CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects(school_id, category);
      CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(school_id, status);

      ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS school_isolation_subjects_policy ON public.subjects 
          FOR ALL USING (school_id = get_current_school_id());

      COMMENT ON TABLE public.subjects IS 'Curriculum subjects catalog for defining available courses';
      COMMENT ON COLUMN public.subjects.category IS 'Subject category: Core, Elective, or Extra-curricular';
      COMMENT ON COLUMN public.subjects.weekly_hours IS 'Recommended weekly instructional hours for this subject';
    `;

    // Execute the SQL using supabase rpc or direct SQL execution
    // Since supabase-js doesn't support direct SQL execution, we'll use a workaround
    // For now, let's use the existing approach of checking if table exists first
    
    const { error: checkError } = await supabaseAdmin
      .from('subjects')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.message.includes('does not exist')) {
      // Table doesn't exist, we need to create it
      // Since we can't execute raw SQL with supabase-js, we'll return instructions
      return NextResponse.json({
        error: 'Subjects table does not exist. Please run the migration manually.',
        sql: createSubjectsTableSQL,
        instructions: 'Run this SQL in your Supabase SQL editor to create the subjects table.'
      }, { status: 400 });
    }

    if (checkError) {
      return NextResponse.json({
        error: `Error checking subjects table: ${checkError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Subjects table already exists',
      success: true
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}