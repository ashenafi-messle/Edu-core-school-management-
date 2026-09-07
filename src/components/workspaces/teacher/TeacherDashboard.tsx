'use client';

import React, { useEffect } from 'react';
import { BookOpen, Calendar, ClipboardList, Users, AlertCircle } from 'lucide-react';
import { TeacherProfilePanel } from './TeacherProfilePanel';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { DashboardSkeleton } from './SkeletonLoaders';

export const TeacherDashboard: React.FC<{ teacherId: string; schoolId: string }> = ({ teacherId, schoolId }) => {
  const { data, loading, error, refreshData } = useTeacherData();

  useEffect(() => {
    if (teacherId && schoolId && !data.dashboard) {
      refreshData('dashboard');
    }
  }, [teacherId, schoolId]);

  if (error.dashboard) return <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700"><AlertCircle size={16} />{error.dashboard}</div>;
  if (loading.dashboard || !data.dashboard) return <DashboardSkeleton />;

  const dashboardData = data.dashboard;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayEntries = (dashboardData?.timetable || []).filter((entry: any) => entry.day_of_week === today);
  return <div className="space-y-6">
    <TeacherProfilePanel teacherId={teacherId} schoolId={schoolId} />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[['Active Subjects', dashboardData?.stats?.subjects, BookOpen], ['Allocated Students', dashboardData?.stats?.students, Users], ['Pending Submissions', dashboardData?.stats?.pending_submissions, ClipboardList]].map(([label, value, Icon]: any) => <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{value || 0}</p></div><Icon className="text-brand-blue" size={24} /></div>)}
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold text-slate-900 dark:text-white">Today&apos;s timetable</h3><p className="text-xs text-slate-500">{today} · allocated lessons only</p></div><Calendar className="text-brand-blue" size={20} /></div>{todayEntries.length ? <div className="grid gap-3 md:grid-cols-2">{todayEntries.map((entry: any) => <div key={entry.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs font-bold text-slate-900 dark:text-white">{entry.subject?.subject_name || 'Assigned subject'}</p><p className="mt-1 text-[11px] text-slate-500">{entry.time_slot?.start_time} - {entry.time_slot?.end_time} · {entry.room_number || 'Room TBD'}</p><p className="text-[11px] text-slate-500">{entry.section_configuration?.grade_level} {entry.section_configuration?.section_name}</p></div>)}</div> : <p className="py-6 text-center text-xs text-slate-400">No lessons scheduled for today.</p>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 font-bold text-slate-900 dark:text-white">Recent class updates</h3>{dashboardData?.posts?.length ? dashboardData.posts.map((post: any) => <article key={post.id} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"><p className="text-[10px] text-slate-400">{post.grade_level} {post.section_name} · {post.post_type}</p><h4 className="text-sm font-semibold">{post.title}</h4><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{post.content}</p></article>) : <p className="py-6 text-center text-xs text-slate-400">No class updates posted yet.</p>}</section>
  </div>;
};
