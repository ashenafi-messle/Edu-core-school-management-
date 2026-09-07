/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, GraduationCap, Sun, Moon, ArrowRight, User, LogOut, Languages } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const { currentPage, currentUser, theme, navigateTo, toggleTheme, logout } = useNavigation();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 20);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const navLinks = [
    { label: 'Home', target: 'home', hash: '' },
    { label: 'Features', target: 'home', hash: '#features' },
    { label: 'Register', target: 'registration', hash: '' },
    { label: 'About Us', target: 'about', hash: '' },
    { label: 'Contact', target: 'contact', hash: '' },
  ];

  const handleNavClick = (targetPage: string, hash: string) => {
    setIsMobileMenuOpen(false);
    if (targetPage === 'home') {
      navigateTo('home');
      if (hash && typeof window !== 'undefined' && typeof document !== 'undefined') {
        setTimeout(() => {
          const element = document.querySelector(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigateTo(targetPage as any);
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            id="nav-logo"
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => handleNavClick('home', '')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-indigo flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                EduCore
              </span>
              <span className="hidden sm:block text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 uppercase font-medium -mt-1">
                {t('School Management System', 'School Management System')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div id="desktop-nav-links" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                currentPage === link.target &&
                (!link.hash || (typeof window !== 'undefined' && window.location.hash === link.hash));
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.target, link.hash)}
                  className={`relative font-sans text-sm font-medium transition-colors hover:text-brand-blue dark:hover:text-brand-sky ${
                    isActive
                      ? 'text-brand-blue dark:text-brand-sky'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t(link.label)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-brand-blue dark:bg-brand-sky rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Items */}
          <div id="nav-actions" className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              id="language-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={language === 'en' ? 'Switch to Amharic' : 'ወደ እንግሊዝኛ ይቀይሩ'}
            >
              <Languages className="w-4 h-4 text-brand-blue" />
              <span className="font-mono">{language === 'en' ? 'EN' : 'አማ'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  id="dashboard-shortcut-btn"
                  onClick={() => navigateTo('dashboard', currentUser.role)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                >
                  <User className="w-4 h-4" />
                  {t('Dashboard')}
                </button>
                <button
                  id="logout-btn"
                  onClick={logout}
                  className="p-2.5 rounded-lg border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  id="register-nav-btn"
                  onClick={() => navigateTo('registration')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-blue/30 text-brand-blue dark:text-brand-sky hover:bg-brand-blue/10 transition-all font-medium text-sm cursor-pointer"
                >
                  {t('Register')}
                </button>
                <button
                  id="signin-nav-btn"
                  onClick={() => navigateTo('login')}
                  className="group flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:from-brand-blue/90 hover:to-brand-indigo/90 text-white font-medium text-sm shadow-md shadow-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/30 transition-all cursor-pointer"
                >
                  {t('Sign In')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="language-toggle-mobile"
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5 text-brand-blue" />
              <span>{language === 'en' ? 'EN' : 'አማ'}</span>
            </button>

            <button
              id="theme-toggle-mobile"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              id="mobile-menu-trigger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.target, link.hash)}
                  className="block w-full text-left py-2 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-base font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                {currentUser ? (
                  <>
                    <button
                      id="dashboard-shortcut-mobile"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('dashboard', currentUser.role);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm"
                    >
                      <User className="w-4 h-4" />
                      {t('Dashboard')} ({currentUser.name})
                    </button>
                    <button
                      id="logout-mobile"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('Logout')}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      id="register-mobile-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('registration');
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-brand-blue/30 text-brand-blue dark:text-brand-sky font-medium text-sm"
                    >
                      {t('Register Online')}
                    </button>
                    <button
                      id="signin-mobile-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('login');
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo text-white font-medium text-sm shadow-md"
                    >
                      {t('Sign In')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
