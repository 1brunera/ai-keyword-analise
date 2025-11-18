import React from 'react';
// Fix: Added .ts extension to the import path.
import type { BusinessAnalysis } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { LightbulbIcon, ArrowDownTrayIcon } from './Icons.tsx';

interface BusinessAnalysisDisplayProps {
  analysis: BusinessAnalysis;
  onExport: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-indigo-400 mb-2">{title}</h3>
        <p className="text-gray-300">{children}</p>
    </div>
);


const BusinessAnalysisDisplay: React.FC<BusinessAnalysisDisplayProps> = ({ analysis, onExport }) => {
  return (
    <div className="mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <LightbulbIcon className="h-7 w-7 text-amber-400" />
                <h2 className="text-3xl font-bold tracking-tight text-white">Análise do Negócio com IA</h2>
            </div>
            <button
              onClick={onExport}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Exportar CSV</span>
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Resumo do Negócio">
                {analysis.summary}
            </InfoCard>
            <InfoCard title="Público-Alvo">
                {analysis.targetAudience}
            </InfoCard>
            <InfoCard title="Tom de Voz">
                {analysis.toneOfVoice}
            </InfoCard>
        </div>
    </div>
  );
};

export default BusinessAnalysisDisplay;
