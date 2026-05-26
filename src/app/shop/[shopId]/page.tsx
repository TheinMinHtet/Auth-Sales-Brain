import { notFound } from "next/navigation";
import { ShopStorefront, type PublicShop } from "@/components/ShopStorefront";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const shopRecord = await prisma.shop.findUnique({
    where: { shopId, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!shopRecord) {
    notFound();
  }

  await trackEvent(shopRecord.id, "page_view", { shopId });

  const shop: PublicShop = {
    shopId: shopRecord.shopId,
    businessName: shopRecord.businessName,
    description: shopRecord.description,
    paymentInfo: shopRecord.paymentInfo,
    deliveryInfo: shopRecord.deliveryInfo,
    products: shopRecord.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
    })),
  };

  return <ShopStorefront shop={shop} />;
}
