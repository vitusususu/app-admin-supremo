'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo'; // Importando o Logo

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, loading, isSuperAdmin, authError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const destination = isSuperAdmin ? '/database' : '/stores'; // Rota corrigida
      router.push(destination);
    }
  }, [user, isSuperAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Tela de carregamento enquanto o estado do usuário é verificado
  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Logo />
        <div className="mt-4 text-lg text-gray-600">Verificando credenciais...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Lado Esquerdo: Formulário de Login */}
      <div className="flex flex-col items-center justify-center p-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Logo />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-600 mb-8">Faça login para gerenciar sua aplicação.</p>

          {authError && (
            <div className="p-3 mb-4 text-center text-sm font-medium text-red-800 bg-red-100 rounded-lg border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Endereço de Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Lado Direito: Imagem ou Gradiente */}
      <div className="hidden lg:block bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="flex flex-col items-center justify-center h-full p-12 text-white">
          <Logo className="text-white" />
          <h2 className="text-3xl font-bold mt-6">Gerenciamento Simplificado</h2>
          <p className="mt-4 text-lg text-center text-indigo-100">Uma plataforma centralizada para administrar todos os aspectos da sua aplicação com eficiência e segurança.</p>
        </div>
      </div>
    </div>
  );
}
