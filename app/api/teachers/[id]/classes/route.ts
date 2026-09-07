import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/classes - Get teacher's classes, subjects, grades, sections, and timetable
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
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .or(`id.eq.${teacherId},user_id.eq.${teacherId}`)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Get current academic year if not specified
    let currentAcademicYearId = academicYearId;
    if (!currentAcademicYearId) {
      const { data: currentYear } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .single();
      
      currentAcademicYearId = currentYear?.id;
    }

    // Get subject assignments for this teacher (using correct database schema)
    let subjectAssignmentsQuery = supabaseAdmin
      .from('subject_assignments')
      .select(`
        *,
        subject:subjects(id, subject_code, subject_name, category, weekly_hours, description),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .eq('teacher_id', teacher.id)
      .eq('school_id', schoolId)
      .eq('status', 'Active');

    if (currentAcademicYearId) {
      subjectAssignmentsQuery = subjectAssignmentsQuery.eq('academic_year_id', currentAcademicYearId);
    }

    const { data: subjectAssignments, error: assignmentsError } = await subjectAssignmentsQuery;

    if (assignmentsError) {
      console.error('Error fetching subject assignments:', assignmentsError);
      return NextResponse.json(
        { error: `Failed to fetch subject assignments: ${assignmentsError.message}` },
        { status: 400 }
      );
    }

    // Get weekly timetable for this teacher (following director's timetable pattern)
    let timetableQuery = supabaseAdmin
      .from('weekly_timetables')
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category, weekly_hours),
        section_configuration:section_configurations(id, grade_level, section_name, academic_year, max_capacity, current_count)
      `)
      .eq('teacher_id', teacher.id)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (currentAcademicYearId) {
      timetableQuery = timetableQuery.eq('academic_year_id', currentAcademicYearId);
    }

    const { data: timetable, error: timetableError } = await timetableQuery.order('day_of_week').order('time_slot_id', { ascending: true });

    // Get section configurations for context (following director's pattern)
    const { data: sectionConfigurations, error: sectionsError } = await supabaseAdmin
      .from('section_configurations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (sectionsError) {
      console.error('Error fetching section configurations:', sectionsError);
    }

    if (timetableError) {
      console.error('Error fetching timetable:', timetableError);
      // Don't fail the entire request if timetable fails, just return empty timetable
    }

    // Group subject assignments by grade level and section (following director's pattern)
    const groupedByGrade = new Map<string, Map<string, any[]>>();
    
    subjectAssignments?.forEach((assignment: any) => {
      const gradeLevel = assignment.grade_level;
      const sectionName = assignment.section_name;
      
      if (!groupedByGrade.has(gradeLevel)) {
        groupedByGrade.set(gradeLevel, new Map());
      }
      
      const gradeMap = groupedByGrade.get(gradeLevel)!;
      if (!gradeMap.has(sectionName)) {
        gradeMap.set(sectionName, []);
      }
      
      gradeMap.get(sectionName)!.push(assignment);
    });

    // Convert the nested maps to a structured response (matching director's data structure)
    const classesAndDivisions = Array.from(groupedByGrade.entries()).map(([gradeLevel, sectionsMap]) => ({
      grade_level: gradeLevel,
      sections: Array.from(sectionsMap.entries()).map(([sectionName, assignments]) => ({
        section_name: sectionName,
        subjects: assignments.map((assignment: any) => ({
          id: assignment.subject.id,
          subject_code: assignment.subject.subject_code,
          subject_name: assignment.subject.subject_name,
          category: assignment.subject.category,
          weekly_hours: assignment.subject.weekly_hours,
          description: assignment.subject.description,
          role: assignment.role,
          weekly_teaching_hours: assignment.weekly_hours,
          sections_assigned: assignment.sections_assigned,
          semester: assignment.semester,
          academic_year: assignment.academic_year?.year_name,
          academic_year_id: assignment.academic_year_id,
          assignment_id: assignment.id,
          assignment_date: assignment.assignment_date,
          notes: assignment.notes
        }))
      }))
    }));

    // Group timetable by day of week (following director's timetable structure)
    const timetableByDay = new Map<string, any[]>();
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Initialize all days
    daysOfWeek.forEach(day => {
      timetableByDay.set(day, []);
    });

    timetable?.forEach((entry: any) => {
      const day = entry.day_of_week;
      if (timetableByDay.has(day)) {
        timetableByDay.get(day)!.push({
          id: entry.id,
          time_slot: entry.time_slot,
          subject: entry.subject,
          section_configuration: entry.section_configuration,
          room_number: entry.room_number,
          notes: entry.notes,
          academic_year_id: entry.academic_year_id
        });
      }
    });

    // Convert to array format (matching director's timetable structure)
    const weeklyTimetable = Array.from(timetableByDay.entries()).map(([day, slots]) => ({
      day,
      slots: slots.sort((a, b) => a.time_slot.order_index - b.time_slot.order_index)
    }));

    // Get unique subjects taught by this teacher
    const uniqueSubjects = Array.from(
      new Map(
        subjectAssignments?.map((assignment: any) => [
          assignment.subject.id,
          assignment.subject
        ]) || []
      ).values()
    );

    // Get unique grades taught by this teacher
    const uniqueGrades = Array.from(new Set(
      subjectAssignments?.map((assignment: any) => assignment.grade_level) || []
    ));

    // Get unique sections taught by this teacher
    const uniqueSections = Array.from(new Set(
      subjectAssignments?.map((assignment: any) => assignment.section_name) || []
    ));

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department,
        email: teacher.email,
        photo: teacher.photo,
        weekly_load: teacher.weekly_load,
        assigned_grades: teacher.assigned_grades || [],
        assigned_sections: teacher.assigned_sections || []
      },
      academic_year_id: currentAcademicYearId,
      subjects: uniqueSubjects,
      grades: uniqueGrades,
      sections: uniqueSections,
      section_configurations: sectionConfigurations || [],
      classes_and_divisions: classesAndDivisions,
      weekly_timetable: weeklyTimetable,
      subject_assignments: subjectAssignments || [],
      total_subjects: uniqueSubjects.length,
      total_classes: classesAndDivisions.reduce((acc, grade) => 
        acc + grade.sections.length, 0),
      total_weekly_hours: subjectAssignments?.reduce((acc, assignment) => 
        acc + (assignment.weekly_hours || 0), 0) || 0,
      total_assignments: subjectAssignments?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/classes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
