/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, ClipboardList, Award, Calendar, FileText, 
  Megaphone, MessageSquare, Plus, Clock, ArrowRight, Play, CheckCircle
} from 'lucide-react';
import { StudentProfile, SubjectStats, Assignment, Announcement, Examination } from './StudentMockData';

interface StudentDashboardViewProps {
  profile: StudentProfile;
  subjects: SubjectStats[];
  assignments: Assignment[];
  announcements: Announcement[];
  attendancePercentage: number;
  timetable?: any[];
  gpa?: number | null;
  exams?: Examination[];
  onNavigate: (route: string) => void;
  onQuickAction?: (action: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  profile,
  subjects,
  assignments,
  announcements,
  attendancePercentage,
  timetable = [],
  gpa,
  exams = [],
  onNavigate,
  onQuickAction
}) => {
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'Pending').length;
  const unreadAnnouncementsCount = announcements.filter(a => !a.read).length;

  const summaryCards = [
    {
      title: 'Current Grade',
      value: `${profile.grade}-${profile.section}`,
      desc: 'Honors Division',
      icon: GraduationCap,
      color: 'from-blue-500/10 to-indigo-500/10 text-brand-blue border-blue-200/50 dark:border-blue-800/30'
    },
    {
      title: 'Attendance Percentage',
      value: `${attendancePercentage}%`,
      desc: 'Optimal attendance status',
      icon: ClipboardList,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-800/30'
    },
    {
      title: 'Cumulative GPA',
      value: gpa == null ? '—' : gpa.toFixed(2),
      desc: 'Top 5% of class roster',
      icon: Award,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200/50 dark:border-purple-800/30'
    },
    {
      title: 'Upcoming Exams',
      value: `${exams.length} Exam${exams.length === 1 ? '' : 's'}`,
      desc: exams[0] ? `Next: ${exams[0].subject} (${exams[0].date})` : 'No upcoming exams',
      icon: Calendar,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/50 dark:border-amber-800/30'
    },
    {
      title: 'Pending Assignments',
      value: pendingAssignmentsCount.toString(),
      desc: 'Needs submission soon',
      icon: FileText,
      color: 'from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200/50 dark:border-rose-800/30'
    },
    {
      title: 'Unread Announcements',
      value: unreadAnnouncementsCount.toString(),
      desc: 'New school broadcasts',
      icon: Megaphone,
      color: 'from-cyan-500/10 to-sky-500/10 text-cyan-600 border-cyan-200/50 dark:border-cyan-800/30'
    }
  ];

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todaySchedule = timetable.filter((entry) => entry.day_of_week === today).map((entry) => ({
    time: `${entry.time_slot?.start_time || ''} - ${entry.time_slot?.end_time || ''}`,
    subject: entry.subject?.subject_name || 'Scheduled lesson',
    room: entry.room_number || 'Room TBD',
    teacher: entry.teacher?.full_name || 'Teacher not assigned'
  }));

  return (
    <div className="space-y-6 text-left">
      {/* 1. Hello Greeting Header */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-indigo text-white shadow-xl shadow-brand-blue/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <GraduationCap className="w-56 h-56" />
        </div>
        <div className="relative z-15 space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-sky font-bold">DIGITAL LEARNING HUB • {profile.id}</span>
          <h2 className="text-xl md:text-2xl font-black">Welcome Back, {profile.name}!</h2>
          <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
            Your terminal assessments and grades are fully synchronized. You are currently leading the calculus honors track. Access ongoing exams or submit laboratory feedback using quick links.
          </p>
          <div className="flex flex-wrap gap-4 pt-3 text-[11px] text-slate-250 font-mono">
            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/5">Grade: {profile.grade} ({profile.section})</span>
            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/5">Enrollment Status: {profile.status}</span>
          </div>
        </div>
      </div>

      {/* 2. Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border shadow-xs flex items-center justify-between hover:scale-[1.02] transition-transform duration-300`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-70">{card.title}</span>
              <p className="text-2xl font-black">{card.value}</p>
              <span className="text-[10.5px] font-sans opacity-80 block">{card.desc}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20">
              <card.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Double-Column Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Timetable & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Timetable Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Today's Academic Schedule</h3>
                <p className="text-[10px] text-slate-500">Live lecture routing and assignments timetable</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">{today} Schedule</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {todaySchedule.length ? todaySchedule.map((slot, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[10.5px] font-mono text-slate-500">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{slot.subject}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>{slot.teacher}</span>
                        <span>•</span>
                        <span className="bg-slate-100 dark:bg-slate-950 px-1 py-0.2 rounded border border-slate-200/50">{slot.room}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-indigo" />
                      <span>{slot.time.split(' - ')[0]}</span>
                    </span>
                  </div>
                </div>
              )) : <p className="py-6 text-center text-xs text-slate-400">No lessons scheduled for today.</p>}
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Critical Deadlines</h3>
                <p className="text-[10px] text-slate-500">Pending coursework assignments and homework drills</p>
              </div>
              <button 
                onClick={() => onNavigate('assignments')}
                className="text-[10px] font-mono font-bold text-brand-blue hover:text-brand-indigo flex items-center gap-1"
              >
                <span>Syllabus Desk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.filter(a => a.status === 'Pending').slice(0, 2).map((asg) => (
                <div key={asg.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono bg-brand-blue/10 text-brand-blue px-1.5 py-0.2 rounded-full font-bold">{asg.subject}</span>
                    <span className="text-[9px] font-mono text-rose-500 font-bold">Due July 23</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-850 dark:text-white truncate">{asg.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{asg.instructions}</p>
                  <button 
                    onClick={() => onNavigate('assignments')}
                    className="text-[10px] font-mono font-bold text-brand-blue flex items-center gap-0.5"
                  >
                    <span>Submit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Quick Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Quick Student Actions</h3>
              <p className="text-[10px] text-slate-500">Shortcut controls for key features</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('examinations')}
                className="p-3 rounded-xl bg-gradient-to-tr from-brand-blue/5 to-brand-indigo/5 border border-brand-blue/20 hover:border-brand-blue text-left space-y-1.5 transition-all group"
              >
                <Play className="w-4 h-4 text-brand-blue group-hover:translate-x-0.5 transition-transform" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-slate-850 dark:text-white">Start Exam</h4>
                  <p className="text-[9px] text-slate-500">Launch midterms</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('teacher_ratings')}
                className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500 text-left space-y-1.5 transition-all group"
              >
                <Award className="w-4 h-4 text-emerald-500 group-hover:rotate-12 transition-transform" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-slate-850 dark:text-white">Rate Teacher</h4>
                  <p className="text-[9px] text-slate-500">Evaluate faculty</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('feedback')}
                className="p-3 rounded-xl bg-gradient-to-tr from-amber-500/5 to-orange-500/5 border border-amber-500/20 hover:border-amber-500 text-left space-y-1.5 transition-all group"
              >
                <MessageSquare className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-slate-850 dark:text-white">Submit Ticket</h4>
                  <p className="text-[9px] text-slate-500">Direct feedback</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('downloads')}
                className="p-3 rounded-xl bg-gradient-to-tr from-pink-500/5 to-rose-500/5 border border-pink-500/20 hover:border-pink-500 text-left space-y-1.5 transition-all group"
              >
                <Plus className="w-4 h-4 text-pink-500 group-hover:translate-y-[-1px] transition-transform" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-slate-850 dark:text-white">Report Card</h4>
                  <p className="text-[9px] text-slate-500">Download transcript</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
