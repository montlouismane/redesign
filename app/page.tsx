'use client';

import { useId, ReactNode } from 'react';
import { useUiStyle } from './UiStyleProvider';
import { HudDashboard } from './HudDashboard';
import { ClassicFinanceDashboard } from './classic/ClassicFinanceDashboard';

// --- MAIN LAYOUT ---
export default function DashboardPage() {
  const { style: uiStyle } = useUiStyle();
  return uiStyle === 'hud' ? <HudDashboard /> : <ClassicDashboard />;
}

function ClassicDashboard() {
  return <ClassicFinanceDashboard />;
}
