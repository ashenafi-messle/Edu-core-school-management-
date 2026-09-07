/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Announcement Management
 * Defines data transfer objects for announcement operations
 */

// Base Announcement DTOs
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type?: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  expires_at?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: 'general' | 'urgent' | 'event' | 'academic' | 'administrative';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  target_audience?: 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade';
  target_grade_id?: string;
  expires_at?: string;
}

export interface PublishAnnouncementDto {
  published_by?: string;
}

export interface AnnouncementProfileDto {
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
