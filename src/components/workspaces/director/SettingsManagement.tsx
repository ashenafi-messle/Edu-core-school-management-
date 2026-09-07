/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Check, Server, Shield, Sparkles, RefreshCw, Loader2
} from 'lucide-react';
import { useDirectorData } from './DirectorDataContext';
import { api } from '../../../lib/api';

export const SettingsManagement: React.FC = () => {
  const { 
    schoolName, setSchoolName, schoolYear, setSchoolYear,
    termStart, setTermStart, autoEnroll, setAutoEnroll,
    minGPA, setMinGPA, seatLimit, setSeatLimit
  } = useDirectorData();

  const [localName, setLocalName] = useState(schoolName);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch school details from database on mount
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        const schoolId = api.getSchoolId();
        if (schoolId) {
          const schoolData = await api.getSchoolDetails(schoolId);
          if (schoolData && schoolData.name) {
            setLocalName(schoolData.name);
            setSchoolName(schoolData.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch school details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [setSchoolName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolId = api.getSchoolId();
      if (schoolId) {
        await api.updateSchool(schoolId, { name: localName });
        setSchoolName(localName);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to update school name:', error);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Institutional Branding */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
            <Server className="w-4 h-4 text-brand-blue" />
            <span>Institutional Profile</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">School Name</label>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                  <span className="text-slate-500">Loading school data...</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none font-semibold text-slate-800 dark:text-white"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Academic Fiscal Year</label>
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
              >
                <option value="2026-2027">2026-2027 (Active Term)</option>
                <option value="2027-2028">2027-2028 (Next Term)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admission Threshold Criteria */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-indigo" />
            <span>Admissions Policy Criteria</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-dashed">
              <div>
                <p className="font-bold">Auto-Enroll Upon Approval</p>
                <p className="text-[10px] text-slate-400">Instantly creates student profiles on registration approve</p>
              </div>
              <input
                type="checkbox"
                checked={autoEnroll}
                onChange={(e) => setAutoEnroll(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-brand-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Minimum Admission GPA</label>
                <input
                  type="text"
                  value={minGPA}
                  onChange={(e) => setMinGPA(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Class Room Seat Limit</label>
                <input
                  type="number"
                  value={seatLimit}
                  onChange={(e) => setSeatLimit(parseInt(e.target.value) || 30)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-400">All configurations are stored locally inside the core instance.</p>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
        >
          {success ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
          <span>{success ? 'Saved Settings!' : 'Commit Configurations'}</span>
        </button>
      </div>

    </form>
  );
};
