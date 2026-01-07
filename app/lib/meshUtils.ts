import { Transaction } from '@meshsdk/core';
import type { Asset } from '@meshsdk/core';

export const buildAndSendLovelace = async (wallet: any, recipientAddress: string, amountLovelace: string) => {
    const tx = new Transaction({ initiator: wallet })
        .sendLovelace(recipientAddress, amountLovelace);

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const hash = await wallet.submitTx(signedTx);
    return hash;
};

export const buildAndSendAssets = async (wallet: any, recipientAddress: string, assetsToSend: Asset[]) => {
    const tx = new Transaction({ initiator: wallet })
        .sendAssets({ address: recipientAddress }, assetsToSend);

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const hash = await wallet.submitTx(signedTx);
    return hash;
};
