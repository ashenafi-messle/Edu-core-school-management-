/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Calendar, CheckCircle, AlertTriangle, HelpCircle, 
  XCircle, Download, ChevronLeft, ChevronRight, FileDown, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
interface AttendanceRecord {
  id: string;
  class_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  notes?: string;
  teacher?: { full_name?: string };
  subjects?: { subject_name?: string; subject_code?: string };
}

interface AttendanceViewProps {
  records: AttendanceRecord[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ records }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{date: string, status: string, reason: string} | null>(null);

  const present = records.filter(record => record.status === 'present').length;
  const absent = records.filter(record => record.status === 'absent').length;
  const late = records.filter(record => record.status === 'late').length;
  const excused = records.filter(record => record.status === 'excused').length;
  const attendanceRate = records.length ? Math.round(((present + late + excused) / records.length) * 10000) / 100 : 0;
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthRecords = records.filter(record => {
    const date = new Date(`${record.class_date}T00:00:00`);
    return date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
  });
  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthRecords = records.filter(record => new Date(`${record.class_date}T00:00:00`).getMonth() === month);
    const attended = monthRecords.filter(record => ['present', 'late', 'excused'].includes(record.status)).length;
    return { name: new Date(2000, month, 1).toLocaleDateString('en-US', { month: 'short' }), rate: monthRecords.length ? Math.round((attended / monthRecords.length) * 100) : 0 };
  });

  // Simulator
  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 1500);
  };

  const calendarDays = Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const record = records.find(h => h.class_date === dateStr);
    
    // Default statuses for calendar rendering
    let status: 'Present' | 'Late' | 'Absent' | 'Excused' | 'Weekend' | 'None' = record ? record.status[0].toUpperCase() + record.status.slice(1) as any : 'None';
    const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum).getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'Weekend';
    } else if (record) {
    }

    return {
      day: dayNum,
      date: dateStr,
      status,
      reason: record?.remarks || record?.notes || record?.subjects?.subject_name || 'No attendance record'
    };
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Attendance Rate</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{attendanceRate}%</p>
          <span className="text-[10px] text-slate-400">Target rate is 95%</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Days Present</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{present}</p>
          <span className="text-[10px] text-slate-400">Total sessions registered</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Days Absent</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{absent}</p>
          <span className="text-[10px] text-slate-400">Unexcused sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Days Late</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{late}</p>
          <span className="text-[10px] text-slate-400">Delayed check-ins</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm text-left col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Excused Leaves</span>
          <p className="text-2xl font-black text-blue-500 mt-1">{excused}</p>
          <span className="text-[10px] text-slate-400">Authorized medical/personal</span>
        </div>

      </div>

      {/* 2. Interactive Calendar & Month Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Calendar Grid View (Left 3 columns) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Interactive Month Matrix</h3>
              <p className="text-[10px] text-slate-500">{monthLabel} Attendance Log • Click any day for logs</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold font-mono">{monthLabel}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-mono font-bold text-[10px] text-slate-400 pb-2 border-b">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          {/* Pad the first 3 empty slots for Wed start */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            <span className="text-slate-200 p-2 text-center" />
            <span className="text-slate-200 p-2 text-center" />
            
            {calendarDays.map((d) => {
              let statusBg = 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-slate-300';
              if (d.status === 'Present') statusBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20';
              if (d.status === 'Absent') statusBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20';
              if (d.status === 'Late') statusBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20';
              if (d.status === 'Excused') statusBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20';
              if (d.status === 'Weekend') statusBg = 'bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 cursor-not-allowed';

              return (
                <button
                  key={d.day}
                  disabled={d.status === 'Weekend'}
                  onClick={() => setSelectedDayDetail({ date: d.date, status: d.status, reason: d.reason })}
                  className={`p-2 rounded-lg text-[10.5px] font-mono font-bold text-center transition-all ${statusBg}`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Selected Day Status Bar */}
          <AnimatePresence>
            {selectedDayDetail ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 flex items-center justify-between"
              >
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Log Details • {selectedDayDetail.date}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{selectedDayDetail.reason}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    selectedDayDetail.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' :
                    selectedDayDetail.status === 'Absent' ? 'bg-rose-500/10 text-rose-600' :
                    selectedDayDetail.status === 'Late' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {selectedDayDetail.status}
                  </span>
                  <button onClick={() => setSelectedDayDetail(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">×</button>
                </div>
              </motion.div>
            ) : (
              <div className="p-3 text-center text-[10px] text-slate-400 font-mono italic">
                💡 Click any weekday number to view physical check-in parameters and logs.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Attendance Rate Chart (Right 2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Monthly Rate Tracker</h3>
            <p className="text-[10px] text-slate-500">Attendance percentages since Semester enrollment</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={10} fontStyle="mono" stroke="#94a3b8" />
                <YAxis domain={[90, 100]} fontSize={10} fontStyle="mono" stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Presence Rate" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
            <span className="text-[10px] text-slate-400 font-mono">Download official calendar ledger PDF</span>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="h-8 px-3.5 rounded-lg bg-brand-blue hover:bg-brand-indigo text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <FileDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Report Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Attendance Ledger</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 3. Detailed Attendance History */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Recent Attendance Incidents & Log History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-left text-slate-400 font-mono uppercase tracking-wider text-[9.5px]">
                <th className="px-5 py-3 font-bold">Log Check-in Date</th>
                <th className="px-5 py-3 font-bold text-center">Roster Status</th>
                <th className="px-5 py-3 font-bold">Documented Reason / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {records.map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20">
                  <td className="px-5 py-3 font-mono font-bold text-slate-700 dark:text-slate-350">{record.class_date}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      record.status === 'present' ? 'bg-emerald-500/10 text-emerald-600' :
                      record.status === 'absent' ? 'bg-rose-500/10 text-rose-600 animate-pulse' :
                      record.status === 'late' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {record.status[0].toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{record.remarks || record.notes || record.subjects?.subject_name || record.teacher?.full_name || 'No remarks'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
