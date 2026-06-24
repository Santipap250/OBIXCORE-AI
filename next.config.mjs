/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages / GitHub Pages deployment.
  // Remove this line if moving to Vercel or a Node.js host.
  output: "export",
  // next/image optimization requires a running Node server; disabled for static export.
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;
