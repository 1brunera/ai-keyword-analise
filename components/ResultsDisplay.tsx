import React from 'react';
// Fix: Added .ts extension to the import path.
import type { KeywordResults } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import KeywordTable from './KeywordTable.tsx';

interface ResultsDisplayProps {
  results: KeywordResults;
  onClusterRequest: (keyword: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onClusterRequest }) => {
  return (
    <div className="space-y-12">
      <KeywordTable
        title="Palavras-Chave Principais"
        description="Termos de pesquisa amplos e de alto volume que representam o núcleo do seu negócio."
        keywords={results.primaryKeywords}
        onClusterRequest={onClusterRequest}
      />
      <KeywordTable
        title="Palavras-Chave Secundárias"
        description="Frases mais específicas que ajudam a qualificar o tráfego e atingir um público mais focado."
        keywords={results.secondaryKeywords}
      />
      <KeywordTable
        title="Palavras-Chave de Cauda Longa"
        description="Consultas de pesquisa mais longas e detalhadas, muitas vezes com alta intenção de conversão e menor concorrência."
        keywords={results.longTailKeywords}
      />
    </div>
  );
};

export default ResultsDisplay;
