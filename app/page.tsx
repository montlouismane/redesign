'use client';

import { useUiStyle } from './UiStyleProvider';
import { HudView as HudDashboard } from './hud/HudView';
import { ClassicFinanceDashboard } from './classic/ClassicFinanceDashboard';
import { AuthGate } from './hud/components/auth';
import { ThreeBackground } from './hud/components/ThreeBackground';
import { VideoBackground } from './hud/components/VideoBackground';
import { useState, useEffect } from 'react';

// Background wrapper for auth screen
function AuthBackground() {
  const [visualMode, setVisualMode] = useState<'quality' | 'performance'>('performance');

  useEffect(() => {
    // Load saved visual mode preference
    try {
      const saved = localStorage.getItem('adam_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.visualMode) {
          setVisualMode(parsed.visualMode);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      {visualMode === 'quality' ? (
        <ThreeBackground />
      ) : (
        <VideoBackground />
      )}
    </div>
  );
}

// Main dashboard page
export default function DashboardPage() {
  const { style: uiStyle } = useUiStyle();

  return (
    <>
      {/* Background for auth screen */}
      <AuthBackground />

      {/* Auth gate wraps the dashboard */}
      <AuthGate>
        {uiStyle === 'hud' ? <HudDashboard /> : <ClassicDashboard />}
      </AuthGate>
    </>
  );
}

function ClassicDashboard() {
  return <ClassicFinanceDashboard />;
}
