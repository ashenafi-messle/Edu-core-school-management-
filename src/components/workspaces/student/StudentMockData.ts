/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  photo: string;
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female';
  grade: string;
  section: string;
  guardianName: string;
  guardianRelationship?: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  enrollmentDate: string;
  status: string;
  medicalInfo: string;
  phone: string;
  email: string;
  address: string;
}

export interface SubjectStats {
  subject: string;
  teacher: string;
  ca: number; // Continuous Assessment %
  homework: number; // Homework score %
  assignment: number; // Assignment score %
  midExam: number;
  finalExam: number;
  overall: number;
  grade: string;
  comment: string;
  status: 'Passed' | 'Ongoing' | 'Failed';
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  instructions: string;
  dueDate: string;
  marks: number;
  attachments: { name: string; size: string }[];
  status: 'Pending' | 'Draft' | 'Submitted' | 'Graded';
  submission?: {
    submittedDate: string;
    fileFormat: string;
    fileName: string;
    studentComments?: string;
    grade?: string;
    feedback?: string;
    score?: number;
  };
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  marks: number;
  attachments: { name: string; size: string }[];
  feedback?: string;
}

export interface ExamQuestion {
  id: number;
  type: 'MultipleChoice' | 'TrueFalse' | 'ShortAnswer' | 'Essay' | 'Matching' | 'FillBlank' | 'FileUpload' | 'ImageUpload';
  question: string;
  options?: string[]; // MC
  matchingPairs?: { key: string; val: string }[]; // Matching
  correctAnswer?: string;
}

export interface Examination {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  durationMinutes: number;
  totalMarks: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  questions: ExamQuestion[];
  score?: number;
  grade?: string;
  feedback?: string;
  answersReviewEnabled?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Book' | 'Slide' | 'PDF' | 'Video' | 'Document' | 'Practice';
  subject: string;
  teacher: string;
  dateAdded: string;
  size?: string;
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  target: 'Entire School' | 'Grade 10' | 'Section A' | 'Emergency Notice';
  publishedDate: string;
  priority: 'Low' | 'Normal' | 'High' | 'Emergency';
  read: boolean;
  attachments?: string[];
  image?: string;
}

export interface TeacherRating {
  id: string;
  teacherName: string;
  subject: string;
  date: string;
  teachingQuality: number;
  communication: number;
  subjectKnowledge: number;
  classManagement: number;
  supportiveness: number;
  overallRating: number;
  comment?: string;
  anonymous: boolean;
}

export interface StudentFeedback {
  id: string;
  subject: string;
  category: 'Teaching' | 'Facilities' | 'Library' | 'Transportation' | 'School Environment' | 'Academic Support' | 'General Suggestions';
  message: string;
  date: string;
  anonymous: boolean;
  status: 'Submitted' | 'Under Review' | 'Resolved' | 'Closed';
  response?: string;
}

export interface MessageThread {
  id: string;
  recipientName: string;
  recipientRole: string;
  unread: boolean;
  messages: {
    sender: 'student' | 'recipient' | string;
    senderName?: string;
    text: string;
    timestamp: string;
  }[];
  isGroup?: boolean;
}

export const initialProfile: StudentProfile = {
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  id: 'STU-1001',
  name: 'Alexander Mercer',
  dob: '2010-04-15',
  gender: 'Male',
  grade: 'Grade 10',
  section: 'Section A',
  guardianName: 'Robert Mercer',
  guardianPhone: '+1 (555) 019-2834',
  guardianEmail: 'robert.mercer@gmail.com',
  emergencyContactName: 'Helen Mercer (Mother)',
  emergencyContactPhone: '+1 (555) 019-2835',
  enrollmentDate: '2024-09-01',
  status: 'Active',
  medicalInfo: 'Peanut allergy. Carries EpiPen.',
  phone: '+1 (555) 012-3456',
  email: 'alex.mercer@educore.edu',
  address: '142 Skyview Terrace, San Francisco, CA'
};

export const initialSubjectStats: SubjectStats[] = [
  {
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    ca: 92,
    homework: 95,
    assignment: 90,
    midExam: 88,
    finalExam: 94,
    overall: 92.2,
    grade: 'A-',
    comment: 'Excellent analytical laboratory skills and conceptual understanding.',
    status: 'Passed'
  },
  {
    subject: 'Multivariable Calculus',
    teacher: 'Sarah Jenkins',
    ca: 96,
    homework: 98,
    assignment: 95,
    midExam: 94,
    finalExam: 97,
    overall: 96.1,
    grade: 'A+',
    comment: 'Brilliant mathematical aptitude and problem-solving velocity.',
    status: 'Passed'
  },
  {
    subject: 'Contemporary History',
    teacher: 'Prof. Julian Vane',
    ca: 85,
    homework: 88,
    assignment: 82,
    midExam: 80,
    finalExam: 86,
    overall: 83.8,
    grade: 'B',
    comment: 'Good essay arguments, active and highly participative in debates.',
    status: 'Passed'
  },
  {
    subject: 'English Literature',
    teacher: 'Mrs. Diana Price',
    ca: 90,
    homework: 92,
    assignment: 94,
    midExam: 88,
    finalExam: 91,
    overall: 90.8,
    grade: 'A',
    comment: 'Strong reading comprehension skills and critical literature critiques.',
    status: 'Passed'
  },
  {
    subject: 'AP Physics C',
    teacher: 'Dr. Marcus Vance',
    ca: 88,
    homework: 90,
    assignment: 85,
    midExam: 92,
    finalExam: 89,
    overall: 89.1,
    grade: 'A-',
    comment: 'Demonstrates a consistent conceptual grasp of mechanics & electromagnetism.',
    status: 'Passed'
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'ASG-902',
    title: 'Benzene Ring Synthesis Lab',
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    instructions: 'Submit a full laboratory write-up outlining the reaction mechanisms of aromatic hydrocarbon substitutions. Detail safety procedures and yields.',
    dueDate: '2026-07-23T23:59:00',
    marks: 100,
    attachments: [
      { name: 'Aromatic_Substitution_Rubric.pdf', size: '1.2 MB' },
      { name: 'Lab_Report_Template.docx', size: '450 KB' }
    ],
    status: 'Pending'
  },
  {
    id: 'ASG-891',
    title: 'Stoke\'s Theorem Application',
    subject: 'Multivariable Calculus',
    teacher: 'Sarah Jenkins',
    instructions: 'Solve the attached problem set mapping boundary integrations over vector fields. Explain geometric intuition.',
    dueDate: '2026-07-28T23:59:00',
    marks: 50,
    attachments: [
      { name: 'Stokes_Problems_Set4.pdf', size: '2.1 MB' }
    ],
    status: 'Pending'
  },
  {
    id: 'ASG-782',
    title: 'WWI Treaty of Versailles Essay',
    subject: 'Contemporary History',
    teacher: 'Prof. Julian Vane',
    instructions: 'Analyze the economic repercussions of Germany\'s reparations as outlined in the Treaty. Max 2000 words.',
    dueDate: '2026-07-15T18:00:00',
    marks: 100,
    attachments: [],
    status: 'Graded',
    submission: {
      submittedDate: '2026-07-14T14:20:00',
      fileFormat: 'PDF',
      fileName: 'Alexander_Mercer_Versailles_Essay.pdf',
      studentComments: 'I focused heavily on Keynesian economic reviews.',
      grade: 'A',
      feedback: 'Excellent critical perspective on reparation hyperinflation. Well structured!',
      score: 94
    }
  }
];

export const initialHomework: Homework[] = [
  {
    id: 'HW-101',
    title: 'Integration by Parts Drills',
    subject: 'Multivariable Calculus',
    teacher: 'Sarah Jenkins',
    description: 'Complete problems 1 to 20 in Chapter 7. Show absolute steps for reduction formulas.',
    dueDate: '2026-07-21T08:00:00',
    status: 'Pending',
    marks: 20,
    attachments: []
  },
  {
    id: 'HW-102',
    title: 'Lewis Structure Practice Set',
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    description: 'Sketch resonance structures for carbocation intermediates listed on page 14.',
    dueDate: '2026-07-25T11:59:00',
    status: 'Pending',
    marks: 10,
    attachments: []
  },
  {
    id: 'HW-099',
    title: 'Cold War Timeline Sketch',
    subject: 'Contemporary History',
    teacher: 'Prof. Julian Vane',
    description: 'Draft a visual timeline of geopolitical proxies between 1947 and 1962.',
    dueDate: '2026-07-12T23:59:00',
    status: 'Completed',
    marks: 15,
    attachments: [],
    feedback: 'Fabulous detail on the Berlin Crisis and Cuban Missile Crisis!'
  }
];

export const initialExams: Examination[] = [
  {
    id: 'EXM-401',
    title: 'AP Chemistry Semester 1 Midterm',
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    date: '2026-07-22T09:00:00',
    durationMinutes: 30,
    totalMarks: 60,
    status: 'Ongoing',
    questions: [
      {
        id: 1,
        type: 'MultipleChoice',
        question: 'What is the hybridization of the carbonyl carbon atom in acetone?',
        options: ['sp', 'sp2', 'sp3', 'dsp2'],
        correctAnswer: 'sp2'
      },
      {
        id: 2,
        type: 'TrueFalse',
        question: 'Enantiomers possess identical boiling points, melting points, and densities.',
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 3,
        type: 'ShortAnswer',
        question: 'Name the organic functional group characterized by a terminal carbon double-bonded to an oxygen and single-bonded to a hydrogen (-CHO).',
        correctAnswer: 'Aldehyde'
      },
      {
        id: 4,
        type: 'Essay',
        question: 'Explain the difference between SN1 and SN2 reaction mechanisms, highlighting steric hindrance, solvents, and carbocation stability.',
        correctAnswer: 'An SN1 reaction is a nucleophilic substitution reaction that occurs in two steps, favoring polar protic solvents, tertiary halides, and forms a flat carbocation intermediate. SN2 is a single-step concerted bimolecular pathway that favors polar aprotic solvents, primary substrates, and undergoes stereochemical inversion (Walden inversion) due to back-side attack.'
      },
      {
        id: 5,
        type: 'Matching',
        question: 'Match the reagents to their correct organic oxidation/reduction functions.',
        matchingPairs: [
          { key: 'PCC (Pyridinium Chlorochromate)', val: 'Oxidizes primary alcohols to aldehydes' },
          { key: 'LiAlH4 (Lithium Aluminum Hydride)', val: 'Strongly reduces carboxylic acids to primary alcohols' },
          { key: 'Ozone (O3) with Zn/H2O', val: 'Cleaves alkenes into carbonyl fragments' }
        ],
        correctAnswer: 'Matchings mapped'
      },
      {
        id: 6,
        type: 'FillBlank',
        question: 'Hydroboration-oxidation of an asymmetric alkene yields an alcohol with [BLANK] regioselectivity.',
        correctAnswer: 'anti-Markovnikov'
      }
    ]
  },
  {
    id: 'EXM-402',
    title: 'Calculus: Advanced Taylor Series',
    subject: 'Multivariable Calculus',
    teacher: 'Sarah Jenkins',
    date: '2026-07-26T10:30:00',
    durationMinutes: 60,
    totalMarks: 50,
    status: 'Upcoming',
    questions: []
  },
  {
    id: 'EXM-398',
    title: 'WWII Battle Tactics Assessment',
    subject: 'Contemporary History',
    teacher: 'Prof. Julian Vane',
    date: '2026-07-10T14:00:00',
    durationMinutes: 45,
    totalMarks: 40,
    status: 'Completed',
    questions: [],
    score: 38,
    grade: 'A',
    feedback: 'Stellar work. Excellent evaluation of Blitzkrieg defensive counters.'
  }
];

export const initialResources: Resource[] = [
  {
    id: 'RES-001',
    title: 'Organic Chemistry II Complete Syllabus',
    type: 'PDF',
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    dateAdded: '2026-06-15',
    size: '4.5 MB',
    url: '#'
  },
  {
    id: 'RES-002',
    title: 'Vector Calculus Lecture Slides (Week 1-4)',
    type: 'Slide',
    subject: 'Multivariable Calculus',
    teacher: 'Sarah Jenkins',
    dateAdded: '2026-06-20',
    size: '12.1 MB',
    url: '#'
  },
  {
    id: 'RES-003',
    title: 'Introduction to Reaction Mechanics - Carbonyls',
    type: 'Video',
    subject: 'AP Organic Chemistry',
    teacher: 'Dr. Evelyn Foster',
    dateAdded: '2026-07-02',
    url: 'https://www.youtube.com'
  },
  {
    id: 'RES-004',
    title: 'Treaty of Versailles Complete Text & Annotations',
    type: 'Book',
    subject: 'Contemporary History',
    teacher: 'Prof. Julian Vane',
    dateAdded: '2026-05-18',
    size: '18.4 MB',
    url: '#'
  },
  {
    id: 'RES-005',
    title: 'Electrostatics Practice Worksheet with Keys',
    type: 'Practice',
    subject: 'AP Physics C',
    teacher: 'Dr. Marcus Vance',
    dateAdded: '2026-07-10',
    size: '2.3 MB',
    url: '#'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ANN-401',
    title: 'STEM Exhibition Laboratory Registration',
    description: 'We are officially launching registration for the Annual High School STEM Exhibition. Students in Grade 10 can register individual or group chemistry and physics outlines. Submit criteria outlines directly to Dr. Foster by Friday evening.',
    target: 'Grade 10',
    publishedDate: '2026-07-20T08:00:00',
    priority: 'High',
    read: false,
    attachments: ['STEM_Exhibition_Criteria_2026.pdf']
  },
  {
    id: 'ANN-402',
    title: 'Planned Campus Power System Upgrade',
    description: 'Notice: The main administrative campus power grids will undergo scheduled maintenance tomorrow morning. School operations will resume with a 1-hour delay. Bus schedules have been modified accordingly.',
    target: 'Entire School',
    publishedDate: '2026-07-19T17:00:00',
    priority: 'Emergency',
    read: false
  },
  {
    id: 'ANN-403',
    title: 'New Library E-Book Resource Additions',
    description: 'Over 500 new scientific, literature, and math textbooks have been integrated into the digital learning portal under Library catalogs. Renewals can be handled directly via portal pages.',
    target: 'Entire School',
    publishedDate: '2026-07-15T12:00:00',
    priority: 'Low',
    read: true
  }
];

export const initialTeacherRatings: TeacherRating[] = [
  {
    id: 'RAT-001',
    teacherName: 'Dr. Evelyn Foster',
    subject: 'AP Organic Chemistry',
    date: '2026-07-05',
    teachingQuality: 5,
    communication: 4,
    subjectKnowledge: 5,
    classManagement: 4,
    supportiveness: 5,
    overallRating: 4.6,
    comment: 'Brilliant teacher! Labs are extremely engaging.',
    anonymous: true
  }
];

export const initialFeedback: StudentFeedback[] = [
  {
    id: 'FDB-001',
    subject: 'Extended Library Hours during Midterms',
    category: 'Library',
    message: 'Could we request the digital laboratory and resource desks remain accessible until 9:00 PM during exam seasons? This would help study groups significantly.',
    date: '2026-07-12',
    anonymous: false,
    status: 'Resolved',
    response: 'Approved! Desk services extended until 9:30 PM starting next week.'
  }
];

export const initialMessageThreads: MessageThread[] = [
  {
    id: 'TH-101',
    recipientName: 'Dr. Evelyn Foster',
    recipientRole: 'Teacher',
    unread: true,
    messages: [
      { sender: 'student', text: 'Hello Dr. Foster, regarding the Organic Synthesis Lab, should we use standard ACS format for citation lists?', timestamp: '2026-07-19T14:30:00' },
      { sender: 'recipient', text: 'Yes Alexander, standard ACS citations are preferred. Please ensure resonance structures are hand-drawn or digitally rendered with clean bonds.', timestamp: '2026-07-19T16:15:00' },
      { sender: 'student', text: 'Perfect. Thank you! I will submit the PDF tonight.', timestamp: '2026-07-19T16:40:00' }
    ]
  },
  {
    id: 'TH-102',
    recipientName: 'Director Office',
    recipientRole: 'Director',
    unread: false,
    messages: [
      { sender: 'student', text: 'Good morning, I wanted to confirm if the 11th Grade Honors course selection application is still open.', timestamp: '2026-07-10T09:00:00' },
      { sender: 'recipient', text: 'Hello Alexander. Yes, honors registration is open until the end of August. Please complete the registration form in your portal.', timestamp: '2026-07-10T11:20:00' }
    ]
  },
  {
    id: 'TH-G01',
    recipientName: 'Grade 10 • Section A',
    recipientRole: 'Homeroom Group',
    unread: true,
    isGroup: true,
    messages: [
      { sender: 'classmate', senderName: 'Emily Watson', text: 'Hey everyone! Is anyone done with the History timeline sketch?', timestamp: '2026-07-20T08:15:00' },
      { sender: 'classmate', senderName: 'Jacob Carter', text: 'Just finished mine! Used color codes for the proxy wars, super helpful.', timestamp: '2026-07-20T08:22:00' },
      { sender: 'recipient', senderName: 'Mrs. Diana Price', text: 'Remember to submit before midnight tomorrow. No extensions!', timestamp: '2026-07-20T09:05:00' }
    ]
  },
  {
    id: 'TH-G02',
    recipientName: 'AP Organic Chemistry',
    recipientRole: 'Class Chat',
    unread: false,
    isGroup: true,
    messages: [
      { sender: 'classmate', senderName: 'Liam O\'Connor', text: 'What was the answer to question 5 on the midterm review? Is it LiAlH4?', timestamp: '2026-07-19T15:02:00' },
      { sender: 'recipient', senderName: 'Dr. Evelyn Foster', text: 'Lithium Aluminum Hydride is indeed a strong reducing agent, Liam. Look at what it does to carboxylic acids!', timestamp: '2026-07-19T15:45:00' },
      { sender: 'student', text: 'Thanks, Dr. Foster! That clears up my draft.', timestamp: '2026-07-19T16:00:00' }
    ]
  },
  {
    id: 'TH-G03',
    recipientName: 'AP Physics C',
    recipientRole: 'Class Chat',
    unread: false,
    isGroup: true,
    messages: [
      { sender: 'recipient', senderName: 'Dr. Marcus Vance', text: 'I uploaded the Electrostatics worksheet solutions to the Resources tab. Review them before Friday.', timestamp: '2026-07-18T10:00:00' },
      { sender: 'classmate', senderName: 'Maya Lin', text: 'Lifesaver! The Gauss Law integration was tricky.', timestamp: '2026-07-18T10:15:00' }
    ]
  }
];

export const mockAttendanceRecords = {
  stats: {
    present: 168,
    absent: 2,
    late: 3,
    excused: 1,
    percentage: 97.1
  },
  history: [
    { date: '2026-07-17', status: 'Present', reason: 'N/A' },
    { date: '2026-07-16', status: 'Present', reason: 'N/A' },
    { date: '2026-07-15', status: 'Present', reason: 'N/A' },
    { date: '2026-07-14', status: 'Late', reason: 'Bus Delay' },
    { date: '2026-07-13', status: 'Present', reason: 'N/A' },
    { date: '2026-07-10', status: 'Present', reason: 'N/A' },
    { date: '2026-07-09', status: 'Excused', reason: 'Dentist Appointment' },
    { date: '2026-07-08', status: 'Present', reason: 'N/A' },
    { date: '2026-07-07', status: 'Absent', reason: 'Mild Fever' }
  ]
};
