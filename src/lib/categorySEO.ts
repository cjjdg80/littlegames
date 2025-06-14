// src/lib/categorySEO.ts - 分类页面SEO数据加载和管理工具
// 功能说明: 加载和处理分类页面SEO元数据，支持动态生成和缓存

import type { Metadata } from "next";
import path from "path";
import fs from "fs";

/**
 * 分类SEO数据接口 - 匹配test-output/seo/categories/下的JSON结构
 */
export interface CategorySEOData {
  category: string;
  displayName: string;
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
      type: "website";
    };
    twitter: {
      card: "summary_large_image";
      title: string;
      description: string;
      image: string;
    };
  };
  breadcrumbs: Array<{
    label: string;
    href: string;
    current?: boolean;
  }>;
  description?: string;
  featuredGames?: string[];
  gameCount?: number;
  featuredTags?: string[];
  content?: {
    mainDescription: string;
    featuredContent: string;
    gameStats: {
      total: number;
      featured: number;
      recent: number;
    };
  };
  subcategories?: string[];
}

/**
 * 获取分类页面SEO数据
 * @param category 分类slug
 * @returns SEO数据和结构化数据
 */
export async function getCategoryPageSEO(category: string): Promise<{
  metadata: Metadata;
  seoData: CategorySEOData | null;
  structuredData: string;
}> {
  try {
    // 读取分类SEO文件
    const seoFilePath = path.join(process.cwd(), 'test-output/seo/categories', `${category}.json`);
    
    if (!fs.existsSync(seoFilePath)) {
      console.warn(`分类SEO文件不存在: ${category}`);
      return {
        metadata: getDefaultCategoryMetadata(category),
        seoData: null,
        structuredData: JSON.stringify(getDefaultStructuredData(category))
      };
    }

    const seoData: CategorySEOData = JSON.parse(fs.readFileSync(seoFilePath, 'utf-8'));
    
    // 转换为Next.js Metadata格式
    const metadata: Metadata = {
      title: seoData.metadata.title,
      description: seoData.metadata.description,
      keywords: seoData.metadata.keywords,
      openGraph: {
        title: seoData.metadata.openGraph.title,
        description: seoData.metadata.openGraph.description,
        url: seoData.metadata.openGraph.url,
        siteName: "Play Browser Mini Games",
        images: [
          {
            url: seoData.metadata.openGraph.image,
            width: 1200,
            height: 630,
            alt: `${seoData.displayName} games collection`
          }
        ],
        type: "website"
      },
      twitter: {
        card: "summary_large_image",
        title: seoData.metadata.twitter.title,
        description: seoData.metadata.twitter.description,
        images: [seoData.metadata.twitter.image]
      },
      alternates: {
        canonical: seoData.metadata.canonical
      }
    };

    // 生成结构化数据
    const structuredData = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": seoData.metadata.title,
      "description": seoData.metadata.description,
      "url": seoData.metadata.canonical,
      "mainEntity": {
        "@type": "ItemList",
        "name": `${seoData.displayName} Games`,
        "description": seoData.description || seoData.metadata.description,
        "numberOfItems": seoData.gameCount || 0
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": seoData.breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.label,
          "item": `https://playbrowserminigames.com${crumb.href}`
        }))
      },
      "publisher": {
        "@type": "Organization",
        "name": "Play Browser Mini Games",
        "url": "https://playbrowserminigames.com"
      }
    });

    return {
      metadata,
      seoData,
      structuredData
    };

  } catch (error) {
    console.error('分类SEO数据加载失败:', error);
    return {
      metadata: getDefaultCategoryMetadata(category),
      seoData: null,
      structuredData: JSON.stringify(getDefaultStructuredData(category))
    };
  }
}

/**
 * 获取默认分类元数据
 */
function getDefaultCategoryMetadata(category: string): Metadata {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${categoryName} Games - Play Free Online | Play Browser Mini Games`,
    description: `Play the best ${category} games online for free. Browse our collection of ${category} games and start playing instantly in your browser.`,
    keywords: [`${category} games`, "free online games", "browser games", "instant play"],
    openGraph: {
      title: `${categoryName} Games - Free Online Collection`,
      description: `Play free ${category} games online instantly`,
      url: `https://playbrowserminigames.com/games/${category}`,
      siteName: "Play Browser Mini Games",
      images: [
        {
          url: "/images/default-game-thumbnail.svg",
          width: 1200,
          height: 630,
          alt: `${categoryName} games collection`
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Games - Free Online`,
      description: `Play free ${category} games online instantly`,
      images: ["/images/default-game-thumbnail.svg"]
    },
    alternates: {
      canonical: `https://playbrowserminigames.com/games/${category}`
    }
  };
}

/**
 * 获取默认结构化数据
 */
function getDefaultStructuredData(category: string) {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName} Games Collection`,
    "description": `Free ${category} games online`,
    "url": `https://playbrowserminigames.com/games/${category}`,
    "publisher": {
      "@type": "Organization",
      "name": "Play Browser Mini Games",
      "url": "https://playbrowserminigames.com"
    }
  };
}

/**
 * 获取所有可用分类列表
 */
export async function getAvailableCategories(): Promise<string[]> {
  try {
    const categoriesDir = path.join(process.cwd(), 'test-output/seo/categories');
    if (!fs.existsSync(categoriesDir)) {
      return [];
    }
    
    const files = fs.readdirSync(categoriesDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return [];
  }
} 