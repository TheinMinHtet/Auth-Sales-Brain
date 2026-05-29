import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/api-auth";
import { shopSetupSchema } from "@/lib/validations";
import { generateShopId, buildShopPublicUrl } from "@/lib/shop-id";
import { buildSystemPrompt } from "@/lib/ai/context";
import { syncShopKnowledgeBaseFromRecord } from "@/lib/ai/knowledge";

/**
 * Shop setup — generates unique shopId and public link on submission.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "SHOP_OWNER") return forbidden("Only shop owners can create shops");

  const existing = await prisma.shop.findUnique({ where: { ownerId: auth.userId } });
  if (existing) {
    return NextResponse.json(
      {
        error: "Shop already exists",
        shop: {
          shopId: existing.shopId,
          publicUrl: buildShopPublicUrl(existing.shopId),
        },
      },
      { status: 409 }
    );
  }

  try {
    const body = await request.json();
    const parsed = shopSetupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const shopId = generateShopId();

    const shop = await prisma.$transaction(async (tx) => {
      const created = await tx.shop.create({
        data: {
          shopId,
          businessName: data.businessName,
          ownerName: data.ownerName,
          description: data.description,
          businessCategory: data.businessCategory,
          targetAudience: data.targetAudience,
          ageGroup: data.ageGroup,
          businessGoal: data.businessGoal,
          challenges: data.challenges,
          marketingMethods: data.marketingMethods,
          paymentInfo: data.paymentInfo,
          deliveryInfo: data.deliveryInfo,
          faq: data.faq,
          policies: data.policies,
          botTone: data.botTone ?? "friendly",
          ownerId: auth.userId,
          products: {
            create: data.products.map((p) => ({
              name: p.name,
              description: p.description,
              price: p.price,
              stock: p.stock ?? 0,
              imageUrl: p.imageUrl || null,
            })),
          },
        },
        include: { products: true },
      });

      const systemPrompt = buildSystemPrompt(created);
      return tx.shop.update({
        where: { id: created.id },
        data: { botSystemPrompt: systemPrompt },
        include: { products: true },
      });
    });

    await syncShopKnowledgeBaseFromRecord(shop).catch((error) => {
      console.error("Knowledge sync failed after shop setup:", error);
    });

    const publicUrl = buildShopPublicUrl(shop.shopId);

    return NextResponse.json({
      success: true,
      shop: {
        id: shop.id,
        shopId: shop.shopId,
        businessName: shop.businessName,
        publicUrl,
      },
      message: `Your shop is live! Share this link: ${publicUrl}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 });
  }
}
