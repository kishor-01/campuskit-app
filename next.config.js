// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Restore StrictMode (recommended for dev)

  // This allows the build to finish even if there are linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This allows the build to finish even if there are TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'mammoth'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.geeksforgeeks.org' },
      { protocol: 'https', hostname: 'cdn.dribbble.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'user-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'imgs.search.brave.com' },
      { protocol: 'https', hostname: 'gridfiti.com' },
      { protocol: 'https', hostname: 'th.bing.com' },
      { protocol: 'https', hostname: 'www.istockphoto.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'repository-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'fullstackopen.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'teachyourselfcs.com' },
      { protocol: 'https', hostname: 'owasp.org' },
      { protocol: 'https', hostname: 'github.githubassets.com' },
      { protocol: 'https', hostname: 'craftinginterpreters.com' },
      { protocol: 'https', hostname: 'git-scm.com' },
      { protocol: 'https', hostname: 'developer.nvidia.com' },
      { protocol: 'https', hostname: 'rosalind.info' },
      { protocol: 'https', hostname: 'ghidra-sre.org' },
      { protocol: 'https', hostname: 'opentelemetry.io' },
      { protocol: 'https', hostname: 'quantecon.org' },
      { protocol: 'https', hostname: 'istio.io' },
      { protocol: 'https', hostname: 'llvm.org' },
      { protocol: 'https', hostname: 'webrtc.org' },
      { protocol: 'https', hostname: 'argo-cd.readthedocs.io' },
    ],
  },

  async headers() {
    const imageSources = [
      "'self'",
      "data:",
      "https://images.unsplash.com",
      "https://media.geeksforgeeks.org",
      "https://cdn.dribbble.com",
      "https://images.pexels.com",
      "https://user-images.githubusercontent.com",
      "https://imgs.search.brave.com",
      "https://gridfiti.com",
      "https://th.bing.com",
      "https://www.istockphoto.com",
      "https://lh3.googleusercontent.com",
      "https://repository-images.githubusercontent.com",
      "https://fullstackopen.com",
      "https://upload.wikimedia.org",
      "https://teachyourselfcs.com",
      "https://owasp.org",
      "https://github.githubassets.com",
      "https://craftinginterpreters.com",
      "https://git-scm.com",
      "https://developer.nvidia.com",
      "https://rosalind.info",
      "https://ghidra-sre.org",
      "https://opentelemetry.io",
      "https://quantecon.org",
      "https://istio.io",
      "https://llvm.org",
      "https://webrtc.org",
      "https://argo-cd.readthedocs.io",
    ];

    const isDev = process.env.NODE_ENV !== 'production';
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src ${imageSources.join(' ')};
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      ${!isDev ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ],
      },
    ];
  },
  // --- End Restore ---
};

module.exports = nextConfig;