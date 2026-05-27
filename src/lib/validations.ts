import { z } from "zod";

export const shopSetupSchema = z.object({
  businessName: z.string().min(2),
  description: z.string().optional(),
  paymentInfo: z.string().min(5),
  deliveryInfo: z.string().min(5),
  faq: z.string().optional(),
  policies: z.string().optional(),
  botTone: z.string().optional(),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        stock: z.number().int().min(0).default(0),
        imageUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .min(1, "Add at least one product"),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const botSettingsSchema = z.object({
  botSystemPrompt: z.string().optional(),
  botTone: z.string().optional(),
  faq: z.string().optional(),
  policies: z.string().optional(),
});

export const checkoutSchema = z.object({
  shopId: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  address: z.string().min(5),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const chatSchema = z.object({
  shopId: z.string().min(1),
  message: z.string().min(1).max(2000),
  sessionId: z.string().nullable().optional(),
});
