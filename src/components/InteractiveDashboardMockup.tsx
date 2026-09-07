/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, Clock, Bell, Plus, CheckCircle, Search, 
  ArrowUpRight, TrendingUp, DollarSign, Award, BookOpen, AlertCircle
} from 'lucide-react';

export const InteractiveDashboardMockup: React.FC<{ variant?: 'hero' | 'preview' }> = ({ variant = 'hero' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'classes'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Fee receipt cleared for Rivera, Alex', time: '2m ago', read: false },
    { id: 2, text: 'Bus #4 arrived at campus gates', time: '10m ago', read: true },
    { id: 3, text: 'Grade reports generated: Class 10A', time: '1h ago', read: true }
  ]);

  const stats = [
    { label: 'Total Students', value: '1,248', change: '+4.3%', icon: Users, color: 'text-brand-blue bg-brand-blue/10' },
    { label: 'Avg Attendance', value: '96.2%', change: '+1.1%', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Fee Collection', value: '$242,500', change: '98.5%', icon: DollarSign, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Active Teachers', value: '84', change: '1:14 Ratio', icon: Award, color: 'text-amber-500 bg-amber-500/10' }
  ];

  const students = [
    { name: 'Alex Rivera', id: 'STU-2026-042', grade: 'Grade 12-A', status: 'Present', gpa: '3.94', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
    { name: 'Chloe Vance', id: 'STU-2026-118', grade: 'Grade 11-B', status: 'Present', gpa: '3.82', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
    { name: 'Marcus Sterling', id: 'STU-2026-089', grade: 'Grade 12-A', status: 'Excused', gpa: '3.65', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { name: 'Sophia Chen', id: 'STU-2026-302', grade: 'Grade 10-C', status: 'Present', gpa: '4.00', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
  ];

  const classes = [
    { subject: 'AP Physics 101', teacher: 'Prof. Marcus Vance', room: 'Lab 4', time: '09:00 AM - 10:30 AM', students: '24 enrolled' },
    { subject: 'Advanced Calculus', teacher: 'Dr. Sarah Jenkins', room: 'Hall B', time: '11:00 AM - 12:30 PM', students: '18 enrolled' },
    { subject: 'World History', teacher: 'Mrs. Emily Stone', room: 'Room 102', time: '01:30 PM - 03:00 PM', students: '32 enrolled' }
  ];

  // Custom responsive SVG line chart data
  const attendanceChartData = [
    { month: 'Jan', value: 92 },
    { month: 'Feb', value: 94 },
    { month: 'Mar', value: 95 },
    { month: 'Apr', value: 98 },
    { month: 'May', value: 96 },
    { month: 'Jun', value: 97 }
  ];

  const maxVal = 100;
  const minVal = 80;
  const chartHeight = 80;
  const chartWidth = 320;

  // Map values to coordinates
  const points = attendanceChartData.map((d, index) => {
    const x = attendanceChartData.length > 1 
      ? (index / (attendanceChartData.length - 1)) * chartWidth 
      : chartWidth / 2;
    const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = points ? `M ${points} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z` : `M 0,${chartHeight} L ${chartWidth},${chartHeight} Z`;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900/90 dark:bg-slate-950/90 rounded-2xl border border-slate-700/50 dark:border-slate-800/80 shadow-2xl overflow-hidden font-sans">
      
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-slate-850/50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 font-mono text-[11px] text-slate-400 font-medium">EDUCORE CLOUD v1.4 // Live Portal</span>
        </div>
        
        {/* Search bar inside header */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 h-8.5 pl-9 pr-4 bg-slate-800/60 rounded-lg text-xs text-white border border-slate-700 focus:outline-none focus:border-brand-sky"
          />
        </div>

        {/* Action Header Icons */}
        <div className="flex items-center gap-3.5">
          <div className="relative cursor-pointer">
            <Bell className="w-4.5 h-4.5 text-slate-300 hover:text-white transition-colors" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-brand-sky rounded-full" />
            )}
          </div>
          <div className="w-7.5 h-7.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-white font-bold">
            JD
          </div>
        </div>
      </div>

      {/* Main Inner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        
        {/* Local Mini Sidebar Menu */}
        <div className="col-span-1 border-r border-slate-700/30 p-4 bg-slate-900/60 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: TrendingUp },
            { id: 'students', label: 'Student Directory', icon: Users },
            { id: 'classes', label: 'Active Schedule', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="hidden lg:block mt-8 p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2 text-[10px] font-mono text-brand-sky uppercase font-bold tracking-wider mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Notification Feed</span>
            </div>
            <div className="space-y-2.5">
              {notifications.map(not => (
                <div key={not.id} className="text-[11px] leading-snug">
                  <p className="text-slate-300 font-medium">{not.text}</p>
                  <span className="text-[9px] text-slate-500 font-mono">{not.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Content Panel */}
        <div className="col-span-1 lg:col-span-3 p-6 bg-slate-950/30 space-y-6">
          
          {/* OVERVIEW METRICS TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Core metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((st, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{st.label}</span>
                      <div className={`p-1.5 rounded-lg ${st.color}`}>
                        <st.icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-white font-display">{st.value}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{st.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance and Live Stats Breakdown Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Visual SVG Line Chart */}
                <div className="md:col-span-3 p-4 bg-slate-900 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Attendance Rate Progress</h4>
                      <span className="text-[10px] font-mono text-slate-500">6-Month Continuous Audit</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      96.2% Avg
                    </span>
                  </div>

                  {/* SVG Chart area */}
                  <div className="relative pt-2 h-28 flex items-end">
                    {points && (
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={fillPoints} fill="url(#gradient-blue)" />
                        <path d={`M ${points}`} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Labels */}
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2.5">
                    {attendanceChartData.map((d, i) => (
                      <span key={i}>{d.month}</span>
                    ))}
                  </div>
                </div>

                {/* Upcoming classes ticker */}
                <div className="md:col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-800/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Classroom Sessions</h4>
                    <span className="text-[10px] font-mono text-slate-500">Next Scheduled Period</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-850 border border-slate-800">
                      <BookOpen className="w-4 h-4 text-brand-sky mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-slate-200">AP Physics (Lab 4)</p>
                        <span className="text-[9px] font-mono text-slate-400">Mr. Marcus Vance • 09:00 AM</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-850/40 border border-slate-800/40">
                      <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400">Calculus BC (Hall B)</p>
                        <span className="text-[9px] font-mono text-slate-500">Dr. Sarah Jenkins • 11:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500">Session Status</span>
                    <span className="text-[10px] font-mono font-bold text-brand-sky">Live in progress</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STUDENT DIRECTORY TAB */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Student Records Registry</h4>
                  <p className="text-[11px] text-slate-400">Showing active student ledger profiles</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white font-medium text-xs transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Student
                </button>
              </div>

              {/* Student Cards Registry list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStudents.map((stu, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={stu.avatar} alt={stu.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h5 className="text-xs font-semibold text-slate-200">{stu.name}</h5>
                        <p className="text-[10px] font-mono text-slate-500">{stu.id} • {stu.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-mono font-bold text-white">GPA {stu.gpa}</span>
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 mt-1">{stu.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE SCHEDULE TAB */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white font-display">Institution Master Schedule</h4>
                <p className="text-[11px] text-slate-400">Classrooms scheduling matrix and attendance audits</p>
              </div>

              <div className="space-y-3">
                {classes.map((cls, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-200">{cls.subject}</h5>
                        <p className="text-[11px] text-slate-400">{cls.teacher} • <span className="text-slate-500">{cls.room}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-850 pt-2 md:pt-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-brand-sky" />
                        <span>{cls.time}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {cls.students}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
