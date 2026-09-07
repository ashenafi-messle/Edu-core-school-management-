import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/dashboard/stats - Get dashboard statistics for director
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
        // If no schools exist, return zero counts
        return NextResponse.json({
          students: 0,
          teachers: 0,
          parents: 0,
          subjects: 0,
          activeSubjects: 0,
          academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
        });
      }
    }

    // Get total students count from public.students
    const { count: studentsCount, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    if (studentsError) {
      return NextResponse.json(
        { error: `Failed to fetch students count: ${studentsError.message}` },
        { status: 400 }
      );
    }

    // Get total teachers count from public.teachers
    const { count: teachersCount, error: teachersError } = await supabaseAdmin
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    if (teachersError) {
      return NextResponse.json(
        { error: `Failed to fetch teachers count: ${teachersError.message}` },
        { status: 400 }
      );
    }

    // Get total parents count from public.parents
    const { count: parentsCount, error: parentsError } = await supabaseAdmin
      .from('parents')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    if (parentsError) {
      return NextResponse.json(
        { error: `Failed to fetch parents count: ${parentsError.message}` },
        { status: 400 }
      );
    }

    // Get total subjects count from public.subjects
    const { count: subjectsCount, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'Active');

    if (subjectsError) {
      return NextResponse.json(
        { error: `Failed to fetch subjects count: ${subjectsError.message}` },
        { status: 400 }
      );
    }

    // Get active subjects count for current academic year
    const currentAcademicYear = new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
    const { count: activeSubjectsCount, error: activeSubjectsError } = await supabaseAdmin
      .from('subjects')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'Active');

    if (activeSubjectsError) {
      return NextResponse.json(
        { error: `Failed to fetch active subjects count: ${activeSubjectsError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      students: studentsCount || 0,
      teachers: teachersCount || 0,
      parents: parentsCount || 0,
      subjects: subjectsCount || 0,
      activeSubjects: activeSubjectsCount || 0,
      academicYear: currentAcademicYear
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
