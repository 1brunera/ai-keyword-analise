
import React from 'react';
import type { ContentSuggestions, ContentSuggestion } from '../types.ts';
import { DocumentTextIcon, SparklesIcon } from './Icons.tsx';

interface ContentSuggestionsDisplayProps {
  suggestions: ContentSuggestions;
  onStructureRequest: (suggestion: ContentSuggestion) => void;
}

const SuggestionCard: React.FC<{ 
    suggestion: ContentSuggestion; 
    index: number; 
    colorClass: string;
    onStructure: (suggestion: ContentSuggestion) => void;
}> = ({ suggestion, index, colorClass, onStructure }) => (
    <div className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-lg flex flex-col h-full">
        <div className="flex items-start gap-3 flex-grow">
            <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${colorClass} bg-opacity-20`}>
                {index + 1}
            </span>
            <div>
                <h4 className="text-white font-medium mb-1">{suggestion.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{suggestion.brief}</p>
            </div>
        </div>
        <div className="mt-4 pl-9">
            <button 
                onClick={() => onStructure(suggestion)}
                className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-md px-3 py-1.5 w-full sm:w-auto justify-center sm:justify-start"
            >
                <SparklesIcon className="h-3 w-3" />
                Estruturar Artigo
            </button>
        </div>
    </div>
);

const FunnelSection: React.FC<{ 
    title: string; 
    description: string; 
    items: ContentSuggestion[]; 
    badgeColor: string;
    onStructure: (suggestion: ContentSuggestion) => void;
}> = ({ title, description, items, badgeColor, onStructure }) => (
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
        <div className="p-6 border-b border-gray-800 bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {title}
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700`}>
                        {items.length} sugestões
                    </span>
                </h3>
            </div>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="p-6 grid gap-4 content-start flex-grow">
            {items.length > 0 ? (
                items.map((item, idx) => (
                    <SuggestionCard 
                        key={idx} 
                        suggestion={item} 
                        index={idx} 
                        colorClass={badgeColor}
                        onStructure={onStructure}
                    />
                ))
            ) : (
                <p className="text-gray-500 italic text-center py-4">Nenhuma sugestão disponível.</p>
            )}
        </div>
    </div>
);

const ContentSuggestionsDisplay: React.FC<ContentSuggestionsDisplayProps> = ({ suggestions, onStructureRequest }) => {
  if (!suggestions) return null;

  return (
    <div className="space-y-8 mt-12">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
                 <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Sugestões de Pauta para Blog</h2>
        </div>
        <p className="text-gray-400 max-w-3xl -mt-4 mb-8">
            Estratégia de conteúdo completa cobrindo todas as etapas da jornada do cliente, do descobrimento à decisão de compra.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FunnelSection 
                title="Topo de Funil" 
                description="Atração e Aprendizado. Foco em resolver dúvidas gerais e educar o público."
                items={suggestions.topOfFunnel}
                badgeColor="text-green-400 bg-green-400"
                onStructure={onStructureRequest}
            />
            <FunnelSection 
                title="Meio de Funil" 
                description="Consideração. Foco em mostrar soluções e comparar opções."
                items={suggestions.middleOfFunnel}
                badgeColor="text-yellow-400 bg-yellow-400"
                onStructure={onStructureRequest}
            />
            <FunnelSection 
                title="Fundo de Funil" 
                description="Decisão. Foco em convencer o lead de que sua solução é a melhor."
                items={suggestions.bottomOfFunnel}
                badgeColor="text-red-400 bg-red-400"
                onStructure={onStructureRequest}
            />
        </div>
    </div>
  );
};

export default ContentSuggestionsDisplay;
