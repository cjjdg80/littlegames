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

// 生成静态路径
export async function generateStaticParams() {
  // 遍历 src/data/games/games/ 目录下所有分类和分页文件，收集所有游戏的 category 和 slug
  const fs = require("fs");
  const path = require("path");
  const gamesRoot = path.join(process.cwd(), "src/data/games/games");
  const params: { category: string; slug: string }[] = [];

  if (!fs.existsSync(gamesRoot)) return [];
  const categories = fs.readdirSync(gamesRoot).filter((dir: string) => fs.statSync(path.join(gamesRoot, dir)).isDirectory());

  for (const category of categories) {
    const categoryDir = path.join(gamesRoot, category);
    const files = fs.readdirSync(categoryDir).filter((f: string) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      const games = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      for (const game of games) {
        if (game.slug) {
          params.push({ category, slug: game.slug });
        }
      }
    }
  }
  return params;
}

// 生成页面元数据
export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  // 优先读取SEO文件
  const seoFilePath = path.join(process.cwd(), "test-output/seo/games", `${resolvedParams.slug}.json`);
  try {
    if (fs.existsSync(seoFilePath)) {
      const seoData = JSON.parse(fs.readFileSync(seoFilePath, "utf-8"));
      // 直接用SEO文件内容生成Metadata
      return {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        openGraph: seoData.openGraph,
        twitter: seoData.twitter,
        alternates: seoData.alternates,
        robots: seoData.robots,
      };
    }
  } catch (e) {
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
  return generateGameMetadata(game);
}

export default async function GamePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  // 获取游戏数据
  const game = await getGameBySlug(resolvedParams.category, resolvedParams.slug);
  
  if (!game) {
    notFound();
  }

  // 获取相关游戏推荐
  const relatedGames = await getRelatedGames(game.id, game.category, 6);

  // 构建面包屑导航数据
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
    { name: game.primary_category, url: `/games/${game.primary_category}` },
    { name: game.title, url: `/games/${game.primary_category}/${game.slug}` },
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
          game={game}
          relatedGames={relatedGames}
        />
      </div>
    </main>
  );
}