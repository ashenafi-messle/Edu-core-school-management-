/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Parent Feedback Management
 * Handles all parent feedback and resolution API calls
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

// Feedback interfaces matching backend DTOs
export interface CreateFeedbackData {
  parent_id?: string;
  student_id?: string;
  parent_name: string;
  student_name: string;
  type: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  subject?: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateFeedbackData {
  type?: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  subject?: string;
  message?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

export interface ResolveFeedbackData {
  response: string;
  resolved_by?: string;
}

export interface FeedbackProfileData {
  id: string;
  school_id: string;
  parent_id?: string;
  student_id?: string;
  parent_name: string;
  student_name: string;
  type: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  subject?: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ListFeedbackQuery {
  search?: string;
  type?: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  parent_id?: string;
  student_id?: string;
  limit?: number;
  offset?: number;
}

export interface FeedbackStatistics {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_type: {
    complaint: number;
    suggestion: number;
    enquiry: number;
    compliment: number;
  };
  by_priority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
}

/**
 * Get all feedback with optional filtering
 */
export const getAllFeedback = async (query?: ListFeedbackQuery): Promise<FeedbackProfileData[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.parent_id) params.append('parent_id', query.parent_id);
    if (query?.student_id) params.append('student_id', query.student_id);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const url = params.toString() 
      ? `${API_BASE}/parent-feedback?${params.toString()}`
      : `${API_BASE}/parent-feedback`;

    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (id: string): Promise<FeedbackProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }
};

/**
 * Create new feedback
 */
export const createFeedback = async (feedbackData: CreateFeedbackData): Promise<FeedbackProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create feedback');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

/**
 * Update feedback
 */
export const updateFeedback = async (id: string, feedbackData: UpdateFeedbackData): Promise<FeedbackProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update feedback');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete feedback');
    }

    return true;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

/**
 * Resolve feedback with response
 */
export const resolveFeedback = async (id: string, resolveData: ResolveFeedbackData): Promise<FeedbackProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resolveData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resolve feedback');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resolving feedback:', error);
    throw error;
  }
};

/**
 * Update feedback status
 */
export const updateFeedbackStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed'): Promise<FeedbackProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update feedback status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw error;
  }
};

/**
 * Get feedback statistics
 */
export const getFeedbackStatistics = async (): Promise<FeedbackStatistics> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/statistics`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    return {
      total: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      by_type: {
        complaint: 0,
        suggestion: 0,
        enquiry: 0,
        compliment: 0
      },
      by_priority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0
      }
    };
  }
};

/**
 * Get feedback by parent
 */
export const getFeedbackByParent = async (parentId: string): Promise<FeedbackProfileData[]> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/by-parent/${parentId}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback by parent');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feedback by parent:', error);
    return [];
  }
};

/**
 * Get feedback by student
 */
export const getFeedbackByStudent = async (studentId: string): Promise<FeedbackProfileData[]> => {
  try {
    const response = await fetch(`${API_BASE}/parent-feedback/by-student/${studentId}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback by student');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feedback by student:', error);
    return [];
  }
};