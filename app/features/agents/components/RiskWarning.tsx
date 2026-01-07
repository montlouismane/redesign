'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskWarningProps {
  message: string;
  variant?: 'warning' | 'danger';
  className?: string;
}

export function RiskWarning({
  message,
  variant = 'warning',
  className = '',
}: RiskWarningProps) {
  const Icon = variant === 'danger' ? ShieldAlert : AlertTriangle;
  const colors = {
    warning: {
      bg: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.3)',
      text: 'rgb(234, 179, 8)',
      icon: 'rgb(234, 179, 8)',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'rgb(239, 68, 68)',
      icon: 'rgb(239, 68, 68)',
    },
  };

  const c = colors[variant];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg ${className}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <Icon
        size={20}
        className="flex-shrink-0 mt-0.5"
        style={{ color: c.icon }}
      />
      <p className="text-sm leading-relaxed" style={{ color: c.text }}>
        {message}
      </p>
    </div>
  );
}
