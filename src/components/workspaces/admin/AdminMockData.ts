/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AdminUser, 
  OnlineRegistration, 
  StudentReadmission, 
  PaymentRecord, 
  RolePermissions, 
  AuditLog, 
  SupportTicket, 
  SchoolConfig 
} from './AdminTypes';

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'USR-1001',
    name: 'Julian Vane',
    role: 'teacher',
    email: 'julian.vane@educore.edu',
    phone: '+1 (555) 019-2231',
    status: 'Active',
    lastLogin: '2026-07-20 08:34 AM',
    createdDate: '2024-05-15',
    assignedClasses: ['Algebra 10-A', 'Calculus 11-B'],
    assignedSubjects: ['Mathematics', 'Advanced Algebra'],
    emergencyContact: 'Clara Vane (Spouse) - +1 (555) 019-2232'
  },
  {
    id: 'USR-1002',
    name: 'Sarah Jenkins',
    role: 'teacher',
    email: 'sarah.jenkins@educore.edu',
    phone: '+1 (555) 019-2847',
    status: 'Active',
    lastLogin: '2026-07-19 04:12 PM',
    createdDate: '2023-08-20',
    assignedClasses: ['Biology 9-A', 'Chemistry 10-B'],
    assignedSubjects: ['Science', 'Organic Chemistry'],
    emergencyContact: 'Paul Jenkins (Spouse) - +1 (555) 019-2848'
  },
  {
    id: 'USR-2001',
    name: 'Emily Johnson',
    role: 'student',
    email: 'emily.johnson@educore.edu',
    phone: '+1 (555) 019-2834',
    status: 'Active',
    lastLogin: '2026-07-20 07:55 AM',
    createdDate: '2025-09-01',
    grade: 'Grade 10',
    section: 'Section A',
    guardianName: 'Marcus Johnson',
    emergencyContact: 'Marcus Johnson (Father) - +1 (555) 019-2834'
  },
  {
    id: 'USR-2002',
    name: 'Lucas Vance',
    role: 'student',
    email: 'lucas.vance@educore.edu',
    phone: '+1 (555) 019-9918',
    status: 'Active',
    lastLogin: '2026-07-18 11:20 AM',
    createdDate: '2025-09-01',
    grade: 'Grade 8',
    section: 'Section B',
    guardianName: 'David Vance',
    emergencyContact: 'David Vance (Father) - +1 (555) 019-9920'
  },
  {
    id: 'USR-3001',
    name: 'Marcus Johnson',
    role: 'parent',
    email: 'marcus.johnson@example.com',
    phone: '+1 (555) 019-2834',
    status: 'Active',
    lastLogin: '2026-07-20 02:10 AM',
    createdDate: '2025-09-01',
    emergencyContact: 'Sarah Johnson (Spouse) - +1 (555) 019-2835'
  },
  {
    id: 'USR-4001',
    name: 'Evelyn Foster',
    role: 'director',
    email: 'director@demo.com',
    phone: '+1 (555) 011-8822',
    status: 'Active',
    lastLogin: '2026-07-20 09:12 AM',
    createdDate: '2022-01-10',
    emergencyContact: 'Arthur Foster (Spouse) - +1 (555) 011-8823'
  },
  {
    id: 'USR-0001',
    name: 'System Admin Console',
    role: 'admin',
    email: 'admin@demo.com',
    phone: '+1 (555) 000-0001',
    status: 'Active',
    lastLogin: '2026-07-20 02:19 AM',
    createdDate: '2020-01-01',
    emergencyContact: 'N/A'
  }
];

export const INITIAL_REGISTRATIONS: OnlineRegistration[] = [
  {
    id: 'REG-2026-001',
    studentName: 'Oliver Smith',
    parentName: 'George Smith',
    parentEmail: 'george.smith@gmail.com',
    parentPhone: '+1 (555) 123-4561',
    requestedGrade: 'Grade 9',
    applicationDate: '2026-07-12',
    status: 'pending',
    documents: {
      birthCertificate: 'Submitted',
      previousTranscript: 'Submitted',
      medicalInfo: 'Submitted',
      passportPhoto: 'Missing'
    },
    guardianInfo: 'George Smith (Father) - Real Estate Advisor',
    notes: 'Transferred from out-of-state academy. Academic performance is stellar.'
  },
  {
    id: 'REG-2026-002',
    studentName: 'Sophia Martinez',
    parentName: 'Elena Martinez',
    parentEmail: 'elena.m@martinez-group.co',
    parentPhone: '+1 (555) 123-9900',
    requestedGrade: 'Grade 10',
    applicationDate: '2026-07-15',
    status: 'Needs Documents',
    documents: {
      birthCertificate: 'Submitted',
      previousTranscript: 'Missing',
      medicalInfo: 'Submitted',
      passportPhoto: 'Submitted'
    },
    guardianInfo: 'Elena Martinez (Mother) - Pediatrician',
    notes: 'Requires previous high school academic record. Requested from parent.'
  },
  {
    id: 'REG-2026-003',
    studentName: 'William Chen',
    parentName: 'Xavier Chen',
    parentEmail: 'xavier.chen@techcorp.io',
    parentPhone: '+1 (555) 111-2223',
    requestedGrade: 'Grade 11',
    applicationDate: '2026-07-17',
    status: 'Approved',
    documents: {
      birthCertificate: 'Verified',
      previousTranscript: 'Verified',
      medicalInfo: 'Verified',
      passportPhoto: 'Verified'
    },
    guardianInfo: 'Xavier Chen (Father) - Software Architect',
    notes: 'All documents verified. Pre-enrolled. Awaiting tuition deposit.'
  },
  {
    id: 'REG-2026-004',
    studentName: 'Aria Taylor',
    parentName: 'Diana Taylor',
    parentEmail: 'diana.taylor@edu-design.org',
    parentPhone: '+1 (555) 444-5555',
    requestedGrade: 'Grade 9',
    applicationDate: '2026-07-19',
    status: 'Pending',
    documents: {
      birthCertificate: 'Submitted',
      previousTranscript: 'Submitted',
      medicalInfo: 'Submitted',
      passportPhoto: 'Submitted'
    },
    guardianInfo: 'Diana Taylor (Mother) - Creative Director',
    notes: 'Inquiry submitted. Document files attached.'
  }
];

export const INITIAL_READMISSIONS: StudentReadmission[] = [
  {
    id: 'READM-2026-001',
    studentId: 'USR-2002',
    studentName: 'Lucas Vance',
    previousYear: '2025-2026',
    previousGrade: 'Grade 8',
    previousSection: 'Section B',
    requestedGrade: 'Grade 9',
    readmissionDate: '2026-07-16',
    status: 'Pending',
    reason: 'Continuing standard academic pipeline progression into high school.',
    academicStanding: 'Excellent'
  },
  {
    id: 'READM-2026-002',
    studentId: 'USR-2003',
    studentName: 'Chloe Bennett',
    previousYear: '2025-2026',
    previousGrade: 'Grade 9',
    previousSection: 'Section A',
    requestedGrade: 'Grade 10',
    readmissionDate: '2026-07-18',
    status: 'Approved',
    reason: 'Re-enrolling after taking an approved medical leave semester.',
    academicStanding: 'Good',
    assignedSection: 'Section A'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-1001',
    invoiceNumber: 'INV-2026-001',
    studentId: 'USR-2001',
    studentName: 'Emily Johnson',
    parent: 'Marcus Johnson',
    grade: 'Grade 10',
    section: 'Section A',
    category: 'Tuition',
    amountDue: 2400,
    amountPaid: 2400,
    remainingBalance: 0,
    status: 'Paid',
    method: 'Credit Card',
    reference: 'TXN-99182A',
    paymentDate: '2026-07-10'
  },
  {
    id: 'PAY-1002',
    invoiceNumber: 'INV-2026-002',
    studentId: 'USR-2002',
    studentName: 'Lucas Vance',
    parent: 'David Vance',
    grade: 'Grade 8',
    section: 'Section B',
    category: 'Tuition',
    amountDue: 2400,
    amountPaid: 1200,
    remainingBalance: 1200,
    status: 'Partial',
    method: 'Bank Transfer',
    reference: 'TXN-77112B',
    paymentDate: '2026-07-14'
  },
  {
    id: 'PAY-1003',
    invoiceNumber: 'INV-2026-003',
    studentId: 'USR-2003',
    studentName: 'Chloe Bennett',
    parent: 'Richard Bennett',
    grade: 'Grade 9',
    section: 'Section A',
    category: 'Registration',
    amountDue: 350,
    amountPaid: 0,
    remainingBalance: 350,
    status: 'Unpaid',
    paymentDate: undefined
  },
  {
    id: 'PAY-1004',
    invoiceNumber: 'INV-2026-004',
    studentId: 'USR-2004',
    studentName: 'Noah Peterson',
    parent: 'Karen Peterson',
    grade: 'Grade 11',
    section: 'Section B',
    category: 'Tuition',
    amountDue: 2400,
    amountPaid: 0,
    remainingBalance: 2400,
    status: 'Overdue',
    paymentDate: undefined
  }
];

export const INITIAL_PERMISSIONS: RolePermissions[] = [
  { role: 'director', view: true, create: true, edit: true, delete: false, approve: true, export: true, print: true },
  { role: 'teacher', view: true, create: true, edit: true, delete: false, approve: false, export: false, print: true },
  { role: 'student', view: true, create: false, edit: false, delete: false, approve: false, export: false, print: false },
  { role: 'parent', view: true, create: false, edit: false, delete: false, approve: false, export: false, print: true },
  { role: 'admin', view: true, create: true, edit: true, delete: true, approve: true, export: true, print: true }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-8801',
    user: 'System Admin Console (Admin)',
    action: 'Reset Student Password for USR-2002',
    module: 'User Management',
    dateTime: '2026-07-20 02:19:35 AM',
    previousValue: 'hashed_sha256_oldpwd',
    updatedValue: 'generated_random_temp_pwd_81a',
    status: 'Success',
    ipAddress: '192.168.10.4'
  },
  {
    id: 'AUD-8802',
    user: 'System Admin Console (Admin)',
    action: 'Approve Admission Application REG-2026-003',
    module: 'Online Registration',
    dateTime: '2026-07-19 11:45:10 AM',
    previousValue: 'Status: Pending',
    updatedValue: 'Status: Approved',
    status: 'Success',
    ipAddress: '192.168.10.4'
  },
  {
    id: 'AUD-8803',
    user: 'Evelyn Foster (Director)',
    action: 'Modify School Calendar Start Date',
    module: 'School Configuration',
    dateTime: '2026-07-19 09:22:15 AM',
    previousValue: '2026-09-01',
    updatedValue: '2026-08-28',
    status: 'Success',
    ipAddress: '10.0.1.12'
  },
  {
    id: 'AUD-8804',
    user: 'System Admin Console (Admin)',
    action: 'Trigger Core DB Backup BKP-091',
    module: 'Backup & Recovery',
    dateTime: '2026-07-20 03:00:00 AM',
    previousValue: 'Scheduled Backup Job',
    updatedValue: 'Backup Snapshot Created (28.4 MB)',
    status: 'Success',
    ipAddress: '127.0.0.1'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-202',
    user: 'Julian Vane',
    role: 'Teacher',
    category: 'Gradebook Error',
    subject: 'Gradebook spreadsheet failing export',
    priority: 'High',
    status: 'Open',
    createdDate: '2026-07-19',
    description: 'When trying to click the CSV export option in Gradebook & Exams, the page reloads and throws a script compile error in the console. Seems related to React 19 typing compatibility.',
    assignedTo: 'Admin Team',
    replies: [
      { id: 'rep-1', sender: 'system', text: 'Ticket successfully created and prioritized as HIGH.', timestamp: '2026-07-19 04:30 PM' }
    ]
  },
  {
    id: 'TCK-201',
    user: 'Evelyn Foster',
    role: 'Director',
    category: 'Hardware',
    subject: 'Smartboard connection in Room 4A unstable',
    priority: 'Medium',
    status: 'Resolved',
    createdDate: '2026-07-18',
    description: 'The wireless projection system keeps disconnect-looping every 12 minutes. Unusable for lessons.',
    assignedTo: 'Facilities Support',
    replies: [
      { id: 'rep-2', sender: 'system', text: 'Ticket logged.', timestamp: '2026-07-18 09:00 AM' },
      { id: 'rep-3', sender: 'admin', text: 'Replaced transmitter dongle with revision 2 device. Tested OK.', timestamp: '2026-07-18 02:15 PM' }
    ]
  },
  {
    id: 'TCK-200',
    user: 'Sarah Jenkins',
    role: 'Teacher',
    category: 'Portal Access',
    subject: 'LMS account credentials reset request',
    priority: 'Low',
    status: 'Resolved',
    createdDate: '2026-07-17',
    description: 'Please reset my developer playground credentials, password expired over the weekend.',
    assignedTo: 'Admin Team',
    replies: [
      { id: 'rep-4', sender: 'admin', text: 'Credentials updated. Check secure mail envelope.', timestamp: '2026-07-17 11:30 AM' }
    ]
  }
];

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  name: 'EduCore International Academy',
  logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=80',
  address: '1022 West Oak Avenue, Sector 4, Silicon Valley',
  phone: '+1 (555) 019-1000',
  email: 'administration@educore-academy.com',
  website: 'www.educore-academy.org',
  academicCalendar: 'Semester',
  language: 'English (US)',
  currency: 'USD ($)',
  timezone: 'America/Los_Angeles (PST)',
  attendanceCutoff: '08:15 AM',
  passingScore: 65,
  primaryColor: '#3b82f6' // TailWind Blue 500
};
