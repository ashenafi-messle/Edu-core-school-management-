/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Download, Printer, FileSpreadsheet, 
  CheckCircle, ShieldAlert, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';

export const ReportsManagement: React.FC = () => {
  const { students, teachers, registrations, parents, courses } = useDirectorData();
  const [reportType, setReportType] = useState<string>('students');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedData(null);
    setTimeout(() => {
      setIsGenerating(false);
      switch (reportType) {
        case 'students':
          setGeneratedData(students.map(s => ({ ID: s.id, Name: s.name, Level: `${s.grade}-${s.section}`, Attendance: s.attendance, Guardian: s.parentName, Status: s.status })));
          break;
        case 'teachers':
          setGeneratedData(teachers.map(t => ({ ID: t.id, Name: t.name, Speciality: t.subject, Dept: t.dept, 'Stu Eval': t.ratings.student, Status: t.status })));
          break;
        case 'admissions':
          setGeneratedData(registrations.map(r => ({ 'Reg Num': r.regNum, Name: r.studentName, Applied: r.appliedGrade, Guardian: r.parentName, Date: r.appDate, Status: r.status })));
          break;
        case 'courses':
          setGeneratedData(courses.map(c => ({ Code: c.code, Title: c.name, Level: c.grade, Instructor: c.teacher, Hours: c.weeklyHours, Status: c.status })));
          break;
        case 'parents':
          setGeneratedData(parents.map(p => ({ ID: p.id, Name: p.name, Email: p.email, Occupation: p.occupation, Mapped: `${p.childrenCount} kids`, Status: p.status })));
          break;
        default:
          setGeneratedData([]);
      }
    }, 700);
  };

  const simulateExport = (format: 'pdf' | 'excel' | 'print') => {
    if (!generatedData) {
      alert('Please compile the reporting ledger dataset first.');
      return;
    }
    const msg = format === 'pdf' ? 'Compiling vector fonts. PDF successfully generated and dispatched to downloads.' :
                format === 'excel' ? 'Exporting CSV matrices. Spreadsheet document downloaded successfully.' :
                'Opening OS document queue. Print matrix compiled successfully.';
    alert(msg);
  };

  return (
    <div className="space-y-6">
      
      {/* Parameters selector panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 text-left">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Reports Engine Console</h3>
          <p className="text-[10px] text-slate-500">Compile institutional registries and financial ledger profiles into official executive documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Ledger Template Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
            >
              <option value="students">Student Roster Registry Ledger</option>
              <option value="teachers">Faculty Appointment & Rating Matrix</option>
              <option value="admissions">Prospective Admissions Queue Report</option>
              <option value="courses">Syllabus Curriculum Class Listing</option>
              <option value="parents">Verified Parent & Emergency contact list</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">School Academic Year</label>
            <select className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none" disabled>
              <option>2026-2027 (Active Term)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-10 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Compile Reporting Dataset</span>
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {generatedData ? (
        <div className="space-y-4 text-left">
          
          {/* Action Export Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-350">Ledger Compiled successfully! Found {generatedData.length} records.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateExport('excel')}
                className="h-8 px-3 rounded-lg border bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => simulateExport('pdf')}
                className="h-8 px-3 rounded-lg border bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => simulateExport('print')}
                className="h-8 px-3 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-brand-indigo flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Compiled Records Preview Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto p-4">
              <div className="text-center border-b pb-4 mb-4 space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">EduCore Academy official report</h4>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">Confidential Executive Archive</p>
                <p className="text-[9px] text-slate-400 font-mono">Compiled on UTC: 2026-07-18 • Operator Signature Verified</p>
              </div>

              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-450 font-bold uppercase">
                    {Object.keys(generatedData[0]).map((key) => (
                      <th key={key} className="pb-2">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {generatedData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="py-2.5 font-semibold text-slate-700 dark:text-slate-350">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-bold">Preview is currently empty.</p>
          <p className="text-xs">Select a template above and compile the reporting database.</p>
        </div>
      )}

    </div>
  );
};
