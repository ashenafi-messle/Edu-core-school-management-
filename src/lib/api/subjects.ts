/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Subject Management
 * Handles all subject-related API calls to the backend
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

  const schoolId = api.getSchoolId();
  if (schoolId) {
    headers['X-School-ID'] = schoolId;
  }

  return headers;
};

// Subject interfaces matching backend DTOs
export interface CreateSubjectData {
  subject_code: string;
  subject_name: string;
  description?: string;
  category?: 'Core' | 'Elective' | 'Extra-curricular';
  weekly_hours?: number;
  status?: 'Active' | 'Inactive';
}

export interface UpdateSubjectData {
  subject_code?: string;
  subject_name?: string;
  description?: string;
  category?: 'Core' | 'Elective' | 'Extra-curricular';
  weekly_hours?: number;
  status?: 'Active' | 'Inactive';
}

export interface SubjectData {
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

/**
 * Get all subjects with optional filters
 */
export const getAllSubjects = async (filters?: {
  category?: string;
  status?: string;
}): Promise<SubjectData[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE}/subjects${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

/**
 * Get subject by ID
 */
export const getSubjectById = async (id: string): Promise<SubjectData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subjects/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subject');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
};

/**
 * Create new subject
 */
export const createSubject = async (subjectData: CreateSubjectData): Promise<SubjectData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subject');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

/**
 * Update subject
 */
export const updateSubject = async (id: string, subjectData: UpdateSubjectData): Promise<SubjectData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update subject');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

/**
 * Delete subject
 */
export const deleteSubject = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete subject');
    }

    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

/**
 * Archive subject
 */
export const archiveSubject = async (id: string): Promise<SubjectData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subjects/${id}/archive`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to archive subject');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error archiving subject:', error);
    throw error;
  }
};

/**
 * Activate subject
 */
export const activateSubject = async (id: string): Promise<SubjectData | null> => {
  try {
    const response = await fetch(`${API_BASE}/subjects/${id}/activate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to activate subject');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error activating subject:', error);
    throw error;
  }
};