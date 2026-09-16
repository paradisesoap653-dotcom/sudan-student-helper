/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // استبعاد مجلدات المشاريع الاخرى تماما من البناء
    externalDir: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/rakshtak/**', '**/rakshtak-deliverables/**', '**/marketing/**'],
    };
    return config;
  },
};

export default nextConfig;
