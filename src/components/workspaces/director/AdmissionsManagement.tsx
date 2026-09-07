/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Check, X, Printer, Eye, AlertCircle, 
  Search, Filter, Calendar, Mail, Phone, Clock
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Registration } from './types';

export const AdmissionsManagement: React.FC = () => {
  const { registrations, approveRegistration, rejectRegistration } = useDirectorData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  const filtered = registrations.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.regNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <span className="text-[10px] font-mono text-slate-400 block font-bold">Total Applications</span>
          <p className="text-xl font-black text-slate-850 dark:text-white mt-1">{registrations.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <span className="text-[10px] font-mono text-slate-400 block font-bold">Approved</span>
          <p className="text-xl font-black text-emerald-500 mt-1">{registrations.filter(r => r.status === 'Approved').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <span className="text-[10px] font-mono text-slate-400 block font-bold">Pending Approval</span>
          <p className="text-xl font-black text-amber-500 mt-1">{registrations.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-left">
          <span className="text-[10px] font-mono text-slate-400 block font-bold">Rejected</span>
          <p className="text-xl font-black text-rose-500 mt-1">{registrations.filter(r => r.status === 'Rejected').length}</p>
        </div>
      </div>

      {/* 2. Controls Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
          >
            <option value="all">All Applications</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 3. History Logs List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                <th className="py-3 px-5">Reg Number</th>
                <th className="py-3 px-5">Prospective Student</th>
                <th className="py-3 px-5">Applied Grade</th>
                <th className="py-3 px-5">Guardian</th>
                <th className="py-3 px-5">Applied Date</th>
                <th className="py-3 px-5">Approval Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filtered.map((r) => (
                <tr key={r.regNum} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-500">{r.regNum}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white text-left">
                    <p>{r.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono font-semibold">{r.dob} • {r.gender}</p>
                  </td>
                  <td className="py-3.5 px-5 font-mono">{r.appliedGrade}</td>
                  <td className="py-3.5 px-5 text-left">
                    <p className="font-semibold">{r.parentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.phone}</p>
                  </td>
                  <td className="py-3.5 px-5 font-mono">{r.appDate}</td>
                  <td className="py-3.5 px-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                      r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600 animate-pulse'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => { setSelectedReg(r); setShowRegModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="Review Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {r.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => approveRegistration(r.regNum)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 cursor-pointer"
                            title="Approve & Onboard"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => rejectRegistration(r.regNum)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Reject Application"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==============================================
          REGISTRATION PROFILE MODAL
          ============================================== */}
      <AnimatePresence>
        {showRegModal && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Application Record Dossier</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedReg.regNum}</p>
                </div>
                <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4">
                
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-left">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Prospective Student</span>
                  <h4 className="text-sm font-black text-slate-850 dark:text-white">{selectedReg.studentName}</h4>
                  <p className="text-xs text-slate-500 font-mono">Date of Birth: {selectedReg.dob} • Gender: {selectedReg.gender}</p>
                </div>

                <div className="p-4 rounded-2xl border space-y-3 text-xs text-left">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applied Target Grade</span>
                    <span className="font-bold text-brand-indigo dark:text-brand-sky">{selectedReg.appliedGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Parent / Primary Guardian</span>
                    <span className="font-bold">{selectedReg.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Mobile Phone</span>
                    <span className="font-mono font-bold">{selectedReg.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Email</span>
                    <span className="font-mono font-bold">{selectedReg.email}</span>
                  </div>
                </div>

                {selectedReg.status === 'Pending' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { rejectRegistration(selectedReg.regNum); setShowRegModal(false); }}
                      className="px-4 py-2 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button 
                      onClick={() => { approveRegistration(selectedReg.regNum); setShowRegModal(false); }}
                      className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow"
                    >
                      Approve & Enroll Student
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
