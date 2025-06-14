// src/lib/staticDataOptimizer.ts - 静态数据结构优化器
// 优化数据结构以支持Next.js静态生成和提高运行时性能

import { Game, GameCategory, DeviceType } from '@/types/game';
import { gameDataLoader } from './gameDataLoader';
import { getCategoryPreloadConfig, STATIC_GENERATION_CONFIG } from './dataPreloadConfig';
import path from 'path';
import fs from 'fs';

/**
 * 静态路径参数接口
 */
export interface StaticPathParams {
  category: string;
  slug: string;
}

/**
 * 静态生成数据接口
 */
export interface StaticGenerationData {
  /** 所有静态路径 */
  paths: StaticPathParams[];
  /** 分类统计 */
  categoryStats: Record<string, number>;
  /** 热门游戏列表 */
  featuredGames: Game[];
  /** 最近更新时间 */
  lastUpdated: string;
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  /** 当前页 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 总游戏数 */
  totalGames: number;
  /** 每页游戏数 */
  gamesPerPage: number;
  /** 是否有上一页 */
  hasPrevious: boolean;
  /** 是否有下一页 */
  hasNext: boolean;
}

/**
 * 静态数据优化器类
 */
export class StaticDataOptimizer {
  private static instance: StaticDataOptimizer;
  private outputPath: string;

  constructor() {
    this.outputPath = path.join(process.cwd(), 'src/data/static');
    // 确保输出目录存在
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StaticDataOptimizer {
    if (!StaticDataOptimizer.instance) {
      StaticDataOptimizer.instance = new StaticDataOptimizer();
    }
    return StaticDataOptimizer.instance;
  }

  /**
   * 生成所有静态路径
   * 用于Next.js的getStaticPaths
   */
  public async generateStaticPaths(): Promise<StaticPathParams[]> {
    const paths: StaticPathParams[] = [];
    const categories = await gameDataLoader.getCategories();

    for (const category of categories) {
      const config = getCategoryPreloadConfig(category as GameCategory);
      
      // 根据配置决定预生成多少页
      const pagesToGenerate = Math.min(
        config.preloadPages,
        STATIC_GENERATION_CONFIG.preGenerateCategoryPages
      );

      for (let page = 1; page <= pagesToGenerate; page++) {
        const gameList = await gameDataLoader.getGamesByCategory(
          category as GameCategory,
          page,
          config.gamesPerPage
        );

        // 为每个游戏生成路径
        for (const game of gameList.games) {
          paths.push({
            category: category,
            slug: game.slug
          });
        }
      }
    }

    // 额外添加热门游戏路径
    const featuredGames = await gameDataLoader.getFeaturedGames(
      STATIC_GENERATION_CONFIG.preGenerateGamesCount
    );
    
    for (const game of featuredGames) {
      const existingPath = paths.find(p => p.slug === game.slug);
      if (!existingPath) {
        paths.push({
          category: game.category,
          slug: game.slug
        });
      }
    }

    return paths;
  }

  /**
   * 生成分类统计数据
   */
  public async generateCategoryStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    const categories = await gameDataLoader.getCategories();

    for (const category of categories) {
      const gameList = await gameDataLoader.getGamesByCategory(
        category as GameCategory,
        1,
        1
      );
      stats[category] = gameList.total;
    }

    return stats;
  }

  /**
   * 生成分页信息
   * @param category 分类
   * @param currentPage 当前页
   * @param gamesPerPage 每页游戏数
   * @param totalGames 总游戏数
   */
  public generatePaginationInfo(
    category: string,
    currentPage: number,
    gamesPerPage: number,
    totalGames: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalGames / gamesPerPage);
    
    return {
      currentPage,
      totalPages,
      totalGames,
      gamesPerPage,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages
    };
  }

  /**
   * 生成面包屑导航数据
   * @param category 分类
   * @param gameTitle 游戏标题（可选）
   */
  public generateBreadcrumbs(category: string, gameTitle?: string) {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Games', href: '/games' },
      { label: this.formatCategoryName(category), href: `/games/${category}` }
    ];

    if (gameTitle) {
      breadcrumbs.push({
        label: gameTitle,
        href: '#'
      });
    }

    return breadcrumbs;
  }

  /**
   * 生成相关游戏推荐
   * @param currentGame 当前游戏
   * @param limit 推荐数量
   */
  public async generateRelatedGames(currentGame: Game, limit: number = 6): Promise<Game[]> {
    // 获取同分类的其他游戏
    const categoryGames = await gameDataLoader.getGamesByCategory(
      currentGame.category,
      1,
      limit + 5 // 多获取一些以便筛选
    );

    // 过滤掉当前游戏
    const relatedGames = categoryGames.games
      .filter(game => game.id !== currentGame.id)
      .slice(0, limit);

    // 如果同分类游戏不够，从热门游戏中补充
    if (relatedGames.length < limit) {
      const featuredGames = await gameDataLoader.getFeaturedGames(limit * 2);
      const additionalGames = featuredGames
        .filter(game => 
          game.id !== currentGame.id && 
          !relatedGames.some(rg => rg.id === game.id)
        )
        .slice(0, limit - relatedGames.length);
      
      relatedGames.push(...additionalGames);
    }

    return relatedGames;
  }

  /**
   * 生成SEO优化的游戏数据
   * @param game 游戏数据
   */
  public generateSEOOptimizedGameData(game: Game) {
    return {
      ...game,
      // 优化标题
      seoTitle: `${game.title.en} - Play Free Online Game`,
      // 优化描述
      seoDescription: this.generateSEODescription(game),
      // 生成关键词
      seoKeywords: this.generateSEOKeywords(game),
      // 生成结构化数据
      structuredData: this.generateStructuredData(game)
    };
  }

  /**
   * 生成静态生成所需的完整数据
   */
  public async generateStaticGenerationData(): Promise<StaticGenerationData> {
    const [paths, categoryStats, featuredGames] = await Promise.all([
      this.generateStaticPaths(),
      this.generateCategoryStats(),
      gameDataLoader.getFeaturedGames(20)
    ]);

    return {
      paths,
      categoryStats,
      featuredGames,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 保存静态生成数据到文件
   */
  public async saveStaticGenerationData(): Promise<void> {
    const data = await this.generateStaticGenerationData();
    const filePath = path.join(this.outputPath, 'static-generation-data.json');
    
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    console.log(`Static generation data saved to: ${filePath}`);
  }

  /**
   * 加载静态生成数据
   */
  public async loadStaticGenerationData(): Promise<StaticGenerationData | null> {
    const filePath = path.join(this.outputPath, 'static-generation-data.json');
    
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load static generation data:', error);
      return null;
    }
  }

  /**
   * 格式化分类名称
   * @param category 分类名称
   */
  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  /**
   * 生成SEO描述
   * @param game 游戏数据
   */
  private generateSEODescription(game: Game): string {
    const baseDescription = game.description.en || '';
    const category = this.formatCategoryName(game.category);
    const tags = game.tags.slice(0, 3).join(', ');
    
    if (baseDescription.length > 150) {
      return `${baseDescription.substring(0, 147)}...`;
    }
    
    return `Play ${game.title.en} - ${category} game. ${baseDescription} Tags: ${tags}. Free online game.`;
  }

  /**
   * 生成SEO关键词
   * @param game 游戏数据
   */
  private generateSEOKeywords(game: Game): string[] {
    const keywords = [
      game.title.en.toLowerCase(),
      game.category,
      'free online game',
      'browser game',
      ...game.tags.slice(0, 5)
    ];

    // 添加设备相关关键词
    if (game.devices.includes(DeviceType.MOBILE)) {
      keywords.push('mobile game');
    }
    if (game.devices.includes(DeviceType.DESKTOP)) {
      keywords.push('pc game');
    }

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 生成结构化数据
   * @param game 游戏数据
   */
  private generateStructuredData(game: Game) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: game.title.en,
      description: game.description.en,
      image: game.thumbnail,
      genre: game.category,
      gamePlatform: game.devices,
      author: {
        '@type': 'Organization',
        name: game.developer || 'Unknown'
      },
      datePublished: game.createdAt,
      dateModified: game.updatedAt,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '100'
      }
    };
  }
}

// 导出单例实例
export const staticDataOptimizer = StaticDataOptimizer.getInstance();

// 导出便捷函数
export const generateStaticPaths = () => staticDataOptimizer.generateStaticPaths();
export const generateCategoryStats = () => staticDataOptimizer.generateCategoryStats();
export const generatePaginationInfo = (
  category: string,
  currentPage: number,
  gamesPerPage: number,
  totalGames: number
) => staticDataOptimizer.generatePaginationInfo(category, currentPage, gamesPerPage, totalGames);
export const generateBreadcrumbs = (category: string, gameTitle?: string) => 
  staticDataOptimizer.generateBreadcrumbs(category, gameTitle);
export const generateRelatedGames = (currentGame: Game, limit?: number) => 
  staticDataOptimizer.generateRelatedGames(currentGame, limit);
export const generateSEOOptimizedGameData = (game: Game) => 
  staticDataOptimizer.generateSEOOptimizedGameData(game);