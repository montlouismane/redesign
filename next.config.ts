import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection (prevents looking for deps in C:\Users\andre)
  turbopack: {
    root: __dirname,
  },
  // Content Security Policy headers (DEV ONLY)
  // NOTE: Next.js dev tooling (and some libraries) may rely on eval/inline scripts.
  // We avoid weakening CSP in production builds.
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) return [];

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss: http: https:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // API routing configuration - proxy to production backend
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const externalApiBase = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');

    // IMPORTANT: Preserve certain frontend API routes handled by Next.js itself.
    // These should NOT be proxied to the dashboard API service.
    const preserveFrontendApi = [
      {
        source: '/api/portfolio/equity',
        destination: '/api/portfolio/equity', // Current TapTools proxy in Next.js
      },
      {
        source: '/api/solana/:path*',
        destination: '/api/solana/:path*', // Future Solana handlers
      },
    ];

    if (isDevelopment) {
      // For local development: proxy to backend API service
      // Default backend port is 3001, but can be overridden via NEXT_PUBLIC_BACKEND_PORT
      const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
      const backendBase = `http://localhost:${backendPort}`;
      
      return [
        ...preserveFrontendApi,
        {
          source: '/api/:path*',
          destination: `${backendBase}/api/:path*`,
        },
        {
          source: '/socket.io/:path*',
          destination: `${backendBase}/socket.io/:path*`,
        },
      ];
    }

    if (externalApiBase) {
      // Production (non-K8s): proxy to external API base if provided
      return [
        ...preserveFrontendApi,
        {
          source: '/api/:path*',
          destination: `${externalApiBase}/api/:path*`,
        },
        {
          source: '/socket.io/:path*',
          destination: `${externalApiBase}/socket.io/:path*`,
        },
      ];
    }

    // Default (e.g., Kubernetes): route to in-cluster API service by name
    return [
      ...preserveFrontendApi,
      {
        source: '/api/:path*',
        destination: 'http://dashboard-api-service:3001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://dashboard-api-service:3001/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
