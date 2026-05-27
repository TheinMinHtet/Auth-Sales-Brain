import { prisma } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";
import type { ShopWithProducts } from "@/lib/ai/knowledge";

interface ToolContext {
  shop: ShopWithProducts;
  userId: string;
}

export const SALES_AGENT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description:
          "Search active products in the current shop when the customer asks for recommendations or product discovery.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Customer search query or buying need.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_product_details",
        description:
          "Get detailed live information for a specific product by product ID.",
        parameters: {
          type: "object",
          properties: {
            product_id: {
              type: "string",
              description: "The product ID.",
            },
          },
          required: ["product_id"],
        },
      },
      {
        name: "check_stock",
        description:
          "Check the live inventory quantity for a specific product by product ID.",
        parameters: {
          type: "object",
          properties: {
            product_id: {
              type: "string",
              description: "The product ID.",
            },
          },
          required: ["product_id"],
        },
      },
      {
        name: "create_order",
        description:
          "Create an order for one product when the customer clearly wants to buy and has provided required contact and delivery details.",
        parameters: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              description: "The customer or session identifier.",
            },
            product_id: {
              type: "string",
              description: "The product ID.",
            },
            quantity: {
              type: "number",
              description: "How many units the customer wants.",
            },
            customer_name: {
              type: "string",
              description: "Customer full name.",
            },
            customer_email: {
              type: "string",
              description: "Customer email address.",
            },
            customer_phone: {
              type: "string",
              description: "Customer phone number, if available.",
            },
            address: {
              type: "string",
              description: "Delivery address.",
            },
          },
          required: ["user_id", "product_id", "quantity"],
        },
      },
      {
        name: "track_order",
        description: "Track an existing order by its order ID.",
        parameters: {
          type: "object",
          properties: {
            order_id: {
              type: "string",
              description: "The order ID to track.",
            },
          },
          required: ["order_id"],
        },
      },
    ],
  },
];

function parseString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

async function searchProducts(context: ToolContext, query: unknown) {
  const searchQuery = parseString(query);
  if (!searchQuery) {
    return { ok: false, error: "Missing query." };
  }

  const products = await prisma.product.findMany({
    where: {
      shopId: context.shop.id,
      isActive: true,
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ],
    },
    orderBy: [{ stock: "desc" }, { createdAt: "asc" }],
    take: 5,
  });

  return {
    ok: true,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    })),
  };
}

async function getProductDetails(context: ToolContext, productId: unknown) {
  const id = parseString(productId);
  if (!id) {
    return { ok: false, error: "Missing product_id." };
  }

  const product = await prisma.product.findFirst({
    where: { id, shopId: context.shop.id, isActive: true },
  });

  if (!product) {
    return { ok: false, error: "Product not found." };
  }

  return {
    ok: true,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
    },
  };
}

async function checkStock(context: ToolContext, productId: unknown) {
  const id = parseString(productId);
  if (!id) {
    return { ok: false, error: "Missing product_id." };
  }

  const product = await prisma.product.findFirst({
    where: { id, shopId: context.shop.id, isActive: true },
    select: { id: true, name: true, stock: true },
  });

  if (!product) {
    return { ok: false, error: "Stock is unknown for that product." };
  }

  return {
    ok: true,
    product: {
      id: product.id,
      name: product.name,
      stock: product.stock,
    },
  };
}

async function createOrder(
  context: ToolContext,
  args: Record<string, unknown> | undefined
) {
  const productId = parseString(args?.product_id);
  const quantity = parsePositiveInteger(args?.quantity);
  const customerName = parseString(args?.customer_name);
  const customerEmail = parseString(args?.customer_email);
  const address = parseString(args?.address);
  const customerPhone = parseString(args?.customer_phone);

  if (!productId || !quantity) {
    return { ok: false, error: "Missing product_id or quantity." };
  }

  const missingFields = [
    !customerName ? "customer_name" : null,
    !customerEmail ? "customer_email" : null,
    !address ? "address" : null,
  ].filter(Boolean);

  if (missingFields.length) {
    return {
      ok: false,
      error: "Missing required customer details.",
      missing_fields: missingFields,
    };
  }

  if (!customerName || !customerEmail || !address) {
    return {
      ok: false,
      error: "Missing required customer details.",
    };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: context.shop.id, isActive: true },
  });

  if (!product) {
    return { ok: false, error: "Product not found." };
  }

  if (product.stock < quantity) {
    return {
      ok: false,
      error: "Insufficient stock.",
      available_stock: product.stock,
    };
  }

  const order = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } },
    });

    return tx.order.create({
      data: {
        shopId: context.shop.id,
        customerName,
        customerEmail,
        customerPhone,
        address,
        total: product.price * quantity,
        items: {
          create: [
            {
              productId: product.id,
              quantity,
              price: product.price,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  await trackEvent(context.shop.id, "order_placed", {
    orderId: order.id,
    total: order.total,
    source: "chat_agent",
    userId: context.userId,
  });

  return {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      total: order.total,
      quantity,
      product_name: product.name,
    },
  };
}

async function trackOrder(context: ToolContext, orderId: unknown) {
  const id = parseString(orderId);
  if (!id) {
    return { ok: false, error: "Missing order_id." };
  }

  const order = await prisma.order.findFirst({
    where: { id, shopId: context.shop.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  return {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      total: order.total,
      created_at: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  };
}

export async function runSalesAgentTool(
  name: string,
  args: Record<string, unknown> | undefined,
  context: ToolContext
): Promise<Record<string, unknown>> {
  switch (name) {
    case "search_products":
      return searchProducts(context, args?.query);
    case "get_product_details":
      return getProductDetails(context, args?.product_id);
    case "check_stock":
      return checkStock(context, args?.product_id);
    case "create_order":
      return createOrder(context, args);
    case "track_order":
      return trackOrder(context, args?.order_id);
    default:
      return { ok: false, error: `Unsupported tool: ${name}` };
  }
}
