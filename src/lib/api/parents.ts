/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Parent Management
 * Handles all parent-related API calls to the backend
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

// Parent interfaces matching backend DTOs
export interface CreateParentData {
  user_id?: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
}

export interface UpdateParentData {
  full_name?: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ParentProfileData {
  id: string;
  user_id?: string;
  school_id: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  associated_students_count?: number;
}

export interface ParentWithUserData {
  id: string;
  user_id?: string;
  school_id: string;
  full_name: string;
  relationship?: string;
  emergency_contact?: string;
  phone?: string;
  email?: string;
  profile_picture_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    profile_picture_url?: string;
  };
}

export interface ListParentsQuery {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  relationship?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get all parents with optional filtering
 */
export const getAllParents = async (query?: ListParentsQuery): Promise<ParentWithUserData[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.relationship) params.append('relationship', query.relationship);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const url = params.toString() 
      ? `${API_BASE}/parents?${params.toString()}`
      : `${API_BASE}/parents`;

    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch parents');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parents:', error);
    return [];
  }
};

/**
 * Get parent by ID with user information
 */
export const getParentById = async (id: string): Promise<ParentWithUserData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch parent');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent:', error);
    return null;
  }
};

/**
 * Get complete parent profile with associated students count
 */
export const getParentProfile = async (id: string): Promise<ParentProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}/profile`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch parent profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    return null;
  }
};

/**
 * Get parent's associated students
 */
export const getParentStudents = async (parentId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${parentId}/students`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch parent students');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return [];
  }
};

/**
 * Create new parent
 */
export const createParent = async (parentData: CreateParentData): Promise<ParentWithUserData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(parentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create parent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating parent:', error);
    throw error;
  }
};

/**
 * Update parent
 */
export const updateParent = async (id: string, parentData: UpdateParentData): Promise<ParentWithUserData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(parentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update parent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

/**
 * Delete parent
 */
export const deleteParent = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete parent');
    }

    return true;
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw error;
  }
};

/**
 * Activate parent
 */
export const activateParent = async (id: string): Promise<ParentWithUserData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}/activate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to activate parent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error activating parent:', error);
    throw error;
  }
};

/**
 * Deactivate parent
 */
export const deactivateParent = async (id: string): Promise<ParentWithUserData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parents/${id}/deactivate`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to deactivate parent';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deactivating parent:', error);
    throw error;
  }
};
