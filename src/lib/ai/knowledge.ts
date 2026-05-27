import type { Product, Shop } from "@prisma/client";
import { prisma } from "@/lib/db";
import { embedText } from "@/lib/ai/gemini";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ShopWithProducts = Shop & { products: Product[] };

interface KnowledgeDocument {
  sourceId: string;
  sourceType: "shop_overview" | "payment_delivery" | "faq_policies" | "product";
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface RetrievedKnowledgeDocument {
  source_id: string;
  source_type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function buildKnowledgeDocuments(shop: ShopWithProducts): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [
    {
      sourceId: shop.shopId,
      sourceType: "shop_overview",
      title: `${shop.businessName} overview`,
      content: [
        `Business name: ${shop.businessName}`,
        shop.description ? `Description: ${shop.description}` : null,
        `Active products: ${shop.products.filter((product) => product.isActive).length}`,
      ]
        .filter(Boolean)
        .join("\n"),
      metadata: {
        businessName: shop.businessName,
      },
    },
    {
      sourceId: `${shop.shopId}:operations`,
      sourceType: "payment_delivery",
      title: `${shop.businessName} payment and delivery`,
      content: [
        `Payment information: ${shop.paymentInfo}`,
        `Delivery information: ${shop.deliveryInfo}`,
      ].join("\n"),
      metadata: {
        paymentInfo: shop.paymentInfo,
        deliveryInfo: shop.deliveryInfo,
      },
    },
  ];

  if (shop.faq || shop.policies) {
    docs.push({
      sourceId: `${shop.shopId}:support`,
      sourceType: "faq_policies",
      title: `${shop.businessName} faq and policies`,
      content: [shop.faq ? `FAQ: ${shop.faq}` : null, shop.policies ? `Policies: ${shop.policies}` : null]
        .filter(Boolean)
        .join("\n\n"),
      metadata: {
        hasFaq: Boolean(shop.faq),
        hasPolicies: Boolean(shop.policies),
      },
    });
  }

  for (const product of shop.products.filter((item) => item.isActive)) {
    docs.push({
      sourceId: product.id,
      sourceType: "product",
      title: product.name,
      content: [
        `Product name: ${product.name}`,
        `Price: ${money(product.price)}`,
        `Stock: ${product.stock}`,
        product.description ? `Description: ${product.description}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      metadata: {
        productId: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
    });
  }

  return docs;
}

export function buildRetrievedContext(docs: RetrievedKnowledgeDocument[]): string {
  if (!docs.length) {
    return "No relevant knowledge retrieved.";
  }

  return docs
    .map(
      (doc, index) =>
        `Document ${index + 1} (${doc.source_type} | similarity ${doc.similarity.toFixed(3)}):\nTitle: ${doc.title}\n${doc.content}`
    )
    .join("\n\n");
}

export function isProductRelatedQuestion(shop: ShopWithProducts, message: string): boolean {
  const lower = message.toLowerCase();
  const productNameMatch = shop.products.some((product) =>
    lower.includes(product.name.toLowerCase())
  );

  return (
    productNameMatch ||
    /(product|products|catalog|item|items|buy|price|cost|stock|available|availability|recommend|best|sale|order)/i.test(
      lower
    )
  );
}

async function getShopByPublicId(shopId: string) {
  return prisma.shop.findUnique({
    where: { shopId },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function syncShopKnowledgeBase(shopId: string) {
  const shop = await getShopByPublicId(shopId);
  if (!shop) {
    throw new Error(`Cannot sync knowledge for unknown shop ${shopId}.`);
  }

  await syncShopKnowledgeBaseFromRecord(shop);
}

export async function syncShopKnowledgeBaseFromRecord(shop: ShopWithProducts) {
  const supabase = createSupabaseAdminClient();
  const table = supabase.from("shop_knowledge_documents" as never);
  const docs = buildKnowledgeDocuments(shop);

  const rows = await Promise.all(
    docs.map(async (doc) => ({
      shop_id: shop.shopId,
      source_id: doc.sourceId,
      source_type: doc.sourceType,
      title: doc.title,
      content: doc.content,
      metadata: doc.metadata,
      embedding: await embedText(doc.content),
    }))
  );

  const { error: deleteError } = await table
    .delete()
    .eq("shop_id", shop.shopId);

  if (deleteError) {
    throw new Error(`Failed to clear knowledge documents: ${deleteError.message}`);
  }

  if (!rows.length) {
    return;
  }

  const { error: insertError } = await table.insert(rows as never[]);

  if (insertError) {
    throw new Error(`Failed to insert knowledge documents: ${insertError.message}`);
  }
}

export async function retrieveRelevantKnowledge(
  shopId: string,
  query: string,
  matchCount = 5
): Promise<RetrievedKnowledgeDocument[]> {
  const supabase = createSupabaseAdminClient();
  const queryEmbedding = await embedText(query);

  const { data, error } = await supabase.rpc(
    "match_shop_knowledge" as never,
    {
      shop_id_input: shopId,
      query_embedding: queryEmbedding,
      match_count: matchCount,
    } as never
  );

  if (error) {
    throw new Error(`Knowledge retrieval failed: ${error.message}`);
  }

  return (data || []) as RetrievedKnowledgeDocument[];
}
