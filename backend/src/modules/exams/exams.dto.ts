/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Enhanced Exams and Gradebook Management
 * Defines data transfer objects for exam preparation, publishing, and gradebook operations
 */

// ==========================================
// ENHANCED EXAMS DTOs
// ==========================================

export interface CreateEnhancedExamDto {
  title: string;
  exam_code?: string;
  description?: string;
  exam_type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project' | 'practical' | 'oral';
  exam_category?: string;
  term?: string;
  academic_year_id?: string;
  grade_level: string;
  section_name?: string;
  max_score: number;
  passing_score?: number;
  duration_minutes?: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructions?: string;
  question_paper_url?: string;
  attachments?: Array<{ name: string; size: number; type: string; url: string }>;
  grading_scale?: Record<string, any>;
  teacher_id?: string;
  subject_id?: string;
}

export interface UpdateEnhancedExamDto {
  title?: string;
  description?: string;
  exam_type?: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project' | 'practical' | 'oral';
  exam_category?: string;
  term?: string;
  academic_year_id?: string;
  grade_level?: string;
  section_name?: string;
  max_score?: number;
  passing_score?: number;
  duration_minutes?: number;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructions?: string;
  question_paper_url?: string;
  attachments?: Array<{ name: string; size: number; type: string; url: string }>;
  grading_scale?: Record<string, any>;
  status?: 'draft' | 'published' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface PublishExamDto {
  exam_id: string;
  is_published: boolean;
}

export interface EnhancedExamDto {
  id: string;
  school_id: string;
  teacher_id?: string;
  subject_id?: string;
  title: string;
  exam_code?: string;
  description?: string;
  exam_type: string;
  exam_category?: string;
  term?: string;
  academic_year_id?: string;
  grade_level: string;
  section_name?: string;
  max_score: number;
  passing_score: number;
  duration_minutes?: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructions?: string;
  status: string;
  is_published: boolean;
  published_at?: string;
  published_by?: string;
  question_paper_url?: string;
  attachments: Array<any>;
  grading_scale?: Record<string, any>;
  allow_grading: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// EXAM REGISTRATIONS DTOs
// ==========================================

export interface CreateExamRegistrationDto {
  exam_id: string;
  student_id: string;
  registration_status?: 'registered' | 'absent' | 'exempted' | 'cancelled';
  room_number?: string;
  seat_number?: string;
  special_accommodations?: string;
}

export interface UpdateExamRegistrationDto {
  registration_status?: 'registered' | 'absent' | 'exempted' | 'cancelled';
  attendance_status?: 'present' | 'absent' | 'late' | 'excused';
  room_number?: string;
  seat_number?: string;
  special_accommodations?: string;
}

export interface BulkRegisterStudentsDto {
  exam_id: string;
  grade_level: string;
  section_name?: string;
}

export interface MarkAttendanceDto {
  exam_id: string;
  student_id: string;
  attendance_status: 'present' | 'absent' | 'late' | 'excused';
}

export interface ExamRegistrationDto {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  registration_status: string;
  registration_date: string;
  attendance_status?: string;
  attendance_marked_by?: string;
  attendance_marked_at?: string;
  room_number?: string;
  seat_number?: string;
  special_accommodations?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ENHANCED EXAM GRADES DTOs
// ==========================================

export interface CreateEnhancedExamGradeDto {
  exam_id: string;
  student_id: string;
  score: number;
  max_score: number;
  teacher_feedback?: string;
  detailed_feedback?: Record<string, any>;
  strengths?: string;
  areas_for_improvement?: string;
  graded_by?: string;
}

export interface UpdateEnhancedExamGradeDto {
  score?: number;
  max_score?: number;
  teacher_feedback?: string;
  detailed_feedback?: Record<string, any>;
  strengths?: string;
  areas_for_improvement?: string;
  is_verified?: boolean;
  verified_by?: string;
  is_moderated?: boolean;
  moderated_by?: string;
  moderation_notes?: string;
}

export interface BulkGradeExamDto {
  exam_id: string;
  grades: Array<{
    student_id: string;
    score: number;
    teacher_feedback?: string;
  }>;
}

export interface EnhancedExamGradeDto {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  registration_id?: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  grade_point: number;
  performance_level: string;
  teacher_feedback?: string;
  detailed_feedback?: Record<string, any>;
  strengths?: string;
  areas_for_improvement?: string;
  graded_by?: string;
  graded_date: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  is_moderated: boolean;
  moderated_by?: string;
  moderated_at?: string;
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
}

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
// CLASS PERFORMANCE SUMMARY DTOs
// ==========================================

export interface ClassPerformanceSummaryDto {
  id: string;
  school_id: string;
  exam_id?: string;
  subject_id?: string;
  grade_level: string;
  section_name?: string;
  term?: string;
  academic_year_id?: string;
  total_students: number;
  students_attempted: number;
  students_absent: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  median_score: number;
  standard_deviation: number;
  grade_a_count: number;
  grade_b_count: number;
  grade_c_count: number;
  grade_d_count: number;
  grade_f_count: number;
  excellent_count: number;
  good_count: number;
  satisfactory_count: number;
  needs_improvement_count: number;
  fail_count: number;
  pass_rate: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STUDENT GRADE SUMMARY DTOs
// ==========================================

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
// QUERY AND FILTER DTOs
// ==========================================

export interface ExamQueryDto {
  grade_level?: string;
  section_name?: string;
  subject_id?: string;
  term?: string;
  academic_year_id?: string;
  exam_type?: string;
  status?: string;
  is_published?: boolean;
  start_date?: string;
  end_date?: string;
}

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

export interface ClassPerformanceQueryDto {
  exam_id?: string;
  subject_id?: string;
  grade_level?: string;
  section_name?: string;
  term?: string;
  academic_year_id?: string;
}

// ==========================================
// EXAM QUESTIONS DTOs
// ==========================================

export interface CreateExamQuestionDto {
  exam_id: string;
  question_number: number;
  question_text: string;
  question_type: 'choice' | 'workout' | 'true_false' | 'fill_blank' | 'essay';
  points?: number;
  is_required?: boolean;
  explanation?: string;
  choices?: Array<{ id: string; text: string; is_correct?: boolean }>;
  correct_answer?: string | string[];
  answer_places?: Array<{ id: number; type: 'text' | 'number' | 'date'; label: string; placeholder?: string }>;
  expected_answer?: string;
  question_image_url?: string;
  attachments?: Array<{ name: string; size: number; type: string; url: string }>;
}

export interface UpdateExamQuestionDto {
  question_text?: string;
  question_type?: 'choice' | 'workout' | 'true_false' | 'fill_blank' | 'essay';
  points?: number;
  is_required?: boolean;
  explanation?: string;
  choices?: Array<{ id: string; text: string; is_correct?: boolean }>;
  correct_answer?: string | string[];
  answer_places?: Array<{ id: number; type: 'text' | 'number' | 'date'; label: string; placeholder?: string }>;
  expected_answer?: string;
  question_image_url?: string;
  attachments?: Array<{ name: string; size: number; type: string; url: string }>;
}

export interface BulkCreateExamQuestionsDto {
  exam_id: string;
  questions: CreateExamQuestionDto[];
}

export interface ExamQuestionDto {
  id: string;
  school_id: string;
  exam_id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  points: number;
  is_required: boolean;
  explanation?: string;
  choices: Array<any>;
  correct_answer?: any;
  answer_places: Array<any>;
  expected_answer?: string;
  question_image_url?: string;
  attachments: Array<any>;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STUDENT EXAM ANSWERS DTOs
// ==========================================

export interface CreateStudentExamAnswerDto {
  exam_id: string;
  question_id: string;
  student_id: string;
  answer_text?: string;
  selected_choices?: string[];
  answer_places_filled?: Record<number, string>;
}

export interface UpdateStudentExamAnswerDto {
  answer_text?: string;
  selected_choices?: string[];
  answer_places_filled?: Record<number, string>;
}

export interface StudentExamAnswerDto {
  id: string;
  school_id: string;
  exam_id: string;
  question_id: string;
  student_id: string;
  registration_id?: string;
  answer_text?: string;
  selected_choices: Array<any>;
  answer_places_filled: Record<string, any>;
  is_correct?: boolean;
  points_earned: number;
  auto_graded: boolean;
  answered_at: string;
  updated_at: string;
  created_at: string;
}

export interface SubmitExamAnswersDto {
  exam_id: string;
  student_id: string;
  answers: Array<{
    question_id: string;
    answer_text?: string;
    selected_choices?: string[];
    answer_places_filled?: Record<number, string>;
  }>;
}

// ==========================================
// REPORT CARD DTOs
// ==========================================

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