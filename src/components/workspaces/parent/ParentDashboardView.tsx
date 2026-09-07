/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Award, ClipboardList, DollarSign, MessageSquare, 
  Megaphone, Calendar, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { 
  ChildProfile, PaymentInvoice, ParentAnnouncement, 
  MessageThread, CalendarEvent, AttendanceRecord 
} from './ParentMockData';

interface ParentDashboardViewProps {
  childrenList: ChildProfile[];
  payments: PaymentInvoice[];
  announcements: ParentAnnouncement[];
  messages: MessageThread[];
  events: CalendarEvent[];
  attendanceLogs: Record<string, AttendanceRecord[]>;
  onNavigate: (tabId: string) => void;
  onSelectChild: (childId: string) => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  childrenList,
  payments,
  announcements,
  messages,
  events,
  attendanceLogs,
  onNavigate,
  onSelectChild
}) => {
  // Compute dashboard metrics
  const totalChildren = childrenList.length;
  
  const avgAttendance = childrenList.reduce((acc, child) => acc + parseFloat(child.attendance), 0) / (totalChildren || 1);
  const avgGPA = childrenList.reduce((acc, child) => acc + parseFloat(child.gpa), 0) / (totalChildren || 1);
  
  const totalOutstandingFees = payments
    .filter(p => p.status === 'Overdue' || p.status === 'Unpaid')
    .reduce((acc, p) => acc + p.amount, 0);

  const unreadMessagesCount = messages.filter(m => m.unread).length;
  const unreadAnnouncementsCount = announcements.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-indigo text-white overflow-hidden text-left shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <ShieldCheck className="w-96 h-96 -mr-16" />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
            Guardian Core Portal
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Welcome back to your Parent Suite</h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Monitor real-time academic GPAs, examine detailed behavioral timeline guides, download official report cards, and settle quarterly fee installments securely.
          </p>
        </div>
      </div>

      {/* 2. Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-left">
        
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">My Children</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{totalChildren}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Attendance</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{avgAttendance.toFixed(1)}%</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Avg GPA</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{avgGPA.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Pending Fees</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">${totalOutstandingFees}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Unread Msg</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{unreadMessagesCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Bulletins</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{unreadAnnouncementsCount}</p>
          </div>
        </div>

      </div>

      {/* 3. Quick Actions Dashboard Panel */}
      <div className="p-5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-left space-y-4">
        <div>
          <h3 className="text-xs font-mono font-black uppercase text-slate-450 tracking-wider">Guardian Quick Actions Desk</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Fulfill school regulatory mandates instantly</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => onNavigate('payments')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-brand-blue/30 hover:shadow-md transition-all cursor-pointer text-xs"
          >
            <div className="space-y-0.5 text-left">
              <span className="font-black text-slate-800 dark:text-white block">Settle Outstanding Fees</span>
              <span className="text-[10px] text-slate-500">Pay tuition, lab and transit balances</span>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-blue" />
          </button>

          <button
            onClick={() => onNavigate('registration')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-brand-blue/30 hover:shadow-md transition-all cursor-pointer text-xs"
          >
            <div className="space-y-0.5 text-left">
              <span className="font-black text-slate-800 dark:text-white block">Register Child Next Year</span>
              <span className="text-[10px] text-slate-500">Submit re-enrollment applications</span>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-blue" />
          </button>

          <button
            onClick={() => onNavigate('feedback')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-brand-blue/30 hover:shadow-md transition-all cursor-pointer text-xs"
          >
            <div className="space-y-0.5 text-left">
              <span className="font-black text-slate-800 dark:text-white block">Submit School Feedback</span>
              <span className="text-[10px] text-slate-500">Send reviews to directors & administrators</span>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-blue" />
          </button>

          <button
            onClick={() => onNavigate('teacher_communication')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-brand-blue/30 hover:shadow-md transition-all cursor-pointer text-xs"
          >
            <div className="space-y-0.5 text-left">
              <span className="font-black text-slate-800 dark:text-white block">Contact Child Instructors</span>
              <span className="text-[10px] text-slate-500">Secure direct message hotline chat</span>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-blue" />
          </button>
        </div>
      </div>

      {/* 4. Multi-Widget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Child Roster Overview Widget */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Children Academic Roster</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Linked dependents on system</p>
          </div>

          <div className="space-y-3">
            {childrenList.map((child) => (
              <div 
                key={child.id} 
                onClick={() => {
                  onSelectChild(child.id);
                  onNavigate('children');
                }}
                className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between cursor-pointer hover:bg-brand-blue/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={child.photo} alt={child.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200/50" />
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white">{child.name}</h4>
                    <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 block">{child.grade} • {child.section}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-brand-blue block">{child.gpa} GPA</span>
                  <span className="text-[9.5px] font-mono text-emerald-500 font-bold">{child.attendance}% Att.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic & Assignment Alerts */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Upcoming Exams & Work</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Important milestones for Term 1</p>
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                  event.category === 'Examination' 
                    ? 'bg-red-500/10 text-red-500' 
                    : event.category === 'Fee Deadline' 
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {event.start.split('-')[2]}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="text-[10.5px] font-black text-slate-800 dark:text-white truncate">{event.title}</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed truncate">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Teacher Advisories / Messages */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Recent Teacher Messages</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Direct chat log briefs</p>
          </div>

          <div className="space-y-3">
            {messages.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <div 
                  key={thread.id}
                  onClick={() => onNavigate('teacher_communication')}
                  className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between cursor-pointer hover:bg-brand-indigo/5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-[11px] font-black text-slate-850 dark:text-white truncate">{thread.teacherName}</h4>
                      {thread.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0 animate-ping" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate italic">"{lastMsg?.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Calendar Preview Widget */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-left space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Academic & Activities Calendar</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Live school events timeline</p>
          </div>
          <button 
            onClick={() => onNavigate('calendar')}
            className="text-[10.5px] font-bold text-brand-blue hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {events.map((ev) => (
            <div key={ev.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 space-y-2">
              <span className={`inline-block text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                ev.category === 'Examination' 
                  ? 'bg-red-500/10 text-red-600' 
                  : ev.category === 'Holiday'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : ev.category === 'Fee Deadline'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-indigo-500/10 text-indigo-600'
              }`}>
                {ev.category}
              </span>
              <h4 className="text-[10.5px] font-black text-slate-800 dark:text-slate-100 line-clamp-1">{ev.title}</h4>
              <p className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{ev.start}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
