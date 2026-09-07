/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Bulk Timetable Operations
 * Handles creating weekly timetables in bulk
 */

// Types for bulk timetable creation
export interface WeekConfiguration {
  days: string[];
  periodsPerDay: number;
  periodDuration: number;
  lunchBreakEnabled: boolean;
  lunchBreakAfterPeriod: number;
  lunchBreakDuration: number;
  schoolStartTime: string;
  schoolEndTime: string;
}

export interface TimetableEntry {
  day_of_week: string;
  period: number;
  subject_id: string;
  teacher_id?: string; // Make optional
  room_number: string;
}

export interface CreateBulkTimetableRequest {
  section_configuration_id: string;
  academic_year_id: string;
  week_configuration: WeekConfiguration;
  entries: TimetableEntry[];
}

export interface BulkTimetableResponse {
  success: boolean;
  message: string;
  entries: any[];
  settings: WeekConfiguration;
}

/**
 * Create bulk timetable entries for a section
 */
export const createBulkTimetable = async (
  data: CreateBulkTimetableRequest
): Promise<BulkTimetableResponse> => {
  try {
    const response = await fetch('/api/timetable/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bulk timetable');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating bulk timetable:', error);
    throw error;
  }
};
