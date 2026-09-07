/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Filter, CheckCircle2, XCircle, 
  ChevronRight, Download, Eye, AlertCircle, RefreshCw, 
  Calendar, User, Phone, Mail, MapPin, File, Image, 
  X, Check, Shield, Clock, UserCheck, XOctagon, GraduationCap,
  MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import { OnlineRegistration } from './AdminTypes';
import { api } from '../../../lib/api';

interface RegistrationManagementProps {
  triggerToast: (msg: string) => void;
}

export const RegistrationManagement: React.FC<RegistrationManagementProps> = ({ triggerToast }) => {
  // State
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Detail view state
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<{
    type: 'birth_certificate' | 'school_records' | 'student_photo';
    url: string;
  } | null>(null);
  
  // Action modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    enrolled: 0
  });

  const activeReg = registrations.find(r => r.id === activeRegId);
  const itemsPerPage = 10;

  // Load registrations
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminRegistrations({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        sortBy: 'submitted_at',
        sortOrder: 'desc'
      });
      
      setRegistrations(response.registrations);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
      
      // Update stats
      const allRegs = await api.getAdminRegistrations({ limit: 1000 });
      setStats({
        total: allRegs.pagination.total,
        pending: allRegs.registrations.filter((r: any) => r.status === 'pending').length,
        underReview: allRegs.registrations.filter((r: any) => r.status === 'under_review').length,
        approved: allRegs.registrations.filter((r: any) => r.status === 'approved').length,
        rejected: allRegs.registrations.filter((r: any) => r.status === 'rejected').length,
        enrolled: allRegs.registrations.filter((r: any) => r.status === 'enrolled').length
      });
    } catch (error) {
      console.error('Error loading registrations:', error);
      triggerToast('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [statusFilter, currentPage, searchTerm]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // File handling
  const handleViewFile = async (fileType: 'birth_certificate' | 'school_records' | 'student_photo') => {
    if (!activeReg) return;
    
    try {
      const blob = await api.getRegistrationFile(activeReg.id, fileType);
      const url = URL.createObjectURL(blob);
      setViewingFile({ type: fileType, url });
    } catch (error) {
      console.error('Error fetching file:', error);
      triggerToast('Failed to load file');
    }
  };

  const handleDownloadFile = async (fileType: 'birth_certificate' | 'school_records' | 'student_photo') => {
    if (!activeReg) return;
    
    try {
      const blob = await api.getRegistrationFile(activeReg.id, fileType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}_${activeReg.reference_id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      triggerToast('Failed to download file');
    }
  };

  // Status actions
  const handleStatusAction = async (action: 'verify_documents' | 'approve' | 'reject' | 'enroll') => {
    if (!activeReg) return;
    
    if (action === 'reject' && !rejectionReason) {
      setRejectModalOpen(true);
      return;
    }
    
    try {
      const response = await api.updateRegistrationStatus(activeReg.id, action, rejectionReason);
      triggerToast(`Registration ${action}ed successfully`);
      setRejectModalOpen(false);
      setRejectionReason('');
      
      // For verify_documents, update local state instead of closing detail view
      if (action === 'verify_documents') {
        // Update the local registration state with the new status from response
        setRegistrations(prevRegs => 
          prevRegs.map(reg => 
            reg.id === activeReg.id 
              ? { ...reg, status: response.registration.status, review_started_at: response.registration.review_started_at }
              : reg
          )
        );
      } else {
        // For other actions, close detail view and reload
        setActiveRegId(null);
        loadRegistrations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      triggerToast('Failed to update registration status');
    }
  };

  // Notes handling
  const handleAddNotes = async () => {
    if (!activeReg || !adminNotes.trim()) return;
    
    try {
      const response = await api.addRegistrationNotes(activeReg.id, adminNotes);
      triggerToast('Notes added successfully');
      setNotesModalOpen(false);
      setAdminNotes('');
      
      // Update local state with new notes
      setRegistrations(prevRegs => 
        prevRegs.map(reg => 
          reg.id === activeReg.id 
            ? { ...reg, admin_notes: response.registration.admin_notes }
            : reg
        )
      );
    } catch (error) {
      console.error('Error adding notes:', error);
      triggerToast('Failed to add notes');
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
      under_review: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Eye },
      approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
      enrolled: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: GraduationCap }
    };
    
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400' },
          { label: 'Under Review', value: stats.underReview, color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400' },
          { label: 'Approved', value: stats.approved, color: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-400' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
          { label: 'Enrolled', value: stats.enrolled, color: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400' }
        ].map((stat) => (
          <div key={stat.label} className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 ${stat.color}`}>
            <span className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">{stat.label}</span>
            <p className={`text-lg font-black mt-1 ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, reference, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="enrolled">Enrolled</option>
          </select>
        </div>

        <button
          onClick={loadRegistrations}
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase">
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading registrations...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr 
                      key={reg.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/15 cursor-pointer ${activeRegId === reg.id ? 'bg-slate-50 dark:bg-slate-950/20' : ''}`}
                      onClick={() => setActiveRegId(reg.id)}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-brand-blue">{reg.reference_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">
                        {reg.student_first_name} {reg.student_last_name}
                      </td>
                      <td className="py-3 px-4 font-mono">{reg.student_grade_level}</td>
                      <td className="py-3 px-4 font-mono text-slate-450">{new Date(reg.submitted_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(reg.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded text-[10px] disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="px-2 py-1 text-[10px] text-slate-500">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded text-[10px] disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {activeReg && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeReg.student_first_name} {activeReg.student_last_name}
                  </h3>
                  <p className="text-[10px] font-mono text-brand-blue">{activeReg.reference_id}</p>
                </div>
                <button
                  onClick={() => setActiveRegId(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(activeReg.status)}
                <span className="text-[10px] text-slate-500">
                  Submitted {new Date(activeReg.submitted_at).toLocaleString()}
                </span>
              </div>

              {/* Student Info */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Student Information</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{activeReg.student_gender}, born {new Date(activeReg.student_date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Grade {activeReg.student_grade_level}</span>
                    {activeReg.student_previous_school && (
                      <span className="text-slate-400">(from {activeReg.student_previous_school})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeReg.student_phone}</span>
                  </div>
                  {activeReg.student_email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{activeReg.student_email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 mt-0.5" />
                    <span>{activeReg.student_address}, {activeReg.student_city}</span>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Parent/Guardian</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {activeReg.parent_first_name} {activeReg.parent_last_name}
                    <span className="text-slate-400 ml-1">({activeReg.parent_relationship})</span>
                  </div>
                  {activeReg.parent_occupation && (
                    <div className="text-slate-600 dark:text-slate-400">{activeReg.parent_occupation}</div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeReg.parent_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{activeReg.parent_email}</span>
                  </div>
                  {activeReg.emergency_contact_name && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Emergency: {activeReg.emergency_contact_name} ({activeReg.emergency_phone})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Documents</h4>
                <div className="space-y-2">
                  {activeReg.birth_certificate_url && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-slate-400" />
                        <span className="text-xs">Birth Certificate</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewFile('birth_certificate')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile('birth_certificate')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {activeReg.school_records_url && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs">School Records</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewFile('school_records')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile('school_records')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {activeReg.student_photo_url && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-slate-400" />
                        <span className="text-xs">Student Photo</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewFile('student_photo')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile('student_photo')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!activeReg.birth_certificate_url && !activeReg.school_records_url && !activeReg.student_photo_url && (
                    <div className="text-xs text-slate-400 italic">No documents uploaded</div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {activeReg.admin_notes && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400">Admin Notes</h4>
                    <button
                      onClick={() => setNotesModalOpen(true)}
                      className="text-[10px] text-brand-blue hover:underline"
                    >
                      + Add Note
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {activeReg.admin_notes}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {activeReg.rejection_reason && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-red-400">Rejection Reason</h4>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-400">
                    {activeReg.rejection_reason}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-[10px] font-bold uppercase text-slate-400">Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeReg.status === 'pending' && (
                    <button
                      onClick={() => handleStatusAction('verify_documents')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Verify Documents
                    </button>
                  )}
                  {activeReg.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => handleStatusAction('approve')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {activeReg.status === 'approved' && (
                    <button
                      onClick={() => handleStatusAction('enroll')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Enroll Student
                    </button>
                  )}
                  {!activeReg.admin_notes && (
                    <button
                      onClick={() => setNotesModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Add Notes
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRejectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reject Registration</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Please provide a reason for rejecting this registration. This will be visible to the applicant.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-24 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusAction('reject')}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setNotesModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Add Admin Notes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Add notes for this registration. Notes are only visible to administrators.
              </p>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter your notes..."
                className="w-full h-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setNotesModalOpen(false);
                    setAdminNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNotes}
                  disabled={!adminNotes.trim()}
                  className="flex-1 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white rounded-lg text-sm font-bold"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setViewingFile(null);
              URL.revokeObjectURL(viewingFile.url);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {viewingFile.type.replace('_', ' ')}
                </h3>
                <button
                  onClick={() => {
                    setViewingFile(null);
                    URL.revokeObjectURL(viewingFile.url);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex items-center justify-center min-h-[400px]">
                {viewingFile.type === 'student_photo' ? (
                  <img src={viewingFile.url} alt="Student photo" className="max-w-full max-h-[70vh] rounded-lg" />
                ) : (
                  <iframe src={viewingFile.url} className="w-full h-[70vh] rounded-lg" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};