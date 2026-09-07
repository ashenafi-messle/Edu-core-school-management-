'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useNavigation } from '../src/context/NavigationContext';
import { Navbar } from '../src/components/Navbar';
import { Footer } from '../src/components/Footer';
import { LandingPage } from '../src/view-pages/LandingPage';

const PageLoading = () => <div className="min-h-[16rem] bg-slate-50 dark:bg-slate-950" />;

// Secondary pages are loaded on demand so they do not block the first paint.
const LoginPage = dynamic(() => import('../src/view-pages/LoginPage').then((module) => module.LoginPage), { ssr: false, loading: PageLoading });
const ForgotPasswordPage = dynamic(() => import('../src/view-pages/ForgotPasswordPage').then((module) => module.ForgotPasswordPage), { ssr: false, loading: PageLoading });
const ResetPasswordPage = dynamic(() => import('../src/view-pages/ResetPasswordPage').then((module) => module.ResetPasswordPage), { ssr: false, loading: PageLoading });
const AboutPage = dynamic(() => import('../src/view-pages/AboutPage').then((module) => module.AboutPage), { ssr: false, loading: PageLoading });
const ContactPage = dynamic(() => import('../src/view-pages/ContactPage').then((module) => module.ContactPage), { ssr: false, loading: PageLoading });
const RegistrationPage = dynamic(() => import('../src/view-pages/RegistrationPage').then((module) => module.RegistrationPage), { ssr: false, loading: PageLoading });
const RegistrationStatusPage = dynamic(() => import('../src/view-pages/RegistrationStatusPage').then((module) => module.RegistrationStatusPage), { ssr: false, loading: PageLoading });

// Dashboard workspaces contain the heaviest parts of the application. Loading
// them only after a user reaches the dashboard keeps the public site responsive.
const DashboardRoles = dynamic(
  () => import('../src/components/DashboardRoles').then((module) => module.DashboardRoles),
  { ssr: false, loading: () => <div className="min-h-screen bg-slate-50 dark:bg-slate-950" /> }
);

const MainAppContent: React.FC = () => {
  const { currentPage } = useNavigation();

  if (currentPage === 'registration-status') {
    return <RegistrationStatusPage />;
  }

  if (currentPage === 'dashboard') {
    return <DashboardRoles />;
  }

  if (currentPage === 'login') {
    return <LoginPage />;
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPasswordPage />;
  }

  if (currentPage === 'reset-password') {
    return <ResetPasswordPage />;
  }

  // The public web pages get the universal navigation header and footer
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        {currentPage === 'home' && <LandingPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'registration' && <RegistrationPage />}
      </main>
      <Footer />
    </div>
  );
};

export default function Home() {
  return (
    <MainAppContent />
  );
}
