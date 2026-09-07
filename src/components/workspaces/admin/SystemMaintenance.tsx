/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Shield, Server, Database, Search, Filter, Download, 
  RefreshCw, Play, CheckCircle2, AlertTriangle, Key, Clock, 
  HardDrive, ChevronRight, Ban, Cpu, ArrowLeftRight, Users, 
  Activity, TrendingUp, Calendar, Loader2 
} from 'lucide-react';
import { AuditLog } from './AdminTypes';
import { api } from '../../../lib/api';

// ============================================================================
// 1. AUDIT LOGS COMPONENT
// ============================================================================

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  triggerToast: (msg: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, triggerToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Audit ID,Timestamp,Operator,Module,Action,IP"].join(",") + "\n"
      + filtered.map(l => `${l.id},${l.dateTime},${l.user},${l.module},"${l.action}",${l.ipAddress}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `security_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Security Audit trail exported to CSV.");
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-left">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search operator, event or audit ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Modules</option>
            <option value="User Management">User Management</option>
            <option value="Online Registration">Online Registration</option>
            <option value="School Configuration">School Configuration</option>
            <option value="Backup & Recovery">Backup & Recovery</option>
          </select>
        </div>

        <button
          onClick={handleExportLogs}
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-xs font-bold font-mono flex items-center gap-1.5 text-slate-755 dark:text-slate-300 cursor-pointer justify-center self-stretch sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-[10px] font-bold uppercase select-none">
                <th className="py-3 px-5">Audit ID</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Operator User</th>
                <th className="py-3 px-5">Target Module</th>
                <th className="py-3 px-5">Administrative Event</th>
                <th className="py-3 px-5">IP Address</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-mono text-[11px] text-slate-700 dark:text-slate-350">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/15">
                  <td className="py-3 px-5 font-bold text-brand-indigo">{log.id}</td>
                  <td className="py-3 px-5 text-slate-450">{log.dateTime}</td>
                  <td className="py-3 px-5 font-sans font-bold text-slate-850 dark:text-white">{log.user}</td>
                  <td className="py-3 px-5">
                    <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px] uppercase font-black">{log.module}</span>
                  </td>
                  <td className="py-3 px-5 text-slate-800 dark:text-slate-200 font-sans font-bold">{log.action}</td>
                  <td className="py-3 px-5 text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="text-emerald-500 font-bold uppercase text-[10px]">✔ SUCCESS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SECURITY POLICIES COMPONENT
// ============================================================================

export const SecurityPolicies: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [failLockLimit, setFailLockLimit] = useState(5);
  const [sessionDuration, setSessionDuration] = useState(30);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Global Cybersecurity policies updated on server cluster.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Configurations panel */}
      <form onSubmit={handleSaveSecurity} className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-5 text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Cybersecurity Policy Matrix</h3>
          <p className="text-[10px] text-slate-450">Set strict security controls and token lifespans</p>
        </div>

        {/* 2FA Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-150 rounded-xl">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-850 dark:text-white block">Enforce Two-Factor Authentication (2FA)</span>
            <span className="text-[10px] text-slate-400">Force directors and administrators to verify OTP codes on logins</span>
          </div>

          <button
            type="button"
            onClick={() => setMfaEnabled(!mfaEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${mfaEnabled ? 'bg-brand-blue flex justify-end' : 'bg-slate-200 flex justify-start'}`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>

        {/* Failed Login Limits */}
        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-150 rounded-xl">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-850 dark:text-white block">Failed Login Attempts Limit</span>
              <span className="text-[10px] text-slate-400">Lock accounts after consecutive failures</span>
            </div>
            <span className="font-mono font-bold text-slate-850 dark:text-white text-sm">{failLockLimit} attempts</span>
          </div>

          <input
            type="range"
            min={3}
            max={10}
            value={failLockLimit}
            onChange={(e) => setFailLockLimit(parseInt(e.target.value))}
            className="w-full cursor-pointer accent-brand-blue"
          />
        </div>

        {/* Session Timeout */}
        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/45 border border-slate-150 rounded-xl">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-850 dark:text-white block">Inactivity Token Timeout</span>
              <span className="text-[10px] text-slate-400">Revoke tokens after inactive minutes</span>
            </div>
            <span className="font-mono font-bold text-slate-850 dark:text-white text-sm">{sessionDuration} mins</span>
          </div>

          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={sessionDuration}
            onChange={(e) => setSessionDuration(parseInt(e.target.value))}
            className="w-full cursor-pointer accent-brand-blue"
          />
        </div>

        <button
          type="submit"
          className="h-10 px-5 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl cursor-pointer"
        >
          Commit Cyber Rules
        </button>
      </form>

      {/* active Lockouts warning pane */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 text-xs font-mono">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Host Lockout Queue</h3>
          <p className="text-[10px] text-slate-450">IP clusters locked by bruteforce shields</p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-red-500 font-bold">
              <span>HOST_IP_BLOCKED</span>
              <Ban className="w-3.5 h-3.5" />
            </div>
            <p className="font-bold text-slate-850 dark:text-white">193.12.82.1</p>
            <p className="text-[9.5px] text-slate-400">Locked: Today, 02:11 AM • Expired JWT request flood</p>
            <button
              onClick={() => triggerToast("Flushed host block for 193.12.82.1")}
              className="px-2 py-1 bg-red-500 text-white rounded text-[9px] font-bold cursor-pointer"
            >
              Flush Block (Release IP)
            </button>
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold">
              <span>USER_FAIL_LOCKOUT</span>
              <Ban className="w-3.5 h-3.5" />
            </div>
            <p className="font-bold text-slate-850 dark:text-white">parent@demo.com</p>
            <p className="text-[9.5px] text-slate-400 font-medium">Locked: Yesterday, 11:34 PM • 5 consecutive failures</p>
            <button
              onClick={() => triggerToast("Unlocked user account parent@demo.com")}
              className="px-2 py-1 bg-amber-500 text-white rounded text-[9px] font-bold cursor-pointer"
            >
              Unlock Account (Reset count)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// ============================================================================
// 3. SYSTEM MONITORING COMPONENT - USER ANALYTICS
// ============================================================================

interface UserStatistics {
  id: string;
  school_id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  total_users: number;
  active_users: number;
  new_users: number;
  role_counts: Record<string, number>;
  session_count: number;
  page_views: number;
  created_at: string;
}

export const SystemMonitoring: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [statistics, setStatistics] = useState<UserStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const days = period === 'daily' ? 30 : period === 'weekly' ? 12 : 12;
      const data = await api.getAnalytics(period, days);
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateStatistics = async () => {
    setCalculating(true);
    try {
      await api.calculateStatistics(period);
      await loadStatistics();
    } catch (error) {
      console.error('Failed to calculate statistics:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-600',
      director: 'bg-blue-100 text-blue-600',
      teacher: 'bg-emerald-100 text-emerald-600',
      student: 'bg-amber-100 text-amber-600',
      parent: 'bg-pink-100 text-pink-600'
    };
    return colors[role] || 'bg-slate-100 text-slate-600';
  };

  const latestStats = statistics[0];
  const totalNewUsers = statistics.reduce((sum, stat) => sum + (stat.new_users || 0), 0);
  const totalSessions = statistics.reduce((sum, stat) => sum + (stat.session_count || 0), 0);
  const avgPageViews = statistics.length > 0 
    ? Math.round(statistics.reduce((sum, stat) => sum + (stat.page_views || 0), 0) / statistics.length)
    : 0;

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Analytics & Monitoring
          </h3>
          <p className="text-[10px] text-slate-450">Track user activity, sessions, and engagement by time period</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="h-8 px-3 border border-slate-200 rounded-lg text-xs cursor-pointer"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={handleCalculateStatistics}
            disabled={calculating}
            className="h-8 px-3 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {calculating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>{calculating ? 'Calculating...' : 'Calculate'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-450 uppercase">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {latestStats?.total_users || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalNewUsers} new this period
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-450 uppercase">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {latestStats?.active_users || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {latestStats ? ((latestStats.active_users / latestStats.total_users) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-450 uppercase">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalSessions}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This period
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-450 uppercase">Page Views</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgPageViews}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Avg per period
          </p>
        </div>
      </div>

      {/* Role Distribution */}
      {latestStats?.role_counts && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-4">
            Role Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(latestStats.role_counts).map(([role, count]) => (
              <div key={role} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${getRoleColor(role)}`}>
                    {role}
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-[10px] text-slate-500">
                  {((count / latestStats.total_users) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Table */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-4">
          Historical Statistics
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
            <span className="ml-2 text-sm text-slate-500">Loading statistics...</span>
          </div>
        ) : statistics.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No statistics available</p>
            <p className="text-xs mt-1">Click "Calculate" to generate statistics</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-2 px-3 font-mono font-bold uppercase text-slate-450">Period</th>
                  <th className="text-center py-2 px-3 font-mono font-bold uppercase text-slate-450">Total Users</th>
                  <th className="text-center py-2 px-3 font-mono font-bold uppercase text-slate-450">Active</th>
                  <th className="text-center py-2 px-3 font-mono font-bold uppercase text-slate-450">New</th>
                  <th className="text-center py-2 px-3 font-mono font-bold uppercase text-slate-450">Sessions</th>
                  <th className="text-center py-2 px-3 font-mono font-bold uppercase text-slate-450">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat) => (
                  <tr key={stat.id} className="border-b border-slate-100 dark:border-slate-850">
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(stat.period_start).toLocaleDateString()}
                      </span>
                      {stat.period_end !== stat.period_start && (
                        <span className="text-slate-400 ml-1">
                          - {new Date(stat.period_end).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {stat.total_users}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-bold">
                        {stat.active_users}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">
                        +{stat.new_users}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">
                      {stat.session_count}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">
                      {stat.page_views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// ============================================================================
// 4. BACKUP & RECOVERY COMPONENT
// ============================================================================

interface BackupRecoveryProps {
  backupLogs: string[];
  onTriggerBackup: () => void;
  backupLoading: boolean;
  triggerToast: (msg: string) => void;
}

export const BackupRecovery: React.FC<BackupRecoveryProps> = ({
  backupLogs,
  onTriggerBackup,
  backupLoading,
  triggerToast
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Trigger & Vault Stats */}
      <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-5 text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Disaster Recovery Vault</h3>
          <p className="text-[10px] text-slate-450">Execute database checkpoints and download secure snapshots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-dashed border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 dark:text-white block">Manual Database Snapshot</span>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Saves all school structures (classes, students, marks, payment states) into a binary GZIP container.</p>
            <button
              onClick={onTriggerBackup}
              disabled={backupLoading}
              className="h-9 px-4 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-55"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${backupLoading ? 'animate-spin' : ''}`} />
              <span>{backupLoading ? 'Creating Snapshot...' : 'Checkpoint Database Now'}</span>
            </button>
          </div>

          <div className="p-4 border border-dashed border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 dark:text-white block">Point-In-Time Restore</span>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Rollback database to a healthy snapshot in case of manual data corruption.</p>
            <button
              onClick={() => {
                if (confirm("WARNING: Rolling back the database will overwrite all changes made since the snapshot creation. Continue?")) {
                  triggerToast("Database rollback completed. Hypervisor reloaded.");
                }
              }}
              className="h-9 px-4 border border-red-500 text-red-500 hover:bg-red-500/5 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Trigger Rollback Recovery</span>
            </button>
          </div>
        </div>

        {/* List of snapshots */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-450 font-bold uppercase block">Archived Snapshots on Cloud Storage</span>
          
          {[
            { tag: 'BKP-091', date: 'Today, 03:00 AM', size: '28.4 MB', type: 'System Auto Checkpoint' },
            { tag: 'BKP-090', date: 'Yesterday, 03:00 AM', size: '28.1 MB', type: 'System Auto Checkpoint' },
            { tag: 'BKP-089', date: '18 Jul 2026, 02:40 PM', size: '27.9 MB', type: 'Manual Admin Save' }
          ].map((b) => (
            <div key={b.tag} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/20 rounded-lg font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="font-bold text-slate-850 dark:text-white">{b.tag}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({b.type})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">{b.size} • {b.date}</span>
                <button
                  onClick={() => triggerToast(`Downloading snapshot container ${b.tag}.tar.gz`)}
                  className="text-brand-blue hover:underline cursor-pointer font-bold"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Activity logs console */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 font-mono text-xs">
        <div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Vault Storage Console</h3>
          <p className="text-[10px] text-slate-450">Output buffer stream from vault snapshots</p>
        </div>

        <div className="bg-slate-950 text-slate-450 p-3 rounded-xl border border-slate-850 h-64 overflow-y-auto text-[10px] space-y-1">
          {backupLogs.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))}
          {backupLoading && <p className="text-brand-blue animate-pulse font-bold">● streaming block updates...</p>}
        </div>
      </div>

    </div>
  );
};
