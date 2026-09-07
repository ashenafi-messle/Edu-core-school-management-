/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, UserCheck, GraduationCap, DollarSign, Activity, 
  Server, Database, Clock, ShieldAlert, ArrowRight, UserPlus, 
  RefreshCw, KeyRound, CheckCircle2, TrendingUp, AlertTriangle, FileText
} from 'lucide-react';
import { AdminUser, StudentReadmission, PaymentRecord } from './AdminTypes';

interface AdminDashboardProps {
  users: AdminUser[];
  readmissions: StudentReadmission[];
  payments: PaymentRecord[];
  registrationCount: number;
  onNavigate: (tabId: string) => void;
  onQuickApproveReg: () => void;
  onQuickApproveReadm: (id: string) => void;
  onQuickCreateUser: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  readmissions,
  payments,
  registrationCount,
  onNavigate,
  onQuickApproveReg,
  onQuickApproveReadm,
  onQuickCreateUser
}) => {
  // Compute Stats
  const totalUsersCount = users.length;
  const directorsCount = users.filter(u => u.role === 'director').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const parentsCount = users.filter(u => u.role === 'parent').length;
  
  const pendingReadmissionsCount = readmissions.filter((r: any) => r.status === 'Pending').length;
  
  const totalOutstandingBalance = payments.reduce((acc, curr) => acc + curr.remainingBalance, 0);
  const onlineUsersCount = 4; // Simulated active tokens

  return (
    <div className="space-y-6">
      
      {/* 1. STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
        
        {/* Total Users & Role breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Identity Directory</span>
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{totalUsersCount}</h4>
            <p className="text-[11px] text-slate-500 font-medium">Total Registered Accounts</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>D: {directorsCount} | T: {teachersCount}</span>
            <span>S: {studentsCount} | P: {parentsCount}</span>
          </div>
        </div>

        {/* Admissions Pipeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-indigo/5 rounded-bl-full transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Admissions Inbox</span>
            <div className="w-8 h-8 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{registrationCount}</h4>
            <p className="text-[11px] text-slate-500 font-medium">Online Registrations</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-450">
            <span className="text-brand-indigo font-bold">Manage Applications</span>
            <button onClick={onQuickApproveReg} className="text-brand-indigo hover:underline flex items-center gap-0.5">
              <span>View Inbox</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Re-Admissions Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Re-Enrollments</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{pendingReadmissionsCount}</h4>
            <p className="text-[11px] text-slate-500 font-medium">Pending Readmission Logs</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-450">
            <span className="text-emerald-500 font-bold">Ready for Approval</span>
            <button onClick={() => onNavigate('readmission')} className="text-emerald-500 hover:underline flex items-center gap-0.5">
              <span>Review list</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Tuition Receivables</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">${totalOutstandingBalance}</h4>
            <p className="text-[11px] text-slate-500 font-medium">Outstanding Balances</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-[10px] font-mono text-slate-450">
            <span className="text-red-500 font-bold">Overdue Notices Active</span>
            <button onClick={() => onNavigate('payments')} className="text-red-500 hover:underline flex items-center gap-0.5">
              <span>Ledger Desk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>


      {/* 3. RECENT INBOX TRIAGE */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/60">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Pending Admissions Inbox</h3>
            <p className="text-[10px] text-slate-450">Requires administrator document verification</p>
          </div>
          <span className="text-[9px] bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded uppercase font-bold font-mono">Triage Required</span>
        </div>

        <div className="py-8 text-center text-slate-400 text-xs">
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-8 h-8 text-slate-300" />
            <p>Manage online registrations through the Registration Management workspace</p>
            <button onClick={onQuickApproveReg} className="px-4 py-2 bg-brand-blue hover:bg-brand-indigo text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all">
              Go to Registration Management
            </button>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE SECURITY THREATS & INCIDENTS PANEL */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Secure Core Sentinel Logs</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-450 uppercase font-black">2 Warnings Flagged</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1" />
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wider">WARN_EXPIRED_JWT_ATTEMPT</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Unauthorized API query from remote host proxy 193.12.82.1</p>
              <span className="text-[10px] text-slate-450 block">Today, 02:11:45 AM</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1" />
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">WARN_BRUTEFORCE_LOCKOUT</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">User parent@demo.com locked out after 5 consecutive failed logins</p>
              <span className="text-[10px] text-slate-450 block">Yesterday, 11:34:10 PM</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
