import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import { CreateEnhancedExamDto, UpdateEnhancedExamDto, PublishExamDto, CreateExamRegistrationDto, UpdateExamRegistrationDto, BulkRegisterStudentsDto, MarkAttendanceDto, CreateEnhancedExamGradeDto, UpdateEnhancedExamGradeDto, BulkGradeExamDto, ExamQueryDto, CreateExamQuestionDto, UpdateExamQuestionDto, BulkCreateExamQuestionsDto, CreateStudentExamAnswerDto, UpdateStudentExamAnswerDto, SubmitExamAnswersDto } from './exams.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new enhanced exam
   */
  async createEnhancedExam(examData: CreateEnhancedExamDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();
    const payload = {
      ...examData,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('enhanced_exams')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create exam: ${error.message}`);
    }

    return data;
  }

  /**
   * List enhanced exams with filters (Tenant bounded)
   */
  async findAllEnhancedExams(query: ExamQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('enhanced_exams')
      .select('*, subjects(name), teachers(full_name)')
      .eq('school_id', schoolId);

    // Apply filters
    if (query.grade_level) dbQuery = dbQuery.eq('grade_level', query.grade_level);
    if (query.section_name) dbQuery = dbQuery.eq('section_name', query.section_name);
    if (query.subject_id) dbQuery = dbQuery.eq('subject_id', query.subject_id);
    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);
    if (query.exam_type) dbQuery = dbQuery.eq('exam_type', query.exam_type);
    if (query.status) dbQuery = dbQuery.eq('status', query.status);
    if (query.is_published !== undefined) dbQuery = dbQuery.eq('is_published', query.is_published);
    if (query.start_date) dbQuery = dbQuery.gte('exam_date', query.start_date);
    if (query.end_date) dbQuery = dbQuery.lte('exam_date', query.end_date);

    const { data, error } = await dbQuery.order('exam_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve exams: ${error.message}`);
    }

    return data;
  }

  /**
   * Find single enhanced exam details
   */
  async findOneEnhancedExam(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exams')
      .select('*, subjects(name), teachers(full_name)')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve exam: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam with ID '${id}' does not exist under your school roster.`);
    }

    return data;
  }

  /**
   * Update enhanced exam details
   */
  async updateEnhancedExam(id: string, examData: UpdateEnhancedExamDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exams')
      .update(examData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update exam: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam with ID '${id}' does not exist under your school roster.`);
    }

    return data;
  }

  /**
   * Delete an enhanced exam
   */
  async deleteEnhancedExam(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exams')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to delete exam: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam with ID '${id}' does not exist under your school roster.`);
    }

    return { message: 'Exam deleted successfully' };
  }

  /**
   * Publish/unpublish an exam
   */
  async publishExam(id: string, body: PublishExamDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const updateData: any = {
      is_published: body.is_published,
    };

    if (body.is_published) {
      updateData.published_at = new Date().toISOString();
      updateData.status = 'published';
    }

    const { data, error } = await client
      .from('enhanced_exams')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to publish exam: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam with ID '${id}' does not exist under your school roster.`);
    }

    return data;
  }

  /**
   * Register a student for an exam
   */
  async createExamRegistration(examId: string, body: CreateExamRegistrationDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify exam exists
    const { data: exam } = await client
      .from('enhanced_exams')
      .select('id')
      .eq('id', examId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!exam) {
      throw new NotFoundException(`Exam with ID '${examId}' does not exist.`);
    }

    // Check if already registered
    const { data: existing } = await client
      .from('exam_registrations')
      .select('id')
      .eq('exam_id', examId)
      .eq('student_id', body.student_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Student is already registered for this exam.');
    }

    const payload = {
      ...body,
      exam_id: examId,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('exam_registrations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create registration: ${error.message}`);
    }

    return data;
  }

  /**
   * Bulk register students for an exam
   */
  async bulkRegisterStudents(examId: string, body: BulkRegisterStudentsDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Call the database function to register students
    const { data, error } = await client.rpc('register_students_for_exam', {
      exam_id: examId,
      grade_level: body.grade_level,
      section_name: body.section_name || null,
    });

    if (error) {
      throw new BadRequestException(`Failed to bulk register students: ${error.message}`);
    }

    return { message: `Registered ${data} students for the exam` };
  }

  /**
   * List registrations for an exam
   */
  async findRegistrationsForExam(examId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('exam_registrations')
      .select('*, students(full_name, admission_number, grade_level, section)')
      .eq('exam_id', examId)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve registrations: ${error.message}`);
    }

    return data;
  }

  /**
   * Update exam registration
   */
  async updateExamRegistration(registrationId: string, body: UpdateExamRegistrationDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('exam_registrations')
      .update(body)
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update registration: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Registration with ID '${registrationId}' does not exist.`);
    }

    return data;
  }

  /**
   * Mark attendance for exam
   */
  async markAttendance(examId: string, body: MarkAttendanceDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const updateData: any = {
      attendance_status: body.attendance_status,
      attendance_marked_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('exam_registrations')
      .update(updateData)
      .eq('exam_id', examId)
      .eq('student_id', body.student_id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to mark attendance: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Registration not found for student in this exam.`);
    }

    return data;
  }

  /**
   * Create an enhanced grade for a student
   */
  async createEnhancedGrade(examId: string, gradeData: CreateEnhancedExamGradeDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify student hasn't already been graded for this exam
    const { data: existing } = await client
      .from('enhanced_exam_grades')
      .select('id')
      .eq('exam_id', examId)
      .eq('student_id', gradeData.student_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Student has already been graded for this exam. Update the existing grade instead.');
    }

    const payload = {
      ...gradeData,
      exam_id: examId,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create grade: ${error.message}`);
    }

    return data;
  }

  /**
   * Bulk grade students for an exam
   */
  async bulkGradeExam(examId: string, body: BulkGradeExamDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get exam details for max_score
    const { data: exam } = await client
      .from('enhanced_exams')
      .select('max_score')
      .eq('id', examId)
      .eq('school_id', schoolId)
      .single();

    if (!exam) {
      throw new NotFoundException(`Exam with ID '${examId}' does not exist.`);
    }

    const grades = body.grades.map(grade => ({
      exam_id: examId,
      student_id: grade.student_id,
      score: grade.score,
      max_score: exam.max_score,
      teacher_feedback: grade.teacher_feedback,
      school_id: schoolId,
    }));

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .insert(grades)
      .select();

    if (error) {
      throw new BadRequestException(`Failed to bulk grade: ${error.message}`);
    }

    return data;
  }

  /**
   * Find all student grades for a specific exam
   */
  async findGradesForExam(examId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .select('*, students(full_name, admission_number)')
      .eq('exam_id', examId)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve exam grades: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an enhanced grade
   */
  async updateEnhancedGrade(gradeId: string, gradeData: UpdateEnhancedExamGradeDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .update(gradeData)
      .eq('id', gradeId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update grade: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Grade with ID '${gradeId}' does not exist.`);
    }

    return data;
  }

  /**
   * Verify a grade
   */
  async verifyGrade(gradeId: string, body: { verified_by: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .update({
        is_verified: true,
        verified_by: body.verified_by,
        verified_at: new Date().toISOString(),
      })
      .eq('id', gradeId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to verify grade: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Grade with ID '${gradeId}' does not exist.`);
    }

    return data;
  }

  /**
   * Moderate a grade
   */
  async moderateGrade(gradeId: string, body: { moderated_by: string; moderation_notes?: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('enhanced_exam_grades')
      .update({
        is_moderated: true,
        moderated_by: body.moderated_by,
        moderated_at: new Date().toISOString(),
        moderation_notes: body.moderation_notes,
      })
      .eq('id', gradeId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to moderate grade: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Grade with ID '${gradeId}' does not exist.`);
    }

    return data;
  }

  /**
   * Get class performance summary for an exam
   */
  async getClassPerformance(examId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('class_performance_summary')
      .select('*')
      .eq('exam_id', examId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve class performance: ${error.message}`);
    }

    return data;
  }

  /**
   * Recalculate class performance summary
   */
  async recalculateClassPerformance(examId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Call the database function to update class performance
    const { data, error } = await client.rpc('update_class_performance_summary', {
      exam_id_param: examId,
    });

    if (error) {
      throw new BadRequestException(`Failed to recalculate class performance: ${error.message}`);
    }

    return { message: 'Class performance recalculated successfully' };
  }

  /**
   * Create an exam question
   */
  async createExamQuestion(examId: string, questionData: CreateExamQuestionDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify exam exists
    const { data: exam } = await client
      .from('enhanced_exams')
      .select('id')
      .eq('id', examId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!exam) {
      throw new NotFoundException(`Exam with ID '${examId}' does not exist.`);
    }

    const payload = {
      ...questionData,
      exam_id: examId,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('exam_questions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create exam question: ${error.message}`);
    }

    return data;
  }

  /**
   * Bulk create exam questions
   */
  async bulkCreateExamQuestions(examId: string, body: BulkCreateExamQuestionsDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify exam exists
    const { data: exam } = await client
      .from('enhanced_exams')
      .select('id')
      .eq('id', examId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!exam) {
      throw new NotFoundException(`Exam with ID '${examId}' does not exist.`);
    }

    const questions = body.questions.map(question => ({
      ...question,
      exam_id: examId,
      school_id: schoolId,
    }));

    const { data, error } = await client
      .from('exam_questions')
      .insert(questions)
      .select();

    if (error) {
      throw new BadRequestException(`Failed to bulk create exam questions: ${error.message}`);
    }

    return data;
  }

  /**
   * Get questions for an exam
   */
  async getExamQuestions(examId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .eq('school_id', schoolId)
      .order('question_number', { ascending: true });

    if (error) {
      throw new BadRequestException(`Failed to retrieve exam questions: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an exam question
   */
  async updateExamQuestion(questionId: string, questionData: UpdateExamQuestionDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('exam_questions')
      .update(questionData)
      .eq('id', questionId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update exam question: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam question with ID '${questionId}' does not exist.`);
    }

    return data;
  }

  /**
   * Delete an exam question
   */
  async deleteExamQuestion(questionId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('exam_questions')
      .delete()
      .eq('id', questionId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to delete exam question: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Exam question with ID '${questionId}' does not exist.`);
    }

    return { message: 'Exam question deleted successfully' };
  }

  /**
   * Create student exam answer
   */
  async createStudentExamAnswer(examId: string, answerData: CreateStudentExamAnswerDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify student hasn't already answered this question
    const { data: existing } = await client
      .from('student_exam_answers')
      .select('id')
      .eq('question_id', answerData.question_id)
      .eq('student_id', answerData.student_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Student has already answered this question. Update the existing answer instead.');
    }

    const payload = {
      ...answerData,
      exam_id: examId,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('student_exam_answers')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create student exam answer: ${error.message}`);
    }

    return data;
  }

  /**
   * Submit all answers for an exam
   */
  async submitExamAnswers(examId: string, body: SubmitExamAnswersDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const results = [];

    for (const answer of body.answers) {
      // Check if answer already exists
      const { data: existing } = await client
        .from('student_exam_answers')
        .select('id')
        .eq('question_id', answer.question_id)
        .eq('student_id', body.student_id)
        .maybeSingle();

      const payload = {
        ...answer,
        exam_id: examId,
        student_id: body.student_id,
        school_id: schoolId,
      };

      let result;
      if (existing) {
        // Update existing answer
        const { data, error } = await client
          .from('student_exam_answers')
          .update({
            answer_text: answer.answer_text,
            selected_choices: answer.selected_choices || [],
            answer_places_filled: answer.answer_places_filled || {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          throw new BadRequestException(`Failed to update answer: ${error.message}`);
        }
        result = data;
      } else {
        // Create new answer
        const { data, error } = await client
          .from('student_exam_answers')
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw new BadRequestException(`Failed to create answer: ${error.message}`);
        }
        result = data;
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Get student answers for an exam
   */
  async getStudentExamAnswers(examId: string, studentId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('student_exam_answers')
      .select('*, exam_questions(question_text, question_type, choices, answer_places, points)')
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve student exam answers: ${error.message}`);
    }

    return data;
  }

  /**
   * Update student exam answer
   */
  async updateStudentExamAnswer(answerId: string, answerData: UpdateStudentExamAnswerDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('student_exam_answers')
      .update(answerData)
      .eq('id', answerId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update student exam answer: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Student exam answer with ID '${answerId}' does not exist.`);
    }

    return data;
  }

  /**
   * Auto-grade student answers for an exam
   */
  async autoGradeStudentAnswers(examId: string, studentId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get all student answers for this exam
    const { data: answers, error: answersError } = await client
      .from('student_exam_answers')
      .select('*, exam_questions(question_type, correct_answer, points)')
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (answersError) {
      throw new BadRequestException(`Failed to retrieve student answers: ${answersError.message}`);
    }

    const gradedAnswers = [];

    for (const answer of answers || []) {
      const question = answer.exam_questions;
      let isCorrect = false;
      let pointsEarned = 0;

      // Auto-grade based on question type
      if (question.question_type === 'choice' || question.question_type === 'true_false') {
        // Compare selected choices with correct answer
        const selected = answer.selected_choices || [];
        const correct = question.correct_answer || [];

        if (JSON.stringify(selected.sort()) === JSON.stringify(correct.sort())) {
          isCorrect = true;
          pointsEarned = question.points;
        }
      }

      // Update the answer with grading results
      const { data: updated, error: updateError } = await client
        .from('student_exam_answers')
        .update({
          is_correct: isCorrect,
          points_earned: pointsEarned,
          auto_graded: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', answer.id)
        .select()
        .single();

      if (updateError) {
        throw new BadRequestException(`Failed to update answer grading: ${updateError.message}`);
      }

      gradedAnswers.push(updated);
    }

    // Calculate total score
    const totalScore = gradedAnswers.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0);

    return {
      graded_answers: gradedAnswers,
      total_score: totalScore,
    };
  }
}
