/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Teacher Management
 * Handles all teacher-related API calls to the backend
 */

import { Teacher } from '../components/workspaces/director/types';
import { api } from '../api';

// Base API configuration
const API_BASE = '/api';

// Interface for aggregate teacher metrics
export interface TeacherAggregateMetrics {
  facultyCount: number;
  averageEvaluationRating: string;
  syllabusCompletionRate: string;
  academicYear: string;
}

// Helper function to get headers with school ID context
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const schoolId = api.getSchoolId();
  if (schoolId) {
    headers['X-School-ID'] = schoolId;
  }

  return headers;
};

// Teacher interfaces matching backend DTOs
export interface CreateTeacherData {
  employee_id: string;
  full_name: string;
  department?: string;
  subjects?: string[];
  photo?: string;
  phone?: string;
  email: string;
  employment_date?: string;
  status?: 'Active' | 'Deactivated';
  weekly_load?: string;
  assigned_grades?: string[];
  assigned_sections?: string[];
}

export interface UpdateTeacherData {
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

export interface TeacherProfileData {
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
  performance_metrics?: any;
  evaluations?: any[];
  class_assignments?: any[];
}

// Helper function to convert backend teacher data to frontend Teacher interface
const convertToTeacher = (backendTeacher: any): Teacher => {
  return {
    id: backendTeacher.id, // Use the actual database UUID
    employee_id: backendTeacher.employee_id, // Store employee_id separately
    user_id: backendTeacher.user_id,
    photo: backendTeacher.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    name: backendTeacher.full_name,
    subject: backendTeacher.subjects?.[0] || backendTeacher.department || 'General',
    dept: backendTeacher.department || 'General',
    assignedGrades: backendTeacher.assigned_grades || [],
    assignedSections: backendTeacher.assigned_sections || [],
    phone: backendTeacher.phone || '+1 (555) 000-0000',
    email: backendTeacher.email || '',
    employmentDate: backendTeacher.employment_date || backendTeacher.created_at,
    status: backendTeacher.status || 'Active',
    load: backendTeacher.weekly_load || '0 hrs/wk',
    ratings: { 
      student: backendTeacher.performance_metrics?.student_rating || 0, 
      parent: backendTeacher.performance_metrics?.parent_rating || 0 
    },
    attendance: {
      present: backendTeacher.performance_metrics?.attendance_present || 0,
      absent: backendTeacher.performance_metrics?.attendance_absent || 0,
      late: backendTeacher.performance_metrics?.attendance_late || 0,
      leave: backendTeacher.performance_metrics?.attendance_leave || 0
    },
    assignmentCompletion: backendTeacher.performance_metrics?.assignment_completion_rate || 0,
    directorEval: backendTeacher.performance_metrics?.director_evaluation || 0,
    strengths: backendTeacher.evaluations
      ?.filter((e: any) => e.evaluation_type === 'Strength')
      .map((e: any) => e.description) || [],
    areasForImprovement: backendTeacher.evaluations
      ?.filter((e: any) => e.evaluation_type === 'Area for Improvement')
      .map((e: any) => e.description) || []
  };
};

/**
 * Get all teachers
 */
export const getAllTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await fetch(`${API_BASE}/teachers`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch teachers');
    }
    const data = await response.json();
    return data.map(convertToTeacher);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
};

/**
 * Get teacher by ID
 */
export const getTeacherById = async (id: string): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch teacher');
    }
    const data = await response.json();
    return convertToTeacher(data);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
};

/**
 * Get complete teacher profile with all related data
 */
export const getTeacherProfile = async (id: string): Promise<TeacherProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}/profile`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch teacher profile');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return null;
  }
};

/**
 * Create new teacher
 */
export const createTeacher = async (teacherData: CreateTeacherData): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create teacher');
    }

    const data = await response.json();
    return convertToTeacher(data);
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }
};

/**
 * Update teacher
 */
export const updateTeacher = async (id: string, teacherData: UpdateTeacherData): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update teacher');
    }

    const data = await response.json();
    return convertToTeacher(data);
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

/**
 * Delete teacher
 */
export const deleteTeacher = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete teacher');
    }

    return true;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
};

/**
 * Activate teacher
 */
export const activateTeacher = async (id: string): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}/activate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to activate teacher');
    }

    const data = await response.json();
    return convertToTeacher(data);
  } catch (error) {
    console.error('Error activating teacher:', error);
    throw error;
  }
};

/**
 * Deactivate teacher
 */
export const deactivateTeacher = async (id: string): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${id}/deactivate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to deactivate teacher';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return convertToTeacher(data);
  } catch (error) {
    console.error('Error deactivating teacher:', error);
    throw error;
  }
};

/**
 * Create performance metrics for teacher
 */
export const createPerformanceMetrics = async (teacherId: string, metricsData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/performance-metrics`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(metricsData),
    });

    if (!response.ok) {
      throw new Error('Failed to create performance metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating performance metrics:', error);
    throw error;
  }
};

/**
 * Get performance metrics for teacher
 */
export const getPerformanceMetrics = async (teacherId: string, academicYear?: string): Promise<any[]> => {
  try {
    const url = academicYear 
      ? `${API_BASE}/teachers/${teacherId}/performance-metrics?academicYear=${academicYear}`
      : `${API_BASE}/teachers/${teacherId}/performance-metrics`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch performance metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return [];
  }
};

/**
 * Create evaluation for teacher
 */
export const createEvaluation = async (teacherId: string, evaluationData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/evaluations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(evaluationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create evaluation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating evaluation:', error);
    throw error;
  }
};

/**
 * Get evaluations for teacher
 */
export const getEvaluations = async (teacherId: string, type?: string): Promise<any[]> => {
  try {
    const url = type 
      ? `${API_BASE}/teachers/${teacherId}/evaluations?type=${type}`
      : `${API_BASE}/teachers/${teacherId}/evaluations`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch evaluations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return [];
  }
};

/**
 * Create class assignment for teacher
 */
export const createClassAssignment = async (teacherId: string, assignmentData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/class-assignments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create class assignment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating class assignment:', error);
    throw error;
  }
};

/**
 * Get class assignments for teacher
 */
export const getClassAssignments = async (teacherId: string, isActive?: boolean): Promise<any[]> => {
  try {
    const url = isActive !== undefined 
      ? `${API_BASE}/teachers/${teacherId}/class-assignments?isActive=${isActive}`
      : `${API_BASE}/teachers/${teacherId}/class-assignments`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch class assignments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    return [];
  }
};

/**
 * Get aggregate teacher metrics for dashboard cards
 */
export const getTeacherAggregateMetrics = async (academicYear?: string): Promise<TeacherAggregateMetrics> => {
  try {
    const url = academicYear 
      ? `${API_BASE}/teachers/metrics/aggregate?academicYear=${academicYear}`
      : `${API_BASE}/teachers/metrics/aggregate`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch aggregate metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching aggregate metrics:', error);
    // Return default values on error
    return {
      facultyCount: 0,
      averageEvaluationRating: '0.0',
      syllabusCompletionRate: '0.0',
      academicYear: academicYear || '2026-2027'
    };
  }
};

/**
 * Get teacher classes and divisions data
 */
export const getTeacherClasses = async (teacherId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/classes`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch teacher classes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return null;
  }
};

/**
 * Get teacher student roster data
 */
export const getTeacherStudentRoster = async (teacherId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/students`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch teacher student roster');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher student roster:', error);
    return null;
  }
};
