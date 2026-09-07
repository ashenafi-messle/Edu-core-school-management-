/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Phone, Clock, MapPin, Send, CheckCircle2, 
  Calendar, Shield, MessageSquare, ArrowRight, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        fullName: '',
        schoolName: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
      });
      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  const contactCards = [
    { title: 'Academic Sales', desc: 'Inquire about district pricing matrices, SLA contracts, and deployment quotas.', contact: 'sales@educore.system', icon: Calendar },
    { title: 'Tutor Tech Support', desc: 'Sync regarding RFID integrations, server uptime status, and data migrations.', contact: 'support@educore.system', icon: Shield },
    { title: 'Press & Media', desc: 'Reach out for research publications, educational partnerships, and branding assets.', contact: 'media@educore.system', icon: MessageSquare }
  ];

  return (
    <div id="contact-container" className="pt-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 grid-bg">
      
      {/* 1. Header Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-brand-sky text-xs font-semibold uppercase tracking-wide">
            <span>{t('Connect with our team')}</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {t('Schedule a Demo or Contact Support')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t('Have questions about system databases, custom compliance certificates, or payment gateways? Our campus onboarding specialists are ready to sync.')}
          </p>
        </div>
      </section>

      {/* 2. Core Contact Grid */}
      <section className="py-12 pb-24 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Office Directories */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="space-y-4">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">{t('Office Headquarters')}</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('Our development vaults and customer success divisions are based in SF. Drop in or schedule an encrypted online consultation.')}
                </p>
              </div>

              {/* Info Rows */}
              <div className="space-y-4.5">
                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <Phone className="w-5 h-5 text-brand-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('Telephony Support')}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">+1 (800) 555-CORE (Toll Free)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mon - Fri: 8:00 AM - 6:00 PM PST</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <Mail className="w-5 h-5 text-brand-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('Encrypted Inboxes')}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">support@educore.system</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Continuous Monitoring</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <MapPin className="w-5 h-5 text-brand-sky flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Main Campus Address</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">100 Pine Street, 24th Floor</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">San Francisco, CA 94111</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Headquarters coordinates</span>
                <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50 z-0 flex items-center justify-center">
                    {/* Retro Grid Map Graphic */}
                    <div className="text-center space-y-1.5 p-4 z-10">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-200">Oakridge Silicon HQ</p>
                      <p className="text-[10px] font-mono text-slate-400">Lat: 37.7925 // Lng: -122.4014</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl space-y-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{t('General Inquiries')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('Complete details below and an academy coordinator will respond in &lt;1hr')}</p>
                </div>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex gap-2.5 items-start"
                    >
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">{t('Message Sent Successfully!')}</p>
                        <p className="mt-0.5">Your ticket ID: #EDC-{Math.floor(Math.random() * 8000) + 1000} is active in our routing dashboard.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Your Name')}</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Eleanor Rivera"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('School Name')}</label>
                      <input
                        type="text"
                        required
                        placeholder="Oakridge Prep Academy"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Your Email')}</label>
                      <input
                        type="email"
                        required
                        placeholder="e.rivera@oakridge.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Phone Number')}</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 019-2834"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Subject')}</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="general">{t('General Inquiries')}</option>
                      <option value="demo">{t('Schedule Private Demo')}</option>
                      <option value="billing">District Billing & SLA</option>
                      <option value="support">Active Tech Support</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Message')}</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please details student capacities, branches, or RFID attendance needs..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('Send Message')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: 'demo' })}
                      className="h-11 px-6 border border-slate-200 dark:border-slate-800 hover:border-brand-sky text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Schedule Private Demo
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Extra department contact cards */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Department Directories</h3>
            <p className="text-xs text-slate-500">Route directly to specialized technical and operational boards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <card.icon className="w-5 h-5 text-brand-sky" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{card.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5">{card.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-xs font-semibold text-brand-blue dark:text-brand-sky">
                  {card.contact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
