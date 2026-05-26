import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, requireRole } from "@/lib/api-auth";
import { ROLES } from "@/lib/auth-types";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const denied = requireRole(auth, [ROLES.DEVELOPER]);
  if (denied) return denied;

  const [users, shops, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);

  return NextResponse.json({
    users,
    shopOwners: await prisma.user.count({ where: { role: "SHOP_OWNER" } }),
    shops,
    orders,
    totalRevenue: revenue._sum.total ?? 0,
  });
}
