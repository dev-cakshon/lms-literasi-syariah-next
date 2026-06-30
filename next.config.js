/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const apiRemotePatterns = [];

if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    apiRemotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
    });
  } catch {
    // Keep list empty when NEXT_PUBLIC_API_URL is not a valid URL.
  }
}

const nextConfig = {
  output: 'standalone',

  eslint: {
    dirs: ['src'],
  },

  reactStrictMode: true,

  images: {
    remotePatterns: [
      ...apiRemotePatterns,
      // Firebase Storage — avatar photos uploaded by users
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Google profile photos (Google sign-in avatars, various subdomains)
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
          titleProp: true,
        },
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

module.exports = nextConfig;
