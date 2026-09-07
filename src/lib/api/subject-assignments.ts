/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Subject Assignment Management
 * Handles all subject assignment-related API calls to the backend
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

// Types for subject assignments
export interface SubjectAssignmentData {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  academic_year_id: string;
  semester: string;
  grade_level: string;
  section_name: string;
  role: string;
  sections_assigned: number;
  weekly_hours: number;
  assignment_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    full_name: string;
    email: string;
    department?: string;
    subjects?: string[];
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
}

export interface CreateSubjectAssignmentData {
  teacher_id: string;
  subject_id: string;
  academic_year_id: string;
  semester: string;
  grade_level: string;
  section_name: string;
  role?: string;
  sections_assigned?: number;
  weekly_hours?: number;
  assignment_date?: string;
  notes?: string;
}

export interface UpdateSubjectAssignmentData {
  teacher_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  semester?: string;
  grade_level?: string;
  section_name?: string;
  role?: string;
  sections_assigned?: number;
  weekly_hours?: number;
  status?: string;
  notes?: string;
}

export interface SubjectAssignmentFilters {
  teacher_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  semester?: string;
  grade_level?: string;
  section_name?: string;
  status?: string;
}

/**
 * Get all subject assignments
 */
export const getAllSubjectAssignments = async (filters?: SubjectAssignmentFilters): Promise<SubjectAssignmentData[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.section_name) params.append('section_name', filters.section_name);
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE}/subject-assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subject assignments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subject assignments:', error);
    return [];
  }
};

/**
 * Get subject assignment by ID
 */
export const getSubjectAssignmentById = async (id: string): Promise<SubjectAssignmentData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subject-assignments/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subject assignment');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subject assignment:', error);
    return null;
  }
};

/**
 * Create a new subject assignment
 */
export const createSubjectAssignment = async (data: CreateSubjectAssignmentData): Promise<SubjectAssignmentData> => {
  try {
    const response = await fetch(`${API_BASE}/subject-assignments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subject assignment');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating subject assignment:', error);
    throw error;
  }
};

/**
 * Update a subject assignment
 */
export const updateSubjectAssignment = async (id: string, data: UpdateSubjectAssignmentData): Promise<SubjectAssignmentData> => {
  try {
    const response = await fetch(`${API_BASE}/subject-assignments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update subject assignment');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating subject assignment:', error);
    throw error;
  }
};

/**
 * Delete a subject assignment
 */
export const deleteSubjectAssignment = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/subject-assignments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete subject assignment');
    }
  } catch (error) {
    console.error('Error deleting subject assignment:', error);
    throw error;
  }
};

/**
 * Get assignments for a specific teacher
 */
export const getTeacherAssignments = async (teacherId: string): Promise<SubjectAssignmentData[]> => {
  return getAllSubjectAssignments({ teacher_id: teacherId });
};

/**
 * Get assignments for a specific subject
 */
export const getSubjectAssignments = async (subjectId: string): Promise<SubjectAssignmentData[]> => {
  return getAllSubjectAssignments({ subject_id: subjectId });
};

/**
 * Get assignments for a specific academic year
 */
export const getAcademicYearAssignments = async (academicYearId: string): Promise<SubjectAssignmentData[]> => {
  return getAllSubjectAssignments({ academic_year_id: academicYearId });
};