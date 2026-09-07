/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Plus, Edit, Trash2, Key, Shield, UserX, 
  CheckCircle, ChevronDown, Download, UserPlus, X, AlertTriangle, 
  Calendar, Phone, Mail, FileText, Check, Award, BookOpen
} from 'lucide-react';
import { AdminUser } from './AdminTypes';
import { api } from '../../../lib/api';

interface UserManagementProps {
  users: AdminUser[];
  onAddUser: (user: Omit<AdminUser, 'id' | 'createdDate' | 'lastLogin'>) => void;
  onUpdateUser: (id: string, updated: Partial<AdminUser>) => void;
  onDeleteUser: (id: string) => void;
  onResetPassword: (id: string, newPass: string) => void;
  triggerToast: (msg: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  triggerToast
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected User Details Drawer/Modal
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [resettingPwdUserId, setResettingPwdUserId] = useState<string | null>(null);
  
  // Create User Form Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Password reset visual form state
  const [tempPassword, setTempPassword] = useState('');

  // Add User Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'director' | 'teacher' | 'student' | 'parent' | 'admin'>('student');
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');

  // Selected user for details rendering
  const activeUser = users.find(u => u.id === activeDetailsId);
  const editingUser = users.find(u => u.id === editingUserId);

  // Edit user state
  const [editFields, setEditFields] = useState<Partial<AdminUser>>({});

  // Filter & Search Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, id]);
    } else {
      setSelectedUsers(prev => prev.filter(uId => uId !== id));
    }
  };

  // Bulk actions
  const triggerBulkDeactivate = () => {
    selectedUsers.forEach(id => {
      onUpdateUser(id, { status: 'Deactivated' });
    });
    triggerToast(`Bulk deactivated ${selectedUsers.length} users successfully.`);
    setSelectedUsers([]);
  };

  const triggerBulkActivate = () => {
    selectedUsers.forEach(id => {
      onUpdateUser(id, { status: 'Active' });
    });
    triggerToast(`Bulk activated ${selectedUsers.length} users successfully.`);
    setSelectedUsers([]);
  };

  const triggerExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["User ID,Name,Role,Email,Phone,Status"].join(",") + "\n"
      + filteredUsers.map(u => `${u.id},${u.name},${u.role},${u.email},${u.phone},${u.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `school_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("User directory exported successfully as CSV.");
  };

  // Create User submit helper
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      triggerToast("Missing required fields: Full Name & Email");
      return;
    }
    onAddUser({
      name: newName,
      email: newEmail,
      phone: newPhone || '+1 (555) 000-0000',
      role: newRole,
      status: 'Active',
      grade: newRole === 'student' ? newGrade || 'Grade 9' : undefined,
      section: newRole === 'student' ? newSection || 'Section A' : undefined,
      assignedClasses: newRole === 'teacher' ? ['Algebra 10-A'] : undefined,
      assignedSubjects: newRole === 'teacher' ? ['Mathematics'] : undefined,
      emergencyContact: 'Guardian Details - +1 (555) 000-0000'
    });
    triggerToast(`Account created successfully for ${newName}. Temporary login credentials dispatched.`);
    setIsCreateOpen(false);
    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('student');
    setNewGrade('');
    setNewSection('');
  };

  // Save edit user helper
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      try {
        // Prepare update data for users table (map to database field names)
        const updateData: any = {
          name: editFields.name,
          email: editFields.email,
          phone: editFields.phone,
          status: editFields.status
        };

        // Add role-specific fields
        if (editingUser?.role === 'student') {
          updateData.grade_level = editFields.grade;
          updateData.section = editFields.section;
        } else if (editingUser?.role === 'teacher') {
          updateData.department = editFields.assignedClasses?.[0] || editFields.department;
          updateData.subjects = editFields.assignedSubjects || [];
        } else if (editingUser?.role === 'parent') {
          updateData.relationship = editFields.relationship;
          updateData.emergency_contact = editFields.emergencyContact;
        }

        console.log('Sending update data:', updateData);

        // Update user via API (backend will handle role-specific table updates)
        await api.updateUser(editingUserId, updateData);
        
        // Update local state
        onUpdateUser(editingUserId, editFields);
        
        triggerToast(`Account information updated for ${editingUser?.name}.`);
        setEditingUserId(null);
      } catch (error) {
        console.error('Failed to update user:', error);
        triggerToast(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Trigger password reset helper
  const handlePwdResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassword) {
      triggerToast("Please input a valid temporary password");
      return;
    }
    if (resettingPwdUserId) {
      onResetPassword(resettingPwdUserId, tempPassword);
      setResettingPwdUserId(null);
      setTempPassword('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER BAR PANEL */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between text-left">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Global Search */}
          <div className="relative flex items-center w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, ID, email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-slate-850 dark:text-slate-200"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="director">Directors</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
            <option value="admin">Administrators</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>

        {/* Action button triggers */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
              <button
                onClick={triggerBulkActivate}
                className="px-2.5 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Activate ({selectedUsers.length})
              </button>
              <button
                onClick={triggerBulkDeactivate}
                className="px-2.5 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          )}

          <button
            onClick={triggerExport}
            className="h-10 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-bold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-4 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN USER SPREADSHEET TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 font-mono text-xs font-bold uppercase select-none">
                <th className="py-3 px-5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    className="cursor-pointer"
                  />
                </th>
                <th className="py-3 px-5">Identifier</th>
                <th className="py-3 px-5">Full Name</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Contact Details</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Log</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-350">
                  <td className="py-3.5 px-5">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-5 font-mono text-sm font-bold text-brand-indigo dark:text-brand-sky">
                    {user.id}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-center font-bold text-xs">
                        {user.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-850 dark:text-white block">{user.name}</span>
                        <span className="text-xs text-slate-400 block font-mono">Added {user.createdDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 capitalize font-mono text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-600' :
                      user.role === 'director' ? 'bg-purple-500/10 text-purple-600' :
                      user.role === 'teacher' ? 'bg-brand-blue/10 text-brand-indigo' :
                      user.role === 'student' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-850'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="space-y-0.5 font-mono text-[10.5px]">
                      <p className="font-bold text-slate-650 dark:text-slate-350">{user.email}</p>
                      <p className="text-slate-400">{user.phone}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${
                      user.status === 'Active' ? 'text-emerald-500' :
                      user.status === 'Suspended' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500' :
                        user.status === 'Suspended' ? 'bg-amber-500' : 'bg-slate-350'
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[10.5px] text-slate-450">
                    {user.lastLogin}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActiveDetailsId(user.id)}
                        className="p-1 text-slate-450 hover:text-brand-blue rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-all"
                        title="View Full Profile"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditFields({ ...user });
                        }}
                        className="p-1 text-slate-450 hover:text-brand-indigo rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResettingPwdUserId(user.id)}
                        className="p-1 text-slate-450 hover:text-amber-500 rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-all"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete user account: ${user.name}? This action is irreversible.`)) {
                            onDeleteUser(user.id);
                            triggerToast(`Deleted user account: ${user.name}`);
                          }
                        }}
                        className="p-1 text-slate-450 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between text-xs font-mono text-slate-450 bg-slate-50/40 dark:bg-slate-950/20">
          <span>Page {currentPage} of {totalPages} ({filteredUsers.length} total users)</span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODALS / DRAWERS (AnimatePresence) */}
      <AnimatePresence>
        
        {/* CREATE USER MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-blue" />
                  <span>Create User Account</span>
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Amanda Cole"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Account Role</label>
                    <select
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                      <option value="director">Director</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. amanda@gmail.com"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Phone Number</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 011-2299"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>

                {newRole === 'student' && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Enroll Grade</label>
                      <input
                        type="text"
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        placeholder="e.g. Grade 10"
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Enroll Section</label>
                      <input
                        type="text"
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        placeholder="e.g. Section B"
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Submit Deployment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT USER DETAILS MODAL */}
        {editingUserId && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-brand-indigo" />
                  <span>Edit Account Details ({editingUser.id})</span>
                </h3>
                <button onClick={() => setEditingUserId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFields.name || ''}
                      onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Account Status</label>
                    <select
                      value={editFields.status}
                      onChange={(e: any) => setEditFields(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editFields.email || ''}
                      onChange={(e) => setEditFields(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold uppercase text-slate-450">Phone Number</label>
                    <input
                      type="text"
                      value={editFields.phone || ''}
                      onChange={(e) => setEditFields(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {editingUser.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Enrolled Grade</label>
                      <input
                        type="text"
                        value={editFields.grade || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Assigned Section</label>
                      <input
                        type="text"
                        value={editFields.section || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {editingUser.role === 'teacher' && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Department</label>
                      <input
                        type="text"
                        value={editFields.department || editingUser.assignedClasses?.[0] || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Subjects</label>
                      <input
                        type="text"
                        value={editFields.subjects || editingUser.assignedSubjects?.join(', ') || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, subjects: e.target.value.split(',').map(s => s.trim()) }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                        placeholder="Math, Science, English"
                      />
                    </div>
                  </div>
                )}

                {editingUser.role === 'parent' && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Relationship</label>
                      <select
                        value={editFields.relationship || editingUser.relationship || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, relationship: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="guardian">Guardian</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono font-bold uppercase text-slate-450">Emergency Contact</label>
                      <input
                        type="text"
                        value={editFields.emergencyContact || editingUser.emergencyContact || ''}
                        onChange={(e) => setEditFields(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-indigo hover:bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* PASSWORD RESET DIALOG */}
        {resettingPwdUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Secure Credential Reset</span>
                </h3>
                <button onClick={() => setResettingPwdUserId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePwdResetSubmit} className="mt-4 space-y-3">
                <p className="text-sm text-slate-500 leading-relaxed">
                  For safety standards, you cannot view the existing password. Set an instant temporary random credential:
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-450">Temporary Password</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="e.g. TempPass@2026!"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTempPassword(`Pass_${Math.floor(1000 + Math.random() * 9000)}_X`)}
                      className="absolute right-2.5 top-2 px-2 py-1 bg-slate-150 dark:bg-slate-850 rounded-lg text-[10px] font-mono font-bold cursor-pointer hover:bg-slate-200"
                    >
                      Autogen
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setResettingPwdUserId(null)}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Overwrite Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* FULL DETAILS PROFILE CARD */}
        {activeDetailsId && activeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-mono font-bold text-slate-400 uppercase text-xs">Secure Directory Node / {activeUser.id}</h3>
                <button onClick={() => setActiveDetailsId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header profile info */}
              <div className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <div className="w-14 h-14 bg-brand-blue/15 text-brand-blue font-black text-xl rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-850">
                  {activeUser.name[0]}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-850 dark:text-white leading-tight">{activeUser.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold bg-brand-indigo/10 text-brand-indigo px-1.5 py-0.2 rounded uppercase">
                      {activeUser.role}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded uppercase">
                      {activeUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile fields list */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block uppercase">Email Contact</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{activeUser.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block uppercase">Phone Number</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{activeUser.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block uppercase">Account Opened</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{activeUser.createdDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block uppercase">Last Activity Log</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{activeUser.lastLogin}</p>
                </div>
              </div>

              {/* Specific metadata fields */}
              {activeUser.role === 'student' && (
                <div className="p-3 bg-brand-blue/5 border border-brand-blue/15 rounded-xl text-xs space-y-2">
                  <h5 className="font-bold text-slate-850 dark:text-white flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Academic Registration</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                    <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Grade Placement</span>{activeUser.grade || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Division Section</span>{activeUser.section || 'N/A'}</p>
                    <p className="col-span-2"><span className="text-slate-400 font-bold uppercase text-[10px] block">Emergency Contact</span>{activeUser.emergencyContact}</p>
                  </div>
                </div>
              )}

              {activeUser.role === 'teacher' && (
                <div className="p-3 bg-brand-indigo/5 border border-brand-indigo/15 rounded-xl text-xs space-y-2">
                  <h5 className="font-bold text-slate-850 dark:text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Academic Appointment</span>
                  </h5>
                  <div className="text-sm font-mono space-y-1">
                    <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Divisions</span>{activeUser.assignedClasses?.join(', ') || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Subjects</span>{activeUser.assignedSubjects?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <button
                  onClick={() => setActiveDetailsId(null)}
                  className="px-5 py-1.5 bg-slate-850 dark:bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
};
