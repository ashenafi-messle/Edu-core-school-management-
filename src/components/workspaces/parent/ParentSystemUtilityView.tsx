/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  Download, Calendar, User, Settings, Info, Save, Mail, 
  Phone, Home, Briefcase, Eye, Lock, ShieldCheck, FileText, CheckCircle2 
} from 'lucide-react';
import { ChildProfile, CalendarEvent } from './ParentMockData';

interface ParentSystemUtilityViewProps {
  selectedChild: ChildProfile;
  events: CalendarEvent[];
  mode: 'downloads' | 'calendar' | 'profile' | 'settings';
  parentProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    occupation: string;
    emergencyContact: string;
  };
  onUpdateProfile: (updated: any) => void;
}

export const ParentSystemUtilityView: React.FC<ParentSystemUtilityViewProps> = ({
  selectedChild,
  events,
  mode,
  parentProfile,
  onUpdateProfile
}) => {
  // Download states
  const [downloadFormat, setDownloadFormat] = useState<'PDF' | 'DOCX'>('PDF');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Profile Form States
  const [phone, setPhone] = useState(parentProfile.phone);
  const [address, setAddress] = useState(parentProfile.address);
  const [occupation, setOccupation] = useState(parentProfile.occupation);
  const [emergencyContact, setEmergencyContact] = useState(parentProfile.emergencyContact);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Settings States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const downloadDocuments = [
    { id: 'DOC-1', name: 'Term 1 Official Academic Report Card', type: 'Report Card', date: '2026-07-20' },
    { id: 'DOC-2', name: 'Term 1 Cumulative Attendance Audit Sheet', type: 'Attendance Log', date: '2026-07-20' },
    { id: 'DOC-3', name: 'Annual Tuition Payment Receipt Confirmation', type: 'Receipt', date: '2026-07-14' },
    { id: 'DOC-4', name: 'Disciplinary Advisory Conduct Briefing', type: 'Behavior Sheet', date: '2026-07-15' },
    { id: 'DOC-5', name: 'Registrar Promotion Placement Approval Slips', type: 'Registration Slip', date: '2026-07-05' }
  ];

  const handleDownload = (docId: string, docName: string) => {
    setDownloadingId(docId);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Successfully downloaded document: ${docName}.${downloadFormat.toLowerCase()}`);
    }, 1200);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ phone, address, occupation, emergencyContact });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Upper Information Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-blue uppercase px-2 py-0.5 bg-brand-blue/10 rounded">
            Guardian Utilities Console
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
            {mode === 'downloads' ? 'Official Document Download Center' :
             mode === 'calendar' ? 'Academic & Activities Calendar' :
             mode === 'profile' ? 'Guardian Personal Profile' : 'Guardian Account Configurations'}
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">
            Utilities active scope: <span className="font-bold text-slate-850 dark:text-white">{parentProfile.name} (Guardian)</span>
          </p>
        </div>
      </div>

      {/* RENDER DOWNLOADS CENTER */}
      {mode === 'downloads' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="text-left">
              <span className="font-black text-slate-800 dark:text-white block text-[12px]">Export Formats</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Select your preferred file format for official school records downloads</p>
            </div>

            <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
              <button
                onClick={() => setDownloadFormat('PDF')}
                className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black font-mono cursor-pointer transition-all ${
                  downloadFormat === 'PDF' ? 'bg-brand-blue text-white shadow' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Adobe PDF Document
              </button>
              <button
                onClick={() => setDownloadFormat('DOCX')}
                className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black font-mono cursor-pointer transition-all ${
                  downloadFormat === 'DOCX' ? 'bg-brand-blue text-white shadow' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                MS Word DOCX
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 text-[9.5px] uppercase font-bold">
                  <th className="py-3 px-5">Doc Reference No</th>
                  <th className="py-3 px-5">Document Name</th>
                  <th className="py-3 px-5">Document Category</th>
                  <th className="py-3 px-5">Generation Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {downloadDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                    <td className="py-4 px-5 font-bold text-brand-blue">{doc.id}</td>
                    <td className="py-4 px-5 font-sans font-black text-slate-850 dark:text-white">{doc.name}</td>
                    <td className="py-4 px-5 font-sans">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-bold text-[9.5px]">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-450">{doc.date}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDownload(doc.id, doc.name)}
                        disabled={downloadingId !== null}
                        className="px-4.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-[10.5px] shadow cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {downloadingId === doc.id ? 'Downloading...' : 'Download File'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER CALENDAR EVENTS LIST */}
      {mode === 'calendar' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans">Institutional Master Calendar</h4>
              <p className="text-[10.5px] text-slate-500 mt-0.5">Stay aligned with upcoming exams, meetings, deadlines and holidays</p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200/40 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border font-mono ${
                    ev.category === 'Examination' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    ev.category === 'Fee Deadline' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    ev.category === 'Holiday' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}>
                    <span className="text-[10px] uppercase font-black leading-none">{ev.start.split('-')[1]}</span>
                    <span className="text-sm font-black leading-none mt-1">{ev.start.split('-')[2]}</span>
                  </div>

                  <div className="space-y-1 flex-1 text-left">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{ev.title}</h4>
                      <span className={`text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        ev.category === 'Examination' ? 'bg-red-500/10 text-red-600' :
                        ev.category === 'Holiday' ? 'bg-emerald-500/10 text-emerald-600' :
                        ev.category === 'Fee Deadline' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-indigo-500/10 text-indigo-600'
                      }`}>
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-550 leading-relaxed max-w-3xl font-sans">{ev.description}</p>
                    <span className="text-[9.5px] font-mono text-slate-400 block pt-1">Term Date Reference: {ev.start}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER GUARDIAN PROFILE */}
      {mode === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-5 max-w-2xl">
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans">Guardian Demographics & Profile Update</h4>
            <p className="text-[10.5px] text-slate-500 mt-0.5">Edit contact information permitted under school registrar policies</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Full Name (Read Only)</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    disabled
                    value={parentProfile.name}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">E-Mail Address (Read Only)</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={parentProfile.email}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Contact Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-200 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Guardian Occupation</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-200 focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Home Physical Address</label>
              <div className="relative flex items-center">
                <Home className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-200 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Secondary / Emergency Backup Contact</label>
              <input
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-200 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-4">
            {profileSuccess && (
              <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile Saved Successfully!</span>
              </span>
            )}
            <div />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Details</span>
            </button>
          </div>
        </form>
      )}

      {/* RENDER ACCOUNT SETTINGS */}
      {mode === 'settings' && (
        <form onSubmit={handleSettingsSave} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-5 max-w-2xl text-xs">
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans">Guardian Account Configurations</h4>
            <p className="text-[10.5px] text-slate-500 mt-0.5">Control SMS notification parameters, direct alert channels and security locks</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Communication Alerts</h4>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <div className="space-y-0.5 text-left">
                  <span className="font-bold text-slate-850 dark:text-slate-200 block text-[11px]">Direct E-Mail Alerts</span>
                  <p className="text-[10px] text-slate-500">Receive exam schedules, bulletin flyers and grade report slips direct</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <div className="space-y-0.5 text-left">
                  <span className="font-bold text-slate-850 dark:text-slate-200 block text-[11px]">Real-Time SMS Bulletins</span>
                  <p className="text-[10px] text-slate-500">Get severe weather updates, bus delay notices and emergency alerts on phone</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue cursor-pointer"
                />
              </div>
            </div>

            <h4 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b pb-1 pt-3">Account Protection</h4>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <div className="space-y-0.5 text-left">
                  <span className="font-bold text-slate-850 dark:text-slate-200 block text-[11px] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Two-Factor Core Authentication (2FA)</span>
                  </span>
                  <p className="text-[10px] text-slate-500">Authenticate session entries with verified phone SMS codes</p>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-4">
            {settingsSuccess && (
              <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Account Configs Saved!</span>
              </span>
            )}
            <div />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings Configs</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
