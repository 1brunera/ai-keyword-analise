
import React, { useState } from 'react';
import type { ArticleStructure } from '../types.ts';
import { DocumentTextIcon, ClipboardDocumentIcon, CheckIcon } from './Icons.tsx';

interface ArticleStructureModalProps {
    structure: ArticleStructure | null;
    isLoading: boolean;
    onClose: () => void;
}

const ArticleStructureModal: React.FC<ArticleStructureModalProps> = ({ structure, isLoading, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!structure && !isLoading) return null;

    const handleCopy = () => {
        if (!structure) return;

        const text = `
H1: ${structure.h1}

Introdução:
${structure.introduction_brief}

Estrutura:
${structure.outline.map(item => `${item.level === 'H2' ? '##' : '###'} ${item.heading}\n${item.content_brief}`).join('\n\n')}

Conclusão:
${structure.conclusion_brief}
        `.trim();

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
            // Fallback for environments where navigator.clipboard might fail
            alert("Não foi possível copiar automaticamente. Por favor, selecione o texto e copie manualmente.");
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950">
                    <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">Estrutura do Artigo</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 flex-grow custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-400 animate-pulse">Criando a estrutura perfeita para seu artigo...</p>
                        </div>
                    ) : structure ? (
                        <div className="space-y-8 text-gray-300">
                            {/* H1 Section */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 block">H1 - Título Principal</span>
                                <h1 className="text-2xl font-bold text-white">{structure.h1}</h1>
                            </div>

                            {/* Introduction */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2 border-b border-gray-800 pb-1">Introdução</h4>
                                <p className="leading-relaxed">{structure.introduction_brief}</p>
                            </div>

                            {/* Outline */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4 border-b border-gray-800 pb-1">Estrutura de Tópicos</h4>
                                <div className="space-y-4">
                                    {structure.outline.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-3 rounded-lg border ${
                                                item.level === 'H2' 
                                                ? 'bg-gray-800/50 border-gray-700' 
                                                : 'ml-6 bg-gray-900/50 border-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    item.level === 'H2' 
                                                    ? 'bg-blue-500/20 text-blue-300' 
                                                    : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                    {item.level}
                                                </span>
                                                <h5 className={`font-semibold ${item.level === 'H2' ? 'text-white' : 'text-gray-200'}`}>
                                                    {item.heading}
                                                </h5>
                                            </div>
                                            <p className="text-sm text-gray-400 pl-1">{item.content_brief}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             {/* Conclusion */}
                             <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2 border-b border-gray-800 pb-1">Conclusão</h4>
                                <p className="leading-relaxed">{structure.conclusion_brief}</p>
                            </div>
                        </div>
                    ) : null}
                </div>
                
                {/* Footer */}
                {!isLoading && (
                    <div className="p-4 border-t border-gray-800 bg-gray-950 flex flex-wrap justify-between items-center gap-3">
                        {structure && (
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border ${
                                    copied 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent'
                                }`}
                            >
                                {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                                {copied ? 'Copiado!' : 'Copiar Estrutura'}
                            </button>
                        )}
                         <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors ml-auto"
                        >
                            Fechar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleStructureModal;
