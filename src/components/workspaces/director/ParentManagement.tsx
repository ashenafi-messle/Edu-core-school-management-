/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, Mail, Phone, MapPin, X, Eye, Edit, Trash2, 
  Search, Briefcase, AlertCircle, HelpCircle, CheckCircle2, MessageSquare, Check, Send
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Parent } from './types';
import {
  getParentStudentMappings,
  ParentStudentMappingData
} from '../../../lib/api/registrations';

export const ParentManagement: React.FC = () => {
  const { 
    parents, 
    parentStudentMappings, 
    parentFeedbacks, 
    resolveParentFeedback,
    isLoadingParents,
    parentsError,
    isLoadingFeedback,
    feedbackError,
    addParent,
    updateParent,
    deleteParent,
    activateParent,
    deactivateParent: deactivateParentFunc
  } = useDirectorData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'mappings' | 'feedback'>('directory');
  
  // Feedback resolution local state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionResponse, setResolutionResponse] = useState('');

  // Parent-student mappings state
  const [mappingsData, setMappingsData] = useState<ParentStudentMappingData[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingsError, setMappingsError] = useState<string | null>(null);

  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredParents = parents.filter(p => {
    const name = p.name || p.full_name || '';
    const email = p.email || '';
    const occupation = p.occupation || p.relationship || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           occupation.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Load parent-student mappings when switching to mappings tab
  const loadMappings = async () => {
    try {
      setIsLoadingMappings(true);
      setMappingsError(null);
      const data = await getParentStudentMappings();
      setMappingsData(data);
    } catch (error) {
      console.error('Failed to load parent-student mappings:', error);
      setMappingsError('Failed to load parent-student mappings');
    } finally {
      setIsLoadingMappings(false);
    }
  };

  // Load mappings when tab changes to mappings
  React.useEffect(() => {
    if (activeSubTab === 'mappings') {
      loadMappings();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'directory' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Parents Directory</span>
        </button>
        <button
          onClick={() => setActiveSubTab('mappings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'mappings' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Parent-Student Mappings</span>
        </button>
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'feedback' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback & Resolutions</span>
        </button>
      </div>

      {/* Page Content */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6 text-left">
          
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by parent name, occupation, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Add Parent</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoadingParents && (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Loading parents...</p>
            </div>
          )}

          {/* Error State */}
          {parentsError && !isLoadingParents && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-400">{parentsError}</p>
            </div>
          )}

          {/* Table List */}
          {!isLoadingParents && !parentsError && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                      <th className="py-3 px-5">Parent</th>
                      <th className="py-3 px-5">Relationship</th>
                      <th className="py-3 px-5">Contact Details</th>
                      <th className="py-3 px-5">Emergency Contact</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredParents.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.photo || p.profile_picture_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} 
                              alt={p.name || p.full_name} 
                              className="w-8.5 h-8.5 rounded-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{p.name || p.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-300">
                          {p.relationship || p.occupation || 'Parent'}
                        </td>
                        <td className="py-3.5 px-5 text-left">
                          <p className="font-semibold">{p.phone || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.email || 'N/A'}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold">{p.emergency_contact || 'N/A'}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'active' || p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 
                            p.status === 'inactive' || p.status === 'Inactive' ? 'bg-slate-100 text-slate-400' : 
                            'bg-rose-500/10 text-rose-600'
                          }`}>
                            {p.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedParent(p); setShowProfileModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 cursor-pointer"
                              title="View Profile"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => { setSelectedParent(p); setShowEditModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 cursor-pointer"
                              title="Edit Parent"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            {p.status === 'active' || p.status === 'Active' ? (
                              <button
                                onClick={() => deactivateParentFunc(p.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Deactivate Parent"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => activateParent(p.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 cursor-pointer"
                                title="Activate Parent"
                              >
                                <Check className="w-4.5 h-4.5" />
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
          )}

        </div>
      )}

      {activeSubTab === 'mappings' && (
        <div className="space-y-6 text-left">
          
          {/* Mappings Schema info banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs text-slate-500">
            <p className="font-bold mb-1 font-mono uppercase text-[9.5px]">Relational Parent-Student Mapping Ledger</p>
            <p>The following mapping table dictates verified parent-student relationships across class rosters from approved registrations. Emergency contacts receive priority SMS and dial alerts.</p>
          </div>

          {/* Loading State */}
          {isLoadingMappings && (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Loading parent-student mappings...</p>
            </div>
          )}

          {/* Error State */}
          {mappingsError && !isLoadingMappings && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-400">{mappingsError}</p>
            </div>
          )}

          {/* Mapping Table */}
          {!isLoadingMappings && !mappingsError && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 font-mono text-[10px] font-bold uppercase">
                      <th className="py-3 px-5">Parent</th>
                      <th className="py-3 px-5">Verified Relationship</th>
                      <th className="py-3 px-5">Enrolled Pupil</th>
                      <th className="py-3 px-5">Roster Coordinates</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Emergency Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {mappingsData.length > 0 ? (
                      mappingsData.map((m) => (
                        <tr key={m.registration_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                          <td className="py-3 px-5 font-bold text-slate-900 dark:text-white">
                            {m.parent_first_name} {m.parent_last_name}
                          </td>
                          <td className="py-3 px-5">
                            <span className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-indigo dark:text-brand-sky font-bold text-[10px] font-mono">
                              {m.parent_relationship.charAt(0).toUpperCase() + m.parent_relationship.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-5 font-semibold text-slate-900 dark:text-white">
                            {m.student_first_name} {m.student_last_name}
                          </td>
                          <td className="py-3 px-5 font-mono">{m.student_grade_level}</td>
                          <td className="py-3 px-5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              m.status === 'enrolled' ? 'bg-emerald-500/10 text-emerald-600' : 
                              m.status === 'approved' ? 'bg-blue-500/10 text-blue-600' : 
                              'bg-slate-100 text-slate-550'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              m.emergency_contact ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-550'
                            }`}>
                              {m.emergency_contact ? '★ Primary Emergency' : 'Secondary Contact'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No parent-student mappings found. Approve registrations to create mappings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'feedback' && (
        <div className="space-y-6 text-left">
          
          {/* Feedback statistics counters */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Total Received Tickets</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{parentFeedbacks.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Awaiting Resolutions</span>
              <span className="text-xl font-black text-amber-500 font-mono">
                {parentFeedbacks.filter(f => f.status === 'Pending').length}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Resolved Concerns</span>
              <span className="text-xl font-black text-emerald-500 font-mono">
                {parentFeedbacks.filter(f => f.status === 'Resolved').length}
              </span>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingFeedback && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-400">Loading feedback tickets...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {feedbackError && !isLoadingFeedback && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{feedbackError}</p>
              <button className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600">
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingFeedback && !feedbackError && parentFeedbacks.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">No Feedback Tickets</h3>
              <p className="text-xs text-slate-400 mb-4">No parent feedback has been submitted yet.</p>
            </div>
          )}

          {/* Feedback items grid */}
          {!isLoadingFeedback && !feedbackError && parentFeedbacks.length > 0 && (
            <div className="space-y-4">
              {parentFeedbacks.map((fb) => (
                <div 
                  key={fb.id} 
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                    fb.status === 'Pending' ? 'border-amber-200 dark:border-amber-900/40 bg-amber-500/[0.01]' : 'border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{fb.parentName}</span>
                        <span className="text-slate-400 text-xs font-medium">guardian of {fb.studentName}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          fb.type === 'Complaint' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600' :
                          fb.type === 'Enquiry' ? 'bg-brand-blue/10 text-brand-indigo' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                        }`}>
                          {fb.type}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 font-bold">Ticket ID: {fb.id} • Submitted: {fb.date}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                      fb.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {fb.status === 'Resolved' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 animate-pulse" />}
                      <span>{fb.status}</span>
                    </span>
                  </div>

                  {/* Message detail block */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                    {fb.message}
                  </p>

                  {/* Resolution action content */}
                  {fb.status === 'Resolved' ? (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 text-xs text-left space-y-1">
                      <p className="font-mono text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Official resolution reply</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{fb.response}</p>
                    </div>
                  ) : (
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-850 pt-4 text-left">
                      {resolvingId === fb.id ? (
                        <div className="space-y-3 animate-fade-in">
                          <textarea
                            placeholder="Draft director resolution response to this ticket..."
                            value={resolutionResponse}
                            onChange={(e) => setResolutionResponse(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setResolvingId(null); setResolutionResponse(''); }}
                              className="px-3.5 py-1.5 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                if (!resolutionResponse.trim()) return;
                                resolveParentFeedback(fb.id, resolutionResponse);
                                setResolvingId(null);
                                setResolutionResponse('');
                              }}
                              className="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Resolution</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setResolvingId(fb.id); setResolutionResponse(''); }}
                          className="h-8 px-3 rounded-lg border border-brand-blue text-brand-blue hover:bg-brand-blue/5 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Address & Resolve Ticket</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ==============================================
          PARENT DETAILED DRAWER / PROFILE
          ============================================== */}
      <AnimatePresence>
        {showProfileModal && selectedParent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Guardian dossier</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4">
                
                <div className="flex gap-3 items-center">
                  <img 
                    src={selectedParent.photo || selectedParent.profile_picture_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} 
                    alt={selectedParent.name || selectedParent.full_name} 
                    className="w-12 h-12 rounded-xl object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-850 dark:text-white">{selectedParent.name || selectedParent.full_name}</h4>
                    <p className="text-[10.5px] text-slate-400 font-mono">Guardian ID: {selectedParent.id.substring(0, 8)}...</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border space-y-3.5 text-xs text-left">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Relationship</span>
                    <span className="font-bold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedParent.relationship || selectedParent.occupation || 'Parent'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Mobile Contact</span>
                    <span className="font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedParent.phone || 'N/A'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified Email Coordinates</span>
                    <span className="font-mono font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedParent.email || 'N/A'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                    <span className="font-semibold flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{selectedParent.emergency_contact || 'N/A'}</span>
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          ADD PARENT MODAL
          ============================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Add New Parent</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const parentData = {
                    full_name: formData.get('full_name') as string,
                    relationship: formData.get('relationship') as string,
                    emergency_contact: formData.get('emergency_contact') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                    name: formData.get('full_name') as string,
                    occupation: formData.get('relationship') as string,
                    address: '',
                    childrenCount: 0,
                    status: 'Active' as const
                  };
                  addParent(parentData);
                  setShowAddModal(false);
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Full Name *</label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    placeholder="Enter parent's full name"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Relationship</label>
                  <input
                    name="relationship"
                    type="text"
                    placeholder="e.g., Father, Mother, Guardian"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="parent@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Emergency Contact</label>
                  <input
                    name="emergency_contact"
                    type="text"
                    placeholder="Emergency contact number"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-xs"
                  >
                    Add Parent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================
          EDIT PARENT MODAL
          ============================================== */}
      <AnimatePresence>
        {showEditModal && selectedParent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Edit Parent</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const parentData = {
                    full_name: formData.get('full_name') as string,
                    relationship: formData.get('relationship') as string,
                    emergency_contact: formData.get('emergency_contact') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    status: formData.get('status') as 'active' | 'inactive' | 'suspended',
                    name: formData.get('full_name') as string,
                    occupation: formData.get('relationship') as string
                  };
                  updateParent(selectedParent.id, parentData);
                  setShowEditModal(false);
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Full Name</label>
                  <input
                    name="full_name"
                    type="text"
                    defaultValue={selectedParent.full_name || selectedParent.name}
                    placeholder="Enter parent's full name"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Relationship</label>
                  <input
                    name="relationship"
                    type="text"
                    defaultValue={selectedParent.relationship || selectedParent.occupation}
                    placeholder="e.g., Father, Mother, Guardian"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={selectedParent.phone}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedParent.email}
                    placeholder="parent@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Emergency Contact</label>
                  <input
                    name="emergency_contact"
                    type="text"
                    defaultValue={selectedParent.emergency_contact}
                    placeholder="Emergency contact number"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedParent.status === 'Active' ? 'active' : selectedParent.status === 'Inactive' ? 'inactive' : 'active'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none focus:border-brand-blue"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-xs"
                  >
                    Update Parent
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
