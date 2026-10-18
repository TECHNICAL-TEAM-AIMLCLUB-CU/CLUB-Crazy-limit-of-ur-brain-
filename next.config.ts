import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Hyperspeed.jsx is plain JS; Next compiles it without allowJs.
  poweredByHeader: false,
};

export default nextConfig;
