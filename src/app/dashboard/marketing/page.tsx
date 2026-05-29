'use client';

import React from "react";
import { useDashboard } from "../DashboardContext";
import { SmartMarketing } from "@/components/dashboard/SmartMarketing";

export default function MarketingPage() {
  const { storeState, t } = useDashboard();

  if (!storeState) return null;

  return (
    <div className="space-y-4">
       <SmartMarketing lang={useDashboard().lang} />
    </div>
  );
}
