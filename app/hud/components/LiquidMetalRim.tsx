import React from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';

interface LiquidMetalRimProps {
    children?: React.ReactNode;
    className?: string;
    size?: number;
    rounded?: string; // e.g. 'rounded-sm', 'rounded-full'
}

export const LiquidMetalRim = ({
    children,
    className = "",
    size = 36,
    rounded = "rounded-sm"
}: LiquidMetalRimProps) => {
    return (
        <div className={`relative ${rounded} flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size }}>
            <div className="absolute inset-0 z-0">
                <LiquidMetal
                    speed={1} softness={0.24} repetition={2} shiftRed={0} shiftBlue={0}
                    distortion={0.21} contour={0.31} scale={1.16} rotation={0} shape={rounded === 'rounded-full' ? 'circle' : 'none'}
                    angle={322} frame={166287.5} colorBack="#00000000" colorTint="#cba135"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className={`relative z-10 ${rounded} overflow-hidden border border-black/20 bg-[#0E131C]`} style={{ width: size - 4, height: size - 4 }}>
                {children}
            </div>
        </div>
    );
};
