/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    // App Router 在 Next.js 13.4+ 中已默认启用，无需配置
  },

  // 图片优化配置
  images: {
    // 允许的外部图片域名
    domains: [
      'cdn.example.com', // 游戏图片CDN
      'images.example.com', // 其他图片资源
    ],
    // 图片格式优化
    formats: ['image/webp', 'image/avif'],
    // 图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 重定向配置
  async redirects() {
    return [
      // 旧URL重定向到新URL结构
      {
        source: '/game/:path*',
        destination: '/games/:path*',
        permanent: true,
      },
      {
        source: '/category/:category',
        destination: '/games/:category',
        permanent: true,
      },
      {
        source: '/tag/:tag',
        destination: '/tags/:tag',
        permanent: true,
      },
      // 移除末尾斜杠（除了根路径）
      {
        source: '/((?!api/)(?!$).*)/',
        destination: '/$1',
        permanent: true,
      },
    ];
  },

  // URL重写配置
  async rewrites() {
    return [
      // 多语言路由重写
      {
        source: '/:locale(zh|es|fr|de|ja|ko)/games/:category/:slug',
        destination: '/:locale/games/:category/:slug',
      },
      {
        source: '/:locale(zh|es|fr|de|ja|ko)/games/:category',
        destination: '/:locale/games/:category',
      },
      {
        source: '/:locale(zh|es|fr|de|ja|ko)/tags/:tag',
        destination: '/:locale/tags/:tag',
      },
      // API路由重写
      {
        source: '/api/games/:path*',
        destination: '/api/games/:path*',
      },
      // 静态文件重写
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },

  // 头部配置（安全和SEO）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 安全头部
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // 缓存控制
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/((?!api/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
          },
        ],
      },
    ];
  },

  // 压缩配置
  compress: true,

  // 生成配置
  generateEtags: true,

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 环境变量配置
  env: {
    SITE_URL: process.env.SITE_URL || 'https://playbrowserminigames.com',
    SITE_NAME: process.env.SITE_NAME || 'Play Browser Mini Games',
  },

  // 输出配置
  output: 'standalone',

  // 静态导出配置（如果需要）
  // trailingSlash: false,
  // exportPathMap: async function (defaultPathMap) {
  //   return {
  //     '/': { page: '/' },
  //     // 动态生成游戏页面路径
  //   };
  // },

  // Webpack配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义webpack配置
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    return config;
  },

  // 性能配置
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify 在 Next.js 13+ 中已默认启用

  // 国际化配置（预留）
  // i18n: {
  //   locales: ['en', 'es', 'fr', 'de', 'pt', 'zh'],
  //   defaultLocale: 'en',
  //   domains: [
  //     {
  //       domain: 'playbrowserminigames.com',
  //       defaultLocale: 'en',
  //     },
  //     {
  //       domain: 'es.playbrowserminigames.com',
  //       defaultLocale: 'es',
  //     },
  //   ],
  // },
};

module.exports = nextConfig;