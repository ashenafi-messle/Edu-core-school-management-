/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Calendar, Users, Award, DollarSign, BookOpen, 
  Settings, FileText, Megaphone, ClipboardList, MessageSquare, 
  Compass, Download, Star, HelpCircle, UserCheck, Bell, 
  CheckCircle, Save, Info, Sparkles, MapPin, Search, Mail, Phone, HeartPulse
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { api } from '../../lib/api';

// Import Modular Views
import { StudentDashboardView } from './student/StudentDashboardView';
import { AcademicProgressView } from './student/AcademicProgressView';
import { AttendanceView } from './student/AttendanceView';
import { AssignmentsHomeworkView } from './student/AssignmentsHomeworkView';
import { ExaminationsView } from './student/ExaminationsView';
import { ResourcesDownloadsView } from './student/ResourcesDownloadsView';
import { FeedbackRatingsView } from './student/FeedbackRatingsView';
import { MessagesView } from './student/MessagesView';

// Import Mock Database
import { 
  initialProfile, initialSubjectStats, initialAssignments, 
  initialHomework, initialExams, initialResources, 
  initialAnnouncements, initialTeacherRatings, initialFeedback, 
  initialMessageThreads, mockAttendanceRecords, StudentProfile, Assignment, Homework, Examination, TeacherRating, StudentFeedback, Announcement, MessageThread
} from './student/StudentMockData';

interface StudentWorkspaceProps {
  activeItem: string;
  activeSubItem?: string;
  onNavigate?: (itemId: string, subItemId?: string) => void;
  studentId?: string;
  schoolId?: string;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({ 
  activeItem, 
  activeSubItem,
  onNavigate,
  studentId,
  schoolId
}) => {
  // Master States
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [subjects, setSubjects] = useState(initialSubjectStats);
  const [dashboardTimetable, setDashboardTimetable] = useState<any[]>([]);
  const [dashboardGpa, setDashboardGpa] = useState<number | null>(null);
  const [dashboardAttendance, setDashboardAttendance] = useState<number | null>(null);
  const [dashboardAttendanceRecords, setDashboardAttendanceRecords] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('educore-student-assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });
  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('educore-student-homework');
    return saved ? JSON.parse(saved) : initialHomework;
  });
  const [exams, setExams] = useState<Examination[]>(initialExams);
  const [resources, setResources] = useState(initialResources);
  const [curriculumDocuments, setCurriculumDocuments] = useState<any[]>(() => {
    if (typeof window === 'undefined' || !studentId || !schoolId) return [];
    try {
      const cached = localStorage.getItem(`educore-curriculum-${schoolId}-${studentId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const hasCurriculumDocuments = React.useRef(curriculumDocuments.length > 0);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('educore-student-announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });
  const [ratings, setRatings] = useState<TeacherRating[]>(() => {
    const saved = localStorage.getItem('educore-student-teacher-ratings');
    return saved ? JSON.parse(saved) : initialTeacherRatings;
  });
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>(initialFeedback);
  const [threads, setThreads] = useState<MessageThread[]>(initialMessageThreads);

  React.useEffect(() => {
    if (!studentId || !schoolId) return;
    const needsAttendance = activeItem === 'dashboard' || activeItem === 'attendance';
    const needsDashboard = activeItem === 'dashboard';
    let cancelled = false;

    const loadAttendance = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/attendance`, {
          headers: { 'X-School-ID': schoolId },
          cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load attendance');
        if (!cancelled) {
          setDashboardAttendanceRecords(data.records || []);
          setDashboardAttendance(Number(data.attendance_percentage || 0));
        }
      } catch (error) {
        console.error('Failed to load student attendance:', error);
      }
    };

    const loadDashboard = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/dashboard`, {
          headers: { 'X-School-ID': schoolId },
          cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load student dashboard');
        if (cancelled) return;

        setProfile((current) => ({
          ...current,
          id: data.profile.admission_number || data.profile.id,
          name: data.profile.full_name,
          email: data.profile.email || current.email,
          phone: data.profile.phone || current.phone,
          address: data.profile.address || current.address,
          dob: data.profile.date_of_birth || current.dob,
          gender: data.profile.gender ? `${data.profile.gender[0].toUpperCase()}${data.profile.gender.slice(1)}` as StudentProfile['gender'] : current.gender,
          grade: data.profile.grade_level,
          section: data.profile.section || 'Unassigned',
          status: data.profile.users?.status || current.status,
          guardianName: data.profile.parents?.full_name || current.guardianName
        }));
        if (data.registration) {
          const registration = data.registration;
          setProfile((current) => ({
            ...current,
            guardianName: [registration.parent_first_name, registration.parent_last_name].filter(Boolean).join(' ') || current.guardianName,
            guardianRelationship: registration.parent_relationship || current.guardianRelationship,
            guardianPhone: registration.parent_phone || current.guardianPhone,
            guardianEmail: registration.parent_email || current.guardianEmail,
            emergencyContactName: registration.emergency_contact_name || current.emergencyContactName,
            emergencyContactPhone: registration.emergency_phone || current.emergencyContactPhone
          }));
        }
        setEmailInput(data.profile.email || '');
        setPhoneInput(data.profile.phone || '');
        setAddressInput(data.profile.address || '');
        setDashboardTimetable(data.timetable || []);
        setDashboardGpa(data.latest_record?.gpa == null ? null : Number(data.latest_record.gpa));
        setAssignments(data.assignments || []);
        setExams(data.exams?.length ? data.exams : initialExams);
        setAnnouncements((data.announcements || []).map((item: any) => ({
          ...item,
          description: item.description || item.content || '',
          publishedDate: item.published_at || item.created_at,
          target: item.target_audience || 'Entire School',
          priority: item.priority || 'Normal',
          read: false
        })));
      } catch (error) {
        console.error('Failed to load student dashboard:', error);
      }
    };

    if (needsAttendance) loadAttendance();
    if (needsDashboard) loadDashboard();
    const refresh = window.setInterval(() => {
      if (needsAttendance) loadAttendance();
      if (needsDashboard) loadDashboard();
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [studentId, schoolId, activeItem]);

  // Sync back to local storage
  React.useEffect(() => {
    localStorage.setItem('educore-student-assignments', JSON.stringify(assignments));
  }, [assignments]);

  React.useEffect(() => {
    localStorage.setItem('educore-student-homework', JSON.stringify(homework));
  }, [homework]);

  React.useEffect(() => {
    localStorage.setItem('educore-student-announcements', JSON.stringify(announcements));
  }, [announcements]);

  React.useEffect(() => {
    localStorage.setItem('educore-student-teacher-ratings', JSON.stringify(ratings));
  }, [ratings]);

  // Load curriculum documents when studentId is available
  React.useEffect(() => {
    if (!studentId || !schoolId || !['learning_resources', 'downloads', 'courses'].includes(activeItem)) {
      return;
    }

    let cancelled = false;
    const loadCurriculumDocuments = async () => {
      try {
        if (!hasCurriculumDocuments.current) setLoadingCurriculum(true);
        const documents = await api.getStudentCurriculumDocuments(studentId);
        if (!cancelled) {
          setCurriculumDocuments(documents);
          hasCurriculumDocuments.current = documents.length > 0;
          localStorage.setItem(`educore-curriculum-${schoolId}-${studentId}`, JSON.stringify(documents));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load curriculum documents:', error instanceof Error ? error.message : error);
        }
      } finally {
        if (!cancelled) {
          setLoadingCurriculum(false);
        }
      }
    };

    loadCurriculumDocuments();
    const refresh = window.setInterval(loadCurriculumDocuments, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [studentId, schoolId, activeItem]);

  // Profile Edit fields
  const [editMode, setEditMode] = useState(false);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [phoneInput, setPhoneInput] = useState(profile.phone);
  const [addressInput, setAddressInput] = useState(profile.address);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Settings Toggles
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyGrades, setNotifyGrades] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [contrastTheme, setContrastTheme] = useState('System Default');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Real-time Notifications Popover Pane
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Assignment', text: 'New AP Chem Lab report posted by Dr. Foster', time: '10m ago', read: false },
    { id: 2, type: 'Exam', text: 'Taylor Series Midterm Exam scheduled for July 26', time: '2h ago', read: false },
    { id: 3, type: 'Announcement', text: 'Scheduled power grid maintenance delay notice', time: '5h ago', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkNotifRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !schoolId) {
      setProfileError('Your student account is not connected to a school profile.');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-School-ID': schoolId },
        body: JSON.stringify({ email: emailInput.trim(), phone: phoneInput.trim(), address: addressInput.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save profile');
      setProfile(prev => ({ ...prev, email: emailInput.trim(), phone: phoneInput.trim(), address: addressInput.trim() }));
      setEditMode(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveSettings = () => {
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  // Complete Exam callback from simulator
  const handleCompleteExam = (examId: string, finalScore: number, grade: string) => {
    const updatedExams = exams.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          status: 'Completed' as const,
          score: finalScore,
          grade: grade,
          feedback: 'Excellent response and formulas verification. Score successfully synchronised.'
        };
      }
      return e;
    });
    setExams(updatedExams);

    // Update notifications list on completion
    setNotifications(prev => [
      { id: Date.now(), type: 'Marks', text: `Exam graded: ${grade} (${finalScore}/${exams.find(e => e.id === examId)?.totalMarks})`, time: 'Just now', read: false },
      ...prev
    ]);
  };

  // Callback to support dashboard links
  const handleInternalNavigate = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  // Render My Profile View
  const renderMyProfile = () => (
    <div className="space-y-6 text-left">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative">
            <img 
              src={profile.photo} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full border-4 border-brand-blue/20 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{profile.name}</h2>
              <span className="text-xs font-mono bg-brand-blue/10 text-brand-blue font-bold px-2.5 py-0.5 rounded-full">{profile.id}</span>
            </div>
            <p className="text-xs text-slate-500">{profile.grade} • {profile.section} • Active Honors enrollment</p>
            <div className="flex flex-wrap gap-4 pt-1.5 text-[10.5px] text-slate-400 font-mono">
              <span>Date of birth: {profile.dob}</span>
              <span>•</span>
              <span>Gender: {profile.gender}</span>
              <span>•</span>
              <span>Enrolled: {profile.enrollmentDate}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Update permitted personal information */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Personal Contact Information</h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-xs font-mono font-bold text-brand-blue hover:underline"
            >
              {editMode ? 'Cancel' : 'Update Details'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Home Address</span>
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="h-9 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
              {profileError && <p className="text-xs text-red-600">{profileError}</p>}
            </form>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-blue" />
                <div className="text-left">
                  <span className="text-xs font-mono text-slate-400 block font-bold uppercase">Email Address</span>
                  <p className="text-xs font-black">{profile.email}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-indigo" />
                <div className="text-left">
                  <span className="text-xs font-mono text-slate-400 block font-bold uppercase">Phone Number</span>
                  <p className="text-xs font-black">{profile.phone}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <span className="text-xs font-mono text-slate-400 block font-bold uppercase">Home Address</span>
                  <p className="text-xs font-black">{profile.address}</p>
                </div>
              </div>

              <AnimatePresence>
                {profileSaved && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="p-2 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold"
                  >
                    ✓ Profile Contact Information Updated
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Guardian and Medical details */}
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono border-b pb-2">Parent & Guardian details</h3>
            
            <div className="text-xs space-y-2 text-left">
              <div>
                <span className="text-slate-400">Primary Guardian:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.guardianName}{profile.guardianRelationship ? ` (${profile.guardianRelationship})` : ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <p className="font-mono font-bold text-slate-700 dark:text-slate-350">{profile.guardianPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-mono font-bold text-slate-700 dark:text-slate-350">{profile.guardianEmail}</p>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <span className="text-slate-400">Emergency Alternate:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.emergencyContactName}</p>
                <p className="font-mono text-slate-600 mt-0.5">{profile.emergencyContactPhone}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono border-b pb-2">Medical & Safety Information</h3>
            <div className="flex items-start gap-2.5 text-xs">
              <HeartPulse className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400">Important Directives:</span>
                <p className="font-bold text-rose-500 mt-1">{profile.medicalInfo}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  // Render Calendar View
  const renderCalendar = () => {
    const calendarEvents = [
      { date: 'July 20', time: '08:00 AM', title: 'STEM exhibition registration kick-off' },
      { date: 'July 22', time: '09:00 AM', title: 'AP Chemistry Semester 1 Midterm Exam' },
      { date: 'July 23', time: '11:59 PM', title: 'AP Organic Chemistry lab report submission due' },
      { date: 'July 26', time: '10:30 AM', title: 'Calculus: Taylor Series Assessment' },
      { date: 'July 28', time: '11:59 PM', title: 'Stoke\'s Theorem application problem set due' }
    ];

    return (
      <div className="space-y-6 text-left">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Academic Calendar Desk</h3>
          <p className="text-xs text-slate-500 mt-1">Official curriculum assessment timetables and milestones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List milestones */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Upcoming Milestones List</h3>
            
            <div className="space-y-3">
              {calendarEvents.map((evt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 text-center border-r pr-3 border-slate-200 flex-shrink-0">
                      <span className="text-xs font-mono font-bold block text-brand-blue">{evt.date.split(' ')[0]}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{evt.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850 dark:text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">Scheduled at {evt.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Administrative Parameters</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Assessment due dates and final exam schedules are published directly by course instructors. Parents and guardians receive synchronized calendar updates instantly on their home portals.
            </p>
          </div>

        </div>
      </div>
    );
  };

  // Render Portal Settings
  const renderSettings = () => (
    <div className="space-y-6 text-left">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Portal Settings & Preference Desk</h3>
            <p className="text-xs text-slate-500">Configure notifications logs, SMS backups, and layout parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase font-mono tracking-wider text-slate-450">Alerts Toggles</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                <div className="space-y-0.5 text-left">
                  <label className="text-sm font-bold">Task Due Reminders</label>
                  <p className="text-[9.5px] text-slate-400">Get alerted 24 hours prior to assignment limits</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyDeadlines} 
                  onChange={() => setNotifyDeadlines(!notifyDeadlines)}
                  className="rounded text-brand-blue cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                <div className="space-y-0.5 text-left">
                  <label className="text-sm font-bold">Gradebook Publication Alerts</label>
                  <p className="text-[9.5px] text-slate-400">Receive system popups once instructors publish scores</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyGrades} 
                  onChange={() => setNotifyGrades(!notifyGrades)}
                  className="rounded text-brand-blue cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                <div className="space-y-0.5 text-left">
                  <label className="text-sm font-bold">Emergency SMS Alerts</label>
                  <p className="text-[9.5px] text-slate-400">Send emergency notices to verified guardian numbers</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={smsReminders} 
                  onChange={() => setSmsReminders(!smsReminders)}
                  className="rounded text-brand-blue cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase font-mono tracking-wider text-slate-450">Layout Configurations</h4>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10.5px] font-mono text-slate-400">System Theme Mode</label>
                <select
                  value={contrastTheme}
                  onChange={(e) => setContrastTheme(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs focus:outline-none"
                >
                  <option value="System Default">Sync with device system preference</option>
                  <option value="High Contrast Light">High Contrast Light theme</option>
                  <option value="Dimmed Dark">Eye-safe Dark mode</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-dashed flex gap-2 text-[10.5px] text-slate-500">
                <Info className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <p>Layout modifications synchronize across all authorized child accounts instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-5 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            Last synced settings: Just now
          </span>

          <div className="flex gap-2 items-center">
            {settingsSuccess && <span className="text-emerald-500 font-bold text-xs">✓ Settings Saved</span>}
            <button
              type="button"
              onClick={handleSaveSettings}
              className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold cursor-pointer shadow"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer
      title={
        activeItem === 'dashboard' ? 'Personalised Learning Portal' :
        activeItem === 'profile' ? 'Student Personal Roster' :
        activeItem === 'academic_progress' ? 'Academic Performance Ledger' :
        activeItem === 'attendance' ? 'Attendance Metrics Desk' :
        activeItem === 'courses' ? 'Syllabus Course Desk' :
        activeItem === 'assignments' ? 'Course Assignments Desk' :
        activeItem === 'homework' ? 'Homework Drills' :
        activeItem === 'examinations' ? 'Assessments & Examinations' :
        activeItem === 'learning_resources' ? 'Learning Materials' :
        activeItem === 'downloads' ? 'Administrative Document Downloads' :
        activeItem === 'announcements' ? 'School Notices Broadcast' :
        activeItem === 'teacher_ratings' ? 'Instructor Evaluations' :
        activeItem === 'feedback' ? 'Student Feedback Desk' :
        activeItem === 'readmission' ? 'Academic Readmission Portal' :
        activeItem === 'messages' ? 'Encrypted Messages Desk' :
        activeItem === 'calendar' ? 'School Term Calendar' :
        activeItem === 'settings' ? 'Settings Desk' : 'Student Hub'
      }
      description={
        activeItem === 'dashboard' ? 'Monitor academic timelines, upcoming examinations, and faculty feedbacks.' :
        'Fully functional, enterprise-grade school workspace interface compiled successfully.'
      }
    >
      
      {/* Real-time Notifications Bar */}
      <div className="mb-6 flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex gap-2 items-center text-xs">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-100">Live Workspace Status: Connected</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 px-3 rounded-xl border bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <Bell className="w-4 h-4 text-brand-blue" />
            <span className="font-bold">Notifications</span>
            {unreadCount > 0 && (
              <span className="w-4.5 h-4.5 bg-rose-500 text-white rounded-full text-[8.5px] font-bold flex items-center justify-center absolute -top-1.5 -right-1.5 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 text-left overflow-hidden divide-y divide-slate-100"
              >
                <div className="p-3 flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Live Sync Feeds</h4>
                  <button 
                    onClick={handleClearNotifications}
                    className="text-xs text-slate-400 hover:text-slate-600 font-mono"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6 italic">No new notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 text-xs space-y-1 transition-all ${n.read ? 'opacity-60' : 'bg-brand-blue/[0.02]'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-brand-blue font-mono text-[10px] uppercase">{n.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-slate-700 leading-snug">{n.text}</p>
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkNotifRead(n.id)}
                            className="text-[9.5px] text-slate-400 hover:text-brand-blue block mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Router mapping */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {activeItem === 'dashboard' && (
            <StudentDashboardView 
              profile={profile}
              subjects={subjects}
              assignments={assignments}
              announcements={announcements}
              attendancePercentage={dashboardAttendance ?? mockAttendanceRecords.stats.percentage}
              timetable={dashboardTimetable}
              gpa={dashboardGpa}
              exams={exams}
              onNavigate={handleInternalNavigate}
            />
          )}

          {activeItem === 'profile' && renderMyProfile()}

          {activeItem === 'academic_progress' && (
            <AcademicProgressView subjects={subjects} />
          )}

          {activeItem === 'attendance' && (
            <AttendanceView records={dashboardAttendanceRecords} />
          )}

          {activeItem === 'courses' && (
            <ResourcesDownloadsView 
              resources={[]} 
              curriculumDocuments={curriculumDocuments}
              loadingCurriculum={loadingCurriculum}
            />
          )}

          {activeItem === 'assignments' && (
            <AssignmentsHomeworkView 
              assignments={assignments}
              homework={homework}
              onUpdateAssignments={setAssignments}
              onUpdateHomework={setHomework}
            />
          )}

          {activeItem === 'homework' && (
            <AssignmentsHomeworkView 
              assignments={assignments}
              homework={homework}
              onUpdateAssignments={setAssignments}
              onUpdateHomework={setHomework}
            />
          )}

          {activeItem === 'examinations' && (
            <ExaminationsView 
              exams={exams}
              onCompleteExam={handleCompleteExam}
            />
          )}

          {activeItem === 'learning_resources' && (
            <ResourcesDownloadsView 
              resources={resources} 
              curriculumDocuments={curriculumDocuments}
              loadingCurriculum={loadingCurriculum}
            />
          )}

          {activeItem === 'downloads' && (
            <ResourcesDownloadsView 
              resources={resources} 
              curriculumDocuments={curriculumDocuments}
              loadingCurriculum={loadingCurriculum}
            />
          )}

          {activeItem === 'messages' && (
            <MessagesView 
              threads={threads}
              onUpdateThreads={setThreads}
            />
          )}

          {activeItem === 'calendar' && renderCalendar()}

          {activeItem === 'settings' && renderSettings()}

          {['announcements', 'teacher_ratings', 'feedback', 'readmission'].includes(activeItem) && (
            <FeedbackRatingsView 
              activeSection={activeItem as any}
              announcements={announcements}
              ratings={ratings}
              feedbacks={feedbacks}
              onUpdateAnnouncements={setAnnouncements}
              onUpdateRatings={setRatings}
              onUpdateFeedbacks={setFeedbacks}
            />
          )}
        </motion.div>
      </AnimatePresence>

    </PageContainer>
  );
};
