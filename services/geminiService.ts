
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, TopicClusterResult, ArticleStructure } from '../types.ts';

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to extract JSON from a string that might have markdown fences
const extractJson = (text: string): any => {
    // Look for a JSON code block or a raw JSON object.
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
    const match = text.match(jsonRegex);

    if (match) {
        // Prefer the content within ```json ... ```, otherwise take the raw object.
        const jsonString = match[1] || match[2];
        if (jsonString) {
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse extracted JSON:", e);
                throw new Error("A IA retornou um JSON malformado.");
            }
        }
    }
    
    // As a fallback, try to parse the whole string if it looks like JSON.
    try {
        return JSON.parse(text);
    } catch(e) {
        console.error("Failed to parse text as JSON:", text);
        throw new Error("A IA não retornou um JSON válido ou reconhecível.");
    }
};

export const analyzeUrlForKeywords = async (url: string, businessContext: string): Promise<AnalysisResult> => {
  try {
    const contextPrompt = businessContext
      ? `
        **Contexto Essencial do Negócio (Fornecido pelo Usuário - PRIORIDADE MÁXIMA):**
        ---
        ${businessContext}
        ---
        Use este contexto como o filtro principal para sua análise. Ele tem prioridade sobre qualquer informação ambígua que você encontrar. Se o conteúdo da URL parecer contradizer este contexto, confie no contexto fornecido pelo usuário.
      `
      : '';

    const prompt = `
        Sua tarefa é realizar uma análise de SEO detalhada e gerar sugestões de conteúdo estratégico com base em duas fontes de informação:
        1.  **A URL fornecida:** ${url}
        2.  **O Contexto do Negócio fornecido pelo usuário (se houver).**

        ${contextPrompt}

        Use a ferramenta de pesquisa do Google para encontrar o conteúdo *indexado e diretamente relacionado* à URL, sempre interpretando os resultados através da lente do **Contexto do Negócio** (se fornecido).

        **Instruções Críticas:**
        1.  **Foco na URL e no Contexto:** Baseie TODA a sua análise na combinação do conteúdo da URL e do contexto fornecido. O contexto é o seu guia para evitar confusões.
        2.  **NÃO Use Concorrentes:** Se a busca retornar informações de concorrentes (mesmo com nomes parecidos), IGNORE-AS. Sua análise deve refletir o conteúdo, produtos e serviços *realmente descritos na página da URL*, conforme o contexto do negócio.

        Com base nesta análise focada, forneça o seguinte:

        1.  **Análise do Negócio**:
            *   **Resumo do Negócio**: Um resumo conciso do que a empresa faz, seus principais produtos ou serviços, conforme descrito na PÁGINA ESPECÍFICA e alinhado ao CONTEXTO.
            *   **Público-Alvo**: Descreva o público-alvo ideal para os produtos/serviços nesta PÁGINA.
            *   **Tom de Voz**: Descreva o tom de voz e o estilo de comunicação usados nesta PÁGINA.

        2.  **Análise de Palavras-chave**:
            *   **Palavras-chave Primárias**: Pelo menos 15 palavras-chave de cauda curta e alto volume que representam o núcleo do negócio descrito na PÁGINA.
            *   **Palavras-chave Secundárias**: Pelo menos 15 palavras-chave de cauda média, mais específicas que as primárias, relacionadas à PÁGINA.
            *   **Palavras-chave de Cauda Longa**: Pelo menos 15 frases de pesquisa mais longas e específicas que indicam alta intenção do usuário, baseadas no conteúdo da PÁGINA.

        3.  **Sugestões de Pauta para Artigos (Blog)**:
            Gere sugestões de títulos e resumos para artigos que cubram toda a jornada do cliente:
            *   **Topo de Funil (Top of Funnel)**: Exatamente **10** sugestões focadas em atração, aprendizado e descoberta (problemas gerais, curiosidades, "o que é").
            *   **Meio de Funil (Middle of Funnel)**: Exatamente **10** sugestões focadas em consideração e reconhecimento do problema (comparativos, listas de soluções, "como escolher").
            *   **Fundo de Funil (Bottom of Funnel)**: Exatamente **10** sugestões focadas em decisão de compra e conversão (casos de uso específicos, benefícios diretos do produto/serviço, prova social).

        Para cada palavra-chave, forneça:
        *   **keyword**: A palavra-chave ou frase.
        *   **intent**: A intenção de busca. Os valores possíveis são: 'Transacional', 'Informativa', 'Comercial', 'Navegacional'.
        *   **difficulty**: Uma pontuação estimada de dificuldade de SEO de 0 a 100.
        *   **volume**: O volume de busca mensal estimado para os últimos 30 dias.

        Para cada sugestão de artigo, forneça:
        *   **title**: Um título chamativo e otimizado para SEO.
        *   **brief**: Um resumo breve (1-2 frases) do que o artigo deve abordar.

        Retorne um único objeto JSON válido. NÃO inclua nenhum texto, explicação ou formatação markdown (como \`\`\`json) fora do objeto JSON.
        O objeto JSON deve ter a seguinte estrutura estrita:
        {
          "businessAnalysis": {
            "summary": "...",
            "targetAudience": "...",
            "toneOfVoice": "..."
          },
          "keywordResults": {
            "primaryKeywords": [{"keyword": "...", "intent": "...", "difficulty": ..., "volume": ...}],
            "secondaryKeywords": [...],
            "longTailKeywords": [...]
          },
          "contentSuggestions": {
            "topOfFunnel": [{"title": "...", "brief": "..."}, ...],
            "middleOfFunnel": [{"title": "...", "brief": "..."}, ...],
            "bottomOfFunnel": [{"title": "...", "brief": "..."}, ...]
          }
        }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const text = response.text.trim();
    const result = extractJson(text);

    // Basic validation to ensure the structure is what we expect.
    if (!result.businessAnalysis || !result.keywordResults || !result.contentSuggestions) {
        throw new Error("A resposta da IA está faltando a estrutura necessária (businessAnalysis, keywordResults ou contentSuggestions).");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing URL with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Falha na análise da IA: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a análise da IA.");
  }
};


export const generateTopicCluster = async (keyword: string, businessContext: string): Promise<TopicClusterResult> => {
    try {
        const contextPrompt = businessContext
          ? `
            **Contexto do Negócio (para direcionamento):**
            ---
            ${businessContext}
            ---
          `
          : '';

        const prompt = `
            Sua tarefa é criar uma estratégia de "Topic Cluster" (Cluster de Tópicos) para SEO com base em uma palavra-chave principal.

            **Palavra-chave Principal:** "${keyword}"
            ${contextPrompt}

            **Instruções:**
            1.  **Defina o Tópico Pilar (Pillar Topic):** Crie um título abrangente e principal para uma "Página Pilar" com base na palavra-chave fornecida. Este tópico deve ser amplo o suficiente para englobar vários subtópicos.
            2.  **Gere Tópicos de Cluster (Cluster Topics):** Crie uma lista de pelo menos 8 subtópicos específicos que se aprofundam em aspectos particulares do Tópico Pilar. Cada um deve ser um título de post de blog ou uma seção da página pilar.
            3.  **Categorize cada Tópico de Cluster:** Para cada subtópico, classifique-o de acordo com os seguintes critérios:
                *   **audienceType**: O tipo de público principal. Valores possíveis: 'B2B', 'B2C', 'Ambos'.
                *   **journeyStage**: A etapa da jornada do cliente em que o tópico se encaixa. Valores possíveis: 'Aprendizado e Descoberta', 'Reconhecimento do Problema', 'Consideração da Solução', 'Decisão de Compra'.
                *   **funnelStage**: O estágio do funil de conteúdo. Valores possíveis: 'Topo', 'Meio', 'Fundo'.

            Retorne um único objeto JSON válido. NÃO inclua nenhum texto, explicação ou formatação markdown (como \`\`\`json) fora do objeto JSON.
            O objeto JSON deve ter a seguinte estrutura estrita:
            {
              "pillarTopic": "...",
              "clusterTopics": [
                {
                  "topic": "...",
                  "audienceType": "...",
                  "journeyStage": "...",
                  "funnelStage": "..."
                }
              ]
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              // No google search needed here, it's a creative/structuring task
            },
        });

        const text = response.text.trim();
        const result = extractJson(text);

        if (!result.pillarTopic || !result.clusterTopics) {
            throw new Error("A resposta da IA está faltando a estrutura necessária (pillarTopic ou clusterTopics).");
        }

        return result as TopicClusterResult;

    } catch (error) {
        console.error("Error generating topic cluster with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Falha na clusterização da IA: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido durante a clusterização de tópicos.");
    }
};

export const generateArticleStructure = async (title: string, brief: string, businessContext: string): Promise<ArticleStructure> => {
    try {
         const contextPrompt = businessContext
          ? `
            **Contexto do Negócio:**
            ${businessContext}
          `
          : '';

        const prompt = `
            Você é um estrategista de conteúdo SEO experiente. Crie uma estrutura detalhada (Outline) para um artigo de blog com base nas seguintes informações:

            **Título:** "${title}"
            **Resumo da Pauta:** "${brief}"
            ${contextPrompt}

            **Objetivo:** Criar uma estrutura lógica e otimizada para leitura e SEO, utilizando a hierarquia correta de heading tags (H2, H3).

            **Requisitos:**
            1.  **H1:** Confirme o melhor título H1 (pode ser o mesmo sugerido ou uma versão melhorada).
            2.  **Introdução:** Uma breve descrição do que deve ser abordado na introdução para prender o leitor.
            3.  **Desenvolvimento (H2 e H3):** Crie **pelo menos 6 seções principais (H2)**. Adicione subtópicos (H3) dentro dos H2s sempre que necessário para aprofundar o conteúdo. A profundidade é importante.
            4.  **Conclusão:** Uma breve descrição do que deve ser abordado na conclusão (chamada para ação, resumo).

            Retorne APENAS um objeto JSON válido com a seguinte estrutura exata (sem markdown):
            {
                "h1": "Título Otimizado",
                "introduction_brief": "O que escrever na introdução...",
                "outline": [
                    {
                        "level": "H2",
                        "heading": "Título da Seção",
                        "content_brief": "O que abordar nesta seção..."
                    },
                    {
                        "level": "H3",
                        "heading": "Título do Subtópico",
                        "content_brief": "Detalhes do subtópico..."
                    }
                ],
                "conclusion_brief": "O que escrever na conclusão..."
            }
            
            Nota: A lista "outline" deve conter os H2 e H3 na ordem correta de leitura.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text.trim();
        const result = extractJson(text);
        
        if (!result.h1 || !result.outline) {
             throw new Error("A resposta da IA está incompleta.");
        }

        return result as ArticleStructure;

    } catch (error) {
        console.error("Error generating article structure:", error);
        if (error instanceof Error) {
            throw new Error(`Falha ao estruturar artigo: ${error.message}`);
        }
        throw new Error("Erro desconhecido ao estruturar artigo.");
    }
}
