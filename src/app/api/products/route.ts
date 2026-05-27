import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations";
import { buildSystemPrompt } from "@/lib/ai/context";
import { syncShopKnowledgeBase } from "@/lib/ai/knowledge";

async function getOwnerShop(userId: string) {
  return prisma.shop.findUnique({
    where: { ownerId: userId },
    include: { products: true },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "SHOP_OWNER") return forbidden();

  const shop = await getOwnerShop(auth.userId);
  if (!shop) {
    return NextResponse.json({ error: "Create a shop first" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, shopId: shop.id },
  });

  const products = await prisma.product.findMany({ where: { shopId: shop.id } });
  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      botSystemPrompt: buildSystemPrompt({ ...shop, products }),
    },
  });
  await syncShopKnowledgeBase(shop.shopId).catch((error) => {
    console.error("Knowledge sync failed after product create:", error);
  });

  return NextResponse.json({ product });
}
