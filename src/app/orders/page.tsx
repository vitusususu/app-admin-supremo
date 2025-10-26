'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id?: string;
  storeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any; // Firebase Timestamp
}

export default function GlobalOrdersPage() {
  const { user, isSuperAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchOrdersAndStores = async () => {
      if (isSuperAdmin) {
        // Fetch all orders
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersList);

        // Fetch all stores for display
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
      fetchOrdersAndStores();
    }
  }, [isSuperAdmin, loading]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (isSuperAdmin) {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      // Refetch orders
      const ordersCollection = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersList);
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
      <h1 className="text-3xl font-bold mb-4">Gerenciamento Global de Pedidos</h1>

      <h2 className="text-2xl font-semibold mb-4">Todos os Pedidos</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="border p-4 mb-4 rounded shadow">
            <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
            <p>Loja: {stores.find(s => s.id === order.storeId)?.name || 'N/A'}</p>
            <p>Cliente: {order.userName} ({order.userEmail})</p>
            <p>Total: R${order.total.toFixed(2)}</p>
            <p>Status: {order.status}</p>
            <p>Data: {new Date(order.createdAt.toDate()).toLocaleString()}</p>
            <h4 className="font-semibold mt-2">Itens:</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} (x{item.quantity}) - R${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <label htmlFor={`status-${order.id}`} className="mr-2">Atualizar Status:</label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(e) =>
                  handleUpdateOrderStatus(order.id!, e.target.value as Order['status'])
                }
                className="border p-2 rounded"
              >
                <option value="pending">Pendente</option>
                <option value="processing">Em Processamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
