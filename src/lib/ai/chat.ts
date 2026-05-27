import { buildAgentSystemInstruction } from "./context";
import {
  extractFunctionCalls,
  extractTextFromCandidate,
  generateGeminiContent,
  type GeminiContent,
} from "./gemini";
import {
  buildRetrievedContext,
  isProductRelatedQuestion,
  retrieveRelevantKnowledge,
  syncShopKnowledgeBaseFromRecord,
  type ShopWithProducts,
} from "./knowledge";
import { SALES_AGENT_TOOLS, runSalesAgentTool } from "./tools";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function contextFallback(): string {
  return "I don't have enough information";
}

function toGeminiHistory(history: ChatMessage[], userMessage: string): GeminiContent[] {
  const priorTurns = history.slice(-10).map<GeminiContent>((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  return [...priorTurns, { role: "user", parts: [{ text: userMessage }] }];
}

export async function generateBotReply(
  shop: ShopWithProducts,
  history: ChatMessage[],
  userMessage: string,
  sessionId: string
): Promise<string> {
  try {
    let retrieved = await retrieveRelevantKnowledge(shop.shopId, userMessage, 5).catch(
      () => []
    );

    if (!retrieved.length) {
      await syncShopKnowledgeBaseFromRecord(shop).catch(() => undefined);
      retrieved = await retrieveRelevantKnowledge(shop.shopId, userMessage, 5).catch(
        () => []
      );
    }

    if (isProductRelatedQuestion(shop, userMessage) && !retrieved.length) {
      return "I don't have enough information";
    }

    const systemInstruction = buildAgentSystemInstruction(
      shop,
      buildRetrievedContext(retrieved)
    );

    let contents = toGeminiHistory(history, userMessage);

    for (let round = 0; round < 3; round += 1) {
      const response = await generateGeminiContent({
        systemInstruction,
        contents,
        tools: SALES_AGENT_TOOLS,
      });

      const candidate = response.candidates?.[0];
      const functionCalls = extractFunctionCalls(candidate);
      const text = extractTextFromCandidate(candidate);

      if (!functionCalls.length) {
        return text || contextFallback();
      }

      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => ({
          functionResponse: {
            id: call.id,
            name: call.name,
            response: await runSalesAgentTool(call.name, call.args, {
              shop,
              userId: sessionId,
            }),
          },
        }))
      );

      contents = [
        ...contents,
        ...(candidate?.content ? [candidate.content] : []),
        { role: "user", parts: functionResponses },
      ];
    }

    return contextFallback();
  } catch {
    return contextFallback();
  }
}
