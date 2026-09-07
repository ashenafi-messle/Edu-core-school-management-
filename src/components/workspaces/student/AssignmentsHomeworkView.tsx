/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, BookMarked, Award, Calendar, Upload, Download, 
  Trash2, Plus, CheckCircle, ArrowRight, X, Eye, HelpCircle, Save, Info
} from 'lucide-react';
import { Assignment, Homework } from './StudentMockData';

interface AssignmentsHomeworkViewProps {
  assignments: Assignment[];
  homework: Homework[];
  onUpdateAssignments: (asg: Assignment[]) => void;
  onUpdateHomework: (hw: Homework[]) => void;
}

export const AssignmentsHomeworkView: React.FC<AssignmentsHomeworkViewProps> = ({
  assignments,
  homework,
  onUpdateAssignments,
  onUpdateHomework
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'homework'>('assignments');
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  
  // Submission Form State
  const [draftSubNotes, setDraftSubNotes] = useState('');
  const [subFormat, setSubFormat] = useState('PDF');
  const [fileName, setFileName] = useState('');
  const [savedDraft, setSavedDraft] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const fileFormats = ['PDF', 'DOCX', 'PPTX', 'ZIP', 'Images', 'TXT', 'Audio', 'Video', 'Links'];

  const handleOpenSubmission = (asg: Assignment) => {
    setSelectedAsg(asg);
    setDraftSubNotes(asg.submission?.studentComments || '');
    setSubFormat(asg.submission?.fileFormat || 'PDF');
    setFileName(asg.submission?.fileName || '');
    setSavedDraft(false);
    setSubmissionSuccess(false);
  };

  const handleSaveDraft = () => {
    if (!selectedAsg) return;
    setSavedDraft(true);
    const updated = assignments.map(a => {
      if (a.id === selectedAsg.id) {
        return {
          ...a,
          status: 'Draft' as const,
          submission: {
            submittedDate: new Date().toISOString(),
            fileFormat: subFormat,
            fileName: fileName || `${selectedAsg.title.toLowerCase().replace(/\s+/g, '_')}_draft.${subFormat.toLowerCase()}`,
            studentComments: draftSubNotes
          }
        };
      }
      return a;
    });
    onUpdateAssignments(updated);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    setSubmissionSuccess(true);
    const updated = assignments.map(a => {
      if (a.id === selectedAsg.id) {
        return {
          ...a,
          status: 'Submitted' as const,
          submission: {
            submittedDate: new Date().toISOString(),
            fileFormat: subFormat,
            fileName: fileName || `${selectedAsg.title.toLowerCase().replace(/\s+/g, '_')}_final.${subFormat.toLowerCase()}`,
            studentComments: draftSubNotes
          }
        };
      }
      return a;
    });
    onUpdateAssignments(updated);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedAsg(null);
    }, 1500);
  };

  const handleCompleteHomework = (hwId: string) => {
    const updated = homework.map(h => {
      if (h.id === hwId) {
        return { ...h, status: 'Completed' as const, feedback: 'Successfully submitted. Under general grade review.' };
      }
      return h;
    });
    onUpdateHomework(updated);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header Tab Selector */}
      <div className="flex items-center justify-between border-b pb-1">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-2.5 text-sm font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'assignments' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Syllabus Assignments
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`pb-2.5 text-sm font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'homework' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Subject Homework
          </button>
        </div>

        <span className="text-[10.5px] text-slate-400 font-mono hidden md:inline">
          Academic Term: 2025/2026 Semester 2
        </span>
      </div>

      {/* 2. Content view */}
      {activeTab === 'assignments' ? (
        
        // Assignments Grid
        <div className="space-y-4">
          {assignments.map((asg) => (
            <div 
              key={asg.id} 
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-blue/30 transition-all duration-300"
            >
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9.5px] font-mono bg-brand-blue/10 text-brand-blue font-bold px-2 py-0.5 rounded-full">
                    {asg.subject}
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 px-1.5 py-0.2 rounded">
                    {asg.id}
                  </span>
                  <span className="text-[10px] text-slate-400">• Marks: {asg.marks}</span>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">{asg.title}</h3>
                <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">{asg.instructions}</p>
                
                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-mono">
                  <span>Instructor: {asg.teacher}</span>
                  <span>•</span>
                  <span>Due: <strong className="text-slate-600 dark:text-slate-350">{new Date(asg.dueDate).toLocaleDateString()}</strong></span>
                </div>

                {/* Attachments Section */}
                {(asg.attachments || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(asg.attachments || []).map((file, fIdx) => (
                      <button 
                        key={fIdx}
                        onClick={() => alert(`Downloading ${file.name} ...`)}
                        className="h-7 px-2.5 rounded-lg border border-dashed border-slate-200 hover:border-brand-blue dark:border-slate-800 text-[10px] font-mono font-bold text-slate-500 hover:text-brand-blue flex items-center gap-1 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>{file.name} ({file.size})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between border-t md:border-transparent pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full font-mono uppercase tracking-wide block ${
                    asg.status === 'Graded' ? 'bg-emerald-500/10 text-emerald-600' :
                    asg.status === 'Submitted' ? 'bg-blue-500/10 text-blue-500' :
                    asg.status === 'Draft' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {asg.status}
                  </span>
                  {asg.status === 'Graded' && asg.submission?.score && (
                    <span className="text-xs font-black font-mono text-emerald-500 mt-1 block">
                      Score: {asg.submission.score} / {asg.marks}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {asg.status === 'Graded' ? (
                    <button 
                      onClick={() => handleOpenSubmission(asg)}
                      className="h-9 px-3 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-950 text-[11px] font-bold flex items-center gap-1 text-slate-600 dark:text-slate-350 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review Feedback</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenSubmission(asg)}
                      className="h-9 px-4.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{asg.status === 'Draft' || asg.status === 'Submitted' ? 'Edit Submission' : 'Upload Submission'}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      ) : (

        // Homework Grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {homework.map((hw) => (
            <div 
              key={hw.id} 
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-blue/25 transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-mono bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">{hw.subject}</span>
                  <span className="text-[9.5px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 border px-1.5 py-0.2 rounded">{hw.id}</span>
                </div>
                
                <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{hw.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{hw.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">Instructor: {hw.teacher}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block">Roster Status</span>
                  <span className={`text-[10px] font-bold font-mono ${hw.status === 'Completed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {hw.status}
                  </span>
                </div>

                {hw.status === 'Pending' ? (
                  <button
                    onClick={() => handleCompleteHomework(hw.id)}
                    className="h-8 px-3 rounded-lg bg-brand-blue hover:bg-brand-indigo text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Complete</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-[10.5px] text-slate-400 font-mono">
                    {hw.feedback && <span className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded border italic">Feedback: {hw.feedback}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      )}

      {/* 3. Interactive Submission Modal / Workspace */}
      <AnimatePresence>
        {selectedAsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsg(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase font-bold">COURSEWORK FLOW • {selectedAsg.id}</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{selectedAsg.title}</h3>
                </div>
                <button onClick={() => setSelectedAsg(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4 overflow-y-auto flex-1">
                {selectedAsg.status === 'Graded' ? (
                  
                  // Read Only Feedback Screen
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black font-mono text-emerald-500">GRADING ACCREDITATION</span>
                        <span className="text-sm font-black font-mono text-emerald-500">
                          {selectedAsg.submission?.score} / {selectedAsg.marks}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Instructor Feedback: "{selectedAsg.submission?.feedback || 'Well researched response. Marks successfully recorded.'}"
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Your Original Submission</label>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-1">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">{selectedAsg.submission?.fileName}</p>
                        <p className="text-[10.5px] text-slate-500 leading-normal">Your notes: "{selectedAsg.submission?.studentComments || 'No notes left'}"</p>
                      </div>
                    </div>
                  </div>

                ) : (

                  // Editing Screen
                  <div className="space-y-4">
                    
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed flex items-start gap-2 text-[11px] text-slate-500">
                      <Info className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Course assignments can be saved as a local draft. Before the due date, drafts can be edited and uploaded repeatedly.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Submission Format</label>
                        <select
                          value={subFormat}
                          onChange={(e) => setSubFormat(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                        >
                          {fileFormats.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400">File / Link Name</label>
                        <input
                          type="text"
                          placeholder="e.g. chemistry_lab_v2.pdf"
                          required
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Student Comments / Notes</label>
                      <textarea
                        rows={4}
                        placeholder="Type any reference arguments, bibliography notes, or technical challenges..."
                        value={draftSubNotes}
                        onChange={(e) => setDraftSubNotes(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        {savedDraft && <span className="text-amber-500 font-bold">✓ Draft Saved</span>}
                        {submissionSuccess && <span className="text-emerald-500 font-bold">✓ Coursework Uploaded</span>}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-350 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Draft</span>
                        </button>
                        
                        <button
                          type="submit"
                          className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Submit Final</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
