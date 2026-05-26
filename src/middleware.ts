import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isPublicShopPath(pathname: string) {
  return /^\/shop\/[^/]+$/.test(pathname);
}

function isPublicShopApi(pathname: string) {
  return (
    pathname.startsWith("/api/shops/public/") ||
    pathname === "/api/chat" ||
    pathname === "/api/orders/checkout"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  if (pathname === "/login" || pathname === "/signup") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/admin")
  ) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }
    return supabaseResponse;
  }

  if (
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/shops/me") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/shops/setup") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return supabaseResponse;
  }

  if (
    pathname === "/" ||
    isPublicShopPath(pathname) ||
    isPublicShopApi(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
