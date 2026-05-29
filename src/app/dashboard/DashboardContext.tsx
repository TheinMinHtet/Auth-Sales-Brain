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
    // TODO: Connect database later
    // For now, use mock data
    setStoreState({
      config: {
        shopName: "Sample Shop",
        ownerName: "Owner",
        phone: "09123456789",
        currency: "MMK",
        telegramBotToken: "",
        telegramBotUsername: "sample_bot",
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
    setLoading(false);
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
