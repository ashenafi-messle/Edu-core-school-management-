/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, Save, RefreshCw, KeyRound, 
  Trash2, Plus, Info, Settings, ShieldCheck, Download, Printer 
} from 'lucide-react';
import { api } from '../../lib/api';

// Data models & Seed arrays
import { 
  AdminUser, StudentReadmission, PaymentRecord, 
  RolePermissions, SupportTicket, SchoolConfig 
} from './admin/AdminTypes';

import { 
  INITIAL_USERS, INITIAL_READMISSIONS, 
  INITIAL_PAYMENTS, INITIAL_PERMISSIONS, 
  INITIAL_TICKETS, DEFAULT_SCHOOL_CONFIG 
} from './admin/AdminMockData';

// Modular Subviews
import { AdminDashboard } from './admin/AdminDashboard';
import { UserManagement } from './admin/UserManagement';
import { RegistrationManagement } from './admin/RegistrationManagement';
import { PaymentManagement } from './admin/AdmissionsBilling';
import { 
  StudentReadmissionManagement
} from './admin/AcademicOperations';
import { AcademicYearManagement } from './admin/AcademicYearManagement';
import { 
  SystemMonitoring
} from './admin/SystemMaintenance';
import { 
  SchoolConfiguration, SupportCenter
} from './admin/SystemUtilities';
import { GradeSectionBuilder } from './admin/GradeSectionBuilder';
import { RolePermissionsManager } from './admin/RolePermissions';

interface AdminWorkspaceProps {
  activeItem: string;
  activeSubItem?: string;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({ activeItem, activeSubItem }) => {
  // 1. DYNAMIC DATA STATES
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [readmissions, setReadmissions] = useState<StudentReadmission[]>(INITIAL_READMISSIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [permissions, setPermissions] = useState<RolePermissions[]>(INITIAL_PERMISSIONS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(DEFAULT_SCHOOL_CONFIG);
  const [registrationCount, setRegistrationCount] = useState<number>(0);

  // 2. ACTIVE TOAST ALERT STACKS
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fallback pattern to support inner dashboard quick navigations
  const [overrideItem, setOverrideItem] = useState<string | null>(null);

  useEffect(() => {
    // Reset override when the user clicks the sidebar navigation items
    setOverrideItem(null);
  }, [activeItem, activeSubItem]);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const isConnected = await api.checkBackendConnection();
        if (isConnected) {
          // Load real users
          const realUsers = await api.getUsers();
          if (realUsers && realUsers.length > 0) {
            const mappedUsers: AdminUser[] = realUsers.map((u: any, idx: number) => ({
              id: u.id || `USR-${idx + 1001}`,
              name: u.full_name || 'Anonymous User',
              email: u.email,
              role: (['director', 'teacher', 'student', 'parent', 'admin'].includes(u.role) ? u.role : 'admin') as any,
              phone: u.phone || '+1 555-0100',
              status: 'Active',
              createdDate: u.created_at ? u.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
              lastLogin: 'Today'
            }));
            setUsers(mappedUsers);
          }

          // Load real payments
          const realPayments = await api.getPayments();
          if (realPayments && realPayments.length > 0) {
            const mappedPayments: PaymentRecord[] = realPayments.map((p: any, idx: number) => ({
              id: p.id || `PAY-${idx + 3912}`,
              invoiceNumber: p.invoice_number || `INV-2026-04${idx}`,
              studentId: p.student_id || 'STU-001',
              studentName: 'Rivera, Alex',
              parent: 'Eleanor Rivera',
              grade: 'Grade 10',
              section: 'Section A',
              category: 'Tuition',
              amountDue: p.amount || 1500,
              amountPaid: p.status === 'paid' ? p.amount : 0,
              remainingBalance: p.status === 'paid' ? 0 : p.amount,
              dueDate: p.due_date || '2026-08-15',
              paymentDate: p.status === 'paid' ? '2026-07-15' : 'N/A',
              status: (p.status === 'paid' ? 'Paid' : p.status === 'unpaid' ? 'Unpaid' : 'Paid') as any,
              method: 'Bank Transfer',
              reference: p.invoice_number || 'N/A'
            }));
            setPayments(mappedPayments);
          }

          // Load registration count
          const regCount = await api.getRegistrationCount();
          setRegistrationCount(regCount);
        }
      } catch (err) {
        console.warn('Failed to fetch from backend, using mock states:', err);
      }
    };

    loadRealData();
  }, []);

  const currentItem = overrideItem || activeItem;

  // Global trigger toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // 4. BUSINESS LOGIC STATE CALLBACKS

  // USER MANAGEMENT ACTIONS
  const handleAddUser = (user: Omit<AdminUser, 'id' | 'createdDate' | 'lastLogin'>) => {
    const newId = `USR-${users.length + 1001}`;
    const newUser: AdminUser = {
      ...user,
      id: newId,
      createdDate: new Date().toISOString().substring(0, 10),
      lastLogin: 'Never'
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const handleUpdateUser = (id: string, updated: Partial<AdminUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleResetPassword = async (id: string, newPass: string) => {
    try {
      await api.resetUserPassword(id, newPass);
      triggerToast(`Password reset successfully for user ${id}. The new password is now active in Supabase Auth.`);
    } catch (error) {
      console.error('Failed to reset password:', error);
      triggerToast(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // READMISSIONS ACTIONS
  const handleUpdateReadmission = (id: string, updated: Partial<StudentReadmission>) => {
    setReadmissions(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  // PAYMENTS ACTIONS
  const handleVerifyPayment = (id: string, reference: string, method: PaymentRecord['method']) => {
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'Paid',
          amountPaid: p.amountDue,
          remainingBalance: 0,
          method,
          reference,
          paymentDate: new Date().toISOString().substring(0, 10)
        };
      }
      return p;
    }));
  };

  const handleUpdatePayment = (id: string, updated: Partial<PaymentRecord>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  // TICKETS ACTIONS
  const handleReplyTicket = (id: string, text: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'Assigned',
          replies: [
            ...t.replies,
            {
              id: `rep-${Date.now()}`,
              sender: 'admin',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleCloseTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
  };

  // PERMISSIONS TOGGLE
  const handlePermissionToggle = (role: string, field: keyof Omit<RolePermissions, 'role'>) => {
    setPermissions(prev => prev.map(p => {
      if (p.role === role) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
    triggerToast(`Modified security capabilities for: ${role.toUpperCase()}`);
  };

  // Render Section Selector based on Navigation Item
  const renderContent = () => {
    switch (currentItem) {
      case 'dashboard':
        return (
          <AdminDashboard
            users={users}
            readmissions={readmissions}
            payments={payments}
            registrationCount={registrationCount}
            onNavigate={(tab) => setOverrideItem(tab)}
            onQuickApproveReg={() => {
              setOverrideItem('registration');
              triggerToast('Navigate to registration management');
            }}
            onQuickApproveReadm={(id) => {
              handleUpdateReadmission(id, { status: 'Approved', assignedSection: 'Section A' });
              triggerToast(`Approved returning student readmission placement for: ${id}`);
            }}
            onQuickCreateUser={() => setOverrideItem('users')}
          />
        );

      case 'users':
        return (
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
            triggerToast={triggerToast}
          />
        );

      case 'registration':
        return (
          <RegistrationManagement
            triggerToast={triggerToast}
          />
        );

      case 'readmission':
        return (
          <StudentReadmissionManagement
            readmissions={readmissions}
            onUpdateReadmission={handleUpdateReadmission}
            triggerToast={triggerToast}
          />
        );

      case 'payments':
        return (
          <PaymentManagement
            payments={payments}
            onVerifyPayment={handleVerifyPayment}
            onUpdatePayment={handleUpdatePayment}
            triggerToast={triggerToast}
          />
        );

      case 'permissions':
        return (
          <RolePermissionsManager triggerToast={triggerToast} />
        );

      case 'school_config':
        return (
          <SchoolConfiguration
            config={schoolConfig}
            onUpdateConfig={(updated) => setSchoolConfig(prev => ({ ...prev, ...updated }))}
            triggerToast={triggerToast}
          />
        );

      case 'academic_years':
        return <AcademicYearManagement triggerToast={triggerToast} />;

      case 'grade_section_builder':
        return <GradeSectionBuilder />;

      case 'monitoring':
        return <SystemMonitoring />;

      case 'support':
        return (
          <SupportCenter
            tickets={tickets}
            onReplyTicket={handleReplyTicket}
            onCloseTicket={handleCloseTicket}
            triggerToast={triggerToast}
          />
        );

      default:
        return (
          <div className="py-12 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center text-slate-450 italic">
            This administrative module is active but temporarily empty under design standards.
          </div>
        );
    }
  };

  return (
    <PageContainer
      title={currentItem.charAt(0).toUpperCase() + currentItem.slice(1).replace('_', ' ')}
      description={`Manage ${currentItem.replace('_', ' ')} settings and configurations`}
    >
      
      {/* Dynamic Content Renderer */}
      {renderContent()}

      {/* 5. FLOATING GLASS TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 shadow-2xl rounded-2xl max-w-sm font-sans"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400 block tracking-wider leading-none mb-1">System Notice</span>
              <p className="text-[11px] font-medium leading-normal text-slate-200">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-450 hover:text-white shrink-0 ml-1.5">
              <XIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </PageContainer>
  );
};

// Compact X icon
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
