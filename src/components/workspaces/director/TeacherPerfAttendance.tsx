/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Award, Calendar, CheckSquare, ClipboardList, 
  TrendingUp, Star, BarChart, ChevronDown, CheckCircle2, AlertTriangle, Printer
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Teacher } from './types';

export const TeacherPerfAttendance: React.FC = () => {
  const { teachers } = useDirectorData();
  const [activeTab, setActiveTab] = useState<'attendance' | 'performance'>('attendance');
  const [attendancePeriod, setAttendancePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Performance scoring logic
  const calculateScore = (t: Teacher) => {
    // Student Rating (scaled to 100): rating / 5 * 100 * 0.4
    const studentWeighted = (t.ratings.student / 5) * 100 * 0.4;
    // Parent Rating: rating / 5 * 100 * 0.2
    const parentWeighted = (t.ratings.parent / 5) * 100 * 0.2;
    // Attendance Score: present / total * 100 * 0.2
    const totalDays = t.attendance.present + t.attendance.absent + t.attendance.leave;
    const attendanceRatio = totalDays > 0 ? (t.attendance.present / totalDays) : 1;
    const attendanceWeighted = attendanceRatio * 100 * 0.2;
    // Assignment Completion: value * 0.1
    const assignmentWeighted = t.assignmentCompletion * 0.1;
    // Director Eval: value * 0.1
    const evalWeighted = t.directorEval * 0.1;

    const overallScore = studentWeighted + parentWeighted + attendanceWeighted + assignmentWeighted + evalWeighted;
    return Math.round(overallScore * 10) / 10;
  };

  // Rank teachers
  const rankedTeachers = [...teachers]
    .map(t => ({ ...t, overallScore: calculateScore(t) }))
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Faculty Attendance Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'performance'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Faculty Performance Index</span>
        </button>
      </div>

      {/* 2. Toggle View Rendering */}
      {activeTab === 'attendance' ? (
        <div className="space-y-6 text-left">
          
          {/* Attendance Stats summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Present Rate</span>
              <p className="text-xl font-black text-emerald-500 mt-1">98.2%</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Average Absences</span>
              <p className="text-xl font-black text-rose-500 mt-1">1.8 days</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Lateness rate</span>
              <p className="text-xl font-black text-amber-500 mt-1">2.4%</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Approved Leave logs</span>
              <p className="text-xl font-black text-brand-blue mt-1">3 logs</p>
            </div>
          </div>

          {/* Timeframe selector & Custom SVG Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Faculty Attendance Trends</h3>
                <p className="text-[10px] text-slate-500">Weekly average clock-in analytics</p>
              </div>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden text-[10px] font-mono font-bold bg-slate-50">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setAttendancePeriod(p as any)}
                    className={`px-2.5 py-1.2 cursor-pointer ${attendancePeriod === p ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Line graph */}
            <div className="h-44 w-full bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-850">
              <div className="flex-1 flex items-end justify-between relative px-2">
                {/* Simulated Grid Lines */}
                <div className="absolute inset-x-0 top-0 border-t border-slate-200/60 dark:border-slate-800/40" />
                <div className="absolute inset-x-0 top-1/2 border-t border-slate-200/60 dark:border-slate-800/40" />
                
                {/* SVG Visual path */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <path 
                    d="M 10 90 Q 120 40 240 20 T 480 10" 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 10 90 Q 120 40 240 20 T 480 10 L 480 120 L 10 120 Z" 
                    fill="url(#gradient-blue)" 
                    opacity="0.12"
                  />
                  <defs>
                    <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Days tags */}
                <span className="text-[9px] font-mono text-slate-400 z-10">Mon (95%)</span>
                <span className="text-[9px] font-mono text-slate-400 z-10">Tue (98%)</span>
                <span className="text-[9px] font-mono text-slate-400 z-10">Wed (97%)</span>
                <span className="text-[9px] font-mono text-slate-400 z-10">Thu (99%)</span>
                <span className="text-[9px] font-mono text-slate-400 z-10">Fri (98%)</span>
              </div>
            </div>
          </div>

          {/* Detailed table of teachers logs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                    <th className="py-3 px-5">Faculty</th>
                    <th className="py-3 px-5">Days Present</th>
                    <th className="py-3 px-5">Absences</th>
                    <th className="py-3 px-5">Late Clock-Ins</th>
                    <th className="py-3 px-5">Approved Leaves</th>
                    <th className="py-3 px-5 text-right">Fidelity Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {teachers.map((t) => {
                    const totalDays = t.attendance.present + t.attendance.absent + t.attendance.leave;
                    const fidelity = totalDays > 0 ? Math.round((t.attendance.present / totalDays) * 100) : 100;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <img src={t.photo} alt={t.name} className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span>{t.name}</span>
                        </td>
                        <td className="py-3 px-5 font-mono font-semibold">{t.attendance.present} days</td>
                        <td className="py-3 px-5 font-mono text-rose-500 font-semibold">{t.attendance.absent} days</td>
                        <td className="py-3 px-5 font-mono text-amber-500 font-semibold">{t.attendance.late} instances</td>
                        <td className="py-3 px-5 font-mono text-brand-blue font-semibold">{t.attendance.leave} days</td>
                        <td className="py-3 px-5 text-right font-mono font-bold text-emerald-600">{fidelity}% present</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6 text-left">
          
          {/* Performance scorecard weight instructions */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs text-slate-500">
            <p className="font-bold mb-1 font-mono uppercase text-[9.5px] text-slate-400">Institutional Balanced scorecard Weight Allocation Criteria</p>
            <p>Scores are calculated dynamically across multiple telemetry feeds: <strong>Student Evaluation</strong> (40%), <strong>Parent Feedback</strong> (20%), <strong>Clock-in Attendance</strong> (20%), <strong>Assignment Completion</strong> (10%), and <strong>Director Direct Evaluation logs</strong> (10%).</p>
          </div>

          {/* Ranked list of Teachers */}
          <div className="space-y-4">
            {rankedTeachers.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-brand-blue/30 transition-all"
              >
                {/* Left profile info */}
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200/60" referrerPolicy="no-referrer" />
                    <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-brand-blue text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-850 dark:text-slate-100">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.subject} • {t.dept} Department</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-slate-950 px-1.5 py-0.2 rounded border">
                        ID: {t.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Progress Bars */}
                <div className="flex-1 max-w-sm space-y-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-slate-400">Weighted Performance score</span>
                    <span className="text-slate-850 dark:text-white">{t.overallScore} / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200/60">
                    <div 
                      className={`h-full rounded-full ${
                        t.overallScore >= 95 ? 'bg-emerald-500' :
                        t.overallScore >= 90 ? 'bg-brand-blue' : 'bg-amber-500'
                      }`} 
                      style={{ width: `${t.overallScore}%` }} 
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9.5px] text-slate-400 font-mono font-semibold">
                    <span>Stu Eval: {t.ratings.student * 20}%</span>
                    <span>•</span>
                    <span>Par Eval: {t.ratings.parent * 20}%</span>
                    <span>•</span>
                    <span>Assig: {t.assignmentCompletion}%</span>
                    <span>•</span>
                    <span>Dir Eval: {t.directorEval}%</span>
                  </div>
                </div>

                {/* Performance feedback badge actions */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded-lg ${
                    t.overallScore >= 95 ? 'bg-emerald-500/10 text-emerald-600' :
                    t.overallScore >= 90 ? 'bg-brand-blue/10 text-brand-indigo dark:text-brand-sky' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {t.overallScore >= 95 ? 'Elite Faculty' :
                     t.overallScore >= 90 ? 'Commendable' : 'Proficient'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
