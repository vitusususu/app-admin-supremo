'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

// Interface 'Store' atualizada para corresponder às regras do Firestore
interface Store {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  adminId?: string; // Opcional, para associar um administrador de loja
}

export default function StoresPage() {
  const { user, isSuperAdmin, loading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  // Estado 'newStore' atualizado para incluir os campos obrigatórios
  const [newStore, setNewStore] = useState<Omit<Store, 'id' | 'adminId'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      if (isSuperAdmin) {
        try {
          const storesCollection = collection(db, 'stores');
          const querySnapshot = await getDocs(storesCollection);
          const storesList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Store[];
          setStores(storesList);
        } catch (error) {
          console.error("Erro ao buscar lojas:", error);
          // Adicione aqui um feedback para o usuário, se desejar
        }
      }
    };

    if (!loading) {
      fetchStores();
    }
  }, [isSuperAdmin, loading]);

  const handleAddStore = async () => {
    if (isSuperAdmin) {
      // Garante que todos os campos obrigatórios sejam preenchidos
      if (!newStore.name || !newStore.address || !newStore.city || !newStore.state || !newStore.zipCode) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      try {
        await addDoc(collection(db, 'stores'), newStore);
        setNewStore({ name: '', address: '', city: '', state: '', zipCode: '' });
        // Atualiza a lista de lojas após a adição
        const storesCollection = collection(db, 'stores');
        const querySnapshot = await getDocs(storesCollection);
        const storesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Store[];
        setStores(storesList);
      } catch (error) {
        console.error("Erro ao adicionar loja:", error);
        alert('Ocorreu um erro ao adicionar a loja. Verifique as permissões e tente novamente.');
      }
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
  };

  const handleUpdateStore = async () => {
    if (editingStore && isSuperAdmin) {
      try {
        const storeRef = doc(db, 'stores', editingStore.id!);
        // O objeto de atualização também deve incluir todos os campos obrigatórios
        await updateDoc(storeRef, {
          name: editingStore.name,
          address: editingStore.address,
          city: editingStore.city,
          state: editingStore.state,
          zipCode: editingStore.zipCode,
        });
        setEditingStore(null);
        // Atualiza a lista de lojas após a edição
        const storesCollection = collection(db, 'stores');
        const querySnapshot = await getDocs(storesCollection);
        const storesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Store[];
        setStores(storesList);
      } catch (error) {
        console.error("Erro ao atualizar loja:", error);
        alert('Ocorreu um erro ao atualizar a loja. Verifique as permissões e tente novamente.');
      }
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (isSuperAdmin) {
      try {
        await deleteDoc(doc(db, 'stores', id));
        // Atualiza a lista de lojas após a exclusão
        const storesCollection = collection(db, 'stores');
        const querySnapshot = await getDocs(storesCollection);
        const storesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Store[];
        setStores(storesList);
      } catch (error) {
        console.error("Erro ao excluir loja:", error);
        alert('Ocorreu um erro ao excluir a loja. Verifique as permissões e tente novamente.');
      }
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
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Lojas</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Adicionar Nova Loja</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da Loja"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Endereço"
            value={newStore.address}
            onChange={(e) =>
              setNewStore({ ...newStore, address: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Cidade"
            value={newStore.city}
            onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Estado"
            value={newStore.state}
            onChange={(e) => setNewStore({ ...newStore, state: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="CEP"
            value={newStore.zipCode}
            onChange={(e) =>
              setNewStore({ ...newStore, zipCode: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>
        <button onClick={handleAddStore} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          Adicionar Loja
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Lojas Cadastradas</h2>
      <ul>
        {stores.map((store) => (
          <li key={store.id} className="border p-4 mb-4 rounded shadow">
            {editingStore?.id === store.id ? (
              <div>
                <h3 className="text-xl font-bold mb-2">Editando: {store.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editingStore.name}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, name: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    value={editingStore.address}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, address: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    value={editingStore.city}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, city: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    value={editingStore.state}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, state: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    value={editingStore.zipCode}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, zipCode: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="mt-4">
                  <button onClick={handleUpdateStore} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                    Salvar
                  </button>
                  <button onClick={() => setEditingStore(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{store.name}</h3>
                <p>Endereço: {store.address}, {store.city}, {store.state} - {store.zipCode}</p>
                <div className="mt-4">
                  <button onClick={() => handleEditStore(store)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteStore(store.id!)} className="bg-red-500 text-white px-4 py-2 rounded">
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
