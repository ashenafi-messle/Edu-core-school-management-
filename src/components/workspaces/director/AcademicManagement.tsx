/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Trash2, Edit, X, Calendar, MapPin, 
  User, CheckCircle2, AlertTriangle, BookMarked, Layers, Grid,
  Share2, Award, Sparkles, Sliders, RefreshCw, BarChart2, Eye, LayoutGrid
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Subject, TeacherSubjectAssignment, TeacherGradeSectionAssignment, TimetableSlot } from './types';
import { WeeklyTimetableBuilder } from './WeeklyTimetableBuilder';

export const AcademicManagement: React.FC = () => {
  const { 
    courses, addCourse, deleteCourse,
    timetableSlots, addTimetableSlot, deleteTimetableSlot,
    teachers, students,
    subjects, addSubject, updateSubject, deleteSubject, archiveSubject,
    teacherSubjectAssignments, addTeacherSubjectAssignment, deleteTeacherSubjectAssignment,
    subjectAssignmentFormData, isLoadingSubjectAssignmentFormData,
    timeSlots, weeklyTimetables, isLoadingTimeSlots, isLoadingWeeklyTimetables,
    loadTimeSlots, loadWeeklyTimetables, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
    currentAcademicYear, sectionConfigurations,
    schoolScheduleSettings, isLoadingSchoolScheduleSettings,
    saveSchoolScheduleSettings, generateTimeSlots
  } = useDirectorData();

  // Sub-tabs: 'subjects' | 'subject_assignments' | 'schedule' | 'visualization'
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'subject_assignments' | 'schedule' | 'visualization'>('subjects');
  
  // MODAL / DIALOG STATES
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSubjectAsgModal, setShowSubjectAsgModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleSettingsModal, setShowScheduleSettingsModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form notifications
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // FORM STATES
  const [subjectForm, setSubjectForm] = useState<Subject>({
    id: '',
    school_id: '',
    subject_code: '',
    subject_name: '',
    description: '',
    category: 'Core',
    weekly_hours: 4,
    status: 'Active',
    created_at: '',
    updated_at: '',
    
    // Legacy fields for backward compatibility
    code: '',
    name: '',
    desc: '',
    weeklyHours: 4
  });

  const [subjectAsgForm, setSubjectAsgForm] = useState({
    teacherId: '',
    subjectCode: '',
    academicYearId: '',
    academicYear: '2026-2027',
    grade: '',
    section: '',
    semester: 'Fall' as 'Fall' | 'Spring' | 'Summer' | 'Winter',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 'Monday',
    time_slot_id: '',
    teacher_id: '',
    subject_id: '',
    section_configuration_id: '',
    room_number: 'Room 201',
    notes: ''
  });

  const [scheduleSettingsForm, setScheduleSettingsForm] = useState({
    period_duration_minutes: 60,
    number_of_periods_per_day: 7,
    school_start_time: '09:00',
    school_end_time: '15:45',
    lunch_break_enabled: true,
    lunch_break_duration_minutes: 60,
    lunch_break_after_period: 4,
    lunch_break_start_time: '12:30',
    additional_breaks: [] as Array<{ name: string; duration: number; after_period: number }>
  });

  // Filters for visualization / workload
  const [vizFilterTeacher, setVizFilterTeacher] = useState('all');
  const [vizFilterGrade, setVizFilterGrade] = useState('all');

  const categories = ['Core', 'Elective', 'Extra-curricular'];
  const semesters = subjectAssignmentFormData.semesters || ['Fall', 'Spring', 'Summer', 'Winter'];
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // SUBMIT HANDLERS
  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectCode = subjectForm.subject_code || subjectForm.code;
    const subjectName = subjectForm.subject_name || subjectForm.name;
    
    if (!subjectCode || !subjectName) return;

    if (editingSubject) {
      updateSubject(subjectCode, subjectForm);
    } else {
      // Check duplicate
      if (subjects.some(s => (s.subject_code?.toUpperCase() === subjectCode.toUpperCase() || s.code?.toUpperCase() === subjectCode.toUpperCase()))) {
        setConflictError(`Subject code '${subjectCode}' already exists!`);
        return;
      }
      addSubject(subjectForm);
    }

    setShowSubjectModal(false);
    setEditingSubject(null);
    setConflictError(null);
  };

  const handleSubjectAsgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectAsgForm.teacherId || !subjectAsgForm.subjectCode) return;

    const teacherObj = subjectAssignmentFormData.teachers.find(t => t.id === subjectAsgForm.teacherId) || teachers.find(t => t.id === subjectAsgForm.teacherId);
    const subjectObj = subjectAssignmentFormData.subjects.find(s => s.id === subjectAsgForm.subjectCode) || subjects.find(s => s.subject_code === subjectAsgForm.subjectCode || s.code === subjectAsgForm.subjectCode);

    // Add the subject assignment (using local state for now, will sync with backend when table exists)
    addTeacherSubjectAssignment({
      teacherId: subjectAsgForm.teacherId,
      teacherName: teacherObj ? teacherObj.full_name || teacherObj.name : 'Unknown Faculty',
      subjectCode: subjectAsgForm.subjectCode,
      subjectName: subjectObj ? subjectObj.subject_name || subjectObj.name : 'General Block',
      academicYear: subjectAsgForm.academicYear,
      grade: subjectAsgForm.grade,
      section: subjectAsgForm.section,
      semester: subjectAsgForm.semester,
      status: subjectAsgForm.status
    });

    // Also optionally enroll as course in catalog if status is active
    if (subjectAsgForm.status === 'Active' && subjectObj && subjectAsgForm.grade && subjectAsgForm.academicYear) {
      try {
        addCourse({
          course_code: `${subjectAsgForm.subjectCode}-${subjectAsgForm.grade.replace(/\s+/g, '')}`,
          course_name: subjectObj.subject_name || subjectObj.name || 'Unknown Subject',
          description: subjectObj.description || subjectObj.desc || '',
          grade_level: subjectAsgForm.grade,
          subject_area: subjectObj.category || 'General',
          credits: subjectObj.weekly_hours || subjectObj.weeklyHours || 4,
          teacher_id: teacherObj ? teacherObj.id : undefined,
          teacher_name: teacherObj ? teacherObj.full_name || teacherObj.name : 'TBD',
          academic_year: subjectAsgForm.academicYear,
          semester: subjectAsgForm.semester,
          status: 'active',
          max_capacity: 30,
          current_enrollment: 0,
          
          // Legacy fields for backward compatibility
          code: `${subjectAsgForm.subjectCode}-${subjectAsgForm.grade.replace(/\s+/g, '')}`,
          name: subjectObj.subject_name || subjectObj.name || 'Unknown Subject',
          desc: subjectObj.description || subjectObj.desc || '',
          grade: subjectAsgForm.grade,
          section: subjectAsgForm.section,
          teacher: teacherObj ? teacherObj.full_name || teacherObj.name : 'TBD',
          weeklyHours: subjectObj.weekly_hours || subjectObj.weeklyHours || 4
        });
      } catch (courseError: any) {
        // Handle duplicate course error gracefully
        if (courseError.message && courseError.message.includes('duplicate key')) {
          console.info('Course already exists, skipping creation');
        } else {
          console.warn('Course creation failed:', courseError);
        }
        // Continue even if course creation fails
      }
    }

    setShowSubjectAsgModal(false);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleForm.time_slot_id || !scheduleForm.teacher_id || !scheduleForm.subject_id || !scheduleForm.section_configuration_id) {
      setConflictError('Please fill in all required fields');
      return;
    }

    setConflictError(null);
    setSuccessMsg(null);

    try {
      await addTimetableEntry({
        school_id: '', // Will be set by API
        academic_year_id: currentAcademicYear?.id || '',
        day_of_week: scheduleForm.day_of_week,
        time_slot_id: scheduleForm.time_slot_id,
        teacher_id: scheduleForm.teacher_id,
        subject_id: scheduleForm.subject_id,
        section_configuration_id: scheduleForm.section_configuration_id,
        room_number: scheduleForm.room_number,
        notes: scheduleForm.notes,
        is_active: true
      });

      setSuccessMsg('Timetable entry added successfully!');
      setTimeout(() => {
        setShowScheduleModal(false);
        setSuccessMsg(null);
        // Reset form
        setScheduleForm({
          day_of_week: 'Monday',
          time_slot_id: '',
          teacher_id: '',
          subject_id: '',
          section_configuration_id: '',
          room_number: 'Room 201',
          notes: ''
        });
      }, 1200);
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : 'Failed to add timetable entry');
    }
  };

  const handleScheduleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveSchoolScheduleSettings({
        academic_year_id: currentAcademicYear?.id || '',
        ...scheduleSettingsForm
      });
      
      setSuccessMsg('Schedule settings saved successfully!');
      setTimeout(() => {
        setShowScheduleSettingsModal(false);
        setSuccessMsg(null);
      }, 1200);
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : 'Failed to save schedule settings');
    }
  };

  const handleGenerateTimeSlots = async () => {
    try {
      if (!currentAcademicYear?.id) {
        setConflictError('Please select an academic year first');
        return;
      }
      
      const result = await generateTimeSlots(currentAcademicYear?.id || '');
      setSuccessMsg(result.message);
      setTimeout(() => {
        setSuccessMsg(null);
      }, 2000);
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : 'Failed to generate time slots');
    }
  };

  // HELPERS FOR VISUALIZATION WORKLOADS
  const calculateWorkloadHours = (teacherId: string) => {
    let slotsCount = timetableSlots.filter(s => s.teacherId === teacherId).length;
    return slotsCount * 1; // 1 hour per slot
  };

  // Helper to get selected teacher's assigned grades and sections
  const getTeacherAssignments = (teacherId: string) => {
    const teacher = subjectAssignmentFormData.teachers.find(t => t.id === teacherId) || teachers.find(t => t.id === teacherId);
    return {
      grades: teacher?.assigned_grades || [],
      sections: teacher?.assigned_sections || []
    };
  };

  const getClassroomOccupancy = (room: string) => {
    // max slots are 25 (5 days * 5 periods)
    let occupied = timetableSlots.filter(s => s.classroom.toLowerCase() === room.toLowerCase()).length;
    return Math.round((occupied / 25) * 100);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION BANNER WITH MOTTO */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Academic Allocation Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage subjects, faculty assignments, homeroom responsibilities, and master schedulers with conflict control.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border text-slate-500 font-bold">
            YEAR: 2026-2027
          </span>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
            DIRECTOR AUTHORITY CONTROL
          </span>
        </div>
      </div>

      {/* CORE NAVIGATION TABS */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-xs text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'subjects' ? 'bg-brand-blue text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Subjects Catalog</span>
        </button>
        <button
          onClick={() => setActiveSubTab('subject_assignments')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'subject_assignments' ? 'bg-brand-blue text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Subject Assignments</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'schedule' ? 'bg-brand-blue text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Weekly Timetables</span>
        </button>
        <button
          onClick={() => setActiveSubTab('visualization')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'visualization' ? 'bg-brand-blue text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Relations & Workloads</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'subjects' && (
          <motion.div
            key="subjects-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            {/* Subject Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Total Subjects</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{subjects.length}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Active Curriculum</span>
                <p className="text-xl font-black text-emerald-500 mt-1">{subjects.filter(s => s.status === 'Active').length}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Core Subjects</span>
                <p className="text-xl font-black text-brand-blue mt-1">{subjects.filter(s => s.category === 'Core').length}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Elective / Extra</span>
                <p className="text-xl font-black text-purple-500 mt-1">
                  {subjects.filter(s => s.category !== 'Core').length} Units
                </p>
              </div>
            </div>

            {/* Catalog list header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Curriculum Syllabus List</h3>
                <p className="text-[10px] text-slate-500">Official catalog of core, elective, and extra-curricular courses</p>
              </div>
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setSubjectForm({ 
                    id: '',
                    school_id: '',
                    subject_code: '',
                    subject_name: '',
                    description: '',
                    category: 'Core',
                    weekly_hours: 4,
                    status: 'Active',
                    created_at: '',
                    updated_at: '',
                    // Legacy fields
                    code: '',
                    name: '',
                    desc: '',
                    weeklyHours: 4
                  });
                  setConflictError(null);
                  setShowSubjectModal(true);
                }}
                className="h-9 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Subject</span>
              </button>
            </div>

            {/* Subjects Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                      <th className="py-3 px-5">Code</th>
                      <th className="py-3 px-5">Subject Title</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Weekly Hours</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {subjects.map((sub) => (
                      <tr key={sub.subject_code || sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-500">{sub.subject_code || sub.code}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                          <p>{sub.subject_name || sub.name}</p>
                          <p className="text-[10px] text-slate-450 font-normal leading-normal max-w-sm mt-0.5">{sub.description || sub.desc}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.category === 'Core' ? 'bg-brand-blue/10 text-brand-blue' :
                            sub.category === 'Elective' ? 'bg-purple-500/10 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {sub.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-semibold">{sub.weekly_hours || sub.weeklyHours} hrs</td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            sub.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingSubject(sub);
                                setSubjectForm(sub);
                                setConflictError(null);
                                setShowSubjectModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-brand-blue cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => archiveSubject(sub.subject_code || sub.code)}
                              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-450 hover:text-amber-500 cursor-pointer"
                              title="Archive Subject"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSubject(sub.subject_code || sub.code)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-450 hover:text-rose-500 cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'subject_assignments' && (
          <motion.div
            key="assignments-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            {/* Header control */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Faculty Subject Assign</h3>
                <p className="text-[10px] text-slate-500 font-sans">Authorize specific subjects and workloads to teachers</p>
              </div>
              <button
                onClick={() => {
                  const firstTeacher = subjectAssignmentFormData.teachers[0] || teachers[0];
                  const teacherGrades = firstTeacher?.assigned_grades || [];
                  const teacherSections = firstTeacher?.assigned_sections || [];
                  
                  setSubjectAsgForm({
                    teacherId: firstTeacher?.id || '',
                    subjectCode: subjectAssignmentFormData.subjects[0]?.subject_code || subjectAssignmentFormData.subjects[0]?.id || subjects[0]?.subject_code || subjects[0]?.code || '',
                    academicYearId: subjectAssignmentFormData.currentAcademicYear?.id || '',
                    academicYear: subjectAssignmentFormData.currentAcademicYear?.year_name || '2026-2027',
                    grade: teacherGrades[0] || '',
                    section: teacherSections[0] || '',
                    semester: subjectAssignmentFormData.currentAcademicYear?.current_semester || 'Fall',
                    status: 'Active'
                  });
                  setShowSubjectAsgModal(true);
                }}
                className="h-9 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Subject</span>
              </button>
            </div>

            {/* Assignments Ledger List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                      <th className="py-3 px-5">Teacher</th>
                      <th className="py-3 px-5">Assigned Subject</th>
                      <th className="py-3 px-5">Academic Class</th>
                      <th className="py-3 px-5">Academic Year</th>
                      <th className="py-3 px-5">Semester</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {teacherSubjectAssignments.map((asg) => (
                      <tr key={asg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <span className="p-1 bg-brand-blue/10 text-brand-blue rounded text-[10px] font-mono">
                              {asg.teacherId}
                            </span>
                            <span>{asg.teacherName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="text-slate-900 dark:text-white font-bold">{asg.subjectName}</div>
                          <div className="text-[10px] text-slate-450 font-mono">{asg.subjectCode}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-950 px-2.5 py-0.5 rounded border text-[10px] font-bold">
                            {asg.grade} - {asg.section}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono">{asg.academicYear}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            asg.semester === 'Fall' ? 'bg-orange-500/10 text-orange-600' :
                            asg.semester === 'Spring' ? 'bg-green-500/10 text-green-600' :
                            asg.semester === 'Summer' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {asg.semester}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => deleteTeacherSubjectAssignment(asg.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-450 hover:text-rose-500 cursor-pointer"
                            title="Remove Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'schedule' && (
          <motion.div
            key="schedule-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <WeeklyTimetableBuilder
              sectionConfigurations={subjectAssignmentFormData.sectionConfigurations.length > 0 ? subjectAssignmentFormData.sectionConfigurations : sectionConfigurations}
              subjects={subjectAssignmentFormData.subjects.length > 0 ? subjectAssignmentFormData.subjects : subjects}
              teachers={subjectAssignmentFormData.teachers.length > 0 ? subjectAssignmentFormData.teachers : teachers}
              teacherSubjectAssignments={teacherSubjectAssignments}
              currentAcademicYear={currentAcademicYear}
              onSaveTimetable={async (timetableData) => {
                // Reload weekly timetables after save
                await loadWeeklyTimetables({ section_configuration_id: timetableData.section_configuration_id });
                // Reload time slots as they may have been regenerated
                await loadTimeSlots();
              }}
              existingTimetable={weeklyTimetables}
            />
          </motion.div>
        )}

        {activeSubTab === 'visualization' && (
          <motion.div
            key="visualization-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left animate-fade-in"
          >
            {/* Visual network filters */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Curriculum Node Visualizer</h3>
                <p className="text-[10px] text-slate-500">Trace mapping relationship configurations: Instructor ➔ Subject ➔ Level ➔ Section ➔ Pupils</p>
              </div>
              
              <div className="flex gap-3 text-xs">
                <select
                  value={vizFilterTeacher}
                  onChange={(e) => setVizFilterTeacher(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs font-medium focus:outline-none"
                  disabled={isLoadingSubjectAssignmentFormData}
                >
                  <option value="all">All Faculty</option>
                  {subjectAssignmentFormData.teachers.length > 0 ? (
                    subjectAssignmentFormData.teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)
                  ) : (
                    teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                  )}
                </select>

                <select
                  value={vizFilterGrade}
                  onChange={(e) => setVizFilterGrade(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="all">All Grades</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* RELATIONSHIP DIAGRAM BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Node Network Map (Visual diagram) */}
              <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b pb-2">
                  <Eye className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Interactive Relations Tree</span>
                </h4>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                  {teachers
                    .filter(t => vizFilterTeacher === 'all' || t.id === vizFilterTeacher)
                    .map((t) => {
                      const assignedSubjects = teacherSubjectAssignments.filter(asg => asg.teacherId === t.id);
                      return (
                        <div key={t.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 space-y-3">
                          {/* Parent node: Teacher */}
                          <div className="flex items-center gap-3">
                            <img src={t.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} alt={t.full_name || t.name} className="w-9 h-9 rounded-full object-cover border" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{t.full_name || t.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Specialty: {t.subjects?.[0] || t.subject || t.department}</p>
                            </div>
                          </div>

                          {/* Branch connector */}
                          <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-3.5">
                            {assignedSubjects.length > 0 ? (
                              assignedSubjects.map((asg) => {
                                const classStudents = students.filter(
                                  s => s.grade === asg.grade && s.section === asg.section
                                );
                                return (
                                  <div key={asg.id} className="space-y-1.5 relative">
                                    <div className="absolute top-2 -left-6 w-4 h-0.5 bg-slate-200 dark:bg-slate-800" />
                                    {/* Child node: Subject & grade */}
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="p-1 bg-brand-blue/10 text-brand-blue rounded font-mono font-bold text-[9px]">
                                        {asg.subjectCode}
                                      </span>
                                      <span className="font-bold">{asg.subjectName}</span>
                                      <span className="bg-purple-500/10 text-purple-600 border border-purple-500/10 px-1.5 py-0.2 rounded font-mono text-[9px] font-bold">
                                        {asg.grade} - {asg.section}
                                      </span>
                                    </div>
                                    
                                    {/* Sub-child node: Students */}
                                    <div className="pl-6 border-l border-slate-150 dark:border-slate-800 space-y-1">
                                      <p className="text-[10px] text-slate-400 font-mono">Registered Students ({classStudents.length})</p>
                                      <div className="flex flex-wrap gap-1">
                                        {classStudents.slice(0, 4).map(s => (
                                          <span key={s.id} className="inline-flex items-center gap-1 text-[9px] bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                                            {s.name}
                                          </span>
                                        ))}
                                        {classStudents.length > 4 && (
                                          <span className="text-[9px] text-slate-400 font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                                            +{classStudents.length - 4} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No academic subjects assigned to this teacher.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Resource Utilization (Workloads, classrooms occupancy) */}
              <div className="space-y-6">
                
                {/* Faculty Workload Utilization card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b pb-2">
                    <BarChart2 className="w-3.5 h-3.5 text-brand-indigo" />
                    <span>Faculty Load Hours</span>
                  </h4>

                  <div className="space-y-4">
                    {teachers.map((t) => {
                      const loadHours = calculateWorkloadHours(t.id);
                      // load hours compared to max hours e.g. 20
                      const percent = Math.min(100, (loadHours / 20) * 100);
                      return (
                        <div key={t.id} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{t.full_name || t.name}</span>
                            <span className="font-mono text-[10px] font-bold text-slate-500">{loadHours} / 20 hrs</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                percent > 85 ? 'bg-rose-500' :
                                percent > 60 ? 'bg-brand-blue' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Classroom Occupancy Meter */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b pb-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Classroom Occupancy</span>
                  </h4>

                  <div className="space-y-4">
                    {['Room 201', 'Art Studio B', 'Science Lab A'].map((room) => {
                      const percent = getClassroomOccupancy(room);
                      return (
                        <div key={room} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{room}</span>
                            <span className="font-mono text-[10px] font-bold text-slate-500">{percent}% density</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-rose-500 rounded-full" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==============================================
          SUBJECT EDIT / CREATE DIALOG
          ============================================== */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingSubject ? 'Edit Subject Details' : 'Create Subject Entry'}
                </h3>
                <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
                {conflictError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 font-bold">
                    {conflictError}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject Code</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingSubject}
                      value={subjectForm.subject_code || subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value.toUpperCase(), code: e.target.value.toUpperCase() })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50"
                      placeholder="e.g. HIST-101"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject Name</label>
                    <input
                      type="text"
                      required
                      value={subjectForm.subject_name || subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      placeholder="e.g. Introduction to World History"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject Description</label>
                  <textarea
                    value={subjectForm.description || subjectForm.desc}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value, desc: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    placeholder="Syllabus guidelines, objectives, exam patterns..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Category Type</label>
                    <select
                      value={subjectForm.category}
                      onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      {categories.map(c => <option key={c} value={c}>{c} Subject</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Weekly Target Hours</label>
                    <input
                      type="number"
                      required
                      value={subjectForm.weekly_hours || subjectForm.weeklyHours}
                      onChange={(e) => setSubjectForm({ ...subjectForm, weekly_hours: parseInt(e.target.value) || 4, weeklyHours: parseInt(e.target.value) || 4 })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs">Save Subject</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          TEACHER SUBJECT ASSIGN MODAL
          ============================================== */}
      <AnimatePresence>
        {showSubjectAsgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectAsgModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Allocate Faculty Subject</h3>
                <button onClick={() => setShowSubjectAsgModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubjectAsgSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Select Instructor</label>
                  <select
                    value={subjectAsgForm.teacherId}
                    onChange={(e) => {
                      const newTeacherId = e.target.value;
                      const teacherAssignments = getTeacherAssignments(newTeacherId);
                      setSubjectAsgForm({ 
                        ...subjectAsgForm, 
                        teacherId: newTeacherId,
                        grade: teacherAssignments.grades[0] || '',
                        section: teacherAssignments.sections[0] || ''
                      });
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    disabled={isLoadingSubjectAssignmentFormData}
                  >
                    {isLoadingSubjectAssignmentFormData ? (
                      <option>Loading teachers...</option>
                    ) : subjectAssignmentFormData.teachers.length > 0 ? (
                      subjectAssignmentFormData.teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name} ({t.employee_id})</option>
                      ))
                    ) : (
                      <option>No teachers available</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Select Subject</label>
                  <select
                    value={subjectAsgForm.subjectCode}
                    onChange={(e) => setSubjectAsgForm({ ...subjectAsgForm, subjectCode: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    disabled={isLoadingSubjectAssignmentFormData}
                  >
                    {isLoadingSubjectAssignmentFormData ? (
                      <option>Loading subjects...</option>
                    ) : subjectAssignmentFormData.subjects.length > 0 ? (
                      subjectAssignmentFormData.subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                      ))
                    ) : (
                      <option>No subjects available</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Grade Level</label>
                    <select
                      value={subjectAsgForm.grade}
                      onChange={(e) => setSubjectAsgForm({ ...subjectAsgForm, grade: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      disabled={!subjectAsgForm.teacherId}
                    >
                      {!subjectAsgForm.teacherId ? (
                        <option>Select teacher first</option>
                      ) : getTeacherAssignments(subjectAsgForm.teacherId).grades.length > 0 ? (
                        getTeacherAssignments(subjectAsgForm.teacherId).grades.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))
                      ) : (
                        <option>No grades assigned</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Section</label>
                    <select
                      value={subjectAsgForm.section}
                      onChange={(e) => setSubjectAsgForm({ ...subjectAsgForm, section: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      disabled={!subjectAsgForm.teacherId}
                    >
                      {!subjectAsgForm.teacherId ? (
                        <option>Select teacher first</option>
                      ) : getTeacherAssignments(subjectAsgForm.teacherId).sections.length > 0 ? (
                        getTeacherAssignments(subjectAsgForm.teacherId).sections.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))
                      ) : (
                        <option>No sections assigned</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Academic Semester</label>
                    <select
                      value={subjectAsgForm.semester}
                      onChange={(e) => setSubjectAsgForm({ ...subjectAsgForm, semester: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      disabled={isLoadingSubjectAssignmentFormData}
                    >
                      {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Academic Year</label>
                    <select
                      value={subjectAsgForm.academicYearId}
                      onChange={(e) => {
                        const selectedYear = subjectAssignmentFormData.academicYears.find(ay => ay.id === e.target.value);
                        setSubjectAsgForm({ 
                          ...subjectAsgForm, 
                          academicYearId: e.target.value,
                          academicYear: selectedYear?.year_name || '2026-2027'
                        });
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      disabled={isLoadingSubjectAssignmentFormData}
                    >
                      {isLoadingSubjectAssignmentFormData ? (
                        <option>Loading academic years...</option>
                      ) : subjectAssignmentFormData.academicYears.length > 0 ? (
                        subjectAssignmentFormData.academicYears.map(ay => (
                          <option key={ay.id} value={ay.id}>{ay.year_name}</option>
                        ))
                      ) : (
                        <option>No academic years available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowSubjectAsgModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs">Allocate Subject</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          ADD TIMETABLE ENTRY MODAL
          ============================================== */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Add Timetable Entry</h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                
                {conflictError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2 text-xs text-rose-600 font-semibold items-start leading-normal">
                    <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error!</p>
                      <p className="font-normal mt-0.5 text-[11px]">{conflictError}</p>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 text-xs text-emerald-600 font-semibold items-start leading-normal">
                    <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Success!</p>
                      <p className="font-normal mt-0.5 text-[11px]">{successMsg}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Day of Week</label>
                    <select
                      value={scheduleForm.day_of_week}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Time Slot</label>
                    <select
                      value={scheduleForm.time_slot_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time_slot_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.slot_name} ({t.start_time} - {t.end_time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Teacher</label>
                    <select
                      value={scheduleForm.teacher_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, teacher_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select teacher</option>
                      {subjectAssignmentFormData.teachers.length > 0 ? (
                        subjectAssignmentFormData.teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)
                      ) : (
                        teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject</label>
                    <select
                      value={scheduleForm.subject_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select subject</option>
                      {subjectAssignmentFormData.subjects.length > 0 ? (
                        subjectAssignmentFormData.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)
                      ) : (
                        subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Section</label>
                    <select
                      value={scheduleForm.section_configuration_id}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, section_configuration_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select section</option>
                      {subjectAssignmentFormData.sectionConfigurations.length > 0 ? (
                        subjectAssignmentFormData.sectionConfigurations.map(s => (
                          <option key={s.id} value={s.id}>{s.grade_level} - {s.section_name}</option>
                        ))
                      ) : (
                        sectionConfigurations.map(s => (
                          <option key={s.id} value={s.id}>{s.grade_level} - {s.section_name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Room Number</label>
                    <input
                      type="text"
                      value={scheduleForm.room_number}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, room_number: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      placeholder="e.g. Room 205"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Notes (Optional)</label>
                  <input
                    type="text"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs">Add Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          SCHEDULE SETTINGS MODAL
          ============================================== */}
      <AnimatePresence>
        {showScheduleSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleSettingsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Schedule Settings</h3>
                <button onClick={() => setShowScheduleSettingsModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleScheduleSettingsSubmit} className="p-6 space-y-4">
                {conflictError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2 text-xs text-rose-600 font-semibold items-start leading-normal">
                    <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error!</p>
                      <p className="font-normal mt-0.5 text-[11px]">{conflictError}</p>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 text-xs text-emerald-600 font-semibold items-start leading-normal">
                    <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Success!</p>
                      <p className="font-normal mt-0.5 text-[11px]">{successMsg}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Period Duration (minutes)</label>
                    <input
                      type="number"
                      value={scheduleSettingsForm.period_duration_minutes}
                      onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, period_duration_minutes: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      min="30"
                      max="120"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Periods Per Day</label>
                    <input
                      type="number"
                      value={scheduleSettingsForm.number_of_periods_per_day}
                      onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, number_of_periods_per_day: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">School Start Time</label>
                    <input
                      type="time"
                      value={scheduleSettingsForm.school_start_time}
                      onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, school_start_time: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">School End Time</label>
                    <input
                      type="time"
                      value={scheduleSettingsForm.school_end_time}
                      onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, school_end_time: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Enable Lunch Break</label>
                    <input
                      type="checkbox"
                      checked={scheduleSettingsForm.lunch_break_enabled}
                      onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, lunch_break_enabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                  </div>

                  {scheduleSettingsForm.lunch_break_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Lunch Duration (min)</label>
                        <input
                          type="number"
                          value={scheduleSettingsForm.lunch_break_duration_minutes}
                          onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, lunch_break_duration_minutes: parseInt(e.target.value) })}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                          min="15"
                          max="120"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400">After Period</label>
                        <input
                          type="number"
                          value={scheduleSettingsForm.lunch_break_after_period}
                          onChange={(e) => setScheduleSettingsForm({ ...scheduleSettingsForm, lunch_break_after_period: parseInt(e.target.value) })}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                          min="1"
                          max={scheduleSettingsForm.number_of_periods_per_day}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateTimeSlots}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Generate Time Slots</span>
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowScheduleSettingsModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                    <button type="submit" className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs">Save Settings</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
