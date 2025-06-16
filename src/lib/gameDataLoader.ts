// src/lib/gameDataLoader.ts - 前端游戏数据加载器
// 提供统一的数据加载接口，支持静态生成和客户端渲染

import { Game, GameCategory, GameListResponse, SearchParams, DeviceType } from '@/types/game';
import { Locale } from '@/types/common';
import path from 'path';
import fs from 'fs';
import { cache } from 'react';

/**
 * 游戏数据加载器类
 * 负责从本地JSON文件加载游戏数据，支持分页、分类筛选等功能
 */
export class GameDataLoader {
  private static instance: GameDataLoader;
  private dataPath: string;
  private gamesIndex: any[] = [];
  private categoryIndex: Record<string, any> = {};
  private isInitialized = false;

  constructor() {
    // 数据文件路径
    this.dataPath = path.join(process.cwd(), 'src/data/games');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): GameDataLoader {
    if (!GameDataLoader.instance) {
      GameDataLoader.instance = new GameDataLoader();
    }
    return GameDataLoader.instance;
  }

  /**
   * 初始化数据加载器
   * 加载索引文件到内存中以提高查询性能
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 加载游戏索引
      const gamesIndexPath = path.join(this.dataPath, 'games-index.json');
      const gamesIndexData = await fs.promises.readFile(gamesIndexPath, 'utf-8');
      this.gamesIndex = JSON.parse(gamesIndexData);

      // 加载分类索引
      const categoryIndexPath = path.join(this.dataPath, 'category-index.json');
      const categoryIndexData = await fs.promises.readFile(categoryIndexPath, 'utf-8');
      this.categoryIndex = JSON.parse(categoryIndexData);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize GameDataLoader:', error);
      throw new Error('游戏数据加载器初始化失败');
    }
  }

  /**
   * 根据slug获取单个游戏详情
   * @param slug 游戏slug标识符
   * @param category 游戏分类（可选，用于优化查找）
   * @returns 游戏详情或null
   */
  public async getGameBySlug(slug: string, category?: string): Promise<Game | null> {
    await this.initialize();

    try {
      // 从索引中查找游戏基本信息
      const gameIndex = this.gamesIndex.find(game => game.slug === slug);
      if (!gameIndex) {
        return null;
      }

      // 确定分类
      const gameCategory = category || gameIndex.primary_category;
      
      // 计算游戏在分页文件中的位置
      const categoryGames = this.gamesIndex.filter(g => g.primary_category === gameCategory);
      const gameIndexInCategory = categoryGames.findIndex(g => g.slug === slug);
      
      if (gameIndexInCategory === -1) {
        return null;
      }

      // 计算分页信息（每页20个游戏）
      const gamesPerPage = 20;
      const pageNumber = Math.floor(gameIndexInCategory / gamesPerPage) + 1;
      
      // 加载对应的分页文件
      const pageFilePath = path.join(this.dataPath, 'games', gameCategory, `page-${pageNumber}.json`);
      const pageData = await fs.promises.readFile(pageFilePath, 'utf-8');
      const games = JSON.parse(pageData);
      
      // 查找具体游戏数据
      const gameData = games.find((game: any) => game.slug === slug);
      
      if (!gameData) {
        return null;
      }

      // 转换为标准Game接口格式
      return this.transformToGameInterface(gameData);
    } catch (error) {
      console.error(`Failed to load game with slug: ${slug}`, error);
      return null;
    }
  }

  /**
   * 获取分类游戏列表（支持分页）
   * @param category 游戏分类
   * @param page 页码（从1开始）
   * @param limit 每页数量（默认20）
   * @returns 游戏列表响应
   */
  public async getGamesByCategory(
    category: GameCategory, 
    page: number = 1, 
    limit: number = 20
  ): Promise<GameListResponse> {
    await this.initialize();

    try {
      // 计算分页文件编号
      const pageNumber = Math.ceil((page * limit) / 20);
      const pageFilePath = path.join(this.dataPath, 'games', category, `page-${pageNumber}.json`);
      
      // 检查文件是否存在
      if (!fs.existsSync(pageFilePath)) {
        return {
          games: [],
          total: 0,
          page,
          limit
        };
      }

      // 加载分页数据
      const pageData = await fs.promises.readFile(pageFilePath, 'utf-8');
      const games = JSON.parse(pageData);
      
      // 计算实际的起始和结束索引
      const startIndex = ((page - 1) * limit) % 20;
      const endIndex = Math.min(startIndex + limit, games.length);
      
      // 获取当前页的游戏
      const pageGames = games.slice(startIndex, endIndex);
      
      // 转换为标准Game接口格式
      const transformedGames = pageGames.map((game: any) => this.transformToGameInterface(game));
      
      // 获取总数
      const categoryGames = this.gamesIndex.filter(g => g.primary_category === category);
      const total = categoryGames.length;

      return {
        games: transformedGames,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error(`Failed to load games for category: ${category}`, error);
      return {
        games: [],
        total: 0,
        page,
        limit
      };
    }
  }

  /**
   * 获取热门游戏列表
   * @param limit 数量限制（默认10）
   * @returns 热门游戏列表
   */
  public async getFeaturedGames(limit: number = 10): Promise<Game[]> {
    await this.initialize();

    try {
      // 从索引中筛选热门游戏
      const featuredGames = this.gamesIndex.filter(game => game.featured).slice(0, limit);
      
      // 加载详细数据
      const games: Game[] = [];
      for (const gameIndex of featuredGames) {
        const game = await this.getGameBySlug(gameIndex.slug, gameIndex.primary_category);
        if (game) {
          games.push(game);
        }
      }
      
      return games;
    } catch (error) {
      console.error('Failed to load featured games:', error);
      return [];
    }
  }

  /**
   * 搜索游戏
   * @param params 搜索参数
   * @returns 搜索结果
   */
  public async searchGames(params: SearchParams): Promise<GameListResponse> {
    await this.initialize();

    const { query, category, page = 1, limit = 20 } = params;
    
    try {
      let filteredGames = [...this.gamesIndex];
      
      // 分类筛选
      if (category) {
        filteredGames = filteredGames.filter(game => game.primary_category === category);
      }
      
      // 关键词搜索
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredGames = filteredGames.filter(game => 
          game.title.toLowerCase().includes(searchTerm) ||
          (game.tags && game.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)))
        );
      }
      
      // 分页
      const total = filteredGames.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGames = filteredGames.slice(startIndex, endIndex);
      
      // 加载详细数据
      const games: Game[] = [];
      for (const gameIndex of paginatedGames) {
        const game = await this.getGameBySlug(gameIndex.slug, gameIndex.primary_category);
        if (game) {
          games.push(game);
        }
      }
      
      return {
        games,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Failed to search games:', error);
      return {
        games: [],
        total: 0,
        page,
        limit
      };
    }
  }

  /**
   * 获取所有可用的游戏分类
   * @returns 分类列表
   */
  public async getCategories(): Promise<string[]> {
    await this.initialize();
    return Object.keys(this.categoryIndex);
  }

  /**
   * 将原始游戏数据转换为标准Game接口格式
   * @param rawGame 原始游戏数据
   * @returns 标准Game对象
   */
  private transformToGameInterface(rawGame: any): Game {
    return {
      id: rawGame.id.toString(),
      slug: rawGame.slug,
      title: {
        en: rawGame.title
      },
      description: {
        en: rawGame.description || ''
      },
      thumbnail: rawGame.thumbnail,
      iframe: {
        src: rawGame.iframe_src,
        width: rawGame.iframe_width || 800,
        height: rawGame.iframe_height || 600,
        frameborder: 0,
        scrolling: 'no',
        allowfullscreen: true
      },
      category: rawGame.primary_category as GameCategory,
      tags: rawGame.tags || [],
      devices: ['desktop', 'mobile', 'tablet'] as DeviceType[],
      supportedLanguages: ['en'],
      orientation: 'both',
      developer: rawGame.developer,
      instructions: rawGame.instructions ? {
        en: rawGame.instructions
      } : undefined,
      featured: rawGame.featured || false,
      gameDistribution: {
        originalId: rawGame.id.toString()
      },
      createdAt: rawGame.collection_time || new Date().toISOString(),
      updatedAt: rawGame.collection_time || new Date().toISOString()
    };
  }
}

// 导出单例实例
export const gameDataLoader = GameDataLoader.getInstance();

// 导出便捷函数
export const getGameBySlug = cache(async (category: string, slug: string): Promise<Game | null> => {
  // 检查缓存
  const cacheKey = `${category}-${slug}`;
  if (gamesCache.has(cacheKey)) {
    return gamesCache.get(cacheKey)!;
  }

  // 遍历该分类下所有分页文件，查找slug
  const categoryDir = path.join(process.cwd(), "src/data/games/games", category);
  if (!fs.existsSync(categoryDir)) return null;
  const files = fs.readdirSync(categoryDir).filter((f: string) => f.endsWith(".json"));
  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    try {
      const games = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const game = games.find((g: any) => g.slug === slug);
      if (game) {
        gamesCache.set(cacheKey, game);
        return game;
      }
    } catch (e) {
      // 忽略单个文件读取错误
    }
  }
  return null;
});

export const getGamesByCategory = cache(async (
  category: GameCategory | string,
  page: number = 1,
  limit: number = 50
): Promise<{ games: Game[]; total: number }> => {
  if (!category) return { games: [], total: 0 };
  
  try {
    // 使用latest-200-games.json作为数据源，确保与实际生成的静态页面一致
    const latest200Games = await getLatest200Games();
    
    // 按分类筛选游戏
    const categoryGames = latest200Games.filter(game => game.category === category);
    
    // 计算分页
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, categoryGames.length);
    const pageGames = categoryGames.slice(startIndex, endIndex);
    
    return {
      games: pageGames,
      total: categoryGames.length
    };
  } catch (error) {
    console.error(`Error loading games for category: ${category}`, error);
    return { games: [], total: 0 };
  }
});

export const getFeaturedGames = (limit?: number) => 
  gameDataLoader.getFeaturedGames(limit);

export const searchGames = (params: SearchParams) => 
  gameDataLoader.searchGames(params);

export const getCategories = () => 
  gameDataLoader.getCategories();

// 缓存游戏数据
const gamesCache = new Map<string, Game>();

// 从文件加载游戏数据
async function loadGameData(category: string, page: number): Promise<Game[]> {
  if (!category) return [];
  const filePath = path.join(process.cwd(), "src/data/games/games", category, `page-${page}.json`);
  try {
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading game data from ${filePath}:`, error);
    return [];
  }
}

// 获取相关游戏推荐
export const getRelatedGames = cache(async (
  currentGameId: string,
  category: string,
  limit: number = 6
): Promise<Game[]> => {
  if (!category) return [];
  // 加载分类下的所有游戏数据
  const games = await loadGameData(category, 1);
  // 过滤掉当前游戏，并按featured状态和创建时间排序
  return games
    .filter(game => game.id !== currentGameId)
    .sort((a, b) => {
      // 优先显示featured游戏
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // 然后按创建时间排序（新游戏优先）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
});

// 加载最新200个游戏数据（用于首页展示）
export const getLatest200Games = cache(async (): Promise<Game[]> => {
  try {
    const filePath = path.join(process.cwd(), "src/data/latest-200-games.json");
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    const gamesData = JSON.parse(fileContent);
    
    // 转换为标准Game格式
    return gamesData.map((game: any) => ({
      id: game.id.toString(),
      slug: game.slug,
      title: game.title, // 直接使用字符串格式
      description: game.description || `Play ${game.title} online for free. An exciting ${game.primary_category} game.`,
      thumbnail: game.thumbnail,
      iframe: {
        src: game.iframe_src || '',
        width: game.iframe_width || 800,
        height: game.iframe_height || 600,
        frameborder: 0,
        scrolling: 'no',
        allowfullscreen: true
      },
      category: game.primary_category as GameCategory, // 修复：使用primary_category映射到category
      tags: game.tags || [],
      devices: game.devices || ['desktop', 'mobile', 'tablet'] as DeviceType[],
      supportedLanguages: game.languages || ['en'] as Locale[],
      orientation: 'both' as const,
      featured: game.featured || false,
      developer: game.developer,
      createdAt: game.collection_time || new Date().toISOString(),
      updatedAt: game.collection_time || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error loading latest 200 games:', error);
    return [];
  }
});

// 获取精选游戏（从最新200个游戏中筛选featured=true的游戏）
export const getFeaturedGamesFromLatest = cache(async (limit: number = 6): Promise<Game[]> => {
  const latest200Games = await getLatest200Games();
  return latest200Games
    .filter(game => game.featured)
    .slice(0, limit);
});

// 获取最新游戏（按ID降序排列）
export const getNewestGames = cache(async (limit?: number): Promise<Game[]> => {
  const latest200Games = await getLatest200Games();
  return latest200Games
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, limit);
});

// 获取所有最新游戏（用于首页展示）
export const getAllNewestGames = cache(async (): Promise<Game[]> => {
  const latest200Games = await getLatest200Games();
  return latest200Games.sort((a, b) => parseInt(b.id) - parseInt(a.id));
});