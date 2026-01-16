import { useState } from 'react';

// Stub type for Asset (meshsdk removed due to webpack conflict)
type Asset = {
    unit: string;
    quantity: string;
};

export const useWalletTransaction = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [adaBalance] = useState<number>(1178.55); // Mock balance
    const [assets] = useState<Asset[]>([]);
    const connected = false; // Stub - wallet not connected

    const sendLovelace = async (_recipientAddress: string, _amountAda: string) => {
        setIsLoading(true);
        setError("Wallet integration disabled");
        setIsLoading(false);
        return null;
    };

    const sendAssets = async (_recipientAddress: string, _assetsToSend: Asset[]) => {
        setIsLoading(true);
        setError("Wallet integration disabled");
        setIsLoading(false);
        return null;
    };

    const refetchBalance = () => {
        // No-op stub
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
        refetchBalance
    };
};
