// src/app/games/featured/page.tsx - 精选游戏页面
// 功能说明: 显示精选游戏列表，支持分页和排序

import { Metadata } from "next";
import { getNewestGames } from "@/lib/gameDataLoader";
import { adaptGamesForHomePage } from "@/lib/gameDataAdapter";
import FeaturedGamesPageClient from "@/components/pages/FeaturedGamesPageClient";

// 生成页面元数据
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Featured Games - Play Browser Mini Games",
    description: "Discover our handpicked selection of the best browser games. Play featured games online for free, no download required!",
    keywords: "featured games, best browser games, online games, free games, popular games",
    openGraph: {
      title: "Featured Games - Play Browser Mini Games",
      description: "Discover our handpicked selection of the best browser games. Play featured games online for free, no download required!",
      url: "https://playbrowserminigames.com/games/featured",
      siteName: "Play Browser Mini Games",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Featured Games - Play Browser Mini Games",
      description: "Discover our handpicked selection of the best browser games. Play featured games online for free, no download required!"
    },
    alternates: {
      canonical: "https://playbrowserminigames.com/games/featured"
    }
  };
}

export default async function FeaturedGamesPage() {
  // 获取最新50个游戏作为精选游戏
  // 后续可以调整为按游玩数排序，如果没有游玩数据则按从新到旧排序
  const featuredGames = await getNewestGames(50);
  
  // 转换为首页组件期望的格式
  const adaptedGames = adaptGamesForHomePage(featuredGames);

  return (
    <FeaturedGamesPageClient 
      games={adaptedGames}
      totalGames={featuredGames.length}
    />
  );
} 