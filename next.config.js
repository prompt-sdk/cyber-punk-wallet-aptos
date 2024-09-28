/* eslint-disable @typescript-eslint/no-var-requires */
const Path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = async () => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 's3.ap-southeast-1.amazonaws.com' },
        { protocol: 'http', hostname: 'localhost' }
      ]
    },
    env: {
      KV_URL: process.env.KV_URL,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
      KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN
    },
    eslint: {
      ignoreDuringBuilds: false
    },
    webpack: config => {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil'
      });

      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: Path.join(__dirname, './src/libs/svg-icons/dist'),
              to: Path.join(__dirname, './public/fonts'),
              noErrorOnMissing: true
            }
          ]
        })
      );

      return config;
    }
  };

  return withNextIntl(nextConfig);
};

module.exports = nextConfig;
