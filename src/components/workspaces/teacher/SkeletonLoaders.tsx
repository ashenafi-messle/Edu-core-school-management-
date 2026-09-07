/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
  </div>
);

export const ClassesSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
    <div className="h-20 bg-gradient-to-r from-brand-blue to-brand-indigo rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const StudentsSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const AttendanceSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const CurriculumSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const GenericSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>
  </div>
);