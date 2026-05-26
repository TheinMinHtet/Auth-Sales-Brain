import { buildSystemPrompt, type ShopWithProducts } from "./context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Context-based reply without external API */
function contextFallback(
  shop: ShopWithProducts,
  userMessage: string
): string {
  const lower = userMessage.toLowerCase();
  const products = shop.products.filter((p) => p.isActive);

  if (/product|menu|catalog|what do you sell|list/i.test(lower)) {
    if (products.length === 0) {
      return `Welcome to ${shop.businessName}! We're still updating our catalog. Check back soon.`;
    }
    const list = products
      .map((p) => `• ${p.name} — $${p.price.toFixed(2)}`)
      .join("\n");
    return `Here are our products at ${shop.businessName}:\n\n${list}\n\nAsk about any item for more details!`;
  }

  if (/payment|pay|card|cash/i.test(lower)) {
    return `Payment info: ${shop.paymentInfo}`;
  }

  if (/deliver|shipping|ship|pickup/i.test(lower)) {
    return `Delivery info: ${shop.deliveryInfo}`;
  }

  if (/faq|question|help/i.test(lower) && shop.faq) {
    return shop.faq;
  }

  if (/policy|return|refund/i.test(lower) && shop.policies) {
    return shop.policies;
  }

  for (const p of products) {
    if (lower.includes(p.name.toLowerCase())) {
      return `${p.name}: $${p.price.toFixed(2)}. ${
        p.description || "No additional description."
      } ${p.stock > 0 ? `${p.stock} available.` : "Currently out of stock."}`;
    }
  }

  return `Thanks for visiting ${shop.businessName}! I can help with products, payment (${shop.paymentInfo.slice(0, 50)}...), and delivery. What would you like to know?`;
}

/** Generate AI response using OpenAI if configured, else context-based bot */
export async function generateBotReply(
  shop: ShopWithProducts,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return contextFallback(shop, userMessage);
  }

  try {
    const systemPrompt = buildSystemPrompt(shop);
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return contextFallback(shop, userMessage);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return (
      data.choices?.[0]?.message?.content?.trim() ||
      contextFallback(shop, userMessage)
    );
  } catch {
    return contextFallback(shop, userMessage);
  }
}
