import React from 'react';
// Fix: Added .ts extension to the import path.
import type { Keyword, KeywordIntent } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { SparklesIcon } from './Icons.tsx';

interface KeywordTableProps {
  title: string;
  description: string;
  keywords: Keyword[];
  onClusterRequest?: (keyword: string) => void;
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 30) return 'bg-green-500';
  if (difficulty <= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getDifficultyTooltip = (difficulty: number): string => {
  if (difficulty <= 30) return `Baixa (${difficulty}): Relativamente fácil de ranquear.`;
  if (difficulty <= 60) return `Média (${difficulty}): Requer esforço e conteúdo de qualidade.`;
  return `Alta (${difficulty}): Muito competitivo, difícil de ranquear.`;
};

const getIntentStyle = (intent: KeywordIntent): { badge: string; tooltip: string } => {
    switch (intent) {
      case 'Transacional':
        return { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', tooltip: 'O usuário deseja realizar uma ação, como comprar um produto.' };
      case 'Informativa':
        return { badge: 'bg-green-500/20 text-green-300 border-green-500/30', tooltip: 'O usuário está procurando informações ou respostas para uma pergunta.' };
      case 'Comercial':
        return { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', tooltip: 'O usuário está investigando produtos ou serviços antes de uma possível compra.' };
      case 'Navegacional':
        return { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', tooltip: 'O usuário está tentando encontrar um site ou página específica.' };
      default:
        return { badge: 'bg-gray-600 text-gray-300', tooltip: 'Intenção não especificada.' };
    }
};


const KeywordTable: React.FC<KeywordTableProps> = ({ title, description, keywords, onClusterRequest }) => {
  if (!keywords || keywords.length === 0) {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 mb-6">{description}</p>
            <p className="text-center text-gray-500 py-8">Nenhuma palavra-chave encontrada para esta categoria.</p>
        </div>
    );
  }
  
  return (
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">
                Palavra-chave
              </th>
               <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">
                Intenção
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">
                KD %
              </th>
              <th scope="col" className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-white">
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-950/50 divide-y divide-gray-800">
            {keywords.map((kw, index) => (
              <tr key={index} className="hover:bg-gray-800/50 transition-colors duration-150">
                <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">
                    {onClusterRequest ? (
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <span className="break-words">{kw.keyword}</span>
                            <button
                                onClick={() => onClusterRequest(kw.keyword)}
                                className="flex-shrink-0 flex items-center sm:gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-md px-2 py-2 sm:px-2.5 sm:py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500"
                                title={`Gerar cluster de tópicos para "${kw.keyword}"`}
                            >
                                <SparklesIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Clusterizar</span>
                            </button>
                        </div>
                    ) : (
                        <span className="break-words">{kw.keyword}</span>
                    )}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="group relative inline-block">
                    <span className={`px-2 sm:px-2.5 py-1 text-xs font-semibold leading-5 rounded-full border ${getIntentStyle(kw.intent).badge}`}>
                      <span className="inline sm:hidden" title={kw.intent}>{kw.intent.charAt(0)}</span>
                      <span className="hidden sm:inline">{kw.intent}</span>
                    </span>
                     <div className="absolute bottom-full mb-2 hidden group-hover:block w-max max-w-xs bg-black text-white text-xs rounded py-1.5 px-3 z-10 border border-gray-700 shadow-lg text-center">
                      {getIntentStyle(kw.intent).tooltip}
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center gap-2 group relative">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className={`${getDifficultyColor(kw.difficulty)} h-2.5 rounded-full`} style={{ width: `${kw.difficulty}%` }}></div>
                    </div>
                    <span className="font-semibold w-10 text-right">{kw.difficulty}</span>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1.5 px-3 z-10 border border-gray-700 shadow-lg whitespace-nowrap">
                      {getDifficultyTooltip(kw.difficulty)}
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{kw.volume.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeywordTable;