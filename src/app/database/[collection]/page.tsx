'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase-client';

const CollectionPage = ({ params }: { params: { collection: string } }) => {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);

  useEffect(() => {
    // Só executa qualquer lógica quando a autenticação estiver resolvida
    if (authLoading) {
      return;
    }

    if (!isSuperAdmin) {
      router.push('/');
      return;
    }

    const fetchDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, params.collection));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents: ", error);
        // Opcional: Adicionar um estado de erro para a UI
      } finally {
        setCollectionLoading(false);
      }
    };

    fetchDocuments();
  }, [authLoading, isSuperAdmin, params.collection, router]);

  if (authLoading || collectionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coleção: {params.collection}</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              {documents.length > 0 && Object.keys(documents[0]).map(key => (
                <th key={key} className="py-2 px-4 border-b text-left">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                {Object.keys(doc).map(key => (
                  <td key={key} className="py-2 px-4 border-b">{typeof doc[key] === 'object' ? JSON.stringify(doc[key]) : doc[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionPage;