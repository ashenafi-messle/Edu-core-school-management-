'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Plus, Send, AlertCircle } from 'lucide-react';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { GenericSkeleton } from './SkeletonLoaders';

interface Allocation { grade_level: string; section_name: string; subject_id: string; subject_name: string; subject_code?: string; academic_year_id?: string; section_configuration_id?: string; }
interface ScheduleEntry { id: string; day_of_week: string; room_number?: string; notes?: string; time_slot?: { slot_name: string; start_time: string; end_time: string }; subject?: { subject_name: string; subject_code?: string }; section_configuration?: { id: string; grade_level: string; section_name: string }; }

export const TeacherSchedule: React.FC<{ teacherId: string; schoolId: string }> = ({ teacherId, schoolId }) => {
  const { data, loading, refreshData } = useTeacherData();
  
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ allocation: '', day_of_week: 'Monday', time_slot_id: '', section_configuration_id: '', room_number: '', notes: '' });
  const [post, setPost] = useState({ allocation: '', title: '', content: '', post_type: 'announcement' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headers = { 'X-School-ID': schoolId, 'Content-Type': 'application/json' };

  const load = async () => {
    try {
      const [scheduleResponse, slotsResponse, postsResponse] = await Promise.all([
        fetch(`/api/timetable/weekly?teacher_id=${encodeURIComponent(teacherId)}`, { headers }),
        fetch('/api/timetable/time-slots', { headers }),
        fetch(`/api/teachers/${teacherId}/class-posts`, { headers }),
      ]);
      setSchedule(await scheduleResponse.json());
      const slots = await slotsResponse.json();
      setTimeSlots(slots);
      setForm((current) => ({ ...current, time_slot_id: current.time_slot_id || slots[0]?.id || '' }));
      setPosts(await postsResponse.json());
    } catch (loadError: any) { setError(loadError.message || 'Failed to load schedule'); }
  };

  useEffect(() => {
    if (teacherId && schoolId && !data.classes) {
      refreshData('classes');
    }
  }, [teacherId, schoolId]);

  useEffect(() => {
    // Process classes data when available
    if (data.classes) {
      const classesData = data.classes as any;
      setAllocations((classesData.classes_and_divisions || []).flatMap((grade: any) => (grade.sections || []).flatMap((section: any) => (section.subjects || []).map((subject: any) => ({ grade_level: grade.grade_level, section_name: section.section_name, subject_id: subject.id, subject_name: subject.subject_name, subject_code: subject.subject_code, academic_year_id: subject.academic_year_id || classesData.academic_year_id, section_configuration_id: (classesData.section_configurations || []).find((config: any) => config.grade_level === grade.grade_level && config.section_name === section.section_name)?.id })))));
      load();
    }
  }, [data.classes]);

  useEffect(() => {
    const refresh = window.setInterval(load, 5000);
    return () => window.clearInterval(refresh);
  }, [teacherId, schoolId]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const selectedAllocation = useMemo(() => allocations.find((item) => item.subject_id === form.allocation), [allocations, form.allocation]);
  const selectedPostAllocation = useMemo(() => allocations.find((item) => item.subject_id === post.allocation), [allocations, post.allocation]);

  const saveSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    const allocation = selectedAllocation;
    if (!allocation || !allocation.section_configuration_id) { setError('Select an allocated subject and class division.'); return; }
    setSaving(true); setError(null);
    try {
      const response = await fetch('/api/timetable/weekly', { method: 'POST', headers, body: JSON.stringify({ academic_year_id: allocation.academic_year_id, section_configuration_id: allocation.section_configuration_id, day_of_week: form.day_of_week, time_slot_id: form.time_slot_id, subject_id: allocation.subject_id, teacher_id: teacherId, room_number: form.room_number, notes: form.notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save schedule');
      setShowScheduleForm(false); await load();
    } catch (saveError: any) { setError(saveError.message); } finally { setSaving(false); }
  };

  const savePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPostAllocation) { setError('Select an allocated class subject.'); return; }
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/teachers/${teacherId}/class-posts`, { method: 'POST', headers, body: JSON.stringify({ ...post, subject_id: selectedPostAllocation.subject_id, grade_level: selectedPostAllocation.grade_level, section_name: selectedPostAllocation.section_name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to post class update');
      setPost({ allocation: '', title: '', content: '', post_type: 'announcement' }); setShowPostForm(false); await load();
    } catch (saveError: any) { setError(saveError.message); } finally { setSaving(false); }
  };

  if (loading.classes || !data.classes) return <GenericSkeleton />;
  return <div className="space-y-6">
    {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"><AlertCircle size={15} />{error}</div>}
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900 dark:text-white">My Schedule</h2><p className="text-xs text-slate-500">Only allocated classes and subjects can be scheduled or posted.</p></div><div className="flex gap-2"><button onClick={() => setShowPostForm(true)} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"><Send size={15} /> Post to class</button><button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white"><Plus size={15} /> Add schedule</button></div></div>
    <div className="grid gap-4 md:grid-cols-5">{days.map((day) => <div key={day} className="min-h-40 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 text-xs font-bold text-brand-blue">{day}</h3>{schedule.filter((entry) => entry.day_of_week === day).map((entry) => <div key={entry.id} className="mb-2 rounded-lg bg-brand-blue/10 p-2 text-[10px]"><p className="font-bold">{entry.time_slot?.slot_name || 'Period'}</p><p>{entry.subject?.subject_name}</p><p className="text-slate-500">{entry.section_configuration?.grade_level} {entry.section_configuration?.section_name}</p><p className="text-slate-400">{entry.room_number || 'Room TBD'}</p></div>)}</div>)}</div>
    {posts.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 font-bold">Class updates</h3>{posts.map((item) => <article key={item.id} className="border-b border-slate-100 py-3 last:border-0"><p className="text-xs text-slate-400">{item.grade_level} {item.section_name} · {item.post_type}</p><h4 className="font-semibold">{item.title}</h4><p className="text-sm text-slate-600">{item.content}</p></article>)}</div>}
    {showScheduleForm && <form onSubmit={saveSchedule} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-bold">Add allocated class schedule</h3><select required value={form.allocation} onChange={(e) => setForm({ ...form, allocation: e.target.value })} className="w-full rounded border p-2 text-xs"><option value="">Select allocated subject</option>{allocations.map((item) => <option key={`${item.subject_id}-${item.grade_level}-${item.section_name}`} value={item.subject_id}>{item.subject_name} · {item.grade_level} {item.section_name}</option>)}</select><div className="grid gap-2 md:grid-cols-2"><select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="rounded border p-2 text-xs">{days.map((day) => <option key={day}>{day}</option>)}</select><input placeholder="Room" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="rounded border p-2 text-xs" /></div><p className="text-[11px] text-slate-500">The first configured school time slot is used automatically.</p><textarea placeholder="Class notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded border p-2 text-xs" /><button disabled={saving} className="rounded bg-brand-blue px-4 py-2 text-xs font-semibold text-white">Save schedule</button></form>}
    {showPostForm && <form onSubmit={savePost} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-bold">Post to allocated class</h3><select required value={post.allocation} onChange={(e) => setPost({ ...post, allocation: e.target.value })} className="w-full rounded border p-2 text-xs"><option value="">Select allocated subject and class</option>{allocations.map((item) => <option key={`${item.subject_id}-${item.grade_level}-${item.section_name}`} value={item.subject_id}>{item.subject_name} · {item.grade_level} {item.section_name}</option>)}</select><input required placeholder="Title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} className="w-full rounded border p-2 text-xs" /><select value={post.post_type} onChange={(e) => setPost({ ...post, post_type: e.target.value })} className="rounded border p-2 text-xs"><option value="announcement">Announcement</option><option value="homework">Homework</option><option value="reminder">Reminder</option><option value="resource">Resource</option></select><textarea required placeholder="Write the class update" value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} className="w-full rounded border p-2 text-xs" /><button disabled={saving} className="rounded bg-brand-blue px-4 py-2 text-xs font-semibold text-white">Publish to class</button></form>}
  </div>;
};
