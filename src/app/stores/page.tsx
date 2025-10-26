'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase-client';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function StoresPage() {
  const { isSuperAdmin } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({ name: '', address: '', city: '', state: '', zipCode: '' });

  useEffect(() => {
    const fetchStores = async () => {
      if (isSuperAdmin) {
        setIsLoading(true);
        try {
          const querySnapshot = await getDocs(collection(db, 'stores'));
          const storesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Store[];
          setStores(storesList);
        } catch (error) {
          console.error("Erro ao buscar lojas:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchStores();
  }, [isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingStore) {
      setEditingStore({ ...editingStore, [name]: value });
    } else {
      setNewStore({ ...newStore, [name]: value });
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'stores'), newStore);
      setStores(prev => [...prev, { id: docRef.id, ...newStore }]);
      setNewStore({ name: '', address: '', city: '', state: '', zipCode: '' });
    } catch (error) {
      console.error("Erro ao adicionar loja:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleUpdateStore = async () => {
    if (!editingStore) return;
    setIsSubmitting(true);
    try {
      const storeRef = doc(db, 'stores', editingStore.id);
      await updateDoc(storeRef, { ...editingStore });
      setStores(prev => prev.map(s => s.id === editingStore.id ? editingStore : s));
      setIsModalOpen(false);
      setEditingStore(null);
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja? Todos os produtos e pedidos associados podem ser afetados.')) {
        try {
            await deleteDoc(doc(db, 'stores', id));
            setStores(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Erro ao excluir loja:", error);
        }
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Lojas</h1>
      <div className="space-y-8">
        {/* Formulário de Criação */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">Adicionar Nova Loja</h2>
          <form onSubmit={handleAddStore} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="name" type="text" placeholder="Nome da Loja" value={newStore.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="address" type="text" placeholder="Endereço" value={newStore.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="city" type="text" placeholder="Cidade" value={newStore.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="state" type="text" placeholder="Estado" value={newStore.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="zipCode" type="text" placeholder="CEP" value={newStore.zipCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <div className="md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md">
                {isSubmitting ? <Spinner size="h-5 w-5" /> : 'Adicionar Loja'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Lojas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">Lojas Cadastradas</h2>
          <div className="overflow-x-auto">
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map(store => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${store.address}, ${store.city}, ${store.state} ${store.zipCode}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(store)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDeleteStore(store.id)} className="ml-4 text-red-600 hover:text-red-900">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingStore && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Loja">
            <div className="space-y-4">
                <input name="name" type="text" value={editingStore.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="address" type="text" value={editingStore.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="city" type="text" value={editingStore.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="state" type="text" value={editingStore.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="zipCode" type="text" value={editingStore.zipCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <div className="flex justify-end space-x-4 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                    <button onClick={handleUpdateStore} disabled={isSubmitting} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg">
                        {isSubmitting ? <Spinner size="h-5 w-5" /> : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
}
