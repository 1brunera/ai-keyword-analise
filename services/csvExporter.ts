import type { AnalysisResult, Keyword, ContentSuggestion } from '../types.ts';

const escapeCsvCell = (cellData: string | number): string => {
    const stringData = String(cellData);
    // If the string contains a comma, a double quote, or a newline, wrap it in double quotes.
    if (/[",\n]/.test(stringData)) {
        // Also, double up any existing double quotes.
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
};

const createKeywordRows = (keywords: Keyword[], type: string): string[] => {
    if (!keywords || keywords.length === 0) return [];
    return keywords.map(kw => [
        escapeCsvCell(type),
        escapeCsvCell(kw.keyword),
        escapeCsvCell(kw.intent),
        escapeCsvCell(kw.difficulty),
        escapeCsvCell(kw.volume)
    ].join(','));
};

const createContentSuggestionRows = (suggestions: ContentSuggestion[], funnelStage: string): string[] => {
    if (!suggestions || suggestions.length === 0) return [];
    return suggestions.map(item => [
        escapeCsvCell(funnelStage),
        escapeCsvCell(item.title),
        escapeCsvCell(item.brief)
    ].join(','));
}

export const generateCsvString = (data: AnalysisResult): string => {
    const csvRows: string[] = [];

    // Business Analysis Section
    csvRows.push('"Análise do Negócio"');
    csvRows.push(`"Resumo do Negócio",${escapeCsvCell(data.businessAnalysis.summary)}`);
    csvRows.push(`"Público-Alvo",${escapeCsvCell(data.businessAnalysis.targetAudience)}`);
    csvRows.push(`"Tom de Voz",${escapeCsvCell(data.businessAnalysis.toneOfVoice)}`);
    csvRows.push(''); // Blank line separator

    // Keyword Section
    csvRows.push('"Análise de Palavras-chave"');
    const header = ['Tipo', 'Palavra-chave', 'Intenção', 'Dificuldade (0-100)', 'Volume de Busca Mensal'];
    csvRows.push(header.join(','));

    // Add keywords
    const primaryRows = createKeywordRows(data.keywordResults.primaryKeywords, 'Primária');
    const secondaryRows = createKeywordRows(data.keywordResults.secondaryKeywords, 'Secundária');
    const longTailRows = createKeywordRows(data.keywordResults.longTailKeywords, 'Cauda Longa');

    const allKeywordRows = [...primaryRows, ...secondaryRows, ...longTailRows];
    csvRows.push(...allKeywordRows);

    csvRows.push(''); // Blank line separator

    // Content Suggestions Section
    if (data.contentSuggestions) {
        csvRows.push('"Sugestões de Pauta para Blog"');
        const contentHeader = ['Etapa do Funil', 'Título Sugerido', 'Resumo da Pauta'];
        csvRows.push(contentHeader.join(','));

        const topRows = createContentSuggestionRows(data.contentSuggestions.topOfFunnel, 'Topo de Funil');
        const middleRows = createContentSuggestionRows(data.contentSuggestions.middleOfFunnel, 'Meio de Funil');
        const bottomRows = createContentSuggestionRows(data.contentSuggestions.bottomOfFunnel, 'Fundo de Funil');

        csvRows.push(...topRows, ...middleRows, ...bottomRows);
    }

    return csvRows.join('\n');
};