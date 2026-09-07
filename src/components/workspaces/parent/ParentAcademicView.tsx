/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, Cell 
} from 'recharts';
import { 
  Award, BookOpen, Calendar, Filter, Download, Info, 
  HelpCircle, Star, Sparkles, UserCheck 
} from 'lucide-react';
import { ChildProfile, AcademicRecord, SUBJECT_MARKS, SubjectMarkDetail } from './ParentMockData';

interface ParentAcademicViewProps {
  selectedChild: ChildProfile;
  academicRecords: AcademicRecord[];
  mode: 'progress' | 'subject_marks';
}

export const ParentAcademicView: React.FC<ParentAcademicViewProps> = ({
  selectedChild,
  academicRecords,
  mode
}) => {
  const [filterYear, setFilterYear] = useState('2025-2026');
  const [filterSemester, setFilterSemester] = useState('Semester 1');
  const [searchSubject, setSearchSubject] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter subject marks
  const childSubjectMarks: SubjectMarkDetail[] = SUBJECT_MARKS[selectedChild.id] || [];
  
  const filteredMarks = childSubjectMarks.filter(mark => {
    const matchesYear = filterYear === 'all' || mark.year === filterYear;
    const matchesSemester = filterSemester === 'all' || mark.semester === filterSemester;
    const matchesSearch = mark.subjectName.toLowerCase().includes(searchSubject.toLowerCase());
    return matchesYear && matchesSemester && matchesSearch;
  });

  const filteredProgressRecords = academicRecords.filter(rec => 
    rec.subject.toLowerCase().includes(searchSubject.toLowerCase())
  );

  // Chart data formatting
  const chartData = filteredMarks.map(m => ({
    subject: m.subjectName,
    'Overall Score': m.overallMark,
    'Homework': m.homeworkMarks,
    'Assignments': m.assignmentMarks,
    'Quizzes': m.quizMarks,
    'Midterm': m.midtermMarks,
    'Final Exam': m.finalExamMarks
  }));

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper Information Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-blue uppercase px-2 py-0.5 bg-brand-blue/10 rounded">
            Dependent Academic Dossier
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
            {mode === 'progress' ? 'Academic Progress & Trends' : 'Term Subject Marks Board'}
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">
            Active child target: <span className="font-bold text-slate-800 dark:text-white">{selectedChild.name} ({selectedChild.grade})</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="px-4.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting PDF...' : downloadSuccess ? 'Downloaded!' : 'Download Report Card'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top level summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Overall GPA</span>
          <span className="text-xl font-black text-brand-blue font-mono mt-1 block">{selectedChild.gpa}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Average Mark</span>
          <span className="text-xl font-black text-slate-800 dark:text-white font-mono mt-1 block">{selectedChild.average}%</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Academic Status</span>
          <span className="text-xl font-black text-emerald-500 font-sans mt-1 block flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black">{selectedChild.academicStatus}</span>
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Attendance</span>
          <span className="text-xl font-black text-emerald-500 font-mono mt-1 block">{selectedChild.attendance}%</span>
        </div>
      </div>

      {/* 3. Filters Desk */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Academic Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none"
            >
              <option value="all">All Years</option>
              <option value="2025-2026">2025-2026 Term</option>
              <option value="2026-2027">2026-2027 Term</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none"
            >
              <option value="all">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <div className="space-y-1 text-left flex-1 min-w-[150px]">
            <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Filter by Subject</label>
            <input
              type="text"
              placeholder="Search subject..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Last Updated</span>
          <span className="text-xs text-slate-650 dark:text-slate-350 font-mono">Today, 02:00 AM</span>
        </div>
      </div>

      {/* 4. Subject Records / Marks List */}
      {mode === 'progress' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[9.5px] uppercase font-bold">
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Instructor</th>
                  <th className="py-3 px-5 text-center">Homework</th>
                  <th className="py-3 px-5 text-center">Assignments</th>
                  <th className="py-3 px-5 text-center">Mid Exam</th>
                  <th className="py-3 px-5 text-center">Final Exam</th>
                  <th className="py-3 px-5 text-center">Overall</th>
                  <th className="py-3 px-5 text-center">Grade</th>
                  <th className="py-3 px-5">Teacher Advisory Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredProgressRecords.length > 0 ? (
                  filteredProgressRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <td className="py-4 px-5 font-sans font-bold text-slate-850 dark:text-white">{rec.subject}</td>
                      <td className="py-4 px-5 font-sans text-slate-550 dark:text-slate-400">{rec.teacher}</td>
                      <td className="py-4 px-5 text-center">{rec.homework}</td>
                      <td className="py-4 px-5 text-center">{rec.assignments}</td>
                      <td className="py-4 px-5 text-center">{rec.midExam}</td>
                      <td className="py-4 px-5 text-center">{rec.finalExam}</td>
                      <td className="py-4 px-5 text-center font-bold text-brand-blue">{rec.overallMark}%</td>
                      <td className="py-4 px-5 text-center">
                        <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded font-black text-[10px]">
                          {rec.grade}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-sans text-slate-500 leading-relaxed text-[10.5px] max-w-xs truncate" title={rec.teacherComment}>
                        "{rec.teacherComment}"
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 px-5 text-center italic text-slate-450">No academic progress records match filter criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[9.5px] uppercase font-bold">
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Teacher</th>
                  <th className="py-3 px-5 text-center">HW (100)</th>
                  <th className="py-3 px-5 text-center">Asst (100)</th>
                  <th className="py-3 px-5 text-center">Quiz (100)</th>
                  <th className="py-3 px-5 text-center">Mid (100)</th>
                  <th className="py-3 px-5 text-center">Final (100)</th>
                  <th className="py-3 px-5 text-center">Overall</th>
                  <th className="py-3 px-5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredMarks.length > 0 ? (
                  filteredMarks.map((mark, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <td className="py-4 px-5 font-sans font-bold text-slate-850 dark:text-white">{mark.subjectName}</td>
                      <td className="py-4 px-5 font-sans text-slate-550 dark:text-slate-400">{mark.teacher}</td>
                      <td className="py-4 px-5 text-center">{mark.homeworkMarks}</td>
                      <td className="py-4 px-5 text-center">{mark.assignmentMarks}</td>
                      <td className="py-4 px-5 text-center">{mark.quizMarks}</td>
                      <td className="py-4 px-5 text-center">{mark.midtermMarks}</td>
                      <td className="py-4 px-5 text-center">{mark.finalExamMarks}</td>
                      <td className="py-4 px-5 text-center font-bold text-brand-indigo dark:text-brand-sky">{mark.overallMark}%</td>
                      <td className="py-4 px-5 text-center">
                        <span className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo dark:text-brand-sky rounded font-black text-[10px]">
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 px-5 text-center italic text-slate-450">No subject marks found for current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Visualization Recharts Panels */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Subject Comparison Graph</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Performance indices by syllabus weights</p>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Overall Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Final Exam" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Syllabus Component Breakdown</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Component tracking metrics for tests and homework</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Homework" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Assignments" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Midterm" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
