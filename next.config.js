const nextConfig = {
  images: {
    // Only allow approved production CDN hosts.
    // Add your storage provider below when configured:
    //   Cloudinary: { hostname: 'res.cloudinary.com' }
    //   AWS S3:      { hostname: '*.s3.amazonaws.com' }
    //   Azure Blob:  { hostname: '*.blob.core.windows.net' }
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      { protocol: 'https', hostname: '127.0.0.1', pathname: '/**' },
      { protocol: 'https', hostname: 'lokaaexports.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.lokaaexports.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.hstgr.io', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'unsplash.com', pathname: '/**' },
    ],
  },

  // Renamed from experimental.serverComponentsExternalPackages in Next 15
  serverExternalPackages: [],
  webpack(config, { dev }) {
    // Ensure @/ alias resolution works
    if (!config.resolve.alias['@']) {
      config.resolve.alias['@'] = process.cwd();
    }
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'

    const cspDirectives = [
      "default-src 'self'",
      // Scripts: Next.js requires 'unsafe-inline' for its hydration scripts
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      // Styles: inline styles needed by many UI libraries
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data:",
      // Fonts from Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: allow self, data URIs, blobs, and approved CDN sources.
      "img-src 'self' data: blob: http://localhost:* https://localhost:* http://127.0.0.1:* https://lokaaexports.com https://*.lokaaexports.com https://*.hstgr.io https://avatars.githubusercontent.com https://images.unsplash.com https://unsplash.com",
      // API connections (same origin only in production)
      isDev ? "connect-src 'self' ws://localhost:* wss://localhost:*" : "connect-src 'self'",
      // Block all frame embedding except self
      "frame-src 'none'",
      "frame-ancestors 'self'",
      // Block dangerous embedded content
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Force HTTPS in production
      ...(!isDev ? ["upgrade-insecure-requests"] : []),
    ].join('; ')

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // 2-year HSTS with preload - submit to https://hstspreload.org after deployment
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), speaker=(), usb=(), web-share=(), xr-spatial-tracking=()",
          },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ]
  },
}

export default nextConfig
