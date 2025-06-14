// src/components/pages/CategoryPageClient.tsx - 分类页面客户端组件，处理交互逻辑

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GameCard from '@/components/ui/GameCard';
import { Game } from '@/types/game';

// 分类SEO数据类型
interface CategorySEOData {
  displayName: string;
  description?: string;
  gameCount?: number;
  breadcrumbs: Array<{
    label: string;
    href: string;
    current?: boolean;
  }>;
  metadata: {
    description: string;
  };
}

interface CategoryPageClientProps {
  category: string;
  seoData: CategorySEOData;
  games: Game[];
  currentPage: number;
  totalPages: number;
  totalGames: number;
  gamesPerPage: number;
  sortBy: string;
  searchQuery: string;
}

/**
 * 分类页面客户端组件
 * 处理分页、排序、筛选和搜索等交互功能
 */
export default function CategoryPageClient({
  category,
  seoData,
  games,
  currentPage,
  totalPages,
  totalGames,
  gamesPerPage,
  sortBy,
  searchQuery
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 本地状态管理
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 更新URL参数
   */
  const updateURL = (params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value.toString());
      } else {
        newSearchParams.delete(key);
      }
    });
    
    // 重置页码当排序或搜索改变时
    if (params.sort || params.search) {
      newSearchParams.delete('page');
    }
    
    const newURL = `/games/${category}?${newSearchParams.toString()}`;
    router.push(newURL);
  };

  /**
   * 处理排序变更
   */
  const handleSortChange = (newSortBy: string) => {
    setLocalSortBy(newSortBy);
    setIsLoading(true);
    updateURL({ sort: newSortBy });
  };

  /**
   * 处理搜索
   */
  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setIsLoading(true);
    updateURL({ search: query });
  };

  /**
   * 处理分页
   */
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    updateURL({ page });
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 生成分页按钮
   */
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    // 计算显示范围
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 调整开始页面
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 上一页按钮
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );
    
    // 第一页
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          disabled={isLoading}
          className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }
    
    // 页码按钮
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          disabled={isLoading}
          className={`px-3 py-2 text-sm border rounded-md ${
            page === currentPage
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      );
    }
    
    // 最后一页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading}
          className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
        >
          {totalPages}
        </button>
      );
    }
    
    // 下一页按钮
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );
    
    return buttons;
  };

  // 页面加载完成后重置loading状态
  useEffect(() => {
    setIsLoading(false);
  }, [games]);

  return (
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
                  <a href={crumb.href} className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
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
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              {seoData.description || seoData.metadata.description}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>{totalGames}+ Games Available</span>
              <span>•</span>
              <span>Free to Play</span>
              <span>•</span>
              <span>No Download Required</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 搜索和筛选控件 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* 搜索框 */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder={`Search ${seoData.displayName.toLowerCase()}...`}
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(localSearchQuery);
                    }
                  }}
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => handleSearch(localSearchQuery)}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
            
            {/* 排序和视图控件 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">Sort by:</span>
                <select 
                  value={localSortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  disabled={isLoading}
                  className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">View:</span>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 ${viewMode === 'list' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1 ${viewMode === 'grid' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading games...</p>
            </div>
          )}
          
          {/* 游戏网格/列表 */}
          {!isLoading && games.length > 0 && (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {games.map((game) => (
                  <GameCard 
                    key={game.id} 
                    id={game.id}
                    title={game.title.en}
                    category={game.category}
                    rating={game.rating || 5.0}
                    downloads={game.downloads || "1K+"}
                    image={game.image || game.thumbnail}
                    featured={game.featured}
                    slug={game.slug}
                    description={game.description.en}
                    size={viewMode === 'grid' ? 'compact' : 'normal'}
                  />
                ))}
              </div>
              
              {/* 分页导航 */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    {renderPaginationButtons()}
                  </div>
                </div>
              )}
              
              {/* 分页信息 */}
              <div className="mt-4 text-center text-sm text-gray-400">
                Showing {((currentPage - 1) * gamesPerPage) + 1} to {Math.min(currentPage * gamesPerPage, totalGames)} of {totalGames} games
              </div>
            </>
          )}
          
          {/* 无游戏状态 */}
          {!isLoading && games.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery ? 'No games found' : 'Games Coming Soon'}
              </h3>
              <p className="text-gray-400">
                {searchQuery 
                  ? `No games match "${searchQuery}" in ${seoData.displayName.toLowerCase()}.`
                  : `We're working on adding ${seoData.displayName.toLowerCase()} to our collection.`
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
} 