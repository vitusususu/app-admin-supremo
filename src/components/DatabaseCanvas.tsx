
import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

const DatabaseCanvas: React.FC = () => {
  const initialDiagram = `erDiagram
    users {
      string id
      string name
      string email
    }
    stores {
      string id
      string name
      string ownerId
    }
    products {
      string id
      string name
      string storeId
      int price
    }
    orders {
      string id
      string userId
      string productId
      int quantity
    }

    users ||--o{ stores : owner
    stores ||--|{ products : contains
    users ||--o{ orders : places
    products ||--o{ orders : includes`;

  const [diagram, setDiagram] = useState(initialDiagram);
  const [tempDiagram, setTempDiagram] = useState(initialDiagram);

  const handleApplyChanges = () => {
    setDiagram(tempDiagram);
  };

  useEffect(() => {
    // Manually render the diagram when the component mounts and when the diagram state changes
    const mermaidContainer = document.querySelector('.mermaid');
    if (mermaidContainer) {
      mermaidContainer.innerHTML = diagram;
      mermaid.run({ nodes: [mermaidContainer] });
    }
  }, [diagram]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Edite o Diagrama</h2>
      <p className="mb-4">
        Modifique o texto abaixo para alterar o diagrama ER. Depois, clique em "Aplicar Mudanças" para ver a atualização.
        Em seguida, me diga o que você alterou para que eu possa aplicar as mudanças no código-fonte.
      </p>
      <textarea
        className="w-full h-64 p-2 border rounded-md bg-gray-800 text-white font-mono"
        value={tempDiagram}
        onChange={(e) => setTempDiagram(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleApplyChanges}
      >
        Aplicar Mudanças
      </button>
      <h2 className="text-xl font-semibold mt-8 mb-4">Visualização do Diagrama</h2>
      <div className="mermaid text-center">
        {/* Mermaid will render the diagram here */}
      </div>
    </div>
  );
};

export default DatabaseCanvas;
