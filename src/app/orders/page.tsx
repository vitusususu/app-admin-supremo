'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase-client';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: { seconds: number; nanoseconds: number; };
}

interface Store {
  id: string;
  name: string;
}

const statusColors: { [key in Order['status']]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function GlobalOrdersPage() {
  const { isSuperAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isSuperAdmin) {
        setIsLoading(true);
        try {
          const ordersSnapshot = await getDocs(collection(db, 'orders'));
          const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
          setOrders(ordersList);

          const storesSnapshot = await getDocs(collection(db, 'stores'));
          const storesList = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
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

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Falha ao atualizar o status.');
    }
  };
  
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Gerenciamento Global de Pedidos</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Todos os Pedidos</h2>
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">#{order.id.substring(0, 7)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stores.find(s => s.id === order.storeId)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">R$ {order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])} className={`p-1.5 rounded-lg text-xs font-semibold border-none focus:ring-2 focus:ring-offset-1 ${statusColors[order.status]}`}>
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => viewOrderDetails(order)} className="text-indigo-600 hover:text-indigo-900">Ver Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {selectedOrder && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes do Pedido #${selectedOrder.id.substring(0,7)}`}>
            <div className="space-y-4">
                <p><span className="font-semibold">Cliente:</span> {selectedOrder.userEmail}</p>
                <p><span className="font-semibold">Total:</span> R$ {selectedOrder.total.toFixed(2)}</p>
                <div>
                    <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {selectedOrder.items.map((item, index) => (
                            <li key={index}>{item.name} (x{item.quantity}) - R$ {item.price.toFixed(2)} cada</li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-white bg-indigo-600 rounded-lg">Fechar</button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
}
