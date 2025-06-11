// src/types/game.ts - 游戏相关类型定义

import { Locale } from './common';

/**
 * 多语言文本接口
 */
export interface MultiLanguageText {
  /** 默认语言（英语） */
  en: string;
  /** 西班牙语 */
  es?: string;
  /** 法语 */
  fr?: string;
  /** 德语 */
  de?: string;
  /** 意大利语 */
  it?: string;
  /** 葡萄牙语 */
  pt?: string;
  /** 俄语 */
  ru?: string;
  /** 日语 */
  ja?: string;
  /** 韩语 */
  ko?: string;
  /** 中文 */
  zh?: string;
}

/**
 * iframe嵌入配置接口
 */
export interface IframeConfig {
  /** iframe源地址 */
  src: string;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 边框设置 */
  frameborder: number;
  /** 滚动条设置 */
  scrolling: 'yes' | 'no' | 'auto';
  /** 是否允许全屏 */
  allowfullscreen: boolean;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 游戏数据接口（增强版）
 */
export interface Game {
  /** 游戏唯一标识符 */
  id: string;
  /** 游戏slug（用于URL） */
  slug: string;
  /** 游戏名称（多语言） */
  title: MultiLanguageText;
  /** 游戏描述（多语言） */
  description: MultiLanguageText;
  /** 游戏缩略图URL */
  thumbnail: string;
  /** 游戏封面大图URL */
  coverImage?: string;
  /** iframe嵌入配置 */
  iframe: IframeConfig;
  /** 游戏分类 */
  category: GameCategory;
  /** 游戏标签 */
  tags: string[];
  /** 支持的设备类型 */
  devices: DeviceType[];
  /** 支持的语言 */
  supportedLanguages: Locale[];
  /** 屏幕方向 */
  orientation: 'portrait' | 'landscape' | 'both';
  /** 开发商 */
  developer?: string;
  /** 发布日期 */
  publishDate?: string;
  /** 适用年龄段 */
  ageRating?: string;
  /** 操作说明（多语言） */
  instructions?: MultiLanguageText;
  /** 是否为热门游戏 */
  featured: boolean;
  /** GameDistribution相关 */
  gameDistribution?: {
    /** 原始游戏ID */
    originalId: string;
    /** SDK referrer URL */
    sdkReferrerUrl?: string;
  };
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

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