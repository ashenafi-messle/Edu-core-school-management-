import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/attendance/classes - Get attendance data for teacher's classes
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
    const date = searchParams.get('date');
    const subjectId = searchParams.get('subject_id');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher exists
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

    // Get teacher's subject assignments
    let assignmentsQuery = supabaseAdmin
      .from('subject_assignments')
      .select(`
        *,
        subject:subjects(id, subject_code, subject_name, category)
      `)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .eq('status', 'Active');

    if (subjectId) {
      assignmentsQuery = assignmentsQuery.eq('subject_id', subjectId);
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery;

    if (assignmentsError) {
      console.error('Error fetching subject assignments:', assignmentsError);
      return NextResponse.json(
        { error: `Failed to fetch subject assignments: ${assignmentsError.message}` },
        { status: 400 }
      );
    }

    // For each assignment, get the students and their attendance
    const classAttendanceData = [];

    for (const assignment of assignments || []) {
      // Get students in this grade/section
      const { data: allocations, error: allocationsError } = await supabaseAdmin
        .from('section_allocations')
        .select(`
          *,
          student:students(id, full_name, admission_number, grade_level, section, gender, parent_id)
        `)
        .eq('school_id', schoolId)
        .eq('grade_level', assignment.grade_level)
        .eq('section_name', assignment.section_name);

      if (allocationsError) {
        console.error('Error fetching student allocations:', allocationsError);
        continue;
      }

      if (!allocations || allocations.length === 0) {
        continue;
      }

      const uniqueAllocations = Array.from(
        new Map(allocations.map(allocation => [allocation.student_id, allocation])).values()
      );
      const studentIds = uniqueAllocations.map(a => a.student_id);

      // Get attendance for these students for the specified date
      let attendanceQuery = supabaseAdmin
        .from('attendance')
        .select('*')
        .in('student_id', studentIds)
        .eq('school_id', schoolId);

      if (date) {
        attendanceQuery = attendanceQuery.eq('class_date', date);
      }

      const { data: attendanceRecords, error: attendanceError } = await attendanceQuery;

      if (attendanceError) {
        console.error('Error fetching attendance records:', attendanceError);
      }

      // Map attendance to students
      const studentsWithAttendance = uniqueAllocations.map(allocation => {
        const attendance = attendanceRecords?.find(
          a => a.student_id === allocation.student_id
        );

        return {
          student: allocation.student,
          allocation_id: allocation.id,
          attendance: attendance ? {
            id: attendance.id,
            status: attendance.status,
            class_date: attendance.class_date,
            recorded_at: attendance.created_at
          } : null
        };
      });

      // Calculate attendance summary for this class
      const totalStudents = studentsWithAttendance.length;
      const attendedStudents = studentsWithAttendance.filter(s => 
        s.attendance && s.attendance.status === 'present'
      ).length;
      const attendancePercentage = totalStudents > 0 ? (attendedStudents / totalStudents) * 100 : 0;

      classAttendanceData.push({
        assignment: {
          id: assignment.id,
          subject: assignment.subject,
          grade_level: assignment.grade_level,
          section_name: assignment.section_name,
          role: assignment.role,
          semester: assignment.semester
        },
        students: studentsWithAttendance,
        summary: {
          total_students: totalStudents,
          attended_students: attendedStudents,
          attendance_percentage: Math.round(attendancePercentage * 100) / 100,
          date: date || new Date().toISOString().split('T')[0]
        }
      });
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department
      },
      classes: classAttendanceData,
      total_classes: classAttendanceData.length
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/attendance/classes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
