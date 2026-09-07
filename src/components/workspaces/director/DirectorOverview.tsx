/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Award, DollarSign, Calendar, Clock, Plus, 
  Megaphone, ShieldAlert, ArrowRight, BookOpen, ClipboardList, CheckSquare, MessageSquare
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { api } from '../../../lib/api';

interface DirectorOverviewProps {
  onQuickAction: (actionType: string) => void;
}

interface DashboardStats {
  students: number;
  teachers: number;
  parents: number;
  subjects: number;
  activeSubjects: number;
  academicYear: string;
}

export const DirectorOverview: React.FC<DirectorOverviewProps> = ({ onQuickAction }) => {
  const { students, teachers, parents, announcements, timetableSlots, parentFeedbacks } = useDirectorData();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    parents: 0,
    subjects: 0,
    activeSubjects: 0,
    academicYear: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await api.request<any>('/dashboard/stats', { method: 'GET' });
        setDashboardStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Stats calculation - use actual database counts from API
  const totalStudents = isLoading ? 0 : dashboardStats.students;
  const totalTeachers = isLoading ? 0 : dashboardStats.teachers;
  const totalParents = isLoading ? 0 : dashboardStats.parents;
  const pendingFeedbackCount = parentFeedbacks.filter(f => f.status === 'Pending').length;
  const totalSubjectsCount = isLoading ? 0 : dashboardStats.subjects;
  const activeAnnouncementsCount = announcements.filter(a => a.status === 'Published').length;

  const quickActions = [
    { label: 'View Students', icon: Users, color: 'bg-blue-500', action: 'students' },
    { label: 'Add Teacher', icon: Award, color: 'bg-emerald-500', action: 'teachers' },
    { label: 'Create Course', icon: BookOpen, color: 'bg-purple-500', action: 'academics-courses' },
    { label: 'Publish Announcement', icon: Megaphone, color: 'bg-amber-500', action: 'announcements' },
    { label: 'Generate Report', icon: ClipboardList, color: 'bg-rose-500', action: 'reports' },
  ];

  const calendarEvents = [
    { day: '24', month: 'Jul', title: 'Board of Directors Summit', desc: 'Annual corporate governance and budget allocation' },
    { day: '05', month: 'Aug', title: 'Term 1 Official Commencement', desc: 'Faculty reports at 08:00 AM. Induction matrices synced.' },
    { day: '12', month: 'Aug', title: 'STEM Curriculum Review', desc: 'Science department syllabus alignment checklist' }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-brand-blue dark:hover:border-brand-sky/40 transition-all duration-300"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Students</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '...' : totalStudents}</p>
            <span className="text-[10px] text-emerald-500 font-bold">Active Enrollment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-indigo dark:text-brand-sky">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-brand-blue dark:hover:border-brand-sky/40 transition-all duration-300"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Teachers</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '...' : totalTeachers}</p>
            <span className="text-[10px] text-slate-500">Faculty Members</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-brand-blue dark:hover:border-brand-sky/40 transition-all duration-300"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Subjects</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoading ? '...' : totalSubjectsCount}</p>
            <span className="text-[10px] text-emerald-500 font-bold">Active Programs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-brand-blue dark:hover:border-brand-sky/40 transition-all duration-300"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Parents</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalParents}</p>
            <span className="text-[10px] text-emerald-500 font-bold">Registered Guardians</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Left column (Admissions / Quick Actions) & Right Column (Calendar / Bulletins) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area (Admissions list and Quick Action) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono text-left">Director Quick Desk</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onQuickAction(action.action)}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 hover:border-brand-blue/30 dark:hover:border-brand-sky/30 hover:shadow-sm flex flex-col items-center justify-center text-center gap-2.5 group transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-8.5 h-8.5 rounded-lg ${action.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 leading-tight font-sans">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending admissions overview widget replaced by Parent Feedback widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Recent Parent Concerns</h3>
                <p className="text-[10px] text-slate-500">Official incoming tickets and suggestions</p>
              </div>
              <button 
                onClick={() => onQuickAction('parents')}
                className="text-[10px] font-mono font-bold text-brand-blue hover:text-brand-indigo flex items-center gap-1 cursor-pointer"
              >
                <span>Full List</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {parentFeedbacks.slice(0, 3).map((fb) => (
                <div key={fb.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-xs font-black font-mono text-slate-500 border border-slate-200/60">
                      {fb.parentName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{fb.parentName}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span className="bg-slate-100 dark:bg-slate-950 px-1 py-0.2 rounded border border-slate-200/60">{fb.type}</span>
                        <span>•</span>
                        <span>Student: {fb.studentName}</span>
                        <span>•</span>
                        <span>{fb.date}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    fb.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600 animate-pulse'
                  }`}>
                    {fb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area (Calendar and Notice Bulletin) */}
        <div className="space-y-6">
          
          {/* Calendar Milestones */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Academic Calendar</h3>
                <p className="text-[10px] text-slate-500">Upcoming term milestones</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {calendarEvents.map((evt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/15 text-left flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/10 dark:bg-brand-blue/20 flex flex-col items-center justify-center font-mono text-brand-indigo dark:text-brand-sky flex-shrink-0 border border-brand-blue/20">
                    <span className="text-xs font-bold leading-none">{evt.day}</span>
                    <span className="text-[8.5px] uppercase tracking-wider font-semibold">{evt.month}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-100">{evt.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Broadcasts Bulletins */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Active Bulletins</h3>
                <p className="text-[10px] text-slate-500">Authorized school-wide notices</p>
              </div>
              <Megaphone className="w-4 h-4 text-brand-sky animate-bounce" />
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-left space-y-1.5">
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400 font-bold">
                    <span className={`px-1.5 py-0.2 rounded ${
                      ann.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                      ann.priority === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200/50 text-slate-600'
                    }`}>{ann.priority} priority</span>
                    <span>{ann.publishDate}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{ann.title}</h4>
                  <p className="text-[10.5px] text-slate-500 leading-normal">{ann.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Security Audit logs footer indicator */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-850/60 flex items-center justify-between text-left">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[10.5px] text-slate-500 font-mono">
            <strong>System Ledger:</strong> Secured audit log stream is synchronized on client IP signature.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-mono font-bold">
          SECURE
        </span>
      </div>
    </div>
  );
};
