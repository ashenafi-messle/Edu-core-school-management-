'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Loader2, Save, UserRound, AlertCircle } from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';

export const TeacherProfilePanel: React.FC<{ teacherId: string; schoolId: string }> = ({ teacherId, schoolId }) => {
  const { updateUserProfile } = useNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headers = { 'X-School-ID': schoolId, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!teacherId || !schoolId) return;
    fetch(`/api/teachers/${teacherId}`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load profile');
        setProfile(data);
        const storedPhoto = data.profile_picture_url || data.photo || '';
        setPhoto(storedPhoto);
        if (storedPhoto) updateUserProfile({ avatar: storedPhoto, name: data.full_name, email: data.email });
      })
      .catch((loadError: any) => setError(loadError.message));
  }, [teacherId, schoolId]);

  const browsePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Profile images must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, { method: 'PUT', headers, body: JSON.stringify({ photo }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save profile');
      setProfile(data);
      updateUserProfile({ avatar: data.profile_picture_url || data.photo || photo, name: data.full_name, email: data.email });
    } catch (saveError: any) { setError(saveError.message); }
    finally { setSaving(false); }
  };

  if (!profile) return <div className="flex items-center gap-2 py-6 text-xs text-slate-500"><Loader2 className="animate-spin" size={16} /> Loading profile...</div>;
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    {error && <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700"><AlertCircle size={14} />{error}</div>}
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-blue/10 text-brand-blue">
        {photo ? <img src={photo} alt={profile.full_name} className="h-full w-full object-cover" /> : <UserRound size={32} />}
        <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-blue text-white"><Camera size={14} /><input type="file" accept="image/*" className="hidden" onChange={(event) => browsePhoto(event.target.files?.[0])} /></label>
      </div>
      <div className="min-w-0"><h3 className="font-bold text-slate-900 dark:text-white">{profile.full_name}</h3><p className="text-xs text-slate-500">{profile.employee_id} · {profile.department || 'Teaching Faculty'}</p><p className="text-xs text-slate-400">{profile.email}</p></div>
      <button onClick={saveProfile} disabled={saving || !photo} className="ml-auto flex items-center gap-2 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save size={14} /> Save photo</button>
    </div>
  </div>;
};
