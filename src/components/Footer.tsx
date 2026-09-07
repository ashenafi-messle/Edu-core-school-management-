/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Phone, MapPin, Send, Check, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const footerLinks = {
    product: [
      { label: 'Core LMS', href: '#features' },
      { label: 'Finance & Billing', href: '#features' },
      { label: 'Parent Workspace', href: '#features' },
      { label: 'Class Planner', href: '#features' },
      { label: 'API Integrations', href: '#features' },
    ],
    solutions: [
      { label: 'K-12 Academies', href: '#' },
      { label: 'Higher Education', href: '#' },
      { label: 'International Schools', href: '#' },
      { label: 'Multi-Campus Districts', href: '#' },
    ],
    resources: [
      { label: 'System Documentation', href: '#' },
      { label: 'Video Guides', href: '#' },
      { label: 'Campus Safety Kit', href: '#' },
      { label: 'Integration Guides', href: '#' },
      { label: 'Compliance Reports', href: '#' },
    ],
    company: [
      { label: 'About EduCore', href: '#about', action: () => navigateTo('about') },
      { label: 'Security Standards', href: '#about', action: () => navigateTo('about') },
      { label: 'Contact Sales', href: '#contact', action: () => navigateTo('contact') },
      { label: 'Global Offices', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
    support: [
      { label: 'Help Desk Pro', href: '#' },
      { label: 'Service Level (SLA)', href: '#' },
      { label: 'Status Console', href: '#' },
      { label: 'Remote Training', href: '#' },
    ],
    legal: [
      { label: 'FERPA & GDPR Compliance', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Preferences', href: '#' },
    ]
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer
      id="enterprise-footer"
      className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-20 pb-12 overflow-hidden position-relative"
    >
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 xl:gap-12 mb-16">
          
          {/* Logo and About Column */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-indigo flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white">
                  EduCore
                </span>
                <span className="block text-[9px] font-mono tracking-wider text-slate-500 uppercase font-medium -mt-1">
                  School Management System
                </span>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Empowering next-generation campuses with responsive dashboards, automated billing pipelines, AI attendance, and high-fidelity role modules.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-brand-sky" />
                <span>contact@educore.system</span>
              </div>
              <div className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-brand-sky" />
                <span>+1 (800) 555-CORE</span>
              </div>
              <div className="flex items-start gap-3 text-sm hover:text-white transition-colors">
                <MapPin className="w-4.5 h-4.5 text-brand-sky mt-0.5" />
                <span>100 Pine Street, 24th Floor,<br />San Francisco, CA 94111</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'YouTube' }
              ].map((soc, idx) => (
                <button
                  key={idx}
                  className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-sky hover:bg-brand-blue/10 hover:text-white transition-all flex items-center justify-center text-slate-500"
                  aria-label={soc.label}
                >
                  <soc.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.product.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.company.map((item) => (
                <li key={item.label}>
                  {item.action ? (
                    <button onClick={item.action} className="hover:text-white transition-colors text-left">{item.label}</button>
                  ) : (
                    <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-6">Resources</h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.resources.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-6">Compliance</h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider & Subscription block */}
        <div className="border-t border-slate-900 pt-10 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-display font-semibold text-white text-sm">Stay Updated on Educational Tech</h4>
            <p className="text-xs text-slate-500 max-w-md">Subscribe to our monthly engineering & security newsletter to receive campus audits and feature rollouts.</p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 text-xs rounded-xl bg-slate-900 border border-slate-800 focus:border-brand-sky focus:outline-none text-white placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                className={`h-11 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  subscribed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-blue hover:bg-brand-blue/90 text-white'
                }`}
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Join
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            &copy; {new Date().getFullYear()} EduCore Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">FERPA Statement</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
