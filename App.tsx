
import React, { useState } from 'react';
// Fix: Added .tsx extension to component imports.
import Header from './components/Header.tsx';
import UrlInputForm from './components/UrlInputForm.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ErrorMessage from './components/ErrorMessage.tsx';
import ResultsDisplay from './components/ResultsDisplay.tsx';
import BusinessAnalysisDisplay from './components/BusinessAnalysisDisplay.tsx';
import HistoryDisplay from './components/HistoryDisplay.tsx';
import TopicClusterDisplay from './components/TopicClusterDisplay.tsx';
import ContentSuggestionsDisplay from './components/ContentSuggestionsDisplay.tsx';
import ArticleStructureModal from './components/ArticleStructureModal.tsx';
// Fix: Added .ts extension to service and type imports.
import { analyzeUrlForKeywords, generateTopicCluster, generateArticleStructure } from './services/geminiService.ts';
import { generateCsvString } from './services/csvExporter.ts';
import { useHistory } from './services/useHistory.ts';
import type { AnalysisResult, HistoryEntry, TopicClusterResult, ArticleStructure, ContentSuggestion } from './types.ts';

type View = 'analysis' | 'clustering';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);
  const { history, addHistoryEntry, removeHistoryEntry, clearHistory } = useHistory();
  
  // New state for view management and clustering
  const [view, setView] = useState<View>('analysis');
  const [isClustering, setIsClustering] = useState<boolean>(false);
  const [clusteringError, setClusteringError] = useState<string | null>(null);
  const [topicClusterResult, setTopicClusterResult] = useState<TopicClusterResult | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState<string>('');

  // State for Article Structuring
  const [isStructuring, setIsStructuring] = useState<boolean>(false);
  const [structureModalOpen, setStructureModalOpen] = useState<boolean>(false);
  const [articleStructure, setArticleStructure] = useState<ArticleStructure | null>(null);


  const handleAnalysisStart = async (url: string, context: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalyzedUrl(null);
    setBusinessContext(context); // Save context for clustering

    try {
      const result = await analyzeUrlForKeywords(url, context);
      setAnalysisResult(result);
      setAnalyzedUrl(url);
      addHistoryEntry(url, result);
      setView('analysis'); // Ensure view is analysis
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClusterRequest = async (keyword: string) => {
    setView('clustering');
    setSelectedKeyword(keyword);
    setIsClustering(true);
    setClusteringError(null);
    setTopicClusterResult(null);

    try {
        const result = await generateTopicCluster(keyword, businessContext);
        setTopicClusterResult(result);
    } catch(err: any) {
        setClusteringError(err.message || 'Ocorreu um erro desconhecido na clusterização.');
    } finally {
        setIsClustering(false);
    }
  };

  const handleStructureRequest = async (suggestion: ContentSuggestion) => {
      setStructureModalOpen(true);
      setIsStructuring(true);
      setArticleStructure(null);

      try {
          const structure = await generateArticleStructure(suggestion.title, suggestion.brief, businessContext);
          setArticleStructure(structure);
      } catch (err: any) {
          // Just show alert for now in modal context or handle gracefully
          alert(err.message || "Erro ao gerar estrutura.");
          setStructureModalOpen(false);
      } finally {
          setIsStructuring(false);
      }
  }
  
  const handleReset = () => {
    setIsLoading(false);
    setError(null);
    setAnalysisResult(null);
    setAnalyzedUrl(null);
    setView('analysis');
    setTopicClusterResult(null);
    setClusteringError(null);
    setSelectedKeyword(null);
    setBusinessContext('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setError(null);
    setIsLoading(false);
    setAnalysisResult(entry.result);
    setAnalyzedUrl(entry.url);
    setView('analysis'); // Go back to analysis view when loading history
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAnalysis = () => {
      setView('analysis');
      setTopicClusterResult(null);
      setClusteringError(null);
      setSelectedKeyword(null);
  }

  const handleExport = () => {
    if (!analysisResult || !analyzedUrl) return;

    const csvContent = generateCsvString(analysisResult);
    // Add BOM for UTF-8 compatibility with Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    let filename = 'analise-palavras-chave.csv';
    try {
        const urlObject = new URL(analyzedUrl);
        const hostname = urlObject.hostname.replace(/^www\./, '');
        filename = `analise-${hostname.replace(/\./g, '_')}.csv`;
    } catch(e) {
        console.warn("Could not generate filename from URL", e);
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Header />
        
        {/* Hide form when in clustering view for focus */}
        {view === 'analysis' && (
            <UrlInputForm 
                onAnalysisStart={handleAnalysisStart} 
                isLoading={isLoading}
                onReset={handleReset}
                hasResults={!!analysisResult}
            />
        )}

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        
        {view === 'analysis' && analysisResult && (
          <div className="mt-12 animate-fade-in">
            <BusinessAnalysisDisplay 
              analysis={analysisResult.businessAnalysis} 
              onExport={handleExport}
            />
            <ResultsDisplay 
                results={analysisResult.keywordResults}
                onClusterRequest={handleClusterRequest}
            />
            {analysisResult.contentSuggestions && (
                <ContentSuggestionsDisplay 
                    suggestions={analysisResult.contentSuggestions} 
                    onStructureRequest={handleStructureRequest}
                />
            )}
          </div>
        )}

        {view === 'clustering' && (
            <TopicClusterDisplay
                baseKeyword={selectedKeyword}
                clusterResult={topicClusterResult}
                isLoading={isClustering}
                error={clusteringError}
                onBack={handleBackToAnalysis}
            />
        )}

        {history.length > 0 && !isLoading && view === 'analysis' && (
            <HistoryDisplay
                history={history}
                onSelect={handleSelectHistory}
                onDelete={removeHistoryEntry}
                onClear={clearHistory}
            />
        )}
      </main>
      
      {/* Modal for Article Structure */}
      {structureModalOpen && (
          <ArticleStructureModal 
              structure={articleStructure}
              isLoading={isStructuring}
              onClose={() => setStructureModalOpen(false)}
          />
      )}

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>
          Criado por <a href="https://www.linkedin.com/in/brunosergiosilva/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 transition-colors">Bruno Sergio</a> com a API Google Gemini.
        </p>
      </footer>
    </div>
  );
}

export default App;
