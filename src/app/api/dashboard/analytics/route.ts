import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/api-auth";
import { getShopAnalyticsSummary } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const shop = await prisma.shop.findUnique({
    where: { ownerId: auth.userId },
  });

  if (!shop) {
    return NextResponse.json({ error: "No shop found" }, { status: 404 });
  }

  if (auth.role === "SHOP_OWNER" && shop.ownerId !== auth.userId) {
    return forbidden();
  }

  const summary = await getShopAnalyticsSummary(shop.id);

  const recentOrders = await prisma.order.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({
    summary,
    recentOrders,
    publicUrl: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? ""}/shop/${shop.shopId}`,
  });
}
