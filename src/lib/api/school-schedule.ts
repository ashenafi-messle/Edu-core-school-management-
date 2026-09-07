/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for School Schedule Settings
 * Handles school-specific schedule configuration
 */

import { api } from '../api';

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

// Types for school schedule settings
export interface SchoolScheduleSettings {
  id: string;
  school_id: string;
  academic_year_id: string;
  period_duration_minutes: number;
  number_of_periods_per_day: number;
  school_start_time: string;
  school_end_time: string;
  lunch_break_enabled: boolean;
  lunch_break_duration_minutes: number;
  lunch_break_after_period: number;
  lunch_break_start_time: string;
  additional_breaks: Array<{
    name: string;
    duration: number;
    after_period: number;
  }>;
  days_of_operation: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolScheduleSettings {
  academic_year_id: string;
  period_duration_minutes?: number;
  number_of_periods_per_day?: number;
  school_start_time?: string;
  school_end_time?: string;
  lunch_break_enabled?: boolean;
  lunch_break_duration_minutes?: number;
  lunch_break_after_period?: number;
  lunch_break_start_time?: string;
  additional_breaks?: Array<{
    name: string;
    duration: number;
    after_period: number;
  }>;
  days_of_operation?: string[];
}

/**
 * Get school schedule settings
 */
export const getSchoolScheduleSettings = async (academicYearId?: string): Promise<SchoolScheduleSettings | null> => {
  try {
    const params = academicYearId ? `?academic_year_id=${academicYearId}` : '';
    const response = await fetch(`${API_BASE}/school-schedule-settings${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      // If the table doesn't exist or other 400 error, return null instead of throwing
      const errorData = await response.json().catch(() => ({}));
      console.log('School schedule settings not available (table may not exist yet):', errorData.error);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching school schedule settings:', error);
    return null;
  }
};

/**
 * Create or update school schedule settings
 */
export const saveSchoolScheduleSettings = async (data: CreateSchoolScheduleSettings): Promise<SchoolScheduleSettings> => {
  try {
    const response = await fetch(`${API_BASE}/school-schedule-settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save school schedule settings');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving school schedule settings:', error);
    throw error;
  }
};

/**
 * Generate time slots based on school schedule settings
 */
export const generateTimeSlots = async (academicYearIdParam: string): Promise<{ message: string; timeSlots: any[] }> => {
  try {
    const response = await fetch(`${API_BASE}/timetable/generate-time-slots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ academic_year_id: academicYearIdParam })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate time slots');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating time slots:', error);
    throw error;
  }
};
