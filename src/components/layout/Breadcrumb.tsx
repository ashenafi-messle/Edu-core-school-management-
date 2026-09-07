/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  role: string;
  activeItem: string;
  parentItem?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ role, activeItem, parentItem }) => {
  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-450 dark:text-slate-500 uppercase tracking-wider" aria-label="Breadcrumb">
      <div className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
        <Home className="w-3 h-3 text-brand-blue" />
        <span className="hidden sm:inline">Portal</span>
      </div>
      <ChevronRight className="w-2.5 h-2.5 flex-shrink-0 text-slate-300 dark:text-slate-800" />
      <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors capitalize">
        {role === 'admin' ? 'System Administrator' : role}
      </span>
      {parentItem && (
        <>
          <ChevronRight className="w-2.5 h-2.5 flex-shrink-0 text-slate-300 dark:text-slate-800" />
          <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors capitalize">
            {parentItem}
          </span>
        </>
      )}
      <ChevronRight className="w-2.5 h-2.5 flex-shrink-0 text-slate-300 dark:text-slate-800" />
      <span className="text-slate-900 dark:text-white font-bold font-sans normal-case tracking-normal">
        {activeItem}
      </span>
    </nav>
  );
};
