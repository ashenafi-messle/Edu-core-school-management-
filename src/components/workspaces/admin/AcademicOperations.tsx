/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, Calendar, BookOpen, Search, Filter, Check, X, 
  Plus, Edit, Trash2, Settings, Server, Layers, Award, Printer, ArrowRight 
} from 'lucide-react';
import { StudentReadmission } from './AdminTypes';

// ============================================================================
// 1. STUDENT READMISSION MANAGEMENT COMPONENT
// ============================================================================

interface StudentReadmissionManagementProps {
  readmissions: StudentReadmission[];
  onUpdateReadmission: (id: string, updated: Partial<StudentReadmission>) => void;
  triggerToast: (msg: string) => void;
}

export const StudentReadmissionManagement: React.FC<StudentReadmissionManagementProps> = ({
  readmissions,
  onUpdateReadmission,
  triggerToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeReadmId, setActiveReadmId] = useState<string | null>(null);

  // Assignment states
  const [assignedSection, setAssignedSection] = useState('Section A');
  const [requestedGradeVal, setRequestedGradeVal] = useState('');

  const activeReadm = readmissions.find(r => r.id === activeReadmId);

  const filtered = readmissions.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveReadm = (id: string) => {
    onUpdateReadmission(id, {
      status: 'Approved',
      assignedSection: assignedSection || 'Section A',
      requestedGrade: requestedGradeVal || activeReadm?.requestedGrade
    });
    triggerToast(`Approved readmission. Re-enrolled into ${requestedGradeVal || activeReadm?.requestedGrade} - ${assignedSection || 'Section A'}.`);
    setActiveReadmId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-slate-400">Readmission Submissions</span>
          <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">{readmissions.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-amber-500">Awaiting Assignment</span>
          <p className="text-xl font-black mt-1 text-amber-500">{readmissions.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-emerald-500">Enrolled Completed</span>
          <p className="text-xl font-black mt-1 text-emerald-500">{readmissions.filter(r => r.status === 'Approved').length}</p>
        </div>
      </div>

      {/* Filter and Table Row */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-left">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Readmissions</option>
            <option value="Pending">Pending Assignment</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={() => triggerToast("Printing readmission reports...")}
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-xs font-bold font-mono flex items-center gap-1 text-slate-755 dark:text-slate-300 cursor-pointer justify-center self-stretch sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Admissions Queue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Main Queue List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                  <th className="py-3 px-5">Student ID</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Prev Placement</th>
                  <th className="py-3 px-5">Requested Grade</th>
                  <th className="py-3 px-5">Standing</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filtered.map((readm) => (
                  <tr key={readm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/15">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-brand-indigo">{readm.studentId}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-850 dark:text-white">{readm.studentName}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-450">{readm.previousGrade} - {readm.previousSection}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-850 dark:text-white">{readm.requestedGrade}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                        readm.academicStanding === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {readm.academicStanding}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                        readm.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {readm.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          setActiveReadmId(readm.id);
                          setRequestedGradeVal(readm.requestedGrade);
                          setAssignedSection(readm.assignedSection || 'Section A');
                        }}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 text-slate-700 cursor-pointer ml-auto"
                      >
                        <Settings className="w-3.5 h-3.5 animate-spin" />
                        <span>Configure</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Readmission Configuration details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Division Configuration</h3>

          {activeReadm ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block">RE-ENROLLMENT LOG</span>
                <p className="font-bold text-slate-850 dark:text-white text-sm leading-tight">{activeReadm.studentName}</p>
                <p className="text-[11px] font-mono text-slate-450">{activeReadm.studentId} • Standing: {activeReadm.academicStanding}</p>
              </div>

              <div className="p-3.5 bg-brand-blue/5 rounded-xl border border-brand-blue/15 text-[11.5px] leading-relaxed">
                <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider block mb-1">Parent Explanation</span>
                "{activeReadm.reason}"
              </div>

              <div className="space-y-3">
                <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase block pb-1 border-b border-dashed border-slate-200">Re-Admit Target Section</span>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono">Assigned Grade Level</label>
                    <input
                      type="text"
                      value={requestedGradeVal}
                      onChange={(e) => setRequestedGradeVal(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 bg-slate-50/50 rounded-lg mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono">Assigned Class Section</label>
                    <select
                      value={assignedSection}
                      onChange={(e) => setAssignedSection(e.target.value)}
                      className="w-full h-9 px-2 border border-slate-200 bg-slate-50/50 rounded-lg mt-1"
                    >
                      <option value="Section A">Section A - Ivy Hall</option>
                      <option value="Section B">Section B - Oak Hall</option>
                      <option value="Section C">Section C - Pine Lab</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleApproveReadm(activeReadm.id)}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Deploy Readmission Placement</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 text-xs italic">
              Please click "Configure" on a returning student readmission to allocate division sections and deploy placements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. ACADEMIC YEAR MANAGEMENT COMPONENT
// ============================================================================

export const AcademicYearManagement: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [years, setYears] = useState([
    { id: 'ay-1', year: '2025/2026', semester: 'Semester 2', status: 'Current' },
    { id: 'ay-2', year: '2026/2027', semester: 'Semester 1 (Admissions Opened)', status: 'Active' },
    { id: 'ay-3', year: '2024/2025', semester: 'Semester 2', status: 'Archived' }
  ]);

  const [newYearInput, setNewYearInput] = useState('');
  const [newSemesterInput, setNewSemesterInput] = useState('Semester 1');

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput) return;
    setYears(prev => [
      ...prev,
      { id: `ay-${Date.now()}`, year: newYearInput, semester: newSemesterInput, status: 'Active' }
    ]);
    triggerToast(`Added academic calendar year: ${newYearInput} ${newSemesterInput}`);
    setNewYearInput('');
  };

  const handleToggleCurrent = (id: string) => {
    setYears(prev => prev.map(y => {
      if (y.id === id) return { ...y, status: 'Current' };
      if (y.status === 'Current') return { ...y, status: 'Archived' };
      return y;
    }));
    triggerToast("Active academic calendar rotated. Past term archived.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* List of Academic terms */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Academic Year Timeline</h3>
          <p className="text-[10px] text-slate-450">Active school registration calendars and legacy archives</p>
        </div>

        <div className="divide-y divide-slate-100">
          {years.map((y) => (
            <div key={y.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-white">{y.year} Academic Year</h4>
                  <p className="text-[10px] font-mono text-slate-450">{y.semester}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  y.status === 'Current' ? 'bg-emerald-500/10 text-emerald-600' :
                  y.status === 'Active' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-500'
                }`}>
                  {y.status}
                </span>

                {y.status === 'Active' && (
                  <button
                    onClick={() => handleToggleCurrent(y.id)}
                    className="px-2 py-1 border border-brand-blue hover:bg-brand-blue/5 text-brand-blue font-mono text-[10px] font-bold rounded cursor-pointer"
                  >
                    Set Active Current
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Calendar Terms form */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono font-bold">Deploy New Calendar</h3>
          <p className="text-[10px] text-slate-450">Instantiate upcoming terms onto database registries</p>
        </div>

        <form onSubmit={handleAddYear} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-450 font-bold uppercase block">Year Structure</label>
            <input
              type="text"
              required
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="e.g. 2027/2028"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-450 font-bold uppercase block">Starting Term</label>
            <select
              value={newSemesterInput}
              onChange={(e) => setNewSemesterInput(e.target.value)}
              className="w-full h-10 px-2 border border-slate-200 rounded-lg text-xs cursor-pointer"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Trimester A">Trimester A</option>
              <option value="Quarter Autumn">Quarter Autumn</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Term Calendar</span>
          </button>
        </form>
      </div>

    </div>
  );
};

// ============================================================================
// 3. GRADE & SECTION CONFIGURATION COMPONENT
// ============================================================================

export const GradeSectionConfiguration: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [grades, setGrades] = useState([
    { id: 'g-1', label: 'Grade 8', sectionCount: 2, dept: 'Middle School' },
    { id: 'g-2', label: 'Grade 9', sectionCount: 3, dept: 'High School General' },
    { id: 'g-3', label: 'Grade 10', sectionCount: 3, dept: 'High School Sciences' },
    { id: 'g-4', label: 'Grade 11', sectionCount: 2, dept: 'Pre-University' }
  ]);

  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'classrooms'>('grades');

  const [gradeInput, setGradeInput] = useState('');
  const [deptInput, setDeptInput] = useState('High School Sciences');

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeInput) return;
    setGrades(prev => [
      ...prev,
      { id: `g-${Date.now()}`, label: gradeInput, sectionCount: 1, dept: deptInput }
    ]);
    triggerToast(`Added grade level: ${gradeInput} under ${deptInput}`);
    setGradeInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Class divisions spreadsheet */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        
        {/* Toggle navigation bar inside */}
        <div className="flex border-b border-slate-100 pb-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeTab === 'grades' ? 'bg-brand-blue text-white font-bold' : 'text-slate-450 hover:bg-slate-50'}`}
          >
            Grade Levels
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeTab === 'subjects' ? 'bg-brand-blue text-white font-bold' : 'text-slate-450 hover:bg-slate-50'}`}
          >
            Subject Fields
          </button>
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeTab === 'classrooms' ? 'bg-brand-blue text-white font-bold' : 'text-slate-450 hover:bg-slate-50'}`}
          >
            Classrooms Allocation
          </button>
        </div>

        {activeTab === 'grades' && (
          <div className="divide-y divide-slate-100 font-mono text-xs">
            {grades.map((g) => (
              <div key={g.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-slate-450" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{g.label}</h4>
                    <p className="text-[10px] text-slate-450">{g.dept}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-slate-500 font-bold">{g.sectionCount} Active Sections</span>
                  <button
                    onClick={() => {
                      setGrades(prev => prev.filter(gr => gr.id !== g.id));
                      triggerToast(`Dismantled Grade Level: ${g.label}`);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {[
              { code: 'MATH-101', name: 'Algebra and Trigonometry', dept: 'Mathematics' },
              { code: 'CHEM-202', name: 'Organic Chemistry Lab', dept: 'Natural Sciences' },
              { code: 'HIST-301', name: 'Modern World Chronologies', dept: 'Humanities' },
              { code: 'COMP-110', name: 'Intro to Computational Logic', dept: 'Computer Science' }
            ].map((sub) => (
              <div key={sub.code} className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-white">{sub.name}</h4>
                  <p className="text-[10px] text-slate-450">{sub.code} • Dept: {sub.dept}</p>
                </div>
                <span className="text-[10px] font-black bg-brand-blue/15 text-brand-blue px-2 py-0.5 rounded">ELECTIVE</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'classrooms' && (
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {[
              { hall: 'Ivy Academic Hall', room: 'Room 4A', capacity: 32, tech: 'Smartboard Projection v2' },
              { hall: 'Ivy Academic Hall', room: 'Room 4B', capacity: 32, tech: 'Smartboard Projection v2' },
              { hall: 'Science Laboratory Complex', room: 'Lab Delta', capacity: 24, tech: 'Fume Hoods & Nitrogen lines' },
              { hall: 'Oak West Quad', room: 'Room 12', capacity: 40, tech: 'Standard Chalkboard + LED Screen' }
            ].map((cls) => (
              <div key={cls.room} className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-white">{cls.hall} - {cls.room}</h4>
                  <p className="text-[10px] text-slate-450">Max Seating: {cls.capacity} • Equipments: {cls.tech}</p>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">● STANDBY</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Build level form */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono font-bold">Add Grade Division</h3>
          <p className="text-[10px] text-slate-450">Instantiate standard grade classes into division matrices</p>
        </div>

        <form onSubmit={handleAddGrade} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-450 font-bold uppercase block">Grade Label</label>
            <input
              type="text"
              required
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              placeholder="e.g. Grade 12"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-450 font-bold uppercase block">School Department</label>
            <select
              value={deptInput}
              onChange={(e) => setDeptInput(e.target.value)}
              className="w-full h-10 px-2 border border-slate-200 rounded-lg text-xs cursor-pointer"
            >
              <option value="Middle School">Middle School</option>
              <option value="High School General">High School General</option>
              <option value="High School Sciences">High School Sciences</option>
              <option value="Pre-University">Pre-University</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Grade Division</span>
          </button>
        </form>
      </div>

    </div>
  );
};
