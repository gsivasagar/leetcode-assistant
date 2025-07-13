import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function initializeAiService(apiKey: string) {
    if (!apiKey) {
        throw new Error("API key is required to initialize the AI service.");
    }
    ai = new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `You are an expert LeetCode coach and world-class software engineer. Your goal is to help users solve coding problems by guiding them.

You handle three types of requests:
1.  **Problem Analysis**: If a user provides a LeetCode problem, you MUST respond with a JSON object adhering to the specified schema. This includes providing an array of 3 distinct, progressively more detailed hints, a step-by-step algorithm, and a full code solution.
2.  **Code Explanation**: If a user provides a block of code, explain its logic, functionality, and complexity (time and space) in Markdown.
3.  **Code Optimization**: If a user provides code and asks for optimization, identify bottlenecks and suggest improvements in Markdown.

For follow-up questions after the initial analysis, respond conversationally in standard Markdown.
When providing code examples or pseudocode, use the user's preferred programming language if specified. Default to Python if no language is mentioned.
Keep your responses concise, clear, and focused on coaching.`;

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        hints: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING 
            },
            description: 'An array of 3 concise, high-level hints to nudge the user in the right direction. Each hint should be progressively more revealing.'
        },
        algorithm: {
            type: Type.STRING,
            description: 'Break down the problem into smaller, logical steps. Discuss relevant data structures, algorithms, and edge cases. Use Markdown for formatting (e.g., lists, bolding).'
        },
        code: {
            type: Type.STRING,
            description: "Provide a complete, runnable code solution in the user's preferred language. Ensure the code is well-formatted with proper indentation. Use Markdown for formatting a code block, e.g., ```python ... ```."
        }
    },
    required: ['hints', 'algorithm', 'code']
};

const codeOnlySchema = {
    type: Type.OBJECT,
    properties: {
        code: {
            type: Type.STRING,
            description: "Provide ONLY the complete, runnable code solution in the requested language. Ensure the code is well-formatted with proper indentation. The output should be a single Markdown code block, e.g., ```language ... ```."
        }
    },
    required: ['code']
}

export function createNewChat(): Chat {
    if (!ai) {
        throw new Error("AI Service not initialized. Call initializeAiService first.");
    }
    return ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
};

export function getInitialAnalysis(chat: Chat, problem: string, language: string) {
    const prompt = `My preferred language is ${language}. Please analyze this problem:\n\n${problem}`;
    return chat.sendMessageStream({
        message: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        }
    });
}

export async function getCodeInNewLanguage(chat: Chat, problem: string, algorithm: string, language: string): Promise<{code: string}> {
    const prompt = `
        Original Problem:
        ${problem}

        Algorithm:
        ${algorithm}

        Based on the problem and algorithm above, provide a complete, runnable code solution in the ${language} language.
    `;
    
    const response: GenerateContentResponse = await chat.sendMessage({
        message: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: codeOnlySchema,
        }
    });

    const parsed = JSON.parse((response.text ?? '').trim());
    return parsed;
}


export function sendMessage(chat: Chat, message: string, language:string) {
    const prompt = `My preferred language is ${language}. Please consider this for any code or pseudocode.\n\nMy follow-up request:\n${message}`;
    return chat.sendMessageStream({ message: prompt });
};
