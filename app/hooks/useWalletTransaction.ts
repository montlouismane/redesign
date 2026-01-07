import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import type { Asset } from '@meshsdk/core';

export const useWalletTransaction = () => {
    const { wallet, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [adaBalance, setAdaBalance] = useState<number>(0);
    const [assets, setAssets] = useState<Asset[]>([]);

    const fetchBalance = async () => {
        if (connected && wallet) {
            try {
                const lovelace = await wallet.getLovelace();
                setAdaBalance(Number(lovelace) / 1_000_000);

                const walletAssets = await wallet.getAssets();
                setAssets(walletAssets);
            } catch (e) {
                console.error("Failed to fetch balance/assets", e);
                setAdaBalance(0);
                setAssets([]);
            }
        } else {
            setAdaBalance(0);
            setAssets([]);
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [connected, wallet]);

    const sendLovelace = async (recipientAddress: string, amountAda: string) => {
        if (!connected || !wallet) {
            setError("Wallet not connected");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const { buildAndSendLovelace } = await import('../lib/meshUtils');
            const amountLovelace = (parseFloat(amountAda) * 1_000_000).toString();
            const hash = await buildAndSendLovelace(wallet, recipientAddress, amountLovelace);

            setTxHash(hash as string);

            // Refresh balance shortly after
            setTimeout(() => fetchBalance(), 5000);

            return hash;
        } catch (err: any) {
            console.error("Transaction failed:", err);
            setError(err.message || "Transaction failed");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const sendAssets = async (recipientAddress: string, assetsToSend: Asset[]) => {
        if (!connected || !wallet) {
            setError("Wallet not connected");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const { buildAndSendAssets } = await import('../lib/meshUtils');
            const hash = await buildAndSendAssets(wallet, recipientAddress, assetsToSend);

            setTxHash(hash as string);
            setTimeout(() => fetchBalance(), 5000);
            return hash;
        } catch (err: any) {
            console.error("Asset Transaction failed:", err);
            setError(err.message || "Transaction failed");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sendLovelace,
        sendAssets,
        isLoading,
        error,
        txHash,
        connected,
        adaBalance,
        assets,
        refetchBalance: fetchBalance
    };
};
