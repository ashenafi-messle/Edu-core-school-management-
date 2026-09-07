/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Registration Management
 * Defines data transfer objects for registration-related operations including parent-student mapping
 */

// Base Registration DTOs
export interface CreateRegistrationDto {
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
}

export interface UpdateRegistrationDto {
  student_first_name?: string;
  student_last_name?: string;
  student_date_of_birth?: string;
  student_gender?: 'male' | 'female' | 'other';
  student_grade_level?: string;
  student_previous_school?: string;
  student_address?: string;
  student_city?: string;
  student_phone?: string;
  student_email?: string;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_relationship?: 'father' | 'mother' | 'guardian' | 'other';
  parent_occupation?: string;
  parent_phone?: string;
  parent_email?: string;
  parent_address?: string;
  emergency_contact_name?: string;
  emergency_phone?: string;
  birth_certificate_url?: string;
  school_records_url?: string;
  student_photo_url?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  admin_notes?: string;
  rejection_reason?: string;
}

export interface RegistrationProfileDto {
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

export interface ParentStudentMappingDto {
  registration_id: string;
  parent_id?: string;
  student_id?: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_relationship: 'father' | 'mother' | 'guardian' | 'other';
  parent_phone: string;
  parent_email: string;
  student_first_name: string;
  student_last_name: string;
  student_grade_level: string;
  student_phone: string;
  student_email?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  emergency_contact: boolean;
  created_at: string;
}

export interface ListRegistrationsQuery {
  search?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  grade_level?: string;
  relationship?: 'father' | 'mother' | 'guardian' | 'other';
  limit?: number;
  offset?: number;
}

export interface RegistrationWithRelatedDataDto extends RegistrationProfileDto {
  student?: {
    id: string;
    admission_number: string;
  };
  parent?: {
    id: string;
    user_id?: string;
  };
}
