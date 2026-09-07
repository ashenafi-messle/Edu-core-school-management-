/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, AlertCircle, Heart, Star, Calendar, 
  Clock, ShieldCheck, CheckCircle2, UserCheck, Sparkles 
} from 'lucide-react';
import { ChildProfile, BehaviorRecord, AttendanceRecord } from './ParentMockData';

interface ParentBehaviorAttendanceViewProps {
  selectedChild: ChildProfile;
  behaviorRecords: BehaviorRecord[];
  attendanceRecords: AttendanceRecord[];
  mode: 'behavior' | 'attendance';
}

export const ParentBehaviorAttendanceView: React.FC<ParentBehaviorAttendanceViewProps> = ({
  selectedChild,
  behaviorRecords,
  attendanceRecords,
  mode
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');

  // Compute attendance metrics
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'Late').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'Absent').length;
  const excusedDays = attendanceRecords.filter(r => r.status === 'Excused').length;
  
  const positiveBehaviors = behaviorRecords.filter(b => b.type === 'Positive');
  const improvementBehaviors = behaviorRecords.filter(b => b.type === 'Improvement');

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Upper Status Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-blue uppercase px-2 py-0.5 bg-brand-blue/10 rounded">
            Conduct & Log Tracker
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
            {mode === 'behavior' ? 'Behavioral & Conduct Evaluations' : 'Daily Attendance Audit Log'}
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">
            Dependents target: <span className="font-bold text-slate-850 dark:text-white">{selectedChild.name}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Campus Security Checked</span>
          </span>
        </div>
      </div>

      {/* RENDER BEHAVIOR MODULE */}
      {mode === 'behavior' && (
        <div className="space-y-6">
          {/* Behavior summary boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">CONDUCT LEVEL</span>
                <span className="text-base font-black text-emerald-500">{selectedChild.behaviorStatus}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">POSITIVE RECOGNITIONS</span>
                <span className="text-base font-black text-brand-blue font-mono">{positiveBehaviors.length} Citations</span>
              </div>
              <Heart className="w-8 h-8 text-brand-blue" />
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">AREAS TO RESOLVE</span>
                <span className="text-base font-black text-amber-500 font-mono">{improvementBehaviors.length} Records</span>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side timeline */}
            <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-5">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Incidents & Merits Ledger</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Continuous evaluation timeline from verified instructors</p>
              </div>

              <div className="space-y-4">
                {behaviorRecords.length > 0 ? (
                  behaviorRecords.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${rec.type === 'Positive' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[11px] font-black text-slate-800 dark:text-white">{rec.category}</span>
                          <span className="text-[9px] font-mono text-slate-450">• {rec.date}</span>
                        </div>
                        
                        <div className="flex gap-1.5">
                          <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded ${
                            rec.severity === 'Low' ? 'bg-blue-500/15 text-blue-600' : 'bg-red-500/15 text-red-600'
                          }`}>
                            Severity: {rec.severity}
                          </span>
                          <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded ${
                            rec.type === 'Positive' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                          }`}>
                            {rec.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-sans">{rec.description}</p>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-550 leading-relaxed">
                        <span className="font-bold text-slate-750 dark:text-white block">Advisory Recommendation:</span>
                        {rec.recommendation}
                      </div>

                      <p className="text-[9.5px] text-slate-400 font-mono text-right">Recorded by: <span className="font-bold">{rec.teacher}</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-450 py-4 text-center">No conduct logs recorded for this student.</p>
                )}
              </div>
            </div>

            {/* Right side advisory */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Positive Recognition Indicators</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Merit awards and leadership metrics</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <Star className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500" />
                  <span>Stellar Conduct Standing</span>
                </div>
                <p className="text-slate-550">
                  This student remains in excellent standing. Proactive safety contributions and math circle mentorships show superb values. No critical disciplinary action forms are active.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 space-y-1.5 text-xs text-slate-500 leading-relaxed">
                <span className="font-black text-slate-800 dark:text-white block text-[11px]">Academic Behavior Guidelines</span>
                <span>Parents can view behavior incidents but cannot alter the disciplinary docket. Contact homeroom instructors directly regarding severity ratings.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER ATTENDANCE MODULE */}
      {mode === 'attendance' && (
        <div className="space-y-6">
          {/* Stats widgets */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Compliance Rate</span>
              <span className="text-lg font-black text-emerald-500 font-mono mt-1 block">{selectedChild.attendance}%</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Present Days</span>
              <span className="text-lg font-black text-slate-800 dark:text-white font-mono mt-1 block">{presentDays}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Late Days</span>
              <span className="text-lg font-black text-amber-500 font-mono mt-1 block">{lateDays}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Absent Days</span>
              <span className="text-lg font-black text-red-500 font-mono mt-1 block">{absentDays}</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center col-span-2 md:col-span-1">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Excused Absences</span>
              <span className="text-lg font-black text-blue-500 font-mono mt-1 block">{excusedDays}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Attendance History list */}
            <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Daily Attendance Log History</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Individual morning and afternoon session states</p>
              </div>

              <div className="space-y-2">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{log.date}</span>
                        <span className="text-slate-400 text-[10px]">• {log.session} Session</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {log.remark && (
                          <span className="text-[10px] font-sans text-slate-450 mr-2 max-w-xs truncate" title={log.remark}>
                            "{log.remark}"
                          </span>
                        )}
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'Present' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          log.status === 'Late' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          log.status === 'Absent' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                          'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-450 py-4 text-center">No attendance logs available for this student.</p>
                )}
              </div>
            </div>

            {/* Attendance Calendar overview card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Attendance Calendar Grid</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Quick calendar visualizer</p>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-mono">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-slate-400 font-bold py-1">{d}</span>
                ))}
                
                {/* Visual blocks */}
                {Array.from({ length: 14 }).map((_, i) => {
                  const status = i === 1 ? 'late' : i === 8 ? 'excused' : 'present';
                  return (
                    <div 
                      key={i} 
                      className={`h-9 rounded-lg flex items-center justify-center font-bold font-mono border ${
                        status === 'late' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        status === 'excused' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      }`}
                    >
                      {i + 14}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>Present (Compliance Standard)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>Late (Tardiness warning logs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>Excused absence (Medical / Form submitted)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
