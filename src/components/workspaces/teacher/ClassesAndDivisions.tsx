/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Calendar, MapPin, ChevronDown, ChevronUp,
  AlertCircle, TrendingUp, Award, GraduationCap, Building2,
  Filter, Search, RefreshCw
} from 'lucide-react';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { ClassesSkeleton } from './SkeletonLoaders';

interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  category: string;
  weekly_hours: number;
  description?: string;
}

interface SubjectAssignment {
  id: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  category: string;
  weekly_hours: number;
  description?: string;
  role: string;
  weekly_teaching_hours: number;
  sections_assigned: number;
  semester: string;
  academic_year: string;
  academic_year_id: string;
  assignment_id: string;
  assignment_date: string;
  notes?: string;
}

interface ClassSection {
  section_name: string;
  subjects: SubjectAssignment[];
}

interface GradeDivision {
  grade_level: string;
  sections: ClassSection[];
}

interface TimeSlot {
  id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  break_time: boolean;
  order_index: number;
}

interface SubjectDetails {
  id: string;
  subject_code: string;
  subject_name: string;
  category: string;
  weekly_hours: number;
}

interface SectionConfiguration {
  id: string;
  grade_level: string;
  section_name: string;
  max_capacity: number;
  current_count: number;
  academic_year: string;
}

interface TimetableEntry {
  id: string;
  time_slot: TimeSlot;
  subject: SubjectDetails;
  section_configuration: SectionConfiguration;
  room_number: string;
  notes?: string;
  academic_year_id: string;
}

interface DayTimetable {
  day: string;
  slots: TimetableEntry[];
}

interface TeacherData {
  teacher: {
    id: string;
    full_name: string;
    employee_id: string;
    department: string;
    email: string;
    photo: string;
    weekly_load: string;
    assigned_grades: string[];
    assigned_sections: string[];
  };
  academic_year_id: string;
  subjects: Subject[];
  grades: string[];
  sections: string[];
  section_configurations: SectionConfiguration[];
  classes_and_divisions: GradeDivision[];
  weekly_timetable: DayTimetable[];
  subject_assignments: SubjectAssignment[];
  total_subjects: number;
  total_classes: number;
  total_weekly_hours: number;
  total_assignments: number;
}

interface ClassesAndDivisionsProps {
  teacherId: string;
  schoolId: string;
}

export const ClassesAndDivisions: React.FC<ClassesAndDivisionsProps> = ({ teacherId, schoolId }) => {
  const { data, loading, error, refreshData } = useTeacherData();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'classes' | 'timetable'>('classes');
  const [refreshing, setRefreshing] = useState(false);

  const teacherData = data.classes as TeacherData | null;

  useEffect(() => {
    if (teacherId && schoolId && !data.classes) {
      refreshData('classes');
    }
  }, [teacherId, schoolId]);

  useEffect(() => {
    // Expand first grade by default if there are classes
    if (teacherData?.classes_and_divisions && teacherData.classes_and_divisions.length > 0) {
      setExpandedGrades(new Set([teacherData.classes_and_divisions[0].grade_level]));
    }
  }, [teacherData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData('classes');
    setRefreshing(false);
  };

  const toggleGradeExpansion = (gradeLevel: string) => {
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gradeLevel)) {
        newSet.delete(gradeLevel);
      } else {
        newSet.add(gradeLevel);
      }
      return newSet;
    });
  };

  const expandAllGrades = () => {
    if (teacherData) {
      setExpandedGrades(new Set(teacherData.classes_and_divisions.map(g => g.grade_level)));
    }
  };

  const collapseAllGrades = () => {
    setExpandedGrades(new Set());
  };

  const getFilteredClasses = () => {
    if (!teacherData) return [];
    
    return teacherData.classes_and_divisions.map(grade => ({
      ...grade,
      sections: grade.sections.filter(section => {
        const matchesGrade = selectedGrade === 'all' || grade.grade_level === selectedGrade;
        const matchesSection = selectedSection === 'all' || section.section_name === selectedSection;
        return matchesGrade && matchesSection;
      })
    })).filter(grade => grade.sections.length > 0);
  };

  const getFilteredTimetable = () => {
    if (!teacherData) return [];
    
    return teacherData.weekly_timetable.map(day => ({
      ...day,
      slots: day.slots.filter(slot => {
        const matchesDay = selectedDay === 'all' || day.day === selectedDay;
        return matchesDay;
      })
    })).filter(day => day.slots.length > 0);
  };

  if (loading.classes || !data.classes) {
    return <ClassesSkeleton />;
  }

  if (error.classes) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error loading data</p>
            <p className="text-xs text-red-600 dark:text-red-400">{error.classes}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-400">No class data available</p>
      </div>
    );
  }

  const filteredClasses = getFilteredClasses();
  const filteredTimetable = getFilteredTimetable();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Classes & Subject Divisions</h3>
            <p className="text-[11px] text-slate-500">Overview of assigned classes, subjects, grades, sections, and weekly timetable</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-blue transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Teacher Profile Summary */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-indigo p-5 rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
            {teacherData.teacher.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black">{teacherData.teacher.full_name}</h4>
            <p className="text-xs text-white/80 font-mono">{teacherData.teacher.employee_id} • {teacherData.teacher.department}</p>
            <p className="text-[10px] text-white/70 mt-1">{teacherData.teacher.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/70 font-mono">Weekly Load</p>
            <p className="text-lg font-black">{teacherData.teacher.weekly_load}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-brand-blue" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Subjects</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{teacherData.total_subjects}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Classes</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{teacherData.total_classes}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Weekly Hours</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{teacherData.total_weekly_hours}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Assignments</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{teacherData.total_assignments}</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('classes')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'classes' 
              ? 'bg-white dark:bg-slate-800 text-brand-blue shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Classes & Divisions</span>
          </div>
        </button>
        <button
          onClick={() => setViewMode('timetable')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'timetable' 
              ? 'bg-white dark:bg-slate-800 text-brand-blue shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Weekly Timetable</span>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-500">Filters:</span>
        </div>
        
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="all">All Grades</option>
          {teacherData.grades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="all">All Sections</option>
          {teacherData.sections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>

        {viewMode === 'timetable' && (
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">All Days</option>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        )}

        {viewMode === 'classes' && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={expandAllGrades}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllGrades}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'classes' ? (
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">No classes match the current filters</p>
            </div>
          ) : (
            filteredClasses.map((grade) => (
              <div key={grade.grade_level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleGradeExpansion(grade.grade_level)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-brand-blue" />
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{grade.grade_level}</h4>
                      <p className="text-[10px] text-slate-500">{grade.sections.length} section(s) • {grade.sections.reduce((acc, s) => acc + s.subjects.length, 0)} subject(s)</p>
                    </div>
                  </div>
                  {expandedGrades.has(grade.grade_level) ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedGrades.has(grade.grade_level) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <div className="p-4 space-y-3">
                        {grade.sections.map((section) => (
                          <div key={section.section_name} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Building2 className="w-4 h-4 text-emerald-500" />
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{section.section_name}</h5>
                              <span className="text-[10px] text-slate-500">• {section.subjects.length} subject(s)</span>
                            </div>
                            <div className="space-y-2">
                              {section.subjects.map((subject) => (
                                <div key={subject.assignment_id} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-mono bg-brand-blue/10 text-brand-blue font-bold px-2 py-0.5 rounded">
                                          {subject.subject_code}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">{subject.category}</span>
                                      </div>
                                      <h6 className="text-xs font-bold text-slate-900 dark:text-white">{subject.subject_name}</h6>
                                      {subject.description && (
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{subject.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{subject.weekly_teaching_hours}h/week</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        {subject.role}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-500">Semester: {subject.semester}</span>
                                    <span className="text-[10px] text-slate-500">Year: {subject.academic_year}</span>
                                    {subject.notes && (
                                      <span className="text-[10px] text-slate-500 italic">"{subject.notes}"</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTimetable.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">No timetable entries match the current filters</p>
            </div>
          ) : (
            filteredTimetable.map((day) => (
              <div key={day.day} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-blue" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{day.day}</h4>
                    <span className="text-[10px] text-slate-500">• {day.slots.length} class(es)</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {day.slots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{slot.time_slot.slot_name}</p>
                          <p className="text-[10px] text-slate-500">{slot.time_slot.start_time} - {slot.time_slot.end_time}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-brand-blue" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{slot.subject.subject_name}</span>
                          <span className="text-[10px] font-mono bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                            {slot.subject.subject_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span>{slot.section_configuration.grade_level} - {slot.section_configuration.section_name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {slot.room_number}
                          </span>
                        </div>
                      </div>
                      {slot.notes && (
                        <div className="text-[10px] text-slate-500 italic max-w-[200px]">
                          "{slot.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
