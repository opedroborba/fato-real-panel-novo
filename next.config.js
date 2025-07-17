/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oxwurygnhgaududxrjhe.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/capanoticia/**',
      },
    ],
  },
};

module.exports = nextConfig;