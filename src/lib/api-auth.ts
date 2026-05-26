import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensurePrismaUser } from "./supabase/app-user";
import type { AuthPayload, Role } from "./auth-types";

export async function getAuthFromRequest(
  request: NextRequest
): Promise<AuthPayload | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const dbUser = await ensurePrismaUser(user);
  if (!dbUser) return null;

  return {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    shopId: dbUser.shop?.shopId,
  };
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

export function requireRole(payload: AuthPayload | null, roles: Role[]) {
  if (!payload) return unauthorized();
  if (!roles.includes(payload.role)) return forbidden();
  return null;
}
