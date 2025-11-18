import React, { useState } from 'react';
// Fix: Added .tsx extension to icon import.
import { ArrowPathIcon } from './Icons.tsx';

interface UrlInputFormProps {
  onAnalysisStart: (url: string, businessContext: string) => void;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

const UrlInputForm: React.FC<UrlInputFormProps> = ({ onAnalysisStart, isLoading, onReset, hasResults }) => {
  const [url, setUrl] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Simple URL validation
    try {
      new URL(url);
      setError('');
      onAnalysisStart(url, businessContext);
    } catch (_) {
      setError('Por favor, insira um URL válido (ex: https://www.exemplo.com).');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 md:mb-12">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-300 mb-2">URL do Site para Análise *</label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.exemplo.com"
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all duration-200"
              disabled={isLoading}
              required
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div>
            <label htmlFor="context-input" className="block text-sm font-medium text-gray-300 mb-2">Qual o segmento ou descrição do seu negócio? (Opcional)</label>
            <textarea
              id="context-input"
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="Ex: Agência de marketing digital em São Paulo focada em SEO para pequenas empresas."
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all duration-200 resize-none"
              rows={2}
              disabled={isLoading}
            />
             <p className="text-xs text-gray-500 mt-2">Fornecer contexto ajuda a IA a ser mais precisa e evitar confusões.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto flex-grow flex items-center justify-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 transition-all duration-200 disabled:from-blue-600/50 disabled:to-cyan-500/50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Analisando...' : 'Analisar URL'}
            </button>
            {hasResults && (
                 <button
                    type="button"
                    onClick={onReset}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-3 font-semibold text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-600 transition-colors duration-200"
                    title="Começar de novo"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default UrlInputForm;