/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-900 bg-white/40 dark:bg-slate-950/40 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500 dark:text-slate-500 font-mono transition-colors duration-300">
      <p>© 2026 EduCore School Suite. Licensed Enterprise Instance.</p>
      <div className="flex items-center gap-4 font-semibold font-sans">
        <a href="#/about" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Documentation</a>
        <span className="text-slate-300 dark:text-slate-800">•</span>
        <a href="#/contact" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Operations Help Desk</a>
        <span className="text-slate-300 dark:text-slate-800">•</span>
        <span className="text-emerald-500 font-bold">● System v4.1.2</span>
      </div>
    </footer>
  );
};
