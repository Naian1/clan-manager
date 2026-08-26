import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api-assets.clashofclans.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        ],
      },
    ];
  },
};

export default nextConfig;
