/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Send, Paperclip, Check, AlertTriangle, 
  HelpCircle, EyeOff, ClipboardList, Clock, Info, CheckCircle2 
} from 'lucide-react';
import { ChildProfile, MessageThread, FeedbackSubmission, ParentAnnouncement } from './ParentMockData';

interface ParentCommunicationFeedbackViewProps {
  selectedChild: ChildProfile;
  announcements: ParentAnnouncement[];
  messageThreads: MessageThread[];
  feedbackSubmissions: FeedbackSubmission[];
  mode: 'messages' | 'announcements' | 'feedback' | 'teacher_communication';
  onSendMessage: (threadId: string, text: string) => void;
  onSubmitFeedback: (feedback: any) => void;
  onMarkAnnouncementRead: (id: string) => void;
}

export const ParentCommunicationFeedbackView: React.FC<ParentCommunicationFeedbackViewProps> = ({
  selectedChild,
  announcements,
  messageThreads,
  feedbackSubmissions,
  mode,
  onSendMessage,
  onSubmitFeedback,
  onMarkAnnouncementRead
}) => {
  // Chat state
  const [activeThreadId, setActiveThreadId] = useState(messageThreads[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  
  // Feedback state
  const [feedbackRecipient, setFeedbackRecipient] = useState<'Teacher' | 'Director' | 'Administration'>('Teacher');
  const [feedbackCategory, setFeedbackCategory] = useState<'Teaching Quality' | 'Student Welfare' | 'School Environment' | 'Communication' | 'Facilities' | 'Transportation' | 'General Suggestions'>('General Suggestions');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Send message callback
  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(activeThreadId, messageText);
    setMessageText('');
  };

  const activeThread = messageThreads.find(t => t.id === activeThreadId) || messageThreads[0];

  // Submit feedback
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setTimeout(() => {
      setSubmittingFeedback(false);
      setFeedbackSuccess(true);
      onSubmitFeedback({
        id: `FEED-${Date.now()}`,
        recipient: feedbackRecipient,
        category: feedbackCategory,
        subject: feedbackSubject,
        message: feedbackMsg,
        date: new Date().toISOString().split('T')[0],
        anonymous: isAnonymous,
        status: 'Submitted'
      });
      setTimeout(() => {
        setFeedbackSuccess(false);
        setFeedbackSubject('');
        setFeedbackMsg('');
        setIsAnonymous(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-blue uppercase px-2 py-0.5 bg-brand-blue/10 rounded">
            Communication Portal
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
            {mode === 'announcements' ? 'Institutional Bulletin Board' :
             mode === 'feedback' ? 'Parent Feedback Console' : 'Secure Message Hotline'}
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">
            Communication target: <span className="font-bold text-slate-850 dark:text-white">{selectedChild.name} ({selectedChild.grade})</span>
          </p>
        </div>
      </div>

      {/* RENDER MESSAGES AND TEACHER CHAT */}
      {(mode === 'messages' || mode === 'teacher_communication') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px] overflow-hidden">
          
          {/* Thread list */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-3 overflow-y-auto">
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans border-b pb-2">Instructors Contacts</h4>
            <div className="space-y-2">
              {messageThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    activeThreadId === thread.id
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-slate-200/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue font-bold flex items-center justify-center">
                      {thread.teacherAvatar}
                    </div>
                    <div className="min-w-0 text-left">
                      <h5 className="text-[11.5px] font-black text-slate-800 dark:text-white truncate">{thread.teacherName}</h5>
                      <span className="text-[9.5px] text-slate-450 truncate block mt-0.5">{thread.teacherSubject}</span>
                    </div>
                  </div>
                  {thread.unread && <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />}
                </div>
              ))}
            </div>
          </div>

          {/* Active conversation space */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden">
            {activeThread ? (
              <div className="flex flex-col h-full justify-between overflow-hidden">
                
                {/* Active contact details */}
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-850">
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{activeThread.teacherName}</h4>
                    <p className="text-[10px] text-slate-450 font-mono mt-0.5">Assigned Teacher Advisory • STU-1001 Dossier</p>
                  </div>
                  <span className="text-[9.5px] font-mono px-2 py-0.5 bg-emerald-500/15 text-emerald-600 rounded">
                    Online Advisor
                  </span>
                </div>

                {/* Messages ledger */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1 scrollbar-thin">
                  {activeThread.messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs rounded-2xl p-3.5 text-xs text-left leading-relaxed ${
                        msg.sender === 'parent'
                          ? 'bg-brand-blue text-white rounded-br-none'
                          : msg.sender === 'system'
                          ? 'bg-amber-500/10 text-amber-600 rounded-none italic border-l-2 border-amber-500 font-mono'
                          : 'bg-slate-50/75 dark:bg-slate-950 border border-slate-200/40 text-slate-700 dark:text-slate-350 rounded-bl-none'
                      }`}>
                        <p>{msg.text}</p>
                        <span className={`block font-mono text-[8px] mt-1 text-right ${
                          msg.sender === 'parent' ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          {msg.timestamp.split('T')[1].slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct message writer form */}
                <form onSubmit={handleChatSend} className="border-t border-slate-100 dark:border-slate-850 pt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type safe secure parent advisory reply..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Simulated file attach triggered successfully.")}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            ) : (
              <p className="text-xs italic text-slate-400 m-auto text-center">Please select a thread on the left directory to chat.</p>
            )}
          </div>

        </div>
      )}

      {/* RENDER ANNOUNCEMENTS */}
      {mode === 'announcements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border text-left space-y-4 shadow-xs relative ${
                  ann.priority === 'Emergency' 
                    ? 'border-red-500/40 bg-gradient-to-br from-white to-red-500/5' 
                    : ann.priority === 'High'
                    ? 'border-amber-500/30'
                    : 'border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start flex-wrap gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        ann.priority === 'Emergency' ? 'bg-red-500 text-white animate-pulse' :
                        ann.priority === 'High' ? 'bg-amber-500/15 text-amber-600' :
                        'bg-blue-500/15 text-blue-600'
                      }`}>
                        {ann.priority} Notice
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-400">• Published: {ann.publishedDate.replace('T', ' ')}</span>
                    </div>
                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white leading-snug">{ann.title}</h4>
                  </div>

                  {!ann.read && (
                    <button 
                      onClick={() => onMarkAnnouncementRead(ann.id)}
                      className="text-[10px] font-black text-brand-blue hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed max-w-4xl font-sans">{ann.description}</p>

                {/* Announcement Image preview if available */}
                {ann.images && ann.images[0] && (
                  <div className="w-full max-h-48 overflow-hidden rounded-2xl border border-slate-200/40">
                    <img src={ann.images[0]} alt="Announcement Visual" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* File attachments */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1.5">
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold block">BULLETIN ATTACHMENTS</span>
                    {ann.attachments.map((file, i) => (
                      <button
                        key={i}
                        onClick={() => alert(`Downloading bulletin document: ${file.name}`)}
                        className="p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-[10.5px] font-mono text-slate-650 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span>{file.name} ({file.size})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER FEEDBACK FORM */}
      {mode === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <form onSubmit={handleFeedbackSubmit} className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-5">
            <div>
              <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans">Submit Official Feedback Form</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Send standard critiques or suggestions to academy directors & administrators</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Feedback Recipient</label>
                  <select
                    value={feedbackRecipient}
                    onChange={(e) => setFeedbackRecipient(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                  >
                    <option value="Teacher">Assigned Class Instructor</option>
                    <option value="Director">Campus Director Board</option>
                    <option value="Administration">School General Administration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Evaluation Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                  >
                    <option value="Teaching Quality">Teaching Quality</option>
                    <option value="Student Welfare">Student Welfare</option>
                    <option value="School Environment">School Environment</option>
                    <option value="Facilities">Campus Physical Facilities</option>
                    <option value="Transportation">Bus & Transit Schedules</option>
                    <option value="General Suggestions">General Suggestions</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Advisory Subject Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Subject title..."
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Detailed Critique / Suggestion Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type constructive school suggestion details here..."
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none resize-none"
                />
              </div>

              {/* Anonymous option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <span>Submit Anonymously</span>
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight">Shield guardian name from recipient logs (System retains proof for emergency Weather advisories only)</p>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-150 dark:border-slate-850 flex justify-between items-center gap-4">
              <span className="text-[10px] text-slate-450 leading-tight block max-w-sm">
                Feedback forms are routed securely through school director channels for comprehensive evaluations.
              </span>

              <button
                type="submit"
                disabled={submittingFeedback || feedbackSuccess}
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-xs shadow disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submittingFeedback ? 'Submitting Form...' : feedbackSuccess ? 'Feedback Submitted!' : 'Send Feedback Form'}
              </button>
            </div>
          </form>

          {/* Feedback list */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 h-[520px] overflow-y-auto">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans border-b pb-2">Submitted Feedbacks Status</h4>
            <div className="space-y-3">
              {feedbackSubmissions.map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 space-y-2">
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <span className="text-[10px] font-bold text-brand-blue font-mono">{fb.id}</span>
                    <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      fb.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' :
                      fb.status === 'Under Review' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {fb.status}
                    </span>
                  </div>

                  <h5 className="text-[11.5px] font-black text-slate-800 dark:text-white line-clamp-1">{fb.subject}</h5>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed line-clamp-2">"{fb.message}"</p>
                  
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400 border-t border-slate-200/20 pt-2 mt-1">
                    <span>{fb.date}</span>
                    <span>{fb.anonymous ? 'Anonymous' : 'Name Visible'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
