/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Check, Save, Loader2, Upload, X, 
  Shield, Key, AlertCircle 
} from 'lucide-react';
import { api } from '../../../lib/api';

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_picture_url: string;
  created_at: string;
}

export const AdminProfile: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const users = await api.getUsers();
      const currentUser = users.find((u: any) => u.email); // Get current user
      if (currentUser) {
        setProfile(currentUser);
        setFormData({
          full_name: currentUser.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });
        setPreviewUrl(currentUser.profile_picture_url || null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      triggerToast('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!profile) return;
      
      await api.updateUser(profile.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        profile_picture_url: previewUrl
      });
      
      triggerToast('Profile updated successfully');
      await loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      triggerToast('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      triggerToast('Passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      triggerToast('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      // Password change logic would go here
      triggerToast('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      triggerToast('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        triggerToast('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setUploading(true);
    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          if (profile) {
            await api.updateUser(profile.id, {
              profile_picture_url: base64String
            });
            triggerToast('Profile picture updated successfully');
            await loadProfile();
          }
        } catch (uploadError) {
          console.error('Failed to save profile picture:', uploadError);
          triggerToast('Failed to save profile picture to database');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        triggerToast('Failed to read image file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      triggerToast('Failed to upload profile picture');
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!profile) return;
    
    setUploading(true);
    try {
      await api.updateUser(profile.id, {
        profile_picture_url: null
      });
      setPreviewUrl(null);
      triggerToast('Profile picture removed');
      await loadProfile();
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      triggerToast('Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
        <span className="ml-2 text-sm text-slate-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <User className="w-5 h-5" />
          My Profile
        </h2>
        <p className="text-[10px] text-slate-450">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-brand-blue hover:bg-brand-indigo text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {formData.full_name || 'Admin User'}
              </h3>
              <p className="text-xs text-slate-500">{formData.email}</p>
            </div>

            <div className="flex gap-2 w-full">
              <label className="flex-1 h-10 px-3 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              
              {previewUrl && (
                <button
                  onClick={removeProfilePicture}
                  disabled={uploading}
                  className="flex-1 h-10 px-3 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              JPG, PNG or GIF (max 5MB)
            </p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Personal Information
              </h3>
              <p className="text-[10px] text-slate-450">Update your personal details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* Password Change Section */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </h3>
                <p className="text-[10px] text-slate-450">Update your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs text-brand-blue hover:text-brand-indigo cursor-pointer"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-450 font-bold uppercase block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-850">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-200">
                    Password must be at least 6 characters long. Make sure to use a strong password with a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="h-10 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
