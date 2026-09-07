import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PATCH /api/teachers/[id]/curriculum/lesson-plans/[planId] - Update a lesson plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id: teacherId, planId } = await params;
    const schoolId = getSchoolId(request);
    const body = await request.json();

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

    // Verify lesson plan exists and belongs to the teacher
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('lesson_plans')
      .select('*')
      .eq('id', planId)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (planError || !existingPlan) {
      return NextResponse.json(
        { error: 'Lesson plan not found' },
        { status: 404 }
      );
    }

    // Update lesson plan
    const { data: updatedPlan, error: updateError } = await supabaseAdmin
      .from('lesson_plans')
      .update({
        ...body,
        updated_by: teacher.user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update lesson plan: ${updateError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        lesson_plan_id: updatedPlan.id,
        user_id: teacher.user_id,
        action: 'edited',
        metadata: {
          title: updatedPlan.title,
          changes: Object.keys(body)
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Lesson plan updated successfully',
      lesson_plan: updatedPlan
    });

  } catch (error) {
    console.error('Error in PATCH /api/teachers/[id]/curriculum/lesson-plans/[planId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id]/curriculum/lesson-plans/[planId] - Delete a lesson plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id: teacherId, planId } = await params;
    const schoolId = getSchoolId(request);

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

    // Verify lesson plan exists and belongs to the teacher
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('lesson_plans')
      .select('*')
      .eq('id', planId)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (planError || !existingPlan) {
      return NextResponse.json(
        { error: 'Lesson plan not found' },
        { status: 404 }
      );
    }

    // Delete lesson plan
    const { error: deleteError } = await supabaseAdmin
      .from('lesson_plans')
      .delete()
      .eq('id', planId);

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete lesson plan: ${deleteError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        lesson_plan_id: planId,
        user_id: teacher.user_id,
        action: 'deleted',
        metadata: {
          title: existingPlan.title,
          lesson_date: existingPlan.lesson_date
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Lesson plan deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/teachers/[id]/curriculum/lesson-plans/[planId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
