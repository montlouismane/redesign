import React, { useState } from 'react';
import { HudPanel } from '../components/HudPanel';
import { ArrowDownToLine, ArrowUpFromLine, Copy, Wallet, Check, ArrowDown, ChevronDown } from 'lucide-react';
import { formatUSD } from '../utils';
import { FundsPanelProps } from '../types';
import { useWalletTransaction } from '../../hooks/useWalletTransaction';

export const FundsPanel = ({
    walletAddress = '0x1234...5678',
    balance,
    onDeposit,
    onWithdraw,
    openModal,
    isLoaded,
    reduceMotion = false,
    chain = 'cardano',
    agentWallets = [],
    selectedWalletId,
    onWalletChange,
}: FundsPanelProps) => {
    const { sendLovelace, sendAssets, isLoading, error: txError, txHash, adaBalance, assets } = useWalletTransaction();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isCopying, setIsCopying] = useState(false);

    // Asset Selection State: 'native' or asset unit string
    const [selectedAsset, setSelectedAsset] = useState<string>('native');
    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

    // Wallet Selection Dropdown State
    const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

    // Get selected agent wallet info
    const selectedWallet = agentWallets.find(w => w.id === selectedWalletId);
    const activeWalletAddress = selectedWallet?.address || walletAddress;
    const activeChain = selectedWallet?.chain || chain;

    // Determines currency symbol based on chain
    const getCurrencySymbol = (c: string) => {
        switch (c) {
            case 'solana': return 'SOL';
            case 'base': return 'USDC';
            case 'cardano': default: return 'ADA';
        }
    };
    const nativeCurrency = getCurrencySymbol(activeChain);

    // Helper to format asset name from hex if needed
    const getAssetName = (unit: string) => {
        const policyId = unit.slice(0, 56);
        const nameHex = unit.slice(56);
        try {
            return Buffer.from(nameHex, 'hex').toString('utf8') || 'Asset';
        } catch (e) {
            return 'Asset';
        }
    };

    const currentAsset = selectedAsset === 'native' ? null : assets.find(a => a.unit === selectedAsset);
    const displaySymbol = currentAsset ? getAssetName(currentAsset.unit) : nativeCurrency;

    // Balance Logic
    const getLiveBalance = () => {
        if (selectedAsset === 'native') return adaBalance || balance;
        return currentAsset ? Number(currentAsset.quantity) : 0;
    };

    const liveBalance = getLiveBalance();

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeWalletAddress) {
            await navigator.clipboard.writeText(activeWalletAddress);
            setIsCopying(true);
            setTimeout(() => setIsCopying(false), 2000);
        }
    };

    const handleWalletSelect = (walletId: string) => {
        if (onWalletChange) {
            onWalletChange(walletId);
        }
        setIsWalletDropdownOpen(false);
    };

    const handleMaxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAmount(liveBalance.toString());
    };

    const executeSend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!recipient || !amount) return;
        try {
            if (selectedAsset === 'native') {
                await sendLovelace(recipient, amount);
            } else {
                // Send specific asset
                if (!currentAsset) return;
                await sendAssets(recipient, [{ unit: currentAsset.unit, quantity: amount }]);
            }

            alert(`Transaction Submitted! Hash: ${txHash || 'Pending...'}`);
            setAmount('');
            setRecipient('');
        } catch (e: any) {
            console.error(e);
            alert('Transaction failed: ' + (e.message || 'Unknown error'));
        }
    };

    const truncateAddress = (addr: string) => {
        if (!addr) return '';
        if (addr.length <= 13) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <HudPanel
            title="FUNDS"
            accentVariant="vertical"
            shapeVariant="b"
            onExpandClick={() => openModal('funds')}
            onDoubleClick={() => openModal('funds')}
            style={{
                animationDelay: reduceMotion ? '0ms' : '350ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
            className="border-amber-500/20"
        >
            <div className="flex flex-col h-full p-3 gap-1.5" onClick={() => { setIsAssetDropdownOpen(false); setIsWalletDropdownOpen(false); }}>
                {/* Agent Wallet Selector */}
                {agentWallets.length > 0 && (
                    <div className="relative mb-1">
                        <div className="text-[8px] text-white/30 font-mono tracking-widest uppercase mb-1">
                            AGENT WALLET
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsWalletDropdownOpen(!isWalletDropdownOpen);
                            }}
                            className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[1px]
                                       bg-white/5 border border-white/10 hover:border-[#c47c48]/30
                                       text-[10px] text-white/80 font-mono transition-colors"
                        >
                            <span className="truncate">
                                {selectedWallet?.name || 'Select Agent Wallet'}
                            </span>
                            <ChevronDown size={12} className={`text-white/40 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Wallet Dropdown */}
                        {isWalletDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0b10] border border-white/10 rounded-[1px] shadow-xl z-50 max-h-32 overflow-y-auto">
                                {agentWallets.map(wallet => (
                                    <div
                                        key={wallet.id}
                                        className={`px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between
                                                   ${wallet.id === selectedWalletId ? 'bg-[#c47c48]/10' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleWalletSelect(wallet.id);
                                        }}
                                    >
                                        <span className="text-[10px] text-white truncate">{wallet.name}</span>
                                        <span className="text-[9px] text-white/40 font-mono">{truncateAddress(wallet.address)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Balance & Wallet Info */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                        <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase">
                            Available Balance
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-mono text-white tracking-tight">
                                {liveBalance.toFixed(2)} {displaySymbol}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1 rounded-[1px] bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={handleCopy}>
                        <Wallet size={10} className="text-amber-500/60" />
                        <span className="font-mono text-[9px] text-white/50 truncate max-w-[60px]">
                            {truncateAddress(activeWalletAddress)}
                        </span>
                        <div className="text-white/30 group-hover:text-amber-400 transition-colors">
                            {isCopying ? <Check size={10} /> : <Copy size={10} />}
                        </div>
                    </div>
                </div>

                {/* Send Interface (Inline - Compact) */}
                <div className="mt-auto flex flex-col gap-2 relative">
                    {/* Recipient */}
                    <input
                        type="text"
                        placeholder="Addr..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white/5 border border-white/10 rounded-[1px] px-2 py-1
                                 text-[10px] text-white focus:outline-none focus:border-[#c47c48]/50 transition-colors
                                 placeholder:text-white/20 font-mono h-6"
                        autoComplete="off"
                    />

                    {/* Amount Row */}
                    <div className="flex gap-1.5 items-center z-10">
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-[1px] px-2 py-1
                                      text-[10px] text-white cursor-pointer hover:border-white/20 transition-colors min-w-[50px]
                                      text-white/80 h-6 relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAssetDropdownOpen(!isAssetDropdownOpen);
                            }}>
                            <span className="truncate max-w-[40px]">{displaySymbol}</span>
                            <ArrowDown size={10} className="opacity-40" />

                            {/* Asset Dropdown */}
                            {isAssetDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-32 max-h-32 overflow-y-auto bg-[#0b0b10] border border-white/10 rounded-[1px] shadow-xl z-50 flex flex-col">
                                    <div
                                        className="px-2 py-1.5 hover:bg-white/5 text-[10px] text-white cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAsset('native');
                                            setIsAssetDropdownOpen(false);
                                        }}
                                    >
                                        {nativeCurrency}
                                    </div>
                                    {assets.map(asset => (
                                        <div
                                            key={asset.unit}
                                            className="px-2 py-1.5 hover:bg-white/5 text-[10px] text-white cursor-pointer truncate"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAsset(asset.unit);
                                                setIsAssetDropdownOpen(false);
                                            }}
                                        >
                                            {getAssetName(asset.unit)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white/5 border border-white/10 rounded-[1px] px-2 py-1 pl-2 pr-8
                                         text-[10px] text-white focus:outline-none focus:border-[#c47c48]/50 transition-colors
                                         placeholder:text-white/20 font-mono text-right h-6"
                                autoComplete="off"
                            />
                            <button
                                onClick={handleMaxClick}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-[#c47c48] hover:text-[#c47c48]/80 font-mono tracking-wider">
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={executeSend}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1.5 py-1 px-3
                                       bg-transparent border border-[#c47c48]/30 rounded-[1px]
                                       hover:bg-[#c47c48]/10 hover:border-[#c47c48]/60
                                       text-[#c47c48] transition-all group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="text-[9px] font-mono animate-pulse">...</span>
                            ) : (
                                <>
                                    <span className="text-[9px] font-medium tracking-widest font-mono">
                                        SEND
                                    </span>
                                    <ArrowUpFromLine size={10} className="opacity-70" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </HudPanel>
    );
};


