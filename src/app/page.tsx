// src/app/page.tsx - 网站首页
// 功能说明: 展示游戏聚合平台首页，包含Hero区域、分类导航、精选游戏等，使用真实游戏数据

import React from "react";
import type { Metadata } from "next";
import { getHomePageSEO } from "@/lib/homeSEO";
import { getFeaturedGamesFromLatest, getAllNewestGames } from "@/lib/gameDataLoader";
import { adaptGamesForHomePage } from "@/lib/gameDataAdapter";
import HomePageClient from "@/components/pages/HomePageClient";

// 生成首页SEO metadata
export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getHomePageSEO();
  return metadata;
}

// 首页服务器组件 - 用于SEO和结构化数据
export default async function HomePage() {
  // 获取SEO数据和结构化数据
  const { structuredData, seoData } = await getHomePageSEO();
  
  // 加载真实游戏数据 - 动态加载所有可用游戏以支持客户端分页
  const [featuredGames, allNewestGames] = await Promise.all([
    getFeaturedGamesFromLatest(10), // 获取10个精选游戏，显示2排×5个
    getAllNewestGames() // 获取所有可用的最新游戏，支持客户端分页（每页50个）
  ]);
  
  // 转换为首页组件期望的格式
  const adaptedFeaturedGames = adaptGamesForHomePage(featuredGames);
  const adaptedAllNewestGames = adaptGamesForHomePage(allNewestGames);

  return (
    <>
      {/* 结构化数据 - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      {/* 客户端组件处理交互逻辑 */}
      <HomePageClient 
        seoData={seoData}
        featuredGames={adaptedFeaturedGames}
        newestGames={adaptedAllNewestGames}
      />
    </>
  );
}
