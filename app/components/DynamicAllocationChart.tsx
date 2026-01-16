'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { interpolate } from 'flubber';
import { useSpring, animated } from '@react-spring/web';

export interface ChartItem {
  id: string;
  label: string;
  value: number; // Percentage (0-100)
  color: string;
}

interface DynamicAllocationChartProps {
  data: ChartItem[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
  externalHover?: string | null;
  onHover?: (id: string | null) => void;
}

const DynamicAllocationChart: React.FC<DynamicAllocationChartProps> = ({
  data,
  className = '',
  size = 'medium',
  externalHover,
  onHover
}) => {
  const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');
  const [isAnimating, setIsAnimating] = useState(false);
  const [internalHover, setInternalHover] = useState<string | null>(null);

  // Use external control if provided, otherwise internal state
  const hoveredAsset = externalHover !== undefined ? externalHover : internalHover;
  const setHoveredAsset = (id: string | null) => {
    if (onHover) onHover(id);
    else setInternalHover(id);
  };

  // React Spring animation for morphing
  const { progress } = useSpring({
    progress: chartMode === 'donut' ? 0 : 1,
    config: {
      tension: 180,
      friction: 25,
      mass: 0.8,
      clamp: false,
    },
    onStart: () => setIsAnimating(true),
    onRest: () => setIsAnimating(false),
  });

  const sizeClasses = {
    small: { chart: 'w-24 h-24', bar: 'h-2', text: 'text-xs' },
    medium: { chart: 'w-32 h-32', bar: 'h-3', text: 'text-sm' },
    large: { chart: 'w-40 h-40', bar: 'h-4', text: 'text-base' }
  };

  const currentSize = sizeClasses[size];

  // Helper function to generate arc paths for donut segments
  const generateArcPath = (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    const start = startAngle;
    const end = Math.max(start + 0.01, endAngle); // Ensure at least tiny segment

    const startAngleRad = (start * Math.PI) / 180;
    const endAngleRad = (end * Math.PI) / 180;

    const x1 = cx + innerR * Math.cos(startAngleRad);
    const y1 = cy + innerR * Math.sin(startAngleRad);
    const x2 = cx + outerR * Math.cos(startAngleRad);
    const y2 = cy + outerR * Math.sin(startAngleRad);
    const x3 = cx + outerR * Math.cos(endAngleRad);
    const y3 = cy + outerR * Math.sin(endAngleRad);
    const x4 = cx + innerR * Math.cos(endAngleRad);
    const y4 = cy + innerR * Math.sin(endAngleRad);

    const largeArcFlag = end - start > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
  };

  // Memoize path segments
  const segments = useMemo(() => {
    // Sort data for consistent rendering order (optional, but good for donuts)
    // For now we assume data is passed in desired order

    // Config
    const centerX = 50;
    const centerY = 50;
    const outerRadius = 40;
    const innerRadius = 20;

    // --- Donut Calculations ---
    let currentAngle = -90;
    const donutPaths: string[] = [];

    // --- Bar Calculations ---
    const barWidth = 12; // Slightly narrower to fit more
    const barSpacing = 6;
    const totalContentWidth = (barWidth * data.length) + (barSpacing * (data.length - 1));
    const startX = (100 - totalContentWidth) / 2;
    const maxValue = Math.max(...data.map(d => d.value), 10); // avoid div/0, generic scaling
    const barPaths: string[] = [];
    const barLabelPositions: { x: number, y: number }[] = [];

    // IMPORTANT: Make sure total sum matches 360 for donut, or scales appropriate if < 100%
    // If input is percentages that sum to 100, we map 0-100 to 0-360.
    const totalPercentage = data.reduce((acc, d) => acc + d.value, 0);
    // If total < 100, we might want to normalize or just show partial donut. 
    // Let's assume typical usage corresponds to 100% or "rest is empty". 
    // For visual coherence, if total is significantly less (e.g. top 5 don't sum to 100), 
    // the donut will have a gap. That is actually correct representation.

    data.forEach((item, index) => {
      // 1. Donut Segment
      const sweepAngle = (item.value / 100) * 360;
      const endAngle = currentAngle + sweepAngle;
      donutPaths.push(generateArcPath(centerX, centerY, innerRadius, outerRadius, currentAngle, endAngle));
      currentAngle = endAngle;

      // 2. Bar Segment
      const barHeight = Math.max((item.value / maxValue) * 60, 2); // Max height 60 to leave room
      const bx = startX + (index * (barWidth + barSpacing));
      const by = 85 - barHeight;
      const barPath = `M${bx},${85} L${bx + barWidth},${85} L${bx + barWidth},${by} L${bx},${by} Z`;
      barPaths.push(barPath);

      barLabelPositions.push({
        x: bx + barWidth / 2,
        y: 85
      });
    });

    // Create interpolators
    const interpolators = donutPaths.map((dp, i) =>
      interpolate(dp, barPaths[i], { maxSegmentLength: 2, string: true })
    );

    return {
      interpolators,
      barLabelPositions
    };
  }, [data]);

  const toggleChartType = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal opening
    if (isAnimating) return;
    setChartMode(prev => prev === 'donut' ? 'bar' : 'donut');
    setHoveredAsset(null);
  }, [isAnimating]);

  const renderChart = () => {
    return (
      <div className="relative">
        <svg
          className={`${currentSize.chart} transition-all duration-300 ease-out`}
          viewBox="0 0 100 100"
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5))',
            background: 'transparent'
          }}
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(196,124,72,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background grid */}
          <animated.rect
            x="5"
            y="10"
            width="90"
            height="80"
            fill="url(#grid)"
            opacity={progress.to([0, 0.5, 1], [0, 0, 0.15])}
            rx="2"
          />

          {/* Axis lines */}
          <animated.g opacity={progress.to([0, 0.5, 1], [0, 0, 0.4])}>
            <line x1="5" y1="85" x2="95" y2="85" stroke="rgba(196, 124, 72, 0.3)" strokeWidth="0.5" />
            <line x1="5" y1="85" x2="5" y2="10" stroke="rgba(196, 124, 72, 0.3)" strokeWidth="0.5" />
          </animated.g>

          {/* Segments */}
          {data.map((item, i) => {
            const isHovered = hoveredAsset === item.id;
            // We can't use simple useSpring here for dynamic list efficiently inside the loop 
            // without strict key management or useSprings. 
            // To keep it simple and performant, we'll use CSS based transforms for the "pop" effect
            // applied to the path via class/style, since the path string itself is the heavy animated part via 'progress'.

            return (
              <animated.path
                key={item.id}
                d={progress.to(p => segments.interpolators[i](p))}
                fill={item.color}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="0.5"
                style={{
                  transformOrigin: '50% 50%',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  opacity: hoveredAsset ? (isHovered ? 1 : 0.5) : 0.9,
                }}
                onMouseEnter={() => setHoveredAsset(item.id)}
                onMouseLeave={() => setHoveredAsset(null)}
                className="cursor-pointer transition-all duration-200 ease-out"
              />
            );
          })}

        </svg>

        {/* Floating Tooltip/Label (Donut Mode Only) */}
        <animated.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: progress.to(p => (1 - p) * (hoveredAsset ? 1 : 0)),
            transform: progress.to(p => `scale(${hoveredAsset ? 1 : 0.95})`)
          }}
        >
          {hoveredAsset && (() => {
            const item = data.find(d => d.id === hoveredAsset);
            if (!item) return null;
            return (
              <div className="text-center">
                <div className={`font-bold ${size === 'large' ? 'text-lg' : 'text-base'} text-[#e8e8ee] leading-tight uppercase`}>
                  {item.label}
                </div>
                <div className="text-[12px] font-bold" style={{ color: item.color }}>
                  {item.value}%
                </div>
              </div>
            );
          })()}
        </animated.div>

        {/* Bar labels (Simple list at bottom) */}
        <animated.div
          className="absolute bottom-0 left-0 right-0 px-2 pb-0.5 pointer-events-none"
          style={{
            opacity: progress.to([0, 0.7, 1], [0, 0, 1]),
            transform: progress.to(p => `translateY(${(1 - p) * 10}px)`)
          }}
        >
          <div className="relative w-full h-4">
            {data.map((item, i) => {
              const pos = segments.barLabelPositions[i];
              const isHovered = hoveredAsset === item.id;
              return (
                <div
                  key={item.id}
                  className={`absolute top-0 font-bold uppercase transition-colors duration-200 text-[8px] text-center w-8`}
                  style={{
                    left: `${pos.x}%`,
                    transform: 'translateX(-50%)',
                    color: isHovered ? item.color : 'rgba(255,255,255,0.4)',
                    opacity: hoveredAsset && !isHovered ? 0.3 : 1
                  }}
                >
                  {item.label.substring(0, 3)}
                </div>
              );
            })}
          </div>
        </animated.div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="cursor-pointer group relative overflow-hidden transition-all duration-300 w-full flex justify-center py-4"
        onClick={toggleChartType}
      >
        {renderChart()}

        {/* Morph hint */}
        {!isAnimating && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity">
            {chartMode === 'donut' ? <BarChart3 className="w-3 h-3 text-[#a7a7b5]" /> : <PieChart className="w-3 h-3 text-[#a7a7b5]" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicAllocationChart;