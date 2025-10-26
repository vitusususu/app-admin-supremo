'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const collections = [
  { name: 'Users', path: '/users' },
  { name: 'Products', path: '/products' },
  { name: 'Orders', path: '/orders' },
  { name: 'Stores', path: '/stores' },
];

const DatabasePage = () => {
  const { isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSuperAdmin) {
      router.push('/');
    }
  }, [isSuperAdmin, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento do Banco de Dados</h1>
      <p className="mb-8">Selecione uma coleção para visualizar e gerenciar.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {collections.map((collection) => (
          <div
            key={collection.name}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(collection.path)}
          >
            <h2 className="text-xl font-semibold text-center">{collection.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabasePage;
