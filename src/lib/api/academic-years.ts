/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Academic Years
 * Handles all academic year-related API calls to the backend
 */

import { AcademicYear } from '../components/workspaces/director/types';
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

/**
 * Get the current active academic year for a school
 */
export const getCurrentAcademicYear = async (): Promise<AcademicYear | null> => {
  try {
    const response = await fetch(`${API_BASE}/academic-years/current`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No academic year configured
      }
      throw new Error('Failed to fetch current academic year');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current academic year:', error);
    return null;
  }
};