/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, CheckSquare, Search, Filter, CheckCircle2, XCircle, 
  ChevronRight, Printer, Download, Eye, AlertCircle, RefreshCw, 
  TrendingUp, Calendar, User, DollarSign, Wallet, Percent, 
  X, Check, Receipt, CreditCard, ShieldAlert, Award
} from 'lucide-react';
import { OnlineRegistration, PaymentRecord } from './AdminTypes';

// ============================================================================
// 1. ONLINE REGISTRATION MANAGEMENT COMPONENT
// ============================================================================

interface OnlineRegistrationManagementProps {
  registrations: OnlineRegistration[];
  onUpdateRegistration: (id: string, updated: Partial<OnlineRegistration>) => void;
  triggerToast: (msg: string) => void;
}

export const OnlineRegistrationManagement: React.FC<OnlineRegistrationManagementProps> = ({
  registrations,
  onUpdateRegistration,
  triggerToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{
    key: string;
    label: string;
    status: 'Submitted' | 'Missing' | 'Verified';
  } | null>(null);

  const activeReg = registrations.find(r => r.id === activeRegId);

  useEffect(() => {
    setViewingDoc(null);
  }, [activeRegId]);

  const filtered = registrations.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDocumentVerify = (regId: string, docType: keyof OnlineRegistration['documents']) => {
    if (!activeReg) return;
    const currentDocs = { ...activeReg.documents };
    currentDocs[docType] = currentDocs[docType] === 'Verified' ? 'Submitted' : 'Verified';
    
    onUpdateRegistration(regId, { documents: currentDocs });
    triggerToast(`Updated ${docType} verification state.`);
  };

  const handleStatusChange = (regId: string, status: OnlineRegistration['status']) => {
    onUpdateRegistration(regId, { status });
    triggerToast(`Registration application ${regId} status marked: ${status.toUpperCase()}`);
    if (status === 'Approved') {
      setActiveRegId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-slate-400">Total Applicants</span>
          <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">{registrations.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-amber-500">Pending Review</span>
          <p className="text-xl font-black mt-1 text-amber-500">{registrations.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-emerald-500">Admitted Approved</span>
          <p className="text-xl font-black mt-1 text-emerald-500">{registrations.filter(r => r.status === 'Approved').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono uppercase font-black text-red-500">Action Required</span>
          <p className="text-xl font-black mt-1 text-red-500">{registrations.filter(r => r.status === 'Needs Documents').length}</p>
        </div>
      </div>

      {/* Filter and Table Row */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-left">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicant name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Applications</option>
            <option value="Pending">Pending Review</option>
            <option value="Needs Documents">Needs Documents</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={() => triggerToast("Printing applicant records...")}
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-xs font-bold font-mono flex items-center gap-1 text-slate-750 dark:text-slate-300 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Printer className="w-4 h-4" />
          <span>Print All Forms</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Applicants Grid List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                  <th className="py-3 px-5">Application ID</th>
                  <th className="py-3 px-5">Applicant Name</th>
                  <th className="py-3 px-5">Requested Grade</th>
                  <th className="py-3 px-5">Submit Date</th>
                  <th className="py-3 px-5">Docs State</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filtered.map((reg) => (
                  <tr key={reg.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/15 ${activeRegId === reg.id ? 'bg-slate-50 dark:bg-slate-950/20' : ''}`}>
                    <td className="py-3 px-5 font-mono text-[11px] font-bold text-brand-blue">{reg.id}</td>
                    <td className="py-3 px-5 font-bold text-slate-850 dark:text-white">{reg.studentName}</td>
                    <td className="py-3 px-5 font-mono">{reg.requestedGrade}</td>
                    <td className="py-3 px-5 font-mono text-slate-450">{reg.applicationDate}</td>
                    <td className="py-3 px-5">
                      <div className="flex gap-1 font-mono text-[9px] font-bold">
                        {Object.entries(reg.documents).map(([key, val]) => {
                          const isMissing = val === 'Missing';
                          const label = key.replace(/([A-Z])/g, ' $1').trim();
                          return (
                            <button
                              key={key}
                              disabled={isMissing}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveRegId(reg.id);
                                setViewingDoc({ key, label, status: val });
                              }}
                              title={isMissing ? `${label}: Missing` : `${label}: ${val} (Click to view details)`}
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                isMissing 
                                  ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200/50 dark:border-red-950/20 text-red-400 cursor-not-allowed' 
                                  : 'hover:scale-110 active:scale-95 cursor-pointer ' + (
                                      val === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                      'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                    )
                              }`}
                            >
                              {key[0].toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                        reg.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => setActiveRegId(reg.id)}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 text-slate-700 cursor-pointer ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Verify Docs</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">No admissions dossiers matches filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Verification Sidebar Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Dossier Checklist</h3>
          
          {activeReg ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block">APPLICANT PROFILE</span>
                <p className="font-bold text-slate-850 dark:text-white text-sm leading-tight">{activeReg.studentName}</p>
                <p className="text-[11px] font-mono text-slate-450">{activeReg.requestedGrade} • Applied: {activeReg.applicationDate}</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase block pb-1 border-b border-dashed border-slate-200 dark:border-slate-850">Required Verification Steps</span>
                
                {Object.entries(activeReg.documents).map(([key, val]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').trim();
                  const isMissing = val === 'Missing';
                  
                  return (
                    <div key={key} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 space-y-2 text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize font-bold text-slate-800 dark:text-slate-200">{label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black font-mono uppercase ${
                          val === 'Verified' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          val === 'Submitted' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {val}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {!isMissing && (
                          <button
                            onClick={() => setViewingDoc({ key, label, status: val })}
                            className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        )}
                        
                        <button
                          disabled={isMissing}
                          onClick={() => handleDocumentVerify(activeReg.id, key as any)}
                          className={`h-8 px-3 text-[10.5px] font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            isMissing ? 'bg-slate-100 text-slate-400 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed' :
                            val === 'Verified' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' :
                            'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm'
                          }`}
                        >
                          {val === 'Verified' ? '✔ Verified' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action operations buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850 space-y-2">
                <button
                  onClick={() => handleStatusChange(activeReg.id, 'Approved')}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Registration</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(activeReg.id, 'Needs Documents')}
                    className="h-9 border border-amber-500 text-amber-600 text-[11px] font-bold rounded-lg hover:bg-amber-500/10 cursor-pointer"
                  >
                    Request Documents
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeReg.id, 'Rejected')}
                    className="h-9 border border-red-500 text-red-500 text-[11px] font-bold rounded-lg hover:bg-red-500/10 cursor-pointer"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 text-xs italic">
              Please click "Verify Docs" on any student to open the document verification checklist pane.
            </div>
          )}
        </div>
      </div>

      {/* 2. DOCUMENT DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {viewingDoc && activeReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-blue" />
                    <span>Admissions Document Audit</span>
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">VERIFICATION NODE ID: {activeReg.id}</p>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {/* 1. Header Metadata summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Document Type</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white capitalize block mt-1">{viewingDoc.label}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Status Code</span>
                    <span className="inline-block mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        viewingDoc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {viewingDoc.status}
                      </span>
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Applicant Name</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate block mt-1">{activeReg.studentName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Admissions Year</span>
                    <span className="text-xs font-mono text-slate-800 dark:text-white block mt-1">2026-2027</span>
                  </div>
                </div>

                {/* 2. Document file metadata */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-mono text-left space-y-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 mb-2">Cryptographic Hash and Scan Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-600 dark:text-slate-400">
                    <p><strong className="text-slate-800 dark:text-slate-250">File Name:</strong> {viewingDoc.key === 'birthCertificate' ? 'birth_cert_certificate' : viewingDoc.key === 'previousTranscript' ? 'transcript_report_card' : viewingDoc.key === 'medicalInfo' ? 'health_vaccination_log' : 'biometric_id_photo'}_{activeReg.studentName.toLowerCase().replace(/\s+/g, '_')}.pdf</p>
                    <p><strong className="text-slate-800 dark:text-slate-250">File Size:</strong> {viewingDoc.key === 'birthCertificate' ? '1.8 MB' : viewingDoc.key === 'previousTranscript' ? '2.4 MB' : viewingDoc.key === 'medicalInfo' ? '1.1 MB' : '320 KB'}</p>
                    <p><strong className="text-slate-800 dark:text-slate-250">Upload Node:</strong> Direct Client Portal v4.2</p>
                    <p><strong className="text-slate-800 dark:text-slate-250">Date Received:</strong> {activeReg.applicationDate} (14:32:05 UTC)</p>
                    <p className="sm:col-span-2 truncate"><strong className="text-slate-800 dark:text-slate-250">Digest (SHA-256):</strong> sha256:d5f27bc19a88e404b998fdc90a1e35cf8db9b47e4b9bc9713c8801d0a5667e2a</p>
                    <p className="text-emerald-500 font-bold sm:col-span-2">✔ Antivirus Check: Safe. Scan clean by Sophos Endpoint (Zero-day Heuristic analysis passed)</p>
                  </div>
                </div>

                {/* 3. Graphical document mock preview */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-mono">Simulated Document Snapshot Preview</span>
                  
                  {/* Birth Certificate Graphic */}
                  {viewingDoc.key === 'birthCertificate' && (
                    <div className="border-4 border-amber-800/10 dark:border-amber-900/10 bg-amber-50/10 dark:bg-amber-950/5 p-6 rounded-2xl relative font-serif text-amber-900 dark:text-amber-200 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[220px]">
                      {/* Decorative border layout */}
                      <div className="absolute inset-2 border border-dashed border-amber-800/15" />
                      {/* Watermark */}
                      <div className="absolute text-center opacity-[0.03] pointer-events-none select-none text-[3rem] font-bold tracking-widest text-amber-800/20 rotate-12 uppercase leading-none">
                        OFFICIAL RECORD
                      </div>

                      <div className="relative text-center max-w-md space-y-3 z-10">
                        <h4 className="text-lg font-black uppercase tracking-widest text-amber-850 dark:text-amber-300">Certificate of Live Birth</h4>
                        <p className="text-[11px] font-mono tracking-widest uppercase text-amber-700/60 dark:text-amber-400/60 -mt-2">STATE REGISTRY OF VITAL STATISTICS</p>
                        
                        <div className="border-t border-b border-amber-800/10 py-3 my-2 space-y-1.5 text-xs">
                          <p>This certifies that <strong className="text-sm font-sans font-extrabold text-slate-850 dark:text-white capitalize">{activeReg.studentName}</strong> was born at 06:45 AM on June 12, 2012.</p>
                          <p>Place of Birth: <span className="font-sans font-medium text-slate-700 dark:text-slate-350">St. Mary’s Pediatrics Center, Ward B</span></p>
                          <p>Parent Account Signature: <span className="italic font-mono text-slate-700 dark:text-slate-350 font-bold">{activeReg.parentName}</span></p>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-amber-700/85">
                          <span>REG-ID: VTL-2012-99824</span>
                          <div className="flex items-center gap-1">
                            <span className="w-5 h-5 rounded-full border border-dashed border-amber-600 flex items-center justify-center font-bold text-[8px] bg-amber-500/10">★</span>
                            <span>REGISTRAR SEAL VALID</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transcript Graphic */}
                  {viewingDoc.key === 'previousTranscript' && (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 rounded-2xl relative font-sans text-xs shadow-inner min-h-[220px]">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-12">
                        <span className="text-[4rem] font-bold text-slate-300 dark:text-slate-800/10 font-mono tracking-widest uppercase">OFFICIAL</span>
                      </div>

                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2.5">
                          <div className="text-left">
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase leading-tight">Pre-Admissions Academic Record</h4>
                            <p className="text-[10px] font-mono text-slate-450 mt-0.5">GRADE LEVEL 9 ASSESSMENT MATRIX</p>
                          </div>
                          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-black border border-emerald-500/15">PASS RECORD</span>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                          <div className="grid grid-cols-4 py-1.5 font-bold font-mono text-[10px] text-slate-400">
                            <span className="col-span-2">Syllabus Subject Course</span>
                            <span className="text-center">Score Grade</span>
                            <span className="text-right">Outcome</span>
                          </div>
                          <div className="grid grid-cols-4 py-1.5 font-mono">
                            <span className="col-span-2 text-slate-850 dark:text-slate-300 font-bold">MATHEMATICS (CORE ALGEBRA)</span>
                            <span className="text-center text-emerald-500 font-bold">A</span>
                            <span className="text-right text-slate-400">Passed</span>
                          </div>
                          <div className="grid grid-cols-4 py-1.5 font-mono">
                            <span className="col-span-2 text-slate-850 dark:text-slate-300 font-bold">ENGLISH LANGUAGE & COMP</span>
                            <span className="text-center text-emerald-500 font-bold">A-</span>
                            <span className="text-right text-slate-400">Passed</span>
                          </div>
                          <div className="grid grid-cols-4 py-1.5 font-mono">
                            <span className="col-span-2 text-slate-850 dark:text-slate-300 font-bold">GENERAL PHYSICS & CHEMISTRY</span>
                            <span className="text-center text-amber-500 font-bold">B+</span>
                            <span className="text-right text-slate-400">Passed</span>
                          </div>
                          <div className="grid grid-cols-4 py-1.5 font-mono">
                            <span className="col-span-2 text-slate-850 dark:text-slate-300 font-bold">WORLD GEOGRAPHY & HISTORY</span>
                            <span className="text-center text-emerald-500 font-bold">A</span>
                            <span className="text-right text-slate-400">Passed</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10.5px] pt-2 font-mono border-t border-slate-100 dark:border-slate-850">
                          <p><strong className="text-slate-800 dark:text-white">Cumulative GPA:</strong> 3.75 / 4.00 Scale (Honor Roll list)</p>
                          <p className="text-slate-450 italic">Verified Registrar Stamp</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medical Info Graphic */}
                  {viewingDoc.key === 'medicalInfo' && (
                    <div className="border border-teal-200 dark:border-teal-900 bg-teal-50/5 dark:bg-teal-950/5 p-5 rounded-2xl relative font-sans text-xs text-slate-700 dark:text-slate-350 min-h-[220px]">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-12">
                        <span className="text-[4rem] font-bold text-teal-500/10 font-mono tracking-widest uppercase">HEALTH</span>
                      </div>

                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start border-b border-teal-100 dark:border-teal-900/40 pb-2.5">
                          <div className="text-left">
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase leading-tight">Immunization Record & Clearance</h4>
                            <p className="text-[10px] font-mono text-teal-600 dark:text-teal-400 mt-0.5">COMPLIANT WITH LOCAL HEALTH STATUTES</p>
                          </div>
                          <span className="text-[10px] font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded font-black border border-teal-500/15">APPROVED</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                          <div className="p-2 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-850 rounded-lg flex items-center justify-between">
                            <span>Measles, Mumps, Rubella (MMR):</span>
                            <span className="text-emerald-500 font-extrabold text-xs">Compliant ✔</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-850 rounded-lg flex items-center justify-between">
                            <span>Poliovirus (IPV) vaccination:</span>
                            <span className="text-emerald-500 font-extrabold text-xs">Compliant ✔</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-850 rounded-lg flex items-center justify-between">
                            <span>Tetanus, Diphtheria, Pertussis (DTaP):</span>
                            <span className="text-emerald-500 font-extrabold text-xs">Compliant ✔</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-850 rounded-lg flex items-center justify-between">
                            <span>Hepatitis B immunization schedule:</span>
                            <span className="text-emerald-500 font-extrabold text-xs">Compliant ✔</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10.5px] leading-relaxed">
                          <strong>Note:</strong> Patient is fully immunized. Clinical checkups confirm no critical medical history, dietary allergies, or neurological restrictions. Qualified for active athletic programs.
                        </div>

                        <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-450 border-t border-teal-100/40 pt-2">
                          <span>SIGNATURE: DR. S. JENKINS, PEDIATRICS SPECIALIST</span>
                          <span>LICENSE: #MD-88219-VA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passport Photo Graphic */}
                  {viewingDoc.key === 'passportPhoto' && (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 rounded-2xl relative font-sans text-xs text-left shadow-inner flex flex-col sm:flex-row gap-6 min-h-[220px] items-center">
                      <div className="relative w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {/* Mock user portrait */}
                        <div className="absolute inset-2 border border-slate-250 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 select-none">
                          <User className="w-12 h-12 text-slate-350 dark:text-slate-650" />
                          <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Passport Format</span>
                        </div>
                        {/* Biometric camera indicators */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-brand-indigo" />
                        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-brand-indigo" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-brand-indigo" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-brand-indigo" />
                      </div>

                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="text-left">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase leading-tight">Biometric Photo Evaluation</h4>
                          <p className="text-[10px] font-mono text-slate-450 mt-0.5">COMPLIANT REGULATION PASSPORT SPECIFICATIONS</p>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-850 font-mono text-[10.5px]">
                          <div className="flex justify-between py-1">
                            <span className="text-slate-450">Biometric Alignment:</span>
                            <span className="text-emerald-500 font-bold">Passed (Centered, 12% headroom)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-450">Luminance & Contrast:</span>
                            <span className="text-emerald-500 font-bold">Passed (Nominal exposure)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-450">Chromatic Balance:</span>
                            <span className="text-emerald-500 font-bold">Passed (Correct RGB skin-tones)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-450">Digital Frame Output:</span>
                            <span className="text-slate-750 dark:text-slate-300 font-bold">600 x 600 px (300 DPI)</span>
                          </div>
                        </div>

                        <p className="text-[10px] bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 p-2 rounded border border-emerald-500/10 font-medium">
                          ✔ Face Recognition Indexing: Face structure matches birth certificate details successfully. Background color checks confirm absolute off-white backdrop compliance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    triggerToast(`Dispatched document copy request for ${activeReg.studentName}`);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print Copy</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingDoc(null)}
                    className="px-4 py-2 rounded-xl hover:bg-slate-250 dark:hover:bg-slate-800 font-bold text-slate-500 dark:text-slate-400 text-xs cursor-pointer transition-colors"
                  >
                    Close Audit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDocumentVerify(activeReg.id, viewingDoc.key as any);
                      // Toggle locally in viewing doc too
                      setViewingDoc(prev => prev ? { ...prev, status: prev.status === 'Verified' ? 'Submitted' : 'Verified' } : null);
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer transition-colors shadow-sm ${
                      viewingDoc.status === 'Verified' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {viewingDoc.status === 'Verified' ? 'Un-verify Document' : 'Verify & Approve File'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 2. PAYMENT MANAGEMENT COMPONENT
// ============================================================================

interface PaymentManagementProps {
  payments: PaymentRecord[];
  onVerifyPayment: (id: string, reference: string, method: PaymentRecord['method']) => void;
  onUpdatePayment: (id: string, updated: Partial<PaymentRecord>) => void;
  triggerToast: (msg: string) => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  onVerifyPayment,
  onUpdatePayment,
  triggerToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Verification dialog state
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);
  const [refInput, setRefInput] = useState('');
  const [methodInput, setMethodInput] = useState<PaymentRecord['method']>('Bank Transfer');

  const selectedInvoice = payments.find(p => p.id === selectedInvoiceId);

  const filtered = payments.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + p.remainingBalance, 0);
  const collectionRate = Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) || 0;

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput) {
      triggerToast("Missing bank reference confirmation code!");
      return;
    }
    if (isVerifyingId) {
      onVerifyPayment(isVerifyingId, refInput, methodInput);
      triggerToast(`Transaction verified successfully. Invoice settles to state PAID.`);
      setIsVerifyingId(null);
      setRefInput('');
    }
  };

  const handleApplyDiscount = (id: string, discount: number) => {
    const record = payments.find(p => p.id === id);
    if (!record) return;
    const newAmt = Math.max(0, record.amountDue - discount);
    onUpdatePayment(id, {
      amountPaid: record.amountPaid,
      remainingBalance: Math.max(0, newAmt - record.amountPaid),
      status: (newAmt - record.amountPaid <= 0) ? 'Paid' : 'Partial'
    });
    triggerToast(`Scholarship voucher applied. Slashed balance due by $${discount}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Tallies Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-black text-slate-400">Total Expected</span>
            <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">${totalCollected + totalOutstanding}</p>
          </div>
          <Wallet className="w-5 h-5 text-brand-blue" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-black text-emerald-500">Revenue Collected</span>
            <p className="text-xl font-black mt-1 text-emerald-500">${totalCollected}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-black text-red-500">Uncollected Receivables</span>
            <p className="text-xl font-black mt-1 text-red-500">${totalOutstanding}</p>
          </div>
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-black text-brand-indigo">Collection Rate</span>
            <p className="text-xl font-black mt-1 text-brand-indigo">{collectionRate}%</p>
          </div>
          <TrendingUp className="w-5 h-5 text-brand-indigo" />
        </div>
      </div>

      {/* Filter and Table Row */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-left">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice, student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Invoices</option>
            <option value="Paid">Paid Receipts</option>
            <option value="Partial">Partial Payments</option>
            <option value="Unpaid">Unpaid Invoices</option>
            <option value="Overdue">Overdue Notice</option>
          </select>
        </div>

        <button
          onClick={() => triggerToast("Invoice Ledger exported to CSV.")}
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-xs font-bold font-mono flex items-center gap-1 text-slate-755 dark:text-slate-300 cursor-pointer justify-center self-stretch sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                  <th className="py-3 px-5">Invoice No</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Fee Category</th>
                  <th className="py-3 px-5">Due</th>
                  <th className="py-3 px-5">Paid</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/15">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-brand-indigo">{pay.invoiceNumber}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-850 dark:text-white">{pay.studentName}</td>
                    <td className="py-3.5 px-5 font-mono capitalize">{pay.category}</td>
                    <td className="py-3.5 px-5 font-mono font-bold">${pay.amountDue}</td>
                    <td className="py-3.5 px-5 font-mono text-emerald-500 font-bold">${pay.amountPaid}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                        pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        pay.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setSelectedInvoiceId(pay.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-450 hover:text-brand-indigo cursor-pointer"
                          title="View Receipt Envelope"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {pay.status !== 'Paid' && (
                          <button
                            onClick={() => setIsVerifyingId(pay.id)}
                            className="p-1 hover:bg-emerald-500/10 rounded text-slate-450 hover:text-emerald-500 cursor-pointer"
                            title="Verify Bank Reference Code"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Bill Receipts view pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Receipt Auditor</h3>

          {selectedInvoice ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>BILL TARGET</span>
                  <span>{selectedInvoice.invoiceNumber}</span>
                </div>
                <p className="font-bold text-slate-850 dark:text-white text-sm font-sans leading-tight">{selectedInvoice.studentName}</p>
                <p className="text-[10px] text-slate-450 font-mono">Parent Account: {selectedInvoice.parent}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase block pb-1 border-b border-dashed border-slate-200">Receipt Details</span>
                <div className="flex justify-between">
                  <span>Fee Bracket:</span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">{selectedInvoice.category} Fee</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount Due:</span>
                  <span className="font-bold">${selectedInvoice.amountDue}</span>
                </div>
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Credited Paid:</span>
                  <span>-${selectedInvoice.amountPaid}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-850 dark:text-white text-sm">
                  <span>Outstanding Bal:</span>
                  <span>${selectedInvoice.remainingBalance}</span>
                </div>
              </div>

              {selectedInvoice.reference && (
                <div className="p-2.5 bg-brand-blue/5 border border-brand-blue/15 rounded-xl space-y-1 text-[11px]">
                  <span className="text-[9px] font-black text-brand-blue uppercase tracking-wider block">Wire Verification Node</span>
                  <p>Method: {selectedInvoice.method}</p>
                  <p>Bank Reference: {selectedInvoice.reference}</p>
                  <p>Processed: {selectedInvoice.paymentDate}</p>
                </div>
              )}

              {/* Action discount triggers */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => triggerToast(`Voucher receipt generated for invoice ${selectedInvoice.invoiceNumber}`)}
                  className="w-full h-10 bg-slate-850 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt Voucher</span>
                </button>

                {selectedInvoice.remainingBalance > 0 && (
                  <div className="pt-2">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase block pb-1">Ledger Adjustments</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleApplyDiscount(selectedInvoice.id, 250)}
                        className="h-8 border border-emerald-500/40 hover:bg-emerald-500/5 text-emerald-600 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Apply -$250 Scholarship
                      </button>
                      <button
                        onClick={() => handleApplyDiscount(selectedInvoice.id, 500)}
                        className="h-8 border border-brand-indigo/45 hover:bg-brand-indigo/5 text-brand-indigo rounded text-[10px] font-bold cursor-pointer"
                      >
                        Apply -$500 Discount
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 text-xs italic">
              Please click the Receipt icon on any payment ledger row to audit the student's bill, apply scholarships, or print invoices.
            </div>
          )}
        </div>
      </div>

      {/* VERIFY TRANSACTION DIALOG */}
      <AnimatePresence>
        {isVerifyingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>Verify Ledger Deposit</span>
                </h3>
                <button onClick={() => setIsVerifyingId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVerifySubmit} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Payment Gateway</label>
                  <select
                    value={methodInput}
                    onChange={(e: any) => setMethodInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Credit Card">Credit Card Auth</option>
                    <option value="Mobile Payment">Mobile Money wallet</option>
                    <option value="Cash">Cash Ledger Voucher</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Bank Reference Code</label>
                  <input
                    type="text"
                    required
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. TXN-881272B-STU"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsVerifyingId(null)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Confirm & Clear Balance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
