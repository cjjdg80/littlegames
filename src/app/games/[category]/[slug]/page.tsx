// src/app/games/[category]/[slug]/page.tsx - 游戏详情页面组件

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCanonicalUrl, generateBreadcrumbs } from '@/lib/url-utils';

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

// 页面参数类型
interface PageParams {
  category: string;
  slug: string;
}

interface GamePageProps {
  params: PageParams;
}

/**
 * 生成静态路径参数
 * 为所有游戏生成静态页面路径
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    // TODO: 从数据源加载所有游戏数据
    // 这里需要读取 src/data/games/ 目录下的游戏数据
    // 暂时返回空数组，后续实现数据加载逻辑
    
    // 示例数据结构（实际应从数据文件加载）
    const games: PageParams[] = [
      // { category: 'action', slug: 'super-mario' },
      // { category: 'puzzle', slug: 'tetris' },
      // 更多游戏...
    ];
    
    console.log(`Generated ${games.length} static paths for game pages`);
    return games;
  } catch (error) {
    console.error('Error generating static params for game pages:', error);
    return [];
  }
}

/**
 * 生成页面元数据
 * 为每个游戏页面生成SEO优化的元数据
 */
export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  try {
    // TODO: 根据category和slug加载游戏数据
    const game = await getGameData(params.category, params.slug);
    
    if (!game) {
      return {
        title: 'Game Not Found',
        description: 'The requested game could not be found.'
      };
    }

    const canonicalUrl = getCanonicalUrl(`/games/${params.category}/${params.slug}`);
    const imageUrl = game.image_url || '/images/default-game-thumbnail.svg';
    
    return {
      title: `${game.name} - Play Free Online | ${game.category.charAt(0).toUpperCase() + game.category.slice(1)} Games`,
      description: game.description || `Play ${game.name} online for free. Enjoy this ${game.category} game directly in your browser.`,
      keywords: [game.name, game.category, 'free online game', 'browser game', ...game.tags].join(', '),
      
      // Open Graph 标签
      openGraph: {
        title: `${game.name} - Free Online Game`,
        description: game.description || `Play ${game.name} online for free`,
        url: canonicalUrl,
        siteName: 'Play Browser Mini Games',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${game.name} game screenshot`
          }
        ],
        type: 'website'
      },
      
      // Twitter Card 标签
      twitter: {
        card: 'summary_large_image',
        title: `${game.name} - Free Online Game`,
        description: game.description || `Play ${game.name} online for free`,
        images: [imageUrl]
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
    console.error('Error generating metadata for game page:', error);
    return {
      title: 'Game Page',
      description: 'Play free online games'
    };
  }
}

/**
 * 根据分类和slug获取游戏数据
 * @param category 游戏分类
 * @param slug 游戏slug
 * @returns 游戏数据或null
 */
async function getGameData(category: string, slug: string): Promise<Game | null> {
  try {
    // TODO: 实现从数据文件加载游戏数据的逻辑
    // 需要读取 src/data/games/games/[category]/ 目录下的分页文件
    // 然后根据slug查找对应的游戏
    
    console.log(`Loading game data for category: ${category}, slug: ${slug}`);
    
    // 暂时返回null，后续实现数据加载逻辑
    return null;
  } catch (error) {
    console.error('Error loading game data:', error);
    return null;
  }
}

/**
 * 游戏详情页面组件
 */
export default async function GamePage({ params }: GamePageProps) {
  const game = await getGameData(params.category, params.slug);
  
  if (!game) {
    notFound();
  }
  
  // 生成面包屑导航数据
  const breadcrumbs = generateBreadcrumbs(params.category, game.name);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.url === '#' ? (
                  <span className="text-gray-600 font-medium">{crumb.name}</span>
                ) : (
                  <a href={crumb.url} className="text-blue-600 hover:text-blue-800">
                    {crumb.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
      
      {/* 游戏内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 游戏标题和信息 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
              </span>
              {game.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 游戏iframe区域 */}
          <div className="p-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" 
                 style={{ aspectRatio: `${game.width}/${game.height}` }}>
              <iframe
                src={game.iframe_url}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0"
                title={`Play ${game.name}`}
                loading="lazy"
              />
            </div>
          </div>
          
          {/* 游戏描述 */}
          {game.description && (
            <div className="px-6 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Game</h2>
              <p className="text-gray-700 leading-relaxed">{game.description}</p>
            </div>
          )}
        </div>
        
        {/* 相关游戏推荐区域 */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More {game.category} Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* TODO: 实现相关游戏推荐组件 */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center text-gray-500">Related games coming soon...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}