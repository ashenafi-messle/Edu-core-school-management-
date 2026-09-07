/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Send, Check, Search, ShieldCheck, HelpCircle, User, MessageCircle, Users, BookOpen
} from 'lucide-react';
import { MessageThread } from './StudentMockData';

interface MessagesViewProps {
  threads: MessageThread[];
  onUpdateThreads: (threads: MessageThread[]) => void;
}

// Mock Replier details & responses for interactive chat simulation
const getMockReply = (recipient: string, studentMsg: string): string => {
  const msgLower = studentMsg.toLowerCase();
  if (recipient.includes('Foster') || recipient.includes('Chemistry')) {
    if (msgLower.includes('lab') || msgLower.includes('synthesis') || msgLower.includes('acs')) {
      return "I will look over your lab prep draft during my office hours. Make sure your yield calculations are written clearly!";
    }
    return "Got your message. Let's discuss this at the start of our next session or during lab hours.";
  }
  if (recipient.includes('Director')) {
    return "Thank you for the update. The administration team will verify your records and follow up shortly.";
  }
  if (recipient.includes('Grade 10') || recipient.includes('Section A')) {
    return "Thanks for checking in! Don't forget that our homeroom assembly is scheduled for tomorrow at 8:30 AM.";
  }
  if (recipient.includes('Physics')) {
    return "Let me check the Gauss law diagram. I'll post the revised solution key on the board.";
  }
  return "Understood. I will verify this with the course coordinators and keep you posted.";
};

const getMockReplier = (recipient: string) => {
  if (recipient.includes('Grade 10')) {
    const names = ['Emily Watson', 'Jacob Carter', 'Mrs. Diana Price'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return {
      sender: randomName === 'Mrs. Diana Price' ? 'recipient' : 'classmate',
      senderName: randomName
    };
  }
  if (recipient.includes('Chemistry')) {
    const names = ['Liam O\'Connor', 'Dr. Evelyn Foster'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return {
      sender: randomName.includes('Foster') ? 'recipient' : 'classmate',
      senderName: randomName
    };
  }
  if (recipient.includes('Physics')) {
    const names = ['Maya Lin', 'Dr. Marcus Vance'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return {
      sender: randomName.includes('Vance') ? 'recipient' : 'classmate',
      senderName: randomName
    };
  }
  return {
    sender: 'recipient',
    senderName: recipient
  };
};

export const MessagesView: React.FC<MessagesViewProps> = ({ threads, onUpdateThreads }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [newMsgText, setNewMsgText] = useState('');
  const [searchRecipient, setSearchRecipient] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');

  const activeThread = useMemo(() => {
    return threads.find(t => t.id === selectedThreadId);
  }, [threads, selectedThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter(t => t.recipientName.toLowerCase().includes(searchRecipient.toLowerCase()));
  }, [threads, searchRecipient]);

  // Separate DMs and Groups
  const dms = useMemo(() => {
    return filteredThreads.filter(t => !t.isGroup);
  }, [filteredThreads]);

  const groupChats = useMemo(() => {
    return filteredThreads.filter(t => t.isGroup);
  }, [filteredThreads]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeThread) return;

    const userMessageText = newMsgText.trim();

    // 1. Append Student Message
    const updated = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          unread: false,
          messages: [
            ...t.messages,
            {
              sender: 'student' as const,
              text: userMessageText,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    });

    onUpdateThreads(updated);
    setNewMsgText('');

    // 2. Schedule Auto Reply simulation
    const threadId = activeThread.id;
    const recipientName = activeThread.recipientName;
    const isGroup = activeThread.isGroup;

    setTimeout(() => {
      const replyText = getMockReply(recipientName, userMessageText);
      const replier = getMockReplier(recipientName);

      onUpdateThreads(prevThreads => {
        return prevThreads.map(t => {
          if (t.id === threadId) {
            return {
              ...t,
              unread: selectedThreadId !== threadId, // mark unread if not currently active
              messages: [
                ...t.messages,
                {
                  sender: isGroup ? replier.sender : 'recipient',
                  senderName: isGroup ? replier.senderName : undefined,
                  text: replyText,
                  timestamp: new Date().toISOString()
                }
              ]
            };
          }
          return t;
        });
      });
    }, 1500);
  };

  const renderThreadButton = (th: MessageThread) => {
    const isSelected = th.id === selectedThreadId;
    const lastMsg = th.messages[th.messages.length - 1];

    return (
      <button
        key={th.id}
        onClick={() => setSelectedThreadId(th.id)}
        className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
          isSelected 
            ? 'bg-brand-blue/5 border-brand-blue/35 text-brand-blue' 
            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/20'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono ${
          th.isGroup 
            ? 'bg-indigo-500/10 text-indigo-500' 
            : 'bg-slate-150 dark:bg-slate-800 text-slate-500'
        }`}>
          {th.isGroup ? <Users className="w-4 h-4" /> : th.recipientName[0]}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-baseline">
            <h4 className="text-[11px] font-black truncate text-slate-800 dark:text-slate-100 flex items-center gap-1">
              {th.recipientName}
              {th.isGroup && (
                <span className="text-[8px] font-bold px-1 py-0.2 bg-indigo-500/10 text-indigo-600 rounded">Group</span>
              )}
            </h4>
            {th.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse flex-shrink-0" />}
          </div>
          <p className="text-[9.5px] text-slate-400 mt-0.5">{th.recipientRole}</p>
          {lastMsg && (
            <p className="text-[10px] text-slate-400 truncate mt-1 italic">
              {lastMsg.senderName ? `${lastMsg.senderName}: ` : lastMsg.sender === 'student' ? 'You: ' : ''}
              "{lastMsg.text}"
            </p>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row h-[550px] overflow-hidden text-left">
      
      {/* Sidebar Recipient Threads */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col h-1/3 md:h-full pr-0 md:pr-4">
        <div className="p-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchRecipient}
              onChange={(e) => setSearchRecipient(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
            />
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-850">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue shadow-xs border border-slate-200/40 dark:border-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue shadow-xs border border-slate-200/40 dark:border-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue shadow-xs border border-slate-200/40 dark:border-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Class Chats
            </button>
          </div>
        </div>

        {/* List view segmented by sections */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1">
          
          {/* Direct Messages Section */}
          {(activeTab === 'all' || activeTab === 'direct') && (
            <div className="space-y-1">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase font-mono tracking-wider text-slate-400">Direct Messages</span>
                <span className="text-[8.5px] font-mono text-slate-400">{dms.length}</span>
              </div>
              {dms.length > 0 ? (
                dms.map(renderThreadButton)
              ) : (
                <p className="text-[10px] text-slate-400 pl-2 italic">No private chats</p>
              )}
            </div>
          )}

          {/* Group Class Chats Section */}
          {(activeTab === 'all' || activeTab === 'groups') && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850/50">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase font-mono tracking-wider text-slate-400">Group Class Chats</span>
                <span className="text-[8.5px] font-mono text-slate-400">{groupChats.length}</span>
              </div>
              {groupChats.length > 0 ? (
                groupChats.map(renderThreadButton)
              ) : (
                <p className="text-[10px] text-slate-400 pl-2 italic">No group chats found</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Live Chat Thread Screen */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full pl-0 md:pl-4 mt-4 md:mt-0">
        {activeThread ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            
            {/* Header info */}
            <div className="p-2 border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono ${
                  activeThread.isGroup 
                    ? 'bg-indigo-500/15 text-indigo-500' 
                    : 'bg-brand-blue/15 text-brand-blue'
                }`}>
                  {activeThread.isGroup ? <Users className="w-4 h-4" /> : activeThread.recipientName[0]}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-1 text-left">
                    {activeThread.recipientName}
                    {activeThread.isGroup && (
                      <span className="text-[8px] font-bold px-1.5 py-0.2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded font-mono">GROUP CHAT</span>
                    )}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono text-left">
                    {activeThread.isGroup 
                      ? `Active Classroom Channel • 4 members`
                      : `${activeThread.recipientRole} Desk • Secured Connection`
                    }
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{activeThread.isGroup ? 'Classroom Hub' : 'Faculty Verified'}</span>
              </span>
            </div>

            {/* Message bubble stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {activeThread.messages.map((msg, mIdx) => {
                const isMe = msg.sender === 'student';
                const showSenderName = !isMe && activeThread.isGroup && (msg.senderName || msg.sender);
                
                return (
                  <div key={mIdx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showSenderName && (
                      <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mb-0.5 ml-1 font-sans">
                        {msg.senderName}
                      </span>
                    )}
                    <div className={`p-3 max-w-sm rounded-2xl text-xs space-y-1 ${
                      isMe 
                        ? 'bg-gradient-to-tr from-brand-blue to-brand-indigo text-white rounded-br-none text-right shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none text-left shadow-xs'
                    }`}>
                      <p className="leading-relaxed font-sans">{msg.text}</p>
                      <span className={`block text-[8.5px] font-mono ${isMe ? 'text-brand-sky' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input typing panel */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  activeThread.isGroup
                    ? `Send a message to ${activeThread.recipientName} group...`
                    : `Secure message to ${activeThread.recipientName}...`
                }
                required
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white flex items-center justify-center cursor-pointer shadow transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
            <MessageSquare className="w-12 h-12 text-slate-300 animate-pulse" />
            <h4 className="text-xs font-black text-slate-700">Select Conversation Thread</h4>
            <p className="text-[10px] text-slate-400 max-w-xs">Communicate directly with registered course tutors and administrative offices.</p>
          </div>
        )}
      </div>

    </div>
  );
};
