const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_CHAT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const DEFAULT_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

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

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }
  return apiKey;
}

async function geminiRequest<TResponse>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const apiKey = getGeminiApiKey();

  const response = await fetch(`${GEMINI_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini request failed.");
  }

  return data;
}

export async function embedText(text: string): Promise<number[]> {
  const response = await geminiRequest<{
    embedding?: { values?: number[] };
  }>(`${DEFAULT_EMBEDDING_MODEL}:embedContent`, {
    content: {
      parts: [{ text }],
    },
    output_dimensionality: 768,
  });

  const values = response.embedding?.values;
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
  return geminiRequest<GeminiGenerateResponse>(
    `${DEFAULT_CHAT_MODEL}:generateContent`,
    {
      ...(systemInstruction
        ? {
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          }
        : {}),
      contents,
      ...(tools ? { tools } : {}),
    }
  );
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
