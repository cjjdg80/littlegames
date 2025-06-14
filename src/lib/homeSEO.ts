// src/lib/homeSEO.ts - 首页SEO数据加载和管理工具
// 功能说明: 加载和处理首页SEO元数据，支持Open Graph和Twitter Card

import type { Metadata } from "next";

/**
 * 首页SEO数据接口 - 匹配test-output/seo/home.json的结构
 */
export interface HomeSEOData {
  page: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
    openGraph: {
      title: string;
      description: string;
      image: string;
      url: string;
      type: "website" | "article";
      siteName?: string;
    };
    twitter: {
      card: "summary" | "summary_large_image";
      title: string;
      description: string;
      image: string;
      site?: string;
    };
  };
  featuredCategories?: Array<{
    slug: string;
    name: string;
    description: string;
    gameCount: number;
  }>;
  stats?: {
    totalGames: number;
    totalCategories: number;
    totalTags: number;
    lastUpdated: string;
  };
  qualityScore?: number;
}

/**
 * 加载首页SEO数据
 * 从test-output/seo/home.json文件加载预生成的SEO数据
 */
export async function loadHomeSEOData(): Promise<HomeSEOData> {
  try {
    // 在生产环境中，这些数据应该被复制到public目录或作为静态资源导入
    // 目前直接使用我们生成的数据结构
    const homeSEOData: HomeSEOData = {
      page: "home",
      metadata: {
        title: "Play Browser Mini Games - Free Online Games Collection",
        description: "Discover thousands of free browser games! Play instantly without downloads. Adventure, puzzle, action, strategy games and more. Start playing now!",
        keywords: [
          "free browser games",
          "online games", 
          "mini games",
          "instant play games",
          "no download games",
          "web games",
          "casual games",
          "game collection"
        ],
        canonical: "https://playbrowserminigames.com/",
        openGraph: {
          title: "Play Browser Mini Games - Free Online Games Collection",
          description: "Discover thousands of free browser games! Play instantly without downloads. Adventure, puzzle, action, strategy games and more. Start playing now!",
          image: "https://playbrowserminigames.com/images/og-home.jpg",
          url: "https://playbrowserminigames.com/",
          type: "website",
          siteName: "Play Browser Mini Games"
        },
        twitter: {
          card: "summary_large_image",
          title: "Play Browser Mini Games - Free Online Games Collection", 
          description: "Discover thousands of free browser games! Play instantly without downloads. Adventure, puzzle, action, strategy games and more. Start playing now!",
          image: "https://playbrowserminigames.com/images/twitter-home.jpg",
          site: "@playbrowsergames"
        }
      },
      featuredCategories: [
        {
          slug: "action",
          name: "Action",
          description: "Fast-paced and intense games",
          gameCount: 1500
        },
        {
          slug: "adventure",
          name: "Adventure",
          description: "Epic quests and exploration games",
          gameCount: 1200
        },
        {
          slug: "puzzle",
          name: "Puzzle",
          description: "Brain teasers and logic games",
          gameCount: 1800
        },
        {
          slug: "strategy",
          name: "Strategy",
          description: "Tactical and planning games",
          gameCount: 900
        },
        {
          slug: "arcade",
          name: "Arcade",
          description: "Classic arcade-style games",
          gameCount: 2100
        },
        {
          slug: "sports",
          name: "Sports",
          description: "Athletic and competition games",
          gameCount: 600
        },
        {
          slug: "casual",
          name: "Casual",
          description: "Easy-to-play games for everyone",
          gameCount: 1800
        },
        {
          slug: "simulation",
          name: "Simulation",
          description: "Realistic simulations and life management",
          gameCount: 800
        }
      ],
      stats: {
        totalGames: 9726,
        totalCategories: 8,
        totalTags: 695,
        lastUpdated: "2025-06-12"
      },
      qualityScore: 0.85
    };

    return homeSEOData;
  } catch (error) {
    console.error('Error loading home SEO data:', error);
    
    // 提供fallback数据
    return {
      page: "home",
      metadata: {
        title: "Play Browser Mini Games - Free Online Games",
        description: "Play thousands of free browser mini games instantly. No downloads required!",
        keywords: ["free games", "browser games", "mini games", "online games"],
        canonical: "https://playbrowserminigames.com/",
        openGraph: {
          title: "Play Browser Mini Games - Free Online Games",
          description: "Play thousands of free browser mini games instantly. No downloads required!",
          image: "/images/default-og.jpg",
          url: "https://playbrowserminigames.com/",
          type: "website"
        },
        twitter: {
          card: "summary_large_image",
          title: "Play Browser Mini Games - Free Online Games", 
          description: "Play thousands of free browser mini games instantly. No downloads required!",
          image: "/images/default-twitter.jpg"
        }
      }
    };
  }
}

/**
 * 将首页SEO数据转换为Next.js Metadata格式
 */
export function convertToNextMetadata(seoData: HomeSEOData): Metadata {
  const { metadata } = seoData;
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    
    // Open Graph配置
    openGraph: {
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      url: metadata.openGraph.url,
      siteName: metadata.openGraph.siteName,
      images: [
        {
          url: metadata.openGraph.image,
          width: 1200,
          height: 630,
          alt: metadata.openGraph.title,
        },
      ],
      locale: 'en_US',
      type: metadata.openGraph.type,
    },
    
    // Twitter配置
    twitter: {
      card: metadata.twitter.card,
      title: metadata.twitter.title,
      description: metadata.twitter.description,
      site: metadata.twitter.site,
      images: [metadata.twitter.image],
    },
    
    // 其他SEO配置
    alternates: {
      canonical: metadata.canonical,
    },
    
    // Robots配置
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // 其他元数据
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  };
}

/**
 * 生成首页结构化数据 (JSON-LD)
 */
export function generateHomeStructuredData(seoData: HomeSEOData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Play Browser Mini Games",
    "description": seoData.metadata.description,
    "url": seoData.metadata.canonical,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://playbrowserminigames.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Play Browser Mini Games",
      "url": "https://playbrowserminigames.com"
    }
  };

  // 如果有统计数据，添加更多信息
  if (seoData.stats) {
    (structuredData as any).additionalProperty = [
      {
        "@type": "PropertyValue",
        "name": "Total Games",
        "value": seoData.stats.totalGames
      },
      {
        "@type": "PropertyValue", 
        "name": "Categories",
        "value": seoData.stats.totalCategories
      }
    ];
  }

  return JSON.stringify(structuredData);
}

/**
 * 获取首页的完整SEO配置
 * 包括metadata和结构化数据
 */
export async function getHomePageSEO(): Promise<{
  metadata: Metadata;
  structuredData: string;
  seoData: HomeSEOData;
}> {
  const seoData = await loadHomeSEOData();
  const metadata = convertToNextMetadata(seoData);
  const structuredData = generateHomeStructuredData(seoData);

  return {
    metadata,
    structuredData, 
    seoData,
  };
} 