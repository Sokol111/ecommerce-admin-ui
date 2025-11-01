import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['imgproxy.127.0.0.1.nip.io'],
  },
};

export default nextConfig;
