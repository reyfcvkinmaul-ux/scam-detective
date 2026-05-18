/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Optional peer deps from wagmi connectors we don't use (Porto, MIPD edge cases)
    config.resolve.alias = {
      ...config.resolve.alias,
      "porto/internal": false,
      "porto/dialog": false,
    };
    // Some wagmi/ConnectKit deps probe for Node modules — silence them on the client.
    config.externals = [...(config.externals || []), { "pino-pretty": "commonjs pino-pretty" }];
    return config;
  },
};

export default nextConfig;
