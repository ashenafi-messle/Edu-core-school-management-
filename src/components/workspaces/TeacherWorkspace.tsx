/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { api } from '../../lib/api';
import { useNavigation } from '../../context/NavigationContext';
import { TeacherDataProvider } from '../../context/TeacherDataContext';
import { ClassesAndDivisions } from './teacher/ClassesAndDivisions';
import { StudentRoster } from './teacher/StudentRoster';
import { AttendanceRecord } from './teacher/AttendanceRecord';
import { CurriculumManagement } from './teacher/CurriculumManagement';
import { ExamManagement } from './teacher/ExamManagement';
import { TeacherAssessmentsView } from './teacher/TeacherAssessmentsView';
import { TeacherCommunications } from './teacher/TeacherCommunications';
import { TeacherSchedule } from './teacher/TeacherSchedule';
import { TeacherDashboard } from './teacher/TeacherDashboard';

interface TeacherWorkspaceProps {
  activeItem: string;
  activeSubItem?: string;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({ activeItem, activeSubItem }) => {
  const { currentUser } = useNavigation();
  
  // --- TEACHER AUTHENTICATION DATA ---
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('');

  // Set teacher and school IDs from authenticated user
  useEffect(() => {
    if (currentUser) {
      setCurrentTeacherId(currentUser.id || '');
      // Get school ID from API client or user data
      const schoolId = currentUser.schoolId || api.getSchoolId();
      if (schoolId) {
        setCurrentSchoolId(schoolId);
        api.setSchoolId(schoolId);
      }
    }
  }, [currentUser]);

  // Render different workspaces based on activeItem
  const renderWorkspace = () => {
    switch (activeItem) {
      case 'dashboard':
        return <TeacherDashboard teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'my_classes':
        return <ClassesAndDivisions teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'students':
        return <StudentRoster teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'attendance':
        return <AttendanceRecord teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'curriculum':
        return <CurriculumManagement teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'assignments':
        return <TeacherAssessmentsView teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'gradebook':
        return <TeacherAssessmentsView teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'exams':
        return <ExamManagement teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'messages':
        return <TeacherCommunications teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      case 'calendar':
        return <TeacherSchedule teacherId={currentTeacherId} schoolId={currentSchoolId} />;
      default:
        return <div className="p-8 text-center text-slate-500">Workspace not found</div>;
    }
  };

  return (
    <TeacherDataProvider teacherId={currentTeacherId} schoolId={currentSchoolId}>
      <PageContainer
        title={
          activeItem === 'my_classes' ? 'Classes & Divisions' :
          activeItem === 'students' ? 'Student Rosters & Alert Dispatcher' :
          activeItem === 'attendance' ? 'Daily Attendance Registers' :
          activeItem === 'curriculum' ? 'Teaching Resources & Curriculum' :
          activeItem === 'assignments' ? 'Assignments & Grader' :
          activeItem === 'gradebook' ? 'Gradebook & Exams' :
          activeItem === 'exams' ? 'Exam Management' :
          activeItem === 'messages' ? 'Communications' :
          activeItem === 'calendar' ? 'My Schedule' :
          'Instructor Hub'
        }
      >
        {renderWorkspace()}
      </PageContainer>
    </TeacherDataProvider>
  );
};