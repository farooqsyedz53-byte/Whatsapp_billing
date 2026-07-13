/**
 * Dashboard statistics card with icon, animated value, and label.
 * Features a gradient accent and hover lift effect.
 */

'use client';

import React, { useEffect, useState } from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: string;
  accentColor: string; // Tailwind gradient classes
}

export default function StatsCard({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  accentColor,
}: StatsCardProps) {
  // Count-up animation on mount
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800; // ms
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(stepValue * step, value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value]);

  /** Format number for display */
  const formatValue = (val: number): string => {
    if (val >= 100000) {
      return (val / 100000).toFixed(1) + 'L';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toFixed(val % 1 === 0 ? 0 : 2);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
      {/* Gradient accent bar at the top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentColor} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {prefix}
            {formatValue(displayValue)}
            {suffix}
          </p>
          {trend && (
            <p className="text-xs text-emerald-400 mt-1.5 font-medium">{trend}</p>
          )}
        </div>

        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
