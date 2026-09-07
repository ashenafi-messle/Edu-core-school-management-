import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '../../../lib/supabase';
import { getSchoolId } from '../../../lib/tenant-context';

// GET /api/subjects - Get all subjects for the school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    // Get school ID from header, or use a default for development
    let schoolId = getSchoolId(request);
    
    // For development: if no school ID provided, get the first school from database
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        // If no schools exist, return empty array
        return NextResponse.json([]);
      }
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Active';
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('subjects')
      .select('id, subject_code, subject_name, category')
      .eq('school_id', schoolId)
      .eq('status', status)
      .limit(500);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('subject_code', { ascending: true });

    if (error) {
      // If the subjects table doesn't exist, return empty array with migration info
      if (error.message.includes('relation') || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('Subjects table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch subjects: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/subjects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a new subject
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    // Get school ID from header, or use a default for development
    let schoolId = getSchoolId(request);
    
    // For development: if no school ID provided, get the first school from database
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
      subject_code,
      subject_name,
      description,
      category,
      weekly_hours,
      status
    } = body;

    // Validate required fields
    if (!subject_code || !subject_name) {
      return NextResponse.json(
        { error: 'Missing required fields: subject_code, subject_name' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        school_id: schoolId,
        subject_code,
        subject_name,
        description,
        category: category || 'Core',
        weekly_hours: weekly_hours || 4,
        status: status || 'Active'
      })
      .select()
      .single();

    if (error) {
      // If the subjects table doesn't exist, provide helpful error message
      if (error.message.includes('relation') || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        return NextResponse.json(
          { 
            error: 'Subjects table does not exist in database. Please run the migration to create it.',
            requiresMigration: true,
            sql: `
-- Run this SQL in your Supabase SQL Editor to create the subjects table:
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

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS school_isolation_subjects_policy ON public.subjects;
CREATE POLICY school_isolation_subjects_policy ON public.subjects 
    FOR ALL USING (school_id = get_current_school_id());
            `
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create subject: ${error.message}` },
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