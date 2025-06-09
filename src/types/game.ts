// src/types/game.ts - 游戏相关的TypeScript类型定义

/**
 * 游戏分类枚举
 */
export enum GameCategory {
  ACTION = 'action',
  PUZZLE = 'puzzle',
  STRATEGY = 'strategy',
  SPORTS = 'sports',
  RACING = 'racing',
  ADVENTURE = 'adventure',
  ARCADE = 'arcade',
  SIMULATION = 'simulation'
}

/**
 * 设备支持类型
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet'
}

/**
 * 游戏数据接口
 */
export interface Game {
  /** 游戏唯一标识符 */
  id: string;
  /** 游戏名称 */
  title: string;
  /** 游戏描述 */
  description: string;
  /** 游戏缩略图URL */
  thumbnail: string;
  /** 游戏URL */
  url: string;
  /** 游戏分类 */
  category: GameCategory;
  /** 游戏标签 */
  tags: string[];
  /** 支持的设备类型 */
  devices: DeviceType[];
  /** 游戏宽度 */
  width: number;
  /** 游戏高度 */
  height: number;
  /** 是否为热门游戏 */
  featured: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 游戏列表响应接口
 */
export interface GameListResponse {
  /** 游戏列表 */
  games: Game[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  /** 搜索关键词 */
  query?: string;
  /** 分类筛选 */
  category?: GameCategory;
  /** 设备类型筛选 */
  device?: DeviceType;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
}