/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Lazy-load the dictionary to improve initial load performance
let AMHARIC_DICTIONARY: Record<string, string> | null = null;
let dictionaryLoadPromise: Promise<void> | null = null;

const loadAmharicDictionary = (): Promise<void> => {
  if (AMHARIC_DICTIONARY) return Promise.resolve();
  if (dictionaryLoadPromise) return dictionaryLoadPromise;
  
  dictionaryLoadPromise = new Promise((resolve) => {
    // Simulate async loading - in production this could be from a separate file
    setTimeout(() => {
      AMHARIC_DICTIONARY = {
  // Navigation / Auth
  'Home': 'ዋና ገጽ',
  'Features': 'ባህሪያት',
  'Modules': 'ሞጁሎች',
  'About Us': 'ስለ እኛ',
  'Contact': 'ያግኙን',
  'Dashboard': 'ዳሽቦርድ',
  'Sign In': 'ይግቡ',
  'Login': 'ግባ',
  'Logout': 'ውጣ',
  'Forgot Password': 'የይለፍ ቃል ረሱ?',
  'Theme': 'ገጽታ',
  'Language': 'ቋንቋ',
  'English': 'English',
  'Amharic': 'አማርኛ',
  'Workspace': 'የስራ ቦታ',
  'Settings': 'ቅንብሮች',
  'Preferences': 'ምርጫዎች',
  'Profile': 'መገለጫ',
  'Launch Portal': 'ወደ ፖርታል ግባ',
  'Search': 'ፈልግ',
  'Search here...': 'እዚህ ይፈልጉ...',
  'Search logs...': 'ምዝግቦችን ይፈልጉ...',
  'Select Role': 'ሚና ይምረጡ',
  'Cancel': 'ሰርዝ',
  'Save': 'አስቀምጥ',
  'Save Changes': 'ለውጦችን አስቀምጥ',
  'Edit': 'አስተካክል',
  'Delete': 'ሰርዝ',
  'Confirm': 'አረጋግጥ',
  'Verify': 'አረጋግጥ',
  'Details': 'ዝርዝሮች',
  'Download': 'አውርድ',
  'Print': 'አትም',
  'Status': 'ሁኔታ',
  'Actions': 'እርምጃዎች',
  'Submit': 'አስገባ',
  'Missing': 'የጎደለ',
  'Submitted': 'የገባ',
  'Verified': 'የተረጋገጠ',
  'Approved': 'የጸደቀ',
  'Rejected': 'የተሰረዘ',
  'Pending': 'በመጠባበቅ ላይ',
  'Paid': 'የተከፈለ',
  'Unpaid': 'ያልተከፈለ',
  'Active': 'ንቁ',
  'Inactive': 'ንቁ ያልሆነ',

  // Landing Page - Hero Section
  'Online Registration': 'በመስመር ምዝገባ',
  'Portal Sign In': 'ወደ ፖርታል ግባ',
  'Colleges & Schools': 'ኮሌጆች እና ትምህርት ቤቶች',
  'Active Students': 'ንቁ ተማሪዎች',
  'Educators': 'መምህራን',
  'Uptime SLA': 'የአገልገል ጊዜ',
  '98.4% Retention': '98.4% ተማሪዎች መቆየት',
  'Continuous Growth': 'የቀጣይ እድገት',
  'FERPA Compliant': 'FERPA የሚያሟላ',
  'Federal Data Safety': 'የፌዴራል የውሂብ ደህንነት',

  // Landing Page - Trusted Schools
  'Trusted by Leading Educational Institutions': 'በዋና ዋና የትምህርት ተቋማት የታመነ',

  // Landing Page - Features Section
  'Everything Your School Needs': 'ትምህርት ቤትዎ የሚፈልግ ሁሉ',
  'Eliminate operational overhead. Our cohesive modular architecture covers every administrative division, ensuring seamless multi-user collaboration.': 'የክንውኖች ጫናን ቀንሱ። የእኛ የተዋሃደ ሞጁላር አርክቴክቸር ለእያንዳንዱ የአስተዳደር ክፍል ያሸበያል፣ ይህም ረቂቅ የበርካታ ተጠቃሚ ትብብርን ያረጋግጣል።',
  'All Modules': 'ሁሉም ሞጁሎች',
  'Core & Ops': 'ዋና እና ክንውኖች',
  'Academics': 'ትምህርት',
  'Management': 'አስተዳደር',
  'Auxiliary Support': 'የእርዳን ድጋፍ',
  'Learn more': 'ተጨማሪ ይወቱ',

  // Landing Page - System Modules
  'Enterprise Hierarchy': 'የኢንተርፕራይዝ ህየት',
  'Role-Based Campus Terminals': 'በሚና የተመሰረተ የግቢ ተርሚናሎች',
  'Every user receives a customized, highly targeted workspace dashboard to complete daily tasks efficiently, synced live across the network.': 'እያንዳንዱ ተጠቃሚ የዕለት ተግባራትን በፍጥነት ለማጠናቀቅ የተለጠነ የስራ ቦታ ዳሽቦርድ ይቀበላል፣ ይህም በኔትወርክ በቀጥታ ይስማማል።',
  'Launch Module': 'ሞጁሉን ጀምር',

  // Landing Page - Dashboard Preview
  'Designed for Desktop & Mobile Autonomy': 'ለዴስክቶፕ እና ለሞባይል የተነደፈ',
  'Beautiful responsive layouts that adapt from professional desktop ledger monitors down to real-time phone check-ins for parents on the move.': 'ከፕሮፌሽናል ዴስክቶፕ ሞኒተሮች እስከ ለሚንቀሱ ወላጆች የቀጥታ ስልክ መግቢያ ድረስን የሚስማማ ውበቃዊ አቀማመጥ።',
  'DAILY ATTENDANCE': 'የዕለት መገኘት',
  '96.4% Recorded': '96.4% የተመዘገበ',
  'All classes submitted safely.': 'ሁሉም ክፍሎች በደህንነት ተልከዋል።',
  'RECENT DISPATCHES': 'የቅርብ ጊዜ መልዕክቶች',
  'Bus #4 Gate Arrival': 'ባስ #4 በበበኛ መግቢያ',
  'Just Now': 'አሁን',
  'Grade Card: Class 12-A': 'የውጤት ካርድ፡ ክፍል 12-A',
  '15m ago': 'ከ15 ደቂቃዎች በፊት',

  // Landing Page - Why Choose Us
  'Cloud-Based Scalability': 'በደመና ላይ የተመሠረተ ማስፈራረት',
  'No on-premise server maintenance. Expand dynamically from one branch to district level instantly.': 'የቦታዊ ሰርቨር ጥገና የለም። ከአንድ ቅርን ወደ ወረዳ ደረጃ በአንድ ጊዜ ይስፋፋል።',
  'Role-Based Cyber Security': 'በሚና የተመሰረተ ሳይበር ደህንነት',
  'Multi-factor login and custom workspace levels guarantee strict compliance with FERPA & GDPR regulations.': 'ባለ-ክርክር መግቢያ እና የተለጠነ የስራ ቦታ ደረጃዎች ከFERPA እና GDPR መመሪያዎች ጋር ጠንካራ ተስማም ያረጋግጣሉ።',
  'Real-Time Insights & Reports': 'የቀጥታ ማስታወሻዎች እና ሪፖርቶች',
  'Dynamically generated accounting sheets, pupil attendance counters, and subject competency curves.': 'በዲናሚክ የሚፈጠሩ የፋይናንስ ወረቀቶች፣ የተማሪ መገኘት ካውንተሮች እና የዕውቀት ትርጉማዎች።',
  'Blazing Fast Performance': 'ፍጥነት ያለው አፈጻጸም',
  'Containerized, edge-optimized servers deliver millisecond responses on grade registration and checkouts.': 'በኮንቴኔር የተያዙ እና በኤጅ የተሻሻሉ ሰርቨሮች ለውጤት ምዝገባ እና መውጫ በሚሊሰከንድ ምላሽ ይሰጣሉ።',
  'Automatic Encryption Backups': 'ራስ-ሰር መመስጠጫ ምትኬዎች',
  'Daily database captures are mirrored across isolated server networks for absolute recovery confidence.': 'የዕለታዊ ዳታቤዝ ቅጂዎች በተለያዩ ሰርቨር ኔትወርኮች ይከተራሉ፣ ይህም ለጠናንቆ ማስተካከል እርምጃ ይሰጣል።',
  'Sleek Aesthetic Design': 'ውበቃዊ ዲዛይን',
  'A minimalist user interface pairing clean spacing and typography reduces visual strain for busy registrars.': 'የቀላሚ ክፍተት እና የጽሑፍ አሰራርባ ያለው የተጠቃሚ በይነገጽ ለብሻጊ ሪጂስትራሮች የዓይን ጫናን ይቀንሳል።',
  'Continuous Security Audit': 'የቀጣይ ደህንነት ኦዲት',
  'We monitor every token check, financial gateway connection, and file drop to ensure your historical student database remains perfectly safe and encrypted at rest and in motion.': 'የእያንዳንዱን ቶክን ማረጋገጫ፣ የፋይናንስ ጌትዌይ አገናኝ እና የፋይል ማውረድ እንቆጥራለን፣ ይህም የታሪያው የተማሪ ዳታቤዝ በሙሉ ደህንነት የተጠበቀ እና በማንኛም ጊዜ የተመሰጠ እንዲሆን እናስታርቃለን።',
  'AES-256': 'AES-256',
  'Locker Encryption': 'የመደብር መመስጠጫ',
  '99.9%': '99.9%',
  'Uptime Promise': 'የአገልገል ቃል ኪዳን',
  'An Institutional Standard Schools Can Trust': 'የተቋማት መደብ የትምህርት ቤቶች የሚታመኑበት',
  'Built hand-in-hand with veteran educators and administrative auditors, EduCore streamlines institutional work without the friction of outdated software.': 'ከወጣቶች መምህራን እና ከአስተዳደር ኦዲተሮች ጋር በአንድነት የተሰራ፣ EduCore ከወደተወጠረ ሶፍትዌር ችግር ሳይኖር የተቋማት ስራን ያቀላል።',

  // Landing Page - How It Works
  'Seamless Campus Digitalization': 'ገጽታ የሌላ የግቢ ዲጂታላይዜሽን',
  'Our specialized migration team coordinates your databases safely, ensuring zero lecture disruptions during rollout.': 'የእኛ የተለየ የማስተላለፍ ቡድን ዳታቤዝዎን በደህንነት ያደርድራል፣ ይህም በማስተላለፍ ጊዜ ምንም የትምህርት ማቋረጫ እንዳይኖር ያረጋግጣል።',
  'Register Your Institution': 'ተቋማትዎን ይመዝግቡ',
  'Securely register your academy, upload existing rosters, and establish initial administrative divisions.': 'አካዳሚዎን በደህንነት ይመዝግቡ፣ ያሉትን ዝርዝሮች ያስርቁ፣ እና የመጀመሪያውን የአስተዳደር ክፍሎች ያዋቅሩ።',
  'Configure Your Campus': 'ግቢዎን ዋትዉት',
  'Map classroom capacities, define customized grading GPA schemas, and establish billing fee cycles.': 'የክፍል አቅምን ያስወጡ፣ የተለጠነ የውጤት GPA ስኬሞችን ይወስኑ፣ እና የክፍያ ዑደቶችን ያዋቅሩ።',
  'Manage Everything Digitally': 'ሁሉንም በዲጂታል ያስተዳድሩ',
  'Instructors record scores, billing triggers, and students sync tasks via a single cohesive ecosystem.': 'መምህራን ውጤቶችን ይመዘግባሉ፣ የክፍያ ማስታወሻዎች ይነቃቃሉ፣ እና ተማሪዎች በአንድ የተዋሃደ ኢኮሲስተም ተግባራትን ይስማማሉ።',

  // Landing Page - Testimonials
  'Institutional Feedback': 'የተቋማት አስተያየት',
  'What directors, parents, and principals report': 'ምን ያስረዱ ዳይሬክተሮች፣ ወላጆች እና ዋና መምህራን',

  // Landing Page - FAQ
  'Frequently Asked Queries': 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች',
  'Review core answers regarding onboarding, encryption protocols, and administrative operations.': 'ስለ ማስተላላፍ፣ ስለ መመስጠጫ ፕሮቶኮሎች እና ስለ አስተዳደር ክንውኖች ዋና መልሶችን ይመልከቱ።',

  // Landing Page - CTA
  'Ready to Modernize Your School?': 'ትምህርት ቤትዎን ለማሰራተት ዝግጁ ነዎት?',
  'Unlock paperless admissions, custom lesson planners, direct guardian billing pipelines, and complete administrative integrity today.': 'ያለ ወረቀት መግቢያ፣ የተለጠነ የትምህርት አቅድጃ ገበታ፣ የቀጥታ ወላጅ ክፍያ መንገድ እና ሙሉ የአስተዳደር ንጹህነት ዛሬ ይክፈቱ።',
  'Launch System Portal': 'የስርዓት ፖርታልን ጀምር',
  'Schedule Private Demo': 'የግል ሙከራ ይስዕዙ',

  // Roles
  'Student': 'ተማሪ',
  'Teacher': 'መምህር',
  'Admin': 'አስተዳዳሪ',
  'Parent': 'ወላጅ',
  'Director': 'ዳይሬክተር',
  'System Administrator': 'የስርዓት አስተዳዳሪ',
  'Academic Director': 'የትምህርት ዳይሬክተር',
  'Secondary Teacher': 'የሁለተኛ ደረጃ መምህር',
  'Primary Parent Representative': 'የወላጅ ተወካይ',
  'Senior High Student': 'የከፍተኛ ሁለተኛ ደረጃ ተማሪ',

  // Landing Page Text
  'Next-Gen Campus Intelligence': 'የቀጣይ ትውልድ ካምፓስ ብልህነት',
  'Transform Your School': 'ትምህርት ቤትዎን ይቀይሩ',
  'Into a Smart Campus': 'ወደ ዘመናዊ ግቢ',
  'Manage admissions, automated billing pipelines, grading cards, live schedules, and campus communication from one highly responsive, centralized secure platform.': 'የመግቢያ ምዝገባን፣ አውቶማቲክ ክፍያን፣ የክፍል ካርዶችን፣ የቀጥታ መርሃግብሮችን እና የግቢውን ግንኙነት በአንድ ከፍተኛ ምላሽ ሰጪ እና ማዕከላዊ ደህንነቱ የተጠበቀ መድረክ ያስተዳድሩ።',
  'Reliable, flexible, high performance and speed for smartphones.': 'ለስማርትፎኖች አስተማማኝ፣ ተለዋዋጭ፣ ከፍተኛ አፈጻጸም እና ፍጥነት ያለው።',
  'Trusted by Leading Schools': 'በዋና ዋና ትምህርት ቤቶች የታመነ',
  'Comprehensive Modules for Every Role': 'ለእያንዳንዱ ሚና የሚሆኑ አጠቃላይ ሞጁሎች',
  'Explore interactive workspace configurations designed for administrators, academic directors, teachers, parents, and students.': 'ለአስተዳዳሪዎች፣ ለትምህርት ዳይሬክተሮች፣ ለመምህራን፣ ለወላጆች እና ለተማሪዎች የተነደፉ በይነተገናኝ የስራ ቦታዎችን ያስሱ።',
  'Manage Your Entire School': 'ሙሉውን ትምህርት ቤትዎን ያስተዳድሩ',
  'From One Powerful Platform': 'ከአንድ ኃይለኛ መድረክ',
  'A secure cloud-based platform that connects directors, administrators, teachers, students, and parents in one intelligent system.': 'ዳይሬክተሮችን፣ አስተዳዳሪዎችን፣ መምህራንን፣ ተማሪዎችንእና ወላጆችን በአንድ ብልህ ስርዓት ውስጥ የሚያገናኝ ደህንነቱ የተጠበቀ በደመና ላይ የተመሠረተ መድረክ።',
  'Remember Me': 'አስታውሰኝ',
  'Demo Accounts Sandbox': 'የሙከራ መለያዎች',
  'Use the following accounts to explore different dashboards. Click copy to fill and sync instantly.': 'የተለያዩ የስራ ገጾችን ለማየት የሚከተሉትን መለያዎች ይጠቀሙ። ለመሙላት ቅጂ የሚለውን ይጫኑ።',
  'Enter your email address': 'የኢሜል አድራሻዎን ያስገቡ',
  'Enter your password': 'የይለፍ ቃልዎን ያስገቡ',
  'Authenticating Secure Sandbox...': 'ደህንነቱ የተጠበቀ መለያ በመግባት ላይ...',
  'Email Address is required': 'የኢሜል አድራሻ ያስፈልጋል',
  'Password is required': 'የይለፍ ቃል ያስፈልጋል',
  'Email': 'ኢሜል',
  'Password': 'የይለፍ ቃል',

  // General Dashboard Metrics / Labels
  'Total Students': 'ጠቅላላ ተማሪዎች',
  'Active Teachers': 'ንቁ መምህራን',
  'Active Staff': 'ንቁ ሰራተኞች',
  'Attendance Rate': 'የመገኘት መጠን',
  'Overall Average Grade': 'አጠቃላይ አማካኝ ውጤት',
  'Admissions Application Rate': 'የማመልከቻዎች መጠን',
  'Outstanding Fees Collected': 'የተሰበሰበ ክፍያ',
  'KPIs & School Metrics': 'የትምህርት ቤት ቁልፍ መለኪያዎች',
  'Academic Performance': 'የትምህርት አፈጻጸም',
  'Strategic Decisions': 'ስትራቴጂካዊ ውሳኔዎች',
  'Financial Auditing': 'የፋይናንስ ኦዲት',
  'System Logs': 'የስርዓት ምዝግብ ማስታወሻዎች',
  'Admissions & Billing Node': 'የመግቢያ እና የክፍያ ክፍል',
  'Academics & Gradebook': 'የትምህርት እና የውጤት መዝገብ',
  'Campus Community & Staff': 'የግቢው ማህበረሰብ እና ሰራተኞች',
  'Strategic Directives': 'ስትራቴጂካዊ መመሪያዎች',
  'User Profile Settings': 'የተጠቃሚ መገለጫ ቅንብሮች',
  'Profile Details': 'የመገለጫ ዝርዝሮች',
  'Notification Preferences': 'የማሳወቂያ ምርጫዎች',

  // Admin Workspace Tabs & Pages
  'Academics': 'ትምህርት',
  'Admissions': 'መግቢያ',
  'Billing': 'ክፍያ',
  'Staff': 'ሰራተኞች',
  'Overview': 'አጠቃላይ እይታ',
  'Admissions & Enrollment': 'መግቢያ እና ምዝገባ',
  'Tuition & Billing Pipelines': 'የትምህርት ክፍያ እና የክፍያ መንገዶች',
  'Staff Directories': 'የሰራተኞች ማውጫ',
  'Student Records': 'የተማሪዎች መዝገብ',

  // Teacher Workspace
  'Gradebook': 'የውጤት መዝገብ',
  'Attendance': 'አቴንዳንስ/መገኘት',
  'Lesson Plans': 'የትምህርት ዕቅዶች',
  'Messaging': 'መልዕክቶች',
  'Active Classes': 'ንቁ ክፍሎች',
  'Grades Pending': 'በመጠባበቅ ላይ ያሉ ውጤቶች',
  'Weekly Lessons': 'ሳምንታዊ ትምህርቶች',
  'Recent Messages': 'የቅርብ ጊዜ መልዕክቶች',
  'Publish Grades': 'ውጤቶችን አውጣ',
  'Take Attendance': 'አቴንዳንስ ውሰድ',
  'Create Lesson': 'ትምህርት ፍጠር',
  'Compose Message': 'መልዕክት ጻፍ',

  // Student Workspace
  'Assignments': 'የቤት ስራ እና ተግባራት',
  'Schedule': 'መርሐግብር',
  'Report Card': 'ሪፖርት ካርድ',
  'My Assignments': 'የእኔ ተግባራት',
  'Upcoming Tests': 'የሚመጡ ፈተናዎች',
  'Today\'s Classes': 'የዛሬ ክፍሎች',
  'Completed homework': 'የተጠናቀቀ የቤት ስራ',
  'Grades': 'ውጤቶች',

  // Parent Workspace
  'My Children': 'ልጆቼ',
  'Fee Statements': 'የክፍያ መግለጫዎች',
  'Direct Messenger': 'ቀጥታ መልእክተኛ',
  'Outstanding Dues': 'ያልተከፈለ ክፍያ',
  'Tuition Invoice': 'የክፍያ ደረሰኝ',
  'Pay Invoice': 'ክፍያ ይክፈሉ',
  'Contact Teacher': 'መምህሩን ያግኙ',

  // Director Workspace
  'Executive KPI Terminal': 'አስፈፃሚ የውጤት ተርሚናል',
  'Strategic Directive Console': 'ስትራቴጂካዊ መመሪያ መቆጣጠሪያ',
  'Consolidated Auditing Platform': 'የተዋሃደ የኦዲት መድረክ',
  'Live System Security Logs': 'የቀጥታ ስርዓት ደህንነት ምዝግብ ማስታወሻዎች',
  'Academic Performance Index': 'የትምህርት አፈጻጸም መረጃ ጠቋሚ',
  'Retention Target Status': 'የተማሪዎች ማቆየት ሁኔታ',
  'Operations Budget Node': 'የክንውኖች በጀት ክፍል',
  'Infrastructure Security Log': 'የመሠረተ ልማት ደህንነት ምዝግብ',

  // Preferences & Profile
  'Customize Language': 'ቋንቋን ያብጁ',
  'Choose your preferred language for the system.': 'ለስርዓቱ የመረጡትን ቋንቋ ይምረጡ።',
  'Change System Language': 'የስርዓት ቋንቋ ይቀይሩ',
  'Enable Push Notifications': 'የፑሽ ማሳወቂያዎችን ፍቀድ',
  'Get real-time updates for assignments, billing events, and security logs.': 'ለተግባራት፣ ለክፍያ ክስተቶች እና ለደህንነት ምዝግቦች የእውነተኛ ጊዜ ዝማኔዎችን ያግኙ።',
  'Dark Mode Theme': 'የጨለማ ሁነታ ገጽታ',
  'Toggle the system-wide visual canvas styling.': 'በስርዓቱ አቀፍ ላይ ያለውን የእይታ ገጽታ ይለውጡ።',
  'Preferred Mode': 'ተመራጭ ሁነታ',
  'System Preferences': 'የስርዓት ምርጫዎች',
  'Profile Settings': 'የመገለጫ ቅንብሮች',
  'Update Account Details': 'የመለያ ዝርዝሮችን ያዘምኑ',
  'Full Name': 'ሙሉ ስም',
  'Email Address': 'የኢሜል አድራሻ',
  'Contact Number': 'የስልክ ቁጥር',
  'Emergency Contact': 'የአደጋ ጊዜ ጥሪ',
  'Residential Address': 'የመኖሪያ አድራሻ',
  'Update Security Credentials': 'የደህንነት ማስረጃዎችን ያዘምኑ',
  'Current Password': 'የአሁኑ የይለፍ ቃል',
  'New Password': 'አዲስ የይለፍ ቃል',
  'Two-Factor Authentication': 'ባለሁለት ደረጃ ማረጋገጫ',

  // Common Dialogs & Toasts
  'Notification': 'ማሳወቂያ',
  'Preferences Saved': 'ምርጫዎች ተቀምጠዋል',
  'Your profile settings have been successfully updated.': 'የመገለጫ ቅንብሮችዎ በተሳካ ሁኔታ ተዘምነዋል።',
  'System language switched to Amharic': 'የስርዓት ቋንቋ ወደ አማርኛ ተቀይሯል',
  'System language switched to English': 'የስርዓት ቋንቋ ወደ እንግሊዝኛ ተቀይሯል',
  'Profile updated successfully!': 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!',
  'Welcome back': 'እንኳን ደህና መጡ',

  // Extra Details for Admissions Billing
  'Admissions Document Audit': 'የመግቢያ ሰነድ ኦዲት',
  'Required Verification Steps': 'የሚያስፈልጉ የማረጋገጫ ደረጃዎች',
  'Cryptographic Hash and Scan Details': 'የምስጠራ ሃሽ እና የስካን ዝርዝሮች',
  'File Name': 'የፋይል ስም',
  'File Size': 'የፋይል መጠን',
  'Upload Node': 'የተሰቀለበት ቦታ',
  'Date Received': 'የደረሰበት ቀን',
  'Digest (SHA-256)': 'ዲጀስት (SHA-256)',
  'Antivirus Check': 'የቫይረስ ምርመራ',
  'Simulated Document Snapshot Preview': 'የተመሰለ የሰነድ ቅጽበታዊ እይታ',
  'Certificate of Live Birth': 'የልደት ምስክር ወረቀት',
  'STATE REGISTRY OF VITAL STATISTICS': 'የክልል ወሳኝ ስታቲስቲክስ መዝገብ',
  'This certifies that': 'ይህ ያረጋግጣል',
  'was born at': 'ተወለደ በ',
  'Place of Birth': 'የልደት ቦታ',
  'Parent Account Signature': 'የወላጅ መለያ ፊርማ',
  'REGISTRAR SEAL VALID': 'የሬጅስትራር ማህተም ትክክለኛ ነው',
  'Pre-Admissions Academic Record': 'የመግቢያ ቅድመ ትምህርት መዝገብ',
  'GRADE LEVEL 9 ASSESSMENT MATRIX': 'የክፍል 9 ግምገማ ማትሪክስ',
  'PASS RECORD': 'ያለፈበት መዝገብ',
  'Syllabus Subject Course': 'የትምህርት ዓይነት',
  'Score Grade': 'ውጤት/ደረጃ',
  'Outcome': 'ውጤት',
  'Cumulative GPA': 'አጠቃላይ የውጤት አማካይ (GPA)',
  'Verified Registrar Stamp': 'የተረጋገጠ የሬጅስትራር ማህተም',
  'Immunization Record & Clearance': 'የክትባት መዝገብ እና ፈቃድ',
  'COMPLIANT WITH LOCAL HEALTH STATUTES': 'ከአካባቢው የጤና ህጎች ጋር የሚስማማ',
  'APPROVED': 'የጸደቀ',
  'Biometric Photo Evaluation': 'የባዮሜትሪክ ፎቶ ግምገማ',
  'COMPLIANT REGULATION PASSPORT SPECIFICATIONS': 'የፓስፖርት መመዘኛዎችን የሚያሟላ',
  'Biometric Alignment': 'የባዮሜትሪክ አሰላለፍ',
  'Luminance & Contrast': 'የብርሃን እና የንፅፅር ሁኔታ',
  'Chromatic Balance': 'የቀለም ሚዛን',
  'Digital Frame Output': 'ዲጂታል የክፈፍ ውጤት',
  'Download / Print Copy': 'ቅጂውን አውርድ / አትም',
  'Close Audit': 'ኦዲት ዝጋ',
  'Verify & Approve File': 'ሰነዱን አረጋግጥ እና አጽድቅ',
  'Un-verify Document': 'ሰነዱን ከማረጋገጫ ውጭ አድርግ',
  'System Language Preference': 'የስርዓት ቋንቋ ምርጫ',
  'Profile & Preferences': 'መገለጫ እና ምርጫዎች',
  'Configure your personal information, security guidelines, and communications preferences.': 'የግል መረጃዎን፣ የደህንነት መመሪያዎችን እና የግንኙነት ምርጫዎችዎን ያዋቅሩ።',
  'Administrative Inbox': 'የአስተዳደር መልዕክት ሳጥን',
  'Open Full Communicator': 'ሙሉውን መገናኛ ይክፈቱ',
  'System Notifications': 'የስርዓት ማሳወቂያዎች',
  'Mark read': 'የተነበበ ምልክት አድርግ',
  'View All Notifications': 'ሁሉንም ማሳወቂያዎች ይመልከቱ',
  'My Profile details': 'የእኔ መገለጫ ዝርዝሮች',
  'Secure preferences': 'ደህንነቱ የተጠበቀ ምርጫዎች',
  'Sign Out of Portal': 'ከፖርታል ውጡ',
  'New': 'አዲስ',

  // Registration Page
  'Online Registration Portal': 'የበመስመር ምዝገባ ፖርታል',
  'Register Your Child for Admission': 'ልጅዎን ለመግቢያ ይመዝግቡ',
  'Complete the registration process online by providing student information, parent details, and uploading required documents.': 'የማመልከቻ ሂደቱን በመስመር ለማጠናቀቅ የተማሪ መረጃ፣ የወላጅ ዝርዝሮች እና የሚፈለጉ ሰነዶችን በማስረድ።',
  'Check Registration Status': 'የምዝገባ ሁኔታን ይመልከቱ',
  'Student Information': 'የተማሪ መረጃ',
  "Please provide the student's personal and academic details": 'የተማሪውን የግል እና የትምህርት ዝርዝሮች እንደብለስ ያቅሩ',
  'School': 'ትምህርት ቤት',
  'Loading schools...': 'ትምህርት ቤቶችን በመጫን ላይ...',
  'No schools available': 'ምንም ትምህርት ቤት የለም',
  'Select School': 'ትምህርት ቤት ይምረጡ',
  'First Name': 'የመጀመሪያ ስም',
  'Last Name': 'የአባት ስም',
  'Date of Birth': 'የልደት ቀን',
  'Gender': 'ፆታ',
  'Select Gender': 'ፆታ ይምረጡ',
  'Male': 'ወንድ',
  'Female': 'ሴት',
  'Other': 'ሌላ',
  'Grade Level': 'የክፍል ደረጃ',
  'Select Grade': 'ክፍል ይምረጡ',
  'KG 1': 'አንደኛ ክርስትያን',
  'KG 2': 'ሁለተኛ ክርስትያን',
  'Grade 1': '1ኛ ክፍል',
  'Grade 2': '2ኛ ክፍል',
  'Grade 3': '3ኛ ክፍል',
  'Grade 4': '4ኛ ክፍል',
  'Grade 5': '5ኛ ክፍል',
  'Grade 6': '6ኛ ክፍል',
  'Grade 7': '7ኛ ክፍል',
  'Grade 8': '8ኛ ክፍል',
  'Grade 9': '9ኛ ክፍል',
  'Grade 10': '10ኛ ክፍል',
  'Grade 11': '11ኛ ክፍል',
  'Grade 12': '12ኛ ክፍል',
  'Previous School': 'ቀደም ያለው ትምህርት ቤት',
  'Name of previous school': 'የቀደም ያለው ትምህርት ቤት ስም',
  'Address': 'አድራሻ',
  'Street address': 'የመኖሪያ አድራሻ',
  'City': 'ከተማ',
  'Phone': 'ስልክ',
  'Email': 'ኢሜይል',
  'Student@email.com': 'student@email.com',
  'Continue': 'ቀጥሉ',
  'Parent Information': 'የወላጅ መረጃ',
  'Please provide parent or guardian contact details': 'የወላጅ ወይም የጠባቂ የመገናኛ ዝርዝሮችን እንደብለስ ያቅሩ',
  'Relationship': 'የተያያዘነት',
  'Select Relationship': 'የተያያዘነት ይምረጡ',
  'Father': 'አባት',
  'Mother': 'እናት',
  'Guardian': 'ጠባቂ',
  'Occupation': 'ሙያ',
  'Parent address (if different from student)': 'የወላጅ አድራሻ (ከተማሪው በተለየ)',
  'Emergency Contact': 'የአደጋ ጊዜ ጥሪ',
  'Please provide an emergency contact person in case we cannot reach the primary parent/guardian.': 'ዋና ወላጅ/ጠባቂን ልንግራቸት ካልቻልን በአደጋ ጊዜ የሚያገኙትን ሰው እንደብለስ ያቅሩ።',
  'Emergency Contact Name': 'የአደጋ ጊዜ የመገናኛ ስም',
  'Emergency contact name': 'የአደጋ ጊዜ የመገናኛ ስም',
  'Emergency Phone': 'የአደጋ ጊዜ ስልክ',
  'Back': 'ተመለስ',
  'Document Upload': 'ሰነድ ማስረዛ',
  'Upload required documents for verification (PDF, JPG, PNG - Max 5MB each)': 'ለማረጋገጫ የሚፈለጉ ሰነዶችን ያስረዙ (PDF, JPG, PNG - እያንዳንዱ እስከ 5MB)',
  'Birth Certificate': 'የልደት ምስክር ወረቀት',
  'Click to upload birth certificate (optional)': 'የልደት ምስክር ወረቀት ለማስረዛ ይጫኑ (አማራጭ)',
  'Previous School Records': 'የቀደም ያለው ትምህርት ቤት ምዝገቦች',
  'Click to upload school records': 'የትምህርት ቤት ምዝገቦችን ለማስረዛ ይጫኑ',
  'Student Photo': 'የተማሪ ፎቶ',
  'Click to upload student photo': 'የተማሪ ፎቶ ለማስረዛ ይጫኑ',
  'Submit Registration': 'ምዝገባውን አስገቡ',
  'Registration Submitted Successfully!': 'ምዝገባው በተሳካ ሁኔታ ተጠናቋል!',
  'Your application has been received': 'የእርስዎ ዛሬ ደርሷል',
  'Reference ID': 'የማመልከቻ መለያ',
  'Our admissions team will review your application and contact you within 2-3 business days.': 'የመግቢያ ቡድናችን ዛሬውን ምዝገባዎን ይመልከታልና በ2-3 የንግድ ቀናት ውስጥ ይጠይቃል።',

  // About Page
  'Our History & Mission': 'ታሪክና ተልዕኳችን',
  'Redefining School Operations': 'የትምህርት ቤት ክንውኖችን እንደግመለጠው',
  'With Modern SaaS Standards': 'ከዘመናዊ SaaS መደቦኖች ጋር',
  'EduCore was founded by veteran educational leaders and corporate software architects who believed schools deserved administrative tools matching the beauty and performance of modern platforms like Stripe or Linear.': 'EduCore በወጣቶች የትምህርት መሪራት እና በኮርፖሬት ሶፍትዌር አርክቴክቶች የተመሰረ፣ ይህማም ትምህርት ቤቶች ከStripe ወይም Linear ካሉ የዘመናው መደምና የአፈጻጸም የሚመስሉ የአስተዳደር መሳሪያዎች የሚፈልጉ መሆኑን ያምኑ በተረካች ነው።',
  'Our Mission & Vision': 'ተልዕኳችንና ራእያችን',
  'We believe standard school portals shouldn\'t feel like clunky software from the early 2000s. Our mission is to streamline administrative operations, removing manual, paper-heavy tasks so school administrators and educators can reinvest their time in cultivating student achievements.': 'እንምን መደብ የትምህርት ቤት ፖርታሎች ከ2000ዎቹ መጀመሪያ ዘመናዊ ያልሆኑ ሶፍትዌር እንደሆኑ እንታምናል። ተልዕኳችን የአስተዳደር ክንውኖችን ለማቀለጥ፣ የየእጅ እና የበወራ ስራዎችን ለማስወግ እንፈልጋል፣ ይህምም የትምህርት ቤት አስተዳዳሪዎች እና መምህራን ጊዜዎን ለተማሪዎች ስኬማ ለማስማቅ ይችላሉ።',
  'By equipping schools with real-time analytics, automated fee pipelines, biometric attendance syncs, and direct chat channels, we unite students, guardians, and educators under a cohesive, secure digital standard.': 'ትምህርት ቤቶችን በቀጥታ አናልተር፣ በራስ-ሰር የክፍያ መንገድ፣ በባዮሜትሪክ መገኘት ማስማም እና በቀጥታ የውይይት መስርያዎች በመሸረው፣ ተማሪዎችን፣ ጠባቆችን እና መምህራን በአንድ የተዋሃደ እና ደህንነቱ የተጠበቀ ዲጂታል መደብ ስር እንያካቀናል።',
  'Colleges Integrated': 'የተዋሃዱ ኮሌጆች',
  'Arrears Recovery Rate': 'የያልተከፈሉ ክፍያ መመለስራት',
  'Daily Attendance Avg': 'የዕለት አማካኝ መገኘት',
  'Educators Empowered': 'የተባቀቁ መምህራን',
  'Our Institutional Values': 'የተቋማታችን ዋጓታት',
  'The principles guiding our code and customer support': 'የኮድን እና የደንቀማች ስራ የሚመራርዉ መርሆጆች',
  'Academic Focus': 'የትምህርት ትኩረት',
  'Putting student outcomes first by designing tools that keep teachers doing what they do best: mentoring and coaching.': 'የተማሪዎችን ውጤት በመጀመር የመምህራን እንደ ልቅ ከሚሆኑት እንደሆን አስተዳዳር መሳሪያዎችን በመንደፍ እንያካቀናል።',
  'Uncompromising Security': 'ያልተሸን ደህንነት',
  'Enforcing AES-256 database lockers, strict TLS 1.3 channel encryption, and rigorous regional privacy adherence.': 'AES-256 የዳታቤዝ መደብሮች፣ ጠንካራ TLS 1.3 የመገለጫ መመስጠጫ እና ጠንካራ የአካባቢ የግልምስንነት ተከባልን በመከልክር።',
  'Informed Families': 'የተማማኑ ቤተሰቦች',
  'Fostering deep guardian confidence through instant arrival signals, continuous reporting cards, and real-time ledger checkouts.': 'በቀጥታ የመግቢያ ማሳወቂያዎች፣ በቀጣይ የሪፖርት ካርዶች እና በቀጥታ የመለያ መስረባዎች በማቅረብ የጠባቆች እርምናን በማሳደግ።',
  'Evolution Timeline': 'የልማት ማስታወሻ',
  'How we reached premium campus standard': 'ወደ ፕሪሚየም የግቢ መደብ እንዴለ ማስራት',
  'Modern Tech Stack': 'ዘመናዊ ቴክኖሎጂ ስብስብ',
  'By leveraging premium frameworks, we compile blazing fast assets, enforce absolute data boundaries, and deliver fluid animations.': 'በፕሪሚየም ፕራምወርክስ በመጠቀም፣ ፍጥነት ያለው ዕቃዎችን እንሰበስር፣ ወረቀ የውሂብ ወሰኖችን እንከልክር፣ የተራረት እንቀስቦችን እንሰጣ።',
  'Strict Legal & FERPA Compliance': 'ጠንካራ የህጋዝ እና FERPA ተስማም',
  'Our databases run on secure, containerized cloud environments complying strictly with standard federal directives on student records safety. Encryption protocols keep parent fee checkers and child coordinates confidential under all network scenarios.': 'ዳታቤዛችን በደህንነቱ የተጠበቀ በኮንቴኔር የተያዙ በደመና አካባቢዎች እንሰራል፣ ይህምም ለትምህርት ቤት ምዝገቦች ደህንነት የሚመለስት የፌ፣ዴራል መመሪያዎችን በጠንካራ እንከተል። የመመስጠጫ ፕሮቶኮሎች የወላጅ ክፍያ ቼከሮችን እና የልጆችን አድራሻችን በሁሉም የኔትወርክ ሁኔታዎች ሚስጥ እንያደርድራል።',
  'Partner With EduCore': 'ከEduCore ጋር ይተባባሉ',
  'Ready to completely modernize your registration desks, tutor planners, and ledger audits?': 'የምዝገባ ጠረጃቶችዎን፣ የትምህርት ሰማት አቅድጃ ገበታዎችን እና የመለያ ኦዲቶችን ለሙሉ ለመሸረጥ ዝግጁ ነዎት?',

  // Contact Page
  'Connect with our team': 'ከቡድናችን ጋር ይገናኑ',
  'Schedule a Demo or Contact Support': 'የሙከራ ይስዕዝ ወይ ድጋፍን ያግኙ',
  'Have questions about system databases, custom compliance certificates, or payment gateways? Our campus onboarding specialists are ready to sync.': 'ስለ የስርዓት ዳታቤዞች፣ የተለጠኑ የማረጋገጫ ምስክሮች ወይ የክፍያ ጌትዌዎች ጥያቄዎች አሎት? የግቢ ቡድናችን ልምማት ባለተው ዝግጁ ናሉ።',
  'Office Headquarters': 'ዋና መስራት',
  'Our development vaults and customer success divisions are based in SF. Drop in or schedule an encrypted online consultation.': 'የፕሮግራም እና የደንቀማች ስካልን ክፍሎች በSF የተመሰሩ። ወይም የደህንነቱ የተጠበቀ በመስመር ወረፊ ያስዕዙ።',
  'Telephony Support': 'የስልክ ድጋፍ',
  'Encrypted Inboxes': 'የተመስጠኑ ኢሜይል ሳስቦች',
  'General Inquiries': 'የአጠቃቃ ጥያቄዎች',
  'School Name': 'የትምህርት ቤት ስም',
  'Phone Number': 'ስልክ ቁጥር',
  'Send Us a Message': 'ለእኛ መልዕክት ይላት',
  'Your Name': 'ስምዎ',
  'Your Email': 'ኢሜይልዎ',
  'Subject': 'ርዕስ',
  'Message': 'መልዕክት',
  'Send Message': 'መልዕክቱን ላክ',
  'Message Sent Successfully!': 'መልዕክቱ በተሳካ ሁኔታ ተልከው!',
  'Thank you for reaching out. Our team will respond within 24 hours.': 'ለማንገኝ እንደል። ቡድናችን በ24 ሰዓታ ውስጥ ይምልከትዎታል።',

  // Navbar
  'Home': 'መነሻ',
  'Features': 'ባህሪያዎች',
  'Register': 'መዝገብ',
  'About Us': 'ስለ እኛ',
  'Contact': 'ያግኙን',

  // Extra workspace sub-terms for word-by-word and recursive helper
  'Roster': 'ዝርዝር',
  'Lesson': 'ትምህርት',
  'Lessons': 'ትምህርቶች',
  'Plans': 'ዕቅዶች',
  'Messages': 'መልዕክቶች',
  'Academic': 'የትምህርት',
  'Operations': 'ስራዎች',
  'System': 'ስርዓት',
  'Maintenance': 'ጥገና',
  'Utilities': 'መገልገያዎች',
  'Audit': 'ኦዲት',
  'Logs': 'ምዝግቦች',
  'Security': 'ደህንነት',
  'Policies': 'ፖሊሲዎች',
  'Monitoring': 'ቁጥጥር',
  'Backups': 'ምትኬዎች',
  'Support': 'ድጋፍ',
  'Center': 'ማእከል',
  'Configuration': 'ውቅር',
  'Notifications': 'ማሳወቂያዎች',
  'Strategic': 'ስትራቴጂካዊ',
  'Directives': 'መመሪያዎች',
  'Consolidated': 'የተዋሃደ',
  'Performance': 'አፈጻጸም',
  'Index': 'መረጃ ጠቋሚ',
  'Target': 'ዒላማ',
  'Budget': 'በጀት',
  'Outstanding': 'ያልተከፈለ',
  'Dues': 'ክፍያ',
  'Invoice': 'ደረሰኝ',
  'Tuition': 'ክፍያ',
  'Pay': 'ክፍያ',
  'Children': 'ልጆች',
  'Statements': 'መግለጫዎች',
  'Messenger': 'መልእክተኛ',
  'Homework': 'የቤት ስራ',
  'Report': 'ሪፖርት',
  'Card': 'ካርድ',
  'Total': 'ጠቅላላ',
  'Registered': 'የተመዘገቡ',
  'Accounts': 'መለያዎች',
  'Online': 'በመስመር ላይ',
  'Rate': 'መጠን',
  'Receivables': 'የሚሰበሰቡ',
  'Hardware': 'ሃርድዌር',
  'Diagnostics': 'ምርመራ',
  'CPU': 'ሲፒዩ',
  'Load': 'አጠቃቀም',
  'RAM': 'ራም',
  'Allocation': 'አጠቃቀም',
  'Disk': 'ዲስክ',
  'Storage': 'ማከማቻ',
  'Notice': 'ማስታወቂያ',
  'Filter': 'አጣራ',
  'Add': 'አክል',
  'Changes': 'ለውጦች',
  'Approve': 'አጽድቅ',
  'Reject': 'ሰርዝ',
  'Close': 'ዝጋ',
  'Name': 'ስም',
  'Phone': 'ስልክ',
  'Address': 'አድራሻ',
  'Role': 'ሚና',
  'Check-in': 'መግቢያ',
  'Check-out': 'መውጫ',
  'Checked': 'የተረጋገጠ',
  'Today': 'ዛሬ',
  'Weekly': 'ሳምንታዊ',
  'Monthly': 'ወርሃዊ',
  'Publish': 'አውጣ',
  'Compose': 'ጻፍ',
  'Open': 'ክፈት',
  'Full': 'ሙሉ',
  'Mark': 'ምልክት አድርግ',
  'Read': 'አንብብ',
  'View': 'ተመልከት',
  'All': 'ሁሉንም',
  'Details...': 'ዝርዝሮች...',
  'In': 'ውስጥ',
  'Out': 'ውጭ',
  'Present': 'አለ',
  'Absent': 'የለም',
  'Late': 'ዘግይቷል',
  'Excused': 'የተፈቀደለት',
  'Exam': 'ፈተና',
  'Exams': 'ፈተናዎች',
  'Examinations': 'ፈተናዎች',
  'Course': 'ትምህርት',
  'Courses': 'ትምህርቶች',
  'Resources': 'መገልገያዎች',
  'Ratings': 'ደረጃዎች',
  'Feedback': 'አስተያየት',
  'Calendar': 'ቀን መቁጠሪያ',
  'Task': 'ተግባር',
  'Tasks': 'ተግባራት',
  'Title': 'አርዕስት',
  'Subject': 'የትምህርት ዓይነት',
  'Score': 'ውጤት',
  'Grade': 'ደረጃ',
  'IP': 'አይፒ',
  'Location': 'ቦታ',
  'Date': 'ቀን',
  'Time': 'ሰዓት',
  'Emergency': 'አደጋ ጊዜ',
  'Category': 'ምድብ',
  'Priority': 'ቅድሚያ',
  'Normal': 'መደበኛ',
  'High': 'ከፍተኛ',
  'Fee': 'ክፍያ',
  'Fees': 'ክፍያዎች',
  'Due': 'ቀን ገደብ',
  'Amount': 'መጠን',
  'Balance': 'ቀሪ ሂሳብ',
  'Reference': 'ማጣቀሻ',
  'Method': 'ዘዴ',
  'Cash': 'ጥሬ ገንዘብ',
  'Bank': 'ባንክ',
  'Transfer': 'ዝውውር',
  'Online Payment': 'በመስመር ላይ ክፍያ',
  'Audit Log': 'የኦዲት ምዝግብ',
  'Support Ticket': 'የድጋፍ ጥያቄ',
  'Support Tickets': 'የድጋፍ ጥያቄዎች',
  'School Config': 'የትምህርት ቤት ውቅር',
  'Config': 'ውቅር',
  'Enrollment': 'ምዝገባ',
  'Class': 'ክፍል',
  'Classes': 'ክፍሎች',
  'Identity Directory': 'የማንነት ማውጫ',
  'Total Registered Accounts': 'ጠቅላላ የተመዘገቡ መለያዎች',
  'Total Registered': 'ጠቅላላ የተመዘገቡ',
  'Registered Accounts': 'የተመዘገቡ መለያዎች',
  'Pending Online Admissions': 'በመጠባበቅ ላይ ያሉ የመግቢያ ማመልከቻዎች',
  'Pending Readmission Logs': 'በመጠባበቅ ላይ ያሉ የድጋሚ ምዝገባዎች',
  'Ready for Approval': 'ለማጽደቅ ዝግጁ',
  'Needs Verification': 'ማረጋገጫ ያስፈልገዋል',
  'Review list': 'ዝርዝሩን ይገምግሙ',
  'View Inbox': 'መልዕክቶችን ይመልከቱ',
  'Tuition Receivables': 'የሚሰበሰቡ የትምህርት ክፍያዎች',
  'Overdue Notices Active': 'ንቁ የክፍያ ማሳሰቢያዎች',
  'Ledger Desk': 'የሂሳብ መዝገብ ጠረጴዛ',
  'Live Hardware Diagnostics': 'የቀጥታ ሃርድዌር ምርመራ',
  'VM Host performance parameters in sandbox cluster': 'የቪኤም አስተናጋጅ አፈፃጸም መለኪያዎች',
  'CPU Load': 'የሲፒዩ አጠቃቀም',
  'RAM Allocation': 'የራም አጠቃቀም',
  'Disk Storage': 'የዲስክ ማከማቻ',
  'System Notice': 'የስርዓት ማስታወቂያ',
  'This administrative module is active but temporarily empty under design standards.': 'ይህ የአስተዳደር ክፍል ንቁ ነው ነገር ግን በንድፍ ደረጃዎች መሠረት ለጊዜው ባዶ ነው።',
  'Academic Operations': 'የትምህርት ስራዎች',
  'User Management': 'የተጠቃሚዎች አስተዳደር',
  'Admissions Billing': 'የመግቢያ ምዝገባ እና ክፍያ',
  'System Maintenance': 'የስርዓት ጥገና',
  'System Utilities': 'የስርዓት መገልገያዎች',
  'Academic Year Management': 'የአካዳሚክ ዓመት አስተዳደር',
  'Grade Section Configuration': 'የክፍል ደረጃ ውቅር',
  'School Configuration': 'የትምህርት ቤት ውቅር',
  'Notification Center': 'የማሳወቂያ ማእከል',
  'Support Center': 'የድጋፍ ማእከል',
  'Global System Settings': 'አጠቃላይ የስርዓት ቅንብሮች',
  'Admin Profile View': 'የአስተዳዳሪ መገለጫ እይታ',
  'Backup & Recovery': 'ምትኬ እና መልሶ ማግኛ',
  'Backup and Recovery': 'ምትኬ እና መልሶ ማግኛ',
  'Backup & recovery': 'ምትኬ እና መልሶ ማግኛ',
  'Security Policies': 'የደህንነት ፖሊሲዎች',
  'System Monitoring': 'የስርዓት ቁጥጥር',
  'Audit Logs': 'የኦዲት ምዝግቦች',
  'Executive Dashboard': 'የአስፈፃሚ ዳሽቦርድ',
      };
      resolve();
    }, 0);
  });
  
  return dictionaryLoadPromise;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount and pre-load dictionary
  useEffect(() => {
    const savedLanguage = localStorage.getItem('educore-language') as Language;
    if (savedLanguage === 'en' || savedLanguage === 'am') {
      setLanguageState(savedLanguage);
    }
    
    // Pre-load dictionary in background if user might need Amharic
    if (savedLanguage === 'am' || !savedLanguage) {
      loadAmharicDictionary();
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('educore-language', lang);
  };

  // The translation function
  const t = useCallback((key: string, defaultText?: string): string => {
    if (language === 'en') {
      return defaultText !== undefined ? defaultText : key;
    }
    
    // Start loading dictionary in background if not loaded
    if (!AMHARIC_DICTIONARY) {
      loadAmharicDictionary();
      return defaultText !== undefined ? defaultText : key;
    }
    
    // For Amharic ('am'), check the dictionary
    const trimmedKey = key.trim();
    if (AMHARIC_DICTIONARY[trimmedKey]) {
      return AMHARIC_DICTIONARY[trimmedKey];
    }

    // Try a lowercased check
    const lowercaseKey = trimmedKey.toLowerCase();
    const dictionaryMatch = Object.keys(AMHARIC_DICTIONARY).find(
      k => k.toLowerCase() === lowercaseKey
    );
    if (dictionaryMatch) {
      return AMHARIC_DICTIONARY[dictionaryMatch];
    }

    // Try splitting compound words / phrases if there are multiple words (up to 4 words)
    const words = trimmedKey.split(/\s+/);
    if (words.length > 1 && words.length <= 4) {
      const translatedWords = words.map(w => {
        // Clean word from common punctuation
        const cleanWord = w.replace(/[.,:;()?!]/g, '');
        const punc = w.substring(cleanWord.length); // trailing punctuation
        const startPunc = w.substring(0, w.indexOf(cleanWord));
        
        let transWord = cleanWord;
        if (AMHARIC_DICTIONARY[cleanWord]) {
          transWord = AMHARIC_DICTIONARY[cleanWord];
        } else {
          const matched = Object.keys(AMHARIC_DICTIONARY).find(
            k => k.toLowerCase() === cleanWord.toLowerCase()
          );
          if (matched) {
            transWord = AMHARIC_DICTIONARY[matched];
          }
        }
        return startPunc + transWord + punc;
      });

      // If at least one word was translated, return the combined string
      const anyTranslated = translatedWords.some((w, idx) => w !== words[idx]);
      if (anyTranslated) {
        return translatedWords.join(' ');
      }
    }

    // Secondary automatic partial translation for common compound names
    let translated = trimmedKey;
    // Replace common sub-strings
    const commonReplacements: [RegExp, string][] = [
      [/Workspace/i, 'የስራ ቦታ'],
      [/Dashboard/i, 'ዳሽቦርድ'],
      [/Total/i, 'ጠቅላላ'],
      [/Active/i, 'ንቁ'],
      [/Students/i, 'ተማሪዎች'],
      [/Teachers/i, 'መምህራን'],
      [/Staff/i, 'ሰራተኞች'],
      [/Settings/i, 'ቅንብሮች'],
      [/Academics/i, 'ትምህርት'],
      [/Admissions/i, 'መግቢያ'],
      [/Billing/i, 'ክፍያ'],
      [/Gradebook/i, 'የውጤት መዝገብ'],
      [/Attendance/i, 'መገኘት'],
      [/Lessons/i, 'ትምህርቶች'],
      [/Messaging/i, 'መልዕክቶች'],
      [/Student/i, 'ተማሪ'],
      [/Teacher/i, 'መምህር'],
      [/Admin/i, 'አስተዳዳሪ'],
      [/Parent/i, 'ወላጅ'],
      [/Director/i, 'ዳይሬክተር'],
    ];

    let hasReplaced = false;
    for (const [regex, replacement] of commonReplacements) {
      if (regex.test(translated)) {
        translated = translated.replace(regex, replacement);
        hasReplaced = true;
      }
    }

    if (hasReplaced) {
      return translated;
    }

    return defaultText !== undefined ? defaultText : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * AutoTranslator wraps components and automatically translates all DOM text contents and placeholders
 * from English to Amharic when language is 'am'. It uses a highly responsive MutationObserver
 * to ensure dynamic modifications (tab changes, modal popups, dynamic data loads) are instantly translated.
 */
export const AutoTranslator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (language !== 'am' || !containerRef.current) return;

    let observer: MutationObserver;

    const translate = () => {
      if (!containerRef.current) return;

      const walk = document.createTreeWalker(
        containerRef.current,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (parent) {
              const tag = parent.tagName.toLowerCase();
              if (tag === 'script' || tag === 'style' || tag === 'textarea') {
                return NodeFilter.FILTER_REJECT;
              }
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodesToTranslate: { node: Node; original: string; trimmed: string }[] = [];
      let node;
      while ((node = walk.nextNode())) {
        const text = node.nodeValue || '';
        const trimmed = text.trim();
        // Skip empty text, single letters/numbers, dates or pure symbols
        if (trimmed && trimmed.length > 1 && !/^[\d\s.,:;()\-+%#$/\\*\[\]{}<>|~`"'_]+$/.test(trimmed)) {
          // Check if it's already translated (contains Amharic range characters)
          const hasAmharic = /[\u1200-\u137F]/.test(trimmed);
          if (!hasAmharic) {
            nodesToTranslate.push({ node, original: text, trimmed });
          }
        }
      }

      // Disconnect observer to avoid firing events on our own mutations
      if (observer) {
        observer.disconnect();
      }

      // Translate Text Nodes
      for (const item of nodesToTranslate) {
        const translated = t(item.trimmed);
        if (translated !== item.trimmed) {
          item.node.nodeValue = item.original.replace(item.trimmed, translated);
        }
      }

      // Translate Input & Textarea Placeholders
      const inputs = containerRef.current.querySelectorAll('input, textarea');
      inputs.forEach(el => {
        const ph = el.getAttribute('placeholder');
        if (ph) {
          const trimmedPh = ph.trim();
          if (trimmedPh && !/[\u1200-\u137F]/.test(trimmedPh)) {
            const transPh = t(trimmedPh);
            if (transPh !== trimmedPh) {
              el.setAttribute('placeholder', transPh);
            }
          }
        }
      });

      // Translate Option values (like in selector drop downs)
      const options = containerRef.current.querySelectorAll('option');
      options.forEach(el => {
        const optText = el.textContent || '';
        const trimmedOpt = optText.trim();
        if (trimmedOpt && !/[\u1200-\u137F]/.test(trimmedOpt)) {
          const transOpt = t(trimmedOpt);
          if (transOpt !== trimmedOpt) {
            el.textContent = optText.replace(trimmedOpt, transOpt);
          }
        }
      });

      // Re-observe
      if (observer) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    };

    observer = new MutationObserver((mutations) => {
      translate();
    });

    // Run initial translation
    translate();

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [language, t]);

  // Key change on language ensures React does a clean re-mount/reset to English values
  // before we apply the DOM translations!
  return (
    <div key={language} ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
};
