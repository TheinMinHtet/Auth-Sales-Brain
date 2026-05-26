export const ROLES = {
  DEVELOPER: "DEVELOPER",
  SHOP_OWNER: "SHOP_OWNER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
  shopId?: string;
}
