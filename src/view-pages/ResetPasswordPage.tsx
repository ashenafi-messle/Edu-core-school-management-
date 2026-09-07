/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, 
  ShieldCheck, Check, Sun, Moon, RefreshCw
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const ResetPasswordPage: React.FC = () => {
  const { navigateTo, theme, toggleTheme } = useNavigation();
  
  // Get token from URL hash query parameters
  const getTokenFromQuery = () => {
    if (typeof window !== 'undefined') {
      // Parse token from hash query parameters (e.g., #/reset-password?token=abc123)
      const hash = window.location.hash;
      const queryIndex = hash.indexOf('?');
      if (queryIndex !== -1) {
        const queryString = hash.substring(queryIndex + 1);
        const params = new URLSearchParams(queryString);
        const token = params.get('token');
        console.log('ResetPasswordPage - Hash:', hash); // Debug log
        console.log('ResetPasswordPage - Query string:', queryString); // Debug log
        console.log('ResetPasswordPage - Extracted token:', token ? 'found' : 'not found'); // Debug log
        return token;
      }
      console.log('ResetPasswordPage - No query parameters in hash'); // Debug log
    }
    return null;
  };
  
  const token = getTokenFromQuery();
  console.log('ResetPasswordPage - Final token value:', token ? 'has token' : 'no token'); // Debug log
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Timer for redirect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (success && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(interval);
            setTimeout(() => navigateTo('login'), 0);
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [success, redirectCountdown, navigateTo]);

  // Evaluate password strength
  const getPasswordStrength = () => {
    let score = 0;
    
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    return { score };
  };

  const strength = getPasswordStrength();

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password confirmation mismatch. Check matching credentials.');
      return;
    }

    const strength = getPasswordStrength();
    if (strength.score < 3) {
      setPasswordError('Please choose a more secure password matching complexity guidelines.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setSuccess(true);
      } else {
        setPasswordError(data.error || 'Failed to reset password. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full relative bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
          <p className="text-slate-600 dark:text-slate-400">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigateTo('forgot-password')}
            className="px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-blue/90 transition-colors cursor-pointer"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/10 dark:bg-brand-blue/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-indigo/10 dark:bg-brand-indigo/15 blur-[120px] animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <button
          onClick={() => navigateTo('login')}
          className="group flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-lg space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-indigo dark:text-brand-sky text-xs font-bold font-mono tracking-wide">
              <Lock className="w-3.5 h-3.5" />
              <span>Set New Password</span>
            </div>
          </div>

          <div className="relative p-6 sm:p-8 rounded-[24px] bg-white/75 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">Reset Your Password</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Create a strong, secure password for your EduCore account.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-600 dark:text-red-400 flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="•••••••••"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-slate-950 border-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-sky transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="•••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-slate-950 border-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-sky transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Security Strength:</span>
                        <span className={`font-bold uppercase ${
                          strength.score === 4 ? 'text-emerald-500' :
                          strength.score === 3 ? 'text-blue-500' :
                          strength.score === 2 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {strength.score === 4 ? 'Enterprise Strong' :
                           strength.score === 3 ? 'Medium Strength' :
                           strength.score === 2 ? 'Weak Password' : 'Critical Hazard'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-1 h-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level} 
                            className={`rounded-full transition-all duration-300 ${
                              strength.score >= level
                                ? strength.score === 4 ? 'bg-emerald-500' :
                                  strength.score === 3 ? 'bg-blue-500' :
                                  strength.score === 2 ? 'bg-amber-500' : 'bg-red-500'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>

                      <ul className="text-xs text-slate-500 space-y-1">
                        <li className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? 'text-emerald-500' : 'text-slate-350 dark:text-slate-700'}`} />
                          <span>Minimum 8 characters</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-500' : 'text-slate-350 dark:text-slate-700'}`} />
                          <span>At least one uppercase letter (A-Z)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-500' : 'text-slate-350 dark:text-slate-700'}`} />
                          <span>At least one numeric digit (0-9)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-500' : 'text-slate-350 dark:text-slate-700'}`} />
                          <span>At least one special character (!@#$%)</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || strength.score < 3}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-md"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
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
                    <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">Password Reset Complete!</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Your password has been successfully updated. You can now log in with your new credentials.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-850/80">
                    <p className="text-xs text-slate-500 mb-2">
                      Redirecting to login in <span className="font-bold text-slate-700 dark:text-slate-300">{redirectCountdown}</span> seconds...
                    </p>
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
    </div>
  );
};
