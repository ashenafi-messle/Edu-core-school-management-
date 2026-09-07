import type { Metadata } from "next";
import "../src/index.css";
import { NavigationProvider } from "../src/context/NavigationContext";
import { LanguageProvider, AutoTranslator } from "../src/context/LanguageContext";

export const metadata: Metadata = {
  title: "EduCore - School Management System",
  description: "Multi-Tenant Campus Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <NavigationProvider>
          <LanguageProvider>
            <AutoTranslator>
              {children}
            </AutoTranslator>
          </LanguageProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
