/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Announcement Management
 * Handles all announcement API calls
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

// Announcement interfaces matching backend DTOs
export interface CreateAnnouncementData {
  title: string;
  content: string;
  type?: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  expires_at?: string;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  type?: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  expires_at?: string;
}

export interface PublishAnnouncementData {
  published_by?: string;
}

export interface AnnouncementProfileData {
  id: string;
  school_id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  target_audience: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  published_by?: string;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ListAnnouncementsQuery {
  search?: string;
  type?: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  target_audience?: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  published_by?: string;
  limit?: number;
  offset?: number;
}

export interface AnnouncementStatistics {
  total: number;
  draft: number;
  published: number;
  archived: number;
  by_type: {
    general: number;
    urgent: number;
    event: number;
    academic: number;
    administrative: number;
  };
  by_priority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
  by_audience: {
    all: number;
    teachers: number;
    parents: number;
    students: number;
    specific_grade: number;
  };
}

/**
 * Get all announcements with optional filtering
 */
export const getAllAnnouncements = async (query?: ListAnnouncementsQuery): Promise<AnnouncementProfileData[]> => {
  try {
    const params = new URLSearchParams();
    
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.target_audience) params.append('target_audience', query.target_audience);
    if (query?.target_grade_id) params.append('target_grade_id', query.target_grade_id);
    if (query?.published_by) params.append('published_by', query.published_by);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const url = params.toString() 
      ? `${API_BASE}/announcements?${params.toString()}`
      : `${API_BASE}/announcements`;

    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (id: string): Promise<AnnouncementProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcement');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
};

/**
 * Create new announcement
 */
export const createAnnouncement = async (announcementData: CreateAnnouncementData): Promise<AnnouncementProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(announcementData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create announcement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Update announcement
 */
export const updateAnnouncement = async (id: string, announcementData: UpdateAnnouncementData): Promise<AnnouncementProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(announcementData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update announcement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete announcement');
    }

    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

/**
 * Publish announcement
 */
export const publishAnnouncement = async (id: string, publishData: PublishAnnouncementData): Promise<AnnouncementProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/${id}/publish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(publishData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish announcement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error publishing announcement:', error);
    throw error;
  }
};

/**
 * Archive announcement
 */
export const archiveAnnouncement = async (id: string): Promise<AnnouncementProfileData | null> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/${id}/archive`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to archive announcement');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error archiving announcement:', error);
    throw error;
  }
};

/**
 * Get announcement statistics
 */
export const getAnnouncementStatistics = async (): Promise<AnnouncementStatistics> => {
  try {
    const response = await fetch(`${API_BASE}/announcements/statistics`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch announcement statistics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching announcement statistics:', error);
    return {
      total: 0,
      draft: 0,
      published: 0,
      archived: 0,
      by_type: {
        general: 0,
        urgent: 0,
        event: 0,
        academic: 0,
        administrative: 0
      },
      by_priority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0
      },
      by_audience: {
        all: 0,
        teachers: 0,
        parents: 0,
        students: 0,
        specific_grade: 0
      }
    };
  }
};

/**
 * Get published announcements for specific audience
 */
export const getPublishedAnnouncements = async (audience: string, gradeId?: string): Promise<AnnouncementProfileData[]> => {
  try {
    const params = new URLSearchParams();
    if (gradeId) params.append('gradeId', gradeId);

    const url = params.toString() 
      ? `${API_BASE}/announcements/published/${audience}?${params.toString()}`
      : `${API_BASE}/announcements/published/${audience}`;

    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch published announcements');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching published announcements:', error);
    return [];
  }
};
