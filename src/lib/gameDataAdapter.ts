// src/lib/gameDataAdapter.ts - 游戏数据适配器
// 功能说明: 将标准Game接口转换为各种组件期望的数据格式

import { Game } from '@/types/game';

/**
 * 首页组件期望的游戏数据格式
 */
export interface HomePageGame {
  id: string;
  title: string;
  category: string;
  rating: number;
  downloads: string;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  slug: string;
  description: string;
}

/**
 * 将标准Game类型转换为首页组件格式
 * @param game 标准Game对象
 * @returns 首页组件格式的游戏数据
 */
export function adaptGameForHomePage(game: Game): HomePageGame {
  return {
    id: game.id,
    title: typeof game.title === 'string' ? game.title : game.title.en,
    category: game.category,
    rating: 5.0, // 默认评分，后续可以从真实数据获取
    downloads: generateDownloads(game.id), // 生成下载量显示
    image: game.thumbnail,
    featured: game.featured,
    isNew: isNewGame(game.createdAt),
    slug: game.slug,
    description: typeof game.description === 'string' ? game.description : game.description.en
  };
}

/**
 * 批量转换游戏数据
 * @param games 标准Game数组
 * @returns 首页组件格式的游戏数据数组
 */
export function adaptGamesForHomePage(games: Game[]): HomePageGame[] {
  return games.map(adaptGameForHomePage);
}

/**
 * 根据游戏ID生成下载量显示（模拟数据）
 * @param gameId 游戏ID
 * @returns 下载量字符串
 */
function generateDownloads(gameId: string): string {
  const id = parseInt(gameId);
  const base = (id % 1000) + 500; // 500-1500之间的基数
  
  if (base > 1000) {
    return `${(base / 1000).toFixed(1)}K`;
  }
  return `${base}`;
}

/**
 * 判断游戏是否为新游戏（7天内）
 * @param createdAt 创建时间
 * @returns 是否为新游戏
 */
function isNewGame(createdAt: string): boolean {
  const gameDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - gameDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

/**
 * 生成游戏URL
 * @param category 游戏分类
 * @param slug 游戏slug
 * @returns 游戏详情页URL
 */
export function generateGameUrl(category: string, slug: string): string {
  return `/games/${category}/${slug}`;
} 