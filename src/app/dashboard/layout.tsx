'use client';

import React, { useState } from "react";
import {
  TrendingUp,
  Edit2,
  ExternalLink,
  Smartphone,
  Send
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardProvider, useDashboard } from "./DashboardContext";

import { TelegramSimulator } from "@/components/dashboard/TelegramSimulator";
import { TelegramSession } from "@/types/dashboard";
import { LogoutButton } from "@/components/LogoutButton";
import { Onboarding } from "@/components/dashboard/Onboarding";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storeState, setStoreState, lang, setLang, t, refreshState } = useDashboard();
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const pathname = usePathname();

  // Mock session for simulator
  const mockSession: TelegramSession = {
    sessionId: "mock-session",
    customerName: "Mock Customer",
    customerPhone: "091234567",
    customerTelegramId: "12345678",
    messages: [
      { id: "1", sender: "system", content: "Bot started", timestamp: new Date().toISOString() }
    ],
    lastActive: new Date().toISOString(),
    currentStep: "browsing",
    cart: [],
    liveTakeoverActive: false
  };

  const navItems = [
    { id: "orders", label: t("tabOrders"), href: "/dashboard/orders" },
    { id: "products", label: t("tabProducts"), href: "/dashboard/products" },
    { id: "delivery", label: t("tabDelivery"), href: "/dashboard/delivery" },
    { id: "insights", label: t("tabInsights"), href: "/dashboard/insights" },
    { id: "config", label: t("tabConfig"), href: "/dashboard/config" },
    { id: "support", label: t("tabLiveSupport"), href: "/dashboard/support" },
    { id: "marketing", label: t("tabSmartMarketing"), href: "/dashboard/marketing" },
  ];

  if (!storeState) return null;

  // Onboarding Intercept
  if (!storeState.config.onboardingCompleted) {
    return (
      <Onboarding
        lang={lang}
        initialShopName={storeState.config.shopName}
        initialOwnerName={storeState.config.ownerName}
        onLangChange={setLang}
        onComplete={async (profile) => {
          setStoreState((prev) => 
            prev ? {
              ...prev,
              config: {
                ...prev.config,
                shopName: profile.shopName,
                ownerName: profile.ownerName,
                onboardingCompleted: true
              }
            } : prev
          );
          // Optional: persist to backend here if needed
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white pb-12 relative overflow-hidden">
      
      {/* Abstract Background soft blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Elegant Minimalist Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-sky-100 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-slate-900 flex items-center justify-center shadow-xs font-bold text-lg select-none shrink-0 border border-sky-200/40">
            <TrendingUp size={18} className="text-sky-700" />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center">
              <h1 className="text-xs font-extrabold tracking-widest uppercase font-mono text-slate-900">
                {t("appName")}
              </h1>
              <span className="self-center text-[8px] font-bold bg-sky-50 text-slate-800 px-1.5 py-0.5 rounded uppercase tracking-widest border border-sky-200/50">
                {t("smeHubTab")}
              </span>
            </div>
          </div>
        </div>

        {/* Global Control Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          <button
            onClick={() => {
              setStoreState((prev) => 
                prev ? {
                  ...prev,
                  config: {
                    ...prev.config,
                    onboardingCompleted: false
                  }
                } : prev
              );
            }}
            className="flex items-center gap-1.5 text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1.5 px-3 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
          >
            <Edit2 size={11} className="text-indigo-600 animate-pulse" />
            <span>{t("editBusinessProfile")}</span>
          </button>

          {/* Language switch */}
          <div className="flex bg-sky-50 p-0.5 rounded-lg border border-sky-200 shrink-0">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                lang === "en" ? "bg-white text-slate-900 shadow-xs border border-sky-100" : "text-slate-500 hover:text-black"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("my")}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                lang === "my" ? "bg-white text-slate-900 shadow-xs border border-sky-100" : "text-slate-500 hover:text-black"
              }`}
            >
              မြန်မာ
            </button>
          </div>

          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              showSimulator 
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950" 
                : "bg-black hover:bg-slate-800 text-white"
            }`}
          >
            <Smartphone size={12} />
            <span>{showSimulator ? t("closeSimulatorButton") : t("viewSimulatorButton")}</span>
          </button>

          {storeState.config.telegramBotUsername && (
            <a
              href={`https://t.me/${storeState.config.telegramBotUsername.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#229ED9] hover:bg-[#34aadf] text-white flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer border border-[#229ED9]/25 hover:border-white/20"
            >
              <Send size={11} className="rotate-45" />
              <span>{t("liveBot")}</span>
              <ExternalLink size={10} className="opacity-70" />
            </a>
          )}

          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
          <LogoutButton className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold hover:bg-slate-200 transition-colors" />
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* LEFT COLUMN: PRIMARY SME OWNERS WORKSPACE */}
        <main className={`transition-all duration-300 ${showSimulator ? "lg:col-span-8" : "lg:col-span-12"} space-y-6`}>
          
          {/* TAB NAVIGATION BAR */}
          <nav className="flex flex-wrap items-center gap-1.5 border-b border-sky-200 pb-px font-medium mb-6">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  pathname === item.href
                    ? "border-black text-black" 
                    : "border-transparent text-slate-500 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={refreshState}
              className="ml-auto text-[9px] font-mono font-bold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-md cursor-pointer tracking-wider shrink-0"
            >
              {t("resetDemoState")}
            </button>
          </nav>

          {children}
        </main>

        {/* RIGHT COLUMN: SIMULATOR (Conditional) */}
        {showSimulator && (
          <aside className="lg:col-span-4 animate-fadeIn">
            <TelegramSimulator
              session={mockSession}
              products={storeState.products}
              deliveryZones={storeState.deliveryZones}
              onStateUpdated={refreshState}
              onSendReply={async (t) => { alert("Send reply: " + t); }}
              onTriggerTakeover={async () => { alert("Takeover triggered"); }}
              onTriggerRelease={async () => { alert("Release triggered"); }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
