/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "sharp", "onnxruntime-node"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
