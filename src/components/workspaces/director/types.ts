/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  photo: string;
  name: string;
  grade: string;
  section: string;
  gender: 'Male' | 'Female';
  dob: string;
  parentName: string;
  parentPhone: string;
  regDate: string;
  status: 'Active' | 'Inactive';
  email: string;
  address: string;
  bloodGroup: string;
  attendance: string;
  feeStatus: 'Paid' | 'Overdue';
  enrolledCourses: string[];
  documents: string[];
}

export interface Teacher {
  id: string; // Database UUID
  employee_id?: string; // Employee ID like "TCH-00004"
  user_id?: string;
  photo: string;
  name: string;
  subject: string;
  dept: string;
  assignedGrades: string[];
  assignedSections: string[];
  phone: string;
  email: string;
  employmentDate: string;
  status: 'Active' | 'Deactivated';
  load: string;
  ratings: { student: number; parent: number };
  attendance: { present: number; absent: number; late: number; leave: number };
  assignmentCompletion: number; // %
  directorEval: number; // %
  strengths: string[];
  areasForImprovement: string[];
}

export interface Registration {
  regNum: string;
  studentName: string;
  parentName: string;
  appliedGrade: string;
  appDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  dob: string;
}

export interface Course {
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
  
  // Legacy fields for backward compatibility
  name?: string;
  code?: string;
  desc?: string;
  grade?: string;
  section?: string;
  teacher?: string;
  weeklyHours?: number;
}

export interface TimetableSlot {
  id: string;
  day: string;
  timeSlot: string;
  teacherId: string;
  teacherName: string;
  courseCode: string;
  courseName: string;
  grade: string;
  section: string;
  classroom: string;
}

export interface Parent {
  id: string;
  user_id?: string;
  school_id: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // UI compatibility fields
  photo?: string;
  name?: string;
  address?: string;
  occupation?: string;
  childrenCount?: number;
  // User association
  user?: {
    id: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    profile_picture_url?: string;
  };
}

export interface ParentStudentMapping {
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  relationship: string;
  grade: string;
  section: string;
  emergencyContact: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  desc: string;
  audience: 'Teachers' | 'Students' | 'Parents' | 'General' | 'Emergency';
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  attachments: string[];
  publishDate: string;
  expiryDate: string;
  status: 'Published' | 'Scheduled' | 'Archived';
  viewsCount?: number;
  commentsCount?: number;
  interactionRate?: number; // %
}

export interface Subject {
  id: string;
  school_id: string;
  subject_code: string;
  subject_name: string;
  description?: string;
  category: 'Core' | 'Elective' | 'Extra-curricular';
  weekly_hours: number;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  
  // Legacy fields for backward compatibility
  code?: string;
  name?: string;
  desc?: string;
  weeklyHours?: number;
}

export interface TeacherSubjectAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  academic_year_id: string;
  semester: string;
  role: string;
  sections_assigned: number;
  weekly_hours: number;
  assignment_date: string;
  status: 'Active' | 'Inactive' | 'Completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  teacher?: {
    id: string;
    full_name: string;
    email: string;
    subject_specialization?: string;
  };
  subject?: {
    id: string;
    subject_code: string;
    subject_name: string;
    category: string;
  };
  academic_year?: {
    id: string;
    year_name: string;
    current_semester: string;
  };
  
  // Legacy fields for backward compatibility
  teacherId?: string;
  teacherName?: string;
  subjectCode?: string;
  subjectName?: string;
  academicYear?: string;
}

export interface TeacherGradeSectionAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  section: string;
  role: 'Class Teacher' | 'Subject Teacher' | 'Homeroom Teacher';
}

export interface StudentAcademicRecord {
  courseCode: string;
  courseName: string;
  score: number;
  grade: string;
  attendance: number; // %
}

export interface StudentAttendanceLog {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
}

export interface StudentBehaviorLog {
  id: string;
  date: string;
  type: 'Commendation' | 'Infraction';
  title: string;
  desc: string;
  reporter: string;
}

export interface ParentFeedback {
  id: string;
  parentId: string;
  parentName: string;
  studentName: string;
  type: 'Complaint' | 'Suggestion' | 'Enquiry' | 'Compliment';
  message: string;
  date: string;
  status: 'Pending' | 'Resolved';
  response?: string;
}

export interface SectionConfiguration {
  id: string;
  school_id: string;
  grade_level: string;
  section_name: string;
  max_capacity: number;
  current_count: number;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  current_semester: string;
  semester_start_date: string | null;
  semester_end_date: string | null;
  is_active: boolean;
  is_archived: boolean;
  archived_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

