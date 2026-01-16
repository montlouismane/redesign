import { NextRequest, NextResponse } from 'next/server';

const BLOCKFROST_API_URL = process.env.BLOCKFROST_API_URL || 'https://cardano-mainnet.blockfrost.io/api/v0';
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const response = await fetch(
      `${BLOCKFROST_API_URL}/addresses/${address}/utxos`,
      { headers: { 'project_id': BLOCKFROST_API_KEY } }
    );

    if (!response.ok) {
      return NextResponse.json({ assets: [] });
    }

    const utxos = await response.json();

    // Extract non-lovelace assets
    const assets: Array<{ unit: string; quantity: string }> = [];
    if (Array.isArray(utxos)) {
      utxos.forEach((utxo: any) => {
        utxo.amount?.forEach((amt: any) => {
          if (amt.unit !== 'lovelace') {
            assets.push({ unit: amt.unit, quantity: amt.quantity });
          }
        });
      });
    }

    return NextResponse.json({ assets });
  } catch {
    return NextResponse.json({ assets: [] });
  }
}
