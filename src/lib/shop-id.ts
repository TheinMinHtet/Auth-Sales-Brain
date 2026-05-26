import { randomBytes } from "crypto";

/** URL-safe unique shop identifier for public links */
export function generateShopId(): string {
  return randomBytes(12).toString("base64url");
}

export function buildShopPublicUrl(shopId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${base}/shop/${shopId}`;
}
