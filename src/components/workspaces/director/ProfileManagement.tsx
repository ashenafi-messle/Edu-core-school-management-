/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Check, Sparkles, Mail, Phone, Compass, ShieldCheck
} from 'lucide-react';

export const ProfileManagement: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'Director Richard Vance',
    email: 'richard.vance@educore.edu',
    phone: '+1 (555) 019-8800',
    timezone: 'PST - Pacific Standard Time'
  });

  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      
      {/* Profile Card Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <img 
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" 
          alt="Director Vance" 
          className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-blue"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{formData.name}</h3>
            <span className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-indigo dark:text-brand-sky font-mono font-bold text-[9px] uppercase tracking-wider">
              AUTHORIZED DIRECTOR
            </span>
          </div>
          <p className="text-xs text-slate-400">Institutional Authority Level: FULL EXEC</p>
          <p className="text-[10.5px] text-slate-400 font-mono">School Signature Scope: Verified Secure</p>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-blue" />
            <span>Personal Profile Coordinates</span>
          </h4>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Authorized Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Secure Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-indigo" />
            <span>Timezone Configuration</span>
          </h4>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Timezone Specification</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
              >
                <option>PST - Pacific Standard Time</option>
                <option>EST - Eastern Standard Time</option>
                <option>GMT - Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Director credentials verified via Secure Key Signature.</span>
        </p>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
        >
          {success ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
          <span>{success ? 'Profile Updated!' : 'Update Profile Coordinate'}</span>
        </button>
      </div>

    </form>
  );
};
