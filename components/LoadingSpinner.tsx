
import React, { useState, useEffect } from 'react';

const messages = [
  "Analisando a estrutura do site...",
  "Identificando os principais tópicos e serviços...",
  "Consultando dados de busca em tempo real...",
  "Calculando dificuldade das palavras-chave...",
  "Gerando insights de cauda longa...",
  "Quase pronto, compilando os resultados..."
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center my-16 p-4">
      <div className="flex justify-center items-center mb-4">
        <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-300 animate-pulse">{message}</p>
      <p className="text-gray-500 mt-2">Nossa IA está trabalhando para encontrar as melhores palavras-chave para você.</p>
    </div>
  );
};

export default LoadingSpinner;