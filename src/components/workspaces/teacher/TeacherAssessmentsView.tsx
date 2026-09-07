'use client';

import React, { useState } from 'react';
import { Award, FileText } from 'lucide-react';
import { GradebookView } from './GradebookView';
import { ExamManagement } from './ExamManagement';

interface TeacherAssessmentsViewProps {
  teacherId: string;
  schoolId: string;
}

export const TeacherAssessmentsView: React.FC<TeacherAssessmentsViewProps> = ({ teacherId, schoolId }) => {
  const [activeSection, setActiveSection] = useState<'gradebook' | 'exams'>('gradebook');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSection('gradebook')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSection === 'gradebook'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award size={18} />
          Gradebook
        </button>
        <button
          onClick={() => setActiveSection('exams')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeSection === 'exams'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText size={18} />
          Exams
        </button>
      </div>

      {activeSection === 'gradebook' ? (
        <GradebookView teacherId={teacherId} schoolId={schoolId} />
      ) : (
        <ExamManagement teacherId={teacherId} schoolId={schoolId} />
      )}
    </div>
  );
};
