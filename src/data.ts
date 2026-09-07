/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeatureItem, SystemModule, Testimonial, FAQItem, UserCredential } from './types';

export const MOCK_CREDENTIALS: Record<string, UserCredential> = {
  director: {
    email: 'director@demo.com',
    role: 'director',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    schoolName: 'Oakridge International Academy'
  },
  teacher: {
    email: 'teacher@demo.com',
    role: 'teacher',
    name: 'Prof. Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    schoolName: 'Oakridge International Academy'
  },
  student: {
    email: 'student@demo.com',
    role: 'student',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    schoolName: 'Oakridge International Academy'
  },
  parent: {
    email: 'parent@demo.com',
    role: 'parent',
    name: 'Eleanor Rivera',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    schoolName: 'Oakridge International Academy'
  },
  admin: {
    email: 'admin@demo.com',
    role: 'admin',
    name: 'Robert Chen, Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    schoolName: 'Oakridge International Academy'
  }
};

export const FEATURES: FeatureItem[] = [
  {
    id: 'admissions',
    title: 'Smart Admissions',
    description: 'Fully automated, paperless inquiry, enrollment pipeline, and custom application workflows with real-time tracking.',
    iconName: 'UserCheck',
    category: 'core'
  },
  {
    id: 'student_management',
    title: 'Student 360° Portal',
    description: 'Centralized profiles capturing academics, health cards, conduct histories, timeline events, and achievements.',
    iconName: 'Users',
    category: 'core'
  },
  {
    id: 'teacher_management',
    title: 'Teacher Planner',
    description: 'Empower educators with interactive lesson builders, auto-substitution routing, and professional records tracker.',
    iconName: 'GraduationCap',
    category: 'core'
  },
  {
    id: 'attendance_tracking',
    title: 'AI Attendance',
    description: 'Biometric, RFID, or tap-to-record systems triggering immediate, automated notifications to guardians.',
    iconName: 'Clock',
    category: 'academic'
  },
  {
    id: 'exam_grades',
    title: 'Report Cards & Exams',
    description: 'Advanced gradebook engine supporting custom CBAs, GPA weights, continuous assessments, and rapid report generation.',
    iconName: 'FileSpreadsheet',
    category: 'academic'
  },
  {
    id: 'finance',
    title: 'Fee & Billing Hub',
    description: 'Secure, automated fee schedules with direct payment gateways, digital invoices, and split parent structures.',
    iconName: 'CreditCard',
    category: 'management'
  },
  {
    id: 'parent_portal',
    title: 'Parent Connect Pro',
    description: 'Dedicated web/mobile workspace syncing live homework lists, report cards, calendar updates, and messaging.',
    iconName: 'HeartHandshake',
    category: 'management'
  },
  {
    id: 'library',
    title: 'Digital Library',
    description: 'Barcode-powered book tracking, automatic fine computations, and catalogs linked to online study material.',
    iconName: 'BookOpen',
    category: 'utility'
  },
  {
    id: 'transportation',
    title: 'Live Bus Tracking',
    description: 'Real-time GPS bus tracking, customized route definitions, driver speed logs, and student check-ins.',
    iconName: 'Bus',
    category: 'utility'
  },
  {
    id: 'hostel',
    title: 'Hostel Manager',
    description: 'Warden logs, room allocations, guest trackers, custom dietary rosters, and maintenance ticketing.',
    iconName: 'Home',
    category: 'utility'
  },
  {
    id: 'communication',
    title: 'Unified Messenger',
    description: 'Bulk SMS, automated emails, app alerts, and group channels allowing instant safe workspace conversations.',
    iconName: 'MessageSquare',
    category: 'core'
  },
  {
    id: 'analytics',
    title: 'Executive Insights',
    description: 'Dynamic administrative tables tracking drop-out trends, fee arrears, subject competencies, and cohort performance.',
    iconName: 'BarChart3',
    category: 'management'
  }
];

export const SYSTEM_MODULES: SystemModule[] = [
  {
    id: 'director',
    title: 'Executive Director',
    role: 'director',
    description: 'Oversee multi-branch school analytics, institutional budgets, employee churn rates, and high-level KPIs from a unified hub.',
    features: ['Arrears Tracking', 'Performance Matrix', 'Strategic Budgets', 'Cross-Campus Logs'],
    iconName: 'Building2'
  },
  {
    id: 'principal',
    title: 'School Principal',
    role: 'principal',
    description: 'Lead educational initiatives with instant reviews of teacher logs, grade distribution bell curves, and campus safety logs.',
    features: ['Curriculum Milestones', 'Teacher Substitutes', 'Student Incidents', 'Admissions Audit'],
    iconName: 'Award'
  },
  {
    id: 'teacher',
    title: 'Educator & Coach',
    role: 'teacher',
    description: 'Simplify classroom operations. Take attendance in 3 clicks, record grades instantly, and distribute multimedia learning guides.',
    features: ['Lesson Plans', 'Interactive Gradebook', 'Homework Hub', 'Parent Messages'],
    iconName: 'BookOpenText'
  },
  {
    id: 'student',
    title: 'The Modern Student',
    role: 'student',
    description: 'Empower student autonomy with personal dashboards detailing academic plans, live schedules, submissions, and feedback.',
    features: ['Assignment Submissions', 'Exam Schedules', 'Extra-Curriculars', 'Grade History'],
    iconName: 'Sparkles'
  },
  {
    id: 'parent',
    title: 'Informed Guardian',
    role: 'parent',
    description: 'Build confidence in your child’s educational path. View live performance scores, process fee dues, and chat with teachers.',
    features: ['Fee Ledger', 'Attendance Signals', 'Direct Teacher Chat', 'Progress Tracker'],
    iconName: 'Heart'
  },
  {
    id: 'admin',
    title: 'System Administrator',
    role: 'admin',
    description: 'Direct corporate accounts receivable, coordinate campus operations, manage user roles, and monitor system integrations.',
    features: ['Role Security Control', 'System Integrity', 'Fee Billing Sync', 'Enterprise Logins'],
    iconName: 'Shield'
  },
  {
    id: 'reception',
    title: 'Campus Receptionist',
    role: 'reception',
    description: 'Streamline the front desk with gate visitor passes, dynamic telephone logs, appointment books, and delivery alerts.',
    features: ['Visitor Check-Ins', 'Courier Roster', 'Admission Enquiries', 'Phone Logs'],
    iconName: 'PhoneCall'
  },
  {
    id: 'librarian',
    title: 'Librarian',
    role: 'librarian',
    description: 'Maintain the catalog of physical books, manage reservation queues, and suggest online reading lists.',
    features: ['E-Resource Catalog', 'RFID Card Checkouts', 'Late Fee Calculator', 'Inventory Audit'],
    iconName: 'BookOpen'
  },
  {
    id: 'transport',
    title: 'Transport Coordinator',
    role: 'transport',
    description: 'Ensure student safety. Route and track active vehicles, monitor fuel efficiency, and dispatch emergency safety updates.',
    features: ['Live GPS Tracking', 'Driver Licenses', 'Fuel Analytics', 'Parent Broadcaster'],
    iconName: 'Compass'
  },
  {
    id: 'hr',
    title: 'HR Manager',
    role: 'hr',
    description: 'Govern talent lifecycles. Automate recruiter tracking, configure custom leave policies, and analyze performance appraisals.',
    features: ['Leave Calendars', 'Appraisal Flowcharts', 'Payroll Metadata', 'Candidate Tracker'],
    iconName: 'UserCog'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sister Mary Teresa',
    role: 'Managing Director',
    school: 'St. Augustine Collegiate',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    quote: 'EduCore transformed our operations. We dropped manual ledger logging, reducing our billing error rates by 95% and boosting parent trust to an all-time high.',
    rating: 5
  },
  {
    id: '2',
    name: 'Dr. Arthur Sterling',
    role: 'Principal',
    school: 'Wellington Science Academy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'The executive insight dashboard lets us manage both branches effortlessly. Curriculum tracking and teacher replacements take minutes instead of stressful hours.',
    rating: 5
  },
  {
    id: '3',
    name: 'Samantha Jenkins',
    role: 'PTA President & Mother of Two',
    school: 'Oakridge International Academy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'Being able to verify my children’s daily arrival alerts, view homework due times, and make prompt secure card payments from my phone is an absolute game changer.',
    rating: 5
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How long does a complete campus rollout take?',
    answer: 'Standard school setup and data import (students, teachers, classes) are completed in 3 to 5 business days. Our dedicated customer success team manages the transition of your historical database securely.',
    category: 'implementation'
  },
  {
    question: 'Is student records data secure and compliant?',
    answer: 'Absolutely. EduCore runs on fully encrypted, containerized databases complying with FERPA, GDPR, and regional student privacy directives. Data is encrypted in transit using TLS 1.3 and at rest with AES-256.',
    category: 'security'
  },
  {
    question: 'Can parents pay fees online with split structures?',
    answer: 'Yes! Our billing module allows customized payment structures and supports all major credit/debit cards, bank drafts, and instant online transfers. Receipts are generated instantly and parent accounts auto-balanced.',
    category: 'finance'
  },
  {
    question: 'Does the system continue working if internet connectivity is unstable?',
    answer: 'Yes, our mobile apps support core offline activities. Teachers can register grades and attendance offline; databases reconcile automatically when a stable signal is re-established.',
    category: 'technical'
  },
  {
    question: 'Are there custom portals for students of different ages?',
    answer: 'Yes. The student dashboard shifts visually. Elementary schoolers receive a gamified, parent-supervised interface, whereas high school and university students utilize our pro academic portal.',
    category: 'experience'
  }
];
