/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Trash2, Edit, Eye, UserPlus, 
  Archive, FileText, X, AlertCircle, Check, ChevronLeft, ChevronRight,
  ClipboardList, User, Calendar, BookOpen, Clock, Printer, Loader2
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Student } from './types';
import { api } from '../../../lib/api';

interface ApiStudent {
  id: string;
  admission_number: string;
  full_name: string;
  grade_level: string;
  section: string;
  gender: string;
  created_at: string;
  parents?: {
    full_name: string;
    relationship: string;
    emergency_contact: string;
  };
  users?: {
    email: string;
    phone: string;
    status: string;
  };
  parent_id?: string;
}

type StudentRecord = ApiStudent & Partial<Student> & {
  date_of_birth?: string;
  blood_group?: string;
  parents?: ApiStudent['parents'];
};

export const StudentManagement: React.FC = () => {
  const { 
    students: mockStudents, updateStudent, archiveStudent, promoteGrade, transferSection 
  } = useDirectorData();
  
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const data = await api.request<any[]>('/students?include_details=true', { method: 'GET' });
        console.log('API Response:', data);
        console.log('Sample student data:', data[0]);
        console.log('Gender of first student:', data[0]?.gender);
        console.log('Status of first student:', data[0]?.users?.status);
        
        // Log all unique gender values
        const uniqueGenders = [...new Set(data.map((s: any) => s.gender))];
        console.log('Unique gender values:', uniqueGenders);
        
        // Log each student's gender for debugging
        data.forEach((s: any, index: number) => {
          console.log(`Student ${index}: ${s.full_name}, Gender: "${s.gender}", Status: "${s.users?.status}"`);
        });
        
        // Log all unique status values
        const uniqueStatuses = [...new Set(data.map((s: any) => s.users?.status))];
        console.log('Unique status values:', uniqueStatuses);
        
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Using mock data.');
        // Fallback to mock data mapped to API structure
        const mockData = mockStudents.map(s => ({
          id: s.id,
          admission_number: s.id.replace('STU-', ''),
          full_name: s.name,
          grade_level: s.grade,
          section: s.section,
          gender: s.gender?.toLowerCase() || 'other',
          created_at: s.regDate,
          parents: {
            full_name: s.parentName,
            relationship: 'Parent',
            emergency_contact: s.parentPhone
          },
          users: {
            email: s.email,
            phone: s.parentPhone,
            status: s.status?.toLowerCase() || 'active'
          }
        }));
        console.log('Using mock data:', mockData);
        setStudents(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [mockStudents]);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal / Drawer state
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<'personal' | 'academic' | 'attendance' | 'grades' | 'discipline'>('personal');
  const [showPrintReportCard, setShowPrintReportCard] = useState(false);

  // Comprehensive gender normalization function
  const normalizeGender = (gender: any): 'male' | 'female' | 'other' => {
    if (!gender) return 'other';
    
    const normalized = String(gender).toLowerCase().trim();
    
    // Male variations
    if (['male', 'm', 'man', 'boy', 'men', 'masculine', 'he', 'him'].includes(normalized)) {
      return 'male';
    }
    
    // Female variations
    if (['female', 'f', 'woman', 'girl', 'women', 'feminine', 'she', 'her'].includes(normalized)) {
      return 'female';
    }
    
    return 'other';
  };

  // Comprehensive status normalization function
  const normalizeStatus = (status: any): 'active' | 'inactive' | 'other' => {
    if (!status) return 'active'; // Default to active if missing
    
    const normalized = String(status).toLowerCase().trim();
    
    // Active variations
    if (['active', 'a', 'enabled', 'yes', 'true', '1'].includes(normalized)) {
      return 'active';
    }
    
    // Inactive variations
    if (['inactive', 'i', 'disabled', 'no', 'false', '0', 'suspended', 'archived'].includes(normalized)) {
      return 'inactive';
    }
    
    return 'other';
  };

  const handleOpenEditModal = async (s: StudentRecord) => {
    setEditingStudent(s);
    setShowEditModal(true);
    
    // Fetch available sections for this student's grade
    const gradeLevel = s.grade_level || s.grade;
    if (gradeLevel) {
      try {
        const sections = await api.request<any[]>(`/sections?grade_level=${encodeURIComponent(gradeLevel)}`, { method: 'GET' });
        setAvailableSections(sections.map((sec: any) => sec.section_name));
      } catch (error) {
        console.error('Failed to fetch sections:', error);
        setAvailableSections(['Section A', 'Section B']); // Fallback
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    try {
      await api.request<any>(`/students/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: editingStudent.full_name || editingStudent.name,
          section: editingStudent.section,
          parent_id: editingStudent.parent_id,
          // Note: grade_level is not editable
        }),
      });

      // Refresh students list
      const data = await api.request<any[]>('/students?include_details=true', { method: 'GET' });
      setStudents(data);
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating student:', error);
      alert('Failed to update student: ' + (error.message || 'Unknown error'));
    }
  };

  const handleArchiveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to archive this student? This will set their status to inactive.')) {
      return;
    }

    try {
      await api.request<any>(`/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'inactive'
        }),
      });

      // Refresh students list
      const data = await api.request<any[]>('/students?include_details=true', { method: 'GET' });
      setStudents(data);
      alert('Student archived successfully');
    } catch (error: any) {
      console.error('Error archiving student:', error);
      alert('Failed to archive student: ' + (error.message || 'Unknown error'));
    }
  };

  // Filter computation
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.parents?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || s.grade_level === filterGrade;
    const matchesSection = filterSection === 'all' || s.section === filterSection;
    const matchesGender = filterGender === 'all' || s.gender?.toLowerCase() === filterGender.toLowerCase();
    const matchesStatus = filterStatus === 'all' || s.users?.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesGrade && matchesSection && matchesGender && matchesStatus;
  });

  // Unique lists for filters
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const sections = ['Section A', 'Section B'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Stats Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <p className="text-xs font-mono text-slate-400 font-bold uppercase">Total Students</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
          ) : (
            <p className="text-xl font-black text-slate-850 dark:text-white mt-1">{students.length}</p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <p className="text-xs font-mono text-slate-400 font-bold uppercase">Active Students</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
          ) : (
            <p className="text-xl font-black text-emerald-500 mt-1">
              {(() => {
                const count = students.filter(s => normalizeStatus(s.users?.status) === 'active').length;
                console.log('Active students count:', count);
                return count;
              })()}
            </p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <p className="text-xs font-mono text-slate-400 font-bold uppercase">Male Students</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
          ) : (
            <p className="text-xl font-black text-blue-500 mt-1">
              {(() => {
                const count = students.filter(s => normalizeGender(s.gender) === 'male').length;
                console.log('Male students count:', count);
                return count;
              })()}
            </p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <p className="text-xs font-mono text-slate-400 font-bold uppercase">Female Students</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
          ) : (
            <p className="text-xl font-black text-pink-500 mt-1">
              {(() => {
                const count = students.filter(s => normalizeGender(s.gender) === 'female').length;
                console.log('Female students count:', count);
                return count;
              })()}
            </p>
          )}
        </div>
      </div>

      {/* 2. Advanced Filters Desk */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, parent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none focus:ring-1.5 focus:ring-brand-blue/30"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Grades</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Section Filter */}
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Gender Filter */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-xs font-bold uppercase">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-5">Academic Level</th>
                <th className="py-3 px-5">Gender</th>
                <th className="py-3 px-5">Date of Birth</th>
                <th className="py-3 px-5">Guardian Info</th>
                <th className="py-3 px-5">Fee status</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    <p className="text-xs text-slate-400 mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                    <td className="py-3 px-5 font-mono font-bold text-slate-500">{s.admission_number}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-indigo dark:text-brand-sky font-bold text-xs">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.full_name}</p>
                          <p className="text-xs text-slate-400">{s.users?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 text-slate-600 dark:text-slate-300">
                        {s.grade_level} - {s.section || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-5 capitalize">{s.gender}</td>
                    <td className="py-3 px-5 font-mono">N/A</td>
                    <td className="py-3 px-5 text-left">
                      <p className="font-semibold">{s.parents?.full_name || 'N/A'}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.parents?.emergency_contact || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        N/A
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                        s.users?.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {s.users?.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Profile */}
                        <button 
                          onClick={() => { setSelectedStudent(s as any); setShowProfileModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Student */}
                        <button 
                          onClick={() => handleOpenEditModal(s as any)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-blue cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Archive */}
                        <button 
                          onClick={() => handleArchiveStudent(s.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Archive Student"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertCircle className="w-10 h-10" />
                      <p className="text-sm font-bold">No students matched filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-45" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 bg-brand-blue text-white font-bold rounded-lg">1</button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-45" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================
          STUDENT DETAILED PROFILE DRAWER / MODAL
          ============================================== */}
      <AnimatePresence>
        {showProfileModal && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Content Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 text-left border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Official Student Dossier</h3>
                  <p className="text-xs text-slate-400 font-sans">Institutional record profile of {selectedStudent.full_name || selectedStudent.name || 'Student'}</p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PROFILE SUB-TABS SELECTOR */}
              <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 p-1 gap-1 text-xs font-bold text-slate-500">
                {(['personal', 'academic', 'attendance', 'grades', 'discipline'] as const).map((tab) => (
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

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Header Card Info summary */}
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850">
                  <img 
                    src={selectedStudent.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name || 'Student')}&background=random`} 
                    alt={selectedStudent.full_name || selectedStudent.name || 'Student'} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-blue"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedStudent.full_name || selectedStudent.name || 'Student'}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-brand-blue/10 text-brand-indigo dark:text-brand-sky">
                        ID: {selectedStudent.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{selectedStudent.users?.email || selectedStudent.email || 'No email'}</p>
                    <div className="flex gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {selectedStudent.grade_level || selectedStudent.grade} - {selectedStudent.section || 'N/A'}
                      </span>
                      <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">
                        Present: {selectedStudent.attendance || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TAB CONTENT RENDERING */}
                {drawerTab === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal metrics */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Demographics</span>
                        </h5>
                        <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-xs">Gender</span>
                            <span className="font-bold capitalize">{selectedStudent.gender || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Date of Birth</span>
                            <span className="font-bold font-mono">{selectedStudent.date_of_birth || selectedStudent.dob || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Blood Group</span>
                            <span className="font-bold font-mono">{selectedStudent.blood_group || selectedStudent.bloodGroup || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Primary Address</span>
                            <span className="font-semibold">{selectedStudent.address || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Guardian Info */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5 text-brand-indigo" />
                          <span>Guardian Coordinates</span>
                        </h5>
                        <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-xs">Primary Guardian</span>
                            <span className="font-bold">{selectedStudent.parents?.full_name || selectedStudent.parentName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Contact Mobile</span>
                            <span className="font-bold font-mono">{selectedStudent.parents?.emergency_contact || selectedStudent.parentPhone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Primary Email</span>
                            <span className="font-semibold font-mono">parent.{(selectedStudent.full_name || selectedStudent.name || 'unknown').toLowerCase().replace(/\s+/g, '')}@example.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'academic' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Enrolled courses block */}
                    <div className="space-y-2 text-left">
                      <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        <span>Academic Course Enrollments</span>
                      </h5>
                      <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-wrap gap-2">
                        {(selectedStudent.enrolledCourses || []).map((c, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs rounded-xl text-slate-700 dark:text-slate-300 font-bold">
                            {c}
                          </span>
                        ))}
                        {(!selectedStudent.enrolledCourses || selectedStudent.enrolledCourses.length === 0) && (
                          <span className="text-xs text-slate-400 italic">No registered curriculum blocks found.</span>
                        )}
                      </div>
                    </div>

                    {/* Official Scanned Documents */}
                    <div className="space-y-2 text-left">
                      <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>Institutional Verification Files</span>
                      </h5>
                      <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                        {(selectedStudent.documents || []).map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border">
                            <span className="font-mono font-bold">{doc}</span>
                            <span className="text-xs font-bold text-emerald-600">✓ Verified Scanned Dossier</span>
                          </div>
                        ))}
                        {(!selectedStudent.documents || selectedStudent.documents.length === 0) && (
                          <span className="text-xs text-slate-400 italic">No documents uploaded.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'attendance' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Total rate meter */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center space-y-1">
                      <span className="text-[10.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Official Term Attendance Rate</span>
                      <span className="text-2xl font-black text-emerald-500 font-mono">{selectedStudent.attendance || 'N/A'}</span>
                    </div>

                    {/* Detailed Attendance Timeline logs */}
                    <div className="space-y-2.5">
                      <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Daily Clock-in History logs</span>
                      </h5>
                      <div className="space-y-2">
                        {[
                          { date: '2026-07-20', status: 'Present', remarks: 'On time' },
                          { date: '2026-07-19', status: 'Present', remarks: 'On time' },
                          { date: '2026-07-18', status: 'Late', remarks: 'Bus breakdown delay' },
                          { date: '2026-07-17', status: 'Present', remarks: 'On time' },
                          { date: '2026-07-16', status: 'Leave', remarks: 'Medical checkup' }
                        ].map((log, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <p className="font-mono font-bold">{log.date}</p>
                              <p className="text-xs text-slate-400">{log.remarks}</p>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' :
                              log.status === 'Late' ? 'bg-amber-500/10 text-amber-600' : 'bg-brand-blue/10 text-brand-blue'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'grades' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Transcript metrics */}
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Academic Performance Ledger</span>
                      <span className="text-xs font-mono font-bold bg-brand-blue/10 text-brand-indigo px-2 py-0.5 rounded">CGPA: 3.85 GPA</span>
                    </div>

                    {/* Academic subject marks table */}
                    <div className="space-y-3">
                      {[
                        { courseCode: 'MATH-SECON', courseName: 'Secondary Mathematics', score: 88, grade: 'A-', classAvg: 78 },
                        { courseCode: 'CHEM-LEVEL1', courseName: 'Chemistry Intro', score: 92, grade: 'A', classAvg: 80 },
                        { courseCode: 'ENG-LIT', courseName: 'English Literature', score: 82, grade: 'B+', classAvg: 75 },
                        { courseCode: 'FINE-ARTS', courseName: 'Fine Arts Drawing', score: 95, grade: 'A', classAvg: 84 }
                      ].map((rec, idx) => (
                        <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 border rounded-xl space-y-2.5 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{rec.courseName}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{rec.courseCode}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-brand-blue text-sm font-mono">{rec.score}%</span>
                              <span className="text-xs font-mono text-slate-400 block">Grade {rec.grade}</span>
                            </div>
                          </div>
                          
                          {/* Progress comparison */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                              <span>Student Score: {rec.score}%</span>
                              <span>Class Average: {rec.classAvg}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden relative">
                              <div className="absolute top-0 bottom-0 left-0 bg-brand-blue rounded-full" style={{ width: `${rec.score}%` }} />
                              <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500" style={{ left: `${rec.classAvg}%` }} title="Class Avg" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {drawerTab === 'discipline' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Merit scores */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center text-xs text-emerald-700">
                      <div>
                        <p className="font-bold flex items-center gap-1">
                          <span>✦</span>
                          <span>Merit Citizenship Standing</span>
                        </p>
                        <p className="text-[10.5px] mt-0.5 opacity-80">Excellent behavioral reviews, active in class assignments.</p>
                      </div>
                      <span className="text-lg font-black font-mono">+12 Pts</span>
                    </div>

                    {/* Detailed Behavior infraction/praise logs */}
                    <div className="space-y-2.5">
                      <h5 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-brand-indigo" />
                        <span>Behavior & Conduct Log History</span>
                      </h5>
                      
                      <div className="space-y-2.5">
                        {[
                          { date: '2026-07-18', type: 'Commendation', title: 'Exceptional Peer Mentoring', desc: 'Assisted struggling classmates with complex math worksheets.', reporter: 'Sarah Jenkins' },
                          { date: '2026-06-12', type: 'Infraction', title: 'Late Uniform Compliance', desc: 'Arrived at school without the required blazer on Monday.', reporter: 'Dr. Evelyn Foster' }
                        ].map((log, idx) => (
                          <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 border rounded-xl text-xs space-y-1.5 text-left">
                            <div className="flex justify-between items-center">
                              <span className={`text-[9.5px] font-black font-mono uppercase px-2 py-0.5 rounded ${
                                log.type === 'Commendation' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>
                                {log.type}
                              </span>
                              <span className="text-xs font-mono text-slate-400">{log.date}</span>
                            </div>
                            <h4 className="font-bold text-slate-850 dark:text-slate-100">{log.title}</h4>
                            <p className="text-[11px] text-slate-550 leading-relaxed font-sans">{log.desc}</p>
                            <p className="text-xs font-mono text-slate-400 text-right font-semibold">Reported by: {log.reporter}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Printable Report Card Trigger */}
              <div className="p-4 border-t border-slate-150 dark:border-slate-850 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowPrintReportCard(true)}
                  className="px-4.5 py-2.5 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate Printable Report Card</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          OFFICIAL PRINTABLE TRANSCRIPT CARD OVERLAY
          ============================================== */}
      <AnimatePresence>
        {showPrintReportCard && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl p-8 border border-slate-300 text-left text-slate-900"
            >
              {/* Report Card Actions header (not printed) */}
              <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button 
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="h-8.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button 
                  onClick={() => setShowPrintReportCard(false)}
                  className="h-8.5 w-8.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* REPORT SHEET FOR PRINTING */}
              <div className="space-y-6 pt-4 font-sans text-slate-900">
                {/* School Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <h1 className="text-xl font-black uppercase tracking-wide">EduCore International School</h1>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Director Academic Authority Office</p>
                    <p className="text-[11px] text-slate-600 font-sans leading-normal">100 Enterprise Way, Suite A • San Francisco, CA</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <p className="font-bold">TRANSCRIPT NO: {(selectedStudent.id || 'N/A').replace('STU-', 'TR-')}</p>
                    <p className="text-slate-500 mt-1">TERM: 2026-2027 (Term 1)</p>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-sm font-black uppercase tracking-widest border-b pb-1.5 font-mono">Official Academic Achievement Report Card</h2>
                </div>

                {/* Demographics Block */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans pb-3 border-b">
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase font-bold font-mono">Student Name</span>
                    <span className="font-bold text-slate-900">{selectedStudent.full_name || selectedStudent.name || 'Student'}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase font-bold font-mono">Student ID No</span>
                    <span className="font-mono font-bold text-slate-900">{selectedStudent.admission_number || selectedStudent.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase font-bold font-mono">Academic Class</span>
                    <span className="font-bold text-slate-900">{selectedStudent.grade_level || selectedStudent.grade} - {selectedStudent.section || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase font-bold font-mono">Term Attendance</span>
                    <span className="font-mono font-bold text-slate-900">{selectedStudent.attendance || 'N/A'} Attendance</span>
                  </div>
                </div>

                {/* Subject grades ledger */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono text-slate-500">Grading Ledger</h3>
                  <table className="w-full text-left text-xs text-slate-950">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-50/50 text-xs uppercase font-bold font-mono">
                        <th className="py-2">Subject / Course Name</th>
                        <th className="py-2">Score</th>
                        <th className="py-2">Grade</th>
                        <th className="py-2">Class Average</th>
                        <th className="py-2">Teacher Evaluative Assessment Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-sans">
                      {[
                        { code: 'MATH-SECON', name: 'Secondary Mathematics', score: 88, grade: 'A-', avg: 78, comment: 'Exceptional algebraic logic, very active in board problem-solving.' },
                        { code: 'CHEM-LEVEL1', name: 'Chemistry Intro', score: 92, grade: 'A', avg: 80, comment: 'Pristine chemical formulas, laboratory journals are highly organized.' },
                        { code: 'ENG-LIT', name: 'English Literature', score: 82, grade: 'B+', avg: 75, comment: 'Very expressive orator, essay writing structure is commendably cohesive.' },
                        { code: 'FINE-ARTS', name: 'Fine Arts Drawing', score: 95, grade: 'A', avg: 84, comment: 'Artistic flair is remarkably imaginative. Outstanding portfolio submission.' }
                      ].map((sub, idx) => (
                        <tr key={idx} className="py-2.5">
                          <td className="py-2.5 font-bold">{sub.name}</td>
                          <td className="py-2.5 font-mono">{sub.score}%</td>
                          <td className="py-2.5 font-bold font-mono">{sub.grade}</td>
                          <td className="py-2.5 font-mono">{sub.avg}%</td>
                          <td className="py-2.5 text-slate-600 italic leading-normal max-w-xs">{sub.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature footer block */}
                <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-left">
                  <div className="space-y-4">
                    <div className="h-0.5 bg-slate-900 w-44" />
                    <div>
                      <p className="font-bold">Principal Academic Advisor</p>
                      <p className="text-slate-500 text-xs">EduCore International School Staff</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-right flex flex-col items-end">
                    <div className="h-0.5 bg-slate-900 w-44" />
                    <div className="text-right">
                      <p className="font-bold">Director Academic Authority</p>
                      <p className="text-slate-500 text-xs">Administrative Seal of Office Approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          EDIT STUDENT MODAL
          ============================================== */}
      <AnimatePresence>
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Edit Student Dossier</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.full_name || editingStudent.name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Grade Level</label>
                    <input
                      type="text"
                      value={editingStudent.grade || editingStudent.grade_level || ''}
                      disabled
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-xs focus:outline-none cursor-not-allowed text-slate-500"
                      title="Grade level cannot be edited"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Section</label>
                    <select
                      value={editingStudent.section || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">Select Section</option>
                      {availableSections.length > 0 ? (
                        availableSections.map(s => <option key={s} value={s}>{s}</option>)
                      ) : (
                        sections.map(s => <option key={s} value={s}>{s}</option>)
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Guardian Name</label>
                    <input
                      type="text"
                      value={editingStudent.parents?.full_name || editingStudent.parentName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Guardian Phone</label>
                    <input
                      type="text"
                      value={editingStudent.parents?.emergency_contact || editingStudent.parentPhone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold transition-all shadow"
                  >
                    Commit Changes
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
