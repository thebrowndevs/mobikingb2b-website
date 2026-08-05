/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
        unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "*",
        // hostname: "mobikingwholesale.com",
      },
      {
        protocol: "https",
        hostname: "*",
        // hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
