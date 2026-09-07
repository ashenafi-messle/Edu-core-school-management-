'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Search, Send, Users, UserRound, ShieldCheck, AlertCircle, Plus, UserPlus } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { GenericSkeleton } from './SkeletonLoaders';

interface Contact {
  contact_id: string;
  participant_user_id?: string | null;
  participant_entity_id?: string | null;
  participant_type: 'student' | 'parent' | 'director' | 'teacher' | 'group';
  category: 'students' | 'parents' | 'directors' | 'teachers' | 'groups';
  participant_name: string;
  group_name?: string;
  group_key?: string;
  subtitle: string;
  group_key?: string;
  member_user_ids?: string[];
}

interface Conversation {
  id: string;
  participant_user_id?: string | null;
  participant_entity_id?: string | null;
  participant_type: Contact['participant_type'];
  category: Contact['category'];
  participant_name: string;
  messages: Array<{ id: string; sender_role: string; body: string; created_at: string }>;
}

interface TeacherCommunicationsProps {
  teacherId: string;
  schoolId: string;
}

export const TeacherCommunications: React.FC<TeacherCommunicationsProps> = ({ teacherId, schoolId }) => {
  const { data, loading, error: dataError, refreshData } = useTeacherData();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContactId, setActiveContactId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | Contact['category']>('all');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!teacherId || !schoolId) return;
    try {
      const headers = { 'X-School-ID': schoolId, 'Content-Type': 'application/json' };
      const [contactsResponse, conversationsResponse] = await Promise.all([
        fetch(`/api/messages?teacher_id=${encodeURIComponent(teacherId)}&mode=contacts`, { headers }),
        fetch(`/api/messages?teacher_id=${encodeURIComponent(teacherId)}`, { headers }),
      ]);
      const contactsData = await contactsResponse.json();
      const conversationsData = await conversationsResponse.json();
      if (!contactsResponse.ok) throw new Error(contactsData.error || 'Failed to load contacts');
      if (!conversationsResponse.ok) throw new Error(conversationsData.error || 'Failed to load conversations');
      setContacts(contactsData);
      setConversations(conversationsData);
      setActiveContactId((current) => current || contactsData[0]?.contact_id || '');
    } catch (loadError: any) {
      console.error('Failed to load communications:', loadError);
    }
  };

  useEffect(() => {
    if (teacherId && schoolId && !data.communications) {
      refreshData('communications');
    }
  }, [teacherId, schoolId]);

  useEffect(() => {
    loadData();
    if (!supabase || !schoolId) return;
    const channel = supabase
      .channel(`school-messages-${schoolId}`)
      .on('broadcast', { event: 'new-message' }, () => loadData())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [teacherId, schoolId]);

  const visibleContacts = useMemo(() => contacts.filter((contact) => {
    const matchesCategory = category === 'all' || contact.category === category;
    return matchesCategory && `${contact.participant_name} ${contact.subtitle}`.toLowerCase().includes(search.toLowerCase());
  }), [contacts, category, search]);

  const activeContact = contacts.find((contact) => contact.contact_id === activeContactId);
  const activeConversation = conversations.find((conversation) =>
    activeContact && conversation.participant_type === activeContact.participant_type && (
      activeContact.participant_type === 'group'
        ? conversation.group_key === activeContact.group_key || conversation.group_name === activeContact.participant_name
        : conversation.participant_user_id === activeContact.participant_user_id ||
          conversation.participant_entity_id === activeContact.participant_entity_id
    )
  );

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeContact || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'X-School-ID': schoolId, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacherId,
          participant_user_id: activeContact.participant_user_id,
          participant_entity_id: activeContact.participant_entity_id,
          participant_type: activeContact.participant_type,
          group_key: activeContact.group_key,
          category: activeContact.category,
          participant_name: activeContact.participant_name,
          body: message,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');
      setMessage('');
      await loadData();
    } catch (sendError: any) {
      setError(sendError.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const createGroup = async (contact?: Contact) => {
    const memberUserIds = contact?.member_user_ids || selectedMembers;
    const name = contact?.participant_name || groupName.trim();
    if (!name || memberUserIds.length === 0) {
      setError('Choose at least one member and enter a group name.');
      return;
    }
    setCreatingGroup(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'X-School-ID': schoolId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, action: 'create_group', group_name: name, group_key: contact?.group_key, member_user_ids: memberUserIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create group');
      setGroupName('');
      setSelectedMembers([]);
      await loadData();
    } catch (groupError: any) {
      setError(groupError.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  if (loading.communications || !data.communications) return <GenericSkeleton />;

  return (
    <div className="h-[650px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full flex-col md:flex-row">
        <aside className="flex w-full flex-col border-b border-slate-200 md:w-80 md:border-b-0 md:border-r dark:border-slate-800">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-brand-blue" /><h2 className="font-bold text-slate-900 dark:text-white">Live Messages</h2></div>
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-950" /></div>
            <div className="mt-3 flex flex-wrap gap-1">{(['all', 'students', 'parents', 'directors', 'teachers', 'groups'] as const).map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-md px-2 py-1 text-[10px] capitalize ${category === item ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{item}</button>)}</div>
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-500"><UserPlus size={13} /> Teacher discussion group</div>
              <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Group name" className="h-8 w-full rounded border border-slate-200 px-2 text-[11px] dark:border-slate-700 dark:bg-slate-950" />
              <div className="mt-2 max-h-20 overflow-y-auto">{contacts.filter((contact) => contact.participant_type === 'teacher').map((contact) => <label key={contact.contact_id} className="flex items-center gap-2 py-1 text-[10px] text-slate-600 dark:text-slate-300"><input type="checkbox" checked={selectedMembers.includes(contact.participant_user_id || '')} onChange={() => setSelectedMembers((current) => current.includes(contact.participant_user_id || '') ? current.filter((id) => id !== contact.participant_user_id) : [...current, contact.participant_user_id || ''])} />{contact.participant_name}</label>)}</div>
              <button type="button" onClick={() => createGroup()} disabled={creatingGroup} className="mt-2 flex items-center gap-1 rounded bg-brand-blue px-2 py-1 text-[10px] text-white disabled:opacity-50"><Plus size={12} /> Create group</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {visibleContacts.map((contact) => {
              const conversation = conversations.find((item) => item.participant_type === contact.participant_type && (
                contact.participant_type === 'group'
                  ? item.group_key === contact.group_key || item.group_name === contact.participant_name
                  : item.participant_user_id === contact.participant_user_id || item.participant_entity_id === contact.participant_entity_id
              ));
              const lastMessage = conversation?.messages?.at(-1);
              return <button key={contact.contact_id} onClick={() => setActiveContactId(contact.contact_id)} className={`w-full rounded-xl p-3 text-left ${activeContactId === contact.contact_id ? 'bg-brand-blue/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">{contact.participant_type === 'director' ? <ShieldCheck size={15} /> : contact.participant_type === 'parent' ? <UserRound size={15} /> : <Users size={15} />}</div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800 dark:text-white">{contact.participant_name}</p><p className="truncate text-[10px] text-slate-400">{contact.subtitle}</p></div></div>{lastMessage && <p className="mt-2 truncate text-[10px] text-slate-400">{lastMessage.body}</p>}{contact.participant_type === 'group' && !conversation && <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-brand-blue"><Plus size={11} /> Start group</span>}</button>;
            })}
            {visibleContacts.length === 0 && <p className="p-5 text-center text-xs text-slate-400">No allocated contacts found.</p>}
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          {(error || dataError.communications) && <div className="m-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"><AlertCircle size={15} />{error || dataError.communications}</div>}
          {activeContact ? <>
            <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue"><Users size={17} /></div><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeContact.participant_name}</h3><p className="text-[10px] text-slate-400">{activeContact.subtitle} · realtime channel</p></div></header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">{(activeConversation?.messages || []).map((item) => <div key={item.id} className={`flex ${item.sender_role === 'teacher' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${item.sender_role === 'teacher' ? 'rounded-br-none bg-brand-blue text-white' : 'rounded-bl-none bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}><p>{item.body}</p><time className="mt-1 block text-[9px] opacity-60">{new Date(item.created_at).toLocaleString()}</time></div></div>)}{!activeConversation?.messages?.length && <p className="py-10 text-center text-xs text-slate-400">{activeContact.participant_type === 'group' ? 'Start this group discussion.' : 'Start the conversation.'}</p>}</div>
            {activeContact.participant_type === 'group' && !activeConversation ? <button type="button" onClick={() => createGroup(activeContact)} disabled={creatingGroup} className="m-3 rounded-xl bg-brand-blue px-3 py-3 text-xs font-semibold text-white disabled:opacity-50"><Plus size={14} className="mr-1 inline" /> Start allocated student group</button> : <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`Message ${activeContact.participant_name}`} className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-950" /><button disabled={sending} className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue text-white disabled:opacity-50"><Send size={16} /></button></form>}
          </> : <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400"><MessageSquare size={38} /><p className="mt-2 text-xs">Select an allocated contact to begin.</p></div>}
        </main>
      </div>
    </div>
  );
};
