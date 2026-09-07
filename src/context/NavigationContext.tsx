/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageRoute, UserRole, UserCredential } from '../types';
import { MOCK_CREDENTIALS } from '../data';
import { api } from '../lib/api';

interface NavigationContextType {
  currentPage: PageRoute;
  currentRole: UserRole | null;
  currentUser: UserCredential | null;
  currentUserId?: string;
  theme: 'light' | 'dark';
  profileSettingsView: 'profile' | 'preferences' | null;
  navigateTo: (page: PageRoute, role?: UserRole | null) => void;
  toggleTheme: () => void;
  logout: () => void;
  login: (user: UserCredential) => void;
  setProfileSettingsView: (view: 'profile' | 'preferences' | null) => void;
  updateUserProfile: (updates: Partial<UserCredential>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

function getStoredUsers() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('user_data');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
  }
  return {};
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserCredential | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileSettingsView, setProfileSettingsView] = useState<'profile' | 'preferences' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Use requestIdleCallback for non-critical cleanup operations
    const cleanupTask = () => {
      try {
        const session = localStorage.getItem('educore-user-session');
        if (session) {
          const parsed = JSON.parse(session);
          if (typeof parsed.avatar === 'string' && parsed.avatar.startsWith('data:')) {
            delete parsed.avatar;
            localStorage.removeItem('educore-user-session');
            localStorage.setItem('educore-user-session', JSON.stringify(parsed));
          }
        }

        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const sourceUser = parsed.user || parsed;
          if (sourceUser?.id || sourceUser?.user?.id) {
            const account = sourceUser.user || sourceUser;
            const compactUser = {
              user: {
                id: account.id,
                school_id: account.school_id,
                email: account.email,
                full_name: account.full_name,
                role: account.role,
                phone: account.phone,
              },
            };
            localStorage.removeItem('user_data');
            localStorage.setItem('user_data', JSON.stringify(compactUser));
          }
        }
      } catch (error) {
        console.warn('Unable to clean persisted session data:', error);
      }
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(cleanupTask);
    } else {
      setTimeout(cleanupTask, 0);
    }
  }, []);

  // Theme management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Apply theme to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      return newTheme;
    });
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole(null);
    setCurrentPage('home');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('educore-user-session');
      localStorage.removeItem('user_data');
      localStorage.removeItem('school_data');
    }
  }, []);

  // Login function
  const login = useCallback((user: UserCredential) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setCurrentPage('dashboard');
    if (typeof window !== 'undefined') {
      const persistedUser = { ...user };
      if (typeof persistedUser.avatar === 'string' && persistedUser.avatar.startsWith('data:')) {
        persistedUser.avatar = '';
      }
      try {
        localStorage.setItem('educore-user-session', JSON.stringify(persistedUser));
      } catch (error) {
          localStorage.removeItem('educore-user-session');
        console.warn('Unable to persist user session locally:', error);
      }
      // Restore school ID from school_data if available
      const schoolData = localStorage.getItem('school_data');
      if (schoolData && schoolData !== 'undefined') {
        try {
          const school = JSON.parse(schoolData);
          api.setSchoolId(school.id);
        } catch (e) {
          console.warn('Failed to restore school ID during login:', e);
        }
      }
      window.location.hash = `#/dashboard/${user.role}`;
    }
  }, []);

  // Update user profile function
  const updateUserProfile = useCallback((updates: Partial<UserCredential>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        const persisted = { ...updated };
        if (typeof persisted.avatar === 'string' && persisted.avatar.startsWith('data:')) {
          persisted.avatar = prev.avatar && !prev.avatar.startsWith('data:') ? prev.avatar : '';
        }
        try {
          localStorage.setItem('educore-user-session', JSON.stringify(persisted));
        } catch (error) {
          localStorage.removeItem('educore-user-session');
          console.warn('Unable to persist user session locally:', error);
        }
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    // Parse URL hash for deep linking
    const handleHashChange = async () => {
      const hash = window.location.hash;
      
      const savedSession = localStorage.getItem('educore-user-session');
      let sessionUser: UserCredential | null = null;
      if (savedSession) {
        try {
          sessionUser = JSON.parse(savedSession);
        } catch (e) {}
      }

      if (hash.startsWith('#/dashboard/')) {
        const role = hash.replace('#/dashboard/', '') as UserRole;
        if (sessionUser && sessionUser.role === role) {
          setCurrentPage('dashboard');
          setCurrentRole(role);
          
          // Restore school ID from localStorage
          const schoolData = localStorage.getItem('school_data');
          if (schoolData && schoolData !== 'undefined') {
            try {
              const school = JSON.parse(schoolData);
              api.setSchoolId(school.id);
            } catch (e) {
              console.warn('Failed to restore school ID:', e);
            }
          }
          
          // Render from the local session immediately. Profile refresh is non-blocking.
          setCurrentUser(sessionUser);
          void (async () => {
            try {
              let persistedAvatar: string | undefined;
              if (api.getSchoolId()) {
                const users = await api.getUsers();
                const dbUser = users.find((u: any) => u.email === sessionUser?.email);
                persistedAvatar = dbUser?.profile_picture_url;
              }
              if (sessionUser?.role === 'teacher' && sessionUser.id) {
                const teacherResponse = await fetch(`/api/teachers/${sessionUser.id}`, {
                  headers: { 'X-School-ID': sessionUser.schoolId || api.getSchoolId() || '' },
                  cache: 'no-store'
                });
                if (teacherResponse.ok) {
                  const teacher = await teacherResponse.json();
                  persistedAvatar = teacher.photo || persistedAvatar;
                }
              }
              if (persistedAvatar && sessionUser) {
                const refreshedSession = { ...sessionUser, avatar: persistedAvatar };
                localStorage.setItem('educore-user-session', JSON.stringify(refreshedSession));
                setCurrentUser(refreshedSession);
              }
            } catch (error) {
              console.warn('Failed to refresh profile data:', error);
            }
          })();
        } else {
          // If no session matching, try fallback from MOCK_CREDENTIALS for local ease
          const db = getStoredUsers();
          if (db[role]) {
            setCurrentPage('dashboard');
            setCurrentRole(role);
            setCurrentUser(db[role]);
          } else {
            setCurrentPage('login');
            setCurrentRole(null);
          }
        }
      } else if (hash === '#/login') {
        setCurrentPage('login');
        setCurrentRole(null);
      } else if (hash === '#/forgot-password') {
        setCurrentPage('forgot-password');
        setCurrentRole(null);
      } else if (hash.startsWith('#/reset-password')) {
        setCurrentPage('reset-password');
        setCurrentRole(null);
      } else if (hash === '#/about') {
        setCurrentPage('about');
        setCurrentRole(null);
      } else if (hash === '#/contact') {
        setCurrentPage('contact');
        setCurrentRole(null);
      } else if (hash === '#/registration') {
        setCurrentPage('registration');
        setCurrentRole(null);
      } else if (hash === '#/registration-status') {
        setCurrentPage('registration-status');
        setCurrentRole(null);
      } else {
        console.log('Defaulting to home page, hash:', hash); // Debug log
        setCurrentPage('home');
        setCurrentRole(null);
      }
    };

    console.log('NavigationContext mounted'); // Debug log
    console.log('Initial hash:', window.location.hash); // Debug log
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((page: PageRoute, role: UserRole | null = null) => {
    // Use React.startTransition for non-urgent state updates
    setCurrentPage(page);
    setCurrentRole(role);
    setProfileSettingsView(null);

    if (page === 'dashboard' && role) {
      let sessionUser: UserCredential | null = null;
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem('educore-user-session');
        if (savedSession) {
          try {
            sessionUser = JSON.parse(savedSession);
          } catch (e) {}
        }
      }
      if (sessionUser && sessionUser.role === role) {
        setCurrentUser(sessionUser);
      } else {
        const db = getStoredUsers();
        setCurrentUser(db[role] || null);
      }
      if (typeof window !== 'undefined') {
        window.location.hash = `#/dashboard/${role}`;
      }
    } else if (page === 'home') {
      if (typeof window !== 'undefined') {
        window.location.hash = '';
      }
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#/${page}`;
    }

    // Keep navigation immediate; smooth scrolling is intentionally disabled here
    // because it can make a completed route change look delayed on long pages.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const value: NavigationContextType = {
    currentPage,
    currentRole,
    currentUser,
    currentUserId,
    theme,
    profileSettingsView,
    navigateTo,
    toggleTheme,
    logout,
    login,
    setProfileSettingsView,
    updateUserProfile,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
