'use client';

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";

export default function SupportPage() {
  const { storeState, t } = useDashboard();
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  if (!storeState) return null;

  const sessions = Object.values(storeState.sessions);

  return (
    <section className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <h3 className="text-xs font-extrabold font-mono text-slate-900 uppercase">
          {t("liveSupportRoomHeader")}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-slate-700">
        <div className="md:col-span-1 space-y-2 border-r border-slate-100 pr-4">
          <span className="text-[9px] font-bold font-mono text-slate-400 block tracking-wide uppercase">{t("activeUserSessionsLabel")}</span>
          {sessions.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic">No active sessions.</p>
          ) : (
            sessions.map((sess) => (
              <div key={sess.sessionId} className="p-3 rounded-xl border border-slate-200">
                {sess.customerName}
              </div>
            ))
          )}
        </div>
        <div className="md:col-span-2 min-h-[240px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
           <p className="text-xs text-slate-400 italic">{t("noMessagesChosen")}</p>
        </div>
      </div>
    </section>
  );
}
