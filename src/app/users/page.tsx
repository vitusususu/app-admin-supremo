'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../lib/firebase-client';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Spinner from '../../components/Spinner';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: { seconds: number; nanoseconds: number; };
  storeId?: string;
}

interface Store {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STORE_ADMIN',
    storeId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isSuperAdmin) {
        try {
          setIsLoading(true);
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[];
          setUsers(usersList);

          const storesSnapshot = await getDocs(collection(db, 'stores'));
          const storesList = storesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) as Store[];
          setStores(storesList);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          alert('Falha ao carregar os dados. Verifique o console.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isSuperAdmin]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Por favor, preencha nome, email e senha.');
      return;
    }
    if (newUser.role === 'STORE_ADMIN' && !newUser.storeId) {
      alert('Um Administrador de Loja deve ser associado a uma loja.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const user = userCredential.user;

      const userDocData: any = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: serverTimestamp(),
      };

      if (newUser.role === 'STORE_ADMIN') {
        userDocData.storeId = newUser.storeId;
      }

      await setDoc(doc(db, 'users', user.uid), userDocData);

      // Optimistic update: add the new user to the list with a local timestamp.
      const localUser: AppUser = {
        id: user.uid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        storeId: newUser.role === 'STORE_ADMIN' ? newUser.storeId : undefined,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      }
      setUsers(prev => [...prev, localUser]);

      alert('Usuário criado com sucesso!');
      setNewUser({ name: '', email: '', password: '', role: 'STORE_ADMIN', storeId: '' });

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulário de Criação */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Criar Novo Usuário</h2>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <input type="text" placeholder="Nome Completo" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <input type="password" placeholder="Senha" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value, storeId: '' })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="STORE_ADMIN">Admin de Loja</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          {newUser.role === 'STORE_ADMIN' && (
            <select value={newUser.storeId} onChange={(e) => setNewUser({ ...newUser, storeId: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Selecione uma loja</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          )}
          <div className="lg:col-span-3">
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto flex justify-center items-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-70 transition-colors">
              {isSubmitting ? <><Spinner size="h-5 w-5" /> <span className='ml-2'>Criando...</span></> : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-2xl font-semibold mb-5 text-gray-800">Usuários Existentes</h2>
         <div className="overflow-x-auto">
          {isLoading ? (
              <div className="flex justify-center items-center p-8"><Spinner /></div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role === 'STORE_ADMIN' ? (stores.find(s => s.id === user.storeId)?.name || 'N/A') : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Pendente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
