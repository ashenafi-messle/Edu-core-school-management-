/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Director-specific operations
 * Handles director-specific API calls to the backend
 */

import { api } from '../api';

// Base API configuration
const API_BASE = '/api';

// Helper function to get headers with school ID context
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add school ID from the API client if available
  const schoolId = api.getSchoolId();
  if (schoolId) {
    headers['X-School-ID'] = schoolId;
  }

  return headers;
};

// Types for director form data
export interface TeacherFormData {
  id: string;
  full_name: string;
  email: string;
  employee_id: string;
  department?: string;
  subject_specialization?: string;
  status: string;
  photo?: string;
  assigned_grades?: string[];
  assigned_sections?: string[];
}

export interface SubjectFormData {
  id: string;
  subject_code: string;
  subject_name: string;
  category: string;
  weekly_hours: number;
  status: string;
}

export interface AcademicYearFormData {
  id: string;
  year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  current_semester: string;
  is_active: boolean;
  is_archived: boolean;
}

export interface SectionConfigurationFormData {
  id: string;
  grade_level: string;
  section_name: string;
  capacity: number;
  academic_year_id: string;
}

export interface SubjectAssignmentFormData {
  teachers: TeacherFormData[];
  subjects: SubjectFormData[];
  academicYears: AcademicYearFormData[];
  currentAcademicYear: AcademicYearFormData | null;
  sectionConfigurations: SectionConfigurationFormData[];
  semesters: string[];
}

/**
 * Get all data needed for subject assignment form
 */
export const getSubjectAssignmentFormData = async (): Promise<SubjectAssignmentFormData> => {
  try {
    const response = await fetch(`${API_BASE}/director/subject-assignment-form-data`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.error || 'Failed to fetch subject assignment form data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subject assignment form data:', error);
    // Return empty structure on error
    return {
      teachers: [],
      subjects: [],
      academicYears: [],
      currentAcademicYear: null,
      sectionConfigurations: [],
      semesters: ['Fall', 'Spring', 'Summer', 'Winter']
    };
  }
};
