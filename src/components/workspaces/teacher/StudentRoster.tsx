'use client';

import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { motion } from 'motion/react';
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, GraduationCap, Calendar, Filter, AlertTriangle, Send, X } from 'lucide-react';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { StudentsSkeleton } from './SkeletonLoaders';

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  admission_number: string;
  gender: string;
  grade_level: string;
  section: string;
  parent_id: string | null;
  allocation_date: string;
  allocation_method: string;
  notes: string | null;
  attendance: {
    total_classes: number;
    present_classes: number;
    attendance_percentage: number;
  };
  performance: {
    total_assignments: number;
    passed_assignments: number;
    performance_percentage: number;
  };
}

interface GradeSection {
  grade_level: string;
  section_name: string;
  students: Student[];
}

interface Teacher {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
}

interface StudentRosterData {
  teacher: Teacher;
  academic_year_id: string;
  assigned_grade_sections: Array<{ grade_level: string; section_name: string }>;
  students_by_grade_section: GradeSection[];
  total_students: number;
  message?: string;
}

interface StudentRosterProps {
  teacherId: string;
  schoolId: string;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({ teacherId, schoolId }) => {
  const { data, loading, error, refreshData } = useTeacherData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyParent, setNotifyParent] = useState(true);
  const [notifyDirector, setNotifyDirector] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const rosterData = data.students as StudentRosterData | null;

  useEffect(() => {
    if (teacherId && schoolId && !data.students) {
      refreshData('students');
    }
  }, [teacherId, schoolId]);

  useEffect(() => {
    // Expand first grade by default if there are students
    if (rosterData?.students_by_grade_section && rosterData.students_by_grade_section.length > 0) {
      setExpandedGrades(new Set([rosterData.students_by_grade_section[0].grade_level]));
    }
  }, [rosterData]);

  const fetchStudentRoster = async () => {
    await refreshData('students');
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const shouldShowAlert = (student: Student) => {
    return student.attendance.attendance_percentage < 60 || 
           student.performance.performance_percentage < 60;
  };

  const handleNotifyStudent = (student: Student) => {
    setSelectedStudent(student);
    setNotifyMessage('');
    setNotifyParent(true);
    setNotifyDirector(false);
  };

  const closeNotificationModal = () => {
    setSelectedStudent(null);
    setNotifyMessage('');
    setNotifyParent(true);
    setNotifyDirector(false);
  };

  const sendNotification = async () => {
    if (!selectedStudent || !notifyMessage.trim()) return;

    setSendingNotification(true);
    try {
      // Here you would integrate with your notification system
      // For now, we'll simulate the notification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Notification sent for ${selectedStudent.full_name}!\n\nTo: ${notifyParent ? 'Parents' : ''} ${notifyDirector ? 'Directors' : ''}\nMessage: ${notifyMessage}`);
      
      closeNotificationModal();
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const getFilteredStudents = () => {
    if (!rosterData) return [];

    let filtered = rosterData.students_by_grade_section;

    // Filter by grade
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(item => item.grade_level === selectedGrade);
    }

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(item => item.section_name === selectedSection);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.map(gradeSection => ({
        ...gradeSection,
        students: gradeSection.students.filter(student =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(gradeSection => gradeSection.students.length > 0);
    }

    return filtered;
  };

  const getUniqueGrades = () => {
    if (!rosterData) return [];
    return Array.from(new Set(rosterData.students_by_grade_section.map(item => item.grade_level)));
  };

  const getUniqueSections = () => {
    if (!rosterData) return [];
    return Array.from(new Set(rosterData.students_by_grade_section.map(item => item.section_name)));
  };

  if (loading.students || !data.students) {
    return <StudentsSkeleton />;
  }

  if (error.students) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Student Roster</h3>
            <p className="text-red-600 text-sm">{error.students}</p>
          </div>
        </div>
        <button
          onClick={fetchStudentRoster}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!rosterData || rosterData.total_students === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="text-yellow-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-yellow-800 font-semibold">No Students Found</h3>
            <p className="text-yellow-600 text-sm">
              {rosterData?.message || 'No students are currently allocated to your assigned grades and sections.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();
  const uniqueGrades = getUniqueGrades();
  const uniqueSections = getUniqueSections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Roster</h2>
          <p className="text-gray-600 mt-1">
            {rosterData?.teacher?.full_name || 'Teacher'} • {rosterData?.teacher?.department || 'Department'}
          </p>
        </div>
        <button
          onClick={fetchStudentRoster}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{rosterData?.total_students || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned Grades</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueGrades.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sections</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueSections.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sections</option>
              {uniqueSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students match your current filters.</p>
          </div>
        ) : (
          filteredStudents.map((gradeSection) => (
            <motion.div
              key={`${gradeSection.grade_level}-${gradeSection.section_name}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Grade/Section Header */}
              <button
                onClick={() => toggleGradeExpansion(gradeSection.grade_level)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{gradeSection.grade_level}</h3>
                    <p className="text-sm text-gray-600">{gradeSection.section_name} • {gradeSection.students.length} students</p>
                  </div>
                </div>
                {expandedGrades.has(gradeSection.grade_level) ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Students Table */}
              {expandedGrades.has(gradeSection.grade_level) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-gray-200"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade/Section
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gradeSection.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {student.full_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.full_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {student.student_id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.admission_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 capitalize">{student.gender}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.grade_level} / {student.section}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getAttendanceColor(student.attendance.attendance_percentage)}`}>
                                  {student.attendance.attendance_percentage}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.attendance.present_classes}/{student.attendance.total_classes} classes
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPerformanceColor(student.performance.performance_percentage)}`}>
                                  {student.performance.performance_percentage}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.performance.passed_assignments}/{student.performance.total_assignments} assignments
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleNotifyStudent(student)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                  shouldShowAlert(student)
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {shouldShowAlert(student) ? (
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Notify
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Send className="w-3 h-3" />
                                    Notify
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Notification Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Notification for {selectedStudent.full_name}
                </h3>
                <button
                  onClick={closeNotificationModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Attendance:</span> {selectedStudent.attendance.attendance_percentage}%
                  ({selectedStudent.attendance.present_classes}/{selectedStudent.attendance.total_classes} classes)
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Performance:</span> {selectedStudent.performance.performance_percentage}%
                  ({selectedStudent.performance.passed_assignments}/{selectedStudent.performance.total_assignments} assignments)
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Grade/Section:</span> {selectedStudent.grade_level} / {selectedStudent.section}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifyParent}
                        onChange={(e) => setNotifyParent(e.target.checked)}
                        className="rounded text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">Parents</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifyDirector}
                        onChange={(e) => setNotifyDirector(e.target.checked)}
                        className="rounded text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">School Directors</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message about the student's attendance or performance..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeNotificationModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendNotification}
                    disabled={sendingNotification || !notifyMessage.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingNotification ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
