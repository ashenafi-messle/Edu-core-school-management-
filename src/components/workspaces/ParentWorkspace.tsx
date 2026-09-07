/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageContainer } from '../layout/PageContainer';
import { ArrowLeftRight, Users, Bell, MessageSquare, HelpCircle } from 'lucide-react';

// Modular Subviews Imports
import { ParentDashboardView } from './parent/ParentDashboardView';
import { ParentChildrenView } from './parent/ParentChildrenView';
import { ParentAcademicView } from './parent/ParentAcademicView';
import { ParentBehaviorAttendanceView } from './parent/ParentBehaviorAttendanceView';
import { ParentBillingRegistrationView } from './parent/ParentBillingRegistrationView';
import { ParentCommunicationFeedbackView } from './parent/ParentCommunicationFeedbackView';
import { ParentSystemUtilityView } from './parent/ParentSystemUtilityView';

// Mock Database & Data Models
import { 
  INITIAL_CHILDREN, 
  ACADEMIC_PROGRESS_RECORDS, 
  BEHAVIOR_RECORDS, 
  ATTENDANCE_RECORDS, 
  INITIAL_PAYMENTS, 
  INITIAL_REGISTRATION, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_COMMUNICATION_THREADS, 
  INITIAL_FEEDBACKS, 
  CALENDAR_EVENTS,
  ChildProfile
} from './parent/ParentMockData';

interface ParentWorkspaceProps {
  activeItem: string;
  activeSubItem?: string;
}

export const ParentWorkspace: React.FC<ParentWorkspaceProps> = ({ activeItem, activeSubItem }) => {
  // Global React state backed by ParentMockData
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(INITIAL_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState<string>('STU-1001');
  
  // Dynamic collections that can be modified in sandbox simulation
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATION);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState(INITIAL_FEEDBACKS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [messageThreads, setMessageThreads] = useState(INITIAL_COMMUNICATION_THREADS);
  const [parentProfile, setParentProfile] = useState({
    name: 'Marcus Johnson',
    email: 'marcus.johnson@example.com',
    phone: '+1 (555) 019-2834',
    address: '1022 West Oak Avenue, Sector 4',
    occupation: 'Lead Aerospace Architect',
    emergencyContact: 'Sarah Johnson (Spouse) - +1 (555) 019-2835'
  });

  // Current active child profile based on state selector
  const activeChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  // Callback to pay/settle invoice
  const handleSettleInvoice = (invoiceId: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === invoiceId) {
        return {
          ...p,
          status: 'Paid',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Credit Card Sandbox'
        };
      }
      return p;
    }));
  };

  // Callback to register dependent for next year
  const handleSubmitRegistration = (childId: string, documents: string[], updatedInfo: any) => {
    setRegistrations(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        status: 'Submitted',
        submittedDocuments: documents.map(d => ({
          name: d,
          type: 'PDF',
          date: new Date().toISOString().split('T')[0]
        })),
        updatedInfo
      }
    }));
  };

  // Callback to send feedback
  const handleSubmitFeedback = (newFeedback: any) => {
    setFeedbackSubmissions(prev => [newFeedback, ...prev]);
  };

  // Callback to mark announcements as read
  const handleMarkAnnouncementRead = (annId: string) => {
    setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, read: true } : a));
  };

  // Callback to append messages inside threads
  const handleSendMessage = (threadId: string, messageText: string) => {
    setMessageThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: [
            ...thread.messages,
            {
              id: `MSG-${Date.now()}`,
              sender: 'parent',
              text: messageText,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return thread;
    }));

    // Trigger simulated teacher response delayed
    setTimeout(() => {
      setMessageThreads(prev => prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            messages: [
              ...thread.messages,
              {
                id: `MSG-${Date.now() + 1}`,
                sender: 'teacher',
                text: 'Thank you for your response. Our academic advisory board is analyzing this. I will send you a prompt update shortly.',
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return thread;
      }));
    }, 2000);
  };

  // Switch context navigator helpers
  const [internalActiveItem, setInternalActiveItem] = useState<string | null>(null);
  const currentViewItem = internalActiveItem || activeItem;

  const handleNavigate = (tabId: string) => {
    setInternalActiveItem(tabId);
    // Sync window parameters or local state triggers
    const tabEl = document.querySelector(`[data-sidebar-id="${tabId}"]`) as HTMLElement;
    if (tabEl) {
      tabEl.click();
    }
  };

  const handleUpdateProfile = (updated: any) => {
    setParentProfile(prev => ({ ...prev, ...updated }));
  };

  // Router switcher mapping
  const renderWorkspaceContent = () => {
    switch (currentViewItem) {
      case 'dashboard':
        return (
          <ParentDashboardView
            childrenList={childrenList}
            payments={payments}
            announcements={announcements}
            messages={messageThreads}
            events={CALENDAR_EVENTS}
            attendanceLogs={ATTENDANCE_RECORDS}
            onNavigate={handleNavigate}
            onSelectChild={setSelectedChildId}
          />
        );

      case 'children':
        return (
          <ParentChildrenView
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
          />
        );

      case 'progress':
        return (
          <ParentAcademicView
            selectedChild={activeChild}
            academicRecords={ACADEMIC_PROGRESS_RECORDS[selectedChildId] || []}
            mode="progress"
          />
        );

      case 'subject_marks':
        return (
          <ParentAcademicView
            selectedChild={activeChild}
            academicRecords={ACADEMIC_PROGRESS_RECORDS[selectedChildId] || []}
            mode="subject_marks"
          />
        );

      case 'behavior':
        return (
          <ParentBehaviorAttendanceView
            selectedChild={activeChild}
            behaviorRecords={BEHAVIOR_RECORDS[selectedChildId] || []}
            attendanceRecords={ATTENDANCE_RECORDS[selectedChildId] || []}
            mode="behavior"
          />
        );

      case 'attendance':
        return (
          <ParentBehaviorAttendanceView
            selectedChild={activeChild}
            behaviorRecords={BEHAVIOR_RECORDS[selectedChildId] || []}
            attendanceRecords={ATTENDANCE_RECORDS[selectedChildId] || []}
            mode="attendance"
          />
        );

      case 'payments':
        return (
          <ParentBillingRegistrationView
            selectedChild={activeChild}
            payments={payments}
            registrationStatus={registrations[selectedChildId]}
            mode="payments"
            onSettleInvoice={handleSettleInvoice}
            onSubmitRegistration={handleSubmitRegistration}
          />
        );

      case 'registration':
        return (
          <ParentBillingRegistrationView
            selectedChild={activeChild}
            payments={payments}
            registrationStatus={registrations[selectedChildId]}
            mode="registration"
            onSettleInvoice={handleSettleInvoice}
            onSubmitRegistration={handleSubmitRegistration}
          />
        );

      case 'announcements':
        return (
          <ParentCommunicationFeedbackView
            selectedChild={activeChild}
            announcements={announcements}
            messageThreads={messageThreads}
            feedbackSubmissions={feedbackSubmissions}
            mode="announcements"
            onSendMessage={handleSendMessage}
            onSubmitFeedback={handleSubmitFeedback}
            onMarkAnnouncementRead={handleMarkAnnouncementRead}
          />
        );

      case 'teacher_communication':
        return (
          <ParentCommunicationFeedbackView
            selectedChild={activeChild}
            announcements={announcements}
            messageThreads={messageThreads}
            feedbackSubmissions={feedbackSubmissions}
            mode="teacher_communication"
            onSendMessage={handleSendMessage}
            onSubmitFeedback={handleSubmitFeedback}
            onMarkAnnouncementRead={handleMarkAnnouncementRead}
          />
        );

      case 'feedback':
        return (
          <ParentCommunicationFeedbackView
            selectedChild={activeChild}
            announcements={announcements}
            messageThreads={messageThreads}
            feedbackSubmissions={feedbackSubmissions}
            mode="feedback"
            onSendMessage={handleSendMessage}
            onSubmitFeedback={handleSubmitFeedback}
            onMarkAnnouncementRead={handleMarkAnnouncementRead}
          />
        );

      case 'downloads':
        return (
          <ParentSystemUtilityView
            selectedChild={activeChild}
            events={CALENDAR_EVENTS}
            mode="downloads"
            parentProfile={parentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case 'calendar':
        return (
          <ParentSystemUtilityView
            selectedChild={activeChild}
            events={CALENDAR_EVENTS}
            mode="calendar"
            parentProfile={parentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case 'profile':
        return (
          <ParentSystemUtilityView
            selectedChild={activeChild}
            events={CALENDAR_EVENTS}
            mode="profile"
            parentProfile={parentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case 'settings':
        return (
          <ParentSystemUtilityView
            selectedChild={activeChild}
            events={CALENDAR_EVENTS}
            mode="settings"
            parentProfile={parentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      default:
        return (
          <div className="p-8 text-center text-slate-450 italic">
            Module under construction: {currentViewItem}
          </div>
        );
    }
  };

  return (
    <PageContainer>
      
      {/* Universal Dependents Active Toggle Panel */}
      {currentViewItem !== 'dashboard' && currentViewItem !== 'children' && currentViewItem !== 'profile' && currentViewItem !== 'settings' && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/15 flex items-center justify-center text-brand-blue">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">ACTIVE GUARDIAN SELECTOR</span>
              <p className="text-slate-650 dark:text-slate-350">
                Evaluating records for dependent:{' '}
                <span className="font-black text-slate-800 dark:text-white">
                  {activeChild.name} ({activeChild.grade})
                </span>
              </p>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
            {childrenList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  selectedChildId === c.id 
                    ? 'bg-brand-blue text-white shadow' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Transition Area */}
      <motion.div
        key={currentViewItem + selectedChildId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full"
      >
        {renderWorkspaceContent()}
      </motion.div>

    </PageContainer>
  );
};
