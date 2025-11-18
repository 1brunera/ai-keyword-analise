import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, AnalysisResult } from '../types.ts';

const HISTORY_STORAGE_KEY = 'keywordAnalysisHistory';

export const useHistory = (): {
    history: HistoryEntry[];
    addHistoryEntry: (url: string, result: AnalysisResult) => void;
    removeHistoryEntry: (id: number) => void;
    clearHistory: () => void;
} => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setHistory([]);
        }
    }, []);

    const saveHistory = (newHistory: HistoryEntry[]) => {
        try {
            // Limit history size to prevent localStorage from getting too large
            const limitedHistory = newHistory.slice(0, 20);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
            setHistory(limitedHistory);
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    };

    const addHistoryEntry = useCallback((url: string, result: AnalysisResult) => {
        const newEntry: HistoryEntry = {
            id: Date.now(),
            url,
            result
        };
        // Add the new entry to the top of the list
        saveHistory([newEntry, ...history]);
    }, [history]);

    const removeHistoryEntry = useCallback((id: number) => {
        const updatedHistory = history.filter(entry => entry.id !== id);
        saveHistory(updatedHistory);
    }, [history]);

    const clearHistory = useCallback(() => {
        saveHistory([]);
    }, []);

    return { history, addHistoryEntry, removeHistoryEntry, clearHistory };
};
