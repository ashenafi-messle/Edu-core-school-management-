/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Edit3, Archive, Play, Pause, 
  Check, X, Loader2, Clock, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../../../lib/api';

interface AcademicYear {
  id: string;
  school_id: string;
  year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  current_semester: string;
  semester_start_date: string;
  semester_end_date: string;
  is_active: boolean;
  is_archived: boolean;
  archived_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const AcademicYearManagement: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [newYear, setNewYear] = useState({
    year_name: '',
    academic_year_start: '',
    academic_year_end: '',
    current_semester: 'Semester 1',
    semester_start_date: '',
    semester_end_date: '',
    notes: '',
    is_active: false
  });

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    setLoading(true);
    try {
      const schoolId = api.getSchoolId();
      if (!schoolId) {
        console.warn('No school ID set, cannot load academic years');
        setAcademicYears([]);
        return;
      }
      const years = await api.getAcademicYears(true);
      setAcademicYears(years);
    } catch (error) {
      console.error('Failed to load academic years:', error);
      triggerToast('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('No school selected. Please select a school first.');
      return;
    }
    
    // Check if academic year with same name already exists
    const existingYear = academicYears.find(year => year.year_name === newYear.year_name);
    if (existingYear) {
      triggerToast('An academic year with this name already exists');
      return;
    }
    
    setLoading(true);
    try {
      await api.createAcademicYear(newYear);
      triggerToast('Academic year created successfully');
      setShowAddModal(false);
      setNewYear({
        year_name: '',
        academic_year_start: '',
        academic_year_end: '',
        current_semester: 'Semester 1',
        semester_start_date: '',
        semester_end_date: '',
        notes: '',
        is_active: false
      });
      await loadAcademicYears();
    } catch (error) {
      console.error('Failed to create academic year:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create academic year';
      if (errorMessage.includes('duplicate key')) {
        triggerToast('An academic year with this name already exists');
      } else {
        triggerToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateYear = async (yearId: string, updates: any) => {
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('No school selected. Please select a school first.');
      return;
    }
    
    setLoading(true);
    try {
      await api.updateAcademicYear(yearId, updates);
      triggerToast('Academic year updated successfully');
      await loadAcademicYears();
    } catch (error) {
      console.error('Failed to update academic year:', error);
      triggerToast('Failed to update academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveYear = async (yearId: string) => {
    if (!confirm('Are you sure you want to archive this academic year? All associated data will be archived and the year will become read-only.')) {
      return;
    }
    
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('No school selected. Please select a school first.');
      return;
    }
    
    setLoading(true);
    try {
      await api.archiveAcademicYear(yearId);
      triggerToast('Academic year archived successfully');
      await loadAcademicYears();
    } catch (error) {
      console.error('Failed to archive academic year:', error);
      triggerToast('Failed to archive academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateYear = async (yearId: string) => {
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('No school selected. Please select a school first.');
      return;
    }
    
    setLoading(true);
    try {
      await api.activateAcademicYear(yearId);
      triggerToast('Academic year activated successfully');
      await loadAcademicYears();
    } catch (error) {
      console.error('Failed to activate academic year:', error);
      triggerToast('Failed to activate academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (yearId: string) => {
    if (!confirm('Are you sure you want to delete this academic year? This action cannot be undone.')) {
      return;
    }
    
    const schoolId = api.getSchoolId();
    if (!schoolId) {
      triggerToast('No school selected. Please select a school first.');
      return;
    }
    
    setLoading(true);
    try {
      await api.deleteAcademicYear(yearId);
      triggerToast('Academic year deleted successfully');
      await loadAcademicYears();
    } catch (error) {
      console.error('Failed to delete academic year:', error);
      triggerToast('Failed to delete academic year');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (year: AcademicYear) => {
    if (year.is_archived) {
      return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-bold font-mono uppercase rounded">
          Archived
        </span>
      );
    } else if (year.is_active) {
      return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-bold font-mono uppercase rounded">
          Active
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px font-bold font-mono uppercase rounded">
          Inactive
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Academic Year Management
          </h2>
          <p className="text-xs text-slate-450">Manage academic years, semesters, and historical data archiving</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAcademicYears}
            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewYear({
                year_name: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                academic_year_start: new Date().toISOString().split('T')[0],
                academic_year_end: new Date(new Date().getFullYear() + 1, 11, 30).toISOString().split('T')[0],
                current_semester: 'Semester 1',
                semester_start_date: '',
                semester_end_date: '',
                notes: '',
                is_active: false
              });
            }}
            className="h-8 px-3 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Academic Year</span>
          </button>
        </div>
      </div>

      {/* Academic Years List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
          <span className="ml-2 text-sm text-slate-500">Loading academic years...</span>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">No academic years configured yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first academic year to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {academicYears.map((year) => (
            <div key={year.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    year.is_active ? 'bg-emerald-100 text-emerald-600' : 
                    year.is_archived ? 'bg-amber-100 text-amber-600' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {year.is_active ? <Play className="w-5 h-5" /> : year.is_archived ? <Archive className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{year.year_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(year)}
                      <span className="text-xs text-slate-500">• {year.current_semester}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!year.is_archived && !year.is_active && (
                    <button
                      onClick={() => handleActivateYear(year.id)}
                      className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Activate year"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {!year.is_archived && year.is_active && (
                    <button
                      onClick={() => handleArchiveYear(year.id)}
                      className="p-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer"
                      title="Archive year"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingYear(year)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Edit year"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteYear(year.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Delete year"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono uppercase text-slate-450">Start Date</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{new Date(year.academic_year_start).toLocaleDateString()}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono uppercase text-slate-450">End Date</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{new Date(year.academic_year_end).toLocaleDateString()}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono uppercase text-slate-450">Semester Start</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {year.semester_start_date ? new Date(year.semester_start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono uppercase text-slate-450">Semester End</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {year.semester_end_date ? new Date(year.semester_end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {year.notes && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-850">
                  <p className="text-xs text-blue-800 dark:text-blue-200">{year.notes}</p>
                </div>
              )}

              {year.is_archived && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-850 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Archived on {year.archived_at ? new Date(year.archived_at).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Academic Year Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Add Academic Year
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddYear} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Year Name</label>
                <input
                  type="text"
                  required
                  value={newYear.year_name}
                  onChange={(e) => setNewYear({...newYear, year_name: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  placeholder="e.g., 2024-2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newYear.academic_year_start}
                    onChange={(e) => setNewYear({...newYear, academic_year_start: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">End Date</label>
                  <input
                    type="date"
                    required
                    value={newYear.academic_year_end}
                    onChange={(e) => setNewYear({...newYear, academic_year_end: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Current Semester</label>
                  <select
                    value={newYear.current_semester}
                    onChange={(e) => setNewYear({...newYear, current_semester: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Activate Now</label>
                  <select
                    value={newYear.is_active ? 'true' : 'false'}
                    onChange={(e) => setNewYear({...newYear, is_active: e.target.value === 'true'})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Semester Start</label>
                  <input
                    type="date"
                    value={newYear.semester_start_date || ''}
                    onChange={(e) => setNewYear({...newYear, semester_start_date: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Semester End</label>
                  <input
                    type="date"
                    value={newYear.semester_end_date || ''}
                    onChange={(e) => setNewYear({...newYear, semester_end_date: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Notes</label>
                <textarea
                  value={newYear.notes}
                  onChange={(e) => setNewYear({...newYear, notes: e.target.value})}
                  className="w-full h-20 px-3 border border-slate-200 rounded-lg resize-none"
                  placeholder="Optional notes about this academic year"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  <span>{loading ? 'Creating...' : 'Create Year'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Academic Year Modal */}
      {editingYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Academic Year
              </h3>
              <button onClick={() => setEditingYear(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateYear(editingYear.id, {
                year_name: editingYear.year_name,
                academic_year_start: editingYear.academic_year_start,
                academic_year_end: editingYear.academic_year_end,
                current_semester: editingYear.current_semester,
                semester_start_date: editingYear.semester_start_date,
                semester_end_date: editingYear.semester_end_date,
                notes: editingYear.notes
              });
              setEditingYear(null);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Year Name</label>
                <input
                  type="text"
                  required
                  value={editingYear.year_name}
                  onChange={(e) => setEditingYear({...editingYear, year_name: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editingYear.academic_year_start}
                    onChange={(e) => setEditingYear({...editingYear, academic_year_start: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">End Date</label>
                  <input
                    type="date"
                    required
                    value={editingYear.academic_year_end}
                    onChange={(e) => setEditingYear({...editingYear, academic_year_end: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Current Semester</label>
                  <select
                    value={editingYear.current_semester}
                    onChange={(e) => setEditingYear({...editingYear, current_semester: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Archive</label>
                  <select
                    value={editingYear.is_archived ? 'true' : 'false'}
                    onChange={(e) => setEditingYear({...editingYear, is_archived: e.target.value === 'true'})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Semester Start</label>
                  <input
                    type="date"
                    value={editingYear.semester_start_date || ''}
                    onChange={(e) => setEditingYear({...editingYear, semester_start_date: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Semester End</label>
                  <input
                    type="date"
                    value={editingYear.semester_end_date || ''}
                    onChange={(e) => setEditingYear({...editingYear, semester_end_date: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Notes</label>
                <textarea
                  value={editingYear.notes}
                  onChange={(e) => setEditingYear({...editingYear, notes: e.target.value})}
                  className="w-full h-20 px-3 border border-slate-200 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingYear(null)}
                  className="h-10 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  <span>{loading ? 'Updating...' : 'Update Year'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
