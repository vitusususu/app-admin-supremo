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

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  storeId: string; // Still need storeId to display which store it belongs to
}

export default function GlobalProductsPage() {
  const { user, isSuperAdmin, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    storeId: '', // Super admin can assign to any store
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchProductsAndStores = async () => {
      if (isSuperAdmin) {
        // Fetch all products
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsList);

        // Fetch all stores for assignment
        const storesCollection = collection(db, 'stores');
        const storesSnapshot = await getDocs(storesCollection);
        const storesList = storesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setStores(storesList);
      }
    };

    if (!loading) {
      fetchProductsAndStores();
    }
  }, [isSuperAdmin, loading]);

  const handleAddProduct = async () => {
    if (isSuperAdmin) {
      await addDoc(collection(db, 'products'), newProduct);
      setNewProduct({ name: '', description: '', price: 0, storeId: '' });
      // Refetch products and stores
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && isSuperAdmin) {
      const productRef = doc(db, 'products', editingProduct.id!);
      await updateDoc(productRef, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        storeId: editingProduct.storeId,
      });
      setEditingProduct(null);
      // Refetch products
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (isSuperAdmin) {
      await deleteDoc(doc(db, 'products', id));
      // Refetch products
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
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
      <h1 className="text-3xl font-bold mb-4">Gerenciamento Global de Produtos</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Produto</h2>
        <input
          type="text"
          placeholder="Nome do Produto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Preço"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
          }
          className="border p-2 mr-2"
        />
        <select
          value={newProduct.storeId}
          onChange={(e) => setNewProduct({ ...newProduct, storeId: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="">Selecionar Loja</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddProduct} className="bg-blue-500 text-white px-4 py-2 rounded">
          Adicionar Produto
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Todos os Produtos</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="border p-4 mb-4 rounded shadow">
            {editingProduct?.id === product.id ? (
              <div>
                <input
                  type="text"
                  value={editingProduct?.name || ''}
                  onChange={(e) =>
                    setEditingProduct(
                      editingProduct ? { ...editingProduct, name: e.target.value } : null
                    )
                  }
                  className="border p-2 mr-2"
                />
                <input
                  type="text"
                  value={editingProduct?.description || ''}
                  onChange={(e) =>
                    setEditingProduct(
                      editingProduct ? { ...editingProduct, description: e.target.value } : null
                    )
                  }
                  className="border p-2 mr-2"
                />
                <input
                  type="number"
                  value={editingProduct?.price || 0}
                  onChange={(e) =>
                    setEditingProduct(
                      editingProduct ? { ...editingProduct, price: parseFloat(e.target.value) } : null
                    )
                  }
                  className="border p-2 mr-2"
                />
                <select
                  value={editingProduct?.storeId || ''}
                  onChange={(e) =>
                    setEditingProduct(
                      editingProduct ? { ...editingProduct, storeId: e.target.value } : null
                    )
                  }
                  className="border p-2 mr-2"
                >
                  <option value="">Selecionar Loja</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleUpdateProduct} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                  Salvar
                </button>
                <button onClick={() => setEditingProduct(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p>{product.description}</p>
                <p>Preço: R${product.price.toFixed(2)}</p>
                <p>Loja: {stores.find(s => s.id === product.storeId)?.name || 'N/A'}</p>
                <button onClick={() => handleEditProduct(product)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                  Editar
                </button>
                <button onClick={() => handleDeleteProduct(product.id!)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Excluir
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
