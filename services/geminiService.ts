
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, TopicClusterResult, ArticleStructure, ContentSuggestion, FunnelStage } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é um Engenheiro de SEO Sênior e Estrategista de Conteúdo. 
Sua especialidade é analisar sites e extrair intenções de busca valiosas.
Ao receber uma URL, use a ferramenta de busca para entender o negócio.
IMPORTANTE: Retorne APENAS o JSON puro. Não use blocos de código Markdown (Ex: \`\`\`json). Não inclua textos introdutórios.`;

// Helper function to clean AI response before parsing
const cleanJsonText = (text: string): string => {
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present (```json or ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '');
  }
  
  // Find the first '{' and the last '}' to extract just the JSON object
  const firstOpenBrace = cleaned.indexOf('{');
  const lastCloseBrace = cleaned.lastIndexOf('}');
  
  if (firstOpenBrace !== -1 && lastCloseBrace !== -1) {
    cleaned = cleaned.substring(firstOpenBrace, lastCloseBrace + 1);
  }

  return cleaned.trim();
};

export const analyzeUrlForKeywords = async (url: string, businessContext: string): Promise<AnalysisResult> => {
  try {
    const contextPrompt = businessContext ? `CONTEXTO ADICIONAL DO NEGÓCIO: ${businessContext}` : '';

    const prompt = `
        ANALISE A URL: ${url}
        ${contextPrompt}
        
        TAREFAS:
        1. Resuma o negócio, público e tom de voz.
        2. Identifique exatamente 10 palavras-chave primárias (alto volume, competitivas).
        3. Identifique exatamente 10 palavras-chave secundárias (específicas).
        4. Identifique exatamente 10 palavras-chave de cauda longa (conversão).

        REQUISITOS TÉCNICOS:
        - Use a ferramenta googleSearch para ler o conteúdo da URL.
        - Se o site estiver inacessível, baseie-se no nome do domínio e no contexto fornecido.
        - Garanta que o JSON seja válido e completo.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{googleSearch: {}}],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    businessAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            targetAudience: { type: Type.STRING },
                            toneOfVoice: { type: Type.STRING }
                        },
                        required: ["summary", "targetAudience", "toneOfVoice"]
                    },
                    keywordResults: {
                        type: Type.OBJECT,
                        properties: {
                            primaryKeywords: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        keyword: { type: Type.STRING },
                                        intent: { type: Type.STRING },
                                        difficulty: { type: Type.NUMBER },
                                        volume: { type: Type.NUMBER }
                                    },
                                    required: ["keyword", "intent", "difficulty", "volume"]
                                }
                            },
                            secondaryKeywords: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        keyword: { type: Type.STRING },
                                        intent: { type: Type.STRING },
                                        difficulty: { type: Type.NUMBER },
                                        volume: { type: Type.NUMBER }
                                    },
                                    required: ["keyword", "intent", "difficulty", "volume"]
                                }
                            },
                            longTailKeywords: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        keyword: { type: Type.STRING },
                                        intent: { type: Type.STRING },
                                        difficulty: { type: Type.NUMBER },
                                        volume: { type: Type.NUMBER }
                                    },
                                    required: ["keyword", "intent", "difficulty", "volume"]
                                }
                            }
                        },
                        required: ["primaryKeywords", "secondaryKeywords", "longTailKeywords"]
                    }
                },
                required: ["businessAnalysis", "keywordResults"]
            }
        },
    });

    if (!response.text) {
        throw new Error("A IA retornou uma resposta vazia.");
    }

    const cleanedText = cleanJsonText(response.text);
    return JSON.parse(cleanedText) as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis Failed. Raw Error:", error);
    
    if (error.message?.includes("safety")) {
        throw new Error("A análise foi bloqueada por filtros de segurança. Tente uma URL diferente.");
    }
    
    throw new Error(`Falha na análise. Verifique a URL e o contexto. (Detalhe: ${error.message})`);
  }
};

export const generateFunnelSuggestions = async (stage: FunnelStage, businessContext: string, businessSummary: string): Promise<ContentSuggestion[]> => {
    try {
        const prompt = `
            Com base neste resumo de negócio: "${businessSummary}".
            Contexto Adicional: "${businessContext}".
            
            Gere exatamente 10 sugestões de pauta para blog focadas na etapa do funil: ${stage}.
            As sugestões devem ser altamente relevantes e estratégicas para SEO.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "Você é um estrategista de conteúdo. Retorne apenas JSON limpo.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    brief: { type: Type.STRING }
                                },
                                required: ["title", "brief"]
                            }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });

        if (!response.text) throw new Error("Resposta vazia da IA");
        const cleanedText = cleanJsonText(response.text);
        const result = JSON.parse(cleanedText);
        return result.suggestions as ContentSuggestion[];

    } catch (error) {
        console.error("Error generating funnel suggestions:", error);
        throw new Error(`Erro ao gerar sugestões para ${stage}.`);
    }
};

export const generateTopicCluster = async (keyword: string, businessContext: string): Promise<TopicClusterResult> => {
    try {
        const prompt = `Crie uma estratégia de Topic Cluster para a palavra-chave: "${keyword}". Contexto: ${businessContext}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "Você é um especialista em arquitetura de informação e SEO. Retorne apenas JSON limpo.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pillarTopic: { type: Type.STRING },
                        clusterTopics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    topic: { type: Type.STRING },
                                    audienceType: { type: Type.STRING },
                                    journeyStage: { type: Type.STRING },
                                    funnelStage: { type: Type.STRING }
                                },
                                required: ["topic", "audienceType", "journeyStage", "funnelStage"]
                            }
                        }
                    },
                    required: ["pillarTopic", "clusterTopics"]
                }
            }
        });
        
        if (!response.text) throw new Error("Resposta vazia da IA");
        const cleanedText = cleanJsonText(response.text);
        return JSON.parse(cleanedText) as TopicClusterResult;
    } catch (error) {
        console.error("Error generating cluster:", error);
        throw new Error("Erro ao gerar cluster de tópicos.");
    }
};

export const generateArticleStructure = async (title: string, brief: string, businessContext: string): Promise<ArticleStructure> => {
    try {
        const prompt = `Crie a estrutura de um artigo de blog. Título: "${title}". Resumo: "${brief}". Contexto: ${businessContext}. Use pelo menos 6 H2.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "Você é um redator SEO especialista. Retorne apenas JSON limpo.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        h1: { type: Type.STRING },
                        introduction_brief: { type: Type.STRING },
                        outline: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    level: { type: Type.STRING },
                                    heading: { type: Type.STRING },
                                    content_brief: { type: Type.STRING }
                                },
                                required: ["level", "heading", "content_brief"]
                            }
                        },
                        conclusion_brief: { type: Type.STRING }
                    },
                    required: ["h1", "introduction_brief", "outline", "conclusion_brief"]
                }
            }
        });

        if (!response.text) throw new Error("Resposta vazia da IA");
        const cleanedText = cleanJsonText(response.text);
        return JSON.parse(cleanedText) as ArticleStructure;
    } catch (error) {
        console.error("Error generating structure:", error);
        throw new Error("Erro ao gerar estrutura do artigo.");
    }
};
