// src/app/games/[category]/page.tsx - 游戏分类页面动态路由组件

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCanonicalUrl, generateBreadcrumbs, getCategoryUrl } from '@/lib/url-utils';

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
  params: PageParams;
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * 生成静态路径参数
 * 为所有游戏分类生成静态页面路径
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    // TODO: 从数据源加载所有分类数据
    // 这里需要读取分类索引文件
    
    // 预定义的游戏分类（基于现有数据）
    const categories: PageParams[] = [
      { category: 'action' },
      { category: 'adventure' },
      { category: 'arcade' },
      { category: 'casual' },
      { category: 'puzzle' },
      { category: 'simulation' },
      { category: 'sports' },
      { category: 'strategy' }
    ];
    
    console.log(`Generated ${categories.length} static paths for category pages`);
    return categories;
  } catch (error) {
    console.error('Error generating static params for category pages:', error);
    return [];
  }
}

/**
 * 生成页面元数据
 * 为每个分类页面生成SEO优化的元数据
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const categoryData = await getCategoryData(params.category);
    
    if (!categoryData) {
      return {
        title: 'Category Not Found',
        description: 'The requested game category could not be found.'
      };
    }

    const canonicalUrl = getCanonicalUrl(getCategoryUrl(params.category));
    const categoryName = categoryData.displayName || categoryData.name;
    
    return {
      title: `${categoryName} Games - Play Free Online | ${categoryData.gameCount}+ Games`,
      description: categoryData.description || `Play the best ${categoryName.toLowerCase()} games online for free. Choose from ${categoryData.gameCount}+ games in our ${categoryName.toLowerCase()} collection.`,
      keywords: [categoryName, 'free online games', 'browser games', ...categoryData.featuredTags].join(', '),
      
      // Open Graph 标签
      openGraph: {
        title: `${categoryName} Games - Free Online Collection`,
        description: `Play ${categoryData.gameCount}+ free ${categoryName.toLowerCase()} games online`,
        url: canonicalUrl,
        siteName: 'Play Browser Mini Games',
        images: [
          {
            url: '/images/default-game-thumbnail.svg',
            width: 1200,
            height: 630,
            alt: `${categoryName} games collection`
          }
        ],
        type: 'website'
      },
      
      // Twitter Card 标签
      twitter: {
        card: 'summary_large_image',
        title: `${categoryName} Games - Free Online`,
        description: `Play ${categoryData.gameCount}+ free ${categoryName.toLowerCase()} games`,
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
    console.error('Error generating metadata for category page:', error);
    return {
      title: 'Games Category',
      description: 'Play free online games'
    };
  }
}

/**
 * 根据分类获取分类数据
 * @param category 分类slug
 * @returns 分类数据或null
 */
async function getCategoryData(category: string): Promise<Category | null> {
  try {
    // TODO: 实现从数据文件加载分类数据的逻辑
    // 需要读取 src/data/seo/category-seo-data.json 文件
    
    console.log(`Loading category data for: ${category}`);
    
    // 暂时返回模拟数据
    const mockCategories: { [key: string]: Category } = {
      action: {
        name: 'action',
        slug: 'action',
        displayName: 'Action Games',
        description: 'Fast-paced action games that test your reflexes and skills. Play exciting action games online for free.',
        gameCount: 1200,
        featuredTags: ['shooting', 'fighting', 'adventure']
      },
      puzzle: {
        name: 'puzzle',
        slug: 'puzzle',
        displayName: 'Puzzle Games',
        description: 'Challenge your mind with our collection of puzzle games. Solve problems and test your logic skills.',
        gameCount: 800,
        featuredTags: ['logic', 'brain', 'strategy']
      }
      // 更多分类数据...
    };
    
    return mockCategories[category] || null;
  } catch (error) {
    console.error('Error loading category data:', error);
    return null;
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
  const categoryData = await getCategoryData(params.category);
  
  if (!categoryData) {
    notFound();
  }
  
  // 获取分页参数
  const currentPage = Number(searchParams.page) || 1;
  const sortBy = (searchParams.sort as string) || 'popular';
  
  // 加载游戏数据
  const games = await getCategoryGames(params.category, currentPage);
  
  // 生成面包屑导航数据
  const breadcrumbs = generateBreadcrumbs(params.category);
  
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
      
      {/* 分类标题和描述 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{categoryData.displayName}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">{categoryData.description}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>{categoryData.gameCount}+ Games Available</span>
              <span>•</span>
              <span>Free to Play</span>
              <span>•</span>
              <span>No Download Required</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 筛选和排序控件 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">View:</span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1 text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Games Coming Soon</h3>
            <p className="text-gray-500">We're working on adding {categoryData.displayName.toLowerCase()} to our collection.</p>
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