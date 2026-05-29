'use client';

import React from "react";
import { useDashboard } from "../DashboardContext";
import { SmartMarketing } from "@/components/dashboard/SmartMarketing";

export default function MarketingPage() {
  const { storeState, lang } = useDashboard();

  if (!storeState) return null;

  return (
    <div className="space-y-4">
       <SmartMarketing state={storeState} lang={lang} />
    </div>
  );
}
