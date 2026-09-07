/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, RefreshCw, CheckCircle2, AlertCircle, Play, 
  Terminal, Shield, Server, ArrowRight, Table2, Info, Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { useNavigation } from '../context/NavigationContext';
import { MOCK_CREDENTIALS } from '../data';

export const DatabaseSandboxController: React.FC = () => {
  const { login } = useNavigation();
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [dbStats, setDbStats] = useState({
    schools: 0,
    users: 0,
    students: 0,
    teachers: 0,
    parents: 0,
    payments: 0,
    attendance: 0,
    exams: 0,
  });
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState('');

  // Fetch counts from backend
  const fetchDbStats = async () => {
    try {
      const isConnected = await api.checkBackendConnection();
      if (!isConnected) {
        setConnectionState('disconnected');
        return;
      }
      setConnectionState('connected');

      // Fetch actual data
      const [schools, users, students, teachers, parents, payments, attendance, exams] = await Promise.all([
        api.getSchools().catch(() => []),
        api.getUsers().catch(() => []),
        api.getStudents().catch(() => []),
        api.getTeachers().catch(() => []),
        api.getParents().catch(() => []),
        api.getPayments().catch(() => []),
        api.getAttendanceRecords().catch(() => []),
        api.getExams().catch(() => []),
      ]);

      setDbStats({
        schools: schools.length,
        users: users.length,
        students: students.length,
        teachers: teachers.length,
        parents: parents.length,
        payments: payments.length,
        attendance: attendance.length,
        exams: exams.length,
      });
    } catch (e) {
      setConnectionState('disconnected');
    }
  };

  useEffect(() => {
    fetchDbStats();
    // Poll every 10 seconds to keep stats live
    const interval = setInterval(fetchDbStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedProgress([]);
    setActiveStep('Initializing DB Migration...');
    
    try {
      await api.seedSandboxData((status) => {
        setSeedProgress((prev) => [...prev, status]);
        setActiveStep(status);
      });
      
      // Auto login as admin to show seeded portal
      setTimeout(() => {
        login(MOCK_CREDENTIALS.admin);
      }, 3000);

      await fetchDbStats();
    } catch (error: any) {
      setSeedProgress((prev) => [...prev, `❌ Error: ${error.message || 'Seeding failed'}`]);
      setActiveStep('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section id="database-sandbox" className="py-16 bg-slate-50 dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Server className="w-3.5 h-3.5" />
            <span>Real-Time Database Gateway</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Supabase Postgres &amp; NestJS API Bridge
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Monitor transaction records, verify active REST route connections, and populate the multi-tenant tables in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Connection Status & DB Stats Monitor */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">API Connection</h3>
                  <p className="text-xs text-slate-400">Host: http://localhost:3000/api</p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {connectionState === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live Connection
                  </span>
                )}
                {connectionState === 'disconnected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Offline / Connecting
                  </span>
                )}
                {connectionState === 'checking' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Pinging Server...
                  </span>
                )}
              </div>
            </div>

            {/* If offline instruction alert */}
            {connectionState === 'disconnected' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Backend server starting up or database key missing.</span>
                  <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                    Our dev orchestrator compiles NestJS TS modules in the background. If you just launched the workspace, wait a few seconds and tap 
                    <button onClick={fetchDbStats} className="font-bold text-amber-600 underline ml-1 hover:text-amber-500 inline-flex items-center gap-1">
                      Refresh Status <RefreshCw className="w-2.5 h-2.5" />
                    </button>.
                  </p>
                </div>
              </div>
            )}

            {/* DB Table Stat Cards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Table2 className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  PostgreSQL Table Records
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Schools', count: dbStats.schools, color: 'text-brand-blue bg-brand-blue/5 border-brand-blue/10' },
                  { label: 'Users', count: dbStats.users, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' },
                  { label: 'Students', count: dbStats.students, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' },
                  { label: 'Teachers', count: dbStats.teachers, color: 'text-amber-500 bg-amber-500/5 border-amber-500/10' },
                  { label: 'Parents', count: dbStats.parents, color: 'text-pink-500 bg-pink-500/5 border-pink-500/10' },
                  { label: 'Invoices', count: dbStats.payments, color: 'text-violet-500 bg-violet-500/5 border-violet-500/10' },
                  { label: 'Attendance', count: dbStats.attendance, color: 'text-sky-500 bg-sky-500/5 border-sky-500/10' },
                  { label: 'Exams', count: dbStats.exams, color: 'text-orange-500 bg-orange-500/5 border-orange-500/10' },
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${stat.color}`}>
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stat.count}</span>
                    <span className="text-[11px] font-semibold text-slate-400 mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                SSL / Direct Connection Encrypted
              </span>
              <button 
                onClick={fetchDbStats}
                className="text-xs font-bold text-brand-blue hover:text-brand-indigo flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Force Refresh Counts
              </button>
            </div>
          </div>

          {/* Interactive Seeder & Terminal Console */}
          <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-400">
                  Data Pipeline Terminal
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
            </div>

            {/* Console Log Area */}
            <div className="flex-grow overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-2">
              {seedProgress.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <Database className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p>Database Sandbox is currently empty or awaiting fresh synchronization.</p>
                  <p className="text-[10px] text-slate-600 max-w-xs">
                    Tap &quot;Execute Data Sync&quot; below to trigger API calls that configure your multi-tenant workspace tables.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-emerald-400 font-bold">&gt; sh ./seed_database.sh --tenant_id=oakridge</div>
                  {seedProgress.map((line, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-emerald-500 shrink-0">✓</span>
                      <span>{line}</span>
                    </motion.div>
                  ))}
                  {seeding && (
                    <div className="text-brand-sky flex items-center gap-2 font-bold animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{activeStep}...</span>
                    </div>
                  )}
                  {!seeding && seedProgress.some(l => l.includes('Completed')) && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl mt-4 font-bold text-center"
                    >
                      🎉 All Sync Completed! Logged in as Robert Chen (Admin). Redirecting to system...
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* CTA Sync Button */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <button
                id="execute-database-sync-btn"
                onClick={handleSeed}
                disabled={seeding || connectionState === 'disconnected'}
                className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  connectionState === 'disconnected'
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : seeding
                    ? 'bg-brand-blue/30 text-brand-blue cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/15'
                }`}
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synchronizing Postgres Tables...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute Data Sync (NestJS API)
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
