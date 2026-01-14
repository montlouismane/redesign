import React, { useRef } from 'react';
import Image from 'next/image';
import { HudPanel } from '../components/HudPanel';
import { ScrollHintArea } from '../../ScrollHintArea';
import { LiquidMetalRim } from '../components/LiquidMetalRim';
import { Paperclip, Lightbulb, Rocket, ChevronDown, ArrowUp } from 'lucide-react';

interface ChatFullViewProps {
    onClose: () => void;
    messages: { role: 'user' | 'assistant'; text: string }[];
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    onSuggestionClick: (text: string) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    chatMode: 'auto' | 'fast' | 'thinking';
    setChatMode: (mode: 'auto' | 'fast' | 'thinking') => void;
    suggestions: readonly string[];
}

export const ChatFullView = ({
    onClose,
    messages,
    input,
    setInput,
    onSend,
    onSuggestionClick,
    onFileSelect,
    chatMode,
    setChatMode,
    suggestions
}: ChatFullViewProps) => {
    const [chatModeOpen, setChatModeOpen] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // This component mirrors the full-screen chat logic from HudDashboard
    // but extracted into a clean component.

    return (
        <div
            className={
                'fixed inset-0 z-[11050] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center will-change-[opacity,transform] opacity-100 translate-y-0 scale-100 pointer-events-auto'
            }
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.92)_48%,rgba(0,0,0,0.88)_100%)] backdrop-blur-[40px]" />

            <div className="relative h-full overflow-y-auto custom-scrollbar px-[12%] pt-[clamp(92px,10vh,140px)] pb-[12%]">
                <div className="max-w-[980px] mx-auto space-y-4">
                    <HudPanel
                        title="ASK AGENT T"
                        variant="glass"
                        accentVariant="horizontal"
                        shapeVariant="a"
                        onExpandClick={onClose}
                        isCloseVariant={true}
                    >
                        {/* T-chat-logo background - barely visible */}
                        <div aria-hidden className="absolute inset-[2px] rounded-sm overflow-hidden pointer-events-none flex items-center justify-center">
                            <Image
                                src="/agents/t-chat-logo.svg"
                                alt=""
                                width={300}
                                height={300}
                                className="object-contain object-center blur-[3px]"
                                style={{ width: '20%', height: 'auto', opacity: 0.15 }}
                            />
                        </div>

                        <div className="relative h-[min(70vh,640px)] flex flex-col z-10">
                            <ScrollHintArea className="flex-1 p-4 space-y-3">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={'flex items-start gap-3 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {m.role === 'assistant' && (
                                            <LiquidMetalRim size={32} rounded="rounded-full" className="flex-shrink-0 mt-1">
                                                <Image
                                                    src="/agents/agent-t-portrait-512.jpg"
                                                    alt="Agent T"
                                                    width={32}
                                                    height={32}
                                                    className="object-cover"
                                                />
                                            </LiquidMetalRim>
                                        )}
                                        <div
                                            className={
                                                'max-w-[78%] rounded-sm px-4 py-3 text-sm leading-relaxed border ' +
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

                            <div className="border-t border-white/10 p-4 space-y-3">
                                {messages.length <= 1 ? (
                                    <div className="space-y-2">
                                        <div className="text-sm text-white/55">Try one of these:</div>
                                        <div className="grid gap-2">
                                            {suggestions.map((q) => (
                                                <button
                                                    key={q}
                                                    type="button"
                                                    onClick={() => onSuggestionClick(q)}
                                                    className="text-left px-4 py-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition-colors"
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
                                        className="h-11 w-11 flex items-center justify-center rounded-sm bg-[#0F131B]/80 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                        aria-label="Attach file"
                                    >
                                        <Paperclip size={18} />
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
                                        className="h-11 flex-1 rounded-sm bg-[#0F131B]/80 border border-white/10 px-4 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                                        autoComplete="off"
                                    />

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setChatModeOpen((v) => !v)}
                                            className="h-11 px-3 flex items-center gap-2 rounded-sm bg-[#0F131B]/80 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
                                        >
                                            {chatMode === 'thinking' ? <Lightbulb size={16} /> : chatMode === 'fast' ? <Rocket size={16} /> : null}
                                            <span className="capitalize">{chatMode}</span>
                                            <span className="ml-1"><ChevronDown size={14} /></span>
                                        </button>
                                        {chatModeOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 w-32 rounded-sm bg-[#0F131B]/95 border border-white/10 shadow-lg overflow-hidden z-50">
                                                {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => {
                                                            setChatMode(mode);
                                                            setChatModeOpen(false);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${chatMode === mode
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
                                        className="h-11 w-11 flex items-center justify-center rounded-sm bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
                                        aria-label="Send"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </HudPanel>
                </div>
            </div>
        </div>
    );
};
