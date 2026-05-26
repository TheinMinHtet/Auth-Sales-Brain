import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePrismaUser } from "@/lib/supabase/app-user";
import { buildShopPublicUrl } from "@/lib/shop-id";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const dbUser = await ensurePrismaUser(user);
  const dbConnected = dbUser !== null;

  return NextResponse.json({
    user: {
      id: dbUser?.id ?? user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        dbUser?.name ??
        user.email?.split("@")[0],
      role: dbUser?.role ?? "SHOP_OWNER",
    },
    shop: dbUser?.shop
      ? {
          shopId: dbUser.shop.shopId,
          businessName: dbUser.shop.businessName,
          publicUrl: buildShopPublicUrl(dbUser.shop.shopId),
        }
      : null,
    dbConnected,
  });
}
