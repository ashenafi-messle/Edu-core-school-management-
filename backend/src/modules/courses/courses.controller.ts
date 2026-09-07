import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseEnrollmentDto,
  UpdateCourseEnrollmentDto
} from './courses.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==========================================
  // COURSE CRUD ENDPOINTS
  // ==========================================

  /**
   * Create a new course
   * POST /courses
   */
  @Post()
  create(@Body() body: CreateCourseDto) {
    return this.coursesService.create(body);
  }

  /**
   * Get all courses with optional filters
   * GET /courses?grade_level=10&subject_area=Math&academic_year=2024-2025&status=active
   */
  @Get()
  findAll(@Query('grade_level') gradeLevel?: string, @Query('subject_area') subjectArea?: string, @Query('academic_year') academicYear?: string, @Query('status') status?: string) {
    const filters: any = {};
    if (gradeLevel) filters.grade_level = gradeLevel;
    if (subjectArea) filters.subject_area = subjectArea;
    if (academicYear) filters.academic_year = academicYear;
    if (status) filters.status = status;
    
    return this.coursesService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
  }

  /**
   * Get a specific course by ID
   * GET /courses/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  /**
   * Get course with enrollments
   * GET /courses/:id/enrollments
   */
  @Get(':id/enrollments')
  findOneWithEnrollments(@Param('id') id: string) {
    return this.coursesService.findOneWithEnrollments(id);
  }

  /**
   * Update a course
   * PUT /courses/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    return this.coursesService.update(id, body);
  }

  /**
   * Delete a course
   * DELETE /courses/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }

  /**
   * Archive a course (soft delete)
   * PUT /courses/:id/archive
   */
  @Put(':id/archive')
  archive(@Param('id') id: string) {
    return this.coursesService.archive(id);
  }

  /**
   * Activate a course
   * PUT /courses/:id/activate
   */
  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.coursesService.activate(id);
  }

  /**
   * Get course statistics
   * GET /courses/:id/stats
   */
  @Get(':id/stats')
  getCourseStats(@Param('id') id: string) {
    return this.coursesService.getCourseStats(id);
  }

  // ==========================================
  // COURSE ENROLLMENT ENDPOINTS
  // ==========================================

  /**
   * Enroll a student in a course
   * POST /courses/enrollments
   */
  @Post('enrollments')
  enrollStudent(@Body() body: CreateCourseEnrollmentDto) {
    return this.coursesService.enrollStudent(body);
  }

  /**
   * Get enrollments for a specific course
   * GET /courses/:courseId/enrollments/list
   */
  @Get(':courseId/enrollments/list')
  getEnrollmentsByCourse(@Param('courseId') courseId: string) {
    return this.coursesService.getEnrollmentsByCourse(courseId);
  }

  /**
   * Update an enrollment
   * PUT /courses/enrollments/:enrollmentId
   */
  @Put('enrollments/:enrollmentId')
  updateEnrollment(@Param('enrollmentId') enrollmentId: string, @Body() body: UpdateCourseEnrollmentDto) {
    return this.coursesService.updateEnrollment(enrollmentId, body);
  }

  /**
   * Delete an enrollment
   * DELETE /courses/enrollments/:enrollmentId
   */
  @Delete('enrollments/:enrollmentId')
  deleteEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.coursesService.deleteEnrollment(enrollmentId);
  }
}