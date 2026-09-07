/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Mail, HelpCircle, Search, LogOut, Moon, Sun, 
  Settings, ChevronDown, User, ShieldAlert, Sparkles, BookOpen,
  Info, CheckCircle, ExternalLink, Menu, Languages, Loader2, X,
  Phone, Calendar, FileText
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../../lib/api';
import { UserDetailPage } from '../UserDetailPage';

interface HeaderProps {
  activeItemLabel: string;
  activeItemParent?: string;
  onSearchChange?: (val: string) => void;
  setMobileOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeItemLabel, activeItemParent, onSearchChange, setMobileOpen }) => {
  const { currentUser, logout, theme, toggleTheme, setProfileSettingsView, navigateTo, updateUserProfile } = useNavigation();
  const { language, setLanguage, t } = useLanguage();
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(currentUser?.avatar || '');

  const getAvatarUrl = (url: string, version?: string) => {
    if (!url || url.startsWith('data:') || !version) return url;
    return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
  };

  // Refs for closing on outside click
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Search functionality
  useEffect(() => {
    const handleSearch = async () => {
      if (searchVal.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const result = await api.searchUsers(searchVal);
          setSearchResults(result.users || []);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchVal]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setCurrentAvatar(currentUser?.avatar || '');
  }, [currentUser?.avatar]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    const schoolId = currentUser.schoolId || api.getSchoolId();
    if (!schoolId) return;
    fetch(`/api/teachers/${currentUser.id}`, { headers: { 'X-School-ID': schoolId } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((teacher) => {
        const storedPhoto = teacher?.profile_picture_url || teacher?.photo;
        if (storedPhoto) {
          const avatar = getAvatarUrl(storedPhoto, teacher.updated_at);
          setCurrentAvatar(avatar);
          updateUserProfile({ avatar, name: teacher.full_name, email: teacher.email });
        }
      })
      .catch(() => undefined);
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) return null;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  // Mock Notification lists
  const notifications = [
    { id: 1, title: 'Admissions Completed', desc: 'Sienna Ross has completed final enrollment paperwork.', time: '10m ago', unread: true },
    { id: 2, title: 'Institutional Audit Logged', desc: 'Secure database backup compiled successfully.', time: '1h ago', unread: true },
    { id: 3, title: 'Faculty Assignment', desc: 'Principal assigned chemistry syllabus to Grade 10-A.', time: '5h ago', unread: false }
  ];

  // Mock messages lists
  const messages = [
    { id: 1, sender: 'Director Vance', text: 'Please review the standard budget sheet for Q3.', time: '20m ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces' },
    { id: 2, sender: 'Teacher Mary', text: 'Gradebook assessments are ready for academic sign-off.', time: '2h ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-6 flex items-center justify-between transition-colors duration-300">
      
      {/* 1. Left Section: Hamburger, Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col text-left justify-center select-none">
          <Breadcrumb 
            role={currentUser.role} 
            activeItem={t(activeItemLabel)} 
            parentItem={activeItemParent ? t(activeItemParent) : undefined} 
          />
          <h1 className="hidden sm:block text-sm font-bold text-slate-800 dark:text-white mt-0.5 tracking-tight capitalize">
            {t(activeItemLabel)} {t('Workspace')}
          </h1>
        </div>
      </div>

      {/* 2. Center Section: Unified Search Bar */}
      <div className="hidden lg:flex items-center w-96 relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t('Search users by name or email...', 'Search users by name or email...')}
            value={searchVal}
            onChange={handleSearch}
            className="w-full h-11 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-sm hover:shadow-md"
          />
          {searchLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-blue animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 w-full max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {searchResults.length} {searchResults.length === 1 ? 'User' : 'Users'} Found
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDetail(true);
                      setShowSearchResults(false);
                      setSearchVal('');
                    }}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user.full_name || 'Unknown'}
                        </p>
                        <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-brand-sky">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Right Action Tools */}
      <div className="flex items-center gap-3">
        
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="h-9.5 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title={language === 'en' ? 'Switch to Amharic' : 'ወደ እንግሊዝኛ ይቀይሩ'}
        >
          <Languages className="w-4 h-4 text-brand-blue" />
          <span className="font-mono">{language === 'en' ? 'EN' : 'አማ'}</span>
        </button>

        {/* Help Center Trigger */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer relative"
          aria-label="Help Documentation"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Messages Dropdown */}
        <div className="relative" ref={msgRef}>
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer relative"
            aria-label="Direct Messages"
          >
            <Mail className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-blue rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          <AnimatePresence>
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
              >
                <div className="px-4.5 py-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">{t('Administrative Inbox')}</h4>
                  <span className="text-[9px] bg-brand-blue/10 text-brand-indigo dark:text-brand-sky font-bold px-2 py-0.5 rounded-full">2 {t('New')}</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {messages.map((m) => (
                    <div key={m.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all cursor-pointer flex gap-3">
                      <img src={m.avatar || undefined} alt={m.sender} className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.sender}</p>
                          <span className="text-[9px] text-slate-400 font-mono">{m.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 text-center">
                  <button className="text-[10px] font-bold text-brand-indigo dark:text-brand-sky hover:underline cursor-pointer">
                    {t('Open Full Communicator')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
              >
                <div className="px-4.5 py-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">{t('System Notifications')}</h4>
                  <button className="text-[10px] text-slate-400 hover:text-slate-950 dark:hover:text-white font-semibold">{t('Mark read')}</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all cursor-pointer flex gap-3 ${n.unread ? 'bg-slate-50/50 dark:bg-slate-950/20' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-brand-blue' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 text-center">
                  <button className="text-[10px] font-bold text-brand-indigo dark:text-brand-sky hover:underline cursor-pointer">
                    {t('View All Notifications')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        {/* Vertical divider */}
        <span className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-all cursor-pointer"
          >
            <img 
              src={currentAvatar || currentUser.avatar || undefined} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-brand-blue/10" 
            />
            <div className="hidden md:block text-left select-none">
              <p className="text-[10.5px] font-bold text-slate-800 dark:text-slate-250 leading-tight">
                {currentUser.name.split(' ')[0]}
              </p>
              <span className="text-[8.5px] font-bold text-brand-indigo dark:text-brand-sky uppercase font-mono tracking-wider -mt-0.5 block leading-tight">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
              >
                {/* User Header card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-start gap-3">
                  <img src={currentAvatar || currentUser.avatar || undefined} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover ring-4 ring-brand-blue/10" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-snug">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-snug">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[8px] font-extrabold uppercase font-mono tracking-widest text-white bg-brand-blue dark:bg-brand-indigo px-1.5 py-0.5 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button 
                    onClick={() => {
                      setShowProfile(false);
                      setProfileSettingsView('profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-650 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('My Profile details')}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setShowProfile(false);
                      setProfileSettingsView('preferences');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-650 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{t('Secure preferences')}</span>
                  </button>
                </div>

                {/* Log out segment */}
                <div className="p-1.5 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('Sign Out of Portal')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Unified System Help desk modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-indigo dark:text-brand-sky">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">EduCore Cloud Help Center</h3>
                  <p className="text-[11px] font-mono text-slate-500 uppercase">Interactive operator handbook</p>
                </div>
              </div>

              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                <div className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Unified Role Authorization</span>
                  </div>
                  This application simulates a real enterprise Next-generation School Management Suite. Each credential provides access to isolated workspaces matching compliance guidelines.
                </div>

                <div className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <Info className="w-4 h-4 text-brand-blue" />
                    <span>Demo Accounts Bypass</span>
                  </div>
                  You can seamlessly logout and sign back in using our login panel demo-helpers to preview all 5 operational workspaces: Director, Academic Staff, System Administrator, Student Hub, and Guardian panel.
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-150 dark:border-slate-850">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <span>API Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer shadow"
                >
                  Close Handbook
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Detail Page Modal */}
      <AnimatePresence>
        {showUserDetail && selectedUser && (
          <UserDetailPage
            userId={selectedUser.id}
            onClose={() => {
              setShowUserDetail(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

    </header>
  );
};
