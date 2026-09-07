/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Layers, Plus, Settings, Search, Filter, CheckCircle2, 
  AlertTriangle, ArrowRight, RefreshCw, Trash2, Save, Loader2,
  GraduationCap, PieChart, BarChart3, TrendingUp, UserPlus, Download,
  Eye, Edit3, XCircle, Zap, Target, Clock, Users2
} from 'lucide-react';
import { api } from '../../../lib/api';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  grade_level: string;
  section?: string;
  gender?: 'male' | 'female' | 'other';
}

interface SectionConfiguration {
  id: string;
  grade_level: string;
  section_name: string;
  max_capacity: number;
  current_count: number;
  academic_year: string;
  is_active: boolean;
}

interface SectionAllocationSummary {
  section_name: string;
  total_students: number;
  male_count: number;
  female_count: number;
}

interface AcademicYear {
  id: string;
  year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  is_active: boolean;
  is_archived: boolean;
}

interface AllocationResult {
  message: string;
  allocations: any[];
  summary: SectionAllocationSummary[];
}

export const GradeSectionBuilder: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [studentsPerSection, setStudentsPerSection] = useState(30);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isDisallocating, setIsDisallocating] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sectionConfigs, setSectionConfigs] = useState<SectionConfiguration[]>([]);
  const [allocations, setAllocations] = useState<AllocationResult | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'sections' | 'list' | 'all'>('sections');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const availableGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
                          'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                          'Grade 11', 'Grade 12'];

  // Load academic years on component mount
  useEffect(() => {
    loadAcademicYears();
  }, []);

  // Load students when grade is selected
  useEffect(() => {
    if (selectedGrade && academicYear) {
      loadStudentsAndConfigs();
    }
  }, [selectedGrade, academicYear]);

  const loadAcademicYears = async () => {
    try {
      const schoolId = api.getSchoolId();
      if (!schoolId) {
        console.warn('No school ID set, cannot load academic years');
        return;
      }
      
      const years = await api.getAcademicYears(false); // Only non-archived years
      setAcademicYears(years);
      
      // Set default to active year if available
      const activeYear = years.find(y => y.is_active);
      if (activeYear) {
        setAcademicYear(activeYear.year_name);
      } else if (years.length > 0) {
        setAcademicYear(years[0].year_name);
      }
    } catch (error) {
      console.error('Failed to load academic years:', error);
      triggerToast('Failed to load academic years');
    }
  };

  const loadStudentsAndConfigs = async () => {
    setLoading(true);
    try {
      const schoolId = api.getSchoolId();
      if (!schoolId) {
        console.warn('No school ID set, cannot load students');
        setStudents([]);
        setSectionConfigs([]);
        return;
      }
      
      // Load students for the selected grade
      const allStudents = await api.getStudents();
      const gradeStudents = allStudents.filter((s: Student) => s.grade_level === selectedGrade);
      setStudents(gradeStudents);

      // Load section configurations
      const configs = await api.getSectionConfigurations(selectedGrade, academicYear);
      setSectionConfigs(configs);
      
      // Reset selection
      setSelectedSection(null);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('School ID') || errorMessage.includes('school')) {
        triggerToast('Please select a school first');
      } else if (errorMessage.includes('Network')) {
        triggerToast('Network connection error. Please check your internet connection');
      } else {
        triggerToast('Failed to load students and section configurations');
      }
      setStudents([]);
      setSectionConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateStudents = async () => {
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('Please select a school first');
      return;
    }

    if (!selectedGrade || !academicYear || !studentsPerSection) {
      triggerToast('Please fill in all required fields');
      return;
    }

    // Check if academic year is archived
    const currentYear = academicYears.find(y => y.year_name === academicYear);
    if (currentYear?.is_archived) {
      triggerToast('Cannot allocate students for archived academic years');
      return;
    }

    setIsAllocating(true);
    try {
      const allocationData = {
        grade_level: selectedGrade,
        academic_year: academicYear,
        students_per_section: studentsPerSection
      };
      
      console.log('Sending allocation request:', allocationData);
      console.log('Current school ID:', schoolId);
      console.log('Available students count:', students.length);
      console.log('Unallocated students count:', unallocatedStudents.length);
      
      const result = await api.allocateStudents(allocationData);
      
      console.log('Allocation result:', result);
      
      setAllocations(result);
      triggerToast(result.message);
      
      // Reload data after allocation
      await loadStudentsAndConfigs();
    } catch (error) {
      console.error('Allocation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      if (errorMessage.includes('School ID') || errorMessage.includes('school')) {
        triggerToast('Please select a school first');
      } else if (errorMessage.includes('Network')) {
        triggerToast('Network connection error. Please check your internet connection');
      } else if (errorMessage.includes('No students found') || errorMessage.includes('without sections')) {
        triggerToast('All students in this grade are already allocated to sections');
      } else {
        triggerToast(`Failed to allocate students: ${errorMessage}`);
      }
    } finally {
      setIsAllocating(false);
    }
  };

  const handleDisallocateStudents = async () => {
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('Please select a school first');
      return;
    }

    if (selectedStudents.size === 0) {
      triggerToast('Please select students to disallocate');
      return;
    }

    if (!selectedGrade || !academicYear) {
      triggerToast('Please select grade and academic year');
      return;
    }

    // Check if academic year is archived
    const currentYear = academicYears.find(y => y.year_name === academicYear);
    if (currentYear?.is_archived) {
      triggerToast('Cannot disallocate students for archived academic years');
      return;
    }

    if (!confirm(`Are you sure you want to disallocate ${selectedStudents.size} students? This will remove them from their sections.`)) {
      return;
    }

    setIsDisallocating(true);
    try {
      const result = await api.disallocateStudents({
        student_ids: Array.from(selectedStudents),
        grade_level: selectedGrade,
        academic_year: academicYear
      });
      
      triggerToast(result.message);
      setSelectedStudents(new Set());
      
      // Reload data after disallocation
      await loadStudentsAndConfigs();
    } catch (error) {
      console.error('Disallocation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('School ID') || errorMessage.includes('school')) {
        triggerToast('Please select a school first');
      } else if (errorMessage.includes('Network')) {
        triggerToast('Network connection error. Please check your internet connection');
      } else {
        triggerToast(`Failed to disallocate students: ${errorMessage}`);
      }
    } finally {
      setIsDisallocating(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const isYearArchived = () => {
    const currentYear = academicYears.find(y => y.year_name === academicYear);
    return currentYear?.is_archived || false;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Get unallocated students (no section assigned)
  const unallocatedStudents = students.filter(s => !s.section);
  const allocatedStudents = students.filter(s => s.section);

  // Filter students based on search and gender
  const filterStudents = (studentList: Student[]) => {
    return studentList.filter(student => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = filterGender === 'all' || student.gender === filterGender;
      return matchesSearch && matchesGender;
    });
  };

  // Group allocated students by section
  const studentsBySection: { [key: string]: Student[] } = {};
  allocatedStudents.forEach(student => {
    if (student.section) {
      if (!studentsBySection[student.section]) {
        studentsBySection[student.section] = [];
      }
      studentsBySection[student.section].push(student);
    }
  });

  // Sort students alphabetically within each section
  Object.keys(studentsBySection).forEach(section => {
    studentsBySection[section].sort((a, b) => a.full_name.localeCompare(b.full_name));
  });

  // Calculate gender statistics
  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;
  const otherCount = students.filter(s => s.gender === 'other' || !s.gender).length;
  const totalStudents = students.length;

  // Get students for current view
  const getCurrentViewStudents = () => {
    if (viewMode === 'all') {
      return filterStudents(students);
    } else if (viewMode === 'list') {
      if (selectedSection && studentsBySection[selectedSection]) {
        return filterStudents(studentsBySection[selectedSection]);
      }
      return filterStudents(allocatedStudents);
    }
    return students;
  };

  const currentViewStudents = getCurrentViewStudents();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-indigo" />
            Grade & Section Builder
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auto-allocate students to sections with intelligent gender balancing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadStudentsAndConfigs()}
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Allocation Configuration
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Target className="w-3 h-3" />
            <span>Gender-balanced algorithm</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Grade Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              <option value="">Choose a grade...</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              disabled={academicYears.length === 0}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-indigo disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select academic year...</option>
              {academicYears.map(year => (
                <option 
                  key={year.id} 
                  value={year.year_name}
                  disabled={year.is_archived}
                >
                  {year.year_name} {year.is_archived ? '(Archived)' : ''} {year.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Students Per Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Students Per Section
            </label>
            <input
              type="number"
              value={studentsPerSection}
              onChange={(e) => setStudentsPerSection(parseInt(e.target.value) || 30)}
              min="1"
              max="50"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          </div>

          {/* Allocate Button */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleAllocateStudents}
              disabled={isAllocating || !selectedGrade || unallocatedStudents.length === 0 || isYearArchived()}
              className="flex-1 h-10 px-6 rounded-xl bg-brand-indigo hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              title={unallocatedStudents.length === 0 ? 'All students are already allocated' : ''}
            >
              {isAllocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Allocating...</span>
                </>
              ) : unallocatedStudents.length === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Allocated</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Auto-Allocate</span>
                </>
              )}
            </button>
            <button
              onClick={handleDisallocateStudents}
              disabled={isDisallocating || selectedStudents.size === 0 || isYearArchived()}
              className="flex-1 h-10 px-6 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isDisallocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Disallocating...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Disallocate ({selectedStudents.size})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Allocation Info */}
        {selectedGrade && (
          <>
            {isYearArchived() && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    This academic year is archived. Modifications are disabled.
                  </span>
                </div>
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 text-[10px] text-blue-700 dark:text-blue-300">
                <Clock className="w-3 h-3" />
                <span>
                  {unallocatedStudents.length} students awaiting allocation • 
                  {Math.ceil(unallocatedStudents.length / studentsPerSection)} sections will be created
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Statistics Cards */}
      {selectedGrade && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-black text-slate-400">Total Students</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <TrendingUp className="w-3 h-3" />
              <span>{selectedGrade}</span>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-black text-amber-500">Unallocated</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-500">{unallocatedStudents.length}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <Target className="w-3 h-3" />
              <span>Pending allocation</span>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-black text-emerald-500">Allocated</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-500">{allocatedStudents.length}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <Users2 className="w-3 h-3" />
              <span>{sectionConfigs.length} sections</span>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-black text-brand-indigo">Gender Balance</span>
              <PieChart className="w-4 h-4 text-brand-indigo" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{maleCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{femaleCount}</span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              {otherCount} other/unknown
            </div>
          </div>
        </div>
      )}

      {/* Allocation Summary */}
      {allocations && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Allocation Completed Successfully
            </h4>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allocations.summary.map((summary, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{summary.section_name}</p>
                  <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {summary.total_students}/{studentsPerSection}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Male</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">{summary.male_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Female</span>
                    </div>
                    <span className="text-xs font-bold text-pink-600">{summary.female_count}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-pink-500 h-1.5 rounded-full"
                      style={{ width: `${(summary.total_students / studentsPerSection) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Controls */}
      {selectedGrade && students.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('sections')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${
                    viewMode === 'sections' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  By Section
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Users className="w-3 h-3 inline mr-1" />
                  All Students
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  List View
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex items-center flex-1 sm:flex-none">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 h-9 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                />
              </div>
              
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as any)}
                className="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Students by Section View */}
      {selectedGrade && viewMode === 'sections' && Object.keys(studentsBySection).length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students by Section
            </h3>
          </div>
          
          <div className="divide-y divide-slate-150 dark:divide-slate-850">
            {Object.entries(studentsBySection)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([sectionName, sectionStudents]) => {
                const filteredStudents = filterStudents(sectionStudents);
                if (filteredStudents.length === 0) return null;
                
                const sectionConfig = sectionConfigs.find(c => c.section_name === sectionName);
                const maleInSection = filteredStudents.filter(s => s.gender === 'male').length;
                const femaleInSection = filteredStudents.filter(s => s.gender === 'female').length;
                
                return (
                  <div key={sectionName} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sectionName}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            {filteredStudents.length} students
                          </span>
                          {sectionConfig && (
                            <span className="text-[10px] font-mono text-slate-400">
                              ({filteredStudents.length}/{sectionConfig.max_capacity})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px]">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-slate-600 dark:text-slate-400">{maleInSection}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <div className="w-2 h-2 rounded-full bg-pink-500" />
                          <span className="text-slate-600 dark:text-slate-400">{femaleInSection}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredStudents.map(student => (
                        <div 
                          key={student.id} 
                          className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-brand-indigo/30 dark:hover:border-brand-indigo/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(student.id)}
                                onChange={() => toggleStudentSelection(student.id)}
                                disabled={isYearArchived()}
                                className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                              />
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                                student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : 'O'}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                                <p className="text-[10px] font-mono text-slate-500">{student.admission_number}</p>
                              </div>
                            </div>
                            <Eye className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* All Students View */}
      {selectedGrade && viewMode === 'all' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-850">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Students - {selectedGrade}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>{students.length} total</span>
                <span>•</span>
                <span className="text-emerald-500">{allocatedStudents.length} allocated</span>
                <span>•</span>
                <span className="text-amber-500">{unallocatedStudents.length} unallocated</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filterStudents(students).length && filterStudents(students).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(new Set(filterStudents(students).map(s => s.id)));
                        } else {
                          setSelectedStudents(new Set());
                        }
                      }}
                      disabled={isYearArchived()}
                      className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filterStudents(students)
                  .sort((a, b) => a.full_name.localeCompare(b.full_name))
                  .map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/15">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        disabled={isYearArchived()}
                        className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                          student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : 'O'}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{student.admission_number}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                        student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.section ? (
                        <span className="px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo text-[9px] font-bold font-mono uppercase">
                          {student.section}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-600 text-[9px] font-bold font-mono uppercase">
                          Unallocated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <Eye className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List View */}
      {selectedGrade && viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Allocated Students List View
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filterStudents(allocatedStudents).length && filterStudents(allocatedStudents).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(new Set(filterStudents(allocatedStudents).map(s => s.id)));
                        } else {
                          setSelectedStudents(new Set());
                        }
                      }}
                      disabled={isYearArchived()}
                      className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filterStudents(allocatedStudents)
                  .sort((a, b) => a.full_name.localeCompare(b.full_name))
                  .map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/15">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        disabled={isYearArchived()}
                        className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                          student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : 'O'}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{student.admission_number}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                        student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.section ? (
                        <span className="px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo text-[9px] font-bold font-mono uppercase">
                          {student.section}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-600 text-[9px] font-bold font-mono uppercase">
                          Unallocated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <Eye className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unallocated Students */}
      {selectedGrade && unallocatedStudents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-amber-200 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Unallocated Students ({unallocatedStudents.length})
              </h3>
              <button
                onClick={handleAllocateStudents}
                disabled={isAllocating || isYearArchived()}
                className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Zap className="w-3 h-3" />
                <span>Allocate Now</span>
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filterStudents(unallocatedStudents)
                .sort((a, b) => a.full_name.localeCompare(b.full_name))
                .map(student => (
                <div 
                  key={student.id} 
                  className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900 flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      disabled={isYearArchived()}
                      className="w-4 h-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo disabled:opacity-50"
                    />
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      student.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                      student.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : 'O'}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{student.admission_number}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-indigo" />
          <span className="ml-3 text-sm text-slate-500">Loading student data...</span>
        </div>
      )}

      {!selectedGrade && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Select a Grade to Begin</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Choose a grade level to view students and configure section allocations with gender balancing.
          </p>
        </div>
      )}
    </div>
  );
};
