/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Gradebook Management
 * Defines data transfer objects for gradebook entries, student summaries, and report cards
 */

// ==========================================
// GRADEBOOK ENTRIES DTOs
// ==========================================

export interface CreateGradebookEntryDto {
  student_id: string;
  assessment_type: 'exam' | 'assignment' | 'quiz' | 'project';
  assessment_id: string;
  assessment_title: string;
  subject_id?: string;
  subject_name?: string;
  grade_level: string;
  section_name?: string;
  term?: string;
  academic_year_id?: string;
  score: number;
  max_score: number;
  weight?: number;
  category?: string;
  assessment_date: string;
}

export interface UpdateGradebookEntryDto {
  score?: number;
  max_score?: number;
  weight?: number;
  category?: string;
}

export interface BulkCreateGradebookEntryDto {
  entries: CreateGradebookEntryDto[];
}

export interface GradebookEntryDto {
  id: string;
  school_id: string;
  student_id: string;
  assessment_type: string;
  assessment_id: string;
  assessment_title: string;
  subject_id?: string;
  subject_name?: string;
  grade_level: string;
  section_name?: string;
  term?: string;
  academic_year_id?: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade?: string;
  weight: number;
  category?: string;
  assessment_date: string;
  graded_date: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STUDENT GRADE SUMMARY DTOs
// ==========================================

export interface CreateStudentGradeSummaryDto {
  student_id: string;
  academic_year_id?: string;
  term?: string;
  grade_level: string;
  section_name?: string;
  class_teacher_remarks?: string;
  principal_remarks?: string;
}

export interface UpdateStudentGradeSummaryDto {
  class_teacher_remarks?: string;
  principal_remarks?: string;
}

export interface StudentGradeSummaryDto {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id?: string;
  term?: string;
  grade_level: string;
  section_name?: string;
  total_assessments: number;
  assessments_completed: number;
  overall_average: number;
  overall_gpa: number;
  class_rank?: number;
  total_students_in_class?: number;
  subject_performance: Record<string, any>;
  total_a: number;
  total_b: number;
  total_c: number;
  total_d: number;
  total_f: number;
  attendance_percentage?: number;
  class_teacher_remarks?: string;
  principal_remarks?: string;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// REPORT CARD DTOs
// ==========================================

export interface ReportCardQueryDto {
  student_id?: string;
  grade_level?: string;
  section_name?: string;
  term?: string;
  academic_year_id?: string;
}

export interface ReportCardDto {
  student_id: string;
  student_name: string;
  admission_number: string;
  grade_level: string;
  section_name: string;
  academic_year: string;
  term: string;
  overall_average: number;
  overall_gpa: number;
  class_rank?: number;
  total_students: number;
  subject_performance: Array<{
    subject_name: string;
    average: number;
    grade: string;
    rank?: number;
    assessments: number;
  }>;
  grade_distribution: {
    a: number;
    b: number;
    c: number;
    d: number;
    f: number;
  };
  attendance_percentage?: number;
  class_teacher_remarks?: string;
  principal_remarks?: string;
  generated_at: string;
}

// ==========================================
// QUERY AND FILTER DTOs
// ==========================================

export interface GradebookQueryDto {
  student_id?: string;
  grade_level?: string;
  section_name?: string;
  subject_id?: string;
  term?: string;
  academic_year_id?: string;
  assessment_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface ClassGradebookQueryDto {
  grade_level: string;
  section_name?: string;
  subject_id?: string;
  term?: string;
  academic_year_id?: string;
}

// ==========================================
// ANALYTICS DTOs
// ==========================================

export interface SubjectPerformanceDto {
  subject_id: string;
  subject_name: string;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_students: number;
  grade_distribution: {
    a: number;
    b: number;
    c: number;
    d: number;
    f: number;
  };
}

export interface ClassAnalyticsDto {
  grade_level: string;
  section_name?: string;
  total_students: number;
  overall_average: number;
  overall_gpa: number;
  subject_performance: SubjectPerformanceDto[];
  term?: string;
  academic_year_id?: string;
}
