/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Award, Heart, CheckCircle2, Server, Key, Users, 
  Sparkles, History, Globe, Database, Cpu, ArrowRight 
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { t } = useLanguage();

  const values = [
    { title: t('Academic Focus'), desc: t('Putting student outcomes first by designing tools that keep teachers doing what they do best: mentoring and coaching.'), icon: Award, color: 'text-amber-500 bg-amber-500/10' },
    { title: t('Uncompromising Security'), desc: t('Enforcing AES-256 database lockers, strict TLS 1.3 channel encryption, and rigorous regional privacy adherence.'), icon: ShieldCheck, color: 'text-brand-blue bg-brand-blue/10' },
    { title: t('Informed Families'), desc: t('Fostering deep guardian confidence through instant arrival signals, continuous reporting cards, and real-time ledger checkouts.'), icon: Heart, color: 'text-rose-500 bg-rose-500/10' }
  ];

  const timeline = [
    { year: '2023', event: 'LMS Core conceptualized by academic administrators and cybersecurity researchers.' },
    { year: '2024', event: 'Beta release tested in 12 major California charter districts with 100% compliance score.' },
    { year: '2025', event: 'Full commercial release of EduCore School Management System. Over 50 campuses digitized.' },
    { year: '2026', event: 'Active rollout of AI-assisted lesson planners and multibranch district ledger systems.' }
  ];

  const techStack = [
    { name: 'Core Engine', detail: 'React 19 / TypeScript / Vite', icon: Cpu },
    { name: 'Style Framework', detail: 'Tailwind CSS / Framer Motion', icon: Sparkles },
    { name: 'Security Vault', detail: 'AES-256 / TLS 1.3 / OAuth 2.0', icon: Key },
    { name: 'Cloud Infrastructure', detail: 'Edge-optimized Containers', icon: Server }
  ];

  return (
    <div id="about-container" className="pt-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 grid-bg">
      
      {/* 1. Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-indigo/10 text-brand-blue dark:text-brand-sky text-xs font-semibold uppercase tracking-wide">
            <span>{t('Our History & Mission')}</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-tight tracking-tight text-glow">
            {t('Redefining School Operations')} <br />
            <span className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky bg-clip-text text-transparent">
              {t('With Modern SaaS Standards')}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {t('EduCore was founded by veteran educational leaders and corporate software architects who believed schools deserved administrative tools matching the beauty and performance of modern platforms like Stripe or Linear.')}
          </p>
        </div>
      </section>

      {/* 2. Company Story & Mission */}
      <section className="py-16 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{t('Our Mission & Vision')}</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('We believe standard school portals shouldn\'t feel like clunky software from the early 2000s. Our mission is to streamline administrative operations, removing manual, paper-heavy tasks so school administrators and educators can reinvest their time in cultivating student achievements.')}
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('By equipping schools with real-time analytics, automated fee pipelines, biometric attendance syncs, and direct chat channels, we unite students, guardians, and educators under a cohesive, secure digital standard.')}
              </p>
            </div>
            
            {/* Visual key metrics cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-3xl sm:text-4xl font-display font-bold text-brand-blue dark:text-brand-sky">50+</span>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Colleges Integrated')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-3xl sm:text-4xl font-display font-bold text-indigo-500">95%</span>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Arrears Recovery Rate')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-3xl sm:text-4xl font-display font-bold text-emerald-500">96.4%</span>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Daily Attendance Avg')}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-3xl sm:text-4xl font-display font-bold text-purple-500">2K+</span>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Educators Empowered')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">{t('Our Institutional Values')}</h2>
            <p className="text-xs text-slate-500 uppercase font-mono font-bold tracking-wider">{t('The principles guiding our code and customer support')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 hover:border-brand-blue/30 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${val.color}`}>
                  <val.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{val.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Development Timeline */}
      <section className="py-20 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">{t('Evolution Timeline')}</h2>
            <p className="text-xs text-slate-500 uppercase font-mono font-bold tracking-wider">{t('How we reached premium campus standard')}</p>
          </div>

          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 space-y-8">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-brand-blue bg-white dark:bg-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-sky" />
                </span>
                
                <div>
                  <span className="font-mono font-bold text-xs bg-brand-blue/10 text-brand-blue dark:text-brand-sky px-2 py-0.5 rounded">
                    {item.year}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {item.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Technology Stack */}
      <section className="py-20 bg-slate-950 text-slate-300 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">{t('Modern Tech Stack')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('By leveraging premium frameworks, we compile blazing fast assets, enforce absolute data boundaries, and deliver fluid animations.')}
              </p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-2 gap-4">
              {techStack.map((tech, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3.5 items-start">
                  <div className="w-8.5 h-8.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-brand-sky">
                    <tech.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{tech.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tech.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security and Compliance block */}
      <section className="py-20 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto">
            <ShieldCheck className="w-6 h-6 text-brand-sky" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">{t('Strict Legal & FERPA Compliance')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {t('Our databases run on secure, containerized cloud environments complying strictly with standard federal directives on student records safety. Encryption protocols keep parent fee checkers and child coordinates confidential under all network scenarios.')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative bg-brand-blue overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="font-display font-bold text-3xl">{t('Partner With EduCore')}</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            {t('Ready to completely modernize your registration desks, tutor planners, and ledger audits?')}
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <button
              onClick={() => navigateTo('login')}
              className="h-11 px-6.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md cursor-pointer"
            >
              Launch Portal Now
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="h-11 px-6.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
