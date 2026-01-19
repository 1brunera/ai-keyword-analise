
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, TopicClusterResult, ArticleStructure } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeUrlForKeywords = async (url: string, businessContext: string): Promise<AnalysisResult> => {
  try {
    const contextPrompt = businessContext ? `Contexto do Negócio: ${businessContext}` : '';

    const prompt = `
        Realize uma análise de SEO para a URL: ${url}.
        ${contextPrompt}
        
        Gere exatamente 15 palavras-chave primárias, 15 secundárias e 15 de cauda longa.
        Gere exatamente 10 sugestões de pauta para cada etapa do funil (topo, meio, fundo).
        Baseie-se no conteúdo real da página e no contexto fornecido.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
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
                                        intent: { type: Type.STRING, description: "Transacional, Informativa, Comercial ou Navegacional" },
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
                    },
                    contentSuggestions: {
                        type: Type.OBJECT,
                        properties: {
                            topOfFunnel: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        brief: { type: Type.STRING }
                                    },
                                    required: ["title", "brief"]
                                }
                            },
                            middleOfFunnel: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        brief: { type: Type.STRING }
                                    },
                                    required: ["title", "brief"]
                                }
                            },
                            bottomOfFunnel: {
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
                        required: ["topOfFunnel", "middleOfFunnel", "bottomOfFunnel"]
                    }
                },
                required: ["businessAnalysis", "keywordResults", "contentSuggestions"]
            }
        },
    });

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    throw new Error("Falha na análise. A IA não conseguiu gerar os dados estruturados corretamente.");
  }
};

export const generateTopicCluster = async (keyword: string, businessContext: string): Promise<TopicClusterResult> => {
    try {
        const prompt = `Crie uma estratégia de Topic Cluster para a palavra-chave: "${keyword}". Contexto: ${businessContext}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
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
        return JSON.parse(response.text) as TopicClusterResult;
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
                                    level: { type: Type.STRING, description: "H2 ou H3" },
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
        return JSON.parse(response.text) as ArticleStructure;
    } catch (error) {
        console.error("Error generating structure:", error);
        throw new Error("Erro ao gerar estrutura do artigo.");
    }
};
