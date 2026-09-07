/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, X, Eye, Edit, ClipboardCheck, Trash2, Award, 
  Phone, Mail, Calendar, Sparkles, Check, AlertCircle, BookOpen, UserMinus
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Teacher } from './types';

export const TeacherManagement: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deactivateTeacher, isLoadingTeachers, teachersError, teacherMetrics, isLoadingTeacherMetrics, refreshTeacherMetrics, sectionConfigurations, isLoadingSections } = useDirectorData();

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  // Modal / Selection
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Teacher | null>(null);
  const [drawerTab, setDrawerTab] = useState<'dossier' | 'performance' | 'attendance'>('dossier');

  // Add form state
  const [addForm, setAddForm] = useState({
    name: '',
    subject: '',
    dept: '',
    assignedGrades: 'Grade 9',
    assignedSections: 'Section A',
    phone: '',
    email: '',
    load: '15 hrs/wk'
  });

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Curriculum Assign state
  const [assignForm, setAssignForm] = useState({
    sectionConfigurationId: '',
    grade: 'Grade 9',
    section: 'Section A'
  });

  const handleOpenAddModal = () => {
    setAddForm({
      name: '',
      subject: '',
      dept: '',
      assignedGrades: 'Grade 9',
      assignedSections: 'Section A',
      phone: '',
      email: '',
      load: '16 hrs/wk'
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.subject || !addForm.email) {
      alert('Please fill in all required fields (Name, Subject, and Email)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTeacher({
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        name: addForm.name,
        subject: addForm.subject,
        dept: addForm.dept,
        assignedGrades: [addForm.assignedGrades],
        assignedSections: [addForm.assignedSections],
        phone: addForm.phone || '+1 (555) 000-0000',
        email: addForm.email,
        status: 'Active',
        load: addForm.load
      });
      setShowAddModal(false);
      // Refresh metrics after adding teacher
      await refreshTeacherMetrics();
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssign = (t: Teacher) => {
    setAssignTarget(t);
    // Set default to first available section configuration
    if (sectionConfigurations.length > 0) {
      const firstSection = sectionConfigurations[0];
      setAssignForm({
        sectionConfigurationId: firstSection.id,
        grade: firstSection.grade_level,
        section: firstSection.section_name
      });
    } else {
      setAssignForm({
        sectionConfigurationId: '',
        grade: 'Grade 9',
        section: 'Section A'
      });
    }
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget || !assignForm.sectionConfigurationId) return;

    setIsUpdating(true);
    try {
      // Find the selected section configuration
      const selectedSection = sectionConfigurations.find(s => s.id === assignForm.sectionConfigurationId);
      if (!selectedSection) {
        alert('Invalid section configuration selected');
        return;
      }

      const grades = [selectedSection.grade_level];
      const sections = [selectedSection.section_name];

      await updateTeacher(assignTarget.id, {
        assignedGrades: grades,
        assignedSections: sections
      });

      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning classes:', error);
      alert('Failed to assign classes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'all' || t.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  // Get unique departments from teachers for filter dropdown
  const departments = Array.from(new Set(teachers.map(t => t.dept).filter(Boolean)));

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-left">
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Hired Faculty Count</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {isLoadingTeacherMetrics ? '...' : teacherMetrics.facultyCount}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-left">
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Average Evaluation Rating</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {isLoadingTeacherMetrics ? '...' : `${teacherMetrics.averageEvaluationRating}%`}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-left">
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Syllabus Completion Rate</p>
          <p className="text-2xl font-black text-brand-blue mt-1">
            {isLoadingTeacherMetrics ? '...' : `${teacherMetrics.syllabusCompletionRate}%`}
          </p>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoadingTeachers && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Loading teachers...</p>
        </div>
      )}

      {teachersError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">{teachersError}</p>
          </div>
        </div>
      )}

      {/* Control panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by faculty name, subject, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="h-9.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Faculty list table */}
      {!isLoadingTeachers && !teachersError && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">Faculty Member</th>
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">Department</th>
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">Assignment</th>
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contact</th>
                  <th className="px-5 py-3 font-mono font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white font-bold text-xs">
                          {t.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.employee_id || t.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">{t.dept}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono ${
                        t.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-mono">Grades: {t.assignedGrades.join(', ')}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Sections: {t.assignedSections.join(', ')}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {t.email}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {t.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setSelectedTeacher(t); setShowProfileDrawer(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-blue cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenAssign(t)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-blue cursor-pointer"
                          title="Assign Classes"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={async () => {
                            try {
                              await deactivateTeacher(t.id);
                              // Refresh metrics after deactivating teacher
                              await refreshTeacherMetrics();
                            } catch (error) {
                              console.error('Error deactivating teacher:', error);
                              alert('Failed to deactivate teacher. Please try again.');
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Deactivate Faculty"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher detailed profile drawer */}
      <AnimatePresence>
        {showProfileDrawer && selectedTeacher && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 text-left border-l border-slate-200/60 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Faculty Dossier</h3>
                  <p className="text-xs text-slate-400 font-sans">Institutional records profile of {selectedTeacher.name}</p>
                </div>
                <button onClick={() => setShowProfileDrawer(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TABS CONTAINER */}
              <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 p-1 gap-1 text-xs font-bold text-slate-500">
                {(['dossier', 'performance', 'attendance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    className={`flex-1 py-2 rounded-lg transition-all capitalize cursor-pointer ${
                      drawerTab === tab 
                        ? 'bg-white dark:bg-slate-900 text-brand-blue shadow-xs font-black' 
                        : 'hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: DOSSIER */}
              {drawerTab === 'dossier' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {selectedTeacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedTeacher.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTeacher.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                          selectedTeacher.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {selectedTeacher.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-brand-blue/10 text-brand-blue text-[10px] font-bold font-mono">
                          {selectedTeacher.dept}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Primary Email</span>
                      <span className="font-mono font-bold text-xs">{selectedTeacher.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Subject Specialization</span>
                      <span className="font-mono font-bold text-xs">{selectedTeacher.subject}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Current Teaching Load</span>
                      <span className="font-mono font-bold text-xs">{selectedTeacher.load}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Assigned Grade-Sections</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTeacher.assignedGrades.map((g, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                            {g} - {selectedTeacher.assignedSections[idx] || 'Section A'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Primary Phone Coordinate</span>
                      <span className="font-mono font-bold">{selectedTeacher.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Onboarding Date</span>
                      <span className="font-mono font-bold">{selectedTeacher.employmentDate}</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2 text-left">
                    <h5 className="text-[10.5px] font-mono font-bold uppercase text-slate-400 tracking-wider">Verified Pedagogical Strengths</h5>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs space-y-2.5 text-emerald-700 dark:text-emerald-400">
                      {selectedTeacher.strengths.map((s, i) => (
                        <p key={i} className="flex items-start gap-1.5">
                          <span className="text-[11px]">✦</span>
                          <span className="font-sans leading-normal">{s}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="space-y-2 text-left">
                    <h5 className="text-[10.5px] font-mono font-bold uppercase text-slate-400 tracking-wider">Target Faculty Mentorship focus</h5>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs space-y-2.5 text-amber-700 dark:text-amber-400">
                      {selectedTeacher.areasForImprovement.map((a, i) => (
                        <p key={i} className="flex items-start gap-1.5">
                          <span className="text-[11px]">✦</span>
                          <span className="font-sans leading-normal">{a}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PERFORMANCE */}
              {drawerTab === 'performance' && (
                <div className="space-y-5 animate-fade-in text-left">
                  {/* Performance metrics breakdown cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Student Evaluation</span>
                      <span className="text-base font-black text-brand-blue font-mono">{selectedTeacher.ratings.student} / 5.0</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-850">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Parent Survey</span>
                      <span className="text-base font-black text-emerald-500 font-mono">{selectedTeacher.ratings.parent} / 5.0</span>
                    </div>
                  </div>

                  {/* Progress score ledger meters */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Executive Performance metrics</h5>
                    
                    <div className="space-y-4 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                      {/* Director evaluation */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>Director Evaluative Assessment</span>
                          <span className="text-brand-blue font-mono">{selectedTeacher.directorEval}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue rounded-full" style={{ width: `${selectedTeacher.directorEval}%` }} />
                        </div>
                      </div>

                      {/* Assignment completion */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>Assignment Submission & Grading</span>
                          <span className="text-emerald-500 font-mono">{selectedTeacher.assignmentCompletion}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedTeacher.assignmentCompletion}%` }} />
                        </div>
                      </div>

                      {/* Syllabus coverage */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>Target Syllabus Coverage Index</span>
                          <span className="text-purple-500 font-mono">92%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ATTENDANCE */}
              {drawerTab === 'attendance' && (
                <div className="space-y-5 animate-fade-in text-left">
                  <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Academic Year Attendance Ledger</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-[9px] font-mono text-emerald-400 block font-bold uppercase tracking-wider">Present Days</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{selectedTeacher.attendance.present}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                      <span className="text-[9px] font-mono text-rose-400 block font-bold uppercase tracking-wider">Absent Days</span>
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{selectedTeacher.attendance.absent}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] font-mono text-amber-400 block font-bold uppercase tracking-wider">Late Arrivals</span>
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{selectedTeacher.attendance.late}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Leave Days</span>
                      <span className="text-2xl font-black text-slate-600 dark:text-slate-400 font-mono">{selectedTeacher.attendance.leave}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Overall Attendance Rate</span>
                      <span className="text-sm font-black text-brand-blue font-mono">
                        {((selectedTeacher.attendance.present / (selectedTeacher.attendance.present + selectedTeacher.attendance.absent + selectedTeacher.attendance.late + selectedTeacher.attendance.leave)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ 
                        width: `${(selectedTeacher.attendance.present / (selectedTeacher.attendance.present + selectedTeacher.attendance.absent + selectedTeacher.attendance.late + selectedTeacher.attendance.leave)) * 100}%` 
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          ADD TEACHER FACULTY MODAL
          ============================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Appoint Faculty Member</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Faculty Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    placeholder="e.g. Dr. Thomas Wright"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Specialty Subject *</label>
                    <input
                      type="text"
                      required
                      value={addForm.subject}
                      onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      placeholder="e.g. World History"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Department</label>
                    <input
                      type="text"
                      value={addForm.dept}
                      onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      placeholder="e.g. Sciences"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Primary Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    placeholder="faculty.email@educore.edu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Weekly Target Hours</label>
                    <input
                      type="text"
                      value={addForm.load}
                      onChange={(e) => setAddForm({ ...addForm, load: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      placeholder="e.g. 16 hrs/wk"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Contact Mobile</label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Appoint Faculty
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          ASSIGN CLASSES MODAL
          ============================================== */}
      <AnimatePresence>
        {showAssignModal && assignTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Assign Classes</h3>
                  <p className="text-xs text-slate-400 font-sans">For {assignTarget.name}</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
                {isLoadingSections ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue mr-3"></div>
                    <p className="text-xs text-slate-500">Loading available sections...</p>
                  </div>
                ) : sectionConfigurations.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      No section configurations found. Please create sections in Student Management first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Available Sections</label>
                    <select
                      value={assignForm.sectionConfigurationId}
                      onChange={(e) => {
                        const selectedSection = sectionConfigurations.find(s => s.id === e.target.value);
                        if (selectedSection) {
                          setAssignForm({
                            sectionConfigurationId: selectedSection.id,
                            grade: selectedSection.grade_level,
                            section: selectedSection.section_name
                          });
                        }
                      }}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select a section...</option>
                      {sectionConfigurations.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.grade_level} - {section.section_name} (Capacity: {section.current_count}/{section.max_capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isUpdating || !assignForm.sectionConfigurationId}
                    className="px-4 py-2 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-3 h-3" />
                        Assign Classes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};