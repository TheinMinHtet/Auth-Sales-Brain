"use client";

import { useState } from "react";
import { ShopChatbot } from "./ShopChatbot";

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export interface PublicShop {
  shopId: string;
  businessName: string;
  description: string | null;
  paymentInfo: string;
  deliveryInfo: string;
  products: PublicProduct[];
}

function buildPromptSuggestions(shop: PublicShop) {
  const product = shop.products[0]?.name;

  return [
    "What products do you sell?",
    product ? `Tell me about ${product}` : "Recommend a product for me",
    "What are your delivery options?",
    "What payment methods do you accept?",
  ];
}

function ShopInfoPanel({ shop }: { shop: PublicShop }) {
  return (
    <>
      <div className="border-b border-slate-200/80 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Sales Brain
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          {shop.businessName}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {shop.description ||
            "Ask anything about products, pricing, payment, or delivery."}
        </p>
      </div>

      <div className="chat-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Product knowledge
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {shop.products.length}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {shop.products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                No products published yet.
              </div>
            ) : (
              shop.products.slice(0, 12).map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {product.description || "Ask the assistant for details."}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950 px-5 py-5 text-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Store info
          </p>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-slate-400">Payment</p>
              <p className="mt-1 leading-6 text-slate-100">{shop.paymentInfo}</p>
            </div>
            <div>
              <p className="text-slate-400">Delivery</p>
              <p className="mt-1 leading-6 text-slate-100">{shop.deliveryInfo}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function ShopStorefront({ shop }: { shop: PublicShop }) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4 px-3 py-3 lg:flex-row lg:px-6 lg:py-4">
        <aside className="hidden w-full shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:flex lg:h-full lg:w-[320px]">
          <ShopInfoPanel shop={shop} />
        </aside>

        <main className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur lg:rounded-[32px]">
          <ShopChatbot
            shopId={shop.shopId}
            businessName={shop.businessName}
            fullPage
            suggestedPrompts={buildPromptSuggestions(shop)}
            products={shop.products}
            onOpenInfo={() => setInfoOpen(true)}
          />
        </main>
      </div>

      {infoOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close shop info"
            onClick={() => setInfoOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[86dvh] min-h-[58dvh] flex-col overflow-hidden rounded-t-[30px] border border-white/80 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Shop menu
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {shop.businessName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
            <ShopInfoPanel shop={shop} />
          </div>
        </div>
      )}
    </div>
  );
}
