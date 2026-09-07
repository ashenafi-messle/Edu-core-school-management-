/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { LanguageProvider, AutoTranslator } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './view-pages/LandingPage';
import { LoginPage } from './view-pages/LoginPage';
import { ForgotPasswordPage } from './view-pages/ForgotPasswordPage';
import { ResetPasswordPage } from './view-pages/ResetPasswordPage';
import { AboutPage } from './view-pages/AboutPage';
import { ContactPage } from './view-pages/ContactPage';
import { RegistrationPage } from './view-pages/RegistrationPage';
import { RegistrationStatusPage } from './view-pages/RegistrationStatusPage';
import { DashboardRoles } from './components/DashboardRoles';

const MainAppContent: React.FC = () => {
  const { currentPage } = useNavigation();
  
  console.log('Current page:', currentPage); // Debug log
  
  if (currentPage === 'registration-status') {
    console.log('Rendering RegistrationStatusPage'); // Debug log
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
    console.log('Rendering ResetPasswordPage'); // Debug log
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

export default function App() {
  return (
    <NavigationProvider>
      <LanguageProvider>
        <AutoTranslator>
          <MainAppContent />
        </AutoTranslator>
      </LanguageProvider>
    </NavigationProvider>
  );
}
