// src/lib/seo-utils.ts - SEO工具函数，用于生成SEO相关的元数据和标签

import { getCanonicalUrl, generateHreflangTags } from './url-utils';

/**
 * 网站基础配置
 */
export const SITE_CONFIG = {
  name: 'Play Browser Mini Games',
  description: 'Play thousands of free online games directly in your browser. No downloads required!',
  url: 'https://playbrowserminigames.com',
  ogImage: '/images/og-image.svg',
  twitterHandle: '@playbrowsergames'
};

/**
 * 支持的语言列表（预留多语言支持）
 */
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'zh'];

/**
 * 默认的SEO元数据
 */
export const DEFAULT_SEO = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  keywords: 'free online games, browser games, mini games, casual games, puzzle games, action games',
  ogImage: SITE_CONFIG.ogImage
};

/**
 * 生成结构化数据 (JSON-LD)
 * @param type 结构化数据类型
 * @param data 数据对象
 * @returns JSON-LD字符串
 */
export function generateJsonLd(type: string, data: any): string {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  return JSON.stringify(baseData, null, 2);
}

/**
 * 生成游戏页面的结构化数据
 * @param game 游戏数据
 * @returns 游戏结构化数据
 */
export function generateGameJsonLd(game: {
  name: string;
  description: string;
  category: string;
  image_url: string;
  url: string;
}) {
  return generateJsonLd('Game', {
    name: game.name,
    description: game.description,
    genre: game.category,
    image: game.image_url,
    url: game.url,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url
    },
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    }
  });
}

/**
 * 生成网站结构化数据
 * @returns 网站结构化数据
 */
export function generateWebsiteJsonLd() {
  return generateJsonLd('WebSite', {
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * 生成面包屑结构化数据
 * @param breadcrumbs 面包屑数据
 * @returns 面包屑结构化数据
 */
export function generateBreadcrumbJsonLd(breadcrumbs: Array<{ name: string; url: string }>) {
  return generateJsonLd('BreadcrumbList', {
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url === '#' ? undefined : getCanonicalUrl(crumb.url)
    }))
  });
}

/**
 * 生成组织结构化数据
 * @returns 组织结构化数据
 */
export function generateOrganizationJsonLd() {
  return generateJsonLd('Organization', {
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      // 社交媒体链接（如果有）
      // 'https://twitter.com/playbrowsergames',
      // 'https://facebook.com/playbrowsergames'
    ]
  });
}

/**
 * 生成完整的页面SEO元数据
 * @param options SEO选项
 * @returns 完整的元数据对象
 */
export function generatePageSEO(options: {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: string[];
}) {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    canonical,
    ogImage = DEFAULT_SEO.ogImage,
    ogType = 'website',
    noIndex = false,
    jsonLd = []
  } = options;
  
  const canonicalUrl = canonical ? getCanonicalUrl(canonical) : SITE_CONFIG.url;
  
  return {
    title,
    description,
    keywords,
    
    // Open Graph 标签
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      type: ogType
    },
    
    // Twitter Card 标签
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle
    },
    
    // 其他SEO标签
    alternates: {
      canonical: canonicalUrl
    },
    
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large' as 'none' | 'standard' | 'large',
        'max-snippet': -1
      }
    },
    
    // 结构化数据
    other: {
      'application/ld+json': jsonLd
    }
  };
}

/**
 * 生成hreflang标签（预留多语言支持）
 * @param currentPath 当前页面路径
 * @param locale 当前语言
 * @returns hreflang标签数组
 */
export function generateHreflang(currentPath: string, locale: string = 'en') {
  return generateHreflangTags(currentPath, SUPPORTED_LOCALES);
}

/**
 * 验证和清理SEO文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 清理后的文本
 */
export function sanitizeSEOText(text: string, maxLength: number = 160): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[\r\n]+/g, ' ') // 移除换行符
    .substring(0, maxLength)
    .trim();
}

/**
 * 生成SEO友好的标题
 * @param title 原始标题
 * @param suffix 后缀（如网站名称）
 * @param maxLength 最大长度
 * @returns SEO优化的标题
 */
export function generateSEOTitle(title: string, suffix?: string, maxLength: number = 60): string {
  const cleanTitle = sanitizeSEOText(title, maxLength - (suffix ? suffix.length + 3 : 0));
  return suffix ? `${cleanTitle} | ${suffix}` : cleanTitle;
}

/**
 * 生成SEO友好的描述
 * @param description 原始描述
 * @param maxLength 最大长度
 * @returns SEO优化的描述
 */
export function generateSEODescription(description: string, maxLength: number = 160): string {
  return sanitizeSEOText(description, maxLength);
}

/**
 * 生成关键词字符串
 * @param keywords 关键词数组
 * @param maxKeywords 最大关键词数量
 * @returns 关键词字符串
 */
export function generateKeywords(keywords: string[], maxKeywords: number = 10): string {
  return keywords
    .slice(0, maxKeywords)
    .map(keyword => keyword.trim().toLowerCase())
    .filter(keyword => keyword.length > 0)
    .join(', ');
}

/**
 * 重定向规则配置
 */
export const SEO_REDIRECTS = {
  // 旧URL重定向到新URL
  '/game/': '/games/',
  '/category/': '/games/',
  '/tag/': '/tags/'
};

/**
 * 检查并处理SEO重定向
 * @param pathname 当前路径
 * @returns 重定向目标或null
 */
export function checkSEORedirect(pathname: string): string | null {
  // 检查预定义的重定向规则
  for (const [oldPath, newPath] of Object.entries(SEO_REDIRECTS)) {
    if (pathname.startsWith(oldPath)) {
      return pathname.replace(oldPath, newPath);
    }
  }
  
  // 移除末尾的斜杠（除了根路径）
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  
  // 转换为小写（如果包含大写字母）
  if (pathname !== pathname.toLowerCase()) {
    return pathname.toLowerCase();
  }
  
  return null;
}

/**
 * 生成robots.txt内容
 * @returns robots.txt内容
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_CONFIG.url}/sitemap.xml`;
}

/**
 * 生成sitemap URL条目
 * @param url URL路径
 * @param lastmod 最后修改时间
 * @param changefreq 更新频率
 * @param priority 优先级
 * @returns sitemap URL条目
 */
export function generateSitemapUrl({
  url,
  lastmod,
  changefreq = 'weekly',
  priority = 0.5
}: {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}) {
  return {
    url: getCanonicalUrl(url),
    lastModified: lastmod || new Date().toISOString(),
    changeFrequency: changefreq,
    priority
  };
}