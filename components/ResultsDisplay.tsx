
import React, { useState } from 'react';
import type { KeywordResults } from '../types.ts';
import KeywordTable from './KeywordTable.tsx';

interface ResultsDisplayProps {
  results: KeywordResults;
  onClusterRequest: (keyword: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onClusterRequest }) => {
  const [showPrimary, setShowPrimary] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [showLongTail, setShowLongTail] = useState(true);

  return (
    <div className="space-y-8">
      {/* Filtros de Visualização */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
        <span className="text-sm font-medium text-gray-400 mr-2">Visualizar seções:</span>
        <button 
            onClick={() => setShowPrimary(!showPrimary)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                showPrimary 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
        >
            {showPrimary ? '●' : '○'} Primárias
        </button>
        <button 
            onClick={() => setShowSecondary(!showSecondary)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                showSecondary 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
        >
            {showSecondary ? '●' : '○'} Secundárias
        </button>
        <button 
            onClick={() => setShowLongTail(!showLongTail)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                showLongTail 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
        >
            {showLongTail ? '●' : '○'} Cauda Longa
        </button>
      </div>

      <div className="space-y-12">
        {showPrimary && (
            <KeywordTable
                title="Palavras-Chave Principais"
                description="Termos de pesquisa amplos e de alto volume que representam o núcleo do seu negócio."
                keywords={results.primaryKeywords}
                onClusterRequest={onClusterRequest}
            />
        )}
        {showSecondary && (
            <KeywordTable
                title="Palavras-Chave Secundárias"
                description="Frases mais específicas que ajudam a qualificar o tráfego e atingir um público mais focado."
                keywords={results.secondaryKeywords}
            />
        )}
        {showLongTail && (
            <KeywordTable
                title="Palavras-Chave de Cauda Longa"
                description="Consultas de pesquisa mais longas e detalhadas, muitas vezes com alta intenção de conversão."
                keywords={results.longTailKeywords}
            />
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
