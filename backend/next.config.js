/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable larger request bodies for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
