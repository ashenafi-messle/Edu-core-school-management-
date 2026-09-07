/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Award, TrendingUp, Filter, Search, Download, 
  ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { SubjectStats } from './StudentMockData';

interface AcademicProgressViewProps {
  subjects: SubjectStats[];
}

export const AcademicProgressView: React.FC<AcademicProgressViewProps> = ({ subjects }) => {
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('Semester 2');
  const [searchSubject, setSearchSubject] = useState('');

  // Performance Trend Chart Data
  const trendData = [
    { name: 'Grade 9 S1', gpa: 3.65, average: 88.5 },
    { name: 'Grade 9 S2', gpa: 3.72, average: 90.2 },
    { name: 'Grade 10 S1', gpa: 3.80, average: 91.8 },
    { name: 'Grade 10 S2 (Current)', gpa: 3.86, average: 92.4 }
  ];

  // Calculations
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchesSearch = sub.subject.toLowerCase().includes(searchSubject.toLowerCase());
      return matchesSearch;
    });
  }, [subjects, searchSubject]);

  const subjectStatsSum = useMemo(() => {
    if (filteredSubjects.length === 0) return { highest: 0, lowest: 0, average: 0 };
    const marks = filteredSubjects.map(s => s.overall);
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const average = parseFloat((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1));
    return { highest, lowest, average };
  }, [filteredSubjects]);

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Cumulative GPA</span>
          <p className="text-3xl font-black text-brand-blue dark:text-brand-sky">3.86 <span className="text-xs text-slate-400 font-normal">/ 4.00</span></p>
          <span className="text-[10px] text-emerald-500 font-bold block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+0.06 Improvement from S1</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Academic Standing</span>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-1.5">Excellent (Honors List)</p>
          <span className="text-[10px] text-slate-400 block">Qualified for National Merit Track</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Class Rank Position</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">#04 <span className="text-xs text-slate-400 font-normal">/ 120</span></p>
          <span className="text-[10px] text-emerald-500 font-bold block">Top 3.3% Percentile Bracket</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Term Course Average</span>
          <p className="text-3xl font-black text-emerald-500">{subjectStatsSum.average}%</p>
          <span className="text-[10px] text-slate-400 block">Calculated over {filteredSubjects.length} subjects</span>
        </div>

      </div>

      {/* 2. Charts and Statistics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (Recharts) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">GPA Performance Multi-Term Trend</h3>
              <p className="text-[10px] text-slate-500">Longitudinal GPA development since enrollment</p>
            </div>
            <span className="text-[10.5px] font-mono font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Upward trajectory</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontStyle="mono" />
                <YAxis domain={[3.0, 4.0]} stroke="#94a3b8" fontSize={10} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGpa)" name="GPA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Breakdown Stats */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono font-bold">Subject Statistics</h3>
            <p className="text-[10px] text-slate-500">Quarterly gradebook spread analytics</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Highest Overall Mark</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{subjectStatsSum.highest}%</p>
                <span className="text-[9px] text-brand-blue font-bold">Multivariable Calculus (Sarah Jenkins)</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-brand-blue font-black">H</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold block">Lowest Overall Mark</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{subjectStatsSum.lowest}%</p>
                <span className="text-[9px] text-amber-500 font-bold">Contemporary History (Prof. Julian Vane)</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black">L</div>
            </div>

          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-850 text-center">
            <span className="text-[10px] text-slate-400 font-mono">Academic parameters calculated dynamically</span>
          </div>
        </div>

      </div>

      {/* 3. Filtering Desk */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-mono font-bold focus:outline-none bg-transparent"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-mono font-bold focus:outline-none bg-transparent"
            >
              <option value="Semester 2">Semester 2 (Spring)</option>
              <option value="Semester 1">Semester 1 (Autumn)</option>
            </select>
          </div>

        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by subject name..."
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Subject Detail Grid / Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-left text-slate-400 font-mono uppercase tracking-wider text-[9.5px]">
                <th className="px-5 py-3 font-bold">Subject / Teacher</th>
                <th className="px-3 py-3 font-bold text-center">CA (15%)</th>
                <th className="px-3 py-3 font-bold text-center">Homework (15%)</th>
                <th className="px-3 py-3 font-bold text-center">Assignment (20%)</th>
                <th className="px-3 py-3 font-bold text-center">Mid Exam (20%)</th>
                <th className="px-3 py-3 font-bold text-center">Final Exam (30%)</th>
                <th className="px-3 py-3 font-bold text-center">Overall</th>
                <th className="px-3 py-3 font-bold text-center">Grade</th>
                <th className="px-5 py-3 font-bold">Teacher Feedback Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <span>No matching academic subjects found on the current ledger filter.</span>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                    <td className="px-5 py-3.5">
                      <div className="font-black text-slate-800 dark:text-slate-100">{sub.subject}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{sub.teacher}</div>
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{sub.ca}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{sub.homework}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{sub.assignment}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{sub.midExam}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{sub.finalExam}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-black text-slate-850 dark:text-white bg-slate-50/40 dark:bg-slate-950/20">{sub.overall}%</td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="text-[10.5px] font-black font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 leading-normal max-w-xs truncate" title={sub.comment}>
                      {sub.comment}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
