// src/app/games/[category]/page.tsx - 游戏分类页面动态路由组件

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCanonicalUrl, generateBreadcrumbs, getCategoryUrl } from '@/lib/url-utils';
import { getCategoryPageSEO, getAvailableCategories } from '@/lib/categorySEO';
import { getGamesByCategory } from '@/lib/gameDataLoader';
import CategoryPageClient from '@/components/pages/CategoryPageClient';

// 游戏数据类型定义
interface Game {
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  iframe_url: string;
  image_url: string;
  tags: string[];
  width: number;
  height: number;
}

// 分类数据类型定义
interface Category {
  name: string;
  slug: string;
  displayName: string;
  description: string;
  gameCount: number;
  featuredTags: string[];
}

// 页面参数类型
interface PageParams {
  category: string;
}

interface CategoryPageProps {
  params: Promise<PageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 生成静态路径参数
 * 为所有游戏分类生成静态页面路径
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    // 从SEO数据源加载所有可用分类
    const availableCategories = await getAvailableCategories();
    
    const categories: PageParams[] = availableCategories.map(category => ({
      category
    }));
    
    console.log(`Generated ${categories.length} static paths for category pages`);
    return categories;
  } catch (error) {
    console.error('Error generating static params for category pages:', error);
    // 如果读取失败，使用预定义的分类作为后备
    return [
      { category: 'action' },
      { category: 'adventure' },
      { category: 'arcade' },
      { category: 'casual' },
      { category: 'puzzle' },
      { category: 'simulation' },
      { category: 'sports' },
      { category: 'strategy' }
    ];
  }
}

/**
 * 生成页面元数据
 * 为每个分类页面生成SEO优化的元数据
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    // Next.js 15+ 需要await params
    const resolvedParams = await params;
    // 使用SEO工具库加载分类数据
    const { metadata } = await getCategoryPageSEO(resolvedParams.category);
    
    // 添加robots配置
    return {
      ...metadata,
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
  } catch (error) {
    console.error('Error generating metadata for category page:', error);
    return {
      title: 'Games Category',
      description: 'Play free online games'
    };
  }
}

/**
 * 游戏分类页面组件
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Next.js 15+ 需要await params和searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // 获取SEO数据和结构化数据
  const { seoData, structuredData } = await getCategoryPageSEO(resolvedParams.category);
  
  if (!seoData) {
    notFound();
  }
  
  // 获取分页和筛选参数
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const sortBy = (resolvedSearchParams.sort as string) || 'newest';
  const searchQuery = (resolvedSearchParams.search as string) || '';
  const gamesPerPage = 50; // 每页50个游戏，与首页保持一致
  
  // 加载游戏数据
  const { games, total } = await getGamesByCategory(
    resolvedParams.category as any, 
    currentPage, 
    gamesPerPage
  );
  
  // 计算总页数
  const totalPages = Math.ceil(total / gamesPerPage);
  
  return (
    <>
      {/* 结构化数据 - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      {/* 客户端组件处理交互逻辑 */}
      <CategoryPageClient 
        category={resolvedParams.category}
        seoData={seoData}
        games={games}
        currentPage={currentPage}
        totalPages={totalPages}
        totalGames={total}
        gamesPerPage={gamesPerPage}
        sortBy={sortBy}
        searchQuery={searchQuery}
      />
    </>
  );
}