import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/metrics/aggregate - Get aggregate metrics for all teachers
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2026-2027';

    // If no school ID is provided, return default values
    if (!schoolId) {
      console.warn('No school ID provided for aggregate metrics, returning default values');
      return NextResponse.json({
        facultyCount: 0,
        averageEvaluationRating: '0.0',
        syllabusCompletionRate: '0.0',
        academicYear
      });
    }

    // Get total faculty count (active teachers)
    const { data: teachers, error: teachersError } = await supabaseAdmin
      .from('teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('status', 'Active');

    if (teachersError) {
      console.error('Failed to fetch teachers:', teachersError);
      return NextResponse.json(
        { error: `Failed to fetch teachers: ${teachersError.message}` },
        { status: 400 }
      );
    }

    const facultyCount = teachers?.length || 0;

    // Get performance metrics for all teachers
    const { data: metrics, error: metricsError } = await supabaseAdmin
      .from('teacher_performance_metrics')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year', academicYear);

    if (metricsError) {
      console.error('Failed to fetch performance metrics:', metricsError);
      // If performance metrics table doesn't exist or has no data, return teacher count with default metrics
      return NextResponse.json({
        facultyCount,
        averageEvaluationRating: '0.0',
        syllabusCompletionRate: '0.0',
        academicYear
      });
    }

    // Calculate average evaluation rating (average of student and parent ratings)
    let totalRating = 0;
    let ratingCount = 0;

    // Calculate syllabus completion rate
    let totalSyllabusCompletion = 0;
    let syllabusCount = 0;

    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        // Average of student and parent ratings (convert to 0-100 scale)
        const studentRating = metric.student_rating || 0;
        const parentRating = metric.parent_rating || 0;
        const avgRating = (studentRating + parentRating) / 2;
        
        totalRating += avgRating;
        ratingCount++;

        // Syllabus completion
        if (metric.syllabus_completion_rate !== null && metric.syllabus_completion_rate !== undefined) {
          totalSyllabusCompletion += metric.syllabus_completion_rate;
          syllabusCount++;
        }
      });
    }

    const averageEvaluationRating = ratingCount > 0 ? (totalRating / ratingCount) : 0;
    const syllabusCompletionRate = syllabusCount > 0 ? (totalSyllabusCompletion / syllabusCount) : 0;

    return NextResponse.json({
      facultyCount,
      averageEvaluationRating: averageEvaluationRating.toFixed(1),
      syllabusCompletionRate: syllabusCompletionRate.toFixed(1),
      academicYear
    });
  } catch (error) {
    console.error('Error in aggregate metrics API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
