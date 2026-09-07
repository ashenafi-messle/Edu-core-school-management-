/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { DirectorDataProvider } from './director/DirectorDataContext';
import { DirectorOverview } from './director/DirectorOverview';
import { StudentManagement } from './director/StudentManagement';
import { TeacherManagement } from './director/TeacherManagement';
import { TeacherPerfAttendance } from './director/TeacherPerfAttendance';
import { AcademicManagement } from './director/AcademicManagement';
import { ParentManagement } from './director/ParentManagement';
import { AnnouncementManagement } from './director/AnnouncementManagement';
import { ReportsManagement } from './director/ReportsManagement';
import { SettingsManagement } from './director/SettingsManagement';

interface DirectorWorkspaceProps {
  activeItem: string;
  activeSubItem?: string;
}

export const DirectorWorkspace: React.FC<DirectorWorkspaceProps> = ({ activeItem, activeSubItem }) => {
  // Use a state-fallback pattern to support in-dashboard quick actions
  const [overrideItem, setOverrideItem] = useState<string | null>(null);

  useEffect(() => {
    // Reset override when the user clicks the sidebar navigation items
    setOverrideItem(null);
  }, [activeItem, activeSubItem]);

  const currentItem = overrideItem || activeItem;

  const renderContent = () => {
    switch (currentItem) {
      case 'dashboard':
        return <DirectorOverview onQuickAction={(target) => setOverrideItem(target)} />;
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'teacher_attendance_performance':
        return <TeacherPerfAttendance />;
      case 'academics':
        return <AcademicManagement />;
      case 'parents':
        return <ParentManagement />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        // Graceful fallback for any unmapped item
        return <DirectorOverview onQuickAction={(target) => setOverrideItem(target)} />;
    }
  };

  return (
    <DirectorDataProvider>
      <PageContainer>
        {renderContent()}
      </PageContainer>
    </DirectorDataProvider>
  );
};
