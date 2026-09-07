/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Users, TrendingUp, Award, Filter, Search, Download,
  ChevronDown, ChevronUp, Eye, Edit, CheckCircle, XCircle, AlertCircle,
  Calendar, Clock, BarChart3, PieChart
} from 'lucide-react';
import { api } from '../../../lib/api';
import { GenericSkeleton } from './SkeletonLoaders';

interface GradebookEntry {
  id: string;
  student_id: string;
  student_name: string;
  assessment_type: string;
  assessment_title: string;
  subject_name?: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade?: string;
  assessment_date: string;
}

interface ClassPerformance {
  grade_level: string;
  section_name?: string;
  total_students: number;
  overall_average: number;
  overall_gpa: number;
  subject_performance: Array<{
    subject_id: string;
    subject_name: string;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    total_students: number;
    grade_distribution: {
      a: number;
      b: number;
      c: number;
      d: number;
      f: number;
    };
  }>;
}

interface GradebookViewProps {
  teacherId: string;
  schoolId: string;
  gradeLevel?: string;
  sectionName?: string;
  subjectId?: string;
  term?: string;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  teacherId,
  schoolId,
  gradeLevel = '',
  sectionName = '',
  subjectId = '',
  term = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics'>('overview');
  const [gradebookEntries, setGradebookEntries] = useState<GradebookEntry[]>([]);
  const [classPerformance, setClassPerformance] = useState<ClassPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignedClassesLoading, setAssignedClassesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState(subjectId);
  const [selectedTerm, setSelectedTerm] = useState(term);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [assignedClasses, setAssignedClasses] = useState<Array<{ grade_level: string; section_name: string }>>([]);

  useEffect(() => {
    const fetchAssignedClasses = async () => {
      if (!teacherId || !schoolId) return;
      setAssignedClassesLoading(true);
      try {
        const response = await fetch(`/api/teachers/${teacherId}/students`, {
          headers: { 'X-School-ID': schoolId, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to load teacher roster');
        const data = await response.json();
        setAssignedClasses(data.assigned_grade_sections || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load assigned classes');
      } finally {
        setAssignedClassesLoading(false);
      }
    };
    fetchAssignedClasses();
  }, [teacherId, schoolId]);

  useEffect(() => {
    fetchGradebookData();
  }, [gradeLevel, sectionName, selectedSubject, selectedTerm, assignedClasses]);

  const fetchGradebookData = async () => {
    try {
      if (!gradeLevel && assignedClasses.length === 0) return;
      setLoading(true);
      setError(null);

      const classes = gradeLevel
        ? [{ grade_level: gradeLevel, section_name: sectionName }]
        : assignedClasses;
      const entryResponses = await Promise.all(classes.map((assignedClass) => api.get('/gradebook/class', {
        grade_level: assignedClass.grade_level,
        section_name: assignedClass.section_name,
        teacher_id: teacherId,
        subject_id: selectedSubject,
        term: selectedTerm,
      })));
      setGradebookEntries(entryResponses.flatMap((response: any) => response || []));

      // Fetch class analytics
      const analyticsClass = classes[0];
      const analyticsResponse = await api.get('/gradebook/analytics/class', {
        grade_level: analyticsClass?.grade_level || gradeLevel,
        section_name: analyticsClass?.section_name || sectionName,
        teacher_id: teacherId,
        subject_id: selectedSubject,
        term: selectedTerm,
      });
      setClassPerformance(analyticsResponse || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gradebook data');
    } finally {
      setLoading(false);
    }
  };

  const getLetterGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-500';
    switch (grade.toUpperCase()) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const sortedEntries = [...gradebookEntries].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.student_name.localeCompare(b.student_name);
        break;
      case 'score':
        comparison = a.percentage - b.percentage;
        break;
      case 'date':
        comparison = new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredEntries = sortedEntries.filter(entry =>
    entry.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.assessment_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.subject_name && entry.subject_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate statistics
  const totalAssessments = gradebookEntries.length;
  const averageScore = totalAssessments > 0 
    ? gradebookEntries.reduce((sum, e) => sum + e.percentage, 0) / totalAssessments 
    : 0;
  const gradeDistribution = {
    A: gradebookEntries.filter(e => e.letter_grade === 'A').length,
    B: gradebookEntries.filter(e => e.letter_grade === 'B').length,
    C: gradebookEntries.filter(e => e.letter_grade === 'C').length,
    D: gradebookEntries.filter(e => e.letter_grade === 'D').length,
    F: gradebookEntries.filter(e => e.letter_grade === 'F').length,
  };

  if (loading || assignedClassesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gradebook</h2>
          <p className="text-gray-600 mt-1">
            {gradeLevel && `${gradeLevel} `}
            {sectionName && `- ${sectionName} `}
            {selectedSubject && `• ${selectedSubject}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'students'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Student Grades
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'analytics'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalAssessments}</p>
                </div>
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className={`text-2xl font-bold mt-1 ${getPerformanceColor(averageScore)}`}>
                    {averageScore.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Class GPA</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {classPerformance?.overall_gpa.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <Award className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {classPerformance?.total_students || 0}
                  </p>
                </div>
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold ${getLetterGradeColor(grade)}`}>
                    {grade}
                  </div>
                  <p className="text-gray-600 mt-2">{count} students</p>
                  <p className="text-sm text-gray-500">
                    {totalAssessments > 0 ? ((count / totalAssessments) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          {classPerformance?.subject_performance && classPerformance.subject_performance.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {classPerformance.subject_performance.map((subject) => (
                  <div key={subject.subject_id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{subject.subject_name}</h4>
                      <span className={`font-semibold ${getPerformanceColor(subject.average_score)}`}>
                        {subject.average_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          subject.average_score >= 90 ? 'bg-green-500' :
                          subject.average_score >= 75 ? 'bg-blue-500' :
                          subject.average_score >= 60 ? 'bg-yellow-500' :
                          subject.average_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.average_score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>Highest: {subject.highest_score.toFixed(1)}%</span>
                      <span>Lowest: {subject.lowest_score.toFixed(1)}%</span>
                      <span>{subject.total_students} students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students or assessments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="score">Sort by Score</option>
                  <option value="date">Sort by Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Assessment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No gradebook entries found
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{entry.student_name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{entry.assessment_title}</td>
                        <td className="px-4 py-3 text-gray-700">{entry.subject_name || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getPerformanceColor(entry.percentage)}`}>
                              {entry.percentage.toFixed(1)}%
                            </span>
                            <span className="text-gray-500 text-sm">
                              ({entry.score}/{entry.max_score})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {entry.letter_grade && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLetterGradeColor(entry.letter_grade)}`}>
                              {entry.letter_grade}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(entry.assessment_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 hover:bg-green-100 rounded-lg text-green-600">
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Performance Trends
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Performance charts will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Subject Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-purple-600" />
                Subject Comparison
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Subject comparison charts will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="font-medium text-gray-900">Above Average</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {gradebookEntries.filter(e => e.percentage >= averageScore).length}
                </p>
                <p className="text-sm text-gray-600">students performing above average</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={20} className="text-yellow-600" />
                  <span className="font-medium text-gray-900">Needs Attention</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {gradebookEntries.filter(e => e.percentage < 60 && e.percentage >= 40).length}
                </p>
                <p className="text-sm text-gray-600">students need improvement</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={20} className="text-red-600" />
                  <span className="font-medium text-gray-900">At Risk</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {gradebookEntries.filter(e => e.percentage < 40).length}
                </p>
                <p className="text-sm text-gray-600">students at risk of failing</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
