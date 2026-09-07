/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, Teacher, Registration, Course, TimetableSlot, Parent, 
  ParentStudentMapping, Announcement, Subject, TeacherSubjectAssignment, 
  TeacherGradeSectionAssignment, ParentFeedback, SectionConfiguration, AcademicYear 
} from './types';
import {             
  getAllTeachers,
  createTeacher as apiCreateTeacher,
  updateTeacher as apiUpdateTeacher,
  deactivateTeacher as apiDeactivateTeacher,
  getTeacherAggregateMetrics,
  TeacherAggregateMetrics
} from '../../../lib/api/teachers';
import {
  getAllParents as apiGetAllParents,
  createParent as apiCreateParent,
  updateParent as apiUpdateParent,
  deleteParent as apiDeleteParent,
  activateParent as apiActivateParent,
  deactivateParent as apiDeactivateParent,
  getParentProfile,
  ParentWithUserData
} from '../../../lib/api/parents';
import {
  getAllFeedback,
  resolveFeedback as apiResolveFeedback,
  updateFeedbackStatus,
  getFeedbackStatistics,
  FeedbackProfileData,
  FeedbackStatistics
} from '../../../lib/api/parent-feedback';
import { getSectionConfigurations } from '../../../lib/api/sections';
import { getCurrentAcademicYear } from '../../../lib/api/academic-years';
import {
  getAllCourses as apiGetAllCourses,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
  CourseData
} from '../../../lib/api/courses';
import {
  getAllSubjects as apiGetAllSubjects,
  createSubject as apiCreateSubject,
  updateSubject as apiUpdateSubject,
  deleteSubject as apiDeleteSubject,
  archiveSubject as apiArchiveSubject,
  SubjectData
} from '../../../lib/api/subjects';
import {
  getAllSubjectAssignments as apiGetAllSubjectAssignments,
  createSubjectAssignment as apiCreateSubjectAssignment,
  updateSubjectAssignment as apiUpdateSubjectAssignment,
  deleteSubjectAssignment as apiDeleteSubjectAssignment,
  SubjectAssignmentData
} from '../../../lib/api/subject-assignments';
import {
  getSubjectAssignmentFormData,
  SubjectAssignmentFormData
} from '../../../lib/api/director';
import {
  getTimeSlots,
  getWeeklyTimetable,
  createWeeklyTimetableEntry,
  updateWeeklyTimetableEntry,
  deleteWeeklyTimetableEntry,
  TimeSlot,
  WeeklyTimetable
} from '../../../lib/api/timetable';
import {
  getSchoolScheduleSettings,
  saveSchoolScheduleSettings,
  generateTimeSlots,
  SchoolScheduleSettings
} from '../../../lib/api/school-schedule';

interface DirectorDataContextType {
  // Lists
  students: Student[];
  teachers: Teacher[];
  registrations: Registration[];
  courses: Course[];
  timetableSlots: TimetableSlot[];
  parents: Parent[];
  announcements: Announcement[];
  parentStudentMappings: ParentStudentMapping[];
  subjects: Subject[];
  teacherSubjectAssignments: TeacherSubjectAssignment[];
  teacherGradeSectionAssignments: TeacherGradeSectionAssignment[];
  parentFeedbacks: ParentFeedback[];
  sectionConfigurations: SectionConfiguration[];
  
  // Timetable data
  timeSlots: TimeSlot[];
  weeklyTimetables: WeeklyTimetable[];
  isLoadingTimeSlots: boolean;
  isLoadingWeeklyTimetables: boolean;
  
  // School schedule settings
  schoolScheduleSettings: SchoolScheduleSettings | null;
  isLoadingSchoolScheduleSettings: boolean;
  
  // Loading states
  isLoadingTeachers: boolean;
  teachersError: string | null;
  isLoadingParents: boolean;
  parentsError: string | null;
  isLoadingFeedback: boolean;
  feedbackError: string | null;
  
  // Aggregate metrics
  teacherMetrics: TeacherAggregateMetrics;
  isLoadingTeacherMetrics: boolean;
  
  // Feedback statistics
  feedbackStatistics: FeedbackStatistics;
  
  // Section configurations
  isLoadingSections: boolean;
  
  // Current academic year
  currentAcademicYear: AcademicYear | null;
  isLoadingAcademicYear: boolean;
  
  // Subject assignment form data
  subjectAssignmentFormData: SubjectAssignmentFormData;
  isLoadingSubjectAssignmentFormData: boolean;
  
  // Settings
  schoolName: string;
  setSchoolName: (name: string) => void;
  schoolYear: string;
  setSchoolYear: (year: string) => void;
  termStart: string;
  setTermStart: (date: string) => void;
  autoEnroll: boolean;
  setAutoEnroll: (val: boolean) => void;
  minGPA: string;
  setMinGPA: (val: string) => void;
  seatLimit: number;
  setSeatLimit: (val: number) => void;

  // Actions
  addStudent: (s: Omit<Student, 'id' | 'regDate'>) => void;
  updateStudent: (id: string, s: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  promoteGrade: (id: string) => void;
  transferSection: (id: string, section: string) => void;
  
  approveRegistration: (regNum: string) => void;
  rejectRegistration: (regNum: string) => void;
  
  addTeacher: (t: Omit<Teacher, 'id' | 'employmentDate' | 'ratings' | 'attendance' | 'assignmentCompletion' | 'directorEval' | 'strengths' | 'areasForImprovement'> & { employeeId?: string }) => void;
  updateTeacher: (id: string, t: Partial<Teacher>) => void;
  deactivateTeacher: (id: string) => void;
  
  addParent: (p: Omit<Parent, 'id' | 'created_at' | 'updated_at'>) => void;
  updateParent: (id: string, p: Partial<Parent>) => void;
  deleteParent: (id: string) => void;
  activateParent: (id: string) => void;
  deactivateParent: (id: string) => void;
  
  addCourse: (c: Course) => void;
  updateCourse: (code: string, c: Partial<Course>) => void;
  deleteCourse: (code: string) => void;
  
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => { success: boolean; conflictReason?: string };
  deleteTimetableSlot: (id: string) => void;
  
  addAnnouncement: (a: Omit<Announcement, 'id'> & Partial<Pick<Announcement, 'status' | 'viewsCount' | 'commentsCount' | 'interactionRate'>>) => void;
  deleteAnnouncement: (id: string) => void;
  archiveAnnouncement: (id: string) => void;

  // New Actions
  addSubject: (sub: Subject) => void;
  updateSubject: (code: string, sub: Partial<Subject>) => void;
  deleteSubject: (code: string) => void;
  archiveSubject: (code: string) => void;
  
  // Subject Assignment Actions
  addSubjectAssignment: (assignment: Omit<TeacherSubjectAssignment, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSubjectAssignment: (id: string, assignment: Partial<TeacherSubjectAssignment>) => void;
  deleteSubjectAssignment: (id: string) => void;

  addTeacherSubjectAssignment: (asg: Omit<TeacherSubjectAssignment, 'id'>) => void;
  updateTeacherSubjectAssignment: (id: string, asg: Partial<TeacherSubjectAssignment>) => void;
  deleteTeacherSubjectAssignment: (id: string) => void;

  addTeacherGradeSectionAssignment: (asg: Omit<TeacherGradeSectionAssignment, 'id'>) => { success: boolean; conflictReason?: string };
  deleteTeacherGradeSectionAssignment: (id: string) => void;

  resolveParentFeedback: (id: string, response: string) => Promise<void>;
  
  // Timetable Actions
  loadTimeSlots: () => Promise<void>;
  loadWeeklyTimetables: (filters?: { academic_year_id?: string; section_configuration_id?: string }) => Promise<void>;
  addTimetableEntry: (entry: Omit<WeeklyTimetable, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTimetableEntry: (id: string, entry: Partial<WeeklyTimetable>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  
  // School schedule settings functions
  loadSchoolScheduleSettings: () => Promise<void>;
  saveSchoolScheduleSettings: (settings: any) => Promise<void>;
  generateTimeSlots: () => Promise<void>;
  
  // Refresh functions
  refreshTeacherMetrics: () => Promise<void>;
}

const DirectorDataContext = createContext<DirectorDataContextType | undefined>(undefined);

export const useDirectorData = () => {
  const context = useContext(DirectorDataContext);
  if (!context) throw new Error('useDirectorData must be used within DirectorDataProvider');
  return context;
};

export const DirectorDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global settings
  const [schoolName, setSchoolName] = useState('EduCore Academy');
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [termStart, setTermStart] = useState('2026-09-01');
  const [autoEnroll, setAutoEnroll] = useState(true);
  const [minGPA, setMinGPA] = useState('3.0');
  const [seatLimit, setSeatLimit] = useState(30);

  // Teacher state with loading and error states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Parent state with loading and error states
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [parentsError, setParentsError] = useState<string | null>(null);

  // Feedback state with loading and error states
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackStatistics, setFeedbackStatistics] = useState<FeedbackStatistics>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    by_type: {
      complaint: 0,
      suggestion: 0,
      enquiry: 0,
      compliment: 0
    },
    by_priority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0
    }
  });

  // Teacher aggregate metrics state
  const [teacherMetrics, setTeacherMetrics] = useState<TeacherAggregateMetrics>({
    facultyCount: 0,
    averageEvaluationRating: '0.0',
    syllabusCompletionRate: '0.0',
    academicYear: '2025-2026'
  });
  const [isLoadingTeacherMetrics, setIsLoadingTeacherMetrics] = useState(true);

  // Section configurations state
  const [sectionConfigurations, setSectionConfigurations] = useState<SectionConfiguration[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  // Current academic year state
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);
  const [isLoadingAcademicYear, setIsLoadingAcademicYear] = useState(true);
  
  // Subject assignment form data state
  const [subjectAssignmentFormData, setSubjectAssignmentFormData] = useState<SubjectAssignmentFormData>({
    teachers: [],
    subjects: [],
    academicYears: [],
    currentAcademicYear: null,
    sectionConfigurations: [],
    semesters: ['Fall', 'Spring', 'Summer', 'Winter']
  });
  const [isLoadingSubjectAssignmentFormData, setIsLoadingSubjectAssignmentFormData] = useState(true);
  
  // Subject assignments state
  const [teacherSubjectAssignments, setTeacherSubjectAssignments] = useState<TeacherSubjectAssignment[]>([]);
  
  // Timetable state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [weeklyTimetables, setWeeklyTimetables] = useState<WeeklyTimetable[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isLoadingWeeklyTimetables, setIsLoadingWeeklyTimetables] = useState(false);
  
  // School schedule settings state
  const [schoolScheduleSettings, setSchoolScheduleSettings] = useState<SchoolScheduleSettings | null>(null);
  const [isLoadingSchoolScheduleSettings, setIsLoadingSchoolScheduleSettings] = useState(false);

  // Load teachers from API on mount
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        setTeachersError(null);
        const data = await getAllTeachers();
        setTeachers(data);
      } catch (error) {
        console.error('Failed to load teachers:', error);
        setTeachersError('Failed to load teachers from server');
        // Fallback to mock data if API fails
        setTeachers([
          {
            id: 'TCH-301',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            name: 'Dr. Evelyn Foster',
            subject: 'Chemistry',
            dept: 'Sciences',
            assignedGrades: ['Grade 10', 'Grade 11'],
            assignedSections: ['Section A', 'Section B'],
            phone: '+1 (555) 012-3456',
            email: 'evelyn.foster@educore.edu',
            employmentDate: '2020-08-15',
            status: 'Active',
            load: '18 hrs/wk',
            ratings: { student: 4.8, parent: 4.6 },
            attendance: { present: 142, absent: 2, late: 3, leave: 1 },
            assignmentCompletion: 96,
            directorEval: 92,
            strengths: ['Expert lab work safety integration', 'Extremely strong syllabus tracking', 'High interactive student engagement'],
            areasForImprovement: ['Class grading logs should be released 24h earlier']
          }
        ] as Teacher[]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    loadTeachers();
  }, []);

  // Load parents from API on mount
  useEffect(() => {
    const loadParents = async () => {
      try {
        setIsLoadingParents(true);
        setParentsError(null);
        const data = await apiGetAllParents();
        
        // Convert backend ParentWithUserData to frontend Parent format
        const convertedParents = data.map((backendParent: ParentWithUserData) => ({
          id: backendParent.id,
          user_id: backendParent.user_id,
          school_id: backendParent.school_id,
          full_name: backendParent.full_name,
          relationship: backendParent.relationship,
          emergency_contact: backendParent.emergency_contact,
          phone: backendParent.phone || backendParent.user?.phone,
          email: backendParent.email || backendParent.user?.email,
          profile_picture_url: backendParent.profile_picture_url || backendParent.user?.profile_picture_url,
          status: backendParent.status || backendParent.user?.status,
          created_at: backendParent.created_at,
          updated_at: backendParent.updated_at,
          // UI compatibility fields
          photo: backendParent.profile_picture_url || backendParent.user?.profile_picture_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          name: backendParent.full_name,
          address: '', // Not available in backend
          occupation: backendParent.relationship || 'Parent',
          childrenCount: 0, // Will be updated with profile call
          user: backendParent.user
        }));
        
        setParents(convertedParents);
      } catch (error) {
        console.error('Failed to load parents:', error);
        setParentsError('Failed to load parents from server');
        // Fallback to mock data if API fails
        setParents([
          {
            id: 'PAR-801',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            name: 'Marcus Johnson',
            email: 'marcus.j@example.com',
            phone: '+1 (555) 019-2834',
            address: '452 Pine St, San Francisco, CA',
            occupation: 'Software Architect',
            childrenCount: 1,
            status: 'active'
          },
          {
            id: 'PAR-802',
            photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            name: 'Evelyn Temple',
            email: 'evelyn.t@example.com',
            phone: '+1 (555) 014-9988',
            address: '710 Broadway, San Francisco, CA',
            occupation: 'Pediatrician',
            childrenCount: 1,
            status: 'active'
          },
          {
            id: 'PAR-803',
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            name: 'Sarah Miller',
            email: 'sarah.miller@example.com',
            phone: '+1 (555) 015-4433',
            address: '124 Clay St, San Francisco, CA',
            occupation: 'Finance Director',
            childrenCount: 1,
            status: 'active'
          }
        ] as Parent[]);
      } finally {
        setIsLoadingParents(false);
      }
    };

    loadParents();
  }, []);

  // Load feedback from API on mount
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setIsLoadingFeedback(true);
        setFeedbackError(null);
        
        // Load feedback statistics
        const stats = await getFeedbackStatistics();
        setFeedbackStatistics(stats);
        
        // Load feedback data (convert to frontend format)
        const data = await getAllFeedback();
        
        // Convert backend feedback to frontend ParentFeedback format
        const convertedFeedback = data.map((backendFeedback: FeedbackProfileData) => ({
          id: backendFeedback.id,
          parentId: backendFeedback.parent_id || '',
          parentName: backendFeedback.parent_name,
          studentName: backendFeedback.student_name,
          type: backendFeedback.type.charAt(0).toUpperCase() + backendFeedback.type.slice(1) as 'Complaint' | 'Suggestion' | 'Enquiry' | 'Compliment',
          message: backendFeedback.message,
          date: new Date(backendFeedback.created_at).toISOString().split('T')[0],
          status: backendFeedback.status.charAt(0).toUpperCase() + backendFeedback.status.slice(1) as 'Pending' | 'Resolved',
          response: backendFeedback.response
        }));
        
        setParentFeedbacks(convertedFeedback);
      } catch (error) {
        console.error('Failed to load feedback:', error);
        setFeedbackError('Failed to load feedback from server');
        // Fallback to mock data if API fails
        setParentFeedbacks([
          { id: 'FB-1', parentId: 'PAR-801', parentName: 'Marcus Johnson', studentName: 'Alex Johnson', type: 'Complaint', message: 'The chemistry labs could incorporate more visual demonstrations of reactions. Alex is a visual learner.', date: '2026-08-12', status: 'Pending', response: undefined },
          { id: 'FB-2', parentId: 'PAR-802', parentName: 'Evelyn Temple', studentName: 'Chloe Temple', type: 'Enquiry', message: 'We would like to request a parent-teacher meeting regarding the upcoming STEM exhibition guidelines.', date: '2026-08-11', status: 'Pending', response: undefined },
          { id: 'FB-3', parentId: 'PAR-803', parentName: 'Sarah Miller', studentName: 'Marcus Miller', type: 'Suggestion', message: 'Extremely pleased with the mathematics progress this term. Prof. Jenkins is outstanding.', date: '2026-08-10', status: 'Resolved', response: 'Thank you for the wonderful feedback! We have conveyed your appreciation to Prof. Jenkins.' }
        ]);
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    loadFeedback();
  }, []);

  // Load teacher aggregate metrics on mount and when teachers change
  useEffect(() => {
    const loadTeacherMetrics = async () => {
      try {
        setIsLoadingTeacherMetrics(true);
        const academicYear = currentAcademicYear?.year_name || '2025-2026';
        const data = await getTeacherAggregateMetrics(academicYear);
        setTeacherMetrics(data);
      } catch (error) {
        console.error('Failed to load teacher metrics:', error);
        // Set default values on error
        const academicYear = currentAcademicYear?.year_name || '2025-2026';
        setTeacherMetrics({
          facultyCount: 0,
          averageEvaluationRating: '0.0',
          syllabusCompletionRate: '0.0',
          academicYear
        });
      } finally {
        setIsLoadingTeacherMetrics(false);
      }
    };

    // Only load if we have the academic year
    if (currentAcademicYear || !isLoadingAcademicYear) {
      loadTeacherMetrics();
    }
  }, [teachers, currentAcademicYear, isLoadingAcademicYear]); // Re-fetch metrics when teachers array or academic year changes

  // Load current academic year on mount
  useEffect(() => {
    const loadCurrentAcademicYear = async () => {
      try {
        setIsLoadingAcademicYear(true);
        const data = await getCurrentAcademicYear();
        setCurrentAcademicYear(data);
      } catch (error) {
        console.error('Failed to load current academic year:', error);
        setCurrentAcademicYear(null);
      } finally {
        setIsLoadingAcademicYear(false);
      }
    };

    loadCurrentAcademicYear();
  }, []);

  // Load section configurations on mount (depends on academic year)
  useEffect(() => {
    const loadSectionConfigurations = async () => {
      try {
        setIsLoadingSections(true);
        const academicYear = currentAcademicYear?.year_name || '2025-2026';
        const data = await getSectionConfigurations(academicYear);
        setSectionConfigurations(data);
      } catch (error) {
        console.error('Failed to load section configurations:', error);
        setSectionConfigurations([]);
      } finally {
        setIsLoadingSections(false);
      }
    };

    // Only load if we have the academic year
    if (currentAcademicYear || !isLoadingAcademicYear) {
      loadSectionConfigurations();
    }
  }, [currentAcademicYear, isLoadingAcademicYear]);

  // Load subject assignment form data on mount
  useEffect(() => {
    const loadSubjectAssignmentFormData = async () => {
      try {
        setIsLoadingSubjectAssignmentFormData(true);
        const data = await getSubjectAssignmentFormData();
        setSubjectAssignmentFormData(data);
      } catch (error) {
        console.error('Failed to load subject assignment form data:', error);
        // Keep default values on error
      } finally {
        setIsLoadingSubjectAssignmentFormData(false);
      }
    };

    loadSubjectAssignmentFormData();
  }, []);

  // Load time slots on mount
  useEffect(() => {
    const loadTimeSlotsData = async () => {
      try {
        setIsLoadingTimeSlots(true);
        const data = await getTimeSlots();
        setTimeSlots(data);
      } catch (error) {
        console.error('Failed to load time slots:', error);
        setTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    loadTimeSlotsData();
  }, []);

  // Load weekly timetables on mount (when academic year is available)
  useEffect(() => {
    const loadWeeklyTimetablesData = async () => {
      try {
        setIsLoadingWeeklyTimetables(true);
        const filters: any = {};
        if (currentAcademicYear?.id) {
          filters.academic_year_id = currentAcademicYear.id;
        }
        const data = await getWeeklyTimetable(filters);
        setWeeklyTimetables(data);
      } catch (error) {
        console.error('Failed to load weekly timetables:', error);
        setWeeklyTimetables([]);
      } finally {
        setIsLoadingWeeklyTimetables(false);
      }
    };

    if (currentAcademicYear) {
      loadWeeklyTimetablesData();
    }
  }, [currentAcademicYear]);

  // Load school schedule settings on mount (when academic year is available)
  useEffect(() => {
    const loadSchoolScheduleSettingsData = async () => {
      try {
        setIsLoadingSchoolScheduleSettings(true);
        const data = await getSchoolScheduleSettings(currentAcademicYear?.id);
        setSchoolScheduleSettings(data);
      } catch (error) {
        console.error('Failed to load school schedule settings:', error);
        // Set to null if table doesn't exist or other error
        setSchoolScheduleSettings(null);
      } finally {
        setIsLoadingSchoolScheduleSettings(false);
      }
    };

    if (currentAcademicYear) {
      loadSchoolScheduleSettingsData();
    }
  }, [currentAcademicYear]);

  // Load courses from API on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const academicYear = currentAcademicYear?.year_name || '2026-2027';
        const data = await apiGetAllCourses({ academic_year: academicYear });
        
        // Convert backend CourseData to frontend Course format
        const convertedCourses = data.map((backendCourse: CourseData) => ({
          id: backendCourse.id,
          school_id: backendCourse.school_id,
          course_code: backendCourse.course_code,
          course_name: backendCourse.course_name,
          description: backendCourse.description,
          grade_level: backendCourse.grade_level,
          subject_area: backendCourse.subject_area,
          credits: backendCourse.credits,
          teacher_id: backendCourse.teacher_id,
          teacher_name: backendCourse.teacher_name,
          academic_year: backendCourse.academic_year,
          semester: backendCourse.semester,
          status: backendCourse.status,
          max_capacity: backendCourse.max_capacity,
          current_enrollment: backendCourse.current_enrollment,
          schedule: backendCourse.schedule,
          created_at: backendCourse.created_at,
          updated_at: backendCourse.updated_at,
          
          // Legacy fields for backward compatibility
          name: backendCourse.course_name,
          code: backendCourse.course_code,
          desc: backendCourse.description,
          grade: backendCourse.grade_level,
          section: backendCourse.semester || 'Section A',
          teacher: backendCourse.teacher_name || 'TBD',
          weeklyHours: backendCourse.credits
        }));
        
        setCourses(convertedCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
        // Keep existing mock data if API fails
      }
    };

    loadCourses();
  }, [currentAcademicYear]);

  // Load subjects from API on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await apiGetAllSubjects({ status: 'Active' });
        
        // Convert backend SubjectData to frontend Subject format
        const convertedSubjects = data.map((backendSubject: SubjectData) => ({
          id: backendSubject.id,
          school_id: backendSubject.school_id,
          subject_code: backendSubject.subject_code,
          subject_name: backendSubject.subject_name,
          description: backendSubject.description,
          category: backendSubject.category,
          weekly_hours: backendSubject.weekly_hours,
          status: backendSubject.status,
          created_at: backendSubject.created_at,
          updated_at: backendSubject.updated_at,
          
          // Legacy fields for backward compatibility
          code: backendSubject.subject_code,
          name: backendSubject.subject_name,
          desc: backendSubject.description,
          weeklyHours: backendSubject.weekly_hours
        }));
        
        setSubjects(convertedSubjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
        // Use fallback mock data if subjects table doesn't exist
        const fallbackSubjects = [
          { 
            id: '1',
            school_id: '',
            subject_code: 'MATH-101', 
            subject_name: 'Mathematics', 
            description: 'Core mathematics curriculum', 
            category: 'Core' as 'Core' | 'Elective' | 'Extra-curricular', 
            weekly_hours: 5, 
            status: 'Active' as 'Active' | 'Inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Legacy fields for backward compatibility
            code: 'MATH-101',
            name: 'Mathematics',
            desc: 'Core mathematics curriculum',
            weeklyHours: 5
          },
          { 
            id: '2',
            school_id: '',
            subject_code: 'ENG-101', 
            subject_name: 'English Language', 
            description: 'English language and literature', 
            category: 'Core' as 'Core' | 'Elective' | 'Extra-curricular', 
            weekly_hours: 4, 
            status: 'Active' as 'Active' | 'Inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Legacy fields for backward compatibility
            code: 'ENG-101',
            name: 'English Language',
            desc: 'English language and literature',
            weeklyHours: 4
          },
          { 
            id: '3',
            school_id: '',
            subject_code: 'SCI-101', 
            subject_name: 'Science', 
            description: 'General science curriculum', 
            category: 'Core' as 'Core' | 'Elective' | 'Extra-curricular', 
            weekly_hours: 4, 
            status: 'Active' as 'Active' | 'Inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Legacy fields for backward compatibility
            code: 'SCI-101',
            name: 'Science',
            desc: 'General science curriculum',
            weeklyHours: 4
          },
          { 
            id: '4',
            school_id: '',
            subject_code: 'HIST-101', 
            subject_name: 'History', 
            description: 'World history', 
            category: 'Core' as 'Core' | 'Elective' | 'Extra-curricular', 
            weekly_hours: 3, 
            status: 'Active' as 'Active' | 'Inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Legacy fields for backward compatibility
            code: 'HIST-101',
            name: 'History',
            desc: 'World history',
            weeklyHours: 3
          },
          { 
            id: '5',
            school_id: '',
            subject_code: 'ART-101', 
            subject_name: 'Art', 
            description: 'Visual arts and creative expression', 
            category: 'Elective' as 'Core' | 'Elective' | 'Extra-curricular', 
            weekly_hours: 2, 
            status: 'Active' as 'Active' | 'Inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Legacy fields for backward compatibility
            code: 'ART-101',
            name: 'Art',
            desc: 'Visual arts and creative expression',
            weeklyHours: 2
          },
        ];
        setSubjects(fallbackSubjects as Subject[]);
      }
    };

    loadSubjects();
  }, []);

  // Load subject assignments from API on mount
  useEffect(() => {
    const loadSubjectAssignments = async () => {
      try {
        const data = await apiGetAllSubjectAssignments({ status: 'Active' });
        
        // Convert backend SubjectAssignmentData to frontend TeacherSubjectAssignment format
        const convertedAssignments = data.map((backendAssignment: SubjectAssignmentData) => ({
          id: backendAssignment.id,
          school_id: backendAssignment.school_id,
          teacher_id: backendAssignment.teacher_id,
          subject_id: backendAssignment.subject_id,
          academic_year_id: backendAssignment.academic_year_id,
          semester: backendAssignment.semester,
          grade_level: backendAssignment.grade_level,
          section_name: backendAssignment.section_name,
          role: backendAssignment.role,
          sections_assigned: backendAssignment.sections_assigned,
          weekly_hours: backendAssignment.weekly_hours,
          assignment_date: backendAssignment.assignment_date,
          status: backendAssignment.status,
          notes: backendAssignment.notes,
          created_at: backendAssignment.created_at,
          updated_at: backendAssignment.updated_at,
          
          // Related data
          teacher: backendAssignment.teacher,
          subject: backendAssignment.subject,
          academic_year: backendAssignment.academic_year,
          
          // Legacy fields for backward compatibility
          teacherId: backendAssignment.teacher_id,
          teacherName: backendAssignment.teacher?.full_name,
          subjectCode: backendAssignment.subject?.subject_code,
          subjectName: backendAssignment.subject?.subject_name,
          academicYear: backendAssignment.academic_year?.year_name,
          grade: backendAssignment.grade_level,
          section: backendAssignment.section_name
        }));
        
        setTeacherSubjectAssignments(convertedAssignments);
      } catch (error) {
        console.error('Failed to load subject assignments:', error);
        // Use fallback mock data if subject_assignments table doesn't exist
        const fallbackAssignments = [
          { 
            id: '1',
            school_id: '',
            teacher_id: 'TCH-301',
            subject_id: '1',
            academic_year_id: 'AY-2026-2027',
            semester: 'Fall',
            grade_level: 'Grade 9',
            section_name: 'Section A',
            role: 'Primary Teacher',
            sections_assigned: 2,
            weekly_hours: 8,
            assignment_date: new Date().toISOString().split('T')[0],
            status: 'Active' as 'Active' | 'Inactive' | 'Completed',
            notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            teacher: {
              id: 'TCH-301',
              full_name: 'Dr. Evelyn Foster',
              email: 'evelyn.foster@educore.edu',
              department: 'Sciences',
              subjects: ['Chemistry']
            },
            subject: {
              id: '1',
              subject_code: 'SCI-101',
              subject_name: 'Science',
              category: 'Core'
            },
            academic_year: {
              id: 'AY-2026-2027',
              year_name: '2026-2027',
              current_semester: 'Fall'
            },
            // Legacy fields
            teacherId: 'TCH-301',
            teacherName: 'Dr. Evelyn Foster',
            subjectCode: 'SCI-101',
            subjectName: 'Science',
            academicYear: '2026-2027',
            grade: 'Grade 9',
            section: 'Section A'
          },
        ];
        setTeacherSubjectAssignments(fallbackAssignments);
      }
    };

    loadSubjectAssignments();
  }, []);

  // Initial State Arrays
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'STU-1001',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      name: 'Alex Johnson',
      grade: 'Grade 9',
      section: 'Section A',
      gender: 'Male',
      dob: '2011-05-14',
      parentName: 'Marcus Johnson',
      parentPhone: '+1 (555) 019-2834',
      regDate: '2025-09-01',
      status: 'Active',
      email: 'alex.j@educore.edu',
      address: '452 Pine St, San Francisco, CA',
      bloodGroup: 'O+',
      attendance: '98.5%',
      feeStatus: 'Paid',
      enrolledCourses: ['Mathematics I', 'Science 9', 'English Lit', 'World History'],
      documents: ['Birth_Certificate.pdf', 'Immunization_Record.pdf']
    },
    {
      id: 'STU-1002',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      name: 'Chloe Temple',
      grade: 'Grade 10',
      section: 'Section B',
      gender: 'Female',
      dob: '2010-02-18',
      parentName: 'Evelyn Temple',
      parentPhone: '+1 (555) 014-9988',
      regDate: '2024-09-01',
      status: 'Active',
      email: 'chloe.t@educore.edu',
      address: '710 Broadway, San Francisco, CA',
      bloodGroup: 'A-',
      attendance: '94.2%',
      feeStatus: 'Overdue',
      enrolledCourses: ['Mathematics II', 'Chemistry', 'English Lit', 'World History'],
      documents: ['Birth_Certificate.pdf']
    },
    {
      id: 'STU-1003',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      name: 'Marcus Miller',
      grade: 'Grade 11',
      section: 'Section A',
      gender: 'Male',
      dob: '2009-11-22',
      parentName: 'Sarah Miller',
      parentPhone: '+1 (555) 015-4433',
      regDate: '2023-09-01',
      status: 'Active',
      email: 'marcus.m@educore.edu',
      address: '124 Clay St, San Francisco, CA',
      bloodGroup: 'B+',
      attendance: '99.0%',
      feeStatus: 'Paid',
      enrolledCourses: ['Pre-Calculus', 'Physics', 'US History', 'Spanish I'],
      documents: ['Birth_Certificate.pdf', 'Middle_School_Transcript.pdf']
    },
    {
      id: 'STU-1004',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      name: 'Sasha Petrova',
      grade: 'Grade 12',
      section: 'Section B',
      gender: 'Female',
      dob: '2008-07-06',
      parentName: 'Nikolai Petrov',
      parentPhone: '+1 (555) 016-1122',
      regDate: '2022-09-01',
      status: 'Inactive',
      email: 'sasha.p@educore.edu',
      address: '883 Geary Blvd, San Francisco, CA',
      bloodGroup: 'AB+',
      attendance: '91.8%',
      feeStatus: 'Paid',
      enrolledCourses: ['AP Calculus', 'Biology II', 'Modern Literature', 'Civics'],
      documents: ['Birth_Certificate.pdf', 'High_School_Transcript.pdf']
    },
    {
      id: 'STU-1005',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      name: 'James Carter',
      grade: 'Grade 9',
      section: 'Section B',
      gender: 'Male',
      dob: '2011-12-05',
      parentName: 'Helen Carter',
      parentPhone: '+1 (555) 017-7755',
      regDate: '2025-09-01',
      status: 'Active',
      email: 'james.c@educore.edu',
      address: '320 Sutter St, San Francisco, CA',
      bloodGroup: 'O-',
      attendance: '97.4%',
      feeStatus: 'Overdue',
      enrolledCourses: ['Mathematics I', 'Science 9', 'English Lit', 'World History'],
      documents: ['Birth_Certificate.pdf']
    }
  ]);

  const [registrations, setRegistrations] = useState<Registration[]>([
    {
      regNum: 'REG-9011',
      studentName: 'Gabriel Martinez',
      parentName: 'Rosa Martinez',
      appliedGrade: 'Grade 9',
      appDate: '2026-07-15',
      status: 'Pending',
      email: 'rosa.m@example.com',
      phone: '+1 (555) 901-2111',
      gender: 'Male',
      dob: '2011-04-10'
    },
    {
      regNum: 'REG-9012',
      studentName: 'Sienna Ross',
      parentName: 'James Ross',
      appliedGrade: 'Grade 11',
      appDate: '2026-07-16',
      status: 'Pending',
      email: 'james.ross@example.com',
      phone: '+1 (555) 880-9922',
      gender: 'Female',
      dob: '2009-08-14'
    },
    {
      regNum: 'REG-9013',
      studentName: 'Liam Hughes',
      parentName: 'Mary Hughes',
      appliedGrade: 'Grade 10',
      appDate: '2026-07-10',
      status: 'Approved',
      email: 'mary.hughes@example.com',
      phone: '+1 (555) 124-7890',
      gender: 'Male',
      dob: '2010-09-05'
    },
    {
      regNum: 'REG-9014',
      studentName: 'Elena Rostova',
      parentName: 'Vladimir Rostov',
      appliedGrade: 'Grade 12',
      appDate: '2026-07-08',
      status: 'Rejected',
      email: 'vlad.rostov@example.com',
      phone: '+1 (555) 304-4560',
      gender: 'Female',
      dob: '2008-01-20'
    }
  ]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([
    {
      id: 'SLOT-1',
      day: 'Monday',
      timeSlot: '09:00 AM - 10:00 AM',
      teacherId: 'TCH-303',
      teacherName: 'Sarah Jenkins',
      courseCode: 'MATH-101',
      courseName: 'Mathematics I',
      grade: 'Grade 9',
      section: 'Section A',
      classroom: 'Room 201'
    },
    {
      id: 'SLOT-2',
      day: 'Monday',
      timeSlot: '10:15 AM - 11:15 AM',
      teacherId: 'TCH-301',
      teacherName: 'Dr. Evelyn Foster',
      courseCode: 'CHEM-202',
      courseName: 'Chemistry I',
      grade: 'Grade 10',
      section: 'Section A',
      classroom: 'Science Lab A'
    },
    {
      id: 'SLOT-3',
      day: 'Wednesday',
      timeSlot: '09:00 AM - 10:00 AM',
      teacherId: 'TCH-302',
      teacherName: 'Prof. Julian Vane',
      courseCode: 'ENG-102',
      courseName: 'English Literature',
      grade: 'Grade 9',
      section: 'Section A',
      classroom: 'Room 201'
    },
    {
      id: 'SLOT-4',
      day: 'Friday',
      timeSlot: '11:30 AM - 12:30 PM',
      teacherId: 'TCH-304',
      teacherName: 'Amara Diop',
      courseCode: 'ARTS-305',
      courseName: 'Fine Arts Portfolio',
      grade: 'Grade 12',
      section: 'Section A',
      classroom: 'Art Studio B'
    }
  ]);

  const [parents, setParents] = useState<Parent[]>([]);

  const [parentStudentMappings, setParentStudentMappings] = useState<ParentStudentMapping[]>([
    {
      parentId: 'PAR-801',
      parentName: 'Marcus Johnson',
      studentId: 'STU-1001',
      studentName: 'Alex Johnson',
      relationship: 'Father',
      grade: 'Grade 9',
      section: 'Section A',
      emergencyContact: true
    },
    {
      parentId: 'PAR-802',
      parentName: 'Evelyn Temple',
      studentId: 'STU-1002',
      studentName: 'Chloe Temple',
      relationship: 'Mother',
      grade: 'Grade 10',
      section: 'Section B',
      emergencyContact: true
    },
    {
      parentId: 'PAR-803',
      parentName: 'Sarah Miller',
      studentId: 'STU-1003',
      studentName: 'Marcus Miller',
      relationship: 'Mother',
      grade: 'Grade 11',
      section: 'Section A',
      emergencyContact: true
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ANN-001',
      title: 'Annual STEM Exhibition 2026',
      desc: 'Detailed schedules, layout instructions, and workspace criteria have been dispatched to all science instructors.',
      audience: 'General',
      priority: 'High',
      attachments: ['STEM_Exhibition_Brochure.pdf'],
      publishDate: '2026-07-18',
      expiryDate: '2026-08-15',
      status: 'Published',
      viewsCount: 142,
      commentsCount: 12,
      interactionRate: 84
    },
    {
      id: 'ANN-002',
      title: 'WASC Accreditation Site Visit',
      desc: 'External inspectors will audit student dossiers and teacher diaries starting next Monday. All registers must be fully synchronized.',
      audience: 'Teachers',
      priority: 'Critical',
      attachments: ['Audit_Checklist.docx'],
      publishDate: '2026-07-19',
      expiryDate: '2026-07-25',
      status: 'Scheduled',
      viewsCount: 45,
      commentsCount: 8,
      interactionRate: 98
    }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [teacherGradeSectionAssignments, setTeacherGradeSectionAssignments] = useState<TeacherGradeSectionAssignment[]>([
    { id: 'GSA-1', teacherId: 'TCH-303', teacherName: 'Sarah Jenkins', grade: 'Grade 9', section: 'Section A', role: 'Class Teacher' },
    { id: 'GSA-2', teacherId: 'TCH-301', teacherName: 'Dr. Evelyn Foster', grade: 'Grade 10', section: 'Section A', role: 'Homeroom Teacher' },
    { id: 'GSA-3', teacherId: 'TCH-302', teacherName: 'Prof. Julian Vane', grade: 'Grade 9', section: 'Section B', role: 'Subject Teacher' },
    { id: 'GSA-4', teacherId: 'TCH-304', teacherName: 'Amara Diop', grade: 'Grade 12', section: 'Section A', role: 'Homeroom Teacher' }
  ]);

  const [parentFeedbacks, setParentFeedbacks] = useState<ParentFeedback[]>([]);

  // Actions
  const addStudent = (s: Omit<Student, 'id' | 'regDate'>) => {
    const id = `STU-${Math.floor(1006 + Math.random() * 900)}`;
    const regDate = new Date().toISOString().split('T')[0];
    const newStudentObj: Student = { ...s, id, regDate };
    setStudents(prev => [newStudentObj, ...prev]);
  };

  const updateStudent = (id: string, s: Partial<Student>) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, ...s } : student));
  };

  const archiveStudent = (id: string) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, status: 'Inactive' } : student));
  };

  const promoteGrade = (id: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;
      const num = parseInt(student.grade.replace(/\D/g, ''));
      const newGrade = isNaN(num) ? 'Grade 9' : `Grade ${Math.min(12, num + 1)}`;
      return { ...student, grade: newGrade };
    }));
  };

  const transferSection = (id: string, section: string) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, section } : student));
  };

  const approveRegistration = (regNum: string) => {
    setRegistrations(prev => prev.map(r => r.regNum === regNum ? { ...r, status: 'Approved' } : r));
    const reg = registrations.find(r => r.regNum === regNum);
    if (reg) {
      // Auto enroll
      if (autoEnroll) {
        addStudent({
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          name: reg.studentName,
          grade: reg.appliedGrade,
          section: 'Section A',
          gender: reg.gender,
          dob: reg.dob,
          parentName: reg.parentName,
          parentPhone: reg.phone,
          status: 'Active',
          email: `${reg.studentName.toLowerCase().replace(/\s+/g, '')}@educore.edu`,
          address: 'Verified Enrollee Address',
          bloodGroup: 'O+',
          attendance: '100%',
          feeStatus: 'Paid',
          enrolledCourses: [],
          documents: []
        });
      }
    }
  };

  const rejectRegistration = (regNum: string) => {
    setRegistrations(prev => prev.map(r => r.regNum === regNum ? { ...r, status: 'Rejected' } : r));
  };

  const addTeacher = async (t: Omit<Teacher, 'id' | 'employmentDate' | 'ratings' | 'attendance' | 'assignmentCompletion' | 'directorEval' | 'strengths' | 'areasForImprovement'>) => {
    try {
      const teacherData = {
        employee_id: `EMP-${Date.now()}`,
        full_name: t.name,
        department: t.dept,
        subjects: [t.subject],
        photo: t.photo,
        phone: t.phone,
        email: t.email,
        weekly_load: t.load,
        assigned_grades: t.assignedGrades,
        assigned_sections: t.assignedSections
      };

      const newTeacher = await apiCreateTeacher(teacherData);
      if (newTeacher) {
        setTeachers(prev => [newTeacher, ...prev]);
        // Show success message with temporary password if provided
        if (newTeacher.temporary_password) {
          alert(`Teacher created successfully!\n\nEmail: ${newTeacher.email}\nTemporary Password: ${newTeacher.temporary_password}\n\nPlease share these credentials with the teacher for first login.`);
        }
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      // Fallback to local state if API fails - use proper UUID format
      const id = crypto.randomUUID();
      const employeeId = `TCH-${Math.floor(1000 + Math.random() * 9000)}`;
      const employmentDate = new Date().toISOString().split('T')[0];
      const newTeacherObj: Teacher = {
        ...t,
        id,
        employee_id: employeeId,
        employmentDate,
        ratings: { student: 4.5, parent: 4.5 },
        attendance: { present: 1, absent: 0, late: 0, leave: 0 },
        assignmentCompletion: 90,
        directorEval: 90,
        strengths: ['Enthusiastic new hire', 'Clear lesson planner'],
        areasForImprovement: ['Getting familiarized with digital catalogs']
      };
      setTeachers(prev => [newTeacherObj, ...prev]);
    }
  };

  const updateTeacher = async (id: string, t: Partial<Teacher>) => {
    try {
      const updateData: any = {
        full_name: t.name,
        department: t.dept,
        subjects: t.subject ? [t.subject] : undefined,
        photo: t.photo,
        phone: t.phone,
        email: t.email,
        weekly_load: t.load,
        assigned_grades: t.assignedGrades,
        assigned_sections: t.assignedSections
      };

      const updatedTeacher = await apiUpdateTeacher(id, updateData);
      if (updatedTeacher) {
        setTeachers(prev => prev.map(teacher => teacher.id === id ? updatedTeacher : teacher));
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      // Fallback to local state if API fails
      setTeachers(prev => prev.map(teacher => teacher.id === id ? { ...teacher, ...t } : teacher));
    }
  };

  const deactivateTeacher = async (id: string) => {
    try {
      const deactivatedTeacher = await apiDeactivateTeacher(id);
      if (deactivatedTeacher) {
        setTeachers(prev => prev.map(teacher => teacher.id === id ? deactivatedTeacher : teacher));
      }
    } catch (error) {
      console.error('Error deactivating teacher:', error);
      // Fallback to local state if API fails
      setTeachers(prev => prev.map(teacher => teacher.id === id ? { ...teacher, status: 'Deactivated' } : teacher));
    }
  };

  const addParent = async (p: Omit<Parent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const parentData = {
        full_name: p.full_name || p.name || '',
        relationship: p.relationship || p.occupation || '',
        emergency_contact: p.emergency_contact || '',
        phone: p.phone || '',
        email: p.email || '',
        profile_picture_url: p.profile_picture_url || p.photo || ''
      };

      const newParent = await apiCreateParent(parentData);
      if (newParent) {
        // Convert backend response to frontend format
        const convertedParent = {
          id: newParent.id,
          user_id: newParent.user_id,
          school_id: newParent.school_id,
          full_name: newParent.full_name,
          relationship: newParent.relationship,
          emergency_contact: newParent.emergency_contact,
          phone: newParent.phone || newParent.user?.phone,
          email: newParent.email || newParent.user?.email,
          profile_picture_url: newParent.profile_picture_url || newParent.user?.profile_picture_url,
          status: newParent.status || newParent.user?.status,
          created_at: newParent.created_at,
          updated_at: newParent.updated_at,
          // UI compatibility fields
          photo: newParent.profile_picture_url || newParent.user?.profile_picture_url || p.photo,
          name: newParent.full_name,
          address: p.address,
          occupation: newParent.relationship || p.occupation,
          childrenCount: p.childrenCount || 0,
          user: newParent.user
        };
        
        setParents(prev => [convertedParent, ...prev]);
      }
    } catch (error) {
      console.error('Error adding parent:', error);
      // Fallback to local state if API fails
      const id = crypto.randomUUID();
      const newParentObj: Parent = {
        ...p,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setParents(prev => [newParentObj, ...prev]);
    }
  };

  const updateParent = async (id: string, p: Partial<Parent>) => {
    try {
      const updateData: any = {
        full_name: p.full_name || p.name,
        relationship: p.relationship || p.occupation,
        emergency_contact: p.emergency_contact,
        phone: p.phone,
        email: p.email,
        profile_picture_url: p.profile_picture_url || p.photo,
        status: p.status
      };

      const updatedParent = await apiUpdateParent(id, updateData);
      if (updatedParent) {
        // Convert backend response to frontend format
        const convertedParent = {
          id: updatedParent.id,
          user_id: updatedParent.user_id,
          school_id: updatedParent.school_id,
          full_name: updatedParent.full_name,
          relationship: updatedParent.relationship,
          emergency_contact: updatedParent.emergency_contact,
          phone: updatedParent.phone || updatedParent.user?.phone,
          email: updatedParent.email || updatedParent.user?.email,
          profile_picture_url: updatedParent.profile_picture_url || updatedParent.user?.profile_picture_url,
          status: updatedParent.status || updatedParent.user?.status,
          created_at: updatedParent.created_at,
          updated_at: updatedParent.updated_at,
          // UI compatibility fields
          photo: updatedParent.profile_picture_url || updatedParent.user?.profile_picture_url || p.photo,
          name: updatedParent.full_name,
          address: p.address,
          occupation: updatedParent.relationship || p.occupation,
          childrenCount: p.childrenCount || 0,
          user: updatedParent.user
        };
        
        setParents(prev => prev.map(parent => parent.id === id ? convertedParent : parent));
      }
    } catch (error) {
      console.error('Error updating parent:', error);
      // Fallback to local state if API fails
      setParents(prev => prev.map(parent => parent.id === id ? { ...parent, ...p } : parent));
    }
  };

  const deleteParent = async (id: string) => {
    try {
      await apiDeleteParent(id);
      setParents(prev => prev.filter(parent => parent.id !== id));
    } catch (error) {
      console.error('Error deleting parent:', error);
      // Fallback to local state if API fails
      setParents(prev => prev.filter(parent => parent.id !== id));
    }
  };

  const activateParent = async (id: string) => {
    try {
      const activatedParent = await apiActivateParent(id);
      if (activatedParent) {
        // Convert backend response to frontend format
        const convertedParent = {
          id: activatedParent.id,
          user_id: activatedParent.user_id,
          school_id: activatedParent.school_id,
          full_name: activatedParent.full_name,
          relationship: activatedParent.relationship,
          emergency_contact: activatedParent.emergency_contact,
          phone: activatedParent.phone || activatedParent.user?.phone,
          email: activatedParent.email || activatedParent.user?.email,
          profile_picture_url: activatedParent.profile_picture_url || activatedParent.user?.profile_picture_url,
          status: activatedParent.status || activatedParent.user?.status,
          created_at: activatedParent.created_at,
          updated_at: activatedParent.updated_at,
          // UI compatibility fields
          photo: activatedParent.profile_picture_url || activatedParent.user?.profile_picture_url,
          name: activatedParent.full_name,
          address: '',
          occupation: activatedParent.relationship,
          childrenCount: 0,
          user: activatedParent.user
        };
        
        setParents(prev => prev.map(parent => parent.id === id ? convertedParent : parent));
      }
    } catch (error) {
      console.error('Error activating parent:', error);
      // Fallback to local state if API fails
      setParents(prev => prev.map(parent => parent.id === id ? { ...parent, status: 'active' as const } : parent));
    }
  };

  const deactivateParentFunc = async (id: string) => {
    try {
      const deactivatedParent = await apiDeactivateParent(id);
      if (deactivatedParent) {
        // Convert backend response to frontend format
        const convertedParent = {
          id: deactivatedParent.id,
          user_id: deactivatedParent.user_id,
          school_id: deactivatedParent.school_id,
          full_name: deactivatedParent.full_name,
          relationship: deactivatedParent.relationship,
          emergency_contact: deactivatedParent.emergency_contact,
          phone: deactivatedParent.phone || deactivatedParent.user?.phone,
          email: deactivatedParent.email || deactivatedParent.user?.email,
          profile_picture_url: deactivatedParent.profile_picture_url || deactivatedParent.user?.profile_picture_url,
          status: deactivatedParent.status || deactivatedParent.user?.status,
          created_at: deactivatedParent.created_at,
          updated_at: deactivatedParent.updated_at,
          // UI compatibility fields
          photo: deactivatedParent.profile_picture_url || deactivatedParent.user?.profile_picture_url,
          name: deactivatedParent.full_name,
          address: '',
          occupation: deactivatedParent.relationship,
          childrenCount: 0,
          user: deactivatedParent.user
        };
        
        setParents(prev => prev.map(parent => parent.id === id ? convertedParent : parent));
      }
    } catch (error) {
      console.error('Error deactivating parent:', error);
      // Fallback to local state if API fails
      setParents(prev => prev.map(parent => parent.id === id ? { ...parent, status: 'inactive' as const } : parent));
    }
  };

  const addCourse = async (c: Course) => {
    try {
      // Convert frontend Course to backend CreateCourseData
      const courseData = {
        course_code: c.course_code || c.code || '',
        course_name: c.course_name || c.name || '',
        description: c.description || c.desc,
        grade_level: c.grade_level || c.grade || 'Grade 9',
        subject_area: c.subject_area,
        credits: c.credits || c.weeklyHours || 1,
        teacher_id: c.teacher_id,
        academic_year: c.academic_year || currentAcademicYear?.year_name || '2026-2027',
        semester: c.semester,
        status: c.status || 'active',
        max_capacity: c.max_capacity || 30,
        schedule: c.schedule
      };

      const newCourse = await apiCreateCourse(courseData);
      if (newCourse) {
        // Convert back to frontend format
        const convertedCourse = {
          id: newCourse.id,
          school_id: newCourse.school_id,
          course_code: newCourse.course_code,
          course_name: newCourse.course_name,
          description: newCourse.description,
          subject_area: newCourse.subject_area,
          credits: newCourse.credits,
          teacher_id: newCourse.teacher_id,
          teacher_name: newCourse.teacher_name,
          academic_year: newCourse.academic_year,
          semester: newCourse.semester,
          status: newCourse.status,
          max_capacity: newCourse.max_capacity,
          current_enrollment: newCourse.current_enrollment,
          schedule: newCourse.schedule,
          created_at: newCourse.created_at,
          updated_at: newCourse.updated_at,
          
          // Legacy fields
          name: newCourse.course_name,
          code: newCourse.course_code,
          desc: newCourse.description,
          grade: 'Grade 9', // Default grade since courses no longer have grade_level
          section: newCourse.semester || 'Section A',
          teacher: newCourse.teacher_name || 'TBD',
          weeklyHours: newCourse.credits
        };
        
        setCourses(prev => [convertedCourse, ...prev]);
      }
    } catch (error: any) {
      // Handle duplicate course error gracefully
      if (error.message && error.message.includes('duplicate key')) {
        console.info('Course already exists, adding to local state anyway');
        const fallbackCourse: Course = {
          ...c,
          grade_level: c.grade_level || c.grade || 'Grade 9'
        };
        setCourses(prev => [fallbackCourse, ...prev]);
      } else {
        console.error('Error adding course:', error);
        // Fallback to local state if API fails
        const fallbackCourse: Course = {
          ...c,
          grade_level: c.grade_level || c.grade || 'Grade 9'
        };
        setCourses(prev => [fallbackCourse, ...prev]);
      }
    }
  };

  const updateCourse = async (code: string, c: Partial<Course>) => {
    try {
      // Find the course by code to get its ID
      const existingCourse = courses.find(course => 
        (course.course_code === code || course.code === code)
      );
      
      if (existingCourse?.id) {
        // Convert frontend Course to backend UpdateCourseData
        const updateData: any = {};
        if (c.course_name || c.name) updateData.course_name = c.course_name || c.name;
        if (c.description || c.desc) updateData.description = c.description || c.desc;
        if (c.grade_level || c.grade) updateData.grade_level = c.grade_level || c.grade;
        if (c.subject_area) updateData.subject_area = c.subject_area;
        if (c.credits !== undefined || c.weeklyHours !== undefined) updateData.credits = c.credits || c.weeklyHours;
        if (c.teacher_id) updateData.teacher_id = c.teacher_id;
        if (c.status) updateData.status = c.status;
        if (c.max_capacity !== undefined) updateData.max_capacity = c.max_capacity;
        if (c.schedule !== undefined) updateData.schedule = c.schedule;

        const updatedCourse = await apiUpdateCourse(existingCourse.id, updateData);
        if (updatedCourse) {
          // Convert back to frontend format
          const convertedCourse = {
            id: updatedCourse.id,
            school_id: updatedCourse.school_id,
            course_code: updatedCourse.course_code,
            course_name: updatedCourse.course_name,
            description: updatedCourse.description,
            grade_level: updatedCourse.grade_level,
            subject_area: updatedCourse.subject_area,
            credits: updatedCourse.credits,
            teacher_id: updatedCourse.teacher_id,
            teacher_name: updatedCourse.teacher_name,
            academic_year: updatedCourse.academic_year,
            semester: updatedCourse.semester,
            status: updatedCourse.status,
            max_capacity: updatedCourse.max_capacity,
            current_enrollment: updatedCourse.current_enrollment,
            schedule: updatedCourse.schedule,
            created_at: updatedCourse.created_at,
            updated_at: updatedCourse.updated_at,
            
            // Legacy fields
            name: updatedCourse.course_name,
            code: updatedCourse.course_code,
            desc: updatedCourse.description,
            grade: updatedCourse.grade_level,
            section: updatedCourse.semester || 'Section A',
            teacher: updatedCourse.teacher_name || 'TBD',
            weeklyHours: updatedCourse.credits
          };
          
          setCourses(prev => prev.map(course => course.id === existingCourse.id ? convertedCourse : course));
        }
      }
    } catch (error) {
      console.error('Error updating course:', error);
      // Fallback to local state if API fails
      setCourses(prev => prev.map(course => (course.course_code === code || course.code === code) ? { ...course, ...c } : course));
    }
  };

  const deleteCourse = async (code: string) => {
    try {
      // Find the course by code to get its ID
      const existingCourse = courses.find(course => 
        (course.course_code === code || course.code === code)
      );
      
      if (existingCourse?.id) {
        await apiDeleteCourse(existingCourse.id);
        setCourses(prev => prev.filter(course => course.id !== existingCourse.id));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      // Fallback to local state if API fails
      setCourses(prev => prev.filter(course => (course.course_code !== code && course.code !== code)));
    }
  };

  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    // Conflict Checks
    // 1. Same teacher busy
    const teacherBusy = timetableSlots.find(s => s.day === slot.day && s.timeSlot === slot.timeSlot && s.teacherId === slot.teacherId);
    if (teacherBusy) {
      return { success: false, conflictReason: `Instructor ${slot.teacherName} is already scheduled in ${teacherBusy.grade} (${teacherBusy.classroom}) during this period.` };
    }
    
    // 2. Same classroom busy
    const classroomBusy = timetableSlots.find(s => s.day === slot.day && s.timeSlot === slot.timeSlot && s.classroom === slot.classroom);
    if (classroomBusy) {
      return { success: false, conflictReason: `Classroom ${slot.classroom} is already occupied by ${classroomBusy.teacherName} for ${classroomBusy.courseName}.` };
    }

    // 3. Same grade section busy
    const classBusy = timetableSlots.find(s => s.day === slot.day && s.timeSlot === slot.timeSlot && s.grade === slot.grade && s.section === slot.section);
    if (classBusy) {
      return { success: false, conflictReason: `${slot.grade}-${slot.section} is already attending ${classBusy.courseName} under Prof. ${classBusy.teacherName}.` };
    }

    const id = `SLOT-${Math.floor(100 + Math.random() * 900)}`;
    setTimetableSlots(prev => [...prev, { ...slot, id }]);
    return { success: true };
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetableSlots(prev => prev.filter(s => s.id !== id));
  };

  const addAnnouncement = (a: Omit<Announcement, 'id'> & Partial<Pick<Announcement, 'status' | 'viewsCount' | 'commentsCount' | 'interactionRate'>>) => {
    const id = `ANN-${Math.floor(100 + Math.random() * 900)}`;
    setAnnouncements(prev => [{ 
      ...a, 
      id, 
      status: a.status || 'Published', 
      viewsCount: a.viewsCount ?? 0, 
      commentsCount: a.commentsCount ?? 0, 
      interactionRate: a.interactionRate ?? 0 
    }, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'Archived' } : a));
  };

  // New Actions Implementation
  const addSubject = async (sub: Subject) => {
    try {
      // Convert frontend Subject to backend CreateSubjectData
      const subjectData = {
        subject_code: sub.subject_code || sub.code || '',
        subject_name: sub.subject_name || sub.name || '',
        description: sub.description || sub.desc,
        category: sub.category || 'Core',
        weekly_hours: sub.weekly_hours || sub.weeklyHours || 4,
        status: sub.status || 'Active'
      };

      const newSubject = await apiCreateSubject(subjectData);
      if (newSubject) {
        // Convert back to frontend format
        const convertedSubject = {
          id: newSubject.id,
          school_id: newSubject.school_id,
          subject_code: newSubject.subject_code,
          subject_name: newSubject.subject_name,
          description: newSubject.description,
          category: newSubject.category,
          weekly_hours: newSubject.weekly_hours,
          status: newSubject.status,
          created_at: newSubject.created_at,
          updated_at: newSubject.updated_at,
          
          // Legacy fields
          code: newSubject.subject_code,
          name: newSubject.subject_name,
          desc: newSubject.description,
          weeklyHours: newSubject.weekly_hours
        };
        
        setSubjects(prev => [convertedSubject, ...prev]);
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      // Fallback to local state if API fails
      setSubjects(prev => [...prev, sub]);
    }
  };

  const updateSubject = async (code: string, sub: Partial<Subject>) => {
    try {
      // Find the subject by code to get its ID
      const existingSubject = subjects.find(subject => 
        (subject.subject_code === code || subject.code === code)
      );
      
      if (existingSubject?.id) {
        // Convert frontend Subject to backend UpdateSubjectData
        const updateData: any = {};
        if (sub.subject_name || sub.name) updateData.subject_name = sub.subject_name || sub.name;
        if (sub.description || sub.desc) updateData.description = sub.description || sub.desc;
        if (sub.category) updateData.category = sub.category;
        if (sub.weekly_hours !== undefined || sub.weeklyHours !== undefined) updateData.weekly_hours = sub.weekly_hours || sub.weeklyHours;
        if (sub.status) updateData.status = sub.status;

        const updatedSubject = await apiUpdateSubject(existingSubject.id, updateData);
        if (updatedSubject) {
          // Convert back to frontend format
          const convertedSubject = {
            id: updatedSubject.id,
            school_id: updatedSubject.school_id,
            subject_code: updatedSubject.subject_code,
            subject_name: updatedSubject.subject_name,
            description: updatedSubject.description,
            category: updatedSubject.category,
            weekly_hours: updatedSubject.weekly_hours,
            status: updatedSubject.status,
            created_at: updatedSubject.created_at,
            updated_at: updatedSubject.updated_at,
            
            // Legacy fields
            code: updatedSubject.subject_code,
            name: updatedSubject.subject_name,
            desc: updatedSubject.description,
            weeklyHours: updatedSubject.weekly_hours
          };
          
          setSubjects(prev => prev.map(subject => subject.id === existingSubject.id ? convertedSubject : subject));
        }
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      // Fallback to local state if API fails
      setSubjects(prev => prev.map(s => (s.subject_code === code || s.code === code) ? { ...s, ...sub } : s));
    }
  };

  const deleteSubject = async (code: string) => {
    try {
      // Find the subject by code to get its ID
      const existingSubject = subjects.find(subject => 
        (subject.subject_code === code || subject.code === code)
      );
      
      if (existingSubject?.id) {
        await apiDeleteSubject(existingSubject.id);
        setSubjects(prev => prev.filter(subject => subject.id !== existingSubject.id));
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      // Fallback to local state if API fails
      setSubjects(prev => prev.filter(s => (s.subject_code !== code && s.code !== code)));
    }
  };

  const archiveSubject = async (code: string) => {
    try {
      // Find the subject by code to get its ID
      const existingSubject = subjects.find(subject => 
        (subject.subject_code === code || subject.code === code)
      );
      
      if (existingSubject?.id) {
        await apiArchiveSubject(existingSubject.id);
        setSubjects(prev => prev.map(subject => subject.id === existingSubject.id ? { ...subject, status: 'Inactive' } : subject));
      }
    } catch (error) {
      console.error('Error archiving subject:', error);
      // Fallback to local state if API fails
      setSubjects(prev => prev.map(s => (s.subject_code === code || s.code === code) ? { ...s, status: 'Inactive' } : s));
    }
  };

  const addSubjectAssignment = async (assignment: any) => {
    try {
      const data = await apiCreateSubjectAssignment({
        teacher_id: assignment.teacher_id,
        subject_id: assignment.subject_id,
        academic_year_id: assignment.academic_year_id,
        semester: assignment.semester,
        grade_level: assignment.grade_level || assignment.grade || 'Grade 9',
        section_name: assignment.section_name || assignment.section || 'Section A',
        role: assignment.role,
        sections_assigned: assignment.sections_assigned,
        weekly_hours: assignment.weekly_hours,
        assignment_date: assignment.assignment_date,
        notes: assignment.notes
      });
      
      // Convert backend response to frontend format
      const newAssignment: TeacherSubjectAssignment = {
        id: data.id,
        school_id: data.school_id,
        teacher_id: data.teacher_id,
        subject_id: data.subject_id,
        academic_year_id: data.academic_year_id,
        semester: data.semester,
        role: data.role,
        sections_assigned: data.sections_assigned,
        weekly_hours: data.weekly_hours,
        assignment_date: data.assignment_date,
        status: (data.status as 'Active' | 'Inactive' | 'Completed'),
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        teacher: data.teacher,
        subject: data.subject,
        academic_year: data.academic_year,
        // Legacy fields
        teacherId: data.teacher_id,
        teacherName: data.teacher?.full_name,
        subjectCode: data.subject?.subject_code,
        subjectName: data.subject?.subject_name,
        academicYear: data.academic_year?.year_name
      };
      
      setTeacherSubjectAssignments(prev => [...prev, newAssignment]);
    } catch (error) {
      console.error('Error adding subject assignment:', error);
      // Fallback to local state if API fails
      const id = `TSA-${Math.floor(100 + Math.random() * 900)}`;
      setTeacherSubjectAssignments(prev => [...prev, { ...assignment, id }]);
    }
  };

  const updateSubjectAssignment = async (id: string, assignment: Partial<TeacherSubjectAssignment>) => {
    try {
      const data = await apiUpdateSubjectAssignment(id, {
        teacher_id: assignment.teacher_id,
        subject_id: assignment.subject_id,
        academic_year_id: assignment.academic_year_id,
        semester: assignment.semester,
        role: assignment.role,
        sections_assigned: assignment.sections_assigned,
        weekly_hours: assignment.weekly_hours,
        status: assignment.status,
        notes: assignment.notes
      });
      
      // Convert backend response to frontend format
      const updatedAssignment: TeacherSubjectAssignment = {
        id: data.id,
        school_id: data.school_id,
        teacher_id: data.teacher_id,
        subject_id: data.subject_id,
        academic_year_id: data.academic_year_id,
        semester: data.semester,
        role: data.role,
        sections_assigned: data.sections_assigned,
        weekly_hours: data.weekly_hours,
        assignment_date: data.assignment_date,
        status: (data.status as 'Active' | 'Inactive' | 'Completed'),
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        teacher: data.teacher,
        subject: data.subject,
        academic_year: data.academic_year,
        // Legacy fields
        teacherId: data.teacher_id,
        teacherName: data.teacher?.full_name,
        subjectCode: data.subject?.subject_code,
        subjectName: data.subject?.subject_name,
        academicYear: data.academic_year?.year_name
      };
      
      setTeacherSubjectAssignments(prev => prev.map(a => a.id === id ? updatedAssignment : a));
    } catch (error) {
      console.error('Error updating subject assignment:', error);
      // Fallback to local state if API fails
      setTeacherSubjectAssignments(prev => prev.map(a => a.id === id ? { ...a, ...assignment } : a));
    }
  };

  const deleteSubjectAssignment = async (id: string) => {
    try {
      await apiDeleteSubjectAssignment(id);
      setTeacherSubjectAssignments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting subject assignment:', error);
      // Fallback to local state if API fails
      setTeacherSubjectAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  // Legacy functions for backward compatibility
  const addTeacherSubjectAssignment = async (asg: any) => {
    try {
      // Convert frontend format to backend format
      const backendAssignment = {
        teacher_id: asg.teacherId || '',
        subject_id: asg.subjectCode || '', // This would need to be the actual subject ID from database
        academic_year_id: subjectAssignmentFormData.currentAcademicYear?.id || '',
        semester: asg.semester || '',
        grade_level: asg.grade || 'Grade 9',
        section_name: asg.section || 'Section A',
        role: 'Primary Teacher',
        sections_assigned: 1,
        weekly_hours: 4,
        status: (asg.status as 'Active' | 'Inactive' | 'Completed') || 'Active'
      };

      const result = await apiCreateSubjectAssignment(backendAssignment);
      
      // Convert backend response to frontend format
      const frontendAssignment: TeacherSubjectAssignment = {
        id: result.id,
        school_id: result.school_id,
        teacher_id: result.teacher_id,
        subject_id: result.subject_id,
        academic_year_id: result.academic_year_id,
        semester: result.semester,
        role: result.role,
        sections_assigned: result.sections_assigned,
        weekly_hours: result.weekly_hours,
        assignment_date: result.assignment_date,
        status: (result.status as 'Active' | 'Inactive' | 'Completed'),
        notes: result.notes,
        created_at: result.created_at,
        updated_at: result.updated_at,
        teacher: result.teacher,
        subject: result.subject,
        academic_year: result.academic_year,
        // Legacy fields
        teacherId: result.teacher_id,
        teacherName: result.teacher?.full_name || 'Unknown',
        subjectCode: result.subject?.subject_code || '',
        subjectName: result.subject?.subject_name || 'Unknown',
        academicYear: result.academic_year?.year_name || ''
      };

      setTeacherSubjectAssignments(prev => [...prev, frontendAssignment]);
    } catch (error) {
      console.warn('Backend subject assignment failed (table might not exist), using local state:', error);
      // Fallback to local state if API fails (e.g., table doesn't exist yet)
      const id = `TSA-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackAssignment: TeacherSubjectAssignment = {
        ...asg,
        id,
        school_id: '',
        teacher_id: asg.teacherId || '',
        subject_id: asg.subjectCode || '',
        academic_year_id: subjectAssignmentFormData.currentAcademicYear?.id || '',
        semester: asg.semester || '',
        role: 'Primary Teacher',
        sections_assigned: 1,
        weekly_hours: 4,
        assignment_date: new Date().toISOString(),
        status: (asg.status as 'Active' | 'Inactive' | 'Completed') || 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTeacherSubjectAssignments(prev => [...prev, fallbackAssignment]);
    }
  };

  const updateTeacherSubjectAssignment = (id: string, asg: Partial<TeacherSubjectAssignment>) => {
    setTeacherSubjectAssignments(prev => prev.map(a => a.id === id ? { ...a, ...asg } : a));
  };

  const deleteTeacherSubjectAssignment = (id: string) => {
    setTeacherSubjectAssignments(prev => prev.filter(a => a.id !== id));
  };

  const addTeacherGradeSectionAssignment = (asg: Omit<TeacherGradeSectionAssignment, 'id'>) => {
    // Conflict detection: Class Teacher can only have 1 Class Teacher assignment per Grade + Section combo
    if (asg.role === 'Class Teacher') {
      const exists = teacherGradeSectionAssignments.find(
        x => x.grade === asg.grade && x.section === asg.section && x.role === 'Class Teacher'
      );
      if (exists) {
        return { success: false, conflictReason: `${asg.grade}-${asg.section} already has class teacher assigned: ${exists.teacherName}` };
      }
    }
    const id = `GSA-${Math.floor(100 + Math.random() * 900)}`;
    setTeacherGradeSectionAssignments(prev => [...prev, { ...asg, id }]);
    return { success: true };
  };

  const deleteTeacherGradeSectionAssignment = (id: string) => {
    setTeacherGradeSectionAssignments(prev => prev.filter(a => a.id !== id));
  };

  const resolveParentFeedback = async (id: string, response: string) => {
    try {
      await apiResolveFeedback(id, { response });
      setParentFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Resolved' as const, response: response } : f));
    } catch (error) {
      console.error('Error resolving feedback:', error);
      // Fallback to local state if API fails
      setParentFeedbacks(prev => prev.map(f => {
        if (f.id === id) {
          return { ...f, status: 'Resolved' as const, response: response };
        }
        return f;
      }));
    }
  };

  const refreshTeacherMetrics = async () => {
    try {
      setIsLoadingTeacherMetrics(true);
      const academicYear = currentAcademicYear?.year_name || '2025-2026';
      const data = await getTeacherAggregateMetrics(academicYear);
      setTeacherMetrics(data);
    } catch (error) {
      console.error('Failed to refresh teacher metrics:', error);
    } finally {
      setIsLoadingTeacherMetrics(false);
    }
  };

  // Timetable functions
  const loadTimeSlots = async () => {
    try {
      setIsLoadingTimeSlots(true);
      const data = await getTimeSlots();
      setTimeSlots(data);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      setTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const loadWeeklyTimetables = async (filters?: { academic_year_id?: string; section_configuration_id?: string }) => {
    try {
      setIsLoadingWeeklyTimetables(true);
      const data = await getWeeklyTimetable(filters);
      setWeeklyTimetables(data);
    } catch (error) {
      console.error('Failed to load weekly timetables:', error);
      setWeeklyTimetables([]);
    } finally {
      setIsLoadingWeeklyTimetables(false);
    }
  };

  const addTimetableEntry = async (entry: Omit<WeeklyTimetable, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEntry = await createWeeklyTimetableEntry(entry);
      setWeeklyTimetables(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Failed to add timetable entry:', error);
      throw error;
    }
  };

  const updateTimetableEntry = async (id: string, entry: Partial<WeeklyTimetable>) => {
    try {
      const updatedEntry = await updateWeeklyTimetableEntry(id, entry);
      setWeeklyTimetables(prev => prev.map(t => t.id === id ? updatedEntry : t));
    } catch (error) {
      console.error('Failed to update timetable entry:', error);
      throw error;
    }
  };

  const deleteTimetableEntry = async (id: string) => {
    try {
      await deleteWeeklyTimetableEntry(id);
      setWeeklyTimetables(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete timetable entry:', error);
      throw error;
    }
  };

  // School schedule settings functions
  const loadSchoolScheduleSettings = async () => {
    try {
      setIsLoadingSchoolScheduleSettings(true);
      const data = await getSchoolScheduleSettings(currentAcademicYear?.id);
      setSchoolScheduleSettings(data);
    } catch (error) {
      console.error('Failed to load school schedule settings:', error);
      setSchoolScheduleSettings(null);
    } finally {
      setIsLoadingSchoolScheduleSettings(false);
    }
  };

  const saveSchoolScheduleSettingsData = async (settings: any) => {
    try {
      const saved = await saveSchoolScheduleSettings(settings);
      setSchoolScheduleSettings(saved);
    } catch (error) {
      console.error('Failed to save school schedule settings:', error);
      throw error;
    }
  };

  const generateTimeSlotsData = async () => {
    try {
      if (!currentAcademicYear?.id) {
        throw new Error('No academic year selected');
      }
      const result = await generateTimeSlots(currentAcademicYear.id);
      // Reload time slots after generation
      await loadTimeSlots();
      return result;
    } catch (error) {
      console.error('Failed to generate time slots:', error);
      throw error;
    }
  };

  return (
    <DirectorDataContext.Provider value={{
      students, teachers, registrations, courses, timetableSlots, parents, announcements, parentStudentMappings,
      subjects, teacherSubjectAssignments, teacherGradeSectionAssignments, parentFeedbacks,
      isLoadingTeachers, teachersError,
      isLoadingParents, parentsError,
      isLoadingFeedback, feedbackError,
      teacherMetrics, isLoadingTeacherMetrics,
      feedbackStatistics,
      sectionConfigurations, isLoadingSections,
      currentAcademicYear, isLoadingAcademicYear,
      subjectAssignmentFormData, isLoadingSubjectAssignmentFormData,
      timeSlots, weeklyTimetables, isLoadingTimeSlots, isLoadingWeeklyTimetables,
      schoolScheduleSettings, isLoadingSchoolScheduleSettings,
      schoolName, setSchoolName, schoolYear, setSchoolYear, termStart, setTermStart, autoEnroll, setAutoEnroll, minGPA, setMinGPA, seatLimit, setSeatLimit,
      addStudent, updateStudent, archiveStudent, promoteGrade, transferSection,
      approveRegistration, rejectRegistration,
      addTeacher, updateTeacher, deactivateTeacher,
      addParent, updateParent, deleteParent, activateParent, deactivateParent: deactivateParentFunc,
      addCourse, updateCourse, deleteCourse,
      addTimetableSlot, deleteTimetableSlot,
      addAnnouncement, deleteAnnouncement, archiveAnnouncement,
      addSubject, updateSubject, deleteSubject, archiveSubject,
      addSubjectAssignment, updateSubjectAssignment, deleteSubjectAssignment,
      addTeacherSubjectAssignment, updateTeacherSubjectAssignment, deleteTeacherSubjectAssignment,
      addTeacherGradeSectionAssignment, deleteTeacherGradeSectionAssignment,
      loadTimeSlots, loadWeeklyTimetables, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
      loadSchoolScheduleSettings, saveSchoolScheduleSettings: saveSchoolScheduleSettingsData, generateTimeSlots: generateTimeSlotsData,
      resolveParentFeedback,
      refreshTeacherMetrics
    }}>
      {children}
    </DirectorDataContext.Provider>
  );
};
