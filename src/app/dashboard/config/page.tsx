'use client';

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Send, ExternalLink } from "lucide-react";

export default function ConfigPage() {
  const { storeState, t, lang } = useDashboard();
  const [botConnectionTab, setBotConnectionTab] = useState<"telegram" | "messenger">("telegram");

  if (!storeState) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm text-slate-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xs font-extrabold font-mono text-slate-900 flex items-center gap-2 mb-1 uppercase">
              {t("tabConfig")}
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 w-fit">
            <button
              onClick={() => setBotConnectionTab("telegram")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                botConnectionTab === "telegram" ? "bg-[#229ED9] text-white shadow-sm" : "text-slate-600"
              }`}
            >Telegram</button>
            <button
              onClick={() => setBotConnectionTab("messenger")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                botConnectionTab === "messenger" ? "bg-[#0A7CFF] text-white shadow-sm" : "text-slate-600"
              }`}
            >Messenger</button>
          </div>
        </div>

        {botConnectionTab === "telegram" && (
          <div className="mt-6 space-y-4">
             <div className="space-y-1">
                <label className="text-[9px] font-semibold text-slate-400 uppercase block">{t("storeNameLabel")}</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono" defaultValue={storeState.config.shopName} />
             </div>
             <button className="w-full bg-[#0f1d3a] hover:bg-indigo-900 text-white font-bold py-3 rounded-xl cursor-pointer uppercase text-xs tracking-wider">
               {t("saveStoreSettingsBtn")}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
