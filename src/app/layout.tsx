'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Componente interno para gerenciar a exibição do layout principal
const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Não exibir o sidebar na página de login
  const noSidebarPaths = ['/'];
  const showSidebar = user && !loading && !noSidebarPaths.includes(pathname);

  return (
    <div className="flex h-screen bg-gray-100">
      {showSidebar && <Sidebar />}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}