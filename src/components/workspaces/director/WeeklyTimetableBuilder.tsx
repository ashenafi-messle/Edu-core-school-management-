/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Users, BookOpen, User, Save, RefreshCw, 
  CheckCircle2, AlertTriangle, X, Settings, Plus, Trash2,
  ChefHat, Sparkles, LayoutGrid, ArrowRight, ChevronDown
} from 'lucide-react';
import { createBulkTimetable, CreateBulkTimetableRequest } from '../../../lib/api/timetable-bulk';

interface WeeklyTimetableBuilderProps {
  sectionConfigurations: any[];
  subjects: any[];
  teachers: any[];
  teacherSubjectAssignments: any[];
  currentAcademicYear: any;
  onSaveTimetable?: (timetableData: any) => Promise<void>;
  existingTimetable?: any[];
}

interface TimetableCell {
  day: string;
  period: number;
  subjectId: string | null;
  teacherId: string | null;
  roomId: string;
}

interface WeekConfiguration {
  days: string[];
  periodsPerDay: number;
  periodDuration: number;
  lunchBreakEnabled: boolean;
  lunchBreakAfterPeriod: number;
  lunchBreakDuration: number;
  schoolStartTime: string;
  schoolEndTime: string;
}

export const WeeklyTimetableBuilder: React.FC<WeeklyTimetableBuilderProps> = ({
  sectionConfigurations,
  subjects,
  teachers,
  teacherSubjectAssignments,
  currentAcademicYear,
  onSaveTimetable,
  existingTimetable = []
}) => {
  // State for week configuration
  const [weekConfig, setWeekConfig] = useState<WeekConfiguration>({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periodsPerDay: 7,
    periodDuration: 60,
    lunchBreakEnabled: true,
    lunchBreakAfterPeriod: 4,
    lunchBreakDuration: 60,
    schoolStartTime: '09:00',
    schoolEndTime: '15:45'
  });

  // State for selected grade/section
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<any>(null);

  // State for timetable cells
  const [timetableCells, setTimetableCells] = useState<TimetableCell[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for configuration modal
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Initialize timetable cells when configuration or section changes
  useEffect(() => {
    if (selectedSectionId) {
      initializeTimetableCells();
    }
  }, [weekConfig, selectedSectionId]);

  // Load existing timetable when section changes
  useEffect(() => {
    if (selectedSectionId && existingTimetable.length > 0) {
      loadExistingTimetable();
    }
  }, [selectedSectionId, existingTimetable]);

  const initializeTimetableCells = () => {
    const cells: TimetableCell[] = [];
    weekConfig.days.forEach(day => {
      for (let period = 1; period <= weekConfig.periodsPerDay; period++) {
        // Skip lunch break period
        if (weekConfig.lunchBreakEnabled && period === weekConfig.lunchBreakAfterPeriod) {
          continue;
        }
        cells.push({
          day,
          period,
          subjectId: null,
          teacherId: null,
          roomId: ''
        });
      }
    });
    setTimetableCells(cells);
  };

  const loadExistingTimetable = () => {
    const sectionTimetable = existingTimetable.filter(
      entry => entry.section_configuration_id === selectedSectionId
    );
    
    if (sectionTimetable.length > 0) {
      const updatedCells = timetableCells.map(cell => {
        const existingEntry = sectionTimetable.find(
          entry => entry.day_of_week === cell.day && 
                   entry.time_slot?.order_index === cell.period
        );
        
        if (existingEntry) {
          return {
            ...cell,
            subjectId: existingEntry.subject_id,
            teacherId: existingEntry.teacher_id,
            roomId: existingEntry.room_number || ''
          };
        }
        return cell;
      });
      setTimetableCells(updatedCells);
    }
  };

  const getTeacherForSubjectAndSection = (subjectId: string, sectionId: string) => {
    // First try to find exact match for subject code and grade/section
    const exactMatch = teacherSubjectAssignments.find(
      asg => (asg.subjectCode === subjectId || asg.subjectId === subjectId) && 
             asg.grade === selectedSection?.grade_level &&
             asg.section === selectedSection?.section_name
    );
    
    if (exactMatch) return exactMatch.teacherId;

    // Fallback: find teacher assigned to this subject for this grade (any section)
    const gradeMatch = teacherSubjectAssignments.find(
      asg => (asg.subjectCode === subjectId || asg.subjectId === subjectId) && 
             asg.grade === selectedSection?.grade_level
    );
    
    if (gradeMatch) return gradeMatch.teacherId;

    // Fallback: find any teacher assigned to this subject
    const subjectMatch = teacherSubjectAssignments.find(
      asg => asg.subjectCode === subjectId || asg.subjectId === subjectId
    );
    
    return subjectMatch?.teacherId || null;
  };

  const handleSubjectChange = (day: string, period: number, subjectId: string) => {
    const teacherId = getTeacherForSubjectAndSection(subjectId, selectedSectionId);
    
    setTimetableCells(prev => 
      prev.map(cell => 
        cell.day === day && cell.period === period
          ? { ...cell, subjectId, teacherId: teacherId || undefined } // Use undefined instead of empty string
          : cell
      )
    );
  };

  const handleRoomChange = (day: string, period: number, roomId: string) => {
    setTimetableCells(prev => 
      prev.map(cell => 
        cell.day === day && cell.period === period
          ? { ...cell, roomId }
          : cell
      )
    );
  };

  const clearCell = (day: string, period: number) => {
    setTimetableCells(prev => 
      prev.map(cell => 
        cell.day === day && cell.period === period
          ? { ...cell, subjectId: null, teacherId: null, roomId: '' }
          : cell
      )
    );
  };

  const handleSave = async () => {
    if (!selectedSectionId) {
      setError('Please select a grade and section first');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Prepare timetable data for bulk save
      const timetableData: CreateBulkTimetableRequest = {
        section_configuration_id: selectedSectionId,
        academic_year_id: currentAcademicYear?.id || '',
        week_configuration: weekConfig,
        entries: timetableCells
          .filter(cell => cell.subjectId && cell.subjectId !== '') // Only include entries with subjects
          .map(cell => ({
            day_of_week: cell.day,
            period: cell.period,
            subject_id: cell.subjectId as string,
            teacher_id: cell.teacherId && cell.teacherId !== '' ? cell.teacherId : undefined, // Don't send empty teacher_id
            room_number: cell.roomId || ''
          }))
      };

      await createBulkTimetable(timetableData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Also call the parent callback for any additional logic if provided
      if (onSaveTimetable) {
        await onSaveTimetable(timetableData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save timetable');
    } finally {
      setIsSaving(false);
    }
  };

  const getPeriodTime = (period: number) => {
    const [hours, minutes] = weekConfig.schoolStartTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const periodStart = startMinutes + (period - 1) * weekConfig.periodDuration;
    const periodEnd = periodStart + weekConfig.periodDuration;
    
    const formatTime = (totalMinutes: number) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(periodStart)} - ${formatTime(periodEnd)}`;
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.subject_name || subject?.name || 'Unknown';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.full_name || teacher?.name || 'Not assigned';
  };

  const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-brand-blue" />
              Weekly Timetable Builder
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Create your entire weekly schedule in one go with smart teacher assignments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configure Week
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedSectionId}
              className="h-10 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Timetable
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 text-sm text-emerald-600 font-semibold items-center"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Timetable saved successfully!</span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2 text-sm text-rose-600 font-semibold items-center"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
              Select Grade & Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                const section = sectionConfigurations.find(s => s.id === e.target.value);
                setSelectedSectionId(e.target.value);
                setSelectedSection(section);
              }}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">Choose a class to schedule...</option>
              {sectionConfigurations.map(section => (
                <option key={section.id} value={section.id}>
                  {section.grade_level} - {section.section_name}
                </option>
              ))}
            </select>
          </div>
          {selectedSection && (
            <div className="flex items-center gap-3 bg-brand-blue/10 px-4 py-3 rounded-xl">
              <Users className="w-5 h-5 text-brand-blue" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedSection.grade_level} - {selectedSection.section_name}
                </p>
                <p className="text-xs text-slate-500">
                  {weekConfig.days.length} days · {weekConfig.periodsPerDay} periods/day
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Week Configuration Summary */}
      <div className="bg-gradient-to-r from-brand-blue/5 to-brand-indigo/5 rounded-2xl border border-brand-blue/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-blue" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Week Configuration</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Days</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{weekConfig.days.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Periods/Day</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{weekConfig.periodsPerDay}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Duration</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{weekConfig.periodDuration} min</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">School Hours</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {weekConfig.schoolStartTime} - {weekConfig.schoolEndTime}
            </p>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      {selectedSectionId && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4 text-left font-mono text-xs font-bold text-slate-400 uppercase w-24">
                    Period
                  </th>
                  {weekConfig.days.map(day => (
                    <th key={day} className="py-3 px-4 text-center font-mono text-xs font-bold text-slate-900 dark:text-white uppercase min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: weekConfig.periodsPerDay }, (_, i) => i + 1).map(period => {
                  // Check if this is lunch break
                  const isLunchBreak = weekConfig.lunchBreakEnabled && period === weekConfig.lunchBreakAfterPeriod;
                  
                  return (
                    <tr key={period} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-3 px-4">
                        <div className="text-left">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">Period {period}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{getPeriodTime(period)}</p>
                        </div>
                      </td>
                      {weekConfig.days.map(day => {
                        if (isLunchBreak) {
                          return (
                            <td key={`${day}-${period}`} className="py-3 px-2">
                              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-center">
                                <ChefHat className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Lunch Break</p>
                                <p className="text-[10px] text-amber-600 dark:text-amber-500">
                                  {weekConfig.lunchBreakDuration} min
                                </p>
                              </div>
                            </td>
                          );
                        }

                        const cell = timetableCells.find(c => c.day === day && c.period === period);
                        
                        return (
                          <td key={`${day}-${period}`} className="py-2 px-2">
                            <div className="space-y-1.5">
                              {/* Subject Selector */}
                              <select
                                value={cell?.subjectId || ''}
                                onChange={(e) => handleSubjectChange(day, period, e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                              >
                                <option value="">Select subject</option>
                                {subjects.map(subject => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.subject_name || subject.name}
                                  </option>
                                ))}
                              </select>

                              {/* Teacher Display (Auto-assigned) */}
                              {cell?.teacherId && (
                                <div className="flex items-center gap-1 bg-brand-blue/10 px-2 py-1 rounded text-xs">
                                  <User className="w-3 h-3 text-brand-blue" />
                                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {getTeacherName(cell.teacherId)}
                                  </span>
                                </div>
                              )}

                              {/* Room Input */}
                              {cell?.subjectId && (
                                <input
                                  type="text"
                                  value={cell?.roomId || ''}
                                  onChange={(e) => handleRoomChange(day, period, e.target.value)}
                                  placeholder="Room"
                                  className="w-full h-7 px-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                />
                              )}

                              {/* Clear Button */}
                              {cell?.subjectId && (
                                <button
                                  onClick={() => clearCell(day, period)}
                                  className="w-full h-6 flex items-center justify-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Clear
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-blue" />
                  Configure Week Structure
                </h3>
                <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Days Selection */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 block">
                    Days of Operation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          setWeekConfig(prev => ({
                            ...prev,
                            days: prev.days.includes(day)
                              ? prev.days.filter(d => d !== day)
                              : [...prev.days, day]
                          }));
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          weekConfig.days.includes(day)
                            ? 'bg-brand-blue text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                      Periods Per Day
                    </label>
                    <input
                      type="number"
                      value={weekConfig.periodsPerDay}
                      onChange={(e) => setWeekConfig(prev => ({ ...prev, periodsPerDay: parseInt(e.target.value) || 1 }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                      Period Duration (min)
                    </label>
                    <input
                      type="number"
                      value={weekConfig.periodDuration}
                      onChange={(e) => setWeekConfig(prev => ({ ...prev, periodDuration: parseInt(e.target.value) || 30 }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      min="30"
                      max="120"
                    />
                  </div>
                </div>

                {/* School Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                      School Start Time
                    </label>
                    <input
                      type="time"
                      value={weekConfig.schoolStartTime}
                      onChange={(e) => setWeekConfig(prev => ({ ...prev, schoolStartTime: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                      School End Time
                    </label>
                    <input
                      type="time"
                      value={weekConfig.schoolEndTime}
                      onChange={(e) => setWeekConfig(prev => ({ ...prev, schoolEndTime: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                {/* Lunch Break Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-slate-400">
                      Enable Lunch Break
                    </label>
                    <button
                      onClick={() => setWeekConfig(prev => ({ ...prev, lunchBreakEnabled: !prev.lunchBreakEnabled }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        weekConfig.lunchBreakEnabled ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          weekConfig.lunchBreakEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {weekConfig.lunchBreakEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                          After Period
                        </label>
                        <input
                          type="number"
                          value={weekConfig.lunchBreakAfterPeriod}
                          onChange={(e) => setWeekConfig(prev => ({ ...prev, lunchBreakAfterPeriod: parseInt(e.target.value) || 1 }))}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          min="1"
                          max={weekConfig.periodsPerDay}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 block">
                          Duration (min)
                        </label>
                        <input
                          type="number"
                          value={weekConfig.lunchBreakDuration}
                          onChange={(e) => setWeekConfig(prev => ({ ...prev, lunchBreakDuration: parseInt(e.target.value) || 30 }))}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          min="15"
                          max="120"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-slate-500 text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfigModal(false);
                      initializeTimetableCells();
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-xs"
                  >
                    Apply Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
