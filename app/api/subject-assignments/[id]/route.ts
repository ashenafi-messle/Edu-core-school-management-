import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);

  // For development: if no school ID provided, get the first school from database
  if (!schoolId) {
    if (!supabaseAdmin) {
      return null;
    }

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

// GET /api/subject-assignments/[id] - Get a specific subject assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: assignmentId } = await params;

    const { data, error } = await supabaseAdmin
      .from('subject_assignments')
      .select(`
        *,
        teacher:teachers(id, full_name, email, department, subjects),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .eq('id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      // Only show migration error if it's actually a table existence error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('relation "public.subject_assignments" does not exist') || 
          errorMessage.includes('table "subject_assignments" does not exist')) {
        return NextResponse.json(
          { error: 'Subject assignments table does not exist yet' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch subject assignment: ${error.message}` },
        { status: 404 }
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

// PUT /api/subject-assignments/[id] - Update a subject assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: assignmentId } = await params;
    const body = await request.json();
    
    const {
      teacher_id,
      subject_id,
      academic_year_id,
      semester,
      role,
      sections_assigned,
      weekly_hours,
      status,
      notes
    } = body;

    const { data, error } = await supabaseAdmin
      .from('subject_assignments')
      .update({
        teacher_id,
        subject_id,
        academic_year_id,
        semester,
        role,
        sections_assigned,
        weekly_hours,
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .eq('school_id', schoolId)
      .select(`
        *,
        teacher:teachers(id, full_name, email, department, subjects),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update subject assignment: ${error.message}` },
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

// DELETE /api/subject-assignments/[id] - Delete a subject assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: assignmentId } = await params;

    const { error } = await supabaseAdmin
      .from('subject_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete subject assignment: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Subject assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}