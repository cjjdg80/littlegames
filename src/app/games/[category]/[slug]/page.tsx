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

// 生成静态路径 - 只生成最新100个游戏的静态页面
export async function generateStaticParams() {
  const fs = require("fs");
  const path = require("path");
  
  try {
    // 读取最新100个游戏的索引数据
    const latest100Path = path.join(process.cwd(), "src/data/latest-100-games.json");
    
    if (!fs.existsSync(latest100Path)) {
      console.warn('最新100个游戏索引文件不存在，请先运行生成脚本');
      return [];
    }
    
    const latest100Games = JSON.parse(fs.readFileSync(latest100Path, "utf-8"));
    const params: { category: string; slug: string }[] = [];
    
    // 为每个游戏生成静态路径参数
    for (const game of latest100Games) {
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
  // 优先读取SEO文件
  const seoFilePath = path.join(process.cwd(), "test-output/seo/games", `${resolvedParams.slug}.json`);
  try {
    if (fs.existsSync(seoFilePath)) {
      const seoData = JSON.parse(fs.readFileSync(seoFilePath, "utf-8"));
      // 使用正确的嵌套结构读取SEO数据
      return {
        title: seoData.metadata.title,
        description: seoData.metadata.description,
        keywords: seoData.metadata.keywords?.join(', '),
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
              alt: `${seoData.metadata.title} game screenshot`
            }
          ],
          type: 'article'
        },
        twitter: {
          card: 'summary_large_image',
          title: seoData.metadata.twitter.title,
          description: seoData.metadata.twitter.description,
          images: [seoData.metadata.twitter.image]
        },
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
  } catch (e) {
    console.error('读取SEO文件失败:', e);
    // 读取SEO文件失败，降级为主数据生成
  }
  // fallback 到主数据生成
  const game = await getGameBySlug(resolvedParams.category, resolvedParams.slug);
  if (!game) {
    return {
      title: "Game Not Found",
      description: "The requested game could not be found.",
    };
  }
  
  // 使用游戏基础数据生成简单的metadata
  const gameTitle = typeof game.title === 'string' ? game.title : game.title.en;
  const gameDescription = typeof game.description === 'string' ? game.description : game.description.en;
  
  return {
    title: `Play ${gameTitle} - Free Online Game`,
    description: gameDescription || `Play ${gameTitle} online for free. No download required!`,
    openGraph: {
      title: `Play ${gameTitle} - Free Online Game`,
      description: gameDescription || `Play ${gameTitle} online for free. No download required!`,
      url: `https://playbrowserminigames.com/games/${resolvedParams.category}/${resolvedParams.slug}`,
      siteName: 'Play Browser Mini Games',
      images: [
        {
          url: game.thumbnail,
          width: 1200,
          height: 630,
          alt: `${gameTitle} game screenshot`
        }
      ],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Play ${gameTitle} - Free Online Game`,
      description: gameDescription || `Play ${gameTitle} online for free. No download required!`,
      images: [game.thumbnail]
    }
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const resolvedParams = await params;
  // 获取游戏数据
  const game = await getGameBySlug(resolvedParams.category, resolvedParams.slug);
  
  if (!game) {
    notFound();
  }

  // 获取相关游戏推荐
  const relatedGames = await getRelatedGames(game.id, game.category, 6);

  // 转换Game类型以适配GameDetailClient组件
  const adaptedGame = {
    id: game.id,
    title: typeof game.title === 'string' ? game.title : game.title.en,
    primary_category: (game as any).primary_category || game.category,
    thumbnail: game.thumbnail,
    description: typeof game.description === 'string' ? game.description : game.description.en,
    instructions: typeof game.instructions === 'string' ? game.instructions : game.instructions?.en,
    iframe_src: (game as any).iframe_src || game.iframe?.src,
    iframe_width: (game as any).iframe_width || game.iframe?.width || 800,
    iframe_height: (game as any).iframe_height || game.iframe?.height || 600,
    tags: game.tags,
    featured: game.featured,
    slug: game.slug
  };

  const adaptedRelatedGames = relatedGames.map(relatedGame => ({
    id: relatedGame.id,
    title: typeof relatedGame.title === 'string' ? relatedGame.title : relatedGame.title.en,
    primary_category: (relatedGame as any).primary_category || relatedGame.category,
    thumbnail: relatedGame.thumbnail,
    description: typeof relatedGame.description === 'string' ? relatedGame.description : relatedGame.description.en,
    instructions: typeof relatedGame.instructions === 'string' ? relatedGame.instructions : relatedGame.instructions?.en,
    iframe_src: (relatedGame as any).iframe_src || relatedGame.iframe?.src,
    iframe_width: (relatedGame as any).iframe_width || relatedGame.iframe?.width || 800,
    iframe_height: (relatedGame as any).iframe_height || relatedGame.iframe?.height || 600,
    tags: relatedGame.tags,
    featured: relatedGame.featured,
    slug: relatedGame.slug
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
        />
      </div>
    </main>
  );
}