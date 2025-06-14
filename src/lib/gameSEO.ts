// src/lib/gameSEO.ts - 游戏SEO数据加载器
// 功能说明: 加载和处理单个游戏的SEO数据，支持动态路由生成

import { Metadata } from "next";
import fs from "fs";
import path from "path";

/**
 * 游戏SEO数据接口 - 对应test-output/seo/games/目录下的JSON文件结构
 */
export interface GameSEOData {
  gameId: number;
  slug: string;
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
      type: string;
    };
    twitter: {
      card: string;
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
  relatedGames: any[];
  contentVariant: {
    variantId: string;
    customDescription: string;
    featuredTags: string[];
    recommendationReason: string;
  };
}

/**
 * 游戏基础数据接口
 */
export interface GameData {
  id: number;
  slug: string;
  title: string;
  description: string;
  instructions?: string;
  thumbnail: string;
  iframe_src: string;
  iframe_width: number;
  iframe_height: number;
  primary_category: string;
  all_categories?: string[];
  tags: string[];
  devices: string[];
  developer?: string;
  featured: boolean;
}

/**
 * 加载游戏SEO数据
 * @param category 游戏分类
 * @param slug 游戏slug
 * @returns 游戏SEO数据或null
 */
export async function loadGameSEO(category: string, slug: string): Promise<GameSEOData | null> {
  try {
    // 构建SEO文件路径 - 根据实际文件命名规则调整
    const seoFilePath = path.join(process.cwd(), 'test-output/seo/games', `${slug}.json`);
    
    // 检查文件是否存在
    if (!fs.existsSync(seoFilePath)) {
      console.warn(`SEO文件不存在: ${seoFilePath}`);
      return null;
    }
    
    // 读取并解析SEO数据
    const seoData: GameSEOData = JSON.parse(fs.readFileSync(seoFilePath, 'utf-8'));
    
    return seoData;
  } catch (error) {
    console.error(`加载游戏SEO数据失败 (${category}/${slug}):`, error);
    return null;
  }
}

/**
 * 加载游戏基础数据
 * @param category 游戏分类
 * @param slug 游戏slug
 * @returns 游戏数据或null
 */
export async function loadGameData(category: string, slug: string): Promise<GameData | null> {
  try {
    // 读取游戏数据 - 从src/data/games/games/{category}/目录下的分页文件中查找
    const gamesDir = path.join(process.cwd(), 'src/data/games/games', category);
    
    if (!fs.existsSync(gamesDir)) {
      console.warn(`游戏分类目录不存在: ${gamesDir}`);
      return null;
    }
    
    // 遍历分页文件查找目标游戏
    const pageFiles = fs.readdirSync(gamesDir).filter(file => file.startsWith('page-') && file.endsWith('.json'));
    
    for (const pageFile of pageFiles) {
      const pageFilePath = path.join(gamesDir, pageFile);
      const gamesInPage: GameData[] = JSON.parse(fs.readFileSync(pageFilePath, 'utf-8'));
      
      // 查找匹配的游戏
      const game = gamesInPage.find(g => g.slug === slug);
      if (game) {
        return game;
      }
    }
    
    console.warn(`未找到游戏数据: ${category}/${slug}`);
    return null;
  } catch (error) {
    console.error(`加载游戏数据失败 (${category}/${slug}):`, error);
    return null;
  }
}

/**
 * 生成游戏页面的Next.js Metadata
 * @param seoData 游戏SEO数据
 * @param gameData 游戏基础数据
 * @returns Next.js Metadata对象
 */
export function generateGameMetadata(seoData: GameSEOData, gameData: GameData): Metadata {
  return {
    title: seoData.metadata.title,
    description: seoData.metadata.description,
    keywords: seoData.metadata.keywords.join(', '),
    
    // Open Graph 标签
    openGraph: {
      title: seoData.metadata.openGraph.title,
      description: seoData.metadata.openGraph.description,
      url: seoData.metadata.openGraph.url,
      siteName: 'Play Browser Mini Games',
      images: [
        {
          url: seoData.metadata.openGraph.image,
          width: 1200,
          height: 630,
          alt: `${gameData.title} game screenshot`
        }
      ],
      type: 'article'
    },
    
    // Twitter Card 标签
    twitter: {
      card: 'summary_large_image',
      title: seoData.metadata.twitter.title,
      description: seoData.metadata.twitter.description,
      images: [seoData.metadata.twitter.image]
    },
    
    // 其他SEO标签
    alternates: {
      canonical: seoData.metadata.canonical
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

/**
 * 生成游戏结构化数据 (JSON-LD)
 * @param seoData 游戏SEO数据
 * @param gameData 游戏基础数据
 * @returns JSON-LD字符串
 */
export function generateGameStructuredData(seoData: GameSEOData, gameData: GameData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": gameData.title,
    "description": seoData.metadata.description,
    "image": seoData.metadata.openGraph.image,
    "url": seoData.metadata.canonical,
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "gameItem": {
      "@type": "Thing",
      "name": gameData.title
    },
    "genre": gameData.primary_category,
    "keywords": seoData.metadata.keywords.join(', '),
    "publisher": {
      "@type": "Organization",
      "name": "Play Browser Mini Games",
      "url": "https://playbrowserminigames.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "100"
    }
  };
  
  return JSON.stringify(structuredData);
}

/**
 * 获取游戏推荐数据
 * @param gameId 当前游戏ID
 * @param category 游戏分类
 * @param limit 推荐数量限制
 * @returns 推荐游戏列表
 */
export async function getRelatedGames(gameId: number, category: string, limit: number = 10): Promise<GameData[]> {
  try {
    // 从同分类中获取其他游戏作为推荐
    const gamesDir = path.join(process.cwd(), 'src/data/games/games', category);
    
    if (!fs.existsSync(gamesDir)) {
      return [];
    }
    
    const relatedGames: GameData[] = [];
    const pageFiles = fs.readdirSync(gamesDir).filter(file => file.startsWith('page-') && file.endsWith('.json'));
    
    for (const pageFile of pageFiles) {
      if (relatedGames.length >= limit) break;
      
      const pageFilePath = path.join(gamesDir, pageFile);
      const gamesInPage: GameData[] = JSON.parse(fs.readFileSync(pageFilePath, 'utf-8'));
      
      // 过滤掉当前游戏，添加其他游戏到推荐列表
      const otherGames = gamesInPage.filter(g => g.id !== gameId);
      relatedGames.push(...otherGames.slice(0, limit - relatedGames.length));
    }
    
    return relatedGames.slice(0, limit);
  } catch (error) {
    console.error('获取推荐游戏失败:', error);
    return [];
  }
} 