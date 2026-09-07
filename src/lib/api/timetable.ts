/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Timetable Management
 * Handles all timetable-related API calls to the backend
 */

import { api } from '../api';

const API_BASE = '/api/timetable';

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

// Types for timetable data
export interface TimeSlot {
  id: string;
  school_id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  break_time: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyTimetable {
  id: string;
  school_id: string;
  academic_year_id: string;
  section_configuration_id: string;
  day_of_week: string;
  time_slot_id: string;
  subject_id: string;
  teacher_id: string;
  room_number?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  time_slot?: TimeSlot;
  subject?: {
    id: string;
    subject_code: string;
    subject_name: string;
    category: string;
  };
  teacher?: {
    id: string;
    full_name: string;
    email: string;
    department: string;
  };
  section_configuration?: {
    id: string;
    grade_level: string;
    section_name: string;
  };
}

export interface CreateTimeSlotData {
  slot_name: string;
  start_time: string;
  end_time: string;
  break_time?: boolean;
  order_index?: number;
}

export interface CreateWeeklyTimetableData {
  academic_year_id: string;
  section_configuration_id: string;
  day_of_week: string;
  time_slot_id: string;
  subject_id: string;
  teacher_id: string;
  room_number?: string;
  notes?: string;
}

export interface UpdateWeeklyTimetableData {
  day_of_week?: string;
  time_slot_id?: string;
  subject_id?: string;
  teacher_id?: string;
  room_number?: string;
  notes?: string;
  is_active?: boolean;
}

export interface TimetableFilters {
  academic_year_id?: string;
  section_configuration_id?: string;
  day_of_week?: string;
  teacher_id?: string;
}

/**
 * Get all time slots
 */
export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  try {
    const response = await fetch(`${API_BASE}/time-slots`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch time slots');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }
};

/**
 * Create a new time slot
 */
export const createTimeSlot = async (data: CreateTimeSlotData): Promise<TimeSlot> => {
  try {
    const response = await fetch(`${API_BASE}/time-slots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create time slot');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
};

/**
 * Get weekly timetable entries
 */
export const getWeeklyTimetable = async (filters?: TimetableFilters): Promise<WeeklyTimetable[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.academic_year_id) params.append('academic_year_id', filters.academic_year_id);
    if (filters?.section_configuration_id) params.append('section_configuration_id', filters.section_configuration_id);
    if (filters?.day_of_week) params.append('day_of_week', filters.day_of_week);
    if (filters?.teacher_id) params.append('teacher_id', filters.teacher_id);

    const url = `${API_BASE}/weekly${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weekly timetable');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weekly timetable:', error);
    return [];
  }
};

/**
 * Create a weekly timetable entry
 */
export const createWeeklyTimetableEntry = async (data: CreateWeeklyTimetableData): Promise<WeeklyTimetable> => {
  try {
    const response = await fetch(`${API_BASE}/weekly`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create weekly timetable entry');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating weekly timetable entry:', error);
    throw error;
  }
};

/**
 * Update a weekly timetable entry
 */
export const updateWeeklyTimetableEntry = async (id: string, data: UpdateWeeklyTimetableData): Promise<WeeklyTimetable> => {
  try {
    const response = await fetch(`${API_BASE}/weekly/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update weekly timetable entry');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating weekly timetable entry:', error);
    throw error;
  }
};

/**
 * Delete a weekly timetable entry
 */
export const deleteWeeklyTimetableEntry = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/weekly/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete weekly timetable entry');
    }
  } catch (error) {
    console.error('Error deleting weekly timetable entry:', error);
    throw error;
  }
};

/**
 * Get timetable for a specific section (convenience function)
 */
export const getSectionTimetable = async (sectionConfigurationId: string, academicYearId?: string): Promise<WeeklyTimetable[]> => {
  return getWeeklyTimetable({ section_configuration_id: sectionConfigurationId, academic_year_id: academicYearId });
};

/**
 * Get timetable for a specific teacher (convenience function)
 */
export const getTeacherTimetable = async (teacherId: string, academicYearId?: string): Promise<WeeklyTimetable[]> => {
  return getWeeklyTimetable({ teacher_id: teacherId, academic_year_id: academicYearId });
};
