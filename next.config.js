/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent webpack from trying to bundle native modules
    if (isServer) {
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
      });
    }

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', '@prisma/client'],
  },
  output: 'standalone',
}

module.exports = nextConfig
