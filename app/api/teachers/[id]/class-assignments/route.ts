import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/teachers/[id]/class-assignments - Create class assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { id } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const {
      grade_level,
      section_name,
      subject,
      role,
      academic_year,
      semester
    } = body;

    if (!grade_level || !section_name || !subject || !academic_year) {
      return NextResponse.json(
        { error: 'Grade level, section name, subject, and academic year are required.' },
        { status: 400 }
      );
    }

    // Validate that the section configuration exists
    const { data: sectionConfig, error: sectionError } = await supabaseAdmin
      .from('section_configurations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .eq('section_name', section_name)
      .eq('academic_year', academic_year || '2025-2026')
      .maybeSingle();

    if (sectionError || !sectionConfig) {
      return NextResponse.json(
        { error: `Section configuration for ${grade_level} - ${section_name} does not exist or is not active. Please create the section first.` },
        { status: 400 }
      );
    }

    // Check if section has capacity
    if (sectionConfig.current_count >= sectionConfig.max_capacity) {
      return NextResponse.json(
        { error: `Section ${grade_level} - ${section_name} is at full capacity (${sectionConfig.current_count}/${sectionConfig.max_capacity}).` },
        { status: 400 }
      );
    }

    const assignmentData = {
      teacher_id: id,
      school_id: schoolId,
      grade_level,
      section_name,
      subject,
      role: role || 'Subject Teacher',
      academic_year,
      semester: semester || 'Semester 1',
      is_active: true,
      assigned_date: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('teacher_class_assignments')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create class assignment: ${error.message}` },
        { status: 400 }
      );
    }

    // Update teacher's assigned grades and sections arrays
    await updateTeacherArrays(id, grade_level, section_name, schoolId);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teachers/[id]/class-assignments - Get class assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('teacher_class_assignments')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId);

    if (isActive === 'true' || isActive === 'false') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query.order('assigned_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve class assignments: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update teacher's assigned grades and sections arrays
async function updateTeacherArrays(teacherId: string, grade: string, section: string, schoolId: string) {
  if (!supabaseAdmin) return;

  // Get current teacher data
  const { data: teacher } = await supabaseAdmin
    .from('teachers')
    .select('assigned_grades, assigned_sections')
    .eq('id', teacherId)
    .eq('school_id', schoolId)
    .single();

  if (!teacher) return;

  // Replace with the newly assigned grade and section
  const grades = [grade];
  const sections = [section];

  // Update teacher
  await supabaseAdmin
    .from('teachers')
    .update({ assigned_grades: grades, assigned_sections: sections })
    .eq('id', teacherId)
    .eq('school_id', schoolId);
}
