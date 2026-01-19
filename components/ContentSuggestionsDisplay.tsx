
import React, { useState } from 'react';
import type { ContentSuggestions, ContentSuggestion, FunnelStage } from '../types.ts';
import { DocumentTextIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, ArrowPathIcon } from './Icons.tsx';

interface ContentSuggestionsDisplayProps {
  suggestions?: ContentSuggestions;
  onStructureRequest: (suggestion: ContentSuggestion) => void;
  onGenerateRequest: (stage: FunnelStage) => void;
  loadingStages: Record<FunnelStage, boolean>;
}

const SuggestionCard: React.FC<{ 
    suggestion: ContentSuggestion; 
    index: number; 
    colorClass: string;
    onStructure: (suggestion: ContentSuggestion) => void;
}> = ({ suggestion, index, colorClass, onStructure }) => (
    <div className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-lg flex flex-col h-full animate-fade-in">
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
    stage: FunnelStage;
    description: string; 
    items?: ContentSuggestion[]; 
    badgeColor: string;
    onStructure: (suggestion: ContentSuggestion) => void;
    onGenerate: (stage: FunnelStage) => void;
    isLoading: boolean;
}> = ({ title, stage, description, items, badgeColor, onStructure, onGenerate, isLoading }) => (
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
        <div className="p-6 border-b border-gray-800 bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {title}
                    {items && items.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700`}>
                            {items.length}
                        </span>
                    )}
                </h3>
            </div>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 flex-grow">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-400 animate-pulse">Gerando 10 ideias...</p>
                </div>
            ) : items && items.length > 0 ? (
                <div className="grid gap-4 content-start">
                     {items.map((item, idx) => (
                        <SuggestionCard 
                            key={idx} 
                            suggestion={item} 
                            index={idx} 
                            colorClass={badgeColor}
                            onStructure={onStructure}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 flex-grow text-center">
                    <p className="text-gray-500 italic mb-4">Nenhuma sugestão gerada ainda.</p>
                    <button 
                        onClick={() => onGenerate(stage)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Gerar 10 Ideias
                    </button>
                </div>
            )}
        </div>
    </div>
);

const ContentSuggestionsDisplay: React.FC<ContentSuggestionsDisplayProps> = ({ suggestions, onStructureRequest, onGenerateRequest, loadingStages }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate total loaded suggestions
  const totalSuggestions = (suggestions?.topOfFunnel?.length || 0) + (suggestions?.middleOfFunnel?.length || 0) + (suggestions?.bottomOfFunnel?.length || 0);

  return (
    <div className="space-y-8 mt-12 transition-all duration-300">
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between group p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl hover:bg-indigo-500/10 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">Sugestões de Pauta para Blog</h2>
                         {totalSuggestions > 0 && !isExpanded && (
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                                {totalSuggestions} sugestões carregadas
                            </span>
                        )}
                    </div>
                    {isExpanded && <p className="text-gray-400 max-w-3xl mt-1 text-sm sm:text-base">Gere ideias estratégicas para cada etapa do funil de vendas.</p>}
                </div>
            </div>
            <div className="text-gray-500 group-hover:text-white transition-colors">
                {isExpanded ? <ChevronUpIcon className="w-8 h-8" /> : <ChevronDownIcon className="w-8 h-8" />}
            </div>
        </button>

        {isExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <FunnelSection 
                    title="Topo de Funil" 
                    stage="Topo"
                    description="Atração. Foco em resolver dúvidas gerais e educar o público."
                    items={suggestions?.topOfFunnel}
                    badgeColor="text-green-400 bg-green-400"
                    onStructure={onStructureRequest}
                    onGenerate={onGenerateRequest}
                    isLoading={loadingStages['Topo']}
                />
                <FunnelSection 
                    title="Meio de Funil" 
                    stage="Meio"
                    description="Consideração. Foco em mostrar soluções e comparar opções."
                    items={suggestions?.middleOfFunnel}
                    badgeColor="text-yellow-400 bg-yellow-400"
                    onStructure={onStructureRequest}
                    onGenerate={onGenerateRequest}
                    isLoading={loadingStages['Meio']}
                />
                <FunnelSection 
                    title="Fundo de Funil" 
                    stage="Fundo"
                    description="Decisão. Foco em convencer o lead de que sua solução é a melhor."
                    items={suggestions?.bottomOfFunnel}
                    badgeColor="text-red-400 bg-red-400"
                    onStructure={onStructureRequest}
                    onGenerate={onGenerateRequest}
                    isLoading={loadingStages['Fundo']}
                />
            </div>
        )}
    </div>
  );
};

export default ContentSuggestionsDisplay;
