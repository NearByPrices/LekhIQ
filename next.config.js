/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['cheerio', 'mozilla-readability'],
};

module.exports = nextConfig;
