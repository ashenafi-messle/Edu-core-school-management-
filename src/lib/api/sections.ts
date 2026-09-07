/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Service for Section Configurations
 * Handles all section-related API calls to the backend
 */

import { SectionConfiguration } from '../components/workspaces/director/types';
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
 * Get section configurations for a school
 */
export const getSectionConfigurations = async (academicYear?: string, gradeLevel?: string): Promise<SectionConfiguration[]> => {
  try {
    let url = `${API_BASE}/sections/configurations`;
    const params = new URLSearchParams();
    
    if (academicYear) params.append('academicYear', academicYear);
    if (gradeLevel) params.append('gradeLevel', gradeLevel);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch section configurations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching section configurations:', error);
    return [];
  }
};