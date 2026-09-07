/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageRoute = 'home' | 'login' | 'about' | 'contact' | 'dashboard' | 'forgot-password' | 'registration' | 'registration-status' | 'reset-password';

export type UserRole = 'director' | 'teacher' | 'student' | 'parent' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// Database types matching PostgreSQL schema
export type Gender = 'male' | 'female' | 'other';
export type ParentRelationship = 'father' | 'mother' | 'guardian' | 'other';
export type RegistrationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
export type SchoolStatus = 'active' | 'suspended' | 'pending';

export interface School {
  id: string;
  name: string;
  subdomain?: string;
  domain?: string;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  school_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  auth_user_id?: string;
}

export interface Parent {
  id: string;
  school_id: string;
  user_id?: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  user_id?: string;
  parent_id?: string;
  admission_number: string;
  full_name: string;
  grade_level: string;
  section?: string;
  gender?: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
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

export interface SectionAllocation {
  id: string;
  school_id: string;
  student_id: string;
  section_configuration_id: string;
  grade_level: string;
  section_name: string;
  allocation_method: 'auto' | 'manual';
  allocated_by?: string;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  user_id?: string;
  employee_id: string;
  full_name: string;
  department?: string;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  school_id: string;
  reference_id: string;
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth: string;
  student_gender: Gender;
  student_grade_level: string;
  student_previous_school?: string;
  student_address: string;
  student_city: string;
  student_phone: string;
  student_email?: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_relationship: ParentRelationship;
  parent_occupation?: string;
  parent_phone: string;
  parent_email: string;
  parent_address?: string;
  emergency_contact_name?: string;
  emergency_phone?: string;
  birth_certificate_url?: string;
  school_records_url?: string;
  student_photo_url?: string;
  status: RegistrationStatus;
  admin_notes?: string;
  rejection_reason?: string;
  submitted_at: string;
  review_started_at?: string;
  approved_at?: string;
  rejected_at?: string;
  enrolled_at?: string;
  updated_at: string;
}

export interface CreateRegistrationInput {
  school_id: string;
  student_first_name: string;
  student_last_name: string;
  student_date_of_birth: string;
  student_gender: Gender;
  student_grade_level: string;
  student_previous_school?: string;
  student_address: string;
  student_city: string;
  student_phone: string;
  student_email?: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_relationship: ParentRelationship;
  parent_occupation?: string;
  parent_phone: string;
  parent_email: string;
  parent_address?: string;
  emergency_contact_name?: string;
  emergency_phone?: string;
  birth_certificate_url?: string;
  school_records_url?: string;
  student_photo_url?: string;
}

export interface AuthLog {
  id: string;
  user_id?: string;
  action: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface AuthUser {
  user: User;
  parent?: Parent;
  student?: Student;
  teacher?: Teacher;
  school: School;
}

export interface RegistrationDocument {
  id: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface StudentRegistrationData {
  schoolId: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  gradeLevel: string;
  previousSchool: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface ParentRegistrationData {
  firstName: string;
  lastName: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  occupation: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
}

export interface OnlineRegistrationApplication {
  id: string;
  referenceCode: string;
  submittedAt: string;
  schoolId: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  student: StudentRegistrationData;
  parent: ParentRegistrationData;
  documents: RegistrationDocument[];
}

export interface UserCredential {
  id?: string;
  schoolId?: string;
  email: string;
  role: UserRole;
  name: string;
  avatar: string;
  schoolName: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  emailAlerts?: boolean;
  smsAlerts?: boolean;
  marketingEmails?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  school: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'core' | 'academic' | 'management' | 'utility';
}

export interface SystemModule {
  id: string;
  title: string;
  role: UserRole | 'principal' | 'reception' | 'librarian' | 'transport' | 'hr';
  description: string;
  features: string[];
  iconName: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}
