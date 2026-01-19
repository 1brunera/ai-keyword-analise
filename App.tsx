
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header.tsx';
import UrlInputForm from './components/UrlInputForm.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ErrorMessage from './components/ErrorMessage.tsx';
import ResultsDisplay from './components/ResultsDisplay.tsx';
import BusinessAnalysisDisplay from './components/BusinessAnalysisDisplay.tsx';
import HistoryDisplay from './components/HistoryDisplay.tsx';
import TopicClusterDisplay from './components/TopicClusterDisplay.tsx';
import ArticleStructureModal from './components/ArticleStructureModal.tsx';
import { analyzeUrlForKeywords, generateTopicCluster, generateArticleStructure, generateFunnelSuggestions } from './services/geminiService.ts';
import { generateCsvString } from './services/csvExporter.ts';
import { useHistory } from './services/useHistory.ts';
import type { AnalysisResult, HistoryEntry, TopicClusterResult, ArticleStructure, ContentSuggestion, FunnelStage } from './types.ts';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);
  const { history, addHistoryEntry, removeHistoryEntry, clearHistory } = useHistory();
  
  const [isClustering, setIsClustering] = useState<boolean>(false);
  const [clusteringError, setClusteringError] = useState<string | null>(null);
  const [topicClusterResult, setTopicClusterResult] = useState<TopicClusterResult | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState<string>('');

  const [isStructuring, setIsStructuring] = useState<boolean>(false);
  const [structureModalOpen, setStructureModalOpen] = useState<boolean>(false);
  const [articleStructure, setArticleStructure] = useState<ArticleStructure | null>(null);

  // Loading states for funnel suggestions
  const [loadingStages, setLoadingStages] = useState<Record<FunnelStage, boolean>>({
      'Topo': false,
      'Meio': false,
      'Fundo': false
  });

  useEffect(() => {
    if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleAnalysisStart = async (url: string, context: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalyzedUrl(null);
    setBusinessContext(context);

    try {
      const result = await analyzeUrlForKeywords(url, context);
      setAnalysisResult(result);
      setAnalyzedUrl(url);
      addHistoryEntry(url, result);
      navigate('/'); 
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSuggestions = async (stage: FunnelStage) => {
    if (!analysisResult) return;

    setLoadingStages(prev => ({ ...prev, [stage]: true }));
    
    try {
        const suggestions = await generateFunnelSuggestions(stage, businessContext, analysisResult.businessAnalysis.summary);
        
        // Update state immutably
        const updatedResult: AnalysisResult = {
            ...analysisResult,
            contentSuggestions: {
                ...analysisResult.contentSuggestions,
                [stage === 'Topo' ? 'topOfFunnel' : stage === 'Meio' ? 'middleOfFunnel' : 'bottomOfFunnel']: suggestions
            }
        };

        setAnalysisResult(updatedResult);
        // Optionally update history (be careful with complexity, maybe just update current view)
    } catch (err: any) {
        alert(err.message || `Erro ao gerar sugestões para ${stage}`);
    } finally {
        setLoadingStages(prev => ({ ...prev, [stage]: false }));
    }
  };

  const handleClusterRequest = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setIsClustering(true);
    setClusteringError(null);
    setTopicClusterResult(null);
    
    navigate(`/cluster/${encodeURIComponent(keyword)}`);

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
    setTopicClusterResult(null);
    setClusteringError(null);
    setSelectedKeyword(null);
    setBusinessContext('');
    setLoadingStages({ 'Topo': false, 'Meio': false, 'Fundo': false });
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setError(null);
    setIsLoading(false);
    setAnalysisResult(entry.result);
    setAnalyzedUrl(entry.url);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAnalysis = () => {
      navigate('/');
      setTopicClusterResult(null);
      setClusteringError(null);
      setSelectedKeyword(null);
  }

  const handleExport = () => {
    if (!analysisResult || !analyzedUrl) return;
    const csvContent = generateCsvString(analysisResult);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    let filename = `analise-${new URL(analyzedUrl).hostname.replace(/\./g, '_')}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Header />
        
        <Routes>
          <Route path="/" element={
            <>
              <UrlInputForm 
                  onAnalysisStart={handleAnalysisStart} 
                  isLoading={isLoading}
                  onReset={handleReset}
                  hasResults={!!analysisResult}
              />

              {isLoading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              
              {analysisResult && (
                <div className="mt-12 animate-fade-in">
                  <BusinessAnalysisDisplay 
                    analysis={analysisResult.businessAnalysis} 
                    onExport={handleExport}
                  />
                  <ResultsDisplay 
                      results={analysisResult.keywordResults}
                      suggestions={analysisResult.contentSuggestions}
                      onClusterRequest={handleClusterRequest}
                      onStructureRequest={handleStructureRequest}
                      onGenerateSuggestions={handleGenerateSuggestions}
                      loadingStages={loadingStages}
                  />
                </div>
              )}

              {history.length > 0 && !isLoading && (
                  <HistoryDisplay
                      history={history}
                      onSelect={handleSelectHistory}
                      onDelete={removeHistoryEntry}
                      onClear={clearHistory}
                  />
              )}
            </>
          } />

          <Route path="/cluster/:keyword" element={
            <TopicClusterDisplay
                baseKeyword={selectedKeyword}
                clusterResult={topicClusterResult}
                isLoading={isClustering}
                error={clusteringError}
                onBack={handleBackToAnalysis}
            />
          } />
        </Routes>
      </main>
      
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
