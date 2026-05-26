import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

/** Public read-only shop data for customers */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params;

  const shop = await prisma.shop.findUnique({
    where: { shopId, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  await trackEvent(shop.id, "page_view", { shopId });

  return NextResponse.json({
    shopId: shop.shopId,
    businessName: shop.businessName,
    description: shop.description,
    paymentInfo: shop.paymentInfo,
    deliveryInfo: shop.deliveryInfo,
    products: shop.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
    })),
  });
}
