/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Users, Upload, FileText, CheckCircle2, AlertCircle,
  Calendar, Phone, Mail, MapPin, GraduationCap, ArrowRight,
  ShieldCheck, FileCheck, X, Plus, Building2, Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { School } from '../types';

export const RegistrationPage: React.FC = () => {
  const { t } = useLanguage();
  const { navigateTo } = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // Fetch available schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched available schools:', data);
          setSchools(data);
        } else {
          console.error('Failed to fetch schools:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);
  
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    gradeLevel: '',
    previousSchool: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });

  const [parentData, setParentData] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [documents, setDocuments] = useState<{
    birthCertificate: File | null;
    previousSchoolRecords: File | null;
    photo: File | null;
  }>({
    birthCertificate: null,
    previousSchoolRecords: null,
    photo: null
  });

  const handleFileUpload = (docType: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const handleFileRemove = (docType: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!selectedSchool) {
        alert('Please select a school');
        setLoading(false);
        return;
      }

      if (!parentData.relationship || parentData.relationship === '') {
        alert('Please select a relationship to the student');
        setLoading(false);
        return;
      }

      // Upload files if any
      const fileUrls: Record<string, string> = {};
      
      if (documents.birthCertificate) {
        const formData = new FormData();
        formData.append('file', documents.birthCertificate);
        formData.append('category', 'birth_certificate');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrls.birth_certificate_url = uploadData.url;
        }
      }

      if (documents.previousSchoolRecords) {
        const formData = new FormData();
        formData.append('file', documents.previousSchoolRecords);
        formData.append('category', 'school_records');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrls.school_records_url = uploadData.url;
        }
      }

      if (documents.photo) {
        const formData = new FormData();
        formData.append('file', documents.photo);
        formData.append('category', 'student_photo');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrls.student_photo_url = uploadData.url;
        }
      }

      // Prepare registration data
      const registrationData = {
        school_id: selectedSchool,
        student_first_name: studentData.firstName,
        student_last_name: studentData.lastName,
        student_date_of_birth: studentData.dateOfBirth,
        student_gender: studentData.gender as 'male' | 'female' | 'other',
        student_grade_level: studentData.gradeLevel,
        student_previous_school: studentData.previousSchool || undefined,
        student_address: studentData.address,
        student_city: studentData.city,
        student_phone: studentData.phone,
        student_email: studentData.email || undefined,
        parent_first_name: parentData.firstName,
        parent_last_name: parentData.lastName,
        parent_relationship: parentData.relationship.toLowerCase() as 'father' | 'mother' | 'guardian' | 'other',
        parent_occupation: parentData.occupation || undefined,
        parent_phone: parentData.phone,
        parent_email: parentData.email,
        parent_address: parentData.address || undefined,
        emergency_contact_name: parentData.emergencyContact || undefined,
        emergency_phone: parentData.emergencyPhone || undefined,
        birth_certificate_url: fileUrls.birth_certificate_url,
        school_records_url: fileUrls.school_records_url,
        student_photo_url: fileUrls.student_photo_url
      };

      // Submit registration
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        setReferenceId(data.reference_id);
        setSuccess(true);
        setCurrentStep(4); // Success step
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        alert(`Registration failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('An error occurred while submitting the registration');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: t('Student Information'), icon: User },
    { id: 2, title: t('Parent Information'), icon: Users },
    { id: 3, title: t('Document Upload'), icon: Upload }
  ];

  const gradeLevels = [
    t('KG 1'), t('KG 2'), t('Grade 1'), t('Grade 2'), t('Grade 3'), t('Grade 4'),
    t('Grade 5'), t('Grade 6'), t('Grade 7'), t('Grade 8'), t('Grade 9'), t('Grade 10'),
    t('Grade 11'), t('Grade 12')
  ];

  return (
    <div id="registration-container" className="pt-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 grid-bg min-h-screen">
      
      {/* Header Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-brand-sky text-xs font-semibold uppercase tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t('Online Registration Portal')}</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {t('Register Your Child for Admission')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t('Complete the registration process online by providing student information, parent details, and uploading required documents.')}
          </p>
          <button
            type="button"
            onClick={() => navigateTo('registration-status')}
            className="inline-flex items-center gap-2 text-sm text-brand-blue dark:text-brand-sky hover:text-brand-blue/80 dark:hover:text-brand-sky/80 font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            {t('Check Registration Status')}
          </button>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep >= step.id
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs font-medium mt-2 ${
                  currentStep >= step.id ? 'text-brand-blue dark:text-brand-sky' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl">
          
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 flex gap-3 items-start"
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg">{t('Registration Submitted Successfully!')}</p>
                  <p className="mt-1">{t('Your application has been received')}. {t('Reference ID')}: {referenceId}</p>
                  <p className="mt-2 text-xs">{t('Our admissions team will review your application and contact you within 2-3 business days.')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Student Information */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">{t('Student Information')}</h3>
                    <p className="text-xs text-slate-500">{t("Please provide the student's personal and academic details")}</p>
                  </div>

                  {/* School Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('School')} *</label>
                    {schoolsLoading ? (
                      <div className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs flex items-center">
                        <span className="text-slate-500">{t('Loading schools...')}</span>
                      </div>
                    ) : schools.length === 0 ? (
                      <div className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs flex items-center">
                        <span className="text-slate-500">{t('No schools available')}</span>
                      </div>
                    ) : (
                      <select
                        required
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">{t('Select School')}</option>
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={studentData.firstName}
                        onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={studentData.lastName}
                        onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Date of Birth')} *</label>
                      <input
                        type="date"
                        required
                        value={studentData.dateOfBirth}
                        onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Gender')} *</label>
                      <select
                        required
                        value={studentData.gender}
                        onChange={(e) => setStudentData({ ...studentData, gender: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">{t('Select Gender')}</option>
                        <option value="male">{t('Male')}</option>
                        <option value="female">{t('Female')}</option>
                        <option value="other">{t('Other')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Grade Level')} *</label>
                      <select
                        required
                        value={studentData.gradeLevel}
                        onChange={(e) => setStudentData({ ...studentData, gradeLevel: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">{t('Select Grade')}</option>
                        {gradeLevels.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Previous School')}</label>
                      <input
                        type="text"
                        placeholder={t('Name of previous school')}
                        value={studentData.previousSchool}
                        onChange={(e) => setStudentData({ ...studentData, previousSchool: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Address')} *</label>
                    <input
                      type="text"
                      required
                      placeholder={t('Street address')}
                      value={studentData.address}
                      onChange={(e) => setStudentData({ ...studentData, address: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('City')} *</label>
                      <input
                        type="text"
                        required
                        placeholder={t('City')}
                        value={studentData.city}
                        onChange={(e) => setStudentData({ ...studentData, city: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Phone')} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={studentData.phone}
                        onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Email')}</label>
                    <input
                      type="email"
                      placeholder={t('Student@email.com')}
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-11 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      {t('Continue')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Parent Information */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">{t('Parent Information')}</h3>
                    <p className="text-xs text-slate-500">{t('Please provide parent or guardian contact details')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('First Name')} *</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane"
                        value={parentData.firstName}
                        onChange={(e) => setParentData({ ...parentData, firstName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Last Name')} *</label>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={parentData.lastName}
                        onChange={(e) => setParentData({ ...parentData, lastName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Relationship')} *</label>
                      <select
                        required
                        value={parentData.relationship}
                        onChange={(e) => setParentData({ ...parentData, relationship: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">{t('Select Relationship')}</option>
                        <option value="father">{t('Father')}</option>
                        <option value="mother">{t('Mother')}</option>
                        <option value="guardian">{t('Guardian')}</option>
                        <option value="other">{t('Other')}</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Occupation')}</label>
                      <input
                        type="text"
                        placeholder={t('Occupation')}
                        value={parentData.occupation}
                        onChange={(e) => setParentData({ ...parentData, occupation: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Phone')} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={parentData.phone}
                        onChange={(e) => setParentData({ ...parentData, phone: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Email')} *</label>
                      <input
                        type="email"
                        required
                        placeholder={t('Parent@email.com')}
                        value={parentData.email}
                        onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Address')}</label>
                    <input
                      type="text"
                      placeholder={t('Parent address (if different from student)')}
                      value={parentData.address}
                      onChange={(e) => setParentData({ ...parentData, address: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">{t('Emergency Contact')}</h4>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">{t('Please provide an emergency contact person in case we cannot reach the primary parent/guardian.')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Emergency Contact Name')}</label>
                      <input
                        type="text"
                        placeholder={t('Emergency contact name')}
                        value={parentData.emergencyContact}
                        onChange={(e) => setParentData({ ...parentData, emergencyContact: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Emergency Phone')}</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={parentData.emergencyPhone}
                        onChange={(e) => setParentData({ ...parentData, emergencyPhone: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="h-11 px-6 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('Back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="h-11 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      {t('Continue')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Document Upload */}
            <AnimatePresence mode="wait">
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">{t('Document Upload')}</h3>
                    <p className="text-xs text-slate-500">{t('Upload required documents for verification (PDF, JPG, PNG - Max 5MB each)')}</p>
                  </div>

                  <div className="space-y-4">
                    {/* Birth Certificate */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-blue" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{t('Birth Certificate')}</span>
                        </div>
                        {documents.birthCertificate && (
                          <button
                            type="button"
                            onClick={() => handleFileRemove('birthCertificate')}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {documents.birthCertificate ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-400">{documents.birthCertificate.name}</span>
                        </div>
                      ) : (
                        <label className="block w-full">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('birthCertificate', e.target.files[0])}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t('Click to upload birth certificate (optional)')}</p>
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Previous School Records */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-brand-blue" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{t('Previous School Records')}</span>
                        </div>
                        {documents.previousSchoolRecords && (
                          <button
                            type="button"
                            onClick={() => handleFileRemove('previousSchoolRecords')}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {documents.previousSchoolRecords ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-400">{documents.previousSchoolRecords.name}</span>
                        </div>
                      ) : (
                        <label className="block w-full">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('previousSchoolRecords', e.target.files[0])}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t('Click to upload school records')}</p>
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Student Photo */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-blue" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{t('Student Photo')} *</span>
                        </div>
                        {documents.photo && (
                          <button
                            type="button"
                            onClick={() => handleFileRemove('photo')}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {documents.photo ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-400">{documents.photo.name}</span>
                        </div>
                      ) : (
                        <label className="block w-full">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload('photo', e.target.files[0])}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t('Click to upload student photo')}</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-11 px-6 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('Back')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !documents.photo}
                      className="h-11 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>{t('Submit Registration')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </section>

    </div>
  );
};