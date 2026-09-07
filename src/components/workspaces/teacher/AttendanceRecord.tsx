'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, ChevronDown, ChevronUp, Save, Filter, RefreshCw
} from 'lucide-react';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { AttendanceSkeleton } from './SkeletonLoaders';

interface Student {
  student: {
    id: string;
    full_name: string;
    admission_number: string;
    grade_level: string;
    section: string;
    gender: string;
    parent_id: string | null;
  };
  allocation_id: string;
  attendance: {
    id: string;
    status: string;
    class_date: string;
    recorded_at: string;
  } | null;
}

interface ClassAssignment {
  assignment: {
    id: string;
    subject: {
      id: string;
      subject_code: string;
      subject_name: string;
      category: string;
    };
    grade_level: string;
    section_name: string;
    role: string;
    semester: string;
  };
  students: Student[];
  summary: {
    total_students: number;
    attended_students: number;
    attendance_percentage: number;
    date: string;
  };
}

interface AttendanceData {
  teacher: {
    id: string;
    full_name: string;
    employee_id: string;
    department: string;
  };
  classes: ClassAssignment[];
  total_classes: number;
}

interface AttendanceRecordProps {
  teacherId: string;
  schoolId: string;
}

export const AttendanceRecord: React.FC<AttendanceRecordProps> = ({ teacherId, schoolId }) => {
  const { data, loading, error, refreshData } = useTeacherData();
  const [selectedClass, setSelectedClass] = useState<ClassAssignment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const attendanceData = data.attendance as AttendanceData | null;

  useEffect(() => {
    if (teacherId && schoolId && !data.attendance) {
      refreshData('attendance');
    }
  }, [teacherId, schoolId]);

  useEffect(() => {
    // Process attendance data when it loads
    if (attendanceData?.classes) {
      const recordsMap = new Map<string, string>();
      attendanceData.classes.forEach((classData: ClassAssignment) => {
        classData.students.forEach((studentData: Student) => {
          if (studentData.attendance) {
            recordsMap.set(studentData.student.id, studentData.attendance.status);
          }
        });
      });
      setAttendanceRecords(recordsMap);

      // Expand first class by default
      if (attendanceData.classes.length > 0) {
        setExpandedClasses(new Set([attendanceData.classes[0].assignment.id]));
        setSelectedClass(attendanceData.classes[0]);
      }
    }
  }, [attendanceData]);

  const fetchAttendanceData = async () => {
    await refreshData('attendance');
  };
      


  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const selectClass = (classData: ClassAssignment) => {
    setSelectedClass(classData);
  };

  const markAttendance = (studentId: string, status: string) => {
    setAttendanceRecords(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  const markAllPresent = () => {
    if (!selectedClass) return;
    
    const newRecords = new Map(attendanceRecords);
    selectedClass.students.forEach((studentData: Student) => {
      newRecords.set(studentData.student.id, 'present');
    });
    setAttendanceRecords(newRecords);
  };

  const markAllAbsent = () => {
    if (!selectedClass) return;
    
    const newRecords = new Map(attendanceRecords);
    selectedClass.students.forEach((studentData: Student) => {
      newRecords.set(studentData.student.id, 'absent');
    });
    setAttendanceRecords(newRecords);
  };

  const getAttendanceColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const calculateSummary = () => {
    if (!selectedClass) return null;

    const totalStudents = selectedClass.students.length;
    const presentCount = selectedClass.students.filter(student => 
      attendanceRecords.get(student.student.id) === 'present'
    ).length;
    const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return {
      total_students: totalStudents,
      present_count: presentCount,
      absent_count: totalStudents - presentCount,
      attendance_percentage: percentage
    };
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    setSaving(true);
    try {
      const attendanceData = {
        subject_id: selectedClass.assignment.subject.id,
        grade_level: selectedClass.assignment.grade_level,
        section_name: selectedClass.assignment.section_name,
        class_date: selectedDate,
        attendance_records: selectedClass.students.map(student => ({
          student_id: student.student.id,
          status: attendanceRecords.get(student.student.id) || 'present'
        })),
        notes: ''
      };

      const response = await fetch(`/api/teachers/${teacherId}/attendance/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-School-ID': schoolId
        },
        body: JSON.stringify(attendanceData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save attendance: ${response.status}`);
      }

      const result = await response.json();
      alert(`Attendance saved successfully!\n${result.summary.total_students} students recorded`);
      
      // Refresh data
      await fetchAttendanceData();
    } catch (err) {
      alert(`Failed to save attendance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading.attendance || !data.attendance) {
    return <AttendanceSkeleton />;
  }

  if (error.attendance) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Attendance Data</h3>
            <p className="text-red-600 text-sm">{error.attendance}</p>
          </div>
        </div>
        <button
          onClick={fetchAttendanceData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!attendanceData || attendanceData.classes.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="text-yellow-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-yellow-800 font-semibold">No Classes Found</h3>
            <p className="text-yellow-600 text-sm">
              No class assignments found for this teacher. Please contact the administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Record Attendance</h2>
          <p className="text-gray-600 mt-1">
            {attendanceData.teacher.full_name} • {attendanceData.teacher.department}
          </p>
        </div>
        <button
          onClick={fetchAttendanceData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Attendance Date:</label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {attendanceData.classes.map((classData) => (
          <motion.div
            key={classData.assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Class Header */}
            <button
              onClick={() => {
                toggleClassExpansion(classData.assignment.id);
                selectClass(classData);
              }}
              className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                selectedClass?.assignment.id === classData.assignment.id
                  ? 'bg-blue-50 border-b-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-b'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {classData.assignment.subject.subject_name} ({classData.assignment.subject.subject_code})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {classData.assignment.grade_level} • {classData.assignment.section_name} • {classData.students.length} students
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Attendance: {classData.summary.attendance_percentage.toFixed(1)}%
                </div>
                {expandedClasses.has(classData.assignment.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {/* Students List */}
            {expandedClasses.has(classData.assignment.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-gray-200"
              >
                <div className="p-4">
                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={markAllPresent}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark All Present
                    </button>
                    <button
                      onClick={markAllAbsent}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Mark All Absent
                    </button>
                  </div>

                  {/* Attendance Summary */}
                  {selectedClass?.assignment.id === classData.assignment.id && summary && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{summary.total_students}</div>
                          <div className="text-xs text-gray-600">Total Students</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{summary.present_count}</div>
                          <div className="text-xs text-gray-600">Present</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{summary.absent_count}</div>
                          <div className="text-xs text-gray-600">Absent</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{summary.attendance_percentage}%</div>
                          <div className="text-xs text-gray-600">Attendance</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Students Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission No.
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mark Attendance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from(new Map(classData.students.map((studentData) => [studentData.student.id, studentData])).values()).map((studentData) => (
                          <tr key={`${classData.assignment.id}-${studentData.student.id}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                                  {studentData.student.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {studentData.student.full_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {studentData.student.grade_level} / {studentData.student.section}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{studentData.student.admission_number}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {studentData.attendance ? (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(studentData.attendance.status)}`}>
                                  {getAttendanceIcon(studentData.attendance.status)}
                                  {studentData.attendance.status}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Not recorded</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => markAttendance(studentData.student.id, 'present')}
                                  className={`p-2 rounded-md transition-colors ${
                                    attendanceRecords.get(studentData.student.id) === 'present'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                  title="Present"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => markAttendance(studentData.student.id, 'absent')}
                                  className={`p-2 rounded-md transition-colors ${
                                    attendanceRecords.get(studentData.student.id) === 'absent'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                  title="Absent"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => markAttendance(studentData.student.id, 'late')}
                                  className={`p-2 rounded-md transition-colors ${
                                    attendanceRecords.get(studentData.student.id) === 'late'
                                      ? 'bg-yellow-500 text-white'
                                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  }`}
                                  title="Late"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => markAttendance(studentData.student.id, 'excused')}
                                  className={`p-2 rounded-md transition-colors ${
                                    attendanceRecords.get(studentData.student.id) === 'excused'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                  title="Excused"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Button */}
                  {selectedClass?.assignment.id === classData.assignment.id && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={saveAttendance}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Attendance
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
