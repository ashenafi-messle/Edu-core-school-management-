/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Teacher Management
 * Defines data transfer objects for teacher-related operations
 */

// Base Teacher DTO
export interface CreateTeacherDto {
  user_id?: string;
  employee_id: string;
  full_name: string;
  department?: string;
  subjects?: string[];
  photo?: string;
  phone?: string;
  email?: string;
  employment_date?: string;
  status?: 'Active' | 'Deactivated';
  weekly_load?: string;
  assigned_grades?: string[];
  assigned_sections?: string[];
}

export interface UpdateTeacherDto {
  full_name?: string;
  department?: string;
  subjects?: string[];
  photo?: string;
  phone?: string;
  email?: string;
  employment_date?: string;
  status?: 'Active' | 'Deactivated';
  weekly_load?: string;
  assigned_grades?: string[];
  assigned_sections?: string[];
}

// Performance Metrics DTOs
export interface CreatePerformanceMetricsDto {
  teacher_id: string;
  academic_year: string;
  semester?: string;
  student_rating?: number;
  parent_rating?: number;
  director_evaluation?: number;
  attendance_present?: number;
  attendance_absent?: number;
  attendance_late?: number;
  attendance_leave?: number;
  assignment_completion_rate?: number;
  syllabus_completion_rate?: number;
}

export interface UpdatePerformanceMetricsDto {
  student_rating?: number;
  parent_rating?: number;
  director_evaluation?: number;
  attendance_present?: number;
  attendance_absent?: number;
  attendance_late?: number;
  attendance_leave?: number;
  assignment_completion_rate?: number;
  syllabus_completion_rate?: number;
}

// Evaluation DTOs
export interface CreateEvaluationDto {
  teacher_id: string;
  evaluation_type: 'Strength' | 'Area for Improvement';
  category: string;
  description: string;
  academic_year: string;
  evaluator_id?: string;
}

export interface UpdateEvaluationDto {
  evaluation_type?: 'Strength' | 'Area for Improvement';
  category?: string;
  description?: string;
}

// Class Assignment DTOs
export interface CreateClassAssignmentDto {
  teacher_id: string;
  grade_level: string;
  section_name: string;
  subject: string;
  role?: 'Class Teacher' | 'Subject Teacher' | 'Homeroom Teacher';
  academic_year: string;
  semester?: string;
}

export interface UpdateClassAssignmentDto {
  grade_level?: string;
  section_name?: string;
  subject?: string;
  role?: 'Class Teacher' | 'Subject Teacher' | 'Homeroom Teacher';
  is_active?: boolean;
}

// Combined Teacher Profile DTO (for UI)
export interface TeacherProfileDto {
  id: string;
  employee_id: string;
  full_name: string;
  photo: string;
  phone: string;
  email: string;
  department: string;
  subjects: string[];
  employment_date: string;
  status: 'Active' | 'Deactivated';
  weekly_load: string;
  assigned_grades: string[];
  assigned_sections: string[];
  performance_metrics?: PerformanceMetricsDto;
  evaluations?: EvaluationDto[];
  class_assignments?: ClassAssignmentDto[];
}

export interface PerformanceMetricsDto {
  id: string;
  teacher_id: string;
  academic_year: string;
  semester: string;
  student_rating: number;
  parent_rating: number;
  director_evaluation: number;
  attendance_present: number;
  attendance_absent: number;
  attendance_late: number;
  attendance_leave: number;
  assignment_completion_rate: number;
  syllabus_completion_rate: number;
}

export interface EvaluationDto {
  id: string;
  teacher_id: string;
  evaluation_type: 'Strength' | 'Area for Improvement';
  category: string;
  description: string;
  evaluator_id?: string;
  evaluation_date: string;
  academic_year: string;
}

export interface ClassAssignmentDto {
  id: string;
  teacher_id: string;
  grade_level: string;
  section_name: string;
  subject: string;
  role: 'Class Teacher' | 'Subject Teacher' | 'Homeroom Teacher';
  academic_year: string;
  semester: string;
  is_active: boolean;
  assigned_date: string;
}
