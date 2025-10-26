'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Spinner from './Spinner'; // Criaremos este componente a seguir

const Layout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Mostra um spinner de tela cheia enquanto o estado de autenticação é verificado
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
