import React from 'react';
import type { TopicClusterResult, AudienceType, JourneyStage, FunnelStage } from '../types.ts';
import { ArrowLeftIcon, SparklesIcon } from './Icons.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import ErrorMessage from './ErrorMessage.tsx';

interface TopicClusterDisplayProps {
    baseKeyword: string | null;
    clusterResult: TopicClusterResult | null;
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
}

const getTagStyle = (tagType: 'audience' | 'journey' | 'funnel', value: string) => {
    switch (tagType) {
        case 'audience':
            if (value === 'B2B') return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
            if (value === 'B2C') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            return 'bg-violet-500/20 text-violet-300 border-violet-500/30'; // Ambos
        case 'journey':
            return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
        case 'funnel':
            if (value === 'Topo') return 'bg-lime-500/20 text-lime-300 border-lime-500/30';
            if (value === 'Meio') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            return 'bg-red-500/20 text-red-300 border-red-500/30'; // Fundo
        default:
            return 'bg-gray-600 text-gray-300';
    }
}

const getShortJourneyStage = (stage: JourneyStage): string => {
    switch(stage) {
        case 'Aprendizado e Descoberta': return 'Aprendizado';
        case 'Reconhecimento do Problema': return 'Reconhecimento';
        case 'Consideração da Solução': return 'Consideração';
        case 'Decisão de Compra': return 'Decisão';
        default: return stage;
    }
}

const Tag: React.FC<{ children: React.ReactNode, className: string }> = ({ children, className }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full border whitespace-nowrap ${className}`}>
        {children}
    </span>
);


const TopicClusterDisplay: React.FC<TopicClusterDisplayProps> = ({ baseKeyword, clusterResult, isLoading, error, onBack }) => {
    return (
        <div className="mt-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                     <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white mb-3 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Voltar para Análise
                    </button>
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-7 w-7 text-amber-400" />
                        <h2 className="text-3xl font-bold tracking-tight text-white">Cluster de Tópicos</h2>
                    </div>
                    <p className="text-gray-400 mt-1">Estratégia de conteúdo baseada na palavra-chave: <span className="font-semibold text-amber-300">{baseKeyword}</span></p>
                </div>
            </div>
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {clusterResult && (
                <div className="space-y-12">
                    {/* Pillar Topic */}
                    <div className="bg-gray-950/50 border border-indigo-500/30 rounded-xl shadow-2xl p-6">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-2">Tópico Pilar (Pillar Page)</h3>
                        <p className="text-2xl font-bold text-white">{clusterResult.pillarTopic}</p>
                        <p className="text-gray-400 mt-2">Este é o guia central e abrangente que conecta todos os tópicos de cluster relacionados.</p>
                    </div>

                    {/* Cluster Topics Table */}
                     <div className="bg-gray-950/50 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-white">Tópicos de Cluster (Conteúdos de Suporte)</h3>
                            <p className="text-gray-400 mt-1">Estes são os conteúdos específicos que se aprofundam em partes do tópico pilar e devem linkar de volta para ele.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">Tópico</th>
                                        <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">Público</th>
                                        <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">
                                            <span className="sm:hidden">Jornada</span>
                                            <span className="hidden sm:inline">Jornada do Cliente</span>
                                        </th>
                                        <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">Funil</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-950/50 divide-y divide-gray-800">
                                    {clusterResult.clusterTopics.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-800/50 transition-colors duration-150">
                                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">{item.topic}</td>
                                            <td className="px-3 sm:px-6 py-4 text-sm"><Tag className={getTagStyle('audience', item.audienceType)}>{item.audienceType}</Tag></td>
                                            <td className="px-3 sm:px-6 py-4 text-sm">
                                                <Tag className={getTagStyle('journey', item.journeyStage)}>
                                                    <span className="inline sm:hidden" title={item.journeyStage}>{getShortJourneyStage(item.journeyStage)}</span>
                                                    <span className="hidden sm:inline">{item.journeyStage}</span>
                                                </Tag>
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-sm"><Tag className={getTagStyle('funnel', item.funnelStage)}>{item.funnelStage}</Tag></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default TopicClusterDisplay;