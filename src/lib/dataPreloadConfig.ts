// src/lib/dataPreloadConfig.ts - 数据预加载配置
// 定义静态生成时的数据预加载策略和缓存配置

import { GameCategory } from '@/types/game';

/**
 * 预加载策略枚举
 */
export enum PreloadStrategy {
  /** 立即加载 - 在构建时预加载 */
  IMMEDIATE = 'immediate',
  /** 延迟加载 - 在首次访问时加载 */
  LAZY = 'lazy',
  /** 按需加载 - 仅在需要时加载 */
  ON_DEMAND = 'on_demand'
}

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  /** 内存缓存 */
  MEMORY = 'memory',
  /** 文件系统缓存 */
  FILESYSTEM = 'filesystem',
  /** 无缓存 */
  NONE = 'none'
}

/**
 * 数据预加载配置接口
 */
export interface DataPreloadConfig {
  /** 预加载策略 */
  strategy: PreloadStrategy;
  /** 缓存策略 */
  cache: CacheStrategy;
  /** 缓存过期时间（毫秒） */
  cacheExpiry: number;
  /** 是否启用压缩 */
  compression: boolean;
  /** 最大缓存大小（MB） */
  maxCacheSize: number;
}

/**
 * 分类预加载配置接口
 */
export interface CategoryPreloadConfig extends DataPreloadConfig {
  /** 分类名称 */
  category: GameCategory;
  /** 预加载的页数 */
  preloadPages: number;
  /** 每页游戏数量 */
  gamesPerPage: number;
}

/**
 * 全局数据预加载配置
 */
export const GLOBAL_PRELOAD_CONFIG: DataPreloadConfig = {
  strategy: PreloadStrategy.IMMEDIATE,
  cache: CacheStrategy.MEMORY,
  cacheExpiry: 1000 * 60 * 60, // 1小时
  compression: true,
  maxCacheSize: 50 // 50MB
};

/**
 * 分类预加载配置
 * 根据分类的重要性和访问频率配置不同的预加载策略
 */
export const CATEGORY_PRELOAD_CONFIGS: CategoryPreloadConfig[] = [
  {
    category: GameCategory.ARCADE,
    strategy: PreloadStrategy.IMMEDIATE,
    cache: CacheStrategy.MEMORY,
    cacheExpiry: 1000 * 60 * 30, // 30分钟
    compression: true,
    maxCacheSize: 10,
    preloadPages: 3, // 预加载前3页
    gamesPerPage: 20
  },
  {
    category: GameCategory.PUZZLE,
    strategy: PreloadStrategy.IMMEDIATE,
    cache: CacheStrategy.MEMORY,
    cacheExpiry: 1000 * 60 * 30,
    compression: true,
    maxCacheSize: 10,
    preloadPages: 3,
    gamesPerPage: 20
  },
  {
    category: GameCategory.ACTION,
    strategy: PreloadStrategy.LAZY,
    cache: CacheStrategy.MEMORY,
    cacheExpiry: 1000 * 60 * 20, // 20分钟
    compression: true,
    maxCacheSize: 8,
    preloadPages: 2,
    gamesPerPage: 20
  },
  {
    category: GameCategory.STRATEGY,
    strategy: PreloadStrategy.LAZY,
    cache: CacheStrategy.MEMORY,
    cacheExpiry: 1000 * 60 * 20,
    compression: true,
    maxCacheSize: 8,
    preloadPages: 2,
    gamesPerPage: 20
  },
  {
    category: GameCategory.SPORTS,
    strategy: PreloadStrategy.ON_DEMAND,
    cache: CacheStrategy.FILESYSTEM,
    cacheExpiry: 1000 * 60 * 15, // 15分钟
    compression: true,
    maxCacheSize: 5,
    preloadPages: 1,
    gamesPerPage: 20
  },
  {
    category: GameCategory.RACING,
    strategy: PreloadStrategy.ON_DEMAND,
    cache: CacheStrategy.FILESYSTEM,
    cacheExpiry: 1000 * 60 * 15,
    compression: true,
    maxCacheSize: 5,
    preloadPages: 1,
    gamesPerPage: 20
  },
  {
    category: GameCategory.ADVENTURE,
    strategy: PreloadStrategy.LAZY,
    cache: CacheStrategy.MEMORY,
    cacheExpiry: 1000 * 60 * 25, // 25分钟
    compression: true,
    maxCacheSize: 8,
    preloadPages: 2,
    gamesPerPage: 20
  },
  {
    category: GameCategory.SIMULATION,
    strategy: PreloadStrategy.ON_DEMAND,
    cache: CacheStrategy.FILESYSTEM,
    cacheExpiry: 1000 * 60 * 15,
    compression: true,
    maxCacheSize: 5,
    preloadPages: 1,
    gamesPerPage: 20
  }
];

/**
 * 热门游戏预加载配置
 */
export const FEATURED_GAMES_CONFIG: DataPreloadConfig = {
  strategy: PreloadStrategy.IMMEDIATE,
  cache: CacheStrategy.MEMORY,
  cacheExpiry: 1000 * 60 * 60 * 2, // 2小时
  compression: true,
  maxCacheSize: 15
};

/**
 * 搜索结果预加载配置
 */
export const SEARCH_RESULTS_CONFIG: DataPreloadConfig = {
  strategy: PreloadStrategy.ON_DEMAND,
  cache: CacheStrategy.MEMORY,
  cacheExpiry: 1000 * 60 * 10, // 10分钟
  compression: false,
  maxCacheSize: 5
};

/**
 * 静态生成配置
 */
export interface StaticGenerationConfig {
  /** 是否启用增量静态再生 */
  enableISR: boolean;
  /** ISR重新验证间隔（秒） */
  revalidateInterval: number;
  /** 预生成的游戏页面数量 */
  preGenerateGamesCount: number;
  /** 预生成的分类页面数量 */
  preGenerateCategoryPages: number;
  /** 是否生成sitemap */
  generateSitemap: boolean;
  /** 是否生成robots.txt */
  generateRobots: boolean;
}

/**
 * 静态生成配置
 */
export const STATIC_GENERATION_CONFIG: StaticGenerationConfig = {
  enableISR: true,
  revalidateInterval: 3600, // 1小时
  preGenerateGamesCount: 100, // 预生成前100个热门游戏
  preGenerateCategoryPages: 5, // 每个分类预生成前5页
  generateSitemap: true,
  generateRobots: true
};

/**
 * 性能优化配置
 */
export interface PerformanceConfig {
  /** 图片懒加载 */
  lazyLoadImages: boolean;
  /** 预加载关键资源 */
  preloadCriticalResources: boolean;
  /** 启用Service Worker */
  enableServiceWorker: boolean;
  /** 压缩响应 */
  compressResponses: boolean;
  /** 最大并发请求数 */
  maxConcurrentRequests: number;
}

/**
 * 性能优化配置
 */
export const PERFORMANCE_CONFIG: PerformanceConfig = {
  lazyLoadImages: true,
  preloadCriticalResources: true,
  enableServiceWorker: false, // 暂时禁用，后续可开启
  compressResponses: true,
  maxConcurrentRequests: 6
};

/**
 * 根据分类获取预加载配置
 * @param category 游戏分类
 * @returns 分类预加载配置
 */
export function getCategoryPreloadConfig(category: GameCategory): CategoryPreloadConfig {
  const config = CATEGORY_PRELOAD_CONFIGS.find(c => c.category === category);
  if (!config) {
    // 返回默认配置
    return {
      category,
      strategy: PreloadStrategy.ON_DEMAND,
      cache: CacheStrategy.FILESYSTEM,
      cacheExpiry: 1000 * 60 * 15,
      compression: true,
      maxCacheSize: 5,
      preloadPages: 1,
      gamesPerPage: 20
    };
  }
  return config;
}

/**
 * 检查是否应该预加载数据
 * @param strategy 预加载策略
 * @param context 上下文（build时或runtime时）
 * @returns 是否应该预加载
 */
export function shouldPreload(strategy: PreloadStrategy, context: 'build' | 'runtime'): boolean {
  switch (strategy) {
    case PreloadStrategy.IMMEDIATE:
      return true;
    case PreloadStrategy.LAZY:
      return context === 'runtime';
    case PreloadStrategy.ON_DEMAND:
      return false;
    default:
      return false;
  }
}

/**
 * 计算缓存键
 * @param type 数据类型
 * @param identifier 标识符
 * @returns 缓存键
 */
export function getCacheKey(type: string, identifier: string): string {
  return `playbrowserminigames:${type}:${identifier}`;
}

/**
 * 检查缓存是否过期
 * @param timestamp 缓存时间戳
 * @param expiry 过期时间（毫秒）
 * @returns 是否过期
 */
export function isCacheExpired(timestamp: number, expiry: number): boolean {
  return Date.now() - timestamp > expiry;
}