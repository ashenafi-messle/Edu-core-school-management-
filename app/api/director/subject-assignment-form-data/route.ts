import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// GET /api/director/subject-assignment-form-data - Get all data needed for subject assignment form
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
        // Return empty data if no school exists
        return NextResponse.json({
          teachers: [],
          subjects: [],
          academicYears: [],
          currentAcademicYear: null,
          semesters: ['Fall', 'Spring', 'Summer', 'Winter']
        });
      }
    }

    // Fetch active teachers with their assigned grades and sections
    let teachers = [];
    try {
      const { data: teachersData, error: teachersError } = await supabaseAdmin
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .order('full_name', { ascending: true });

      if (!teachersError && teachersData) {
        teachers = teachersData;
      }
    } catch (error) {
      console.log('Teachers table might not exist or has different structure:', error);
    }

    // Fetch subjects
    let subjects = [];
    try {
      const { data: subjectsData, error: subjectsError } = await supabaseAdmin
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('subject_name', { ascending: true });

      if (!subjectsError && subjectsData) {
        subjects = subjectsData;
      }
    } catch (error) {
      console.log('Subjects table might not exist or has different structure:', error);
    }

    // Fetch academic years
    let academicYears = [];
    try {
      const { data: academicYearsData, error: academicYearsError } = await supabaseAdmin
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .order('academic_year_start', { ascending: false });

      if (!academicYearsError && academicYearsData) {
        academicYears = academicYearsData;
      } else if (academicYearsError) {
        console.log('Academic years error:', academicYearsError.message);
        // If table doesn't exist, create a default academic year
        if (academicYearsError.message.includes('does not exist') || academicYearsError.message.includes('relation')) {
          const defaultYear = {
            id: generateUUID(),
            school_id: schoolId,
            year_name: '2024-2025',
            academic_year_start: new Date().toISOString().split('T')[0],
            academic_year_end: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
            current_semester: 'Fall',
            is_active: true,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          academicYears = [defaultYear];
        }
      }
    } catch (error) {
      console.log('Academic years table might not exist or has different structure:', error);
      // Create default academic year if table doesn't exist
      const defaultYear = {
        id: generateUUID(),
        school_id: schoolId,
        year_name: '2024-2025',
        academic_year_start: new Date().toISOString().split('T')[0],
        academic_year_end: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
        current_semester: 'Fall',
        is_active: true,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      academicYears = [defaultYear];
    }

    // Fetch section configurations
    let sectionConfigurations = [];
    try {
      const { data: sectionConfigData, error: sectionConfigError } = await supabaseAdmin
        .from('section_configurations')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade_level', { ascending: true })
        .order('section_name', { ascending: true });

      if (!sectionConfigError && sectionConfigData) {
        sectionConfigurations = sectionConfigData;
      }
    } catch (error) {
      console.log('Section configurations table might not exist or has different structure:', error);
    }

    // Get current active academic year
    const currentAcademicYear = academicYears.find(ay => ay.is_active) || academicYears[0] || null;

    // Extract unique semesters from academic years
    const uniqueSemesters = Array.from(new Set(academicYears.map(ay => ay.current_semester).filter(Boolean)));
    const semesters = uniqueSemesters.length > 0 ? uniqueSemesters : ['Fall', 'Spring', 'Summer', 'Winter'];

    return NextResponse.json({
      teachers: teachers || [],
      subjects: subjects || [],
      academicYears: academicYears || [],
      currentAcademicYear,
      sectionConfigurations: sectionConfigurations || [],
      semesters
    });
  } catch (error) {
    console.error('Error in GET /api/director/subject-assignment-form-data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
