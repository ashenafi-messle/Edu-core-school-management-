/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Mail, Phone, CheckCircle2, Clock, XCircle, 
  GraduationCap, Calendar, User, Users, MapPin, AlertCircle,
  FileText, ArrowLeft, ChevronRight, File, Image, Download, 
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';

export const RegistrationStatusPage: React.FC = () => {
  const { t } = useLanguage();
  const { navigateTo } = useNavigation();
  
  console.log('RegistrationStatusPage rendered'); // Debug log
  
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistration(null);
    setShowDetails(false);

    try {
      const params = new URLSearchParams();
      if (searchType === 'email') {
        params.append('email', searchValue);
      } else {
        params.append('phone', searchValue);
      }

      const response = await fetch(`/api/registrations/search?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.registrations && data.registrations.length > 0) {
          setRegistration(data.registrations[0]); // Show the most recent registration
          setShowDetails(true);
        } else {
          setError('No registration found with this information');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to search registration');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
      under_review: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: FileText },
      approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
      enrolled: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: GraduationCap }
    };
    
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase ${style.bg} ${style.text}`}>
        <Icon className="w-4 h-4" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="pt-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      
      {/* Header */}
      <section className="relative py-16 lg:py-20 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-brand-sky text-xs font-semibold uppercase tracking-wide">
            <Search className="w-3.5 h-3.5" />
            <span>Registration Status Check</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            Check Your Application Status
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Enter your registered email address or phone number to check the status of your registration application.
          </p>
          <button
            onClick={() => navigateTo('registration')}
            className="inline-flex items-center gap-2 text-sm text-brand-blue dark:text-brand-sky hover:text-brand-blue/80 dark:hover:text-brand-sky/80 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </button>
        </div>
      </section>

      {/* Search Form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSearchType('email')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  searchType === 'email'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setSearchType('phone')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  searchType === 'phone'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {/* Input Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {searchType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {searchType === 'email' ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                ) : (
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                )}
                <input
                  type={searchType === 'email' ? 'email' : 'tel'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'email' ? 'your@email.com' : '+1 234 567 8900'}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/50"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Check Status
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {showDetails && registration && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Status Header */}
              <div className="bg-gradient-to-r from-brand-blue/5 to-brand-indigo/5 dark:from-brand-blue/10 dark:to-brand-indigo/10 p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      Application Status
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Reference ID: <span className="font-mono font-bold text-brand-blue">{registration.reference_id}</span>
                    </p>
                  </div>
                  {getStatusBadge(registration.status)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-slate-900 dark:text-white">
                    <User className="w-4 h-4 text-brand-blue" />
                    Student Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Name</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {registration.student_first_name} {registration.student_last_name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Gender</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {registration.student_gender}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Grade Level</span>
                      <span className="font-medium text-slate-900 dark:text-white">{registration.student_grade_level}</span>
                    </div>
                    {registration.student_previous_school && (
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Previous School</span>
                        <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px]">
                          {registration.student_previous_school}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Date of Birth</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(registration.student_date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Phone</span>
                      <span className="font-medium text-slate-900 dark:text-white">{registration.student_phone}</span>
                    </div>
                    {registration.student_email && (
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Email</span>
                        <span className="font-medium text-slate-900 dark:text-white">{registration.student_email}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600 dark:text-slate-400">Address</span>
                      <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px]">
                        {registration.student_address}, {registration.student_city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-brand-blue" />
                    Parent/Guardian Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Name</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {registration.parent_first_name} {registration.parent_last_name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Relationship</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {registration.parent_relationship}
                      </span>
                    </div>
                    {registration.parent_occupation && (
                      <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Occupation</span>
                        <span className="font-medium text-slate-900 dark:text-white">{registration.parent_occupation}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Phone</span>
                      <span className="font-medium text-slate-900 dark:text-white">{registration.parent_phone}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Email</span>
                      <span className="font-medium text-slate-900 dark:text-white">{registration.parent_email}</span>
                    </div>
                    {registration.emergency_contact_name && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600 dark:text-slate-400">Emergency Contact</span>
                        <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px]">
                          {registration.emergency_contact_name} ({registration.emergency_phone})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-slate-900 dark:text-white mb-4">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  Application Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-blue" />
                    <span className="text-slate-600 dark:text-slate-400">Submitted:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(registration.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  {registration.review_started_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">Review Started:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(registration.review_started_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {registration.approved_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-600 dark:text-slate-400">Approved:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(registration.approved_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {registration.rejected_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-slate-600 dark:text-slate-400">Rejected:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(registration.rejected_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {registration.enrolled_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-slate-600 dark:text-slate-400">Enrolled:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(registration.enrolled_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(registration.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason */}
                {registration.rejection_reason && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Rejection Reason</p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{registration.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {registration.admin_notes && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Admin Notes</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1 whitespace-pre-wrap">{registration.admin_notes}</p>
                        
                        {/* Extract and display temporary passwords if present */}
                        {(registration.admin_notes.includes('Student Temporary Password:') || registration.admin_notes.includes('Parent Temporary Password:')) && (
                          <div className="mt-3 space-y-3">
                            {registration.admin_notes.includes('Student Temporary Password:') && (
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <div>
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Student Temporary Password</p>
                                    <p className="text-lg font-mono font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                                      {registration.admin_notes.match(/Student Temporary Password:\s*(Stud\d+)/)?.[1] || 'Stud1234'}
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Use this password to log in to your student account</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {registration.admin_notes.includes('Parent Temporary Password:') && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Parent Temporary Password</p>
                                    <p className="text-lg font-mono font-bold text-blue-800 dark:text-blue-300 mt-1">
                                      {registration.admin_notes.match(/Parent Temporary Password:\s*(Parent\d+)/)?.[1] || 'Parent1234'}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Use this password to log in to your parent account</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents Section */}
              {(registration.birth_certificate_url || registration.school_records_url || registration.student_photo_url) && (
                <div className="p-6 sm:p-8 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-slate-900 dark:text-white mb-4">
                    <File className="w-4 h-4 text-brand-blue" />
                    Submitted Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {registration.birth_certificate_url && (
                      <a
                        href={registration.birth_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        <File className="w-5 h-5 text-brand-blue flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Birth Certificate</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">View document</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </a>
                    )}
                    {registration.school_records_url && (
                      <a
                        href={registration.school_records_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-brand-blue flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">School Records</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">View document</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </a>
                    )}
                    {registration.student_photo_url && (
                      <a
                        href={registration.student_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        <Image className="w-5 h-5 text-brand-blue flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Student Photo</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">View image</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};