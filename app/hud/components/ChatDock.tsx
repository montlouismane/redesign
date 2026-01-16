import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowUp, Paperclip, Lightbulb, Rocket, X } from 'lucide-react';
import { ScrollHintArea } from '../../ScrollHintArea';
import { LiquidMetalRim } from './LiquidMetalRim';

interface ChatDockProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    messages: { role: 'user' | 'assistant'; text: string }[];
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    onSuggestionClick?: (text: string) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    chatMode: 'auto' | 'fast' | 'thinking';
    setChatMode: (mode: 'auto' | 'fast' | 'thinking') => void;
    onExpand: () => void;
    suggestions: readonly string[];
    startPosition?: { x: number, y: number };
}

export const ChatDock = ({
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    onSend,
    onSuggestionClick,
    onFileSelect,
    chatMode,
    setChatMode,
    onExpand,
    suggestions,
    startPosition = { x: 0, y: 0 }
}: ChatDockProps) => {
    const [chatModeOpen, setChatModeOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [position, setPosition] = useState(startPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dockRef = useRef<HTMLDivElement>(null);

    // Global mouse listeners for dragging
    React.useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // Reset position when closed
    React.useEffect(() => {
        if (!isOpen) {
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={dockRef}
            role="dialog"
            aria-label="Agent T chat"
            className={
                'fixed z-[11040] ' +
                'w-[min(460px,92vw)] h-[min(72vh,680px)] ' +
                'transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
                'will-change-[opacity,transform,filter] pointer-events-auto ' +
                'opacity-100 translate-y-0 scale-100 blur-0 ' +
                (isDragging ? 'cursor-move' : 'cursor-default')
            }
            style={{
                right: position.x === 0 ? 'clamp(16px,2.2vw,28px)' : 'auto',
                bottom: position.y === 0 ? 'clamp(16px,2.2vw,28px)' : 'auto',
                left: position.x !== 0 ? `${position.x}px` : 'auto',
                top: position.y !== 0 ? `${position.y}px` : 'auto',
            }}
        >
            <div className="relative h-full rounded-sm overflow-hidden border border-white/12 bg-[#0E131C]/95 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
                {/* Frost gradients */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_82%_12%,rgba(217,119,6,0.12),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.15))]"
                />
                {/* Film grain */}
                <div aria-hidden className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none adamNoiseOverlay" />
                {/* Watermark logo */}
                <Image
                    src="/agents/t-chat-logo.png"
                    alt=""
                    width={560}
                    height={560}
                    className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(340px,72%)] opacity-[0.08]"
                />

                <div className="relative h-full flex flex-col">
                    {/* Header - draggable area */}
                    <div
                        className="flex items-center justify-between px-5 py-4 border-b border-white/10 cursor-move select-none"
                        onMouseDown={(e) => {
                            if (!dockRef.current) return;
                            const rect = dockRef.current.getBoundingClientRect();
                            setDragOffset({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                            });
                            setIsDragging(true);
                            e.preventDefault();
                        }}
                    >
                        <div className="flex items-center gap-3 pointer-events-none">
                            <LiquidMetalRim size={36} rounded="rounded-full">
                                <Image
                                    src="/agents/agent-t-portrait-512.jpg"
                                    alt="Agent T"
                                    width={36}
                                    height={36}
                                    className="object-cover"
                                />
                            </LiquidMetalRim>
                            <div>
                                <div className="text-sm font-semibold text-white">Agent T</div>
                                <div className="text-[10px] text-white/50">Quick chat · Drag to move</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto">
                            <button
                                type="button"
                                onClick={onExpand}
                                className="px-3 py-1.5 rounded-sm border border-white/10 text-xs text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Expand
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollHintArea className="flex-1 px-5 py-4 space-y-3">
                        {messages.map((m, idx) => (
                            <div key={idx} className={'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div
                                    className={
                                        'max-w-[85%] rounded-sm px-3 py-2 text-xs leading-relaxed border ' +
                                        (m.role === 'user'
                                            ? 'bg-white/10 text-white border-white/10'
                                            : 'bg-black/25 text-white/85 border-white/5')
                                    }
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </ScrollHintArea>

                    {/* Input */}
                    <div className="border-t border-white/10 p-4 space-y-2">
                        {messages.length <= 1 ? (
                            <div className="space-y-2">
                                <div className="text-[11px] text-white/55">Try one of these:</div>
                                <div className="grid gap-2">
                                    {suggestions.map((q) => (
                                        <button
                                            key={q}
                                            type="button"
                                            onClick={() => onSuggestionClick ? onSuggestionClick(q) : setInput(q)}
                                            className="text-left px-3 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={onFileSelect}
                                accept="*/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-9 w-9 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Attach file"
                            >
                                <Paperclip size={16} />
                            </button>

                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onSend();
                                    }
                                }}
                                placeholder="What do you want to know?"
                                className="h-9 flex-1 rounded-sm bg-white/5 border border-white/10 px-3 text-xs text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                                autoComplete="off"
                            />

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setChatModeOpen((v) => !v)}
                                    className="h-9 px-2.5 flex items-center gap-1.5 rounded-sm bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[10px]"
                                >
                                    {chatMode === 'thinking' ? <Lightbulb size={12} /> : chatMode === 'fast' ? <Rocket size={12} /> : null}
                                    <span className="capitalize">{chatMode}</span>
                                    <ChevronDown size={10} />
                                </button>
                                {chatModeOpen && (
                                    <div className="absolute bottom-full right-0 mb-2 w-28 rounded-sm bg-[#0F131B]/95 border border-white/10 shadow-lg overflow-hidden z-50">
                                        {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => {
                                                    setChatMode(mode);
                                                    setChatModeOpen(false);
                                                }}
                                                className={`w-full px-2.5 py-1.5 text-left text-[10px] transition-colors ${chatMode === mode
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span className="capitalize">{mode}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onSend}
                                className="h-9 w-9 flex items-center justify-center rounded-sm bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
                                aria-label="Send"
                            >
                                <ArrowUp size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
