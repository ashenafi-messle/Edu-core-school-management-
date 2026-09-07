/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, LayoutDashboard, Calendar, Users, Award, 
  DollarSign, BookOpen, AlertCircle, Shield, Settings, 
  FileText, Megaphone, ChevronDown, ChevronRight, Menu, X, 
  LogOut, ClipboardList, Briefcase, KeyRound, Server, HardDrive, 
  BookMarked, HelpCircle, Compass, Truck, Home, UserCheck, MessageSquare,
  Download, Star
} from 'lucide-react';
import { UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  children?: { id: string; label: string }[];
}

interface SidebarProps {
  role: UserRole;
  activeItem: string;
  activeSubItem?: string;
  onSelect: (itemId: string, subItemId?: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeItem,
  activeSubItem,
  onSelect,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { t } = useLanguage();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Define sidebar navigation structures for each role
  const getSidebarItems = (): SidebarItem[] => {
    switch (role) {
      case 'director':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Student Management', icon: Users },
          { id: 'teachers', label: 'Teacher Management', icon: Award },
          { id: 'teacher_attendance_performance', label: 'Teacher Attendance & Performance', icon: ClipboardList },
          { 
            id: 'academics', 
            label: 'Academic Management', 
            icon: BookOpen,
            children: [
              { id: 'courses', label: 'Courses' },
              { id: 'grades', label: 'Grades' },
              { id: 'sections', label: 'Sections' },
              { id: 'schedule', label: 'Class Schedule' }
            ]
          },
          { id: 'parents', label: 'Parent Management', icon: UserCheck },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'registration', label: 'Online Registration', icon: UserCheck },
          { id: 'readmission', label: 'Student Readmission', icon: GraduationCap },
          { id: 'payments', label: 'Payment Management', icon: DollarSign },
          { id: 'permissions', label: 'Role & Permissions', icon: Shield },
          { id: 'school_config', label: 'School Configuration', icon: Settings },
          { id: 'academic_years', label: 'Academic Year Management', icon: Calendar },
          { id: 'grade_section_builder', label: 'Grade & Section Builder', icon: Award },
          { id: 'monitoring', label: 'System Monitoring', icon: Server },
          { id: 'support', label: 'Support Center', icon: HelpCircle }
        ];

      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'my_classes', label: 'My Classes & Divisions', icon: BookOpen },
          { id: 'students', label: 'Student Rosters', icon: Users },
          { id: 'attendance', label: 'Record Attendance', icon: ClipboardList },
          { id: 'curriculum', label: 'Curriculum Management', icon: BookMarked },
          { id: 'assignments', label: 'Assignments & Grader', icon: FileText },
          { id: 'gradebook', label: 'Gradebook & Exams', icon: Award },
          { id: 'reports', label: 'Performance Reports', icon: FileText },
          { id: 'messages', label: 'Communications', icon: MessageSquare },
          { id: 'calendar', label: 'My Schedule', icon: Calendar }
        ];

      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: Users },
          { id: 'academic_progress', label: 'Academic Progress', icon: Award },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'homework', label: 'Homework', icon: BookMarked },
          { id: 'examinations', label: 'Examinations', icon: GraduationCap },
          { id: 'learning_resources', label: 'Learning Resources', icon: Compass },
          { id: 'downloads', label: 'Downloads', icon: Download },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'teacher_ratings', label: 'Teacher Ratings', icon: Star },
          { id: 'feedback', label: 'Feedback', icon: HelpCircle },
          { id: 'readmission', label: 'Readmission', icon: UserCheck },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'parent':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'children', label: 'My Children', icon: Users },
          { id: 'progress', label: 'Academic Progress', icon: Award },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'behavior', label: 'Behavior Reports', icon: AlertCircle },
          { id: 'subject_marks', label: 'Subject Marks', icon: BookOpen },
          { id: 'payments', label: 'School Payments', icon: DollarSign },
          { id: 'registration', label: 'Registration', icon: UserCheck },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'teacher_communication', label: 'Teacher Communication', icon: MessageSquare },
          { id: 'feedback', label: 'Feedback', icon: HelpCircle },
          { id: 'downloads', label: 'Downloads', icon: Download },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'profile', label: 'Profile', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      default:
        return [];
    }
  };

  const items = getSidebarItems();

  const handleItemClick = (item: SidebarItem) => {
    if (item.children) {
      setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      onSelect(item.id);
      setMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/65 dark:border-slate-850/65 text-slate-800 dark:text-slate-200 transition-all duration-300">
      
      {/* Sidebar Header Brand */}
      <div className="h-24 flex items-center justify-between px-4.5 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-indigo flex items-center justify-center text-white shadow-md shadow-brand-indigo/10 flex-shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          {(!collapsed || mobileOpen) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              <h1 className="text-2xl font-black tracking-widest font-mono uppercase bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky bg-clip-text text-transparent">
                EDUCORE
              </h1>
              <span className="text-base font-mono font-bold text-slate-400 dark:text-slate-500 uppercase -mt-1 block tracking-wider">
                SCHOOL CLOUD
              </span>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        {!mobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isSelected = activeItem === item.id;
          const isExpanded = expandedMenus[item.id];
          const hasChildren = !!item.children;

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer group ${
                  isSelected && !hasChildren
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-indigo/5 text-brand-indigo dark:text-brand-sky font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-lg w-6 h-6 transition-colors ${
                    isSelected && !hasChildren
                      ? 'bg-brand-blue/10 text-brand-indigo dark:text-brand-sky'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}>
                    <IconComponent className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
                  </div>
                  {(!collapsed || mobileOpen) && (
                    <span className="text-left transition-opacity duration-200 truncate max-w-[130px]">
                      {t(item.label)}
                    </span>
                  )}
                </div>

                {hasChildren && (!collapsed || mobileOpen) && (
                  <div
                    onClick={(e) => toggleSubmenu(item.id, e)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 dark:text-slate-500"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>

              {/* Collapsed sub-menu indicator dot */}
              {hasChildren && collapsed && !mobileOpen && (
                <div className="flex justify-center py-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-brand-blue animate-pulse' : 'bg-slate-300 dark:bg-slate-800'}`} />
                </div>
              )}

              {/* Sub-menu rendering (when expanded) */}
              {hasChildren && isExpanded && (!collapsed || mobileOpen) && (
                <div className="pl-9 pr-1 py-1 space-y-1 border-l border-slate-150 dark:border-slate-800 ml-6">
                  {item.children?.map((subItem) => {
                    const isSubSelected = activeItem === item.id && activeSubItem === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          onSelect(item.id, subItem.id);
                          setMobileOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          isSubSelected
                            ? 'text-brand-indigo dark:text-brand-sky font-bold bg-brand-blue/5'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        {t(subItem.label)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Indicator Footer Badge */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-850 text-left">
        {(!collapsed || mobileOpen) ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850/60">
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">{t('WORKSPACE SECURE', 'WORKSPACE SECURE')}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">{t(role)} {t('Account', 'Account')}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 2. Desktop sidebar wrapper */}
      <aside className={`hidden md:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* 3. Mobile drawer layout */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar box */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 h-full flex flex-col z-10"
            >
              {/* Close Button Inside Menu */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                aria-label="Close mobile menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
