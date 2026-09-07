/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Registration Management
 * Handles all registration-related API calls including parent-student mapping
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

// Registration interfaces matching backend DTOs
export interface CreateRegistrationData {
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

export interface UpdateRegistrationData {
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

export interface RegistrationProfileData {
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

export interface ParentStudentMappingData {
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

export interface RegistrationStatistics {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  enrolled: number;
}

/**
 * Get all registrations with optional filtering
 */
export const getAllRegistrations = async (query?: ListRegistrationsQuery): Promise<RegistrationProfileData[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.grade_level) params.append('grade_level', query.grade_level);
    if (query?.relationship) params.append('relationship', query.relationship);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const url = params.toString() 
      ? `${API_BASE}/registrations?${params.toString()}`
      : `${API_BASE}/registrations`;

    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
};

/**
 * Get registration by ID
 */
export const getRegistrationById = async (id: string): Promise<RegistrationProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch registration');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registration:', error);
    return null;
  }
};

/**
 * Get registration with related student and parent data
 */
export const getRegistrationProfile = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}/profile`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch registration profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registration profile:', error);
    return null;
  }
};

/**
 * Get parent-student mappings from approved/enrolled registrations
 */
export const getParentStudentMappings = async (query?: ListRegistrationsQuery): Promise<ParentStudentMappingData[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.grade_level) params.append('grade_level', query.grade_level);
    if (query?.relationship) params.append('relationship', query.relationship);

    const url = params.toString() 
      ? `${API_BASE}/registrations/mappings?${params.toString()}`
      : `${API_BASE}/registrations/mappings`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch parent-student mappings');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent-student mappings:', error);
    return [];
  }
};

/**
 * Create new registration
 */
export const createRegistration = async (registrationData: CreateRegistrationData): Promise<RegistrationProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create registration');
    }

    const data = await response.json();
    return data.registration || data;
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
};

/**
 * Update registration
 */
export const updateRegistration = async (id: string, registrationData: UpdateRegistrationData): Promise<RegistrationProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update registration');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
};

/**
 * Delete registration
 */
export const deleteRegistration = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete registration');
    }

    return true;
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw error;
  }
};

/**
 * Link registration to existing parent and student records
 */
export const linkToExistingRecords = async (id: string, parentId?: string, studentId?: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}/link`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parent_id: parentId, student_id: studentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to link records');
    }

    return await response.json();
  } catch (error) {
    console.error('Error linking records:', error);
    throw error;
  }
};

/**
 * Update registration status
 */
export const updateRegistrationStatus = async (id: string, status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled', reason?: string): Promise<RegistrationProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update registration status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

/**
 * Get registration statistics
 */
export const getRegistrationStatistics = async (): Promise<RegistrationStatistics> => {
  try {
    const response = await fetch(`${API_BASE}/registrations/statistics`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch registration statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registration statistics:', error);
    return {
      total: 0,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      enrolled: 0
    };
  }
};