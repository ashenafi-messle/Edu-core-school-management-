import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateEnhancedExamDto, UpdateEnhancedExamDto, PublishExamDto, CreateExamRegistrationDto, UpdateExamRegistrationDto, BulkRegisterStudentsDto, MarkAttendanceDto, CreateEnhancedExamGradeDto, UpdateEnhancedExamGradeDto, BulkGradeExamDto, ExamQueryDto, CreateExamQuestionDto, UpdateExamQuestionDto, BulkCreateExamQuestionsDto, CreateStudentExamAnswerDto, UpdateStudentExamAnswerDto, SubmitExamAnswersDto } from './exams.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  /**
   * Create a new enhanced exam
   * POST /exams
   */
  @Post()
  createExam(@Body() body: CreateEnhancedExamDto) {
    return this.examsService.createEnhancedExam(body);
  }

  /**
   * List exams with filters (Tenant bounded)
   * GET /exams
   */
  @Get()
  findAllExams(@Query() query: ExamQueryDto) {
    return this.examsService.findAllEnhancedExams(query);
  }

  /**
   * Get single exam details
   * GET /exams/:id
   */
  @Get(':id')
  findOneExam(@Param('id') id: string) {
    return this.examsService.findOneEnhancedExam(id);
  }

  /**
   * Update exam details
   * PUT /exams/:id
   */
  @Put(':id')
  updateExam(@Param('id') id: string, @Body() body: UpdateEnhancedExamDto) {
    return this.examsService.updateEnhancedExam(id, body);
  }

  /**
   * Delete an exam
   * DELETE /exams/:id
   */
  @Delete(':id')
  deleteExam(@Param('id') id: string) {
    return this.examsService.deleteEnhancedExam(id);
  }

  /**
   * Publish/unpublish an exam
   * POST /exams/:id/publish
   */
  @Post(':id/publish')
  publishExam(@Param('id') id: string, @Body() body: PublishExamDto) {
    return this.examsService.publishExam(id, body);
  }

  /**
   * Register a student for an exam
   * POST /exams/:id/registrations
   */
  @Post(':id/registrations')
  createRegistration(@Param('id') examId: string, @Body() body: CreateExamRegistrationDto) {
    return this.examsService.createExamRegistration(examId, body);
  }

  /**
   * Bulk register students for an exam
   * POST /exams/:id/registrations/bulk
   */
  @Post(':id/registrations/bulk')
  bulkRegisterStudents(@Param('id') examId: string, @Body() body: BulkRegisterStudentsDto) {
    return this.examsService.bulkRegisterStudents(examId, body);
  }

  /**
   * List registrations for an exam
   * GET /exams/:id/registrations
   */
  @Get(':id/registrations')
  findRegistrationsForExam(@Param('id') examId: string) {
    return this.examsService.findRegistrationsForExam(examId);
  }

  /**
   * Update exam registration
   * PUT /exams/:id/registrations/:registrationId
   */
  @Put(':id/registrations/:registrationId')
  updateRegistration(@Param('id') examId: string, @Param('registrationId') registrationId: string, @Body() body: UpdateExamRegistrationDto) {
    return this.examsService.updateExamRegistration(registrationId, body);
  }

  /**
   * Mark attendance for exam
   * POST /exams/:id/attendance
   */
  @Post(':id/attendance')
  markAttendance(@Param('id') examId: string, @Body() body: MarkAttendanceDto) {
    return this.examsService.markAttendance(examId, body);
  }

  /**
   * Create a grade for a student
   * POST /exams/:id/grades
   */
  @Post(':id/grades')
  createGrade(@Param('id') examId: string, @Body() body: CreateEnhancedExamGradeDto) {
    return this.examsService.createEnhancedGrade(examId, body);
  }

  /**
   * Bulk grade students for an exam
   * POST /exams/:id/grades/bulk
   */
  @Post(':id/grades/bulk')
  bulkGradeExam(@Param('id') examId: string, @Body() body: BulkGradeExamDto) {
    return this.examsService.bulkGradeExam(examId, body);
  }

  /**
   * List grades for an exam
   * GET /exams/:id/grades
   */
  @Get(':id/grades')
  findGradesForExam(@Param('id') examId: string) {
    return this.examsService.findGradesForExam(examId);
  }

  /**
   * Update a grade
   * PUT /exams/:id/grades/:gradeId
   */
  @Put(':id/grades/:gradeId')
  updateGrade(@Param('id') examId: string, @Param('gradeId') gradeId: string, @Body() body: UpdateEnhancedExamGradeDto) {
    return this.examsService.updateEnhancedGrade(gradeId, body);
  }

  /**
   * Verify a grade
   * POST /exams/:id/grades/:gradeId/verify
   */
  @Post(':id/grades/:gradeId/verify')
  verifyGrade(@Param('id') examId: string, @Param('gradeId') gradeId: string, @Body() body: { verified_by: string }) {
    return this.examsService.verifyGrade(gradeId, body);
  }

  /**
   * Moderate a grade
   * POST /exams/:id/grades/:gradeId/moderate
   */
  @Post(':id/grades/:gradeId/moderate')
  moderateGrade(@Param('id') examId: string, @Param('gradeId') gradeId: string, @Body() body: { moderated_by: string; moderation_notes?: string }) {
    return this.examsService.moderateGrade(gradeId, body);
  }

  /**
   * Get class performance summary for an exam
   * GET /exams/:id/performance
   */
  @Get(':id/performance')
  getClassPerformance(@Param('id') examId: string) {
    return this.examsService.getClassPerformance(examId);
  }

  /**
   * Update class performance summary
   * POST /exams/:id/performance/recalculate
   */
  @Post(':id/performance/recalculate')
  recalculateClassPerformance(@Param('id') examId: string) {
    return this.examsService.recalculateClassPerformance(examId);
  }

  /**
   * Create an exam question
   * POST /exams/:id/questions
   */
  @Post(':id/questions')
  createExamQuestion(@Param('id') examId: string, @Body() body: CreateExamQuestionDto) {
    return this.examsService.createExamQuestion(examId, body);
  }

  /**
   * Bulk create exam questions
   * POST /exams/:id/questions/bulk
   */
  @Post(':id/questions/bulk')
  bulkCreateExamQuestions(@Param('id') examId: string, @Body() body: BulkCreateExamQuestionsDto) {
    return this.examsService.bulkCreateExamQuestions(examId, body);
  }

  /**
   * Get questions for an exam
   * GET /exams/:id/questions
   */
  @Get(':id/questions')
  getExamQuestions(@Param('id') examId: string) {
    return this.examsService.getExamQuestions(examId);
  }

  /**
   * Update an exam question
   * PUT /exams/:id/questions/:questionId
   */
  @Put(':id/questions/:questionId')
  updateExamQuestion(@Param('id') examId: string, @Param('questionId') questionId: string, @Body() body: UpdateExamQuestionDto) {
    return this.examsService.updateExamQuestion(questionId, body);
  }

  /**
   * Delete an exam question
   * DELETE /exams/:id/questions/:questionId
   */
  @Delete(':id/questions/:questionId')
  deleteExamQuestion(@Param('id') examId: string, @Param('questionId') questionId: string) {
    return this.examsService.deleteExamQuestion(questionId);
  }

  /**
   * Create student exam answer
   * POST /exams/:id/answers
   */
  @Post(':id/answers')
  createStudentExamAnswer(@Param('id') examId: string, @Body() body: CreateStudentExamAnswerDto) {
    return this.examsService.createStudentExamAnswer(examId, body);
  }

  /**
   * Submit all answers for an exam
   * POST /exams/:id/answers/submit
   */
  @Post(':id/answers/submit')
  submitExamAnswers(@Param('id') examId: string, @Body() body: SubmitExamAnswersDto) {
    return this.examsService.submitExamAnswers(examId, body);
  }

  /**
   * Get student answers for an exam
   * GET /exams/:id/answers/:studentId
   */
  @Get(':id/answers/:studentId')
  getStudentExamAnswers(@Param('id') examId: string, @Param('studentId') studentId: string) {
    return this.examsService.getStudentExamAnswers(examId, studentId);
  }

  /**
   * Update student exam answer
   * PUT /exams/:id/answers/:answerId
   */
  @Put(':id/answers/:answerId')
  updateStudentExamAnswer(@Param('id') examId: string, @Param('answerId') answerId: string, @Body() body: UpdateStudentExamAnswerDto) {
    return this.examsService.updateStudentExamAnswer(answerId, body);
  }

  /**
   * Auto-grade student answers for an exam
   * POST /exams/:id/answers/:studentId/auto-grade
   */
  @Post(':id/answers/:studentId/auto-grade')
  autoGradeStudentAnswers(@Param('id') examId: string, @Param('studentId') studentId: string) {
    return this.examsService.autoGradeStudentAnswers(examId, studentId);
  }
}
