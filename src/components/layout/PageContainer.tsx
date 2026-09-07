/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';

interface PageContainerProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, description, actions, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div className="space-y-1.5 text-left">
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-normal">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5">
            {actions}
          </div>
        )}
      </div>

      {/* Main Container Content */}
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
};
