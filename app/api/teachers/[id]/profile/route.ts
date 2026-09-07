import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/profile - Get complete teacher profile with all related data
export async function GET(
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

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    // Get teacher basic info
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: `Teacher with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // Get performance metrics
    const { data: performanceMetrics } = await supabaseAdmin
      .from('teacher_performance_metrics')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get evaluations
    const { data: evaluations } = await supabaseAdmin
      .from('teacher_evaluations')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .order('evaluation_date', { ascending: false });

    // Get class assignments
    const { data: classAssignments } = await supabaseAdmin
      .from('teacher_class_assignments')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('assigned_date', { ascending: false });

    const profile = {
      id: teacher.id,
      employee_id: teacher.employee_id,
      full_name: teacher.full_name,
      photo: teacher.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: teacher.phone || '+1 (555) 000-0000',
      email: teacher.email || '',
      department: teacher.department || '',
      subjects: teacher.subjects || [],
      employment_date: teacher.employment_date || teacher.created_at,
      status: teacher.status || 'Active',
      weekly_load: teacher.weekly_load || '0 hrs/wk',
      assigned_grades: teacher.assigned_grades || [],
      assigned_sections: teacher.assigned_sections || [],
      performance_metrics: performanceMetrics || undefined,
      evaluations: evaluations || [],
      class_assignments: classAssignments || []
    };

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
