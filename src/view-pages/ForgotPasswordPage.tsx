/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Mail, AlertCircle, ArrowLeft, 
  ShieldCheck, Zap, Sun, Moon, KeyRound, RefreshCw, ChevronRight
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

type ResetStep = 'EMAIL' | 'SUCCESS';

export const ForgotPasswordPage: React.FC = () => {
  const { navigateTo, theme, toggleTheme } = useNavigation();
  
  // State variables
  const [step, setStep] = useState<ResetStep>('EMAIL');
  const [email, setEmail] = useState('');

  // Simulation & Flow variables
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Errors & Feedback
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Timer for redirect - DISABLED for now to allow email links to work
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (step === 'SUCCESS' && redirectCountdown > 0) {
  //     interval = setInterval(() => {
  //       if (!isMounted.current) {
  //         clearInterval(interval);
  //         return;
  //       }
  //       
  //       setRedirectCountdown((prev) => {
  //         const newValue = prev - 1;
  //         if (newValue <= 0 && window.location.hash === '#/forgot-password' && isMounted.current) {
  //           clearInterval(interval);
  //           setTimeout(() => navigateTo('login'), 0);
  //         }
  //         return newValue;
  //       });
  //     }, 1000);
  //   }
  //   return () => {
  //     if (interval) clearInterval(interval);
  //     isMounted.current = false;
  //   };
  // }, [step, redirectCountdown, navigateTo]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid school or administrator email address.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setStep('SUCCESS');
        setRedirectCountdown(5);
      } else {
        setEmailError(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setEmailError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* 1. Gradient Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/10 dark:bg-brand-blue/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-indigo/10 dark:bg-brand-indigo/15 blur-[120px] animate-pulse" />
        
        {/* Particle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Back to Login / Theme Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <button
          onClick={() => navigateTo('login')}
          className="group flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Return to login"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </button>
        <div className="flex items-center gap-3">
          {/* Functional Theme Toggle */}
          <button
            id="theme-toggle-forgot-btn"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500 tracking-wider">SECURE RECOVERY LAYER</span>
        </div>
      </header>

      {/* Main Single Card Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Main Visual Logo Accent */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-indigo dark:text-brand-sky text-xs font-bold font-mono tracking-wide">
              <KeyRound className="w-3.5 h-3.5 animate-pulse" />
              <span>EduCore Portal Recovery System</span>
            </div>
          </div>

          <div className="relative p-6 sm:p-8 rounded-[24px] bg-white/75 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 overflow-hidden transition-colors duration-300">
            
            {/* Steps Rendering */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: EMAIL REQUEST */}
              {step === 'EMAIL' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="text-center sm:text-left space-y-1">
                    <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">Forgot Password?</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enter your verified administrative or academic email address, and we will send you a password reset link.
                    </p>
                  </div>

                  {emailError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-600 dark:text-red-400 flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="recovery-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Recovery Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="recovery-email"
                          type="email"
                          placeholder="your-account@demo.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-950 border-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-sky transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-brand-indigo/15 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Sending Reset Link...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Password Reset Link</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo Account Helper */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-850/80 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Demo Account Fast-Track</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">
                      Test with these demo email addresses:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setEmail('director@demo.com'); setEmailError(''); }}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Director
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('teacher@demo.com'); setEmailError(''); }}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Teacher
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('student@demo.com'); setEmailError(''); }}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('parent@demo.com'); setEmailError(''); }}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Parent
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SUCCESS */}
              {step === 'SUCCESS' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-xl shadow-emerald-500/5">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">Email Sent Successfully!</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {successMessage}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-850/80">
                    <button
                      onClick={() => navigateTo('login')}
                      className="text-sm font-semibold text-brand-indigo dark:text-brand-sky hover:underline cursor-pointer"
                    >
                      Go to Login Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          © 2026 EduCore School Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
