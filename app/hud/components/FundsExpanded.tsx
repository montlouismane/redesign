import React, { useState } from 'react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Copy,
    Check,
    QrCode,
    ExternalLink,
    Clock,
    Wallet,
    RefreshCw,
    AlertTriangle,
    ArrowDown
} from 'lucide-react';
import { formatUSD } from '../utils';
import styles from '../../styles/modal.module.css';
import { useWalletTransaction } from '../../hooks/useWalletTransaction';
import type { Asset } from '@meshsdk/core';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    txHash?: string;
}

interface FundsExpandedProps {
    walletAddress?: string;
    balance: number;
    onDeposit: () => void;
    onWithdraw: () => void;
}

// Mock transaction history
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', type: 'deposit', amount: 500, status: 'completed', timestamp: '2024-01-06T10:30:00Z', txHash: '0x1234...abcd' },
    { id: '2', type: 'withdraw', amount: 150, status: 'completed', timestamp: '2024-01-05T14:22:00Z', txHash: '0x5678...efgh' },
    { id: '3', type: 'deposit', amount: 1000, status: 'completed', timestamp: '2024-01-03T09:15:00Z', txHash: '0x9abc...ijkl' },
    { id: '4', type: 'withdraw', amount: 75, status: 'pending', timestamp: '2024-01-06T11:45:00Z' },
    { id: '5', type: 'deposit', amount: 250, status: 'completed', timestamp: '2024-01-02T16:00:00Z', txHash: '0xdef0...mnop' },
];

export const FundsExpanded = ({
    walletAddress = '0x7a3d8f2e9b1c4a5d6e7f8g9h0i1j2k3l4m5n6o7p',
    balance,
    onDeposit,
    onWithdraw,
}: FundsExpandedProps) => {
    const { sendLovelace, sendAssets, isLoading, error: txError, txHash, adaBalance, assets } = useWalletTransaction();
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');

    // Transaction State
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<string>('native');
    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

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
    const displaySymbol = currentAsset ? getAssetName(currentAsset.unit) : 'ADA';

    // Balance Logic
    const getLiveBalance = () => {
        if (selectedAsset === 'native') return adaBalance || balance;
        return currentAsset ? Number(currentAsset.quantity) : 0;
    };

    const liveBalance = getLiveBalance();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleMaxClick = () => {
        setAmount(liveBalance.toString());
    };

    const executeSend = async () => {
        if (!recipient || !amount) return;
        try {
            if (selectedAsset === 'native') {
                await sendLovelace(recipient, amount);
            } else {
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

    const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
        if (activeTab === 'all') return true;
        if (activeTab === 'deposits') return tx.type === 'deposit';
        return tx.type === 'withdraw';
    });

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4" onClick={() => setIsAssetDropdownOpen(false)}>
            {/* Send / Receive Section */}
            <div className={`p-6 ${styles.subPanel}`}>
                <h2 className="text-lg font-bold text-white mb-4">Send / Receive</h2>

                {/* Receive Section */}
                <div className="mb-6">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-mono mb-2 block">
                        Receive (copy address)
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-[#0b0b10] border border-white/10 rounded-lg px-3 py-2.5 
                                      flex items-center text-sm font-mono text-white/80 overflow-hidden">
                            <span className="truncate">{walletAddress}</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${copied
                                ? 'bg-[#35ff9b]/20 text-[#35ff9b] border border-[#35ff9b]/50'
                                : 'bg-[#1a1a20] text-white hover:bg-[#252530] border border-white/10'
                                }`}
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Send Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        {/* Recipient Input */}
                        <div className="flex-[2]">
                            <input
                                type="text"
                                placeholder="Recipient addr1..."
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full bg-[#0b0b10] border border-white/10 rounded-lg px-4 py-3
                                         text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors
                                         placeholder:text-white/20"
                            />
                        </div>

                        {/* Token Selector */}
                        <div className="flex-1 relative z-50">
                            <div
                                className="w-full bg-[#0b0b10] border border-white/10 rounded-lg px-4 py-3
                                          text-sm text-white flex items-center justify-between cursor-pointer
                                          hover:border-white/20 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAssetDropdownOpen(!isAssetDropdownOpen);
                                }}
                            >
                                <span className="truncate">{displaySymbol}</span>
                                <ArrowDownToLine size={14} className="opacity-40" />
                            </div>

                            {/* Dropdown */}
                            {isAssetDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full max-h-48 overflow-y-auto bg-[#0b0b10] border border-white/10 rounded-lg shadow-xl z-50 flex flex-col">
                                    <div
                                        className="px-4 py-3 hover:bg-white/5 text-sm text-white cursor-pointer border-b border-white/5"
                                        onClick={(e) => { e.stopPropagation(); setSelectedAsset('native'); setIsAssetDropdownOpen(false); }}
                                    >
                                        ADA
                                    </div>
                                    {assets.map(asset => (
                                        <div
                                            key={asset.unit}
                                            className="px-4 py-3 hover:bg-white/5 text-sm text-white cursor-pointer border-b border-white/5 last:border-0 truncate"
                                            onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset.unit); setIsAssetDropdownOpen(false); }}
                                        >
                                            {getAssetName(asset.unit)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div className="flex-[1.5]">
                            <input
                                type="text"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#0b0b10] border border-white/10 rounded-lg px-4 py-3
                                         text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors
                                         placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Footer: Balance & Send Button */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-[11px] text-white/40 font-mono">
                            Balance: <span className="text-white/80">{liveBalance.toFixed(4)} {displaySymbol}</span>
                            <button
                                onClick={handleMaxClick}
                                className="ml-2 text-[#f59e0b] hover:text-[#f59e0b]/80 underline">MAX</button>
                        </div>

                        <button
                            onClick={executeSend}
                            disabled={isLoading}
                            className="bg-[#f59e0b] hover:bg-[#fab005] text-black font-bold py-2.5 px-8 rounded-lg
                                     transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#f59e0b]/20
                                     disabled:opacity-50 disabled:grayscale"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History - HUD subPanel style */}
            <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${styles.subPanel}`} style={{ padding: 0 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(196, 124, 72, 0.12)' }}>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                        <span className={styles.subTitle}>TRANSACTION HISTORY</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter Tabs - HUD style */}
                        <div className="flex bg-black/20 p-0.5" style={{ borderRadius: '2px' }}>
                            {(['all', 'deposits', 'withdrawals'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all ${activeTab === tab
                                        ? 'bg-[#c47c48]/15 text-[#c47c48]'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                    style={{ fontFamily: 'var(--mono)', borderRadius: '1px' }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button className="p-1.5 text-white/40 hover:text-[#c47c48] transition-colors">
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--muted)' }}>
                            <Clock size={40} className="mb-3 opacity-40" />
                            <span className="text-sm">No transactions found</span>
                        </div>
                    ) : (
                        <div>
                            {filteredTransactions.map((tx, idx) => (
                                <div
                                    key={tx.id}
                                    className={`flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors ${idx !== filteredTransactions.length - 1 ? 'border-b' : ''
                                        }`}
                                    style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center ${tx.type === 'deposit'
                                            ? 'bg-[#35ff9b]/8 text-[#35ff9b]'
                                            : 'bg-[#f59e0b]/8 text-[#f59e0b]'
                                            }`} style={{ borderRadius: '2px' }}>
                                            {tx.type === 'deposit'
                                                ? <ArrowDownToLine size={14} />
                                                : <ArrowUpFromLine size={14} />
                                            }
                                        </div>
                                        <div>
                                            <div className="text-white text-sm font-medium capitalize">
                                                {tx.type}
                                            </div>
                                            <div className="text-[10px]" style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                                                {formatTime(tx.timestamp)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Status Badge - HUD kbd style */}
                                        <div className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${tx.status === 'completed'
                                            ? 'bg-[#35ff9b]/10 text-[#35ff9b] border border-[#35ff9b]/20'
                                            : tx.status === 'pending'
                                                ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`} style={{ fontFamily: 'var(--mono)', borderRadius: '2px' }}>
                                            {tx.status === 'pending' && (
                                                <RefreshCw size={8} className="inline mr-1 animate-spin" />
                                            )}
                                            {tx.status === 'failed' && (
                                                <AlertTriangle size={8} className="inline mr-1" />
                                            )}
                                            {tx.status}
                                        </div>

                                        {/* Amount */}
                                        <div className={`text-base ${tx.type === 'deposit' ? 'text-[#35ff9b]' : 'text-[#f59e0b]'
                                            }`} style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                                            {tx.type === 'deposit' ? '+' : '-'}{formatUSD(tx.amount)}
                                        </div>

                                        {/* TX Hash Link */}
                                        {tx.txHash && (
                                            <a
                                                href="#"
                                                className="text-white/25 hover:text-[#c47c48] transition-colors"
                                                title="View transaction"
                                            >
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
