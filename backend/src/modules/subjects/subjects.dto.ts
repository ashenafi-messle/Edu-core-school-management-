/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Subject Management
 * Defines data transfer objects for subject-related operations
 */

// Base Subject DTO
export interface CreateSubjectDto {
  subject_code: string;
  subject_name: string;
  description?: string;
  category?: 'Core' | 'Elective' | 'Extra-curricular';
  weekly_hours?: number;
  status?: 'Active' | 'Inactive';
}

export interface UpdateSubjectDto {
  subject_code?: string;
  subject_name?: string;
  description?: string;
  category?: 'Core' | 'Elective' | 'Extra-curricular';
  weekly_hours?: number;
  status?: 'Active' | 'Inactive';
}

// Subject DTO (for UI)
export interface SubjectDto {
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
}