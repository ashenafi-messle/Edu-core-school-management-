/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { UserRole } from '../../types';

interface AppShellProps {
  role: UserRole;
  activeItem: string;
  activeSubItem?: string;
  activeItemLabel: string;
  activeItemParent?: string;
  onSelect: (itemId: string, subItemId?: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  role,
  activeItem,
  activeSubItem,
  activeItemLabel,
  activeItemParent,
  onSelect,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 1. Left Sidebar */}
      <Sidebar
        role={role}
        activeItem={activeItem}
        activeSubItem={activeSubItem}
        onSelect={onSelect}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Right Workspace Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        
        {/* Top Header */}
        <Header 
          activeItemLabel={activeItemLabel} 
          activeItemParent={activeItemParent}
          setMobileOpen={setMobileOpen}
        />

        {/* Dynamic Main Workspace Box */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin flex flex-col justify-between">
          <div className="w-full max-w-7xl mx-auto space-y-8 flex-1 pb-10">
            {children}
          </div>
          <Footer />
        </main>

      </div>
    </div>
  );
};
