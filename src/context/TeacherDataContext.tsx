/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TeacherData {
  dashboard: any;
  classes: any;
  students: any;
  attendance: any;
  curriculum: any;
  assignments: any;
  exams: any;
  communications: any;
  schedule: any;
}

interface TeacherDataContextType {
  data: TeacherData;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  refreshData: (key: keyof TeacherData) => Promise<void>;
  refreshAllData: () => Promise<void>;
  isDataLoaded: (key: keyof TeacherData) => boolean;
  updateDataOptimistically: (key: keyof TeacherData, newData: any) => void;
}

const TeacherDataContext = createContext<TeacherDataContextType | undefined>(undefined);

const initialData: TeacherData = {
  dashboard: null,
  classes: null,
  students: null,
  attendance: null,
  curriculum: null,
  assignments: null,
  exams: null,
  communications: null,
  schedule: null,
};

const initialLoading: Record<string, boolean> = {
  dashboard: false,
  classes: false,
  students: false,
  attendance: false,
  curriculum: false,
  assignments: false,
  exams: false,
  communications: false,
  schedule: false,
};

const initialError: Record<string, string | null> = {
  dashboard: null,
  classes: null,
  students: null,
  attendance: null,
  curriculum: null,
  assignments: null,
  exams: null,
  communications: null,
  schedule: null,
};

interface TeacherDataProviderProps {
  teacherId: string;
  schoolId: string;
  children: ReactNode;
}

export const TeacherDataProvider: React.FC<TeacherDataProviderProps> = ({ 
  teacherId, 
  schoolId, 
  children 
}) => {
  const [data, setData] = useState<TeacherData>(initialData);
  const [loading, setLoading] = useState<Record<string, boolean>>(initialLoading);
  const [error, setError] = useState<Record<string, string | null>>(initialError);

  const fetchSingleData = async (key: keyof TeacherData, endpoint: string) => {
    if (!teacherId || !schoolId) return;

    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: null }));

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'X-School-ID': schoolId,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch ${key}`);
      }

      const result = await response.json();
      setData(prev => ({ ...prev, [key]: result }));
      setError(prev => ({ ...prev, [key]: null }));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setError(prev => ({ 
        ...prev, 
        [key]: err instanceof Error ? err.message : `Failed to load ${key}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const refreshData = async (key: keyof TeacherData) => {
    const endpoints: Record<string, string> = {
      dashboard: `/api/teachers/${teacherId}/dashboard`,
      classes: `/api/teachers/${teacherId}/classes`,
      students: `/api/teachers/${teacherId}/students`,
      attendance: `/api/teachers/${teacherId}/attendance/classes`,
      curriculum: `/api/teachers/${teacherId}/curriculum/documents`,
      assignments: `/api/teachers/${teacherId}/class-assignments`,
      exams: `/api/teachers/${teacherId}/evaluations`,
      communications: `/api/teachers/${teacherId}/class-posts`,
      schedule: `/api/teachers/${teacherId}/classes`,
    };

    await fetchSingleData(key, endpoints[key]);
  };

  const refreshAllData = async () => {
    const keys = Object.keys(data) as (keyof TeacherData)[];
    await Promise.all(keys.map(key => refreshData(key)));
  };

  const isDataLoaded = (key: keyof TeacherData): boolean => {
    return data[key] !== null;
  };

  // Pre-fetch commonly used data on mount
  useEffect(() => {
    if (teacherId && schoolId) {
      // Pre-fetch dashboard and classes data immediately
      refreshData('dashboard');
      refreshData('classes');
    }
  }, [teacherId, schoolId]);

  const value: TeacherDataContextType = {
    data,
    loading,
    error,
    refreshData,
    refreshAllData,
    isDataLoaded,
  };

  return (
    <TeacherDataContext.Provider value={value}>
      {children}
    </TeacherDataContext.Provider>
  );
};

export const useTeacherData = (): TeacherDataContextType => {
  const context = useContext(TeacherDataContext);
  if (context === undefined) {
    throw new Error('useTeacherData must be used within a TeacherDataProvider');
  }
  return context;
};