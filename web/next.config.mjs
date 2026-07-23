/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The API route reads ../editor/*.md from disk at request time.
  // Trace those files so they ship with the serverless bundle.
  outputFileTracingIncludes: {
    "/api/critique": ["../editor/**/*.md"],
  },
};

export default nextConfig;
