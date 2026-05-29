'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemState } from "@/types/dashboard";
import { dict } from "@/types/constants";

interface DashboardContextType {
  storeState: SystemState | null;
  setStoreState: React.Dispatch<React.SetStateAction<SystemState | null>>;
  lang: "en" | "my";
  setLang: (lang: "en" | "my") => void;
  t: (key: keyof typeof dict['en']) => any;
  loading: boolean;
  refreshState: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "my">("en");
  const [storeState, setStoreState] = useState<SystemState | null>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: keyof typeof dict['en']) => {
    return dict[lang][key] || dict['en'][key];
  };

  const refreshState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shops/me");
      const data = await res.json();
      
      if (data.shop) {
        setStoreState({
          config: {
            shopId: data.shop.shopId,
            publicUrl: data.shop.publicUrl,
            shopName: data.shop.businessName,
            ownerName: data.shop.ownerName || "Owner", // Fallback if missing
            phone: data.shop.phone || "",
            currency: "MMK",
            telegramBotToken: data.shop.telegramBotToken || "",
            telegramBotUsername: data.shop.telegramBotUsername || "",
            messengerPageAccessToken: "",
            messengerVerifyToken: "",
            messengerBotId: "",
            messengerBotName: "",
            onboardingCompleted: true // If shop exists, onboarding is done
          },
          products: data.shop.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: "General",
            price: p.price,
            description: p.description || "",
            stock: p.stock,
            image: p.imageUrl || ""
          })),
          deliveryZones: [],
          orders: [],
          sessions: {}
        });
      } else {
        // Fallback to initial state for onboarding
        setStoreState({
          config: {
            shopName: "Sample Shop",
            ownerName: "Owner",
            phone: "",
            currency: "MMK",
            telegramBotToken: "",
            telegramBotUsername: "",
            messengerPageAccessToken: "",
            messengerVerifyToken: "",
            messengerBotId: "",
            messengerBotName: "",
            onboardingCompleted: false
          },
          products: [],
          deliveryZones: [],
          orders: [],
          sessions: {}
        });
      }
    } catch (error) {
      console.error("Failed to fetch shop state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  return (
    <DashboardContext.Provider value={{ storeState, setStoreState, lang, setLang, t, loading, refreshState }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
