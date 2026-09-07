/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, 
  ArrowLeft, ArrowRight, Shield, ShieldCheck, Check, Copy, 
  Users, TrendingUp, Calendar, Bell, CreditCard, Clock, 
  FileText, Activity, Zap, Cloud, Laptop, ExternalLink, HelpCircle,
  Sun, Moon
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_CREDENTIALS } from '../data';
import { UserRole, UserCredential } from '../types';
import { api } from '../lib/api';

export const LoginPage: React.FC = () => {
  const { login, navigateTo, theme, toggleTheme } = useNavigation();
  const { language, setLanguage, t } = useLanguage();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  
  // UI UX States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Email format regex validation
  const validateEmailFormat = (val: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  // Pre-fill credential helper & Copy to clipboard
  const handleSelectAndCopyDemo = async (roleKey: string, index: number) => {
    const cred = MOCK_CREDENTIALS[roleKey];
    if (!cred) return;

    // Fill form
    setEmail(cred.email);
    setPassword('demo123');
    setEmailError('');
    setPasswordError('');
    setSubmitError('');

    // Copy to Clipboard
    const copyText = `Email: ${cred.email}\nPassword: demo123`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      // Fallback if permission is denied
      console.warn('Clipboard write failed. Form was filled instead.', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setSubmitError('');

    let hasError = false;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email address is required.');
      hasError = true;
    } else if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email address (e.g., director@demo.com).');
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      // Call Supabase authentication API with timeout
      const authPromise = api.login(email.trim(), password);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout. Please try again.')), 20000);
      });
      
      const authResponse = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (!authResponse.success) {
        throw new Error(authResponse.error || 'Authentication failed');
      }

      const { user, session, school } = authResponse;

      // Store session tokens in localStorage using batch operations
      if (typeof window !== 'undefined') {
        // Batch localStorage writes for better performance
        const userData = {
          user: {
            id: user.user.id,
            school_id: user.user.school_id,
            email: user.user.email,
            full_name: user.user.full_name,
            role: user.user.role,
            phone: user.user.phone,
          },
        };
        
        try {
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('school_data', JSON.stringify(school));
        } catch (error) {
          // Clear all if any fails to maintain consistency
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('school_data');
          console.warn('Unable to persist login data locally:', error);
          throw new Error('Storage error. Please clear browser data and try again.');
        }
      }

      // Configure school ID header context
      api.setSchoolId(user.user.school_id);

      // Create user credential for navigation context
      const userCred: UserCredential = {
        id: user.user.role === 'teacher' ? user.teacher?.id : user.user.id,
        schoolId: user.user.school_id,
        email: user.user.email,
        role: user.user.role as UserRole,
        name: user.user.full_name,
        avatar: user.user.role === 'teacher' && (user.teacher?.photo || user.teacher?.profile_picture_url)
          ? (user.teacher.photo || user.teacher.profile_picture_url)
          : user.user.role === 'admin'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        schoolName: school?.name || 'EduCore School',
        phone: user.user.phone || undefined,
      };

      setSuccessUser(userCred.name);
      setSuccess(true);
      setLoading(false);

      // Immediate navigation without waiting for any other operations
      login(userCred);

    } catch (err: any) {
      setSubmitError(err.message || 'Invalid email or password. Verify credentials and try again.');
      setLoading(false);
    }
  };

  // Demo accounts array with Admin replaced from accountant
  const demoAccounts = [
    { key: 'director', label: 'Director', email: 'director@demo.com', pass: 'demo123' },
    { key: 'teacher', label: 'Teacher', email: 'teacher@demo.com', pass: 'demo123' },
    { key: 'student', label: 'Student', email: 'student@demo.com', pass: 'demo123' },
    { key: 'parent', label: 'Parent', email: 'parent@demo.com', pass: 'demo123' },
    { key: 'admin', label: 'Admin', email: 'admin@demo.com', pass: 'demo123' }
  ];

  // Note: Demo accounts are for testing. For production, users must be created through registration or admin panel

  const features = [
    { title: 'Secure Authentication', desc: 'SAML, OAuth 2.0 & secure local persistence.', icon: Shield },
    { title: 'Role-Based Access', desc: 'Granular user spaces for all academic sectors.', icon: ShieldCheck },
    { title: 'Real-Time Analytics', desc: 'Continuous insights on attendance & billing metrics.', icon: TrendingUp },
    { title: 'Cloud Synchronization', desc: 'Encrypted databases syncing seamlessly.', icon: Cloud },
    { title: 'Mobile Friendly', desc: 'Optimized touch interface across viewports.', icon: Laptop },
    { title: 'Enterprise Security', desc: 'AES-256 state locks complying with FERPA standards.', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen w-full relative bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* 1. Dynamic Premium Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft glowing purple and blue blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/10 dark:bg-brand-blue/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-indigo/10 dark:bg-brand-indigo/15 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] left-[35%] w-[35vw] h-[35vw] rounded-full bg-brand-sky/5 dark:bg-brand-sky/10 blur-[130px]" />
        
        {/* Abstract Floating Shapes & Particle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Back to Home Header */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <button
          onClick={() => navigateTo('home')}
          className="group flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Return to landing page"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Site</span>
        </button>
        <div className="flex items-center gap-3">
          {/* Functional Theme Toggle */}
          <button
            id="theme-toggle-login-btn"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500 tracking-wider">SECURE LINK // PORT 3000</span>
        </div>
      </div>

      {/* Main Two-Column Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* ==========================================
            LEFT COLUMN (45%): BRANDING & MOCKUP
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 order-2 lg:order-1 text-left">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-indigo flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">🎓 EduCore</span>
              <p className="text-[10px] text-brand-indigo dark:text-brand-sky font-bold uppercase tracking-wider -mt-1">School Management System</p>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t('Manage Your Entire School')} <br />
              <span className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky bg-clip-text text-transparent">
                {t('From One Powerful Platform')}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('A secure cloud-based platform that connects directors, administrators, teachers, students, and parents in one intelligent system.')}
            </p>
          </div>

          {/* Interactive Dashboard Mockup & Glassmorphism widgets */}
          <div className="relative p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-2xl h-[330px] overflow-hidden group">
            
            {/* Header of mockup */}
            <div className="w-full h-7 bg-slate-100/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 rounded-t-xl px-3 flex items-center justify-between text-[9px] text-slate-500 font-mono mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/60" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <span className="w-2 h-2 rounded-full bg-green-500/60" />
                <span className="ml-1 text-slate-600 dark:text-slate-400">educore.system/admin</span>
              </div>
              <span className="text-brand-indigo dark:text-brand-sky">STATUS: ENCRYPTED //</span>
            </div>

            {/* Simulated Live Grid */}
            <div className="grid grid-cols-2 gap-3 h-[240px] overflow-hidden pr-1">
              
              {/* Card 1: Student Statistics */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-medium">Total Students</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">1,248 <span className="text-[8px] text-emerald-500 dark:text-emerald-400 font-mono">+12%</span></p>
                </div>
              </div>

              {/* Card 2: Attendance Rate Chart */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-slate-500 font-medium">Attendance Avg</p>
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 rounded">96.4%</span>
                </div>
                {/* Visual bar chart */}
                <div className="flex items-end justify-between gap-1 h-8 mt-1">
                  {[40, 60, 85, 95, 75, 100, 96].map((h, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${h}%` }} 
                      className="bg-gradient-to-t from-brand-blue to-brand-indigo w-full rounded-sm opacity-80 hover:opacity-100 transition-opacity" 
                    />
                  ))}
                </div>
              </div>

              {/* Card 3: Fee Summary Ledger */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-medium">Fee Arrears Matrix</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">$4,200 <span className="text-[8px] text-red-500 dark:text-red-400 font-mono">Unpaid</span></p>
                </div>
              </div>

              {/* Card 4: Next Calendar Event */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-medium">Next Board Sync</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">14:00 Syllabus</p>
                </div>
              </div>

              {/* Card 5: Real-Time Event Feed */}
              <div className="col-span-2 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] text-slate-700 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-brand-indigo dark:text-brand-sky" />
                    <span>Real-Time Activity Timeline</span>
                  </p>
                  <span className="text-[8px] font-mono text-slate-500">Live feeds</span>
                </div>
                <div className="space-y-1 text-[9px] font-mono text-slate-600 dark:text-slate-400 text-left">
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850/60 pb-0.5">
                    <span>🔔 New registration in Grade 9</span>
                    <span className="text-slate-500">10:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850/60 pb-0.5">
                    <span>📝 Marcus submitted math CBA scores</span>
                    <span className="text-slate-500">09:30 AM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Glassmorphism Floating Cards */}
            <div className="absolute top-12 right-4 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-750 shadow-2xl p-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all cursor-pointer z-10">
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Reports Approved</p>
                <p className="text-[9px] text-slate-900 dark:text-white">Term 1 Complete ✓</p>
              </div>
            </div>

            <div className="absolute bottom-16 left-6 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-750 shadow-2xl p-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all cursor-pointer z-10">
              <div className="w-5.5 h-5.5 rounded-full bg-brand-sky/20 flex items-center justify-center text-brand-sky">
                <Clock className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="text-left">
                <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">GPS Bus 4</p>
                <p className="text-[9px] text-slate-900 dark:text-white">Arriving in 3 mins</p>
              </div>
            </div>

          </div>

          {/* Animated Feature Highlights List */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="flex gap-3 items-start p-3 bg-white/60 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl hover:border-slate-300 dark:hover:border-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-blue/15 border border-brand-blue/20 flex items-center justify-center text-brand-sky flex-shrink-0">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN (55%): AUTHENTICATION
            ========================================== */}
        <div className="lg:col-span-7 flex justify-center order-1 lg:order-2">
          
          <div className="w-full max-w-xl space-y-6">
            
            {/* Centered Premium Glassmorphic Card */}
            <div className="relative p-6 sm:p-8 rounded-[24px] bg-white/75 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 overflow-hidden transition-colors duration-300">
              
              {/* Top of Card Headers */}
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">Welcome Back</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Sign in to access your secure school dashboard.</p>
              </div>

              {/* Security Success Experience Overlay */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-xl shadow-emerald-500/5 animate-pulse">
                      <ShieldCheck className="w-9 h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Welcome back, {successUser}!</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono tracking-wide">Syncing academic security certificates...</p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-blue to-brand-indigo w-full rounded-full animate-infinite-loading" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest">Redirecting to your dashboard...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit / Response Error Alert component */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-500 dark:text-red-400 flex gap-3 items-start text-left">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
                  <div>
                    <p className="font-semibold">Authorization Failure</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>{t('Email Address', 'Email Address')}</span>
                    {emailError && <span className="text-red-500 dark:text-red-400 font-medium">Invalid</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      placeholder={t('Enter your email address', 'Enter your email address')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                        if (submitError) setSubmitError('');
                      }}
                      className={`w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-950 border-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all ${
                        emailError 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-700 focus:border-brand-sky'
                      }`}
                      required
                      aria-required="true"
                      aria-invalid={emailError ? "true" : "false"}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                  </div>
                  {emailError && (
                    <p id="email-error" className="text-xs text-red-500 dark:text-red-400 font-medium">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Password')}</label>
                    {passwordError && <span className="text-red-500 dark:text-red-400 text-xs font-medium">Required</span>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('Enter your password', 'Enter your password')}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                        if (submitError) setSubmitError('');
                      }}
                      className={`w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-slate-950 border-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all ${
                        passwordError 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-700 focus:border-brand-sky'
                      }`}
                      required
                      aria-required="true"
                      aria-invalid={passwordError ? "true" : "false"}
                      aria-describedby={passwordError ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="password-error" className="text-xs text-red-500 dark:text-red-400 font-medium">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-brand-blue focus:ring-brand-sky w-4.5 h-4.5 cursor-pointer accent-brand-blue"
                    />
                    <span>{t('Remember Me')}</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigateTo('forgot-password')}
                    className="font-semibold text-brand-indigo dark:text-brand-sky hover:underline cursor-pointer"
                  >
                    {t('Forgot Password?')}
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:from-brand-blue/90 hover:to-brand-indigo/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{t('Authenticating Secure Sandbox...')}</span>
                    </div>
                  ) : (
                    <>
                      <span>{t('Sign In')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* DEMO CREDENTIALS SECTION */}
              <div className="pt-5 border-t border-slate-200 dark:border-slate-850/80 space-y-3.5 text-left">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>{t('Demo Accounts Sandbox')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-500">{t('Use the following accounts to explore different dashboards. Click copy to fill and sync instantly.')}</p>
                </div>

                {/* Responsive Credentials Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-100/60 dark:bg-slate-950/60 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                        <th className="px-3.5 py-2">Role</th>
                        <th className="px-3.5 py-2">Email</th>
                        <th className="px-3.5 py-2">Password</th>
                        <th className="px-3.5 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-850/60 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      {demoAccounts.map((account, index) => {
                        const isCopied = copiedIndex === index;
                        return (
                          <tr key={account.key} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-3.5 py-2.5 font-sans font-bold text-slate-900 dark:text-white capitalize">
                              {account.label}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                              {account.email}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-500">
                              {account.pass}
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleSelectAndCopyDemo(account.key, index)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                                  isCopied
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Filled</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Security Indicators */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-850/80 flex flex-wrap justify-between items-center gap-3 text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-400 transition-colors">
                  <Lock className="w-3.5 h-3.5 text-brand-indigo dark:text-brand-sky" />
                  <span>🔒 SSL Secured</span>
                </div>
                <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-indigo dark:text-brand-sky" />
                  <span>🛡 Enterprise Security</span>
                </div>
                <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-400 transition-colors">
                  <Cloud className="w-3.5 h-3.5 text-brand-indigo dark:text-brand-sky" />
                  <span>☁ Cloud Hosted</span>
                </div>
                <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-400 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-brand-indigo dark:text-brand-sky" />
                  <span>⚡ Fast & Reliable</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p className="font-mono">© 2026 EduCore School Management System. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center font-semibold">
          <button onClick={() => setSubmitError('The privacy charter is filed under local educational compliance rules.')} className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</button>
          <button onClick={() => setSubmitError('User registration terms conform strictly to standard charter provisions.')} className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">Terms of Service</button>
          <button onClick={() => navigateTo('contact')} className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">Help Center</button>
          <button onClick={() => navigateTo('contact')} className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">Contact Support</button>
        </div>
      </footer>

    </div>
  );
};
