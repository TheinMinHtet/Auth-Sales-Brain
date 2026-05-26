import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildShopPublicUrl } from "@/lib/shop-id";
import { getAuthFromRequest, requireRole } from "@/lib/api-auth";
import { ROLES } from "@/lib/auth-types";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const denied = requireRole(auth, [ROLES.DEVELOPER]);
  if (denied) return denied;

  const shops = await prisma.shop.findMany({
    include: {
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    shops: shops.map((s) => ({
      id: s.id,
      shopId: s.shopId,
      businessName: s.businessName,
      isActive: s.isActive,
      publicUrl: buildShopPublicUrl(s.shopId),
      owner: s.owner,
      productCount: s._count.products,
      orderCount: s._count.orders,
      createdAt: s.createdAt,
    })),
    total: shops.length,
  });
}
