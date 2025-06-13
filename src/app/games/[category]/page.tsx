// src/app/games/[category]/page.tsx - 游戏分类页面动态路由组件

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCanonicalUrl, generateBreadcrumbs, getCategoryUrl } from '@/lib/url-utils';
import { getCategoryPageSEO, getAvailableCategories } from '@/lib/categorySEO';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
 * 根据分类获取游戏列表
 * @param category 分类slug
 * @param page 页码
 * @param limit 每页数量
 * @returns 游戏列表
 */
async function getCategoryGames(category: string, page: number = 1, limit: number = 24): Promise<Game[]> {
  try {
    // TODO: 实现从数据文件加载分类游戏的逻辑
    // 需要读取 src/data/games/games/[category]/ 目录下的分页文件
    
    console.log(`Loading games for category: ${category}, page: ${page}`);
    
    // 暂时返回空数组
    return [];
  } catch (error) {
    console.error('Error loading category games:', error);
    return [];
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
  
  // 获取分页参数
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const sortBy = (resolvedSearchParams.sort as string) || 'popular';
  
  // 加载游戏数据
  const games = await getCategoryGames(resolvedParams.category, currentPage);
  
  return (
    <>
      {/* 结构化数据 - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      {/* 页面内容 */}
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* 导航栏 */}
        <Header />

        {/* 面包屑导航 */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-3 text-sm">
              {seoData.breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-500">/</span>}
                  {crumb.current ? (
                    <span className="text-gray-300 font-medium">{crumb.label}</span>
                  ) : (
                    <a href={crumb.href} className="text-blue-400 hover:text-blue-300">
                      {crumb.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        {/* 分类标题和描述 */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">{seoData.displayName}</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">{seoData.description || seoData.metadata.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>{seoData.gameCount || 0}+ Games Available</span>
                <span>•</span>
                <span>Free to Play</span>
                <span>•</span>
                <span>No Download Required</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 筛选和排序控件 */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-300">Sort by:</span>
                <select 
                  className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={sortBy}
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">View:</span>
                <button className="p-1 text-gray-500 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-1 text-blue-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <main className="flex-1">
          {/* 游戏网格 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {games.map((game) => (
                  <div key={game.id} className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-700 rounded-t-lg overflow-hidden">
                      <img 
                        src={game.image_url || '/images/default-game-thumbnail.svg'}
                        alt={game.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{game.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{game.category}</span>
                        <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Games Coming Soon</h3>
                <p className="text-gray-400">We're working on adding {seoData.displayName.toLowerCase()} to our collection.</p>
              </div>
            )}
            
            {/* 分页导航 */}
            {games.length > 0 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50" disabled={currentPage <= 1}>
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-300">
                  Page {currentPage}
                </span>
                <button className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700">
                  Next
                </button>
              </div>
            )}
          </div>
        </main>

        {/* 页脚 */}
        <Footer />
      </div>
    </>
  );
}