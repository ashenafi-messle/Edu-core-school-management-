/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, HelpCircle, User, Sliders, Save, Plus, X, 
  Send, Shield, RefreshCw, KeyRound, Check, AlertCircle, FileText, 
  Building2, Globe, Trash2, Edit3, Loader2, Calendar
} from 'lucide-react';
import { SchoolConfig, SupportTicket } from './AdminTypes';
import { api } from '../../../lib/api';

// ============================================================================
// 1. SCHOOL CONFIGURATION COMPONENT
// ============================================================================

interface SchoolConfigurationProps {
  config: SchoolConfig;
  onUpdateConfig: (updated: Partial<SchoolConfig>) => void;
  triggerToast: (msg: string) => void;
}

export const SchoolConfiguration: React.FC<SchoolConfigurationProps> = ({
  config,
  onUpdateConfig,
  triggerToast
}) => {
  const [loading, setLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    setLoading(true);
    try {
      const schoolId = api.getSchoolId();
      if (schoolId) {
        const school = await api.getSchoolDetails(schoolId);
        setSchoolData(school);
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update school configuration
      onUpdateConfig(config);
      triggerToast("School identity and configurations updated successfully.");
    } catch (error) {
      console.error('Failed to update school config:', error);
      triggerToast("Failed to update school configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* School Information Display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              School Information
            </h3>
            <p className="text-xs text-slate-450">Your school's details and configuration</p>
          </div>
          <button
            onClick={loadSchoolData}
            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            <span className="ml-2 text-sm text-slate-500">Loading school information...</span>
          </div>
        ) : schoolData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">School Name</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{schoolData.name}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">Subdomain</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{schoolData.subdomain || 'Not configured'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">Domain</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{schoolData.domain || 'Not configured'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">Status</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold font-mono uppercase ${
                  schoolData.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                  schoolData.status === 'suspended' ? 'bg-amber-100 text-amber-600' : 
                  'bg-slate-100 text-slate-600'
                }`}>
                  {schoolData.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">Created Date</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {schoolData.created_at ? new Date(schoolData.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-brand-blue" />
                  <span className="text-[10px] font-mono uppercase text-slate-450">Last Updated</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {schoolData.updated_at ? new Date(schoolData.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl border border-brand-blue/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-brand-blue" />
                <span className="text-[10px] font-mono uppercase text-brand-blue">School ID</span>
              </div>
              <p className="text-xs font-mono text-brand-blue truncate">{schoolData.id}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No school information available. Please ensure you are logged in with a valid school account.</p>
          </div>
        )}
      </div>


    </div>
  );
};

// ============================================================================
// 2. NOTIFICATION CENTER COMPONENT
// ============================================================================

export const NotificationCenter: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [template, setTemplate] = useState(
    "Dear Parent, this is a friendly billing notice that your child's remaining tuition balance of $1200 is past due. Please settle via the Parent portal."
  );

  const handleDispatchTest = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Test broadcast dispatched to parents cluster via SMS gateway.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Template Broadcaster */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Notification Blast Templates</h3>
          <p className="text-xs text-slate-450">Broadcast templates to emergency contact lists</p>
        </div>

        <form onSubmit={handleDispatchTest} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-440 uppercase font-bold block">Broadcast Text Body (SMS/Push)</label>
            <textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-sans"
            />
          </div>

          <button
            type="submit"
            className="h-10 px-5 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast SMS Alert Blast</span>
          </button>
        </form>
      </div>

      {/* Dispatched Logs */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 font-mono text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Blast Logs</h3>
          <p className="text-xs text-slate-450">Outbox queues for central messaging cluster</p>
        </div>

        <div className="space-y-2.5">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 rounded-lg">
            <span className="text-[10px] text-emerald-500 font-bold block">✔ DISPATCHED (78 recipients)</span>
            <p className="text-[10.5px] mt-0.5 text-slate-700 dark:text-slate-350 font-sans">"End of Term report cards released. Check Portal."</p>
            <span className="text-[10px] text-slate-400 block mt-1">Today, 09:15 AM</span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 rounded-lg">
            <span className="text-[10px] text-emerald-500 font-bold block">✔ DISPATCHED (4 Recipients)</span>
            <p className="text-[10.5px] mt-0.5 text-slate-700 dark:text-slate-350 font-sans">"Billing reminder for Overdue Tuition accounts."</p>
            <span className="text-[10px] text-slate-400 block mt-1">Yesterday, 04:00 PM</span>
          </div>
        </div>
      </div>

    </div>
  );
};

// ============================================================================
// 3. SUPPORT CENTER (TECHNICAL TICKETS TRIAGE)
// ============================================================================

interface SupportCenterProps {
  tickets: SupportTicket[];
  onReplyTicket: (id: string, text: string) => void;
  onCloseTicket: (id: string) => void;
  triggerToast: (msg: string) => void;
}

export const SupportCenter: React.FC<SupportCenterProps> = ({
  tickets,
  onReplyTicket,
  onCloseTicket,
  triggerToast
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicketId) return;
    onReplyTicket(selectedTicketId, replyText);
    triggerToast("Response posted successfully to technical ticket thread.");
    setReplyText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* List of open tickets */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Central Support Ticket Triage</h3>
          <p className="text-xs text-slate-450">Staff, directors, and teachers technical portal inquiries</p>
        </div>

        <div className="divide-y divide-slate-100">
          {tickets.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between text-xs font-sans">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white">{t.subject}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-450 font-mono">
                  <span>{t.id}</span>
                  <span>•</span>
                  <span>Submitted by: {t.user} ({t.role})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                  t.priority === 'High' ? 'bg-red-100 text-red-700' :
                  t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.priority}
                </span>

                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                  t.status === 'Open' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {t.status}
                </span>

                <button
                  onClick={() => setSelectedTicketId(t.id)}
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 font-mono text-xs font-bold rounded cursor-pointer"
                >
                  Triage Thread
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* active thread viewport */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-xs font-mono">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Thread Viewer</h3>

        {selectedTicket ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-black">Ticket Target {selectedTicket.id}</span>
              <p className="font-bold font-sans text-slate-850 dark:text-white text-[12.5px] leading-tight">{selectedTicket.subject}</p>
              <p className="text-xs text-slate-450">Category: {selectedTicket.category}</p>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {/* Question */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150">
                <span className="text-[10px] text-slate-400 block mb-1">Inquiry Description:</span>
                <p className="font-sans text-slate-850 dark:text-white text-sm leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Replies */}
              {selectedTicket.replies.map((r) => (
                <div key={r.id} className={`p-2.5 rounded-xl border ${r.sender === 'admin' ? 'bg-brand-blue/5 border-brand-blue/15 ml-4' : 'bg-slate-50/50 border-slate-150'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">{r.sender} • {r.timestamp}</span>
                  <p className="font-sans text-slate-850 dark:text-white text-sm leading-tight">{r.text}</p>
                </div>
              ))}
            </div>

            {/* Input reply form */}
            {selectedTicket.status !== 'Closed' && (
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Draft administrator response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 h-9 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseTicket(selectedTicket.id);
                      triggerToast(`Support ticket ${selectedTicket.id} marked RESOLVED & Closed.`);
                      setSelectedTicketId(null);
                    }}
                    className="h-9 px-3 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-500/5 font-bold cursor-pointer"
                  >
                    Resolve & Close
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-450 italic text-xs">
            Please select "Triage Thread" on a ticket row to open the active communication logs.
          </div>
        )}
      </div>

    </div>
  );
};

// ============================================================================
// 4. GLOBAL SYSTEM SETTINGS COMPONENT
// ============================================================================

export const GlobalSystemSettings: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [dateFmt, setDateFmt] = useState('YYYY-MM-DD');
  const [timeFmt, setTimeFmt] = useState('12-hour AM/PM');
  const [auditRet, setAuditRet] = useState('180 days');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Application localization configurations updated successfully.");
  };

  return (
    <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs text-left">
      <div>
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">System Variables & Localization</h3>
        <p className="text-[10px] text-slate-450">Configure global date/time presets and log retention limits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="space-y-1">
          <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Date Format representation</label>
          <select
            value={dateFmt}
            onChange={(e) => setDateFmt(e.target.value)}
            className="w-full h-10 px-2 border border-slate-200 rounded-lg cursor-pointer"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-20)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (20/07/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (07/20/2026)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Clock representation</label>
          <select
            value={timeFmt}
            onChange={(e) => setTimeFmt(e.target.value)}
            className="w-full h-10 px-2 border border-slate-200 rounded-lg cursor-pointer"
          >
            <option value="12-hour AM/PM">12-hour clock (02:19 AM)</option>
            <option value="24-hour standard">24-hour clock (02:19)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Audit Trails Retention</label>
          <select
            value={auditRet}
            onChange={(e) => setAuditRet(e.target.value)}
            className="w-full h-10 px-2 border border-slate-200 rounded-lg cursor-pointer"
          >
            <option value="90 days">90 days (Recommended for testing)</option>
            <option value="180 days">180 days (Recommended for audits)</option>
            <option value="365 days">365 days (PCI Compliance level)</option>
            <option value="Forever">Forever (Immutable logging)</option>
          </select>
        </div>

      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="h-10 px-5 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Save className="w-4 h-4" />
          <span>Save System Formats</span>
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// 5. ADMINISTRATOR PERSONAL PROFILE VIEW
// ============================================================================

export const AdminProfileView: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [pname, setPname] = useState('Alexander Sterling');
  const [pemail, setPemail] = useState('alex.sterling@educore.edu');
  const [pphone, setPphone] = useState('+1 (555) 000-0001');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Administrator details saved.");
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass) return;
    triggerToast("Administrator root authentication credentials modified.");
    setOldPass('');
    setNewPass('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      {/* Profile Details form */}
      <form onSubmit={handleProfileSubmit} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Administrator Profile</h3>
          <p className="text-[10px] text-slate-450">Personal identity records in active root session</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Admin Operator Name</label>
            <input
              type="text"
              required
              value={pname}
              onChange={(e) => setPname(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Email Address</label>
            <input
              type="email"
              required
              value={pemail}
              onChange={(e) => setPemail(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Phone Contact</label>
            <input
              type="text"
              required
              value={pphone}
              onChange={(e) => setPphone(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Details</span>
        </button>
      </form>

      {/* Password Overwrite form */}
      <form onSubmit={handleChangePass} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Credential Rollover</h3>
          <p className="text-[10px] text-slate-450">Securely roll over the Administrator authentication token</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Current Root Password</label>
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-450 font-bold uppercase block">New Root Password</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Commit Password Overwrite</span>
        </button>
      </form>

    </div>
  );
};
