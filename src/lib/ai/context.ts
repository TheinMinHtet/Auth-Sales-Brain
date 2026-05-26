import type { Product, Shop } from "@prisma/client";

export type ShopWithProducts = Shop & { products: Product[] };

/** Build RAG-style context from shop data for the AI bot */
export function buildShopContext(shop: ShopWithProducts): string {
  const productList = shop.products
    .filter((p) => p.isActive)
    .map(
      (p) =>
        `- ${p.name}: $${p.price.toFixed(2)}${p.stock > 0 ? ` (${p.stock} in stock)` : " (out of stock)"}${
          p.description ? ` — ${p.description}` : ""
        }`
    )
    .join("\n");

  return `
BUSINESS: ${shop.businessName}
${shop.description ? `DESCRIPTION: ${shop.description}` : ""}

PRODUCTS:
${productList || "No products listed yet."}

PAYMENT: ${shop.paymentInfo}
DELIVERY: ${shop.deliveryInfo}
${shop.faq ? `FAQ:\n${shop.faq}` : ""}
${shop.policies ? `POLICIES:\n${shop.policies}` : ""}
`.trim();
}

export function buildSystemPrompt(shop: ShopWithProducts): string {
  const context = buildShopContext(shop);
  const custom = shop.botSystemPrompt?.trim();
  const tone = shop.botTone || "friendly";

  return (
    custom ||
    `You are the AI shopping assistant for "${shop.businessName}". 
Tone: ${tone}.
Answer questions about products, pricing, payment, delivery, and policies using ONLY the shop context below.
If you don't know something, say so and suggest the customer contact the shop.
Never invent products or prices not in the context.
Keep responses concise and helpful.

--- SHOP CONTEXT ---
${context}
--- END CONTEXT ---`
  );
}
