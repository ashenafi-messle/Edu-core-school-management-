/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Award, ClipboardList, AlertCircle, Heart, X, 
  Sparkles, Calendar, CalendarDays, ShieldAlert, GraduationCap
} from 'lucide-react';
import { ChildProfile } from './ParentMockData';

interface ParentChildrenViewProps {
  childrenList: ChildProfile[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
}

export const ParentChildrenView: React.FC<ParentChildrenViewProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild
}) => {
  const [activeChildDetail, setActiveChildDetail] = useState<ChildProfile | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dependents Student Directory</h3>
        <p className="text-[11px] text-slate-500">View real-time profiles of your dependents enrolled at Educore Academy</p>
      </div>

      {/* Grid of Dependents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {childrenList.map((child) => (
          <div 
            key={child.id}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
              selectedChildId === child.id 
                ? 'border-brand-blue shadow-md ring-2 ring-brand-blue/10' 
                : 'border-slate-200/60 dark:border-slate-800 hover:shadow-md'
            }`}
          >
            {/* Top header block */}
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <img 
                  src={child.photo} 
                  alt={child.name} 
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200/60 shadow-sm"
                />
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
                    {child.id}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{child.name}</h4>
                  <p className="text-[11px] font-mono text-slate-500">{child.grade} • {child.section}</p>
                </div>
              </div>
              
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                child.academicStatus === 'Distinction' 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
              }`}>
                {child.academicStatus}
              </span>
            </div>

            {/* Performance Indicators Grid */}
            <div className="grid grid-cols-3 gap-3.5 mt-6 border-t border-slate-100 dark:border-slate-850 pt-5 text-center">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Overall Average</span>
                <span className="text-base font-black text-slate-800 dark:text-white font-mono">{child.average}%</span>
              </div>
              <div className="space-y-0.5 border-x border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Academic GPA</span>
                <span className="text-base font-black text-brand-blue font-mono">{child.gpa}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Attendance</span>
                <span className="text-base font-black text-emerald-500 font-mono">{child.attendance}%</span>
              </div>
            </div>

            {/* Secondary Attributes and Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[10.5px] text-slate-500 font-medium">Homeroom:</span>
                <span className="text-[10.5px] text-slate-800 dark:text-slate-200 font-black">{child.homeroomTeacher}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectChild(child.id);
                    setActiveChildDetail(child);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 border border-slate-200/50 dark:border-slate-850 text-[10px] font-bold transition-all cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => onSelectChild(child.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    selectedChildId === child.id 
                      ? 'bg-brand-blue text-white cursor-default shadow' 
                      : 'bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue'
                  }`}
                >
                  {selectedChildId === child.id ? 'Selected' : 'Select Child'}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Child Detailed Profile Modal */}
      <AnimatePresence>
        {activeChildDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChildDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="flex gap-4">
                  <img 
                    src={activeChildDetail.photo} 
                    alt={activeChildDetail.name} 
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200/60"
                  />
                  <div>
                    <span className="text-[8.5px] font-mono font-bold text-brand-blue uppercase">{activeChildDetail.id} • REGULATORY DOSSIER</span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">{activeChildDetail.name}</h3>
                    <p className="text-xs text-slate-550">{activeChildDetail.grade} • {activeChildDetail.section}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveChildDetail(null)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-3 gap-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 p-4 rounded-2xl">
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">GPA Rank</span>
                  <span className="text-base font-black text-brand-indigo dark:text-brand-sky font-mono mt-0.5 block">{activeChildDetail.gpa}</span>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-850">
                  <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">Yearly Avg</span>
                  <span className="text-base font-black text-slate-800 dark:text-white font-mono mt-0.5 block">{activeChildDetail.average}%</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">Attendance</span>
                  <span className="text-base font-black text-emerald-500 font-mono mt-0.5 block">{activeChildDetail.attendance}%</span>
                </div>
              </div>

              {/* Demographic & Administrative detail rows */}
              <div className="space-y-4 text-xs">
                <h4 className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest border-b pb-1">Administrative Profile Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Date of Birth</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeChildDetail.dob}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Student Gender</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeChildDetail.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Homeroom Advisor</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{activeChildDetail.homeroomTeacher}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Academic Standing</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-brand-blue" />
                      <span>{activeChildDetail.academicStatus}</span>
                    </p>
                  </div>
                </div>

                <h4 className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest border-b pb-1 pt-2">Medical & Safety Declarations</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Allergies Declared</span>
                    <p className="font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>{activeChildDetail.allergyInfo}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px]">Primary Blood Group</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500" />
                      <span>{activeChildDetail.bloodGroup}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <button
                  onClick={() => setActiveChildDetail(null)}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-xs shadow cursor-pointer transition-colors"
                >
                  Close Dossier
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
