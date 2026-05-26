import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations";
import { buildSystemPrompt } from "@/lib/ai/context";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "SHOP_OWNER") return forbidden();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product || product.shop.ownerId !== auth.userId) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  const shop = await prisma.shop.findUnique({
    where: { id: product.shopId },
    include: { products: true },
  });
  if (shop) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: { botSystemPrompt: buildSystemPrompt(shop) },
    });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(_request);
  if (!auth) return unauthorized();
  if (auth.role !== "SHOP_OWNER") return forbidden();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product || product.shop.ownerId !== auth.userId) {
    return forbidden();
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
