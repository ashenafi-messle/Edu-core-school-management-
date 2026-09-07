/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, Calendar, FileText, Shield, BookOpen, 
  GraduationCap, Users, Briefcase, Award, X, Loader2, ArrowLeft
} from 'lucide-react';
import { api } from '../lib/api';

interface UserDetailPageProps {
  userId: string;
  onClose: () => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({ userId, onClose }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const result = await api.getUserDetails(userId);
        setUserData(result.user);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 flex items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          <span className="text-slate-900 dark:text-white font-bold">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md text-center">
          <p className="text-red-500 font-bold mb-4">{error || 'User not found'}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const user = userData;
  const roleSpecificData = user.parent || user.student || user.teacher;

  return (
    <div className="fixed inset-0 z-[9999] p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="absolute top-20 left-10 w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                title="Back to search"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">User Profile Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

        {/* User Header */}
        <div className="flex items-start gap-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-brand-blue/5 to-brand-indigo/5 border border-brand-blue/10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {user.full_name || 'Unknown'}
            </h4>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase font-mono text-white bg-brand-blue dark:bg-brand-indigo px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" />
                {user.role}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase font-mono px-3 py-1.5 rounded-full ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : user.status === 'inactive'
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {user.status || 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          </div>
        </div>

        {/* Base User Information */}
        <div className="mb-8">
          <h5 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Information
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Phone</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {user.phone || 'Not provided'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Created</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">User ID</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Role-Specific Information */}
        {roleSpecificData && (
          <div>
            <h5 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              {user.role === 'parent' && <Users className="w-4 h-4" />}
              {user.role === 'student' && <GraduationCap className="w-4 h-4" />}
              {user.role === 'teacher' && <Briefcase className="w-4 h-4" />}
              {user.role === 'director' && <Award className="w-4 h-4" />}
              {user.role === 'admin' && <Shield className="w-4 h-4" />}
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Details
            </h5>

            {user.role === 'parent' && user.parent && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Relationship</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.parent.relationship || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Emergency Contact</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.parent.emergency_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'student' && user.student && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Admission Number</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{user.student.admission_number}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Grade Level</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.student.grade_level}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Section</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.student.section || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Parent</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.student.parent?.full_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'teacher' && user.teacher && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Employee ID</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{user.teacher.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Department</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.teacher.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Subjects</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {user.teacher.subjects && user.teacher.subjects.length > 0 ? (
                        user.teacher.subjects.map((subject: string, idx: number) => (
                          <span key={idx} className="text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No subjects assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {user.profile_picture_url && (
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h5 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Picture
            </h5>
            <img 
              src={user.profile_picture_url} 
              alt="Profile" 
              className="w-24 h-24 rounded-2xl object-cover"
            />
          </div>
        )}
        </div>
      </motion.div>
    </div>
  );
};
