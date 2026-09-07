import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  CreatePerformanceMetricsDto,
  UpdatePerformanceMetricsDto,
  CreateEvaluationDto,
  UpdateEvaluationDto,
  CreateClassAssignmentDto,
  UpdateClassAssignmentDto
} from './teachers.dto';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ==========================================
  // BASIC TEACHER CRUD ENDPOINTS
  // ==========================================

  /**
   * Register a teacher
   * POST /teachers
   */
  @Post()
  create(@Body() body: CreateTeacherDto) {
    return this.teachersService.create(body);
  }

  /**
   * List school teachers
   * GET /teachers
   */
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  /**
   * Get specific teacher details
   * GET /teachers/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  /**
   * Get complete teacher profile with all related data
   * GET /teachers/:id/profile
   */
  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.teachersService.getTeacherProfile(id);
  }

  /**
   * Update teacher record
   * PUT /teachers/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateTeacherDto) {
    return this.teachersService.update(id, body);
  }

  /**
   * Delete teacher from registry
   * DELETE /teachers/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teachersService.delete(id);
  }

  /**
   * Deactivate teacher (soft delete)
   * PUT /teachers/:id/deactivate
   */
  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.teachersService.deactivate(id);
  }

  /**
   * Activate teacher
   * PUT /teachers/:id/activate
   */
  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.teachersService.activate(id);
  }

  // ==========================================
  // PERFORMANCE METRICS ENDPOINTS
  // ==========================================

  /**
   * Create performance metrics for a teacher
   * POST /teachers/:id/performance-metrics
   */
  @Post(':id/performance-metrics')
  createPerformanceMetrics(@Param('id') id: string, @Body() body: CreatePerformanceMetricsDto) {
    return this.teachersService.createPerformanceMetrics({ ...body, teacher_id: id });
  }

  /**
   * Get performance metrics for a teacher
   * GET /teachers/:id/performance-metrics
   */
  @Get(':id/performance-metrics')
  getPerformanceMetrics(@Param('id') id: string, @Query('academicYear') academicYear?: string) {
    return this.teachersService.getPerformanceMetrics(id, academicYear);
  }

  /**
   * Update performance metrics
   * PUT /teachers/performance-metrics/:id
   */
  @Put('performance-metrics/:id')
  updatePerformanceMetrics(@Param('id') id: string, @Body() body: UpdatePerformanceMetricsDto) {
    return this.teachersService.updatePerformanceMetrics(id, body);
  }

  // ==========================================
  // EVALUATIONS ENDPOINTS
  // ==========================================

  /**
   * Create teacher evaluation
   * POST /teachers/:id/evaluations
   */
  @Post(':id/evaluations')
  createEvaluation(@Param('id') id: string, @Body() body: CreateEvaluationDto) {
    return this.teachersService.createEvaluation({ ...body, teacher_id: id });
  }

  /**
   * Get evaluations for a teacher
   * GET /teachers/:id/evaluations
   */
  @Get(':id/evaluations')
  getEvaluations(
    @Param('id') id: string,
    @Query('type') type?: string
  ) {
    return this.teachersService.getEvaluations(id, type);
  }

  /**
   * Update evaluation
   * PUT /teachers/evaluations/:id
   */
  @Put('evaluations/:id')
  updateEvaluation(@Param('id') id: string, @Body() body: UpdateEvaluationDto) {
    return this.teachersService.updateEvaluation(id, body);
  }

  /**
   * Delete evaluation
   * DELETE /teachers/evaluations/:id
   */
  @Delete('evaluations/:id')
  deleteEvaluation(@Param('id') id: string) {
    return this.teachersService.deleteEvaluation(id);
  }

  // ==========================================
  // CLASS ASSIGNMENTS ENDPOINTS
  // ==========================================

  /**
   * Create class assignment for teacher
   * POST /teachers/:id/class-assignments
   */
  @Post(':id/class-assignments')
  createClassAssignment(@Param('id') id: string, @Body() body: CreateClassAssignmentDto) {
    return this.teachersService.createClassAssignment({ ...body, teacher_id: id });
  }

  /**
   * Get class assignments for a teacher
   * GET /teachers/:id/class-assignments
   */
  @Get(':id/class-assignments')
  getClassAssignments(
    @Param('id') id: string,
    @Query('isActive') isActive?: string
  ) {
    return this.teachersService.getClassAssignments(id, isActive === 'true' ? true : isActive === 'false' ? false : undefined);
  }

  /**
   * Update class assignment
   * PUT /teachers/class-assignments/:id
   */
  @Put('class-assignments/:id')
  updateClassAssignment(@Param('id') id: string, @Body() body: UpdateClassAssignmentDto) {
    return this.teachersService.updateClassAssignment(id, body);
  }

  /**
   * Delete class assignment
   * DELETE /teachers/class-assignments/:id
   */
  @Delete('class-assignments/:id')
  deleteClassAssignment(@Param('id') id: string) {
    return this.teachersService.deleteClassAssignment(id);
  }
}
