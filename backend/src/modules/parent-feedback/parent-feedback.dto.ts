/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DTOs for Parent Feedback Management
 * Defines data transfer objects for parent feedback and resolution operations
 */

// Base Feedback DTOs
export interface CreateFeedbackDto {
  parent_id?: string;
  student_id?: string;
  parent_name: string;
  student_name: string;
  type: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  subject?: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateFeedbackDto {
  type?: 'complaint' | 'suggestion' | 'enquiry' | 'compliment';
  subject?: string;
  message?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

export interface ResolveFeedbackDto {
  response: string;
  resolved_by?: string;
}

export interface FeedbackProfileDto {
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
