/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Course Management
 * Defines data transfer objects for course-related operations
 */

// Base Course DTO
export interface CreateCourseDto {
  course_code: string;
  course_name: string;
  description?: string;
  grade_level: string;
  subject_area?: string;
  credits?: number;
  teacher_id?: string;
  academic_year: string;
  semester?: string;
  status?: 'active' | 'inactive' | 'archived';
  max_capacity?: number;
  schedule?: Record<string, any>;
}

export interface UpdateCourseDto {
  course_code?: string;
  course_name?: string;
  description?: string;
  grade_level?: string;
  subject_area?: string;
  credits?: number;
  teacher_id?: string;
  academic_year?: string;
  semester?: string;
  status?: 'active' | 'inactive' | 'archived';
  max_capacity?: number;
  current_enrollment?: number;
  schedule?: Record<string, any>;
}

// Course Enrollment DTOs
export interface CreateCourseEnrollmentDto {
  course_id: string;
  student_id: string;
  status?: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
}

export interface UpdateCourseEnrollmentDto {
  status?: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
}

// Combined Course DTO (for UI)
export interface CourseDto {
  id: string;
  school_id: string;
  course_code: string;
  course_name: string;
  description?: string;
  grade_level: string;
  subject_area?: string;
  credits: number;
  teacher_id?: string;
  teacher_name?: string;
  academic_year: string;
  semester?: string;
  status: 'active' | 'inactive' | 'archived';
  max_capacity: number;
  current_enrollment: number;
  schedule?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollmentDto {
  id: string;
  school_id: string;
  course_id: string;
  student_id: string;
  student_name?: string;
  course_name?: string;
  enrollment_date: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// Course with Enrollments DTO
export interface CourseWithEnrollmentsDto extends CourseDto {
  enrollments?: CourseEnrollmentDto[];
}