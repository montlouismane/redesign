import React from 'react';
import Image from 'next/image';
import { LiquidMetalRim } from './LiquidMetalRim';

interface FloatingChatFabProps {
    onClick: () => void;
}

export const FloatingChatFab = ({ onClick }: FloatingChatFabProps) => {
    return (
        <div className="fixed bottom-8 right-8 z-[11060] pointer-events-auto">
            <button
                type="button"
                onClick={onClick}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center relative shadow-[0_10px_30px_rgba(217,119,6,0.4)] hover:scale-110 transition-transform group"
                aria-label="Talk to Agent T"
            >
                <LiquidMetalRim size={70} rounded="rounded-full">
                    <Image
                        src="/agents/agent-t-portrait-512.jpg"
                        alt="Agent T"
                        fill
                        sizes="70px"
                        className="object-cover"
                    />
                </LiquidMetalRim>
            </button>
        </div>
    );
};
