'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowUp, 
  Paperclip, 
  Rocket, 
  Lightbulb, 
  Minimize2, 
  Maximize2,
  X, 
  ChevronDown,
  ShieldCheck 
} from 'lucide-react';
import { ClassicFinanceHeader } from './ClassicFinanceHeader';
import { TotalPortfolioValueCard } from './components/TotalPortfolioValueCard';
import { ActiveStrategiesCard } from './components/ActiveStrategiesCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { AssetAllocationCard } from './components/AssetAllocationCard';
import { CashTransfersCard, SupportGuidanceCard } from './components/SupportCashCards';
import { StrategyUpdatesCard } from './components/StrategyUpdatesCard';
import { StrategiesListView } from './views/StrategiesListView';

export function ClassicFinanceDashboard() {
  const router = useRouter();
  const [view, setView] = useState<'dashboard' | 'portfolios' | 'strategies' | 'markets' | 'support' | 'chatFull'>('dashboard');
  const [range, setRange] = useState('1Y');

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Chat state
  const [isChatDockOpen, setIsChatDockOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'auto' | 'fast' | 'thinking'>('auto');
  const [chatModeOpen, setChatModeOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hi - I'm Agent T. How can I help with your portfolio today?" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputDockRef = useRef<HTMLInputElement>(null);

  const chatStarters = [
    'Explain the risk level of Balanced Income',
    'How do I add more funds to my account?',
    'Review my recent rebalancing activity',
  ] as const;

  const sendChatText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setChatInput('');

    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: chatMode === 'thinking' ? 'Analyzing your request... (Demo only)' : 'I can help with that. (Demo only)',
        },
      ]);
    }, 600);
  };

  const sendChat = () => sendChatText(chatInput);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle file upload - for now, just show a message
    const fileNames = Array.from(files).map((f) => f.name).join(', ');
    sendChatText(`[File uploaded: ${fileNames}]`);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  // Note: Strategies view is now handled in renderContent below

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Row: Total Value + Active Strategies */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6 h-[220px]">
                <TotalPortfolioValueCard range={range} setRange={setRange} />
              </div>
              <div className="col-span-12 lg:col-span-6 h-[220px]">
                <ActiveStrategiesCard />
              </div>
            </div>

            {/* Middle Row: Recent Activity + Allocation + Cash */}
            <div className="grid grid-cols-12 gap-6 pb-12">
              {/* Left 9 columns: Activity, Allocation, and Updates */}
              <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                <div className="grid grid-cols-9 gap-6">
                  <div className="col-span-9 lg:col-span-5 h-[288px]">
                    <RecentActivityCard />
                  </div>
                  <div className="col-span-9 lg:col-span-4 h-[288px]">
                    <AssetAllocationCard />
                  </div>
                </div>
                <div className="flex-1 min-h-[168px]">
                  <StrategyUpdatesCard />
                </div>
              </div>

              {/* Right 3 columns: Cash and Support */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                <CashTransfersCard />
                <SupportGuidanceCard 
                  onChat={() => setView('chatFull')}
                  onSchedule={() => setShowScheduleModal(true)}
                  onHowItWorks={() => setShowHowItWorksModal(true)}
                />
              </div>
            </div>
          </div>
        );
      case 'strategies':
        return (
          <StrategiesListView className="animate-in fade-in slide-in-from-bottom-4 duration-700" />
        );
      case 'portfolios':
      case 'markets':
      case 'support':
        return (
          <div className="max-w-[1600px] mx-auto h-[600px] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-3xl animate-in fade-in duration-500">
            {view} view placeholder
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300 overflow-x-hidden"
      style={{ backgroundColor: '#f0f2f5', color: 'var(--ui-text)' }}
    >
      <ClassicFinanceHeader 
        view={view} 
        setView={setView} 
      />

      <main className="flex-1 px-9 py-6 overflow-y-auto custom-scrollbar relative">
        {renderContent()}

        {/* AGENT T CHAT OVERLAY (Expanded) */}
        {view === 'chatFull' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setView('dashboard')} />
            <div className="relative w-full max-w-[1000px] h-[min(85vh,800px)] flex flex-col rounded-[32px] overflow-hidden border border-gray-200 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.15)]">
               {/* Background watermark */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <img src="/agents/t-chat-logo.svg" alt="" className="w-1/2 h-auto grayscale" />
              </div>

              <div className="relative h-full flex flex-col z-10">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400/20 overflow-hidden shadow-lg">
                      <Image src="/agents/agent-t-portrait-512.jpg" alt="Agent T" width={64} height={64} />
                    </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">Agent T</h2>
                    <p className="text-sm text-[#c47c48] font-bold uppercase tracking-widest">Portfolio Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { 
                      setView('dashboard'); 
                      setIsChatDockOpen(true); 
                    }} 
                    className="p-3 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
                    aria-label="Minimize to pop-up"
                  >
                    <Minimize2 size={24} />
                  </button>
                  <button onClick={() => setView('dashboard')} className="p-3 rounded-full hover:bg-gray-200 text-gray-400 transition-colors" aria-label="Close">
                    <X size={28} />
                  </button>
                </div>
                </div>

                <div className="flex-1 p-10 space-y-8 overflow-y-auto classic-scrollbar bg-white">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex items-start gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`max-w-[75%] rounded-2xl px-6 py-5 text-[18px] leading-relaxed shadow-sm ${
                        m.role === 'user' ? 'bg-[#c47c48] text-white' : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 border-t border-gray-100 space-y-6 bg-gray-50/30">
                  {chatMessages.length <= 1 && (
                    <div className="flex flex-wrap gap-3">
                      {chatStarters.map(s => (
                        <button key={s} onClick={() => sendChatText(s)} className="px-6 py-3 rounded-full bg-white border border-gray-200 text-[15px] font-bold text-gray-700 hover:border-[#c47c48] hover:text-[#c47c48] transition-all shadow-sm">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="*/*"
                    />
                    {/* Attach button on left */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      aria-label="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>

                    {/* Input field */}
                    <input 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Ask anything about your portfolio..." 
                      className="h-11 flex-1 rounded-xl bg-white border border-gray-200 px-4 text-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#c47c48] focus:ring-4 focus:ring-[#c47c48]/5 transition-all" 
                    />

                    {/* Mode selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setChatModeOpen((v) => !v)}
                        className="h-11 px-3 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
                      >
                        {chatMode === 'thinking' ? <Lightbulb size={16} /> : chatMode === 'fast' ? <Rocket size={16} /> : null}
                        <span className="capitalize">{chatMode}</span>
                        <ChevronDown size={14} />
                      </button>
                      {chatModeOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-32 rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden z-50">
                          {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setChatMode(mode);
                                setChatModeOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                chatMode === mode
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span className="capitalize">{mode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Send button */}
                    <button onClick={sendChat} className="h-11 w-11 rounded-full bg-[#c47c48] flex items-center justify-center text-white shadow-lg hover:bg-[#a66a3d] transition-all"><ArrowUp size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENT T FLOATING FAB */}
        {!isChatDockOpen && view !== 'chatFull' && (
          <button
            onClick={() => setIsChatDockOpen(true)}
            className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-[#0a1120] border-2 border-blue-400/80 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-[90]"
          >
            <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border border-blue-400/70">
              <Image src="/agents/agent-t-portrait-512.jpg" alt="Talk to Agent T" fill className="object-cover" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a1120] animate-pulse" />
          </button>
        )}

        {/* CHAT POPUP DOCK */}
        {isChatDockOpen && (
          <div className="fixed bottom-28 right-8 w-[450px] h-[600px] rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.15)] z-[100] animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-amber-400/20 overflow-hidden shadow-sm">
                    <Image src="/agents/agent-t-portrait-512.jpg" alt="Agent T" width={48} height={48} />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-gray-900">Agent T</p>
                    <p className="text-[11px] text-[#c47c48] font-bold uppercase tracking-widest">Portfolio Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setIsChatDockOpen(false); setView('chatFull'); }} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><Maximize2 size={20} /></button>
                  <button onClick={() => setIsChatDockOpen(false)} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 p-6 space-y-5 overflow-y-auto classic-scrollbar bg-white">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[16px] leading-relaxed shadow-sm ${
                      m.role === 'user' ? 'bg-[#c47c48] text-white' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-gray-100 space-y-4 bg-gray-50/30">
                {/* Hidden file input */}
                <input
                  ref={fileInputDockRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="*/*"
                />
                <div className="flex items-center gap-2">
                  {/* Attach button on left */}
                  <button
                    type="button"
                    onClick={() => fileInputDockRef.current?.click()}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Input field */}
                  <input 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Ask Agent T..." 
                    className="h-9 flex-1 rounded-lg bg-white border border-gray-200 px-3 text-[16px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#c47c48]" 
                  />

                  {/* Mode selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setChatModeOpen((v) => !v)}
                      className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-[10px]"
                    >
                      {chatMode === 'thinking' ? <Lightbulb size={12} /> : chatMode === 'fast' ? <Rocket size={12} /> : null}
                      <span className="capitalize">{chatMode}</span>
                      <ChevronDown size={10} />
                    </button>
                    {chatModeOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-28 rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden z-50">
                        {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setChatMode(mode);
                              setChatModeOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 text-left text-[10px] transition-colors ${
                              chatMode === mode
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span className="capitalize">{mode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send button */}
                  <button onClick={sendChat} className="h-9 w-9 rounded-full bg-[#c47c48] flex items-center justify-center text-white shadow-md hover:bg-[#a66a3d] transition-all"><ArrowUp size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE A CALL MODAL */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)} />
            <div className="relative w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Schedule a Call</h2>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket size={32} />
                  </div>
                  <p className="text-gray-600">Connect with a dedicated specialist to review your portfolio and long-term goals.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {['Today at 4:30 PM', 'Tomorrow at 10:00 AM', 'Monday at 2:00 PM'].map((time) => (
                    <button key={time} onClick={() => setShowScheduleModal(false)} className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:border-[#c47c48] hover:bg-orange-50/30 text-left font-bold text-gray-800 transition-all flex justify-between items-center group">
                      {time}
                      <ChevronDown size={18} className="-rotate-90 text-gray-300 group-hover:text-[#c47c48]" />
                    </button>
                  ))}
                </div>
                <button className="w-full py-4 bg-[#c47c48] text-white font-bold rounded-xl shadow-lg hover:bg-[#a66a3d] transition-all">
                  View More Times
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HOW IT WORKS MODAL */}
        {showHowItWorksModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHowItWorksModal(false)} />
            <div className="relative w-full max-w-[800px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-2xl font-bold text-gray-900">How Adam Works</h2>
                <button onClick={() => setShowHowItWorksModal(false)} className="p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto classic-scrollbar">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gray-900 relative group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[#c47c48]" />
                  </div>
                </div>
                
                <div className="p-10 space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-[#c47c48] rounded-lg flex items-center justify-center"><Lightbulb size={20} /></div>
                      Intelligent Asset Management
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Adam uses advanced quantitative models to continuously monitor global markets. Unlike traditional advisors who rebalance quarterly, Adam identifies opportunities and risks in real-time, ensuring your portfolio is always optimized for your specific risk tolerance.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
                      Safety & Security First
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Your assets are held at institutional-grade custodians. Adam never takes custody of your funds; it only executes trades on your behalf based on the strategies you've approved. We use bank-level encryption and multi-factor authentication to keep your data secure.
                    </p>
                  </section>

                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setShowHowItWorksModal(false)}
                      className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Got it, thanks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
