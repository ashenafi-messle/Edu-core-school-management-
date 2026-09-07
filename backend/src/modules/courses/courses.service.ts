import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseEnrollmentDto,
  UpdateCourseEnrollmentDto,
  CourseDto,
  CourseEnrollmentDto,
  CourseWithEnrollmentsDto
} from './courses.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new course
   */
  async create(courseData: CreateCourseDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Check for duplicate course code within the same school and academic year
    const { data: existing } = await client
      .from('courses')
      .select('id')
      .eq('school_id', schoolId)
      .eq('course_code', courseData.course_code)
      .eq('academic_year', courseData.academic_year)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Course with code '${courseData.course_code}' already exists for academic year '${courseData.academic_year}'.`);
    }

    // Verify teacher exists if provided
    if (courseData.teacher_id) {
      const { data: teacher } = await client
        .from('teachers')
        .select('id')
        .eq('id', courseData.teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!teacher) {
        throw new BadRequestException(`Teacher with ID '${courseData.teacher_id}' not found in this school.`);
      }
    }

    // Set default values
    const courseToCreate = {
      ...courseData,
      school_id: schoolId,
      credits: courseData.credits || 1,
      status: courseData.status || 'active',
      max_capacity: courseData.max_capacity || 30,
      current_enrollment: 0
    };

    const { data, error } = await client
      .from('courses')
      .insert(courseToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create course: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all courses for the school
   */
  async findAll(filters?: {
    grade_level?: string;
    subject_area?: string;
    academic_year?: string;
    status?: string;
  }): Promise<CourseDto[]> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let query = client
      .from('courses')
      .select(`
        *,
        teachers:teacher_id (
          id,
          full_name
        )
      `)
      .eq('school_id', schoolId);

    // Apply filters
    if (filters?.grade_level) {
      query = query.eq('grade_level', filters.grade_level);
    }
    if (filters?.subject_area) {
      query = query.eq('subject_area', filters.subject_area);
    }
    if (filters?.academic_year) {
      query = query.eq('academic_year', filters.academic_year);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('course_code', { ascending: true });

    if (error) {
      throw new BadRequestException(`Failed to retrieve courses: ${error.message}`);
    }

    // Transform data to include teacher name
    return data.map((course: any) => ({
      ...course,
      teacher_name: course.teachers?.full_name || null
    }));
  }

  /**
   * Get a specific course by ID
   */
  async findOne(id: string): Promise<CourseDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('courses')
      .select(`
        *,
        teachers:teacher_id (
          id,
          full_name
        )
      `)
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve course: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Course with ID '${id}' not found.`);
    }

    return {
      ...data,
      teacher_name: data.teachers?.full_name || null
    };
  }

  /**
   * Get course with enrollments
   */
  async findOneWithEnrollments(id: string): Promise<CourseWithEnrollmentsDto> {
    const course = await this.findOne(id);
    const enrollments = await this.getEnrollmentsByCourse(id);

    return {
      ...course,
      enrollments
    };
  }

  /**
   * Update a course
   */
  async update(id: string, updateData: UpdateCourseDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify course exists
    const { data: existing } = await client
      .from('courses')
      .select('id, course_code, academic_year')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Course with ID '${id}' not found.`);
    }

    // Check for duplicate course code if updating course_code or academic_year
    if (updateData.course_code || updateData.academic_year) {
      const newCourseCode = updateData.course_code || existing.course_code;
      const newAcademicYear = updateData.academic_year || existing.academic_year;

      const { data: duplicate } = await client
        .from('courses')
        .select('id')
        .eq('school_id', schoolId)
        .eq('course_code', newCourseCode)
        .eq('academic_year', newAcademicYear)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        throw new BadRequestException(`Course with code '${newCourseCode}' already exists for academic year '${newAcademicYear}'.`);
      }
    }

    // Verify teacher exists if updating teacher_id
    if (updateData.teacher_id) {
      const { data: teacher } = await client
        .from('teachers')
        .select('id')
        .eq('id', updateData.teacher_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!teacher) {
        throw new BadRequestException(`Teacher with ID '${updateData.teacher_id}' not found in this school.`);
      }
    }

    return this.supabaseService.updateTenantRecord('courses', id, updateData);
  }

  /**
   * Delete a course
   */
  async delete(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Check if course has enrollments
    const { data: enrollments } = await client
      .from('course_enrollments')
      .select('id')
      .eq('course_id', id)
      .eq('school_id', schoolId)
      .limit(1);

    if (enrollments && enrollments.length > 0) {
      throw new BadRequestException('Cannot delete course with active enrollments. Please remove enrollments first.');
    }

    return this.supabaseService.deleteTenantRecord('courses', id);
  }

  /**
   * Archive a course (soft delete)
   */
  async archive(id: string) {
    return this.update(id, { status: 'archived' });
  }

  /**
   * Activate a course
   */
  async activate(id: string) {
    return this.update(id, { status: 'active' });
  }

  // ==========================================
  // COURSE ENROLLMENT METHODS
  // ==========================================

  /**
   * Enroll a student in a course
   */
  async enrollStudent(enrollmentData: CreateCourseEnrollmentDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Verify course exists and has capacity
    const { data: course } = await client
      .from('courses')
      .select('id, current_enrollment, max_capacity, status')
      .eq('id', enrollmentData.course_id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!course) {
      throw new NotFoundException(`Course with ID '${enrollmentData.course_id}' not found.`);
    }

    if (course.status !== 'active') {
      throw new BadRequestException('Cannot enroll in an inactive course.');
    }

    if (course.current_enrollment >= course.max_capacity) {
      throw new BadRequestException('Course has reached maximum capacity.');
    }

    // Verify student exists
    const { data: student } = await client
      .from('students')
      .select('id')
      .eq('id', enrollmentData.student_id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!student) {
      throw new BadRequestException(`Student with ID '${enrollmentData.student_id}' not found in this school.`);
    }

    // Check for existing enrollment
    const { data: existing } = await client
      .from('course_enrollments')
      .select('id')
      .eq('course_id', enrollmentData.course_id)
      .eq('student_id', enrollmentData.student_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Student is already enrolled in this course.');
    }

    // Create enrollment
    const enrollmentToCreate = {
      ...enrollmentData,
      school_id: schoolId,
      status: enrollmentData.status || 'enrolled'
    };

    const { data, error } = await client
      .from('course_enrollments')
      .insert(enrollmentToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create enrollment: ${error.message}`);
    }

    // Update course enrollment count
    await client
      .from('courses')
      .update({ current_enrollment: course.current_enrollment + 1 })
      .eq('id', enrollmentData.course_id);

    return data;
  }

  /**
   * Get all enrollments for a course
   */
  async getEnrollmentsByCourse(courseId: string): Promise<CourseEnrollmentDto[]> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('course_enrollments')
      .select(`
        *,
        students:student_id (
          id,
          full_name
        ),
        courses:course_id (
          id,
          course_name
        )
      `)
      .eq('course_id', courseId)
      .eq('school_id', schoolId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve enrollments: ${error.message}`);
    }

    // Transform data to include student and course names
    return data.map((enrollment: any) => ({
      ...enrollment,
      student_name: enrollment.students?.full_name || null,
      course_name: enrollment.courses?.course_name || null
    }));
  }

  /**
   * Get all enrollments for a student
   */
  async getEnrollmentsByStudent(studentId: string): Promise<CourseEnrollmentDto[]> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('course_enrollments')
      .select(`
        *,
        students:student_id (
          id,
          full_name
        ),
        courses:course_id (
          id,
          course_name
        )
      `)
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve enrollments: ${error.message}`);
    }

    return data.map((enrollment: any) => ({
      ...enrollment,
      student_name: enrollment.students?.full_name || null,
      course_name: enrollment.courses?.course_name || null
    }));
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(enrollmentId: string, updateData: UpdateCourseEnrollmentDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify enrollment exists
    const { data: existing } = await client
      .from('course_enrollments')
      .select('id, course_id, status')
      .eq('id', enrollmentId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Enrollment with ID '${enrollmentId}' not found.`);
    }

    // If status is changing to 'dropped', update course enrollment count
    if (updateData.status === 'dropped' && existing.status !== 'dropped') {
      const { data: course } = await client
        .from('courses')
        .select('id, current_enrollment')
        .eq('id', existing.course_id)
        .single();

      if (course && course.current_enrollment > 0) {
        await client
          .from('courses')
          .update({ current_enrollment: course.current_enrollment - 1 })
          .eq('id', existing.course_id);
      }
    }

    const { data, error } = await client
      .from('course_enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update enrollment: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(enrollmentId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get enrollment details before deletion
    const { data: existing } = await client
      .from('course_enrollments')
      .select('id, course_id, status')
      .eq('id', enrollmentId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Enrollment with ID '${enrollmentId}' not found.`);
    }

    // Delete enrollment
    const { error } = await client
      .from('course_enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to delete enrollment: ${error.message}`);
    }

    // Update course enrollment count if student was enrolled
    if (existing.status === 'enrolled') {
      const { data: course } = await client
        .from('courses')
        .select('id, current_enrollment')
        .eq('id', existing.course_id)
        .single();

      if (course && course.current_enrollment > 0) {
        await client
          .from('courses')
          .update({ current_enrollment: course.current_enrollment - 1 })
          .eq('id', existing.course_id);
      }
    }

    return { message: 'Enrollment deleted successfully' };
  }

  /**
   * Get enrollment statistics for a course
   */
  async getCourseStats(courseId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('course_enrollments')
      .select('status, grade')
      .eq('course_id', courseId)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve course statistics: ${error.message}`);
    }

    const stats = {
      total_enrollments: data.length,
      enrolled: data.filter((e: any) => e.status === 'enrolled').length,
      completed: data.filter((e: any) => e.status === 'completed').length,
      dropped: data.filter((e: any) => e.status === 'dropped').length,
      failed: data.filter((e: any) => e.status === 'failed').length,
      average_score: 0
    };

    // Calculate average score for completed courses
    const completedEnrollments = data.filter((e: any) => e.status === 'completed' && e.final_score !== null);
    if (completedEnrollments.length > 0) {
      const totalScore = completedEnrollments.reduce((sum: number, e: any) => sum + (e.final_score || 0), 0);
      stats.average_score = totalScore / completedEnrollments.length;
    }

    return stats;
  }
}