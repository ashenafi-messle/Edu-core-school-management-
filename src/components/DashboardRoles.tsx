/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useNavigation } from '../context/NavigationContext';
import { AppShell } from './layout/AppShell';
import { UserRole } from '../types';

const WorkspaceLoading = () => (
  <div className="flex min-h-[16rem] items-center justify-center text-sm text-slate-500">
    Loading workspace...
  </div>
);

// Role workspaces are independent. Keeping them in separate chunks prevents an
// administrator's, teacher's, student's, and parent's UI from downloading at once.
const DirectorWorkspace = dynamic(() => import('./workspaces/DirectorWorkspace').then((module) => module.DirectorWorkspace), { ssr: false, loading: WorkspaceLoading });
const AdminWorkspace = dynamic(() => import('./workspaces/AdminWorkspace').then((module) => module.AdminWorkspace), { ssr: false, loading: WorkspaceLoading });
const TeacherWorkspace = dynamic(() => import('./workspaces/TeacherWorkspace').then((module) => module.TeacherWorkspace), { ssr: false, loading: WorkspaceLoading });
const StudentWorkspace = dynamic(() => import('./workspaces/StudentWorkspace').then((module) => module.StudentWorkspace), { ssr: false, loading: WorkspaceLoading });
const ParentWorkspace = dynamic(() => import('./workspaces/ParentWorkspace').then((module) => module.ParentWorkspace), { ssr: false, loading: WorkspaceLoading });
const ProfilePreferencesWorkspace = dynamic(() => import('./workspaces/ProfilePreferencesWorkspace').then((module) => module.ProfilePreferencesWorkspace), { ssr: false, loading: WorkspaceLoading });

export const DashboardRoles: React.FC = () => {
  const { currentUser, currentUserId, profileSettingsView, setProfileSettingsView } = useNavigation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState<string | undefined>(undefined);

  // If the user logs out or switches roles, reset back to dashboard default
  useEffect(() => {
    setActiveItem('dashboard');
    setActiveSubItem(undefined);
  }, [currentUser?.role, currentUser?.id]); // Added id to prevent unnecessary resets

  if (!currentUser) return null;

  const role = currentUser.role as UserRole;

  // Derive human-readable labels for breadcrumbs & header
  const getActiveLabels = () => {
    if (profileSettingsView === 'profile') {
      return { label: 'My Profile details', parent: 'Account Settings' };
    }
    if (profileSettingsView === 'preferences') {
      return { label: 'Secure preferences', parent: 'Account Settings' };
    }
    switch (role) {
      case 'director':
        switch (activeItem) {
          case 'dashboard': return { label: 'Director Dashboard', parent: undefined };
          case 'academics':
            return { 
              label: activeSubItem === 'courses' ? 'Courses Catalog' : 
                     activeSubItem === 'grades' ? 'Grade Levels' :
                     activeSubItem === 'sections' ? 'Sections & Divisions' : 
                     activeSubItem === 'schedule' ? 'Weekly Timetable Builder' : 'Academic Management',
              parent: 'Academics' 
            };
          case 'students': return { label: 'Student Management', parent: undefined };
          case 'teachers': return { label: 'Teacher Directory', parent: undefined };
          case 'teacher_attendance_performance': return { label: 'Teacher Attendance & Performance', parent: undefined };
          case 'parents': return { label: 'Parent & Guardian Directory', parent: undefined };
          case 'announcements': return { label: 'Bulletin Announcements', parent: undefined };
          case 'reports': return { label: 'Executive Analytical Reports', parent: undefined };
          case 'profile': return { label: 'Director Profile', parent: undefined };
          case 'settings': return { label: 'Institutional Configurations', parent: undefined };
          default: return { label: activeItem, parent: undefined };
        }

      case 'admin':
        switch (activeItem) {
          case 'dashboard': return { label: 'System Dashboard Overview', parent: undefined };
          case 'users': return { label: 'User Directory & Account Manager', parent: undefined };
          case 'registration': return { label: 'Online Admissions & Registrations', parent: undefined };
          case 'readmission': return { label: 'Student Re-Admission Manager', parent: undefined };
          case 'payments': return { label: 'Payment Ledger & Fee Desk', parent: undefined };
          case 'permissions': return { label: 'Role Manager & Permission Matrix', parent: undefined };
          case 'school_config': return { label: 'School Configuration & Identity', parent: undefined };
          case 'academic_years': return { label: 'Academic Year & Terms Management', parent: undefined };
          case 'grade_section_config': return { label: 'Grade Levels & Sections Builder', parent: undefined };
          case 'notifications': return { label: 'Notification Dispatcher & Templates', parent: undefined };
          case 'audit_logs': return { label: 'Global Audit Trails & IP Logs', parent: undefined };
          case 'security': return { label: 'System Security & Access Controls', parent: undefined };
          case 'monitoring': return { label: 'Live Server Diagnostics & Telemetry', parent: undefined };
          case 'backups': return { label: 'Disaster Recovery & DB Backups', parent: undefined };
          case 'support': return { label: 'Central Support Ticket Triage', parent: undefined };
          case 'settings': return { label: 'System Variables & Localization', parent: undefined };
          case 'profile': return { label: 'Administrator Personal Profile', parent: undefined };
          default: return { label: activeItem, parent: undefined };
        }

      case 'teacher':
        switch (activeItem) {
          case 'dashboard': return { label: 'Instructor Hub', parent: undefined };
          case 'my_classes': return { label: 'My Classes & Divisions', parent: undefined };
          case 'students': return { label: 'Student Rosters', parent: undefined };
          case 'attendance': return { label: 'Record Attendance', parent: undefined };
          case 'curriculum': return { label: 'Teaching Resources', parent: undefined };
          case 'assignments': return { label: 'Assignments & Grader', parent: undefined };
          case 'gradebook': return { label: 'Gradebook & Exams', parent: undefined };
          case 'reports': return { label: 'Performance Reports', parent: undefined };
          case 'messages': return { label: 'Communications', parent: undefined };
          case 'calendar': return { label: 'My Schedule', parent: undefined };
          case 'settings': return { label: 'Classroom Settings', parent: undefined };
          default: return { label: activeItem, parent: undefined };
        }

      case 'student':
        switch (activeItem) {
          case 'dashboard': return { label: 'Student Dashboard', parent: undefined };
          case 'profile': return { label: 'My Profile', parent: undefined };
          case 'academic_progress': return { label: 'Academic Progress', parent: undefined };
          case 'attendance': return { label: 'Attendance Records', parent: undefined };
          case 'courses': return { label: 'My Courses', parent: undefined };
          case 'assignments': return { label: 'Assignments', parent: undefined };
          case 'homework': return { label: 'Homework Desk', parent: undefined };
          case 'examinations': return { label: 'Examinations Portal', parent: undefined };
          case 'learning_resources': return { label: 'Learning Resources', parent: undefined };
          case 'downloads': return { label: 'Download Center', parent: undefined };
          case 'announcements': return { label: 'Announcements Board', parent: undefined };
          case 'teacher_ratings': return { label: 'Teacher Ratings & Evaluations', parent: undefined };
          case 'feedback': return { label: 'Student Feedback Board', parent: undefined };
          case 'readmission': return { label: 'Online Readmission', parent: undefined };
          case 'messages': return { label: 'Messages Desk', parent: undefined };
          case 'calendar': return { label: 'Academic Calendar', parent: undefined };
          case 'settings': return { label: 'Portal Settings', parent: undefined };
          default: return { label: activeItem, parent: undefined };
        }

      case 'parent':
        switch (activeItem) {
          case 'dashboard': return { label: 'Parent Dashboard', parent: undefined };
          case 'children': return { label: 'My Enrolled Children', parent: undefined };
          case 'progress': return { label: 'Academic Progress Summary', parent: undefined };
          case 'attendance': return { label: 'Child Attendance Tracker', parent: undefined };
          case 'behavior': return { label: 'Behavioral & Conduct Evaluation', parent: undefined };
          case 'subject_marks': return { label: 'Term Subject Marks', parent: undefined };
          case 'payments': return { label: 'School Payment & Tuition Desk', parent: undefined };
          case 'registration': return { label: 'Next Term Child Re-Registration', parent: undefined };
          case 'announcements': return { label: 'Institutional Bulletin Board', parent: undefined };
          case 'teacher_communication': return { label: 'Teacher Secure Hotline', parent: undefined };
          case 'feedback': return { label: 'Parent Feedback Console', parent: undefined };
          case 'downloads': return { label: 'Official Document Download Center', parent: undefined };
          case 'calendar': return { label: 'Academic & Activities Calendar', parent: undefined };
          case 'profile': return { label: 'Guardian Personal Profile', parent: undefined };
          case 'settings': return { label: 'Guardian Account Configurations', parent: undefined };
          default: return { label: activeItem, parent: undefined };
        }

      default:
        return { label: activeItem, parent: undefined };
    }
  };

  const { label, parent } = getActiveLabels();

  const handleSelect = (itemId: string, subItemId?: string) => {
    setProfileSettingsView(null);
    setActiveItem(itemId);
    setActiveSubItem(subItemId);
  };

  return (
    <AppShell
      role={role}
      activeItem={activeItem}
      activeSubItem={activeSubItem}
      activeItemLabel={label}
      activeItemParent={parent}
      onSelect={handleSelect}
    >
      {profileSettingsView ? (
        <ProfilePreferencesWorkspace />
      ) : (
        <>
          {role === 'director' && (
            <DirectorWorkspace activeItem={activeItem} activeSubItem={activeSubItem} />
          )}
          {role === 'admin' && (
            <AdminWorkspace activeItem={activeItem} activeSubItem={activeSubItem} />
          )}
          {role === 'teacher' && (
            <TeacherWorkspace activeItem={activeItem} activeSubItem={activeSubItem} />
          )}
          {role === 'student' && (
            <StudentWorkspace 
              activeItem={activeItem} 
              activeSubItem={activeSubItem} 
              studentId={currentUserId || currentUser.id}
              schoolId={currentUser.schoolId}
            />
          )}
          {role === 'parent' && (
            <ParentWorkspace activeItem={activeItem} activeSubItem={activeSubItem} />
          )}
        </>
      )}
    </AppShell>
  );
};
