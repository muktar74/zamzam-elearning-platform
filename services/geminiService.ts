
import { GoogleGenAI, Type } from '@google/genai';
import { Module, QuizQuestion, AiMessage } from '../types';

// Initialize the AI client directly using the environment variable provided by Vite.
const apiKey = process.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// A helper function to ensure the client is initialized before use.
const checkAiClient = () => {
    if (!apiKey) {
        throw new Error("Could not connect to the AI service. Please ensure the VITE_API_KEY is configured correctly in your .env file.");
    }
};

interface GeneratedContent {
  description: string;
  modules: Omit<Module, 'id'>[];
}

export const generateCourseContent = async (topic: string): Promise<GeneratedContent> => {
 try {
    checkAiClient();
    const prompt = `Generate course content for a corporate e-learning platform. The topic is "${topic}".
The target audience is employees of Zamzam Bank, an Islamic financial institution.
The content should be professional, informative, and suitable for professional development in Islamic finance.
Provide a course description and 3 modules. Each module should have a title and detailed content.
Format the module content using simple HTML tags like <p>, <strong>, <ul>, and <li> for better readability.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            description: {
                type: Type.STRING,
                description: 'A comprehensive overview of the course topic.',
            },
            modules: {
                type: Type.ARRAY,
                description: 'An array of modules for the course.',
                items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                    type: Type.STRING,
                    description: 'The title of the module.',
                    },
                    content: {
                    type: Type.STRING,
                    description: 'The HTML content of the module.',
                    },
                },
                required: ['title', 'content'],
                },
            },
            },
            required: ['description', 'modules'],
        },
        },
    });

    const jsonStr = response.text.trim();
    const content: GeneratedContent = JSON.parse(jsonStr);
    return content;
 } catch (error: any) {
    console.error("Gemini API Error (generateCourseContent):", error);
    const message = (error && typeof error === 'object' && typeof error.message === 'string')
        ? error.message
        : "Failed to generate course content from AI. Please check your prompt and try again.";
    throw new Error(message);
 }
};

export const generateCourseFromText = async (documentText: string): Promise<GeneratedContent> => {
    try {
        checkAiClient();
        const prompt = `You are an expert instructional designer for Zamzam Bank, an Islamic financial institution.
        Based on the following textbook content, create a comprehensive e-learning course for bank employees.
        
        Your output must be a JSON object with:
        1. A concise and engaging "description" of the course, summarizing the key learnings.
        2. An array of 3-5 "modules". Each module must have a "title" and detailed "content". The content should be a summary of a key topic from the textbook, formatted with simple HTML (<p>, <strong>, <ul>, <li>) for readability.
        
        Textbook Content:
        ---
        ${documentText.substring(0, 30000)}
        ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for better text comprehension
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                    description: {
                        type: Type.STRING,
                        description: 'A comprehensive overview of the course topic.',
                    },
                    modules: {
                        type: Type.ARRAY,
                        description: 'An array of modules for the course.',
                        items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                            type: Type.STRING,
                            description: 'The title of the module.',
                            },
                            content: {
                            type: Type.STRING,
                            description: 'The HTML content of the module.',
                            },
                        },
                        required: ['title', 'content'],
                        },
                    },
                    },
                    required: ['description', 'modules'],
                },
            },
        });

        const jsonStr = response.text.trim();
        const content: GeneratedContent = JSON.parse(jsonStr);
        return content;
    } catch (error: any) {
        console.error("Gemini API Error (generateCourseFromText):", error);
        const message = (error && typeof error === 'object' && typeof error.message === 'string')
            ? error.message
            : "Failed to generate course from text. The document may be too complex or the AI service is unavailable.";
        throw new Error(message);
    }
};


export const generateQuiz = async (courseContent: string): Promise<QuizQuestion[]> => {
  try {
    checkAiClient();
    const prompt = `Based on the following course content, generate a quiz with 3 multiple-choice questions.
Each question should have 4 options and one correct answer.
The questions should test understanding of the key concepts in the content.

Course Content:
---
${courseContent}
---
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            description: 'A list of quiz questions.',
            items: {
            type: Type.OBJECT,
            properties: {
                question: {
                type: Type.STRING,
                description: 'The question text.',
                },
                options: {
                type: Type.ARRAY,
                description: 'A list of 4 possible answers (multiple choice).',
                items: {
                    type: 'STRING',
                },
                },
                correctAnswer: {
                type: Type.STRING,
                description:
                    'The correct answer, which must be one of the provided options.',
                },
            },
            required: ['question', 'options', 'correctAnswer'],
            },
        },
        },
    });

    const jsonStr = response.text.trim();
    const quiz: QuizQuestion[] = JSON.parse(jsonStr);
    return quiz;
  } catch(error: any) {
    console.error("Gemini API Error (generateQuiz):", error);
    const message = (error && typeof error === 'object' && typeof error.message === 'string')
        ? error.message
        : "Failed to generate quiz from AI. The provided content may be too short or unclear.";
    throw new Error(message);
  }
};

export const getAiChatResponse = async (history: AiMessage[], courseContext?: {title: string, description: string}): Promise<string> => {
    try {
        checkAiClient();
        let systemInstruction = "You are a helpful and knowledgeable assistant for Zamzam Bank's e-learning platform. Your expertise is in Islamic Finance Banking (IFB). Be friendly, professional, and provide clear explanations. You must not answer questions outside the scope of Islamic finance, banking, or the provided course context.";
        
        if (courseContext) {
            systemInstruction += `\n\nThe user is currently viewing the course "${courseContext.title}". Course description: "${courseContext.description}". Tailor your answers to be relevant to this course if possible.`;
        }
        
        const contents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch(error: any) {
        console.error("Gemini API Error (getAiChatResponse):", error);
        const message = (error && typeof error === 'object' && typeof error.message === 'string')
            ? error.message
            : "Sorry, I'm having trouble connecting right now. Please try again later.";
        throw new Error(message);
    }
};

export const analyzeDiscussionTopics = async (discussionText: string): Promise<string[]> => {
    try {
        checkAiClient();
        const prompt = `Analyze the following discussion forum comments from a corporate e-learning course on Islamic Finance.
Identify and list up to 5 main topics, keywords, or questions that people are frequently talking about.
Ignore pleasantries, greetings, and generic comments. Focus on the core subject matter.
Return the result as a JSON array of strings. For example: ["Topic 1", "Topic 2", "Topic 3"].

Discussion Text:
---
${discussionText}
---
`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                description: 'A list of the top 5 discussion topics or keywords.',
                items: {
                type: 'STRING',
                },
            },
            },
        });

        const jsonStr = response.text.trim();
        const topics: string[] = JSON.parse(jsonStr);
        return topics;
    } catch(error: any) {
        console.error("Gemini API Error (analyzeDiscussionTopics):", error);
        const message = (error && typeof error === 'object' && typeof error.message === 'string')
            ? error.message
            : "Failed to analyze discussion topics. The AI service may be temporarily unavailable.";
        throw new Error(message);
    }
};
