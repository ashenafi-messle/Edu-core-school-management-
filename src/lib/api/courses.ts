/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Course Management
 * Handles all course-related API calls to the backend
 */

import { api } from '../api';

// Base API configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

// Course interfaces matching backend DTOs
export interface CreateCourseData {
  course_code: string;
  course_name: string;
  description?: string;
  grade_level: string;
  subject_area?: string;
  credits?: number;
  teacher_id?: string;
  academic_year: string;
  semester?: string;
  status?: 'active' | 'inactive' | 'archived';
  max_capacity?: number;
  schedule?: Record<string, any>;
}

export interface UpdateCourseData {
  course_code?: string;
  course_name?: string;
  description?: string;
  grade_level?: string;
  subject_area?: string;
  credits?: number;
  teacher_id?: string;
  academic_year?: string;
  semester?: string;
  status?: 'active' | 'inactive' | 'archived';
  max_capacity?: number;
  current_enrollment?: number;
  schedule?: Record<string, any>;
}

export interface CourseData {
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
}

export interface CourseEnrollmentData {
  id: string;
  school_id: string;
  course_id: string;
  student_id: string;
  student_name?: string;
  course_name?: string;
  enrollment_date: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseEnrollmentData {
  course_id: string;
  student_id: string;
  status?: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
}

export interface UpdateCourseEnrollmentData {
  status?: 'enrolled' | 'dropped' | 'completed' | 'failed';
  grade?: string;
  mid_term_score?: number;
  final_score?: number;
  assignment_score?: number;
  attendance_percentage?: number;
  remarks?: string;
}

/**
 * Get all courses with optional filters
 */
export const getAllCourses = async (filters?: {
  grade_level?: string;
  subject_area?: string;
  academic_year?: string;
  status?: string;
}): Promise<CourseData[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.grade_level) params.append('grade_level', filters.grade_level);
    if (filters?.subject_area) params.append('subject_area', filters.subject_area);
    if (filters?.academic_year) params.append('academic_year', filters.academic_year);
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE}/courses${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (id: string): Promise<CourseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

/**
 * Get course with enrollments
 */
export const getCourseWithEnrollments = async (id: string): Promise<CourseData & { enrollments?: CourseEnrollmentData[] } | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/enrollments`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch course with enrollments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course with enrollments:', error);
    return null;
  }
};

/**
 * Create new course
 */
export const createCourse = async (courseData: CreateCourseData): Promise<CourseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create course');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update course
 */
export const updateCourse = async (id: string, courseData: UpdateCourseData): Promise<CourseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update course');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }

    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Archive course
 */
export const archiveCourse = async (id: string): Promise<CourseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/archive`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to archive course');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
};

/**
 * Activate course
 */
export const activateCourse = async (id: string): Promise<CourseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/activate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to activate course');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error activating course:', error);
    throw error;
  }
};

/**
 * Get course statistics
 */
export const getCourseStats = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${id}/stats`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch course statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course statistics:', error);
    return null;
  }
};

// ==========================================
// COURSE ENROLLMENT METHODS
// ==========================================

/**
 * Enroll student in course
 */
export const enrollStudent = async (enrollmentData: CreateCourseEnrollmentData): Promise<CourseEnrollmentData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to enroll student');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

/**
 * Get enrollments for a course
 */
export const getCourseEnrollments = async (courseId: string): Promise<CourseEnrollmentData[]> => {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/enrollments/list`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch course enrollments');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return [];
  }
};

/**
 * Update enrollment
 */
export const updateCourseEnrollment = async (enrollmentId: string, enrollmentData: UpdateCourseEnrollmentData): Promise<CourseEnrollmentData | null> => {
  try {
    const response = await fetch(`${API_BASE}/courses/enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update enrollment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
};

/**
 * Delete enrollment
 */
export const deleteCourseEnrollment = async (enrollmentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/courses/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete enrollment');
    }

    return true;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
};