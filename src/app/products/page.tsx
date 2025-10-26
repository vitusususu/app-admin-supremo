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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  storeId: string;
}

interface Store {
  id: string;
  name: string;
}

export default function GlobalProductsPage() {
  const { isSuperAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, storeId: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (isSuperAdmin) {
        setIsLoading(true);
        try {
          const productsSnapshot = await getDocs(collection(db, 'products'));
          const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          setProducts(productsList);

          const storesSnapshot = await getDocs(collection(db, 'stores'));
          const storesList = storesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) as Store[];
          setStores(storesList);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'price' ? parseFloat(value) : value;
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: parsedValue });
    } else {
      setNewProduct({ ...newProduct, [name]: parsedValue });
    }
  };
  
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.storeId) {
        alert('Por favor, selecione uma loja para o produto.');
        return;
    }
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      setProducts(prev => [...prev, { id: docRef.id, ...newProduct }]);
      setNewProduct({ name: '', description: '', price: 0, storeId: '' });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, { ...editingProduct });
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Formulário de Criação */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">Adicionar Novo Produto</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <input name="name" type="text" placeholder="Nome do Produto" value={newProduct.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="description" type="text" placeholder="Descrição" value={newProduct.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <input name="price" type="number" placeholder="Preço" value={newProduct.price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required />
            <select name="storeId" value={newProduct.storeId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" required>
                <option value="">Selecione a Loja</option>
                {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
            <div className="lg:col-span-4">
              <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md">
                {isSubmitting ? <Spinner size="h-5 w-5" /> : 'Adicionar Produto'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">Todos os Produtos</h2>
          <div className="overflow-x-auto">
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">{/* ... */}
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">R$ {product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stores.find(s => s.id === product.storeId)?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="ml-4 text-red-600 hover:text-red-900">Excluir</button>
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
      {editingProduct && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Produto">
            <div className="space-y-4">
                <input name="name" type="text" value={editingProduct.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="description" type="text" value={editingProduct.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <input name="price" type="number" value={editingProduct.price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg" />
                <select name="storeId" value={editingProduct.storeId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-lg">
                    {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                    <button onClick={handleUpdateProduct} disabled={isSubmitting} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg">
                        {isSubmitting ? <Spinner size="h-5 w-5" /> : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
}
