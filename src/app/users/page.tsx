'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../lib/firebase-client';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Interface AppUser atualizada para corresponder ao Firestore
interface AppUser {
  id: string;
  name: string; // Adicionado para corresponder às regras
  email: string;
  role: string;
  createdAt: any; // Para o timestamp do servidor
  storeId?: string;
}

// Interface Store simplificada para seleção
interface Store {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { loading, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [newUser, setNewUser] = useState({
    name: '', // Adicionado campo de nome
    email: '',
    password: '',
    role: 'STORE_ADMIN',
    storeId: '',
  });

  // Função para buscar dados e evitar repetição
  const fetchData = async () => {
    if (isSuperAdmin) {
      try {
        // Buscar usuários
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppUser[];
        setUsers(usersList);

        // Buscar lojas
        const storesCollection = collection(db, 'stores');
        const storesSnapshot = await getDocs(storesCollection);
        const storesList = storesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        })) as Store[];
        setStores(storesList);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSuperAdmin]);

  const handleCreateUser = async () => {
    // Validações para garantir que os dados sigam as regras do Firestore
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Por favor, preencha nome, email e senha.');
      return;
    }
    if (newUser.role === 'STORE_ADMIN' && !newUser.storeId) {
      alert('Um Administrador de Loja deve ser associado a uma loja.');
      return;
    }

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const user = userCredential.user;

      // 2. Definir o objeto de dados para o Firestore, seguindo as regras
      const userDocData: any = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: serverTimestamp(), // Regra do Firestore requer timestamp
      };

      // Adiciona storeId apenas se a função for STORE_ADMIN
      if (newUser.role === 'STORE_ADMIN') {
        userDocData.storeId = newUser.storeId;
      }

      // 3. Salvar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), userDocData);

      alert('Usuário criado com sucesso!');
      setNewUser({ name: '', email: '', password: '', role: 'STORE_ADMIN', storeId: '' });
      fetchData(); // Re-buscar dados para atualizar a lista

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isSuperAdmin) {
    return <div>Acesso negado. Você não é um administrador supremo.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Usuários</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Criar Novo Usuário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome Completo"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Senha"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value, storeId: '' })}
            className="border p-2 rounded w-full"
          >
            <option value="STORE_ADMIN">Administrador da Loja</option>
            <option value="SUPER_ADMIN">Administrador Supremo</option>
          </select>
          {newUser.role === 'STORE_ADMIN' && (
            <select
              value={newUser.storeId}
              onChange={(e) =>
                setNewUser({ ...newUser, storeId: e.target.value })
              }
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Selecione uma loja</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button onClick={handleCreateUser} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          Criar Usuário
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Usuários Existentes</h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold text-lg">{user.name}</p>
              <p>Email: {user.email}</p>
              <p>Função: {user.role}</p>
              {user.role === 'STORE_ADMIN' && (
                <p>Loja: {stores.find(s => s.id === user.storeId)?.name || 'Não atribuída'}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
