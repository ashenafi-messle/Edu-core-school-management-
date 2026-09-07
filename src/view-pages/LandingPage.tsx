/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Check, Star, Shield, Cloud, Play, Laptop, Smartphone,
  ChevronDown, ChevronUp, Clock, BookOpen, CreditCard, HeartHandshake,
  Bus, Home, MessageSquare, BarChart3, GraduationCap, Award, Users, Plus,
  ShieldCheck, Zap, RotateCcw, Compass, PhoneCall, UserCog, BookOpenText, Sparkles, Coins
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveDashboardMockup } from '../components/InteractiveDashboardMockup';
import { DatabaseSandboxController } from '../components/DatabaseSandboxController';
import { FEATURES, SYSTEM_MODULES, TESTIMONIALS, FAQS } from '../data';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div id="landing-container" className="pt-20 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 grid-bg">
      <HeroSection />
      <TrustedSchools />
      <FeaturesSection />
      <SystemModulesSection />
      <DashboardPreviewSection />
      <DatabaseSandboxController />
      <WhyChooseUsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

/* ==========================================================================
   HERO SECTION
   ========================================================================== */
const HeroSection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { t } = useLanguage();
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    const schoolsTimer = setInterval(() => {
      setSchoolsCount((prev) => (prev < 120 ? prev + 4 : 120));
    }, 50);

    const studentsTimer = setInterval(() => {
      setStudentsCount((prev) => (prev < 50 ? prev + 2 : 50));
    }, 40);

    return () => {
      clearInterval(schoolsTimer);
      clearInterval(studentsTimer);
    };
  }, []);

  return (
    <section id="hero-section" className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] rounded-full bg-brand-blue/10 dark:bg-brand-blue/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/10 w-[400px] h-[400px] rounded-full bg-brand-indigo/10 dark:bg-brand-indigo/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/15 text-brand-blue dark:text-brand-sky text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('Next-Gen Campus Intelligence')}</span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-tight tracking-tight text-glow">
              {t('Transform Your School')} <br />
              <span className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-sky bg-clip-text text-transparent">
                {t('Into a Smart Campus')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('Manage admissions, automated billing pipelines, grading cards, live schedules, and campus communication from one highly responsive, centralized secure platform.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <button
                id="hero-register-btn"
                onClick={() => navigateTo('registration')}
                className="h-13 px-7 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo text-white font-bold text-sm shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5 text-brand-sky" />
                <span>{t('Online Registration')}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                id="hero-signin-btn"
                onClick={() => navigateTo('login')}
                className="h-13 px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
              >
                <span>{t('Portal Sign In')}</span>
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">{schoolsCount}+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Colleges & Schools')}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">{studentsCount}K+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Active Students')}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">2K+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Educators')}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-500">99.9%</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Uptime SLA')}</p>
              </div>
            </div>
          </div>

          {/* Right Hero Graphics & Interactive Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-sky/10 rounded-3xl blur-2xl opacity-70 pointer-events-none" />
            
            {/* Main Interactive Dashboard */}
            <div className="relative z-10 transition-transform duration-500 hover:scale-[1.01] hover:rotate-[0.5deg]">
              <InteractiveDashboardMockup variant="hero" />
            </div>

            {/* Floating Glassmorphic Ornaments */}
            <div className="absolute -top-6 -left-6 z-20 hidden md:block animate-float-slow">
              <div className="glass-card p-3.5 rounded-2xl shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Star className="w-4.5 h-4.5 fill-current" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t('98.4% Retention')}</p>
                  <span className="text-[9px] text-slate-400 block -mt-0.5 font-mono">{t('Continuous Growth')}</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-4 z-20 hidden md:block animate-float-delayed">
              <div className="glass-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-blue/20">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue">
                  <Shield className="w-5 h-5 text-brand-sky" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t('FERPA Compliant')}</p>
                  <span className="text-[9px] text-slate-400 block -mt-0.5 font-mono">{t('Federal Data Safety')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   TRUSTED BY SCHOOLS LOGO SLIDER
   ========================================================================== */
const TrustedSchools: React.FC = () => {
  const { t } = useLanguage();
  const schoolLogos = [
    'Oakridge Academy', 'St. Augustine Collegiate', 'Wellington Science School',
    'Pinecrest Preparatory', 'Horizon Charter Inst', 'Beacon Catholic Academy'
  ];

  return (
    <section id="trusted-schools" className="py-12 border-y border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-8">
          {t('Trusted by Leading Educational Institutions')}
        </p>

        {/* Scrolling track */}
        <div className="relative w-full overflow-hidden flex items-center gap-12 select-none">
          <div className="flex items-center gap-16 md:gap-24 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
            {schoolLogos.concat(schoolLogos).map((logo, idx) => (
              <div key={idx} className="flex items-center gap-2.5 opacity-40 hover:opacity-100 transition-opacity duration-300">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                  {logo.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   FEATURES SECTION ( responsive Grid )
   ========================================================================== */
const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeCat, setActiveCat] = useState<'all' | 'core' | 'academic' | 'management' | 'utility'>('all');

  const filteredFeatures = FEATURES.filter(f => activeCat === 'all' || f.category === activeCat);

  // Icon switcher helper
  const getIcon = (name: string) => {
    switch (name) {
      case 'UserCheck': return <Check className="w-5 h-5 text-brand-sky" />;
      case 'Users': return <Users className="w-5 h-5 text-brand-blue" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      case 'Clock': return <Clock className="w-5 h-5 text-emerald-500" />;
      case 'FileSpreadsheet': return <Award className="w-5 h-5 text-amber-500" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-pink-500" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-teal-500" />;
      case 'Bus': return <Bus className="w-5 h-5 text-cyan-500" />;
      case 'Home': return <Home className="w-5 h-5 text-blue-500" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-violet-500" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {t('Everything Your School Needs')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {t('Eliminate operational overhead. Our cohesive modular architecture covers every administrative division, ensuring seamless multi-user collaboration.')}
          </p>

          {/* Filtering row */}
          <div className="flex flex-wrap justify-center gap-2 pt-6">
            {[
              { id: 'all', label: t('All Modules') },
              { id: 'core', label: t('Core & Ops') },
              { id: 'academic', label: t('Academics') },
              { id: 'management', label: t('Management') },
              { id: 'utility', label: t('Auxiliary Support') }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id as any)}
                className={`px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeCat === cat.id
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredFeatures.map((feat) => (
              <motion.div
                key={feat.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:border-brand-blue/40 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(feat.iconName)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-brand-blue dark:text-brand-sky opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{t('Learn more')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   SYSTEM MODULES (ROLES SECTION)
   ========================================================================== */
const SystemModulesSection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { t } = useLanguage();

  const getRoleIcon = (name: string) => {
    switch (name) {
      case 'Building2': return <Shield className="w-5 h-5 text-brand-sky" />;
      case 'Award': return <Award className="w-5 h-5 text-indigo-400" />;
      case 'BookOpenText': return <BookOpenText className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Heart': return <Star className="w-5 h-5 text-rose-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-violet-400" />;
      case 'PhoneCall': return <PhoneCall className="w-5 h-5 text-teal-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'UserCog': return <UserCog className="w-5 h-5 text-purple-400" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <section id="modules" className="py-24 lg:py-32 bg-slate-950 text-slate-300 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-indigo/20 text-brand-sky text-xs font-semibold tracking-wide uppercase">
            <span>{t('Enterprise Hierarchy')}</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            {t('Role-Based Campus Terminals')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {t('Every user receives a customized, highly targeted workspace dashboard to complete daily tasks efficiently, synced live across the network.')}
          </p>
        </div>

        {/* Grid of Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {SYSTEM_MODULES.map((mod) => (
            <div
              key={mod.id}
              className="p-5.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between h-[310px] group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                  {getRoleIcon(mod.iconName)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base group-hover:text-brand-sky transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Specific features ticker inside card */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap gap-1.5">
                  {mod.features.slice(0, 2).map((feat, i) => (
                    <span key={i} className="text-[9px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                      {feat}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => navigateTo('login')}
                  className="w-full h-8.5 rounded-lg bg-slate-950 hover:bg-brand-blue hover:text-white border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{t('Launch Module')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   DASHBOARD PREVIEW SECTION (Laptop & Mobile Floating Mockups)
   ========================================================================== */
const DashboardPreviewSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section id="preview-section" className="py-24 lg:py-32 relative bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {t('Designed for Desktop & Mobile Autonomy')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {t('Beautiful responsive layouts that adapt from professional desktop ledger monitors down to real-time phone check-ins for parents on the move.')}
          </p>
        </div>

        {/* Layout Mockups */}
        <div className="relative max-w-5xl mx-auto pt-10">
          
          {/* Outer Ring Ambient */}
          <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

          {/* Laptop Mockup */}
          <div className="relative mx-auto max-w-4xl border-[12px] border-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden bg-slate-950">
            <div className="h-6 bg-slate-900 dark:bg-slate-800 px-4 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <div className="p-1 sm:p-2 bg-slate-950">
              <InteractiveDashboardMockup variant="preview" />
            </div>
          </div>

          {/* Floating Phone Preview */}
          <div className="absolute -bottom-10 -right-4 md:right-10 w-44 sm:w-56 border-8 border-slate-900 dark:border-slate-800 rounded-2xl bg-slate-950 shadow-2xl overflow-hidden hidden sm:block animate-float-slow">
            <div className="h-4 bg-slate-900 dark:bg-slate-800 px-3 flex items-center justify-between">
              <span className="text-[7px] text-slate-500 font-mono">09:41 AM</span>
              <div className="w-12 h-2.5 rounded-full bg-slate-950" />
              <span className="text-[7px] text-slate-500 font-mono">LTE</span>
            </div>
            
            {/* Phone Screen Mockup */}
            <div className="p-3.5 space-y-3.5 bg-slate-950 text-white font-sans h-80 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 font-mono">{t('DAILY ATTENDANCE')}</span>
                  <p className="text-[11px] font-bold">{t('96.4% Recorded')}</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-sky w-[96.4%]" />
                </div>
                <p className="text-[8px] text-slate-500 font-mono">{t('All classes submitted safely.')}</p>
              </div>

              {/* Quick Card List */}
              <div className="space-y-2">
                <p className="text-[8px] font-mono text-slate-500">{t('RECENT DISPATCHES')}</p>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-200">{t('Bus #4 Gate Arrival')}</p>
                  <span className="text-[7px] text-slate-500 block font-mono">{t('Just Now')}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-200">{t('Grade Card: Class 12-A')}</p>
                  <span className="text-[7px] text-slate-500 block font-mono">{t('15m ago')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   WHY CHOOSE US SECTION
   ========================================================================== */
const WhyChooseUsSection: React.FC = () => {
  const { t } = useLanguage();
  const points = [
    { title: t('Cloud-Based Scalability'), desc: t('No on-premise server maintenance. Expand dynamically from one branch to district level instantly.') },
    { title: t('Role-Based Cyber Security'), desc: t('Multi-factor login and custom workspace levels guarantee strict compliance with FERPA & GDPR regulations.') },
    { title: t('Real-Time Insights & Reports'), desc: t('Dynamically generated accounting sheets, pupil attendance counters, and subject competency curves.') },
    { title: t('Blazing Fast Performance'), desc: t('Containerized, edge-optimized servers deliver millisecond responses on grade registration and checkouts.') },
    { title: t('Automatic Encryption Backups'), desc: t('Daily database captures are mirrored across isolated server networks for absolute recovery confidence.') },
    { title: t('Sleek Aesthetic Design'), desc: t('A minimalist user interface pairing clean spacing and typography reduces visual strain for busy registrars.') }
  ];

  return (
    <section id="why-choose-us" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left illustration / teaser card */}
          <div className="lg:col-span-5 relative space-y-6">
            <div className="absolute inset-0 bg-brand-indigo/10 rounded-2xl blur-3xl pointer-events-none" />
            
            <div className="p-6.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue">
                <ShieldCheck className="w-5.5 h-5.5 text-brand-sky" />
              </div>
              <h3 className="font-display font-bold text-white text-base">{t('Continuous Security Audit')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('We monitor every token check, financial gateway connection, and file drop to ensure your historical student database remains perfectly safe and encrypted at rest and in motion.')}
              </p>
              
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xl font-bold font-display text-white">{t('AES-256')}</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5 uppercase">{t('Locker Encryption')}</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-display text-emerald-400">{t('99.9%')}</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5 uppercase">{t('Uptime Promise')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right checklists column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                {t('An Institutional Standard Schools Can Trust')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-3">
                {t('Built hand-in-hand with veteran educators and administrative auditors, EduCore streamlines institutional work without the friction of outdated software.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {points.map((pt, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{pt.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ==========================================================================
   HOW IT WORKS (Step timeline)
   ========================================================================== */
const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();
  const steps = [
    { step: '01', title: t('Register Your Institution'), desc: t('Securely register your academy, upload existing rosters, and establish initial administrative divisions.') },
    { step: '02', title: t('Configure Your Campus'), desc: t('Map classroom capacities, define customized grading GPA schemas, and establish billing fee cycles.') },
    { step: '03', title: t('Manage Everything Digitally'), desc: t('Instructors record scores, billing triggers, and students sync tasks via a single cohesive ecosystem.') }
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50/50 dark:bg-slate-900/10 border-y border-slate-200/50 dark:border-slate-800/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {t('Seamless Campus Digitalization')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {t('Our specialized migration team coordinates your databases safely, ensuring zero lecture disruptions during rollout.')}
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Connecting line (desktop only) */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden lg:block z-0" />

          {steps.map((st, i) => (
            <div key={i} className="relative z-10 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between hover:border-brand-blue/30 hover:scale-[1.01] transition-all">
              <div className="space-y-4">
                <span className="text-2xl font-mono font-bold text-brand-sky bg-brand-blue/10 px-3 py-1 rounded-xl">
                  {st.step}
                </span>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    {st.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   TESTIMONIALS SECTION (Carousel)
   ========================================================================== */
const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24 lg:py-32 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
            {t('Institutional Feedback')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-mono font-bold tracking-wider">
            {t('What directors, parents, and principals report')}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          
          <AnimatePresence mode="wait">
            {TESTIMONIALS.map((test, index) => {
              if (index !== activeIdx) return null;
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card p-8 sm:p-10 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-md text-center max-w-2xl space-y-6"
                >
                  <div className="flex justify-center gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-base sm:text-lg font-medium text-slate-850 dark:text-slate-200 leading-relaxed">
                    "{test.quote}"
                  </blockquote>

                  <div className="flex flex-col items-center gap-2">
                    <img src={test.avatar} alt={test.name} className="w-11 h-11 rounded-full object-cover border-2 border-brand-blue" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{test.name}</p>
                      <span className="text-[10px] font-mono text-slate-500">{test.role} • {test.school}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIdx ? 'w-6 bg-brand-blue' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   FAQ SECTION (Accordions)
   ========================================================================== */
const FAQSection: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-24 lg:py-32 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
            {t('Frequently Asked Queries')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            {t('Review core answers regarding onboarding, encryption protocols, and administrative operations.')}
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() => handleToggle(i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider select-none cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-brand-sky" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   CALL TO ACTION
   ========================================================================== */
const CTASection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { t } = useLanguage();

  return (
    <section id="cta-section" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo via-brand-blue to-brand-sky" />
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white space-y-8">
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
          {t('Ready to Modernize Your School?')}
        </h2>
        
        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
          {t('Unlock paperless admissions, custom lesson planners, direct guardian billing pipelines, and complete administrative integrity today.')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            id="cta-signin-btn"
            onClick={() => navigateTo('login')}
            className="h-12 px-8 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
          >
            {t('Launch System Portal')}
          </button>
          <button
            id="cta-contact-btn"
            onClick={() => navigateTo('contact')}
            className="h-12 px-8 rounded-xl bg-slate-950/20 hover:bg-slate-950/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
          >
            {t('Schedule Private Demo')}
          </button>
        </div>
      </div>
    </section>
  );
};
