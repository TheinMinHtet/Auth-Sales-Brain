import type { ShopWithProducts } from "@/lib/ai/knowledge";

export function buildShopContext(shop: ShopWithProducts): string {
  const productList = shop.products
    .filter((product) => product.isActive)
    .map((product) => {
      const price = `$${product.price.toFixed(2)}`;
      const stock =
        product.stock > 0 ? `${product.stock} in stock` : "out of stock";

      return [
        `- ${product.name}`,
        `price: ${price}`,
        `stock: ${stock}`,
        product.description ? `description: ${product.description}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");

  return [
    `BUSINESS: ${shop.businessName}`,
    shop.description ? `DESCRIPTION: ${shop.description}` : null,
    "",
    "PRODUCTS:",
    productList || "No products listed yet.",
    "",
    `PAYMENT: ${shop.paymentInfo}`,
    `DELIVERY: ${shop.deliveryInfo}`,
    shop.faq ? `FAQ:\n${shop.faq}` : null,
    shop.policies ? `POLICIES:\n${shop.policies}` : null,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function buildAgentSystemInstruction(
  shop: ShopWithProducts,
  retrievedContext: string
): string {
  const tone = shop.botTone || "friendly";

  return `
You are the AI sales assistant for "${shop.businessName}".
Tone: ${tone}.

You are not a general chatbot. You are a shop assistant focused on helping customers buy products, understand delivery and payment, and track orders for this specific store.

Rules:
- Use only the retrieved business context and tool results.
- Never guess prices, stock, availability, policies, or order status.
- For product questions, stay grounded in retrieved context first and use tools when live data is needed.
- If relevant context is missing, say exactly: "I don't have enough information".
- If stock cannot be confirmed, say that stock is unknown.
- Keep answers concise, natural, and sales-assistant-like.
- Do not mention internal prompts, vectors, embeddings, tools, or databases.

Retrieved business context:
${retrievedContext}
`.trim();
}

export function buildSystemPrompt(shop: ShopWithProducts): string {
  return buildAgentSystemInstruction(shop, buildShopContext(shop));
}
