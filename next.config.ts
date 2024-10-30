import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add fallback for 'fs' module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      'babel-runtime': false,
    };

    return config;
  },
  transpilePackages: ['@babel/standalone'],
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;
