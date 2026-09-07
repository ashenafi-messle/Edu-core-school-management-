import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/teachers/[id]/attendance/record - Record attendance for a class
export async function POST(
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
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const { 
      subject_id, 
      grade_level, 
      section_name, 
      class_date, 
      attendance_records,
      notes 
    } = body;

    // Validate required fields
    if (!subject_id || !grade_level || !section_name || !class_date || !attendance_records) {
      return NextResponse.json(
        { error: 'Missing required fields: subject_id, grade_level, section_name, class_date, attendance_records' },
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

    // Get the user_id from the teacher record for the taken_by field
    const userId = teacher.user_id;

    // Verify the teacher is assigned to teach this subject/grade/section
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('subject_assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('subject_id', subject_id)
      .eq('grade_level', grade_level)
      .eq('section_name', section_name)
      .eq('status', 'Active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Teacher is not assigned to this subject/grade/section' },
        { status: 403 }
      );
    }

    // Validate attendance records
    if (!Array.isArray(attendance_records) || attendance_records.length === 0) {
      return NextResponse.json(
        { error: 'attendance_records must be a non-empty array' },
        { status: 400 }
      );
    }

    for (const record of attendance_records) {
      if (!record.student_id || !record.status) {
        return NextResponse.json(
          { error: 'Each attendance record must have student_id and status' },
          { status: 400 }
        );
      }

      if (!['present', 'absent', 'late', 'excused'].includes(record.status.toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid status: ${record.status}. Must be present, absent, late, or excused` },
          { status: 400 }
        );
      }
    }

    // Process attendance records - handle both insert and update
    let insertedRecords = [];
    let updatedRecords = [];

    for (const record of attendance_records) {
      // Check if record already exists
      const { data: existingRecord, error: checkError } = await supabaseAdmin
        .from('attendance')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('class_date', class_date)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing record:', checkError);
        continue;
      }

      if (existingRecord) {
        // Update existing record
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('attendance')
          .update({
            status: record.status.toLowerCase(),
            taken_by: userId,
            remarks: notes || null
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating attendance record:', updateError);
        } else {
          updatedRecords.push(updated);
        }
      } else {
        // Insert new record
        try {
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from('attendance')
            .insert({
              id: crypto.randomUUID(),
              school_id: schoolId,
              student_id: record.student_id,
              class_date: class_date,
              status: record.status.toLowerCase(),
              remarks: notes || null,
              taken_by: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting attendance record:', insertError);
            // If it's a duplicate key error, try to update instead
            if (insertError.code === '23505') {
              const { data: updated, error: updateError } = await supabaseAdmin
                .from('attendance')
                .update({
                  status: record.status.toLowerCase(),
                  taken_by: userId,
                  remarks: notes || null
                })
                .eq('student_id', record.student_id)
                .eq('class_date', class_date)
                .select()
                .single();

              if (!updateError) {
                updatedRecords.push(updated);
              }
            }
          } else {
            insertedRecords.push(inserted);
          }
        } catch (error) {
          console.error('Exception inserting attendance record:', error);
        }
      }
    }

    // Create or update attendance summary
    const totalStudents = attendance_records.length;
    const presentCount = attendance_records.filter(r => r.status.toLowerCase() === 'present').length;
    const absentCount = attendance_records.filter(r => r.status.toLowerCase() === 'absent').length;
    const lateCount = attendance_records.filter(r => r.status.toLowerCase() === 'late').length;
    const excusedCount = attendance_records.filter(r => r.status.toLowerCase() === 'excused').length;
    const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    const { data: existingSummary, error: summaryError } = await supabaseAdmin
      .from('attendance_summary')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('subject_id', subject_id)
      .eq('grade_level', grade_level)
      .eq('section_name', section_name)
      .eq('class_date', class_date)
      .single();

    if (existingSummary) {
      // Update existing summary
      await supabaseAdmin
        .from('attendance_summary')
        .update({
          total_students: totalStudents,
          present_count: presentCount,
          absent_count: absentCount,
          late_count: lateCount,
          excused_count: excusedCount,
          attendance_percentage: attendancePercentage,
          recorded_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSummary.id);
    } else {
      // Create new summary
      await supabaseAdmin
        .from('attendance_summary')
        .insert({
          id: crypto.randomUUID(),
          school_id: schoolId,
          teacher_id: teacherId,
          subject_id: subject_id,
          grade_level: grade_level,
          section_name: section_name,
          class_date: class_date,
          total_students: totalStudents,
          present_count: presentCount,
          absent_count: absentCount,
          late_count: lateCount,
          excused_count: excusedCount,
          attendance_percentage: attendancePercentage,
          recorded_by: userId,
          academic_year_id: assignment.academic_year_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      inserted: insertedRecords.length,
      updated: updatedRecords.length,
      total: attendance_records.length,
      summary: {
        total_students: totalStudents,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        excused_count: excusedCount,
        attendance_percentage: Math.round(attendancePercentage * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error in POST /api/teachers/[id]/attendance/record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teachers/[id]/attendance/record - Get attendance recording data for a class
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
    const subjectId = searchParams.get('subject_id');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const classDate = searchParams.get('class_date');

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

    // Get the user_id from the teacher record for the taken_by field
    const userId = teacher.user_id;

    // Build query for attendance records
    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        student:students(id, full_name, admission_number, grade_level, section)
      `)
      .eq('taken_by', userId)
      .eq('school_id', schoolId);

    if (classDate) query = query.eq('class_date', classDate);

    const { data: attendanceRecords, error: attendanceError } = await query.order('class_date', { ascending: false });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return NextResponse.json(
        { error: `Failed to fetch attendance records: ${attendanceError.message}` },
        { status: 400 }
      );
    }

    // Get attendance summaries
    let summaryQuery = supabaseAdmin
      .from('attendance_summary')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId);

    if (subjectId) summaryQuery = summaryQuery.eq('subject_id', subjectId);
    if (gradeLevel) summaryQuery = summaryQuery.eq('grade_level', gradeLevel);
    if (sectionName) summaryQuery = summaryQuery.eq('section_name', sectionName);

    const { data: summaries, error: summaryError } = await summaryQuery.order('class_date', { ascending: false });

    if (summaryError) {
      console.error('Error fetching attendance summaries:', summaryError);
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department
      },
      attendance_records: attendanceRecords || [],
      summaries: summaries || [],
      total_records: attendanceRecords?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/attendance/record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
