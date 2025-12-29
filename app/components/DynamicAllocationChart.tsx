'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { interpolate } from 'flubber';
import { useSpring, animated } from '@react-spring/web';

interface AllocationData {
  solPct: number;
  adaPct: number;
  otherPct: number;
  totalValue?: string;
}

interface DynamicAllocationChartProps {
  data: AllocationData;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const DynamicAllocationChart: React.FC<DynamicAllocationChartProps> = ({
  data,
  className = '',
  size = 'medium'
}) => {
  const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredAsset, setHoveredAsset] = useState<'sol' | 'ada' | 'other' | null>(null);

  // React Spring animation for morphing (gallery-style physics)
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

  // Spring for hover highlights
  const solHover = useSpring({ transform: hoveredAsset === 'sol' ? 'scale(1.02)' : 'scale(1)', opacity: hoveredAsset === 'sol' ? 1 : 0.85 });
  const adaHover = useSpring({ transform: hoveredAsset === 'ada' ? 'scale(1.02)' : 'scale(1)', opacity: hoveredAsset === 'ada' ? 1 : 0.75 });
  const otherHover = useSpring({ transform: hoveredAsset === 'other' ? 'scale(1.02)' : 'scale(1)', opacity: hoveredAsset === 'other' ? 1 : 0.7 });

  // Subtle copper-themed color palette
  const colors = {
    sol: {
      primary: 'rgba(196, 124, 72, 0.85)',    // copper
      accent: 'rgba(196, 124, 72, 0.95)'      // copper highlight
    },
    ada: {
      primary: 'rgba(45, 212, 191, 0.75)',    // teal
      accent: 'rgba(45, 212, 191, 0.9)'       // bright teal
    },
    other: {
      primary: 'rgba(42, 48, 60, 0.7)',       // dark slate
      accent: 'rgba(42, 48, 60, 0.85)'        // slate highlight
    }
  };

  const sizeClasses = {
    small: { chart: 'w-24 h-24', bar: 'h-2', text: 'text-xs' },
    medium: { chart: 'w-32 h-32', bar: 'h-3', text: 'text-sm' },
    large: { chart: 'w-40 h-40', bar: 'h-4', text: 'text-base' }
  };

  const currentSize = sizeClasses[size];

  // Helper function to generate arc paths for donut segments
  const generateArcPath = (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    // Ensure we don't have exactly 0 or 360 degrees which can break paths
    const start = startAngle;
    const end = Math.max(start + 0.01, endAngle);
    
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

  // Memoize path segments to avoid unnecessary re-calculations
  const segments = useMemo(() => {
    const { solPct, adaPct, otherPct } = data;
    const centerX = 50;
    const centerY = 50;
    const outerRadius = 40;
    const innerRadius = 20;

    // Donut Paths
    const solD = generateArcPath(centerX, centerY, innerRadius, outerRadius, -90, -90 + (solPct / 100) * 360);
    const adaStart = -90 + (solPct / 100) * 360;
    const adaD = generateArcPath(centerX, centerY, innerRadius, outerRadius, adaStart, adaStart + (adaPct / 100) * 360);
    const otherStart = adaStart + (adaPct / 100) * 360;
    const otherD = generateArcPath(centerX, centerY, innerRadius, outerRadius, otherStart, otherStart + (otherPct / 100) * 360);

    // Bar Paths
    const values = [solPct, adaPct, otherPct];
    const maxValue = Math.max(...values, 1);
    const barWidth = 16;
    const barSpacing = 8;
    const totalBarWidth = (barWidth * 3) + (barSpacing * 2);
    const startX = (100 - totalBarWidth) / 2;

    const getBarPath = (index: number, value: number) => {
      const barHeight = Math.max((value / maxValue) * 70, 2); // Min height of 2
      const x = startX + (index * (barWidth + barSpacing));
      const y = 85 - barHeight;
      return `M${x},${85} L${x + barWidth},${85} L${x + barWidth},${y} L${x},${y} Z`;
    };

    const solB = getBarPath(0, solPct);
    const adaB = getBarPath(1, adaPct);
    const otherB = getBarPath(2, otherPct);

    // Interpolators
    return {
      sol: interpolate(solD, solB, { maxSegmentLength: 2, string: true }),
      ada: interpolate(adaD, adaB, { maxSegmentLength: 2, string: true }),
      other: interpolate(otherD, otherB, { maxSegmentLength: 2, string: true }),
      solPos: { x: startX + barWidth / 2, y: 85 - (solPct / maxValue) * 70 },
      adaPos: { x: startX + barWidth + barSpacing + barWidth / 2, y: 85 - (adaPct / maxValue) * 70 },
      otherPos: { x: startX + (barWidth + barSpacing) * 2 + barWidth / 2, y: 85 - (otherPct / maxValue) * 70 },
      solCenter: { x: centerX + (innerRadius + outerRadius) / 2 * Math.cos(((-90 + (solPct / 200) * 360) * Math.PI) / 180), y: centerY + (innerRadius + outerRadius) / 2 * Math.sin(((-90 + (solPct / 200) * 360) * Math.PI) / 180) },
      adaCenter: { x: centerX + (innerRadius + outerRadius) / 2 * Math.cos(((adaStart + (adaPct / 200) * 360) * Math.PI) / 180), y: centerY + (innerRadius + outerRadius) / 2 * Math.sin(((adaStart + (adaPct / 200) * 360) * Math.PI) / 180) },
      otherCenter: { x: centerX + (innerRadius + outerRadius) / 2 * Math.cos(((otherStart + (otherPct / 200) * 360) * Math.PI) / 180), y: centerY + (innerRadius + outerRadius) / 2 * Math.sin(((otherStart + (otherPct / 200) * 360) * Math.PI) / 180) }
    };
  }, [data]);

  const toggleChartType = useCallback(() => {
    if (isAnimating) return;
    setChartMode(prev => prev === 'donut' ? 'bar' : 'donut');
    setHoveredAsset(null); // Clear hover when switching to avoid glitchy text
  }, [isAnimating]);

  const renderChart = () => {
    const { solPct, adaPct, otherPct, totalValue } = data;

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
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(196,124,72,0.05)" strokeWidth="0.5"/>
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
            <line x1="5" y1="85" x2="95" y2="85" stroke="rgba(196, 124, 72, 0.3)" strokeWidth="0.5"/>
            <line x1="5" y1="85" x2="5" y2="10" stroke="rgba(196, 124, 72, 0.3)" strokeWidth="0.5"/>
          </animated.g>

          {/* SOL Segment */}
          <animated.path
            d={progress.to(p => segments.sol(p))}
            fill={colors.sol.primary}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
            style={solHover}
            onMouseEnter={() => setHoveredAsset('sol')}
            onMouseLeave={() => setHoveredAsset(null)}
            className="cursor-pointer transition-colors duration-200"
          />

          {/* ADA Segment */}
          <animated.path
            d={progress.to(p => segments.ada(p))}
            fill={colors.ada.primary}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
            style={adaHover}
            onMouseEnter={() => setHoveredAsset('ada')}
            onMouseLeave={() => setHoveredAsset(null)}
            className="cursor-pointer transition-colors duration-200"
          />

          {/* Other Segment */}
          <animated.path
            d={progress.to(p => segments.other(p))}
            fill={colors.other.primary}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
            style={otherHover}
            onMouseEnter={() => setHoveredAsset('other')}
            onMouseLeave={() => setHoveredAsset(null)}
            className="cursor-pointer transition-colors duration-200"
          />

          {/* Value labels on bars */}
          <animated.g opacity={progress.to([0, 0.8, 1], [0, 0, 1])}>
            <text 
              x={segments.solPos.x} 
              y={segments.solPos.y - 6} 
              textAnchor="middle" 
              className={`transition-colors duration-200 ${hoveredAsset === 'sol' ? 'fill-[#c47c48]' : 'fill-[#e8e8ee]'} font-bold`}
              style={{ fontSize: '8px' }}
            >
              {solPct}%
            </text>
            <text 
              x={segments.adaPos.x} 
              y={segments.adaPos.y - 6} 
              textAnchor="middle" 
              className={`transition-colors duration-200 ${hoveredAsset === 'ada' ? 'fill-[#2dd4bf]' : 'fill-[#e8e8ee]'} font-bold`}
              style={{ fontSize: '8px' }}
            >
              {adaPct}%
            </text>
            <text 
              x={segments.otherPos.x} 
              y={segments.otherPos.y - 6} 
              textAnchor="middle" 
              className={`transition-colors duration-200 ${hoveredAsset === 'other' ? 'fill-[#a7a7b5]' : 'fill-[#e8e8ee]'} font-bold`}
              style={{ fontSize: '8px' }}
            >
              {otherPct}%
            </text>
          </animated.g>
        </svg>

        {/* Floating Tooltip/Label (Donut Mode Only) */}
        <animated.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: progress.to(p => (1 - p) * (hoveredAsset ? 1 : 0)),
            transform: progress.to(p => `scale(${hoveredAsset ? 1 : 0.95})`)
          }}
        >
          <div className="text-center">
            <div className={`font-bold ${size === 'large' ? 'text-lg' : 'text-base'} text-[#e8e8ee] leading-tight uppercase`}>
              {hoveredAsset === 'sol' ? 'SOL' : hoveredAsset === 'ada' ? 'ADA' : 'Other'}
            </div>
            <div className="text-[12px] text-[#c47c48] font-bold">
              {hoveredAsset === 'sol' ? solPct : hoveredAsset === 'ada' ? adaPct : otherPct}%
            </div>
          </div>
        </animated.div>

        {/* Bar labels (gallery-style positioning) */}
        <animated.div
          className="absolute bottom-0 left-0 right-0 px-2 pb-0.5 pointer-events-none"
          style={{
            opacity: progress.to([0, 0.7, 1], [0, 0, 1]),
            transform: progress.to(p => `translateY(${(1 - p) * 10}px)`)
          }}
        >
          {(() => {
            const values = [solPct, adaPct, otherPct];
            const maxValue = Math.max(...values, 1);
            const barWidth = 16;
            const barSpacing = 8;
            const totalBarWidth = (barWidth * 3) + (barSpacing * 2);
            const startX = (100 - totalBarWidth) / 2;

            return (
              <div className="relative w-full h-4">
                {['SOL', 'ADA', 'Other'].map((label, index) => {
                  const x = startX + (index * (barWidth + barSpacing)) + barWidth / 2;
                  const asset = label.toLowerCase() as 'sol' | 'ada' | 'other';
                  return (
                    <div 
                      key={label}
                      className={`absolute top-0 font-bold uppercase transition-colors duration-200 text-[10px]`}
                      style={{ 
                        left: `${x}%`, 
                        transform: 'translateX(-50%)',
                        color: hoveredAsset === asset 
                          ? (asset === 'sol' ? '#c47c48' : asset === 'ada' ? '#2dd4bf' : '#a7a7b5') 
                          : '#e8e8ee'
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            );
          })()}
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

        {/* Morph hint (fades in on hover) */}
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