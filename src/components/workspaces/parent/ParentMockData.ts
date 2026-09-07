/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  section: string;
  homeroomTeacher: string;
  homeroomTeacherId: string;
  gpa: string;
  attendance: string;
  average: string;
  behaviorStatus: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  photo: string;
  academicStatus: 'Distinction' | 'Good Standing' | 'Academic Warning';
  dob: string;
  gender: string;
  allergyInfo: string;
  bloodGroup: string;
}

export interface AcademicRecord {
  id: string;
  subject: string;
  teacher: string;
  homework: string; // "90% (A)" or raw score
  assignments: string;
  midExam: string;
  finalExam: string;
  overallMark: number;
  grade: string;
  teacherComment: string;
}

export interface BehaviorRecord {
  id: string;
  date: string;
  teacher: string;
  category: 'Engagement' | 'Teamwork' | 'Disruptive' | 'Tardiness' | 'Outstanding Effort' | 'Leadership';
  description: string;
  recommendation: string;
  severity: 'Low' | 'Medium' | 'High';
  type: 'Positive' | 'Improvement';
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  session: string; // "Morning" or "Full Day"
  remark?: string;
}

export interface SubjectMarkDetail {
  subjectName: string;
  teacher: string;
  homeworkMarks: number; // Max 100
  assignmentMarks: number; // Max 100
  quizMarks: number; // Max 100
  midtermMarks: number; // Max 100
  finalExamMarks: number; // Max 100
  overallMark: number;
  grade: string;
  teacherRemarks: string;
  semester: string; // "Semester 1" | "Semester 2"
  year: string; // "2025-2026" | "2026-2027"
}

export interface PaymentInvoice {
  id: string;
  receiptNumber: string;
  desc: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  category: 'Tuition' | 'Transit' | 'Lab Fee' | 'Extracurricular' | 'Books';
}

export interface RegistrationStatus {
  childId: string;
  status: 'Not Started' | 'Pending Documents' | 'Submitted' | 'Under Review' | 'Approved';
  openingDate: string;
  closingDate: string;
  currentGrade: string;
  nextGrade: string;
  requiredDocuments: string[];
  submittedDocuments: { name: string; type: string; date: string }[];
  updatedInfo?: {
    emergencyPhone?: string;
    address?: string;
    medicalNotes?: string;
  };
}

export interface ParentAnnouncement {
  id: string;
  title: string;
  description: string;
  priority: 'Emergency' | 'High' | 'Normal' | 'Low';
  publishedDate: string;
  attachments?: { name: string; size: string; url: string }[];
  images?: string[];
  read: boolean;
  audience: 'Entire School' | 'Parents' | 'Grade 9' | 'Grade 10' | 'Section A' | 'Section B';
}

export interface MessageThread {
  id: string;
  teacherName: string;
  teacherSubject: string;
  teacherAvatar: string;
  teacherId: string;
  unread: boolean;
  messages: {
    id: string;
    sender: 'parent' | 'teacher' | 'system';
    text: string;
    timestamp: string;
    attachments?: { name: string; size: string }[];
  }[];
}

export interface FeedbackSubmission {
  id: string;
  recipient: 'Teacher' | 'Director' | 'Administration';
  category: 'Teaching Quality' | 'Student Welfare' | 'School Environment' | 'Communication' | 'Facilities' | 'Transportation' | 'General Suggestions';
  subject: string;
  message: string;
  date: string;
  attachments?: { name: string; size: string }[];
  anonymous: boolean;
  status: 'Submitted' | 'Under Review' | 'Resolved' | 'Closed';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  category: 'Examination' | 'Meeting' | 'Holiday' | 'Registration' | 'Fee Deadline' | 'Event';
  description: string;
}

// -----------------------------------------
// DATA INSTANCES
// -----------------------------------------

export const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'STU-1001',
    name: 'Alex Johnson',
    grade: 'Grade 9',
    section: 'Section A',
    homeroomTeacher: 'Dr. Evelyn Foster',
    homeroomTeacherId: 'TCH-201',
    gpa: '3.86',
    attendance: '98.5',
    average: '93',
    behaviorStatus: 'Excellent',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    academicStatus: 'Distinction',
    dob: '2011-04-12',
    gender: 'Male',
    allergyInfo: 'None',
    bloodGroup: 'O-positive'
  },
  {
    id: 'STU-1002',
    name: 'Chloe Johnson',
    grade: 'Grade 10',
    section: 'Section B',
    homeroomTeacher: 'Prof. Julian Vane',
    homeroomTeacherId: 'TCH-202',
    gpa: '3.42',
    attendance: '94.2',
    average: '87',
    behaviorStatus: 'Satisfactory',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    academicStatus: 'Good Standing',
    dob: '2010-09-25',
    gender: 'Female',
    allergyInfo: 'Peanuts (Mild)',
    bloodGroup: 'A-positive'
  }
];

export const ACADEMIC_PROGRESS_RECORDS: Record<string, AcademicRecord[]> = {
  'STU-1001': [
    {
      id: 'REC-101',
      subject: 'AP Organic Chemistry',
      teacher: 'Dr. Evelyn Foster',
      homework: '92% (A)',
      assignments: '94% (A)',
      midExam: '88% (B+)',
      finalExam: '95% (A)',
      overallMark: 93,
      grade: 'A',
      teacherComment: 'Alex exhibits highly rigorous analysis during physical lab trials.'
    },
    {
      id: 'REC-102',
      subject: 'Multivariable Calculus',
      teacher: 'Sarah Jenkins',
      homework: '96% (A+)',
      assignments: '95% (A)',
      midExam: '90% (A)',
      finalExam: '94% (A)',
      overallMark: 94,
      grade: 'A',
      teacherComment: 'Outstanding logic. Consistently solves complex double integral proofs quickly.'
    },
    {
      id: 'REC-103',
      subject: 'Physics & Wave Mechanics',
      teacher: 'Amara Diop',
      homework: '88% (B+)',
      assignments: '91% (A)',
      midExam: '89% (B+)',
      finalExam: '92% (A)',
      overallMark: 91,
      grade: 'A-',
      teacherComment: 'Strong scientific model interpretation, active in particle simulation teams.'
    }
  ],
  'STU-1002': [
    {
      id: 'REC-201',
      subject: 'Intro to Polymers',
      teacher: 'Prof. Julian Vane',
      homework: '82% (B)',
      assignments: '85% (B)',
      midExam: '79% (C+)',
      finalExam: '84% (B)',
      overallMark: 83,
      grade: 'B',
      teacherComment: 'Chloe is creative but needs to tighten her structural balance sheets before final labs.'
    },
    {
      id: 'REC-202',
      subject: 'Modern Arts & Design',
      teacher: 'Amara Diop',
      homework: '98% (A+)',
      assignments: '96% (A)',
      midExam: '94% (A)',
      finalExam: '97% (A+)',
      overallMark: 96,
      grade: 'A+',
      teacherComment: 'Exquisite color space layouts. Shows remarkable digital model curation.'
    },
    {
      id: 'REC-203',
      subject: 'English Lit & Rhetoric',
      teacher: 'Henry Cavendish',
      homework: '88% (B+)',
      assignments: '86% (B)',
      midExam: '84% (B)',
      finalExam: '88% (B+)',
      overallMark: 86,
      grade: 'B',
      teacherComment: 'Strong essay narrative structure. Participates constructively during seminar circles.'
    }
  ]
};

export const BEHAVIOR_RECORDS: Record<string, BehaviorRecord[]> = {
  'STU-1001': [
    {
      id: 'BEH-001',
      date: '2026-07-15',
      teacher: 'Dr. Evelyn Foster',
      category: 'Leadership',
      description: 'Volunteered to lead the lab safety peer audit and set up extra safety equipment.',
      recommendation: 'Continue supporting junior student guidance in Chemistry club circles.',
      severity: 'Low',
      type: 'Positive'
    },
    {
      id: 'BEH-002',
      date: '2026-06-18',
      teacher: 'Sarah Jenkins',
      category: 'Engagement',
      description: 'Assisted two classmates in understanding complex vector matrices before the quiz.',
      recommendation: 'Keep exhibiting proactive collaboration values.',
      severity: 'Low',
      type: 'Positive'
    }
  ],
  'STU-1002': [
    {
      id: 'BEH-003',
      date: '2026-07-08',
      teacher: 'Prof. Julian Vane',
      category: 'Outstanding Effort',
      description: 'Delivered an outstanding digital 3D sculpture model despite missing earlier render draft time.',
      recommendation: 'Excellent result. Maintain calendar tracking closely for next milestones.',
      severity: 'Low',
      type: 'Positive'
    },
    {
      id: 'BEH-004',
      date: '2026-06-22',
      teacher: 'Henry Cavendish',
      category: 'Tardiness',
      description: 'Arrived 15 minutes late to English morning seminar twice in one week.',
      recommendation: 'Ensure morning transit arrangements are planned 10 minutes earlier.',
      severity: 'Medium',
      type: 'Improvement'
    }
  ]
};

export const ATTENDANCE_RECORDS: Record<string, AttendanceRecord[]> = {
  'STU-1001': [
    { date: '2026-07-20', status: 'Present', session: 'Full Day' },
    { date: '2026-07-19', status: 'Present', session: 'Full Day' },
    { date: '2026-07-18', status: 'Present', session: 'Full Day' },
    { date: '2026-07-17', status: 'Present', session: 'Full Day' },
    { date: '2026-07-16', status: 'Present', session: 'Full Day' },
    { date: '2026-07-15', status: 'Late', session: 'Morning', remark: 'Transit train delayed by grid lock' },
    { date: '2026-07-14', status: 'Present', session: 'Full Day' }
  ],
  'STU-1002': [
    { date: '2026-07-20', status: 'Present', session: 'Full Day' },
    { date: '2026-07-19', status: 'Present', session: 'Full Day' },
    { date: '2026-07-18', status: 'Present', session: 'Full Day' },
    { date: '2026-07-17', status: 'Excused', session: 'Full Day', remark: 'Medical appointment' },
    { date: '2026-07-16', status: 'Present', session: 'Full Day' },
    { date: '2026-07-15', status: 'Present', session: 'Full Day' },
    { date: '2026-07-14', status: 'Present', session: 'Full Day' }
  ]
};

export const SUBJECT_MARKS: Record<string, SubjectMarkDetail[]> = {
  'STU-1001': [
    {
      subjectName: 'AP Organic Chemistry',
      teacher: 'Dr. Evelyn Foster',
      homeworkMarks: 94,
      assignmentMarks: 96,
      quizMarks: 92,
      midtermMarks: 88,
      finalExamMarks: 95,
      overallMark: 93,
      grade: 'A',
      teacherRemarks: 'Brilliant student, very disciplined in laboratory assignments.',
      semester: 'Semester 1',
      year: '2025-2026'
    },
    {
      subjectName: 'Multivariable Calculus',
      teacher: 'Sarah Jenkins',
      homeworkMarks: 98,
      assignmentMarks: 96,
      quizMarks: 95,
      midtermMarks: 90,
      finalExamMarks: 94,
      overallMark: 94,
      grade: 'A',
      teacherRemarks: 'Excellent numerical analytical abilities. Always helps classmates with calculations.',
      semester: 'Semester 1',
      year: '2025-2026'
    },
    {
      subjectName: 'Physics & Wave Mechanics',
      teacher: 'Amara Diop',
      homeworkMarks: 89,
      assignmentMarks: 91,
      quizMarks: 90,
      midtermMarks: 89,
      finalExamMarks: 92,
      overallMark: 91,
      grade: 'A-',
      teacherRemarks: 'Actively participates and constructs stellar simulation models.',
      semester: 'Semester 1',
      year: '2025-2026'
    }
  ],
  'STU-1002': [
    {
      subjectName: 'Intro to Polymers',
      teacher: 'Prof. Julian Vane',
      homeworkMarks: 84,
      assignmentMarks: 86,
      quizMarks: 81,
      midtermMarks: 79,
      finalExamMarks: 84,
      overallMark: 83,
      grade: 'B',
      teacherRemarks: 'Strong interest, but needs slightly better precision with formula weights.',
      semester: 'Semester 1',
      year: '2025-2026'
    },
    {
      subjectName: 'Modern Arts & Design',
      teacher: 'Amara Diop',
      homeworkMarks: 98,
      assignmentMarks: 95,
      quizMarks: 96,
      midtermMarks: 94,
      finalExamMarks: 97,
      overallMark: 96,
      grade: 'A+',
      teacherRemarks: 'Artistic powerhouse. Showcases tremendous canvas depth.',
      semester: 'Semester 1',
      year: '2025-2026'
    },
    {
      subjectName: 'English Lit & Rhetoric',
      teacher: 'Henry Cavendish',
      homeworkMarks: 89,
      assignmentMarks: 85,
      quizMarks: 87,
      midtermMarks: 84,
      finalExamMarks: 88,
      overallMark: 86,
      grade: 'B',
      teacherRemarks: 'Good grasp of contextual critique and metaphors.',
      semester: 'Semester 1',
      year: '2025-2026'
    }
  ]
};

export const INITIAL_PAYMENTS: PaymentInvoice[] = [
  {
    id: 'INV-10021',
    receiptNumber: 'REC-2026-9901',
    desc: 'Term 1 Registration & Course Tuition - Alex Johnson',
    amount: 1200,
    dueDate: '2026-07-15',
    status: 'Overdue',
    category: 'Tuition'
  },
  {
    id: 'INV-10022',
    receiptNumber: 'REC-2026-9902',
    desc: 'Term 1 Registration & Course Tuition - Chloe Johnson',
    amount: 1200,
    dueDate: '2026-07-15',
    paymentDate: '2026-07-14',
    paymentMethod: 'ACH Direct Debit',
    status: 'Paid',
    category: 'Tuition'
  },
  {
    id: 'INV-10023',
    receiptNumber: 'REC-2026-9903',
    desc: 'Chemistry Lab Consumables & Safe Goggles - Alex Johnson',
    amount: 150,
    dueDate: '2026-07-28',
    status: 'Unpaid',
    category: 'Lab Fee'
  },
  {
    id: 'INV-10024',
    receiptNumber: 'REC-2026-9904',
    desc: 'Autumn Quarter Bus Transit Pass - Chloe Johnson',
    amount: 250,
    dueDate: '2026-07-10',
    paymentDate: '2026-07-09',
    paymentMethod: 'Credit Card (Visa)',
    status: 'Paid',
    category: 'Transit'
  }
];

export const INITIAL_REGISTRATION: Record<string, RegistrationStatus> = {
  'STU-1001': {
    childId: 'STU-1001',
    status: 'Approved',
    openingDate: '2026-07-01',
    closingDate: '2026-08-15',
    currentGrade: 'Grade 9',
    nextGrade: 'Grade 10',
    requiredDocuments: ['Signed Parent Consent Form', 'Latest Medical Physical Record', 'Updated Vaccination Booklet'],
    submittedDocuments: [
      { name: 'Alex_Consent_Signed.pdf', type: 'PDF', date: '2026-07-05' },
      { name: 'Phys_Health_Check.pdf', type: 'PDF', date: '2026-07-05' }
    ]
  },
  'STU-1002': {
    childId: 'STU-1002',
    status: 'Not Started',
    openingDate: '2026-07-01',
    closingDate: '2026-08-15',
    currentGrade: 'Grade 10',
    nextGrade: 'Grade 11',
    requiredDocuments: ['Signed Parent Consent Form', 'Primary Health Update Statement', 'Art Elective Confirmation Sheet'],
    submittedDocuments: []
  }
};

export const INITIAL_ANNOUNCEMENTS: ParentAnnouncement[] = [
  {
    id: 'ANN-P01',
    title: 'Emergency: Severe Weather Flash Advisory & Online Alternative Day',
    description: 'Due to severe torrential rains and microburst forecasts on Tuesday morning, we are moving all primary/secondary classes to our cloud learning portal. Physical campus labs will be closed. Instructors will host live chemical simulation sessions via standard timetables on the virtual classroom. Attendance remains mandatory.',
    priority: 'Emergency',
    publishedDate: '2026-07-20T06:00:00',
    audience: 'Entire School',
    read: false,
    images: ['https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&auto=format&fit=crop&q=80']
  },
  {
    id: 'ANN-P02',
    title: 'Upcoming Parent-Teacher Advisory Board Meeting (Term 1)',
    description: 'We are hosting the first advisory committee session of the academic term. Dr. Evelyn Foster and Campus Director Robert Mercer will discuss curriculum goals, new air-hood facility upgrades, and standard deviation curves. Snacks and coffee will be provided in Assembly Hall B.',
    priority: 'High',
    publishedDate: '2026-07-18T10:00:00',
    audience: 'Parents',
    read: false,
    attachments: [
      { name: 'Agenda_Parent_Board_Meeting.pdf', size: '150 KB', url: '#' },
      { name: 'Term_1_Syllabus_Goals.docx', size: '1.2 MB', url: '#' }
    ]
  },
  {
    id: 'ANN-P03',
    title: 'Grade 10-B Art Exhibition Showcase Announcement',
    description: 'Parents of Grade 10 students are cordially invited to our design gallery. Standard projects including Chloe\'s acrylic space installation will be showcased. We are incredibly proud of their work.',
    priority: 'Normal',
    publishedDate: '2026-07-15T14:30:00',
    audience: 'Grade 10',
    read: true
  }
];

export const INITIAL_COMMUNICATION_THREADS: MessageThread[] = [
  {
    id: 'TREAD-101',
    teacherName: 'Dr. Evelyn Foster',
    teacherSubject: 'AP Organic Chemistry',
    teacherAvatar: 'E',
    teacherId: 'TCH-201',
    unread: true,
    messages: [
      {
        id: 'MSG-001',
        sender: 'teacher',
        text: 'Hello Mr. Johnson. Alex completed the molecular structure task wonderfully. However, please remind him to log his secondary errors in standard titration labs.',
        timestamp: '2026-07-19T09:15:00'
      },
      {
        id: 'MSG-002',
        sender: 'parent',
        text: 'Hello Dr. Foster. Thank you for the detailed feedback. I have spoken with Alex, and he is reviewing the deviation values. He is working on it tonight!',
        timestamp: '2026-07-19T11:45:00'
      },
      {
        id: 'MSG-003',
        sender: 'teacher',
        text: 'Splendid. Let me know if he needs physical reference pamphlets.',
        timestamp: '2026-07-19T14:02:00'
      }
    ]
  },
  {
    id: 'TREAD-102',
    teacherName: 'Prof. Julian Vane',
    teacherSubject: 'Intro to Polymers & Materials',
    teacherAvatar: 'J',
    teacherId: 'TCH-202',
    unread: false,
    messages: [
      {
        id: 'MSG-004',
        sender: 'teacher',
        text: 'Good morning. Just checking in on Chloe\'s safety portfolio report. The upload is still pending.',
        timestamp: '2026-07-18T16:00:00'
      },
      {
        id: 'MSG-005',
        sender: 'parent',
        text: 'Thank you Julian. She was editing her ChemDraw sketch yesterday. We will submit it within the hour.',
        timestamp: '2026-07-18T16:30:00'
      }
    ]
  }
];

export const INITIAL_FEEDBACKS: FeedbackSubmission[] = [
  {
    id: 'FEED-101',
    recipient: 'Director',
    category: 'Facilities',
    subject: 'Air Flow in Laboratory 4-A',
    message: 'My son Alex mentioned the ventilation hoods seem loud during chemical vapor experiments. Could these be checked for auditory comfort?',
    date: '2026-07-16',
    anonymous: false,
    status: 'Resolved'
  },
  {
    id: 'FEED-102',
    recipient: 'Administration',
    category: 'Transportation',
    subject: 'Quarterly bus route timing',
    message: 'The Grade 10 morning bus has arrived 5-10 minutes late on a couple of occasions due to freeway congestion. Is there a route adjustment possible?',
    date: '2026-07-18',
    anonymous: true,
    status: 'Under Review'
  }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'EV-001',
    title: 'Mid-Term Organic Chemistry Exam',
    start: '2026-07-22',
    category: 'Examination',
    description: 'Grade 9 core examinations. Titration, molecular modeling and resonance equations.'
  },
  {
    id: 'EV-002',
    title: 'Quarterly Tuition Payment Deadline',
    start: '2026-07-28',
    category: 'Fee Deadline',
    description: 'Tuition, extracurricular activity fees, and bus transit settle due date.'
  },
  {
    id: 'EV-003',
    title: 'Registration Advisory Board Circle',
    start: '2026-08-01',
    category: 'Registration',
    description: 'Advisory panel on re-enrollment, updated documents uploads, and curriculum previews.'
  },
  {
    id: 'EV-004',
    title: 'Parent-Teacher Council Review',
    start: '2026-07-25',
    category: 'Meeting',
    description: 'Advisory face-to-face feedback with primary homeroom teachers.'
  },
  {
    id: 'EV-005',
    title: 'Summer Mid-Term Recess Day',
    start: '2026-07-31',
    category: 'Holiday',
    description: 'No physical classes. Campus closed for system maintenance.'
  }
];
