// src/app/page.tsx - 游戏网站首页
// 功能说明: 使用组件化结构的游戏聚合首页，Play Browser Mini Games项目首页，应用SEO优化

import React from "react";
import type { Metadata } from "next";
import { getHomePageSEO } from "@/lib/homeSEO";
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

  return (
    <>
      {/* 结构化数据 - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      {/* 客户端组件处理交互逻辑 */}
      <HomePageClient seoData={seoData} />
    </>
  );
}
