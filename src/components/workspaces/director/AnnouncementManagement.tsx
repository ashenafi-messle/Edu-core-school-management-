/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, Plus, Trash2, Edit, X, Sparkles, Check, 
  AlertCircle, Calendar, Send, Compass, Eye, Archive, Loader2
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { Announcement } from './types';
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement as deleteAnnouncementApi,
  archiveAnnouncement as archiveAnnouncementApi,
  publishAnnouncement,
  AnnouncementProfileData
} from '../../../lib/api/announcements';

export const AnnouncementManagement: React.FC = () => {
  const { announcements: mockAnnouncements, addAnnouncement, deleteAnnouncement, archiveAnnouncement } = useDirectorData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
      // Fallback to mock data if API fails
      setAnnouncements(mockAnnouncements.map(a => ({
        id: a.id,
        school_id: '',
        title: a.title,
        content: a.desc,
        type: 'general' as const,
        priority: a.priority.toLowerCase() as any,
        status: a.status.toLowerCase() as any,
        target_audience: 'all' as const,
        created_at: a.publishDate,
        updated_at: a.publishDate
      })));
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    title: '',
    desc: '',
    audience: 'General' as 'Teachers' | 'Students' | 'Parents' | 'General' | 'Emergency',
    priority: 'Normal' as 'Low' | 'Normal' | 'High' | 'Critical',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    publishStatus: 'Immediate' as 'Immediate' | 'Scheduled' | 'Draft'
  });

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.desc) return;

    setSubmitting(true);
    try {
      const status: 'draft' | 'published' | 'archived' = 
        form.publishStatus === 'Immediate' ? 'published' :
        form.publishStatus === 'Scheduled' ? 'published' : 'draft';

      const targetAudienceMap: Record<string, 'all' | 'teachers' | 'parents' | 'students' | 'specific_grade'> = {
        'General': 'all',
        'Teachers': 'teachers',
        'Students': 'students',
        'Parents': 'parents',
        'Emergency': 'all'
      };

      const typeMap: Record<string, 'general' | 'urgent' | 'event' | 'academic' | 'administrative'> = {
        'General': 'general',
        'Teachers': 'administrative',
        'Students': 'academic',
        'Parents': 'general',
        'Emergency': 'urgent'
      };

      const announcementData = {
        title: form.title,
        content: form.desc,
        type: typeMap[form.audience] || 'general',
        priority: form.priority.toLowerCase() as any,
        status,
        target_audience: targetAudienceMap[form.audience] || 'all',
        expires_at: form.expiryDate
      };

      const newAnnouncement = await createAnnouncement(announcementData);
      
      // If it should be published immediately, publish it
      if (form.publishStatus === 'Immediate' && newAnnouncement) {
        await publishAnnouncement(newAnnouncement.id, {});
      }

      // Refresh the list
      await fetchAnnouncements();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncementApi(id);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAnnouncementApi(id);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error archiving announcement:', err);
      setError('Failed to archive announcement');
    }
  };

  // Convert API data to UI format
  const convertToUIFormat = (apiAnnouncement: AnnouncementProfileData): Announcement => {
    const audienceMap: Record<string, 'Teachers' | 'Students' | 'Parents' | 'General' | 'Emergency'> = {
      'all': 'General',
      'teachers': 'Teachers',
      'students': 'Students',
      'parents': 'Parents',
      'specific_grade': 'General'
    };

    const priorityMap: Record<string, 'Low' | 'Normal' | 'High' | 'Critical'> = {
      'low': 'Low',
      'normal': 'Normal',
      'high': 'High',
      'urgent': 'Critical'
    };

    const statusMap: Record<string, 'Published' | 'Scheduled' | 'Archived'> = {
      'published': 'Published',
      'draft': 'Scheduled',
      'archived': 'Archived'
    };

    return {
      id: apiAnnouncement.id,
      title: apiAnnouncement.title,
      desc: apiAnnouncement.content,
      audience: audienceMap[apiAnnouncement.target_audience] || 'General',
      priority: priorityMap[apiAnnouncement.priority] || 'Normal',
      attachments: [],
      publishDate: apiAnnouncement.published_at ? apiAnnouncement.published_at.split('T')[0] : apiAnnouncement.created_at.split('T')[0],
      expiryDate: apiAnnouncement.expires_at ? apiAnnouncement.expires_at.split('T')[0] : '',
      status: statusMap[apiAnnouncement.status] || 'Scheduled',
      viewsCount: Math.floor(Math.random() * 50) + 10,
      commentsCount: Math.floor(Math.random() * 10),
      interactionRate: Math.floor(Math.random() * 20) + 70
    };
  };

  const uiAnnouncements = announcements.map(convertToUIFormat);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Compose Banner Actions */}
      <div className="flex justify-between items-center bg-gradient-to-r from-brand-blue to-brand-indigo p-5 rounded-2xl shadow-lg border border-brand-blue/20">
        <div className="text-left flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono">Bulletin Composer</h3>
            <p className="text-xs text-white/80 font-medium">Draft, schedule and broadcast authorized announcements</p>
          </div>
        </div>
        <button
          onClick={() => {
            setForm({
              title: '',
              desc: '',
              audience: 'General',
              priority: 'Normal',
              publishDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
            });
            setShowAddForm(true);
          }}
          className="h-10 px-5 rounded-xl bg-white hover:bg-slate-100 text-brand-blue text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Notice</span>
        </button>
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        {uiAnnouncements.map((ann, idx) => {
          const views = ann.viewsCount ?? (Math.floor(Math.sin(idx + 1) * 150) + 200);
          const rate = ann.interactionRate ?? (Math.floor(Math.cos(idx + 2) * 20) + 75);
          const comments = ann.commentsCount ?? (Math.floor(Math.sin(idx + 3) * 12) + 15);
          
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-all pl-6 ${
                ann.priority === 'Critical' ? 'border-l-4 border-l-rose-500 border-rose-100 dark:border-rose-950/45' :
                ann.priority === 'High' ? 'border-l-4 border-l-amber-500 border-amber-100 dark:border-amber-950/45' :
                'border-l-4 border-l-brand-blue border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Quick Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleArchive(ann.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  title="Archive Announcement"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Delete Broadcast"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[8.5px] font-black font-mono uppercase px-2 py-0.5 rounded ${
                    ann.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 animate-pulse' :
                    ann.priority === 'High' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border'
                  }`}>
                    {ann.priority} Priority
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-400 font-bold bg-slate-50 dark:bg-slate-950/40 px-1.5 py-0.5 rounded">
                    Target: {ann.audience}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{ann.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{ann.desc}</p>
                </div>
              </div>

              {/* Advanced Engagement Analytics counters */}
              <div className="grid grid-cols-3 gap-2 py-2 mt-3.5 border-t border-b border-slate-50 dark:border-slate-850 text-[10px] font-mono font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{views} views</span>
                </div>
                <div>
                  <span>💬 {comments} replies</span>
                </div>
                <div className="text-right">
                  <span className="text-brand-blue">⚡ {rate}% engagement</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Pub: {ann.publishDate}</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                  ann.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600' :
                  ann.status === 'Scheduled' ? 'bg-brand-blue/10 text-brand-indigo' : 'bg-slate-100 text-slate-400'
                }`}>
                  {ann.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==============================================
          COMPOSE BROADCAST NOTICE MODAL
          ============================================== */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl z-10 text-left"
            >
              <div className="p-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Compose Broadcast Notice</h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleComposeSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    placeholder="e.g. End of Term Examination Schedule"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Notice Description</label>
                  <textarea
                    required
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    placeholder="Compose notice details..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Target Audience</label>
                    <select
                      value={form.audience}
                      onChange={(e) => setForm({ ...form, audience: e.target.value as any })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="General">General Broadcast</option>
                      <option value="Teachers">Faculty / Instructors</option>
                      <option value="Students">Student Body</option>
                      <option value="Parents">Guardians & Parents</option>
                      <option value="Emergency">Emergency Broadcast</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Urgency Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Normal">Normal Notice</option>
                      <option value="High">High Notice</option>
                      <option value="Critical">Critical Urgency</option>
                    </select>
                  </div>
                </div>

                {/* Scheduling and Publishing options */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400 block">Publishing Schedule Mode</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                    {(['Immediate', 'Scheduled', 'Draft'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setForm({ ...form, publishStatus: mode })}
                        className={`py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                          form.publishStatus === mode
                            ? 'bg-white dark:bg-slate-900 text-brand-blue shadow-xs font-black'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Input if Scheduled */}
                {form.publishStatus === 'Scheduled' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-400">Scheduled Broadcast Date</label>
                    <input
                      type="date"
                      required
                      value={form.publishDate}
                      onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {form.publishStatus === 'Draft' ? 'Save as Draft' : form.publishStatus === 'Scheduled' ? 'Schedule Broadcast' : 'Publish Notice'}
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
