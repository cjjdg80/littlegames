// src/app/games/[category]/[slug]/page.tsx - 游戏详情页面
// 功能说明: 展示游戏详情，包含游戏iframe、描述、相关推荐等信息

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameBySlug, getRelatedGames } from "@/lib/gameDataLoader";
import { generateGameMetadata } from "@/lib/gameSEO";
import GameDetailClient from "@/components/pages/GameDetailClient";
import Breadcrumb from "@/components/Breadcrumb";
import AdBanner from "@/components/ads/AdBanner";
import fs from "fs";
import path from "path";

// 获取游戏内链配置的函数
async function getGameLinksConfig(gameId: number) {
  try {
    const configPath = path.join(process.cwd(), 'src/data/game-links-config-200.json');
    
    if (!fs.existsSync(configPath)) {
      console.warn('游戏内链配置文件不存在，使用默认推荐');
      return null;
}

    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return configData.links[gameId.toString()] || null;
  } catch (error) {
    console.error('读取游戏内链配置失败:', error);
    return null;
}
}

// 生成静态路径 - 生成最新200个游戏的静态页面
export async function generateStaticParams() {
  const fs = require("fs");
  const path = require("path");
  
  try {
    // 读取最新200个游戏的索引数据
    const latest200Path = path.join(process.cwd(), "src/data/latest-200-games.json");
    
    if (!fs.existsSync(latest200Path)) {
      console.warn('最新200个游戏索引文件不存在，请先运行生成脚本');
      return [];
    }
    
    const latest200Games = JSON.parse(fs.readFileSync(latest200Path, "utf-8"));
    const params: { category: string; slug: string }[] = [];
    
    // 为每个游戏生成静态路径参数
    for (const game of latest200Games) {
      if (game.slug && game.primary_category) {
        params.push({ 
          category: game.primary_category, 
          slug: game.slug 
        });
      }
    }
    
    console.log(`生成静态路径参数: ${params.length} 个游戏页面`);
    return params;
  } catch (error) {
    console.error('生成静态路径参数失败:', error);
    return [];
  }
}

// 生成页面元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    // 优先从SEO文件读取元数据
    const seoFilePath = path.join(
      process.cwd(),
      "test-output/seo/games",
      `${resolvedParams.slug}.json`
    );

    if (fs.existsSync(seoFilePath)) {
      const seoData = JSON.parse(fs.readFileSync(seoFilePath, "utf-8"));
      
      return {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        openGraph: {
          title: seoData.openGraph?.title || seoData.title,
          description: seoData.openGraph?.description || seoData.description,
          images: seoData.openGraph?.images || [],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: seoData.twitter?.title || seoData.title,
          description: seoData.twitter?.description || seoData.description,
          images: seoData.twitter?.images || [],
        },
        alternates: {
          canonical: seoData.canonical,
        },
      };
    }

    // 降级到动态生成元数据
    const game = await getGameBySlug(resolvedParams.category, resolvedParams.slug);
    if (!game) {
      return {
        title: "Game Not Found",
        description: "The requested game could not be found.",
      };
    }

    // 生成基础元数据（不使用generateGameMetadata函数，因为没有SEO数据）
    const gameTitle = typeof game.title === 'string' ? game.title : game.title.en;
    const gameDescription = typeof game.description === 'string' ? game.description : game.description.en;
    
    return {
      title: `${gameTitle} - Play Free Online Game`,
      description: gameDescription || `Play ${gameTitle} online for free. Fun and engaging browser game.`,
      keywords: game.tags?.join(', ') || 'online game, browser game, free game',
      openGraph: {
        title: `${gameTitle} - Play Free Online Game`,
        description: gameDescription || `Play ${gameTitle} online for free.`,
        images: [game.thumbnail],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${gameTitle} - Play Free Online Game`,
        description: gameDescription || `Play ${gameTitle} online for free.`,
        images: [game.thumbnail],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Game Page",
      description: "Play free online games",
    };
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const resolvedParams = await params;
  
  // 从latest-200-games.json中查找游戏数据
  const fs = require("fs");
  const path = require("path");
  
  let game = null;
  try {
    const latest200Path = path.join(process.cwd(), "src/data/latest-200-games.json");
    const latest200Games = JSON.parse(fs.readFileSync(latest200Path, "utf-8"));
    game = latest200Games.find((g: any) => g.slug === resolvedParams.slug && g.primary_category === resolvedParams.category);
  } catch (error) {
    console.error('Error loading game data:', error);
  }
  
  if (!game) {
    notFound();
  }
  
  // 获取游戏内链配置（优先使用预生成的内链配置）
  const gameLinksConfig = await getGameLinksConfig(parseInt(game.id));
  
  // 如果有预生成的内链配置，使用它；否则使用默认推荐
  let relatedGames = [];
  let discoverMoreGames = [];
  let featuredGames = [];
  
  if (gameLinksConfig) {
    // 使用预生成的内链配置
    relatedGames = gameLinksConfig.relatedGames || [];
    discoverMoreGames = gameLinksConfig.discoverMoreGames || [];
    featuredGames = gameLinksConfig.featuredGames || [];
    console.log(`✅ 使用预生成内链配置 - 游戏ID: ${game.id}, 相关游戏: ${relatedGames.length}, 发现更多: ${discoverMoreGames.length}, 精选: ${featuredGames.length}`);
  } else {
    // 降级到默认推荐
    const defaultRelated = await getRelatedGames(game.id, game.category, 6);
    relatedGames = defaultRelated;
    console.warn(`⚠️  使用默认推荐 - 游戏ID: ${game.id}`);
  }

  // 转换Game类型以适配GameDetailClient组件
  const adaptedGame = {
    id: game.id.toString(),
    title: game.title,
    primary_category: game.primary_category,
    thumbnail: game.thumbnail,
    description: game.description,
    instructions: game.instructions || '',
    iframe_src: game.iframe_src,
    iframe_width: game.iframe_width || 800,
    iframe_height: game.iframe_height || 600,
    tags: game.tags || [],
    featured: game.featured || false,
    slug: game.slug
  };

  const adaptedRelatedGames = relatedGames.map((relatedGame: any) => ({
    id: relatedGame.id.toString(),
    title: relatedGame.title,
    primary_category: relatedGame.primary_category,
    thumbnail: relatedGame.thumbnail,
    description: typeof relatedGame.description === 'string' ? relatedGame.description : relatedGame.description,
    instructions: typeof relatedGame.instructions === 'string' ? relatedGame.instructions : relatedGame.instructions,
    iframe_src: (relatedGame as any).iframe_src || '',
    iframe_width: (relatedGame as any).iframe_width || 800,
    iframe_height: (relatedGame as any).iframe_height || 600,
    tags: relatedGame.tags || [],
    featured: relatedGame.featured,
    slug: relatedGame.slug
  }));

  // 转换Discover More Games数据
  const adaptedDiscoverMoreGames = discoverMoreGames.map((discoverGame: any) => ({
    id: discoverGame.id,
    title: discoverGame.title,
    primary_category: discoverGame.primary_category,
    thumbnail: discoverGame.thumbnail,
    description: discoverGame.description || `Play ${discoverGame.title} online for free.`,
    instructions: discoverGame.instructions || '',
    iframe_src: discoverGame.iframe_src || '',
    iframe_width: 800,
    iframe_height: 600,
    tags: discoverGame.tags || [],
    featured: discoverGame.featured,
    slug: discoverGame.slug
  }));

  // 构建面包屑导航数据
  const gameCategory = (game as any).primary_category || game.category;
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
    { name: gameCategory, url: `/games/${gameCategory}` },
    { name: adaptedGame.title, url: `/games/${gameCategory}/${game.slug}` },
  ];
  
  return (
    <main className="min-h-screen bg-gray-900">
      {/* 面包屑导航 */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
              </div>
      {/* 游戏详情内容 */}
      <div className="container mx-auto px-4 py-8">
        <GameDetailClient 
          game={adaptedGame}
          relatedGames={adaptedRelatedGames}
          discoverMoreGames={adaptedDiscoverMoreGames}
        />
      </div>
    </main>
  );
}