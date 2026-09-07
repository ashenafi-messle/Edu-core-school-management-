import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/students - Get students in teacher's assigned grades/sections
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
      .eq('id', teacherId)
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

    // Get teacher's subject assignments to find which grades/sections they teach
    let subjectAssignmentsQuery = supabaseAdmin
      .from('subject_assignments')
      .select('grade_level, section_name, subject_id')
      .eq('teacher_id', teacherId)
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

    // Extract unique grade/section combinations the teacher teaches
    const uniqueGradeSectionCombos = Array.from(
      new Map(
        subjectAssignments?.map((assignment: any) => [
          `${assignment.grade_level}|${assignment.section_name}`,
          { grade_level: assignment.grade_level, section_name: assignment.section_name }
        ]) || []
      ).values()
    );

    if (uniqueGradeSectionCombos.length === 0) {
      return NextResponse.json({
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          employee_id: teacher.employee_id,
          department: teacher.department
        },
        academic_year_id: currentAcademicYearId,
        students_by_grade_section: [],
        total_students: 0,
        message: 'No subject assignments found for this teacher'
      });
    }

    // Query section_allocations to get students in the teacher's assigned grades/sections
    // Use a simpler approach with direct Supabase queries for each grade/section combo
    let allAllocations: any[] = [];

    for (const combo of uniqueGradeSectionCombos) {
      console.log(`Querying for grade: ${combo.grade_level}, section: ${combo.section_name}`);
      
      let query = supabaseAdmin
        .from('section_allocations')
        .select(`
          *,
          student:students(id, full_name, admission_number, grade_level, section, gender, parent_id, created_at)
        `)
        .eq('school_id', schoolId)
        .eq('grade_level', combo.grade_level)
        .eq('section_name', combo.section_name);

      if (currentAcademicYearId) {
        query = query.eq('academic_year_id', currentAcademicYearId);
      }

      const { data: allocations, error: comboError } = await query;

      console.log(`Query result for ${combo.grade_level} ${combo.section_name}:`, 
        comboError ? `Error: ${comboError.message}` : `Found ${allocations?.length || 0} allocations`);

      if (!comboError && allocations) {
        allAllocations = [...allAllocations, ...allocations];
      }
    }

    // Fetch attendance data for all students for the subjects taught by this teacher
    const studentIds = allAllocations.map(a => a.student_id);
    const subjectIds = uniqueGradeSectionCombos.flatMap(combo => 
      subjectAssignments
        ?.filter(a => a.grade_level === combo.grade_level && a.section_name === combo.section_name)
        .map(a => a.subject_id) || []
    );
    
    let attendanceData: any[] = [];
    
    if (studentIds.length > 0) {
      let attendanceQuery = supabaseAdmin
        .from('attendance')
        .select('*')
        .in('student_id', studentIds)
        .eq('school_id', schoolId);

      // Filter by subject if the attendance table has subject_id
      if (subjectIds.length > 0) {
        attendanceQuery = attendanceQuery.in('subject_id', subjectIds);
      }

      const { data: attendanceRecords, error: attendanceError } = await attendanceQuery;

      if (!attendanceError && attendanceRecords) {
        attendanceData = attendanceRecords;
      }
    }

    // Calculate attendance percentages for each student
    const attendanceMap = new Map<string, { total: number; present: number; percentage: number }>();
    
    attendanceData.forEach(record => {
      const studentId = record.student_id;
      if (!attendanceMap.has(studentId)) {
        attendanceMap.set(studentId, { total: 0, present: 0, percentage: 0 });
      }
      const stats = attendanceMap.get(studentId)!;
      stats.total++;
      if (record.status === 'present' || record.status === 'Present') {
        stats.present++;
      }
      stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    });

    // Fetch subject performance data (grades/assignments) for students
    let performanceData: any[] = [];
    if (studentIds.length > 0 && subjectIds.length > 0) {
      const { data: performanceRecords, error: performanceError } = await supabaseAdmin
        .from('student_grades')
        .select('*')
        .in('student_id', studentIds)
        .in('subject_id', subjectIds)
        .eq('school_id', schoolId);

      if (!performanceError && performanceRecords) {
        performanceData = performanceRecords;
      }
    }

    // Calculate performance percentages for each student
    const performanceMap = new Map<string, { total: number; passed: number; percentage: number }>();
    
    performanceData.forEach(record => {
      const studentId = record.student_id;
      if (!performanceMap.has(studentId)) {
        performanceMap.set(studentId, { total: 0, passed: 0, percentage: 0 });
      }
      const stats = performanceMap.get(studentId)!;
      stats.total++;
      if (record.grade && (record.grade.startsWith('A') || record.grade.startsWith('B') || parseInt(record.grade) >= 60)) {
        stats.passed++;
      }
      stats.percentage = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
    });

    if (allAllocations.length === 0) {
      return NextResponse.json({
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          employee_id: teacher.employee_id,
          department: teacher.department
        },
        academic_year_id: currentAcademicYearId,
        assigned_grade_sections: uniqueGradeSectionCombos,
        students_by_grade_section: [],
        total_students: 0,
        message: 'No students found in assigned grades/sections'
      });
    }

    // Process the query results
    const processedStudents = allAllocations.map((allocation: any) => ({
      id: allocation.id,
      student_id: allocation.student_id,
      grade_level: allocation.grade_level,
      section_name: allocation.section_name,
      section_configuration_id: allocation.section_configuration_id,
      allocation_method: allocation.allocation_method,
      allocation_date: allocation.allocation_date,
      notes: allocation.notes,
      student: allocation.student
    }));

    // Group students by grade/section
    const groupedByGradeSection = new Map<string, any[]>();
    
    processedStudents.forEach((allocation: any) => {
      const key = `${allocation.grade_level}|${allocation.section_name}`;
      if (!groupedByGradeSection.has(key)) {
        groupedByGradeSection.set(key, []);
      }
      groupedByGradeSection.get(key)!.push(allocation);
    });

    const studentsByGradeSection = Array.from(groupedByGradeSection.entries()).map(([key, allocations]) => {
      const [gradeLevel, sectionName] = key.split('|');
      return {
        grade_level: gradeLevel,
        section_name: sectionName,
        students: allocations.map((allocation: any) => {
          const attendanceStats = attendanceMap.get(allocation.student_id) || { total: 0, present: 0, percentage: 0 };
          const performanceStats = performanceMap.get(allocation.student_id) || { total: 0, passed: 0, percentage: 0 };
          return {
            id: allocation.student.id,
            student_id: allocation.student_id,
            full_name: allocation.student.full_name,
            admission_number: allocation.student.admission_number,
            gender: allocation.student.gender,
            grade_level: allocation.student.grade_level,
            section: allocation.student.section,
            parent_id: allocation.student.parent_id,
            allocation_date: allocation.allocation_date,
            allocation_method: allocation.allocation_method,
            notes: allocation.notes,
            attendance: {
              total_classes: attendanceStats.total,
              present_classes: attendanceStats.present,
              attendance_percentage: attendanceStats.percentage
            },
            performance: {
              total_assignments: performanceStats.total,
              passed_assignments: performanceStats.passed,
              performance_percentage: performanceStats.percentage
            }
          };
        })
      };
    });

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department
      },
      academic_year_id: currentAcademicYearId,
      assigned_grade_sections: uniqueGradeSectionCombos,
      students_by_grade_section: studentsByGradeSection,
      total_students: processedStudents.length
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/students:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
