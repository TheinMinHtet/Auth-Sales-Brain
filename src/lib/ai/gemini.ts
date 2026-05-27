import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

const DEFAULT_CHAT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const DEFAULT_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY.");
}

const ai = new GoogleGenAI({ apiKey });

const DEFAULT_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export interface GeminiFunctionCall {
  id?: string;
  name: string;
  args?: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: {
    id?: string;
    name: string;
    response: Record<string, unknown>;
  };
  thoughtSignature?: string;
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

interface GenerateContentInput {
  contents: GeminiContent[];
  systemInstruction?: string;
  tools?: Array<{
    functionDeclarations: Array<Record<string, unknown>>;
  }>;
}

export async function embedText(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: DEFAULT_EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error("Gemini embedding response did not include values.");
  }

  return values;
}

export async function generateGeminiContent({
  contents,
  systemInstruction,
  tools,
}: GenerateContentInput): Promise<GeminiGenerateResponse> {
  const response = await ai.models.generateContent({
    model: DEFAULT_CHAT_MODEL,
    contents,
    config: {
      ...(systemInstruction ? { systemInstruction } : {}),
      ...(tools ? { tools } : {}),
      safetySettings: DEFAULT_SAFETY_SETTINGS,
    },
  });

  return response as GeminiGenerateResponse;
}

export function extractTextFromCandidate(candidate?: GeminiCandidate): string {
  return (
    candidate?.content?.parts
      ?.map((part) => part.text?.trim())
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  );
}

export function extractFunctionCalls(candidate?: GeminiCandidate): GeminiFunctionCall[] {
  return (
    candidate?.content?.parts
      ?.map((part) => part.functionCall)
      .filter((call): call is GeminiFunctionCall => Boolean(call?.name)) || []
  );
}
