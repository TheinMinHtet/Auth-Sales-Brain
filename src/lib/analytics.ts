import { prisma } from "./db";

export async function trackEvent(
  shopInternalId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.shopAnalytics.create({
      data: {
        shopId: shopInternalId,
        eventType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // Non-blocking analytics
  }
}

export async function getShopAnalyticsSummary(shopInternalId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [pageViews, chatMessages, orders, revenue] = await Promise.all([
    prisma.shopAnalytics.count({
      where: {
        shopId: shopInternalId,
        eventType: "page_view",
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.chatMessage.count({
      where: {
        session: { shopId: shopInternalId },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.order.count({
      where: {
        shopId: shopInternalId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.order.aggregate({
      where: {
        shopId: shopInternalId,
        status: { not: "CANCELLED" },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    pageViews,
    chatMessages,
    orders,
    revenue: revenue._sum.total ?? 0,
  };
}
