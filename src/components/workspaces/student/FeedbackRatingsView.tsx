/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, ClipboardList, Info, HelpCircle, Upload, CheckCircle, 
  Clock, CheckSquare, X, ShieldAlert, Megaphone, HelpCircle as HelpIcon, Trash2, Send
} from 'lucide-react';
import { TeacherRating, StudentFeedback, Announcement, initialAnnouncements, initialTeacherRatings, initialFeedback } from './StudentMockData';

interface FeedbackRatingsViewProps {
  activeSection: 'teacher_ratings' | 'feedback' | 'readmission' | 'announcements';
  announcements: Announcement[];
  ratings: TeacherRating[];
  feedbacks: StudentFeedback[];
  onUpdateAnnouncements: (ann: Announcement[]) => void;
  onUpdateRatings: (rat: TeacherRating[]) => void;
  onUpdateFeedbacks: (fdb: StudentFeedback[]) => void;
}

export const FeedbackRatingsView: React.FC<FeedbackRatingsViewProps> = ({
  activeSection,
  announcements,
  ratings,
  feedbacks,
  onUpdateAnnouncements,
  onUpdateRatings,
  onUpdateFeedbacks
}) => {
  
  // 1. Teacher Ratings State
  const [targetTeacher, setTargetTeacher] = useState('Dr. Evelyn Foster');
  const [targetSubject, setTargetSubject] = useState('AP Organic Chemistry');
  const [anonRating, setAnonRating] = useState(true);
  const [commentRating, setCommentRating] = useState('');
  
  // Rating Scores for Criteria (1-5 Stars)
  const [scores, setScores] = useState<Record<string, number>>({
    teachingQuality: 5,
    communication: 5,
    subjectKnowledge: 5,
    classManagement: 5,
    supportiveness: 5
  });

  const handleStarSelect = (criteria: string, score: number) => {
    setScores(prev => ({ ...prev, [criteria]: score }));
  };

  const submitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Object.keys(scores).reduce((acc, key) => acc + scores[key], 0);
    const overall = parseFloat((sum / 5).toFixed(1));
    const newRating: TeacherRating = {
      id: `RAT-00${ratings.length + 1}`,
      teacherName: targetTeacher,
      subject: targetSubject,
      date: new Date().toISOString().split('T')[0],
      teachingQuality: scores.teachingQuality,
      communication: scores.communication,
      subjectKnowledge: scores.subjectKnowledge,
      classManagement: scores.classManagement,
      supportiveness: scores.supportiveness,
      overallRating: overall,
      comment: commentRating,
      anonymous: anonRating
    };

    onUpdateRatings([newRating, ...ratings]);
    setCommentRating('');
    alert('Thank you! Anonymous faculty evaluation recorded.');
  };

  // 2. Feedback State
  const [fdbCategory, setFdbCategory] = useState<'Teaching' | 'Facilities' | 'Library' | 'Transportation' | 'School Environment' | 'Academic Support' | 'General Suggestions'>('GeneralSuggestions' as any);
  const [fdbSubject, setFdbSubject] = useState('');
  const [fdbMessage, setFdbMessage] = useState('');
  const [fdbAnon, setFdbAnon] = useState(true);

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newFdb: StudentFeedback = {
      id: `FDB-00${feedbacks.length + 1}`,
      subject: fdbSubject,
      category: fdbCategory,
      message: fdbMessage,
      date: new Date().toISOString().split('T')[0],
      anonymous: fdbAnon,
      status: 'Submitted'
    };

    onUpdateFeedbacks([newFdb, ...feedbacks]);
    setFdbSubject('');
    setFdbMessage('');
    alert('Your suggestion has been logged with the Student Council.');
  };

  // 3. Registration Form state
  const [regStatus, setRegStatus] = useState<'NotStarted' | 'Submitted' | 'Approved'>('NotStarted');
  const [regForm, setRegForm] = useState({
    parentConsent: false,
    electiveTrack: 'STEM Advanced Track',
    documentTranscript: 'transcript_uploaded.pdf',
    documentMedical: 'medical_form.pdf'
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus('Submitted');
  };

  // 4. Mark Announcement as Read
  const handleMarkAsRead = (id: string) => {
    const updated = announcements.map(a => a.id === id ? { ...a, read: true } : a);
    onUpdateAnnouncements(updated);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* =======================================================
          A. ANNOUNCEMENTS BOARD
          ======================================================= */}
      {activeSection === 'announcements' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">School Notice Desk</h3>
            <p className="text-[10px] text-slate-500 mt-1">Broadcast instructions targeted to your grade level and section division</p>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => {
              const priorityColors = 
                ann.priority === 'Emergency' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                ann.priority === 'High' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <div 
                  key={ann.id} 
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${ann.read ? 'border-slate-200' : 'border-brand-blue/30 shadow-xs'} transition-all`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2 items-center">
                      <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${priorityColors}`}>
                        {ann.priority} Notice
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 border px-1.5 py-0.2 rounded">
                        Target: {ann.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(ann.publishedDate).toLocaleString()}</span>
                      {!ann.read && (
                        <button
                          onClick={() => handleMarkAsRead(ann.id)}
                          className="text-[10px] font-mono font-bold text-brand-blue hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-3">{ann.title}</h3>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{ann.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================
          B. TEACHER EVALUATIONS
          ======================================================= */}
      {activeSection === 'teacher_ratings' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Submission Panel */}
          <form onSubmit={submitRating} className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Faculty Rating Form</h3>
              <p className="text-[10px] text-slate-500 mt-1">Submit completely anonymous feedback directly onto the student ledger</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Select Instructor</label>
                <select 
                  value={targetTeacher} 
                  onChange={(e) => setTargetTeacher(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                >
                  <option value="Dr. Evelyn Foster">Dr. Evelyn Foster</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Prof. Julian Vane">Prof. Julian Vane</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject Field</label>
                <input 
                  type="text" 
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none font-bold text-slate-500"
                />
              </div>
            </div>

            {/* Criteria Stars */}
            <div className="space-y-3 pt-2">
              {[
                { key: 'teachingQuality', label: 'Teaching Quality & Concept Delivery' },
                { key: 'communication', label: 'Response Time & Communication Quality' },
                { key: 'subjectKnowledge', label: 'Subject Competence & Laboratory Guidance' },
                { key: 'classManagement', label: 'Lecture Management & Environment' },
                { key: 'supportiveness', label: 'Individual Support & Mentoring' }
              ].map((crit) => (
                <div key={crit.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">{crit.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isLit = scores[crit.key] >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => handleStarSelect(crit.key, star)}
                          className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${isLit ? 'text-amber-500 fill-current' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Optional Evaluation Comment</label>
              <textarea
                rows={3}
                placeholder="Share any detailed perspectives regarding lecture patterns, assignments clarity..."
                value={commentRating}
                onChange={(e) => setCommentRating(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                <input 
                  type="checkbox" 
                  checked={anonRating} 
                  onChange={() => setAnonRating(!anonRating)}
                  className="rounded text-brand-blue" 
                />
                <span>Submit as anonymous user</span>
              </label>

              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold cursor-pointer shadow"
              >
                Submit Evaluation
              </button>
            </div>
          </form>

          {/* Previous Ratings (Right 2 columns) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Previous Evaluations</h3>
              <p className="text-[10px] text-slate-500">Your submitted records history</p>
            </div>

            <div className="space-y-3.5 max-h-[450px] overflow-y-auto">
              {ratings.map((rat, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border rounded-xl space-y-1.5 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 dark:text-slate-200">{rat.teacherName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rat.date}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-mono">Subject: {rat.subject}</p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Overall Rating: {rat.overallRating} / 5</span>
                  </div>
                  {rat.comment && <p className="italic text-slate-500 text-[10.5px]">"{rat.comment}"</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =======================================================
          C. FEEDBACK SUGGESTIONS
          ======================================================= */}
      {activeSection === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Form submission */}
          <form onSubmit={submitFeedback} className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Student Feedback Board</h3>
              <p className="text-[10px] text-slate-500 mt-1">Lodge suggestions or complaints regarding facilities, transportation, libraries...</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Feedback Category</label>
                <select 
                  value={fdbCategory} 
                  onChange={(e) => setFdbCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                >
                  <option value="Teaching">Faculty & Teaching</option>
                  <option value="Facilities">Campus Facilities</option>
                  <option value="Library">Library Catalogs</option>
                  <option value="Transportation">School Transportation</option>
                  <option value="School Environment">School Environment</option>
                  <option value="Academic Support">Academic Support Desk</option>
                  <option value="General Suggestions">General Suggestions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Subject Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Broken laboratory AC unit"
                  required
                  value={fdbSubject}
                  onChange={(e) => setFdbSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Suggestion Details Message</label>
              <textarea
                rows={4}
                placeholder="Elaborate details of the incident or your constructive suggestions for improvement..."
                required
                value={fdbMessage}
                onChange={(e) => setFdbMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                <input 
                  type="checkbox" 
                  checked={fdbAnon} 
                  onChange={() => setFdbAnon(!fdbAnon)}
                  className="rounded text-brand-blue" 
                />
                <span>Lodge anonymously with Student Council</span>
              </label>

              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold cursor-pointer shadow flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Ticket</span>
              </button>
            </div>
          </form>

          {/* Feedback logs history tracker */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Feedback Track Record</h3>
              <p className="text-[10px] text-slate-500">Track council review and resolution pipelines</p>
            </div>

            <div className="space-y-3">
              {feedbacks.map((f, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border rounded-xl text-xs text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 dark:text-slate-200">{f.subject}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full uppercase ${
                      f.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                    }`}>{f.status}</span>
                  </div>
                  
                  <p className="text-[10.5px] text-slate-500 leading-normal">"{f.message}"</p>
                  <p className="text-[9.5px] text-slate-400 font-mono">Category: {f.category} • {f.date}</p>
                  
                  {f.response && (
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border-l-2 border-brand-blue text-[10.5px] text-slate-600 dark:text-slate-400">
                      <strong>Admin response:</strong> "{f.response}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =======================================================
          D. ONLINE READMISSION
          ======================================================= */}
      {activeSection === 'readmission' && (() => {
        // Read administrator-set toggle value
        const isReadmissionAllowed = (() => {
          const stored = localStorage.getItem('educore-readmission-allowed');
          return stored === null ? true : stored === 'true';
        })();

        if (!isReadmissionAllowed) {
          return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Readmission Portal Locked</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto">
                The Online Readmission Portal for the 2026/2027 academic year has been temporarily locked by the system administrators. Please check back later or contact the Administration Office for clearance.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl inline-block font-mono text-[9.5px] text-slate-450">
                SYSTEM_ADMINISTRATOR_DIRECTIVE: READMISSION_STATUS = LOCKED
              </div>
            </div>
          );
        }

        return (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-left max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">2026/2027 Academic Readmission Portal</h3>
                <p className="text-[10.5px] text-slate-500 mt-1">Returning student fast-track re-enrollment and track allocation</p>
              </div>
              <span className="text-xs font-black font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded">Status: Open</span>
            </div>

            {regStatus === 'NotStarted' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Info Note */}
                <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/15 text-[11px] text-brand-indigo dark:text-brand-sky leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold font-mono text-[9.5px] uppercase">
                    <Info className="w-4 h-4 text-brand-blue" />
                    <span>Auto-Document Clearance Active</span>
                  </div>
                  <p>
                    Since you are currently an active student, the institution has already retained your complete digital portfolio on file. <strong>No new physical or digitized documents are required</strong> for this cycle.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Track */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-800 dark:text-white">Allocate Elective Division</h4>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-slate-400 uppercase font-bold block">Next Year Curriculum Track</label>
                      <select 
                        value={regForm.electiveTrack}
                        onChange={(e) => setRegForm(prev => ({ ...prev, electiveTrack: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border text-xs focus:outline-none"
                      >
                        <option value="STEM Advanced Track">STEM Advanced Track (Chemistry, Physics, Calculus BC)</option>
                        <option value="Humanities & Economics Track">Humanities & Economics Track (History, Microeconomics)</option>
                        <option value="General Honors Curriculum">General Honors Curriculum</option>
                      </select>
                    </div>
                  </div>

                  {/* Documents Verified Checklist */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-800 dark:text-white">Retained Records Checklist</h4>
                    <div className="space-y-2 text-[10.5px]">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Authenticated Transcripts
                        </span>
                        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold uppercase">On File</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Parental Release Form
                        </span>
                        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold uppercase">On File</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Campus Medical Portfolio
                        </span>
                        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold uppercase">On File</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                    <input 
                      type="checkbox" 
                      checked={regForm.parentConsent}
                      onChange={() => setRegForm(prev => ({ ...prev, parentConsent: !prev.parentConsent }))}
                      required
                      className="rounded text-brand-blue" 
                    />
                    <span>I confirm my readmission to the institution and accept academic terms.</span>
                  </label>

                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold cursor-pointer shadow self-end sm:self-auto"
                  >
                    Submit Readmission Request
                  </button>
                </div>

              </form>
            ) : (
              <div className="p-6 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-350 space-y-4">
                <Clock className="w-12 h-12 text-brand-blue mx-auto animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase font-mono tracking-wider">READMISSION REQUEST SUBMITTED</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
                    Your readmission request for Grade 11 has been successfully submitted. Since all required documents are already archived, the registrar will issue your 2026/2027 active timetable shortly.
                  </p>
                </div>
                <button 
                  onClick={() => setRegStatus('NotStarted')}
                  className="text-[11px] text-brand-blue hover:underline font-mono"
                >
                  Reset / Re-edit form
                </button>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
};
