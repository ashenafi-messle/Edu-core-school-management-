/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Key, Bell, Laptop, Globe, Camera, Check, 
  ShieldCheck, ShieldAlert, Plus, Trash2, ArrowRight, RefreshCw, 
  Lock, Eye, EyeOff, Save, Copy, Download, Smartphone, LayoutGrid, Clock,
  Loader2, Upload, X
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  status: string;
  isCurrent: boolean;
}

const PRESET_AVATARS = [
  { name: 'Dr. Jenkins (Director)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
  { name: 'Prof. Vance (Teacher)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Alex (Student)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
  { name: 'Eleanor (Parent)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { name: 'Robert (Admin)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sienna (Staff)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
];

export const ProfilePreferencesWorkspace: React.FC = () => {
  const { currentUser, updateUserProfile, profileSettingsView, setProfileSettingsView } = useNavigation();
  const { setLanguage, t } = useLanguage();

  // Active sub-tab state (synced with navigation header selection but also switchable locally)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  useEffect(() => {
    if (profileSettingsView) {
      setActiveTab(profileSettingsView);
    }
  }, [profileSettingsView]);

  // Profile fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Success notifications
  const [profileSavedToast, setProfileSavedToast] = useState(false);
  const [preferencesSavedToast, setPreferencesSavedToast] = useState(false);

  // Load fields when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '+1 (555) 234-5678');
      setSchoolName(currentUser.schoolName || 'Oakridge International Academy');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  // Security elements state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [twoFactorBackupCodes] = useState([
    'EDC-829A-10F3',
    'EDC-4421-B920',
    'EDC-9014-F28B',
    'EDC-7712-C85A'
  ]);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Very Weak', color: 'bg-red-500' });
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Preference switches
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [portalLanguage, setPortalLanguage] = useState('en');
  const [portalTimezone, setPortalTimezone] = useState('America/New_York');

  // Load preferences from currentUser
  useEffect(() => {
    if (currentUser) {
      setTwoFactorEnabled(!!currentUser.twoFactorEnabled);
      setEmailAlerts(currentUser.emailAlerts !== false);
      setSmsAlerts(currentUser.smsAlerts !== false);
      setMarketingEmails(!!currentUser.marketingEmails);
      const userLang = currentUser.language || 'en';
      setPortalLanguage(userLang);
      if (userLang === 'en' || userLang === 'am') {
        setLanguage(userLang as any);
      }
      setPortalTimezone(currentUser.timezone || 'America/New_York');
    }
  }, [currentUser, setLanguage]);

  // Simulated connected sessions state
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    { id: 'sess-1', device: 'Google Chrome / macOS Sequoia', location: 'San Francisco, CA, USA', ip: '192.168.1.45', status: 'Active Session', isCurrent: true },
    { id: 'sess-2', device: 'Safari Browser / Apple iPhone 15 Pro', location: 'New York, NY, USA', ip: '172.56.21.109', status: 'Active 2h ago', isCurrent: false },
    { id: 'sess-3', device: 'Mozilla Firefox / Windows 11 Desktop', location: 'London, Greater London, UK', ip: '82.165.4.12', status: 'Active 2d ago', isCurrent: false }
  ]);

  // Password strength checker logic
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-800' });
      return;
    }

    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    let label = 'Very Weak';
    let color = 'bg-red-500';

    if (score === 1) {
      label = 'Weak';
      color = 'bg-red-400';
    } else if (score === 2) {
      label = 'Moderate';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-indigo-500';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({ score, label, color });
  }, [newPassword]);

  if (!currentUser) return null;

  // Actions
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get current user ID from context or local storage
      const users = await api.getUsers();
      const currentUser = users.find((u: any) => u.email === email);
      
      if (currentUser) {
        await api.updateUser(currentUser.id, {
          full_name: name,
          email,
          phone,
          profile_picture_url: avatar || customAvatarUrl
        });
        
        // Re-fetch user data to get the updated profile picture from database
        const updatedUsers = await api.getUsers();
        const updatedUser = updatedUsers.find((u: any) => u.email === email);
        
        if (updatedUser) {
          updateUserProfile({
            name,
            email,
            phone,
            schoolName,
            avatar: updatedUser.profile_picture_url || avatar || customAvatarUrl
          });
        }
      }
      
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const users = await api.getUsers();
      const currentUser = users.find((u: any) => u.email === email);
      
      if (currentUser) {
        await api.updateUser(currentUser.id, {
          // Store preferences in metadata or additional columns
          language: portalLanguage,
          timezone: portalTimezone
        });
      }
      
      updateUserProfile({
        twoFactorEnabled,
        emailAlerts,
        smsAlerts,
        marketingEmails,
        language: portalLanguage,
        timezone: portalTimezone
      });
      setPreferencesSavedToast(true);
      setTimeout(() => setPreferencesSavedToast(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    // Success response simulation
    setPasswordSuccessMsg('Your security credentials have been successfully updated in our system database.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSetup2FA = () => {
    setTwoFactorStep(1);
    setShow2FASetup(true);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      alert('Please enter a valid 6-digit numeric authentication code.');
      return;
    }
    setTwoFactorEnabled(true);
    updateUserProfile({ twoFactorEnabled: true });
    setTwoFactorStep(3); // Go to complete/success step
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to revoke Two-Factor Authentication? This decreases your account security.')) {
      setTwoFactorEnabled(false);
      updateUserProfile({ twoFactorEnabled: false });
      setShow2FASetup(false);
    }
  };

  const handleRevokeSession = (id: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
  };

  const copyBackupCodes = () => {
    const text = twoFactorBackupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file to backend
      try {
        const users = await api.getUsers();
        const currentUser = users.find((u: any) => u.email === email);
        
        if (currentUser) {
          const reader2 = new FileReader();
          reader2.onloadend = async () => {
            const base64String = reader2.result as string;
            await api.updateUser(currentUser.id, {
              profile_picture_url: base64String
            });
          };
          reader2.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
      }
    }
  };

  return (
    <div id="profile-preferences-wrapper" className="space-y-6">
      
      {/* 1. Page Header with Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('Profile & Preferences')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('Configure your personal information, security guidelines, and communications preferences.')}</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-150/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab('profile');
              setProfileSettingsView('profile');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('Profile Details')}</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('preferences');
              setProfileSettingsView('preferences');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('Secure Preferences')}</span>
          </button>
        </div>
      </div>

      {/* 2. Feedback Toasts (AnimatePresence) */}
      <AnimatePresence>
        {profileSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Your personal profile information has been securely updated and synced in cache.</span>
          </motion.div>
        )}

        {preferencesSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 bg-brand-blue/10 border border-brand-blue/30 text-brand-indigo dark:text-brand-sky rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md"
          >
            <Check className="w-5 h-5" />
            <span>Your dashboard preferences and portal layout configurations were saved successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <>
            {/* Left Box: Avatar & Roles Info */}
            <div className="space-y-6 lg:col-span-1">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl text-center space-y-4 shadow-sm">
                <div className="relative inline-block mx-auto group">
                  <img 
                    src={avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'} 
                    alt={name} 
                    className="w-28 h-28 rounded-2xl object-cover ring-4 ring-brand-blue/10 mx-auto transition-transform group-hover:scale-102"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 shadow-lg cursor-pointer transition-all"
                    title="Change Avatar Profile Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{name || 'Your Name'}</h3>
                  <p className="text-sm font-mono text-slate-450 dark:text-slate-500 truncate">{email || 'your.email@demo.com'}</p>
                </div>

                {/* Authorized Role Tag */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-widest bg-brand-blue/10 dark:bg-brand-indigo/20 text-brand-indigo dark:text-brand-sky border border-brand-blue/20">
                    <Shield className="w-3.5 h-3.5 text-brand-indigo dark:text-brand-sky animate-pulse" />
                    <span>Authorized {currentUser.role}</span>
                  </span>
                </div>

                <div className="text-sm text-slate-450 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between">
                    <span>Assigned School:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{schoolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Line:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{phone}</span>
                  </div>
                </div>
              </div>

              {/* Default Avatar Picker Popup / Modal Segment */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white font-mono">Select Avatar Preset</h4>
                      <button 
                        onClick={() => setShowAvatarPicker(false)}
                        className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                      >
                        Done
                      </button>
                    </div>

                    {/* Pre-defined Avatars List */}
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatar(p.url);
                            setCustomAvatarUrl('');
                          }}
                          className={`relative p-1 rounded-xl border transition-all cursor-pointer ${
                            avatar === p.url 
                              ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-slate-50 dark:bg-slate-850' 
                              : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-12 h-12 rounded-lg object-cover mx-auto" />
                          <p className="text-[9px] font-bold text-slate-500 mt-1 truncate max-w-[55px] mx-auto text-center">{p.name.split(' ')[0]}</p>
                          {avatar === p.url && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-blue rounded-full flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 font-bold" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Custom URL Input Field */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold uppercase text-slate-450 font-mono tracking-wider">Custom Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={customAvatarUrl}
                        onChange={(e) => {
                          setCustomAvatarUrl(e.target.value);
                          setAvatar('');
                        }}
                        className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                      {customAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatar(customAvatarUrl)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md hover:opacity-90"
                        >
                          Apply URL
                        </button>
                      )}
                    </div>

                    {/* File Upload Option */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold uppercase text-slate-450 font-mono tracking-wider">Upload from Device</label>
                      <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">Click to upload image (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Box: Profile Edit Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveProfile} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl space-y-5 shadow-sm">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Personal Information Details</h3>
                  <p className="text-sm text-slate-450 dark:text-slate-500">Provide official details below to register correctly inside institutional indexes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span>Full Registered Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-blue/30 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                  </div>

                  {/* Primary Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      <span>Email address (Authorized login)</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-blue/30 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                  </div>

                  {/* Phone Line */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3" />
                      <span>Contact Mobile Number</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-blue/30 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                  </div>

                  {/* Institute name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                      <LayoutGrid className="w-3 h-3" />
                      <span>Assigned Academic Institution</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-blue/30 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Updates are recorded permanently inside secure local indices.</p>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: SECURE PREFERENCES */}
        {activeTab === 'preferences' && (
          <>
            {/* Left Box: 2FA & active sessions list */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* 2-Factor Authentication Segment */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    twoFactorEnabled 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white font-mono">Two-Factor Auth</h3>
                    <p className={`text-xs font-bold ${twoFactorEnabled ? 'text-emerald-500' : 'text-red-500'}`}>
                      {twoFactorEnabled ? 'Status: SECURE (ACTIVE)' : 'Status: INACTIVE (RISK)'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal">
                  Adds a rigorous second layer of security validation checking mobile OTP codes before authorizing system actions.
                </p>

                {twoFactorEnabled ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase font-mono tracking-wider font-bold">
                        <span>Active backup keys:</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">Backup codes safely stored.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSetup2FA}
                        className="flex-1 px-3 py-2 text-xs font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-white transition-all text-center cursor-pointer"
                      >
                        Re-generate codes
                      </button>
                      <button
                        type="button"
                        onClick={handleDisable2FA}
                        className="px-3 py-2 text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 rounded-lg transition-all text-center cursor-pointer"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSetup2FA}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow cursor-pointer hover:scale-101"
                  >
                    <Key className="w-4 h-4" />
                    <span>Setup MFA Verification</span>
                  </button>
                )}
              </div>

              {/* Secure Connected Sessions list */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-slate-450" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white font-mono">Active Sessions</h3>
                  </div>
                  <span className="text-[10px] bg-brand-blue/10 text-brand-indigo dark:text-brand-sky px-2 py-0.5 rounded-full font-bold">
                    {activeSessions.length} Devices
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  <AnimatePresence initial={false}>
                    {activeSessions.map((s) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-250 truncate">{s.device}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono truncate mt-0.5">{s.location} • {s.ip}</p>
                          <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest font-mono mt-1 ${
                            s.isCurrent ? 'text-brand-indigo dark:text-brand-sky' : 'text-slate-400'
                          }`}>
                            {s.isCurrent ? '● Current Device' : s.status}
                          </span>
                        </div>
                        {!s.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(s.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Revoke Session Credentials"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Right Box: Password form & General configuration preferences */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Change credentials */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Security Password Manager</h3>
                      <p className="text-sm text-slate-450 dark:text-slate-500">Regularly rotate passwords to protect credentials from systemic brute forces.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-xs text-slate-500 hover:text-slate-850 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {showPasswords ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide passwords
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Reveal passwords
                        </>
                      )}
                    </button>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs rounded-xl font-medium">
                      {passwordSuccessMsg}
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-xs rounded-xl font-medium">
                      {passwordErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest">
                        Current Security Key
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-9.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest">
                        New Security Key
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-9.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest">
                        Verify New Key
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-9.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Password Strength bar */}
                  {newPassword && (
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                      <div className="flex justify-between items-center text-[10px] font-extrabold uppercase font-mono text-slate-500">
                        <span>Strength rating: <strong className="text-slate-700 dark:text-slate-350">{passwordStrength.label}</strong></span>
                        <span>{Math.min(100, passwordStrength.score * 25)}% Compliance</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                          style={{ width: `${Math.min(100, Math.max(12, passwordStrength.score * 25))}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-slate-450 leading-normal">
                        Tip: Combine uppercase letters, digits, and unique dynamic characters (e.g., #, !, @) to reach the Strong tier.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow cursor-pointer hover:scale-101"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Apply New Security Credentials</span>
                  </button>
                </form>
              </div>

              {/* Communication Preferences & Regional configs */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl space-y-5 shadow-sm">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Alert Routing & Regional System Configs</h3>
                  <p className="text-sm text-slate-450 dark:text-slate-500">Enable notification pipelines and timezone synchronizations correctly.</p>
                </div>

                <div className="space-y-4">
                  {/* Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 font-mono tracking-widest">Notification Channels</h4>
                    
                    {/* Toggle 1: Email Alerts */}
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5 pr-4 text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Portal Email Updates</p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-450">Receive report card compilations, fee receipt invoices, and class syllabus updates.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`w-10 h-6 flex-shrink-0 rounded-full transition-all duration-250 cursor-pointer ${
                          emailAlerts ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-800'
                        } relative p-1`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block shadow transition-all duration-250 transform ${
                          emailAlerts ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 2: SMS Alerts */}
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5 pr-4 text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Immediate SMS Notification</p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-450">Alerts for emergency closures, attendance changes, and real-time security alerts.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSmsAlerts(!smsAlerts)}
                        className={`w-10 h-6 flex-shrink-0 rounded-full transition-all duration-250 cursor-pointer ${
                          smsAlerts ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-800'
                        } relative p-1`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block shadow transition-all duration-250 transform ${
                          smsAlerts ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 3: Marketing / System announcements */}
                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-0.5 pr-4 text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly System Broadcast digests</p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-450">Receive useful updates about platform improvements, feature catalogs, and webinars.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        className={`w-10 h-6 flex-shrink-0 rounded-full transition-all duration-250 cursor-pointer ${
                          marketingEmails ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-slate-800'
                        } relative p-1`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white block shadow transition-all duration-250 transform ${
                          marketingEmails ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                        <Globe className="w-3 h-3" />
                        <span>{t('System Language Preference')}</span>
                      </label>
                      <select
                        value={portalLanguage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPortalLanguage(val);
                          if (val === 'en' || val === 'am') {
                            setLanguage(val as any);
                          }
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1"
                      >
                        <option value="en">English (US/UK) - Default</option>
                        <option value="am">አማርኛ (Amharic)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Security Timezone Lock</span>
                      </label>
                      <select
                        value={portalTimezone}
                        onChange={(e) => setPortalTimezone(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1"
                      >
                        <option value="America/New_York">Eastern Time (EST - NY)</option>
                        <option value="America/Chicago">Central Time (CST - Chicago)</option>
                        <option value="America/Denver">Mountain Time (MST - Denver)</option>
                        <option value="America/Los_Angeles">Pacific Time (PST - LA)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT - London)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit panel */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Settings are auto-cached and immediately bound to active token sessions.</p>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Secure Preferences</span>
                  </button>
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* 4. Multi-Step Two-Factor Authentication Setup Modal */}
      <AnimatePresence>
        {show2FASetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShow2FASetup(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-5"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-slate-150 dark:border-slate-850">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-indigo dark:text-brand-sky">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Setup Multi-Factor Security</h3>
                  <p className="text-xs font-mono text-slate-500 uppercase">Step {twoFactorStep} of 3 • System Integration</p>
                </div>
              </div>

              {/* STEP 1: Scan QR Code */}
              {twoFactorStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Open your standard Google Authenticator or Duo Security application on your mobile device, tap the "+" key, and scan the unique QR code credentials below:
                  </p>
                  
                  {/* Simulated QR Code via CSS vectors */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                      <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                        {/* Perfect mock QR layout */}
                        <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                        <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                        <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                        <path d="M40,10 h20 v10 h-20 z M40,30 h10 v10 h-10 z M60,40 h10 v15 h-10 z" />
                        <path d="M35,45 h15 v10 h-15 z M55,75 h20 v15 h-20 z" />
                        <path d="M45,60 h10 v10 h-10 z M85,45 h10 v20 h-10 z" />
                        <rect x="42" y="42" width="16" height="16" className="fill-brand-blue" />
                      </svg>
                      <div className="absolute inset-0 bg-white/95 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                        <p className="text-[10px] font-bold text-slate-700">MFA Secret Seed</p>
                        <p className="text-[9px] font-mono bg-slate-50 p-1 rounded select-all font-semibold break-all text-slate-550 mt-1">JBSW Y3DP EHPK 3PXP</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/5 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>If unable to scan QR code, toggle the QR Box to reveal the secure alphanumeric secret token, then manually write it into your Authenticator app.</span>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel Setup
                    </button>
                    <button
                      onClick={() => setTwoFactorStep(2)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1"
                    >
                      <span>I have scanned QR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Backup Codes & Verification */}
              {twoFactorStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Store these emergency physical recovery keys in a highly secure place. They can override authentication if your mobile device goes offline:
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-center">
                    {twoFactorBackupCodes.map((c, idx) => (
                      <span key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-xs font-bold font-mono tracking-wider text-slate-700 dark:text-slate-350 select-all">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={copyBackupCodes}
                      className="flex items-center gap-1 font-bold text-brand-indigo dark:text-brand-sky hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedBackupCodes ? 'Copied to clipboard!' : 'Copy Backup Codes'}</span>
                    </button>
                    <a
                      href="data:text/plain;charset=utf-8,EDUCORE BACKUP CODES%0A%0AEDC-829A-10F3%0AEDC-4421-B920%0AEDC-9014-F28B%0AEDC-7712-C85A"
                      download="educore-backup-recovery-keys.txt"
                      className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-850 dark:hover:text-white hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download TXT file</span>
                    </a>
                  </div>

                  {/* Code Entry Input */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1.5">
                    <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-500 font-mono tracking-widest block">
                      Enter 6-Digit OTP Verification code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g., 123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs font-black font-mono tracking-widest text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue text-center"
                      />
                      <button
                        type="button"
                        onClick={handleVerify2FA}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow cursor-pointer"
                      >
                        Verify & Activate
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setTwoFactorStep(1)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Back to QR scan
                    </button>
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Close Setup
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Complete Success */}
              {twoFactorStep === 3 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                    <Check className="w-8 h-8 font-black" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Factor Authentication Enabled</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Congratulations! Your administrative account credentials have been successfully fortified with real-time OTP validation.
                    </p>
                  </div>

                  <button
                    onClick={() => setShow2FASetup(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    Return to Preferences
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
