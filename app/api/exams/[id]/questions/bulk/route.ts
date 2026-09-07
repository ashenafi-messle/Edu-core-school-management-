import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    const schoolId = requireSchoolId(request);
    const { id: examId } = await params;
    const body = await request.json();
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required.' }, { status: 400 });
    }

    const { data: exam } = await supabaseAdmin
      .from('enhanced_exams')
      .select('id')
      .eq('id', examId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!exam) return NextResponse.json({ error: 'Exam not found.' }, { status: 404 });

    const payload = questions.map((question: any, index: number) => ({
      school_id: schoolId,
      exam_id: examId,
      question_number: index + 1,
      question_text: question.question_text,
      question_type: question.question_type,
      points: question.points,
      is_required: question.is_required,
      explanation: question.explanation,
      choices: question.choices || [],
      correct_answer: question.correct_answer,
      answer_places: question.answer_places || [],
      expected_answer: question.expected_answer,
      question_image_url: question.question_image_url,
      attachments: question.attachments || [],
    }));

    const { data, error } = await supabaseAdmin
      .from('exam_questions')
      .insert(payload)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
