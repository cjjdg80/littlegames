// src/app/[locale]/games/[category]/page.tsx - 多语言游戏分类页面组件
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@/lib/seo-utils';
import { getCanonicalUrl, generateBreadcrumbs, getCategoryUrl } from '@/lib/url-utils';
import { generatePageSEO } from '@/lib/seo-utils';

interface LocaleCategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

/**
 * 多语言游戏分类页面组件
 */
export default async function LocaleCategoryPage({ params }: LocaleCategoryPageProps) {
  const { locale, category } = await params;

  // 验证语言代码
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  // 模拟分类数据获取
  const categoryData = {
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Games`,
    description: `Browse ${category} games in ${locale}`,
    locale,
    category
  };

  // 生成面包屑导航
  const breadcrumbs = generateBreadcrumbs(`/${locale}/games/${category}`);

  return (
    <div className="category-page" data-locale={locale}>
      {/* 面包屑导航 */}
      <nav className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && ' > '}
            <a href={crumb.url} target="_blank" rel="noopener noreferrer">{crumb.name}</a>
          </span>
        ))}
      </nav>

      {/* 分类内容 */}
      <main>
        <h1>{categoryData.name}</h1>
        <p>{categoryData.description}</p>
        <p>Language: {locale}</p>
        <p>Category: {category}</p>
        
        {/* 游戏列表占位符 */}
        <div className="games-grid">
          <p>Games in {category} category will be displayed here...</p>
        </div>
      </main>
    </div>
  );
}

/**
 * 生成页面元数据
 */
export async function generateMetadata({ params }: LocaleCategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const canonicalUrl = getCanonicalUrl(`/${locale}/games/${category}`);

  return generatePageSEO({
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Games | ${locale.toUpperCase()}`,
    description: `Browse and play ${category} games online - ${locale} version`,
    canonical: canonicalUrl
  });
}

/**
 * 生成静态参数（预留）
 */
export async function generateStaticParams() {
  // 这里应该从实际的分类数据生成参数
  return [];
}