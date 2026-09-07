/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminUser {
  id: string;
  name: string;
  role: 'director' | 'teacher' | 'student' | 'parent' | 'admin';
  email: string;
  phone: string;
  status: 'Active' | 'Suspended' | 'Deactivated';
  lastLogin: string;
  createdDate: string;
  photo?: string;
  // Specific role metadata
  grade?: string;
  section?: string;
  gender?: 'male' | 'female' | 'other';
  assignedClasses?: string[];
  assignedSubjects?: string[];
  guardianName?: string;
  emergencyContact?: string;
}

export interface OnlineRegistration {
  id: string;
  school_id: string;
  reference_id: string;
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth: string;
  student_gender: 'male' | 'female' | 'other';
  student_grade_level: string;
  student_previous_school?: string;
  student_address: string;
  student_city: string;
  student_phone: string;
  student_email?: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_relationship: 'father' | 'mother' | 'guardian' | 'other';
  parent_occupation?: string;
  parent_phone: string;
  parent_email: string;
  parent_address?: string;
  emergency_contact_name?: string;
  emergency_phone?: string;
  birth_certificate_url?: string;
  school_records_url?: string;
  student_photo_url?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  admin_notes?: string;
  rejection_reason?: string;
  submitted_at: string;
  review_started_at?: string;
  approved_at?: string;
  rejected_at?: string;
  enrolled_at?: string;
  updated_at: string;
}

export interface StudentReadmission {
  id: string;
  studentId: string;
  studentName: string;
  previousYear: string;
  previousGrade: string;
  previousSection: string;
  requestedGrade: string;
  readmissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  reason: string;
  assignedSection?: string;
  academicStanding: 'Excellent' | 'Good' | 'Probation';
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  parent: string;
  grade: string;
  section: string;
  category: 'Tuition' | 'Registration' | 'Laboratory' | 'Athletics' | 'Library';
  amountDue: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  method?: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Mobile Payment';
  reference?: string;
  paymentDate?: string;
}

export interface RolePermissions {
  role: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  print: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  dateTime: string;
  previousValue: string;
  updatedValue: string;
  status: 'Success' | 'Failed';
  ipAddress: string;
}

export interface SupportTicket {
  id: string;
  user: string;
  role: string;
  category: 'Portal Access' | 'Gradebook Error' | 'Hardware' | 'Billing' | 'General';
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'Resolved' | 'Closed';
  createdDate: string;
  description: string;
  assignedTo?: string;
  replies: {
    id: string;
    sender: 'user' | 'admin' | 'system';
    text: string;
    timestamp: string;
  }[];
}

export interface SchoolConfig {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  academicCalendar: 'Semester' | 'Quarter' | 'Trimester';
  language: string;
  currency: string;
  timezone: string;
  attendanceCutoff: string;
  passingScore: number;
  primaryColor: string;
}
