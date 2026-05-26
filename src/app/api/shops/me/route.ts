import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/api-auth";
import { buildShopPublicUrl } from "@/lib/shop-id";
import { botSettingsSchema } from "@/lib/validations";
import { buildSystemPrompt } from "@/lib/ai/context";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const shop = await prisma.shop.findUnique({
    where: { ownerId: auth.userId },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!shop) {
    return NextResponse.json({ shop: null, needsSetup: true });
  }

  if (auth.role === "SHOP_OWNER" && shop.ownerId !== auth.userId) {
    return forbidden();
  }

  return NextResponse.json({
    shop: {
      ...shop,
      publicUrl: buildShopPublicUrl(shop.shopId),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "SHOP_OWNER") return forbidden();

  const shop = await prisma.shop.findUnique({ where: { ownerId: auth.userId } });
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = botSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.shop.update({
    where: { id: shop.id },
    data: parsed.data,
    include: { products: true },
  });

  const withPrompt = await prisma.shop.update({
    where: { id: updated.id },
    data: {
      botSystemPrompt: buildSystemPrompt({
        ...updated,
        products: updated.products,
      }),
    },
    include: { products: true },
  });

  return NextResponse.json({ shop: withPrompt });
}
