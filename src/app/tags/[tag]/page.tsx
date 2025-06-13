// src/app/tags/[tag]/page.tsx - 标签页面动态路由组件

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCanonicalUrl, getTagUrl } from '@/lib/url-utils';

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

// 标签数据类型定义
interface Tag {
  name: string;
  slug: string;
  displayName: string;
  description: string;
  gameCount: number;
  relatedTags: string[];
  categories: string[];
}

// 页面参数类型
interface PageParams {
  tag: string;
}

interface TagPageProps {
  params: Promise<PageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 生成静态路径参数
 * 为所有游戏标签生成静态页面路径
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    // TODO: 从数据源加载所有标签数据
    // 这里需要读取标签索引文件
    
    // 暂时返回空数组，后续从 src/data/games/tags-index.json 加载
    const tags: PageParams[] = [
      // { tag: 'action' },
      // { tag: 'puzzle' },
      // { tag: 'adventure' },
      // 更多标签...
    ];
    
    console.log(`Generated ${tags.length} static paths for tag pages`);
    return tags;
  } catch (error) {
    console.error('Error generating static params for tag pages:', error);
    return [];
  }
}

/**
 * 生成页面元数据
 * 为每个标签页面生成SEO优化的元数据
 */
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const tagData = await getTagData(resolvedParams.tag);
    
    if (!tagData) {
      return {
        title: 'Tag Not Found',
        description: 'The requested game tag could not be found.'
      };
    }

    const canonicalUrl = getCanonicalUrl(getTagUrl(resolvedParams.tag));
    const tagName = tagData.displayName || tagData.name;
    
    return {
      title: `${tagName} Games - Play Free Online | ${tagData.gameCount}+ Games`,
      description: tagData.description || `Play the best ${tagName.toLowerCase()} games online for free. Discover ${tagData.gameCount}+ games tagged with ${tagName.toLowerCase()}.`,
      keywords: [tagName, 'free online games', 'browser games', ...tagData.relatedTags, ...tagData.categories].join(', '),
      
      // Open Graph 标签
      openGraph: {
        title: `${tagName} Games - Free Online Collection`,
        description: `Play ${tagData.gameCount}+ free ${tagName.toLowerCase()} games online`,
        url: canonicalUrl,
        siteName: 'Play Browser Mini Games',
        images: [
          {
            url: '/images/default-game-thumbnail.svg',
            width: 1200,
            height: 630,
            alt: `${tagName} games collection`
          }
        ],
        type: 'website'
      },
      
      // Twitter Card 标签
      twitter: {
        card: 'summary_large_image',
        title: `${tagName} Games - Free Online`,
        description: `Play ${tagData.gameCount}+ free ${tagName.toLowerCase()} games`,
        images: ['/images/default-game-thumbnail.svg']
      },
      
      // 其他SEO标签
      alternates: {
        canonical: canonicalUrl
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
  } catch (error) {
    console.error('Error generating metadata for tag page:', error);
    return {
      title: 'Games Tag',
      description: 'Play free online games'
    };
  }
}

/**
 * 根据标签获取标签数据
 * @param tag 标签slug
 * @returns 标签数据或null
 */
async function getTagData(tag: string): Promise<Tag | null> {
  try {
    // TODO: 实现从数据文件加载标签数据的逻辑
    // 需要读取 src/data/games/tags-index.json 文件
    
    console.log(`Loading tag data for: ${tag}`);
    
    // 暂时返回模拟数据
    const mockTags: { [key: string]: Tag } = {
      action: {
        name: 'action',
        slug: 'action',
        displayName: 'Action',
        description: 'Fast-paced games that require quick reflexes and decision-making skills.',
        gameCount: 450,
        relatedTags: ['adventure', 'shooting', 'fighting'],
        categories: ['action', 'arcade']
      },
      puzzle: {
        name: 'puzzle',
        slug: 'puzzle',
        displayName: 'Puzzle',
        description: 'Brain-teasing games that challenge your logic and problem-solving abilities.',
        gameCount: 320,
        relatedTags: ['logic', 'brain', 'strategy'],
        categories: ['puzzle', 'casual']
      }
      // 更多标签数据...
    };
    
    return mockTags[tag] || null;
  } catch (error) {
    console.error('Error loading tag data:', error);
    return null;
  }
}

/**
 * 根据标签获取游戏列表
 * @param tag 标签slug
 * @param page 页码
 * @param limit 每页数量
 * @returns 游戏列表
 */
async function getTagGames(tag: string, page: number = 1, limit: number = 24): Promise<Game[]> {
  try {
    // TODO: 实现从数据文件加载标签游戏的逻辑
    // 需要搜索所有游戏数据，找到包含该标签的游戏
    
    console.log(`Loading games for tag: ${tag}, page: ${page}`);
    
    // 暂时返回空数组
    return [];
  } catch (error) {
    console.error('Error loading tag games:', error);
    return [];
  }
}

/**
 * 游戏标签页面组件
 */
export default async function TagPage({ params, searchParams }: TagPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const tagData = await getTagData(resolvedParams.tag);
  
  if (!tagData) {
    notFound();
  }
  
  // 获取分页参数
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const sortBy = (resolvedSearchParams.sort as string) || 'popular';
  const categoryFilter = resolvedSearchParams.category as string;
  
  // 加载游戏数据
  const games = await getTagGames(resolvedParams.tag, currentPage);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
            <span className="mx-2 text-gray-400">/</span>
            <a href="/tags" className="text-blue-600 hover:text-blue-800">Tags</a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600 font-medium">{tagData.displayName}</span>
          </div>
        </div>
      </nav>
      
      {/* 标签标题和描述 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{tagData.displayName} Games</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">{tagData.description}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>{tagData.gameCount}+ Games Available</span>
              <span>•</span>
              <span>Free to Play</span>
              <span>•</span>
              <span>No Download Required</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 相关标签 */}
      {tagData.relatedTags.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Related Tags:</span>
              <div className="flex flex-wrap gap-2">
                {tagData.relatedTags.map((relatedTag) => (
                  <a
                    key={relatedTag}
                    href={getTagUrl(relatedTag)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    {relatedTag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 筛选和排序控件 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
              <select 
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={categoryFilter || ''}
              >
                <option value="">All Categories</option>
                {tagData.categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select 
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={sortBy}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 游戏网格 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {games.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img 
                    src={game.image_url || '/images/default-game-thumbnail.svg'}
                    alt={game.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{game.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{game.category}</span>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                      Play
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {game.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Games Coming Soon</h3>
            <p className="text-gray-500">We're working on adding {tagData.displayName.toLowerCase()} games to our collection.</p>
          </div>
        )}
        
        {/* 分页导航 */}
        {games.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled={currentPage <= 1}>
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage}
            </span>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}