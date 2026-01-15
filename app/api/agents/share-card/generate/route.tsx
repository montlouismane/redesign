import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface ShareCardRequest {
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  mode: string;
  chain: string;
  timeframe: '24h' | '7d' | '30d' | 'all';
  // Performance metrics
  realizedPnl: number;
  realizedPnlPct: number;
  winRate: number;
  pnl24h: number;
  pnl7d: number;
  trades: number;
}

function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPnlShort(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  const absVal = Math.abs(value);
  if (absVal >= 1000) {
    return `${sign}$${(absVal / 1000).toFixed(1)}k`;
  }
  return `${sign}$${absVal.toFixed(0)}`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 't-mode': return 'T-Mode';
    case 'perpetuals': return 'Perpetuals';
    case 'prediction': return 'Prediction';
    default: return 'Standard';
  }
}

function getChainLabel(chain: string): string {
  switch (chain) {
    case 'cardano': return 'Cardano';
    case 'solana': return 'Solana';
    case 'base': return 'Base';
    default: return chain.charAt(0).toUpperCase() + chain.slice(1);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: ShareCardRequest = await req.json();

    const {
      agentName,
      agentAvatar,
      mode,
      chain,
      realizedPnl,
      realizedPnlPct,
      winRate,
      pnl24h,
      pnl7d,
      trades,
    } = data;

    // Get the origin for absolute URL to template image
    const origin = req.headers.get('origin') || req.headers.get('host') || 'localhost:3001';
    const baseUrl = origin.startsWith('http')
      ? origin
      : `${origin.includes('localhost') ? 'http' : 'https'}://${origin}`;
    const templateUrl = `${baseUrl}/agents/share-template-v2.jpg`;

    const isPositive = realizedPnl >= 0;

    // Portrait dimensions matching template
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Background Template Image */}
          <img
            src={templateUrl}
            width={928}
            height={1152}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Overlay Content */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Agent Info - absolutely positioned using percentages */}
            <div
              style={{
                position: 'absolute',
                top: '16.8%',
                left: '0',
                right: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  background: agentAvatar ? 'transparent' : 'linear-gradient(135deg, #c47c48 0%, #8a5a35 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(53, 255, 155, 0.4)',
                  overflow: 'hidden',
                }}
              >
                {agentAvatar ? (
                  <img src={agentAvatar} width={52} height={52} style={{ objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                    {agentName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '26px', fontWeight: 700, color: '#e8e8ee' }}>{agentName}</span>
                <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {getModeLabel(mode)} • {getChainLabel(chain)}
                </span>
              </div>
            </div>

            {/* Realized PnL - absolutely positioned using percentages */}
            <div
              style={{
                position: 'absolute',
                top: '39%',
                left: '0',
                right: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '102px',
                  fontWeight: 800,
                  color: isPositive ? '#35ff9b' : '#ff4444',
                  fontFamily: 'monospace',
                  textShadow: isPositive
                    ? '0 0 40px rgba(53, 255, 155, 0.6)'
                    : '0 0 40px rgba(255, 68, 68, 0.6)',
                  lineHeight: 1,
                }}
              >
                {formatPnl(realizedPnl)}
              </div>
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 600,
                  color: isPositive ? '#35ff9b' : '#ff4444',
                  fontFamily: 'monospace',
                  marginTop: '116px',
                  opacity: 0.8,
                }}
              >
                {formatPct(realizedPnlPct)}
              </div>
            </div>

            {/* Stats Row - absolutely positioned using percentages */}
            <div
              style={{
                position: 'absolute',
                top: '73.9%',
                left: '12%',
                right: '12%',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {[
                { value: `${winRate}%` },
                { value: formatPnlShort(pnl24h) },
                { value: formatPnlShort(pnl7d) },
                { value: `${trades}` },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18%',
                    height: '50px',
                  }}
                >
                  <span style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#35ff9b',
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px rgba(53, 255, 155, 0.4)',
                  }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 928,
        height: 1152,
      }
    );

    // Convert to base64 for download
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return Response.json({
      success: true,
      imageUrl: dataUrl,
    });

  } catch (error) {
    console.error('Share card generation error:', error);
    return Response.json(
      { success: false, error: 'Failed to generate share card' },
      { status: 500 }
    );
  }
}
