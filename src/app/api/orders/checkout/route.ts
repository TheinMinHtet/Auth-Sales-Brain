import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations";
import { trackEvent } from "@/lib/analytics";

/** Public checkout — no customer login */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const shop = await prisma.shop.findUnique({
      where: { shopId: data.shopId, isActive: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, shopId: shop.id, isActive: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Invalid products in cart" }, { status: 400 });
    }

    let total = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          shopId: shop.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          address: data.address,
          total,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    await trackEvent(shop.id, "order_placed", { orderId: order.id, total });

    return NextResponse.json({
      success: true,
      order: { id: order.id, total: order.total, status: order.status },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
