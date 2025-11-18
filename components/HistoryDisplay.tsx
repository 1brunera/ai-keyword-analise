import React from 'react';
// Fix: Add .ts extension
import type { HistoryEntry } from '../types.ts';
// Fix: Add .tsx extension
import { ClockIcon, TrashIcon } from './Icons.tsx';

interface HistoryDisplayProps {
    history: HistoryEntry[];
    onSelect: (entry: HistoryEntry) => void;
    onDelete: (id: number) => void;
    onClear: () => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onSelect, onDelete, onClear }) => {
    
    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(timestamp));
    };

    return (
        <div className="mt-16 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <ClockIcon className="h-7 w-7 text-cyan-400" />
                    <h2 className="text-3xl font-bold tracking-tight text-white">Histórico de Análises</h2>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
                                onClear();
                            }
                        }}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-red-900/30 rounded-md hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 transition-colors duration-200"
                    >
                        <TrashIcon className="h-4 w-4" />
                        <span>Limpar Histórico</span>
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
                {history.map(entry => (
                    <div key={entry.id} className="bg-gray-950/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4 transition-all hover:border-indigo-500/50 hover:bg-gray-900">
                        <button onClick={() => onSelect(entry)} className="flex-grow text-left min-w-0">
                            <p className="font-semibold text-indigo-400 truncate" title={entry.url}>{entry.url}</p>
                            <p className="text-sm text-gray-400">{formatDate(entry.id)}</p>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent onSelect from firing
                                onDelete(entry.id);
                            }}
                            className="p-2 flex-shrink-0 text-gray-500 rounded-full hover:bg-gray-800 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-gray-700"
                            title="Excluir item"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryDisplay;
