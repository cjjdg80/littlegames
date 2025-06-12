// src/components/Breadcrumb.tsx - 面包屑导航组件

import React from 'react';
import Link from 'next/link';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import { generateBreadcrumbJsonLd } from '@/lib/seo-utils';

export interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * 面包屑导航组件
 * 提供页面层级导航和SEO结构化数据
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // 生成结构化数据
  const jsonLd = generateBreadcrumbJsonLd(items);

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      
      {/* 面包屑导航 */}
      <nav className={`flex ${className}`} aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;
            
            return (
              <li key={index} className="inline-flex items-center">
                {/* 分隔符 */}
                {!isFirst && (
                  <ChevronRightIcon 
                    className="w-4 h-4 text-gray-400 mx-1" 
                    aria-hidden="true"
                  />
                )}
                
                {/* 面包屑项 */}
                <div className="flex items-center">
                  {isFirst && (
                    <HomeIcon 
                      className="w-4 h-4 mr-1 text-gray-400" 
                      aria-hidden="true"
                    />
                  )}
                  
                  {isLast || item.url === '#' ? (
                    <span 
                      className="text-sm font-medium text-gray-500 dark:text-gray-400"
                      aria-current="page"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * 生成游戏详情页面包屑
 */
export function generateGameBreadcrumb({
  categoryName,
  categorySlug,
  gameName
}: {
  categoryName: string;
  categorySlug: string;
  gameName: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Games', url: '/games' },
    { name: categoryName, url: `/games/${categorySlug}` },
    { name: gameName, url: '#', current: true }
  ];
}

/**
 * 生成分类页面包屑
 */
export function generateCategoryBreadcrumb({
  categoryName
}: {
  categoryName: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Games', url: '/games' },
    { name: categoryName, url: '#', current: true }
  ];
}

/**
 * 生成标签页面包屑
 */
export function generateTagBreadcrumb({
  tagName
}: {
  tagName: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Tags', url: '/tags' },
    { name: tagName, url: '#', current: true }
  ];
}

/**
 * 简化版面包屑组件（无图标）
 */
export function SimpleBreadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              
              {isLast || item.url === '#' ? (
                <span className="text-gray-500">{item.name}</span>
              ) : (
                <Link
                  href={item.url}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}