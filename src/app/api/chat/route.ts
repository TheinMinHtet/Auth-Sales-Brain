import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { chatSchema } from "@/lib/validations";
import { generateBotReply } from "@/lib/ai/chat";
import { trackEvent } from "@/lib/analytics";

/** Public AI chat endpoint — no login required */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const { shopId, message, sessionId: incomingSessionId } = parsed.data;

    const shop = await prisma.shop.findUnique({
      where: { shopId, isActive: true },
      include: { products: { where: { isActive: true } } },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const sessionId = incomingSessionId ?? randomBytes(16).toString("hex");

    let session = await prisma.chatSession.findUnique({
      where: { shopId_sessionId: { shopId: shop.id, sessionId } },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 20 },
      },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { shopId: shop.id, sessionId },
        include: { messages: true },
      });
    }

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "user", content: message },
    });

    const history = session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const reply = await generateBotReply(
      { ...shop, products: shop.products },
      history,
      message
    );

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "assistant", content: reply },
    });

    await trackEvent(shop.id, "chat_message");

    return NextResponse.json({ reply, sessionId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
