'use client';

import { useRouter } from 'next/navigation';

// Ícones foram movidos para dentro do componente para simplicidade
const icon_users = (
  <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197"></path></svg>
);

const icon_products = (
  <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
);

const icon_orders = (
    <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
);

const icon_stores = (
    <svg className="w-12 h-12 mb-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
);

const collections = [
  { name: 'Usuários', path: '/users', icon: icon_users },
  { name: 'Produtos', path: '/products', icon: icon_products },
  { name: 'Pedidos', path: '/orders', icon: icon_orders },
  { name: 'Lojas', path: '/stores', icon: icon_stores },
];

const DatabasePage = () => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Visão Geral do Banco de Dados</h1>
      <p className="text-lg text-gray-600 mb-10">Selecione uma coleção abaixo para visualizar e gerenciar os dados correspondentes.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {collections.map((collection) => (
          <div
            key={collection.name}
            tabIndex={0}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => handleNavigate(collection.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigate(collection.path);
              }
            }}
          >
            {collection.icon}
            <h2 className="text-xl font-semibold text-gray-700 mt-2">{collection.name}</h2>
          </div>
        ))}
      </div>
    </>
  );
};

export default DatabasePage;
