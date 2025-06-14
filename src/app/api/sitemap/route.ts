// src/app/api/sitemap/route.ts - 动态生成sitemap.xml文件 (MVP版本 - 200个游戏)

import { NextResponse } from 'next/server';
import { generateSitemapUrl, SITE_CONFIG } from '@/lib/seo-utils';
import fs from 'fs';
import path from 'path';

/**
 * 从200个游戏数据文件加载游戏数据 (MVP版本)
 */
async function loadLatest200GamesData() {
  try {
    const gamesDataPath = path.join(process.cwd(), 'src/data/latest-200-games.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf-8'));
    return gamesData;
  } catch (error) {
    console.error('Error loading latest 200 games data:', error);
    return [];
  }
}

/**
 * 从分类索引加载分类数据
 */
async function loadCategoriesData() {
  try {
    const categoriesDataPath = path.join(process.cwd(), 'scripts/processed/categoryIndex.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesDataPath, 'utf-8'));
    
    // 提取分类列表
    const categories = Object.keys(categoriesData.categories || {}).map(slug => ({
      slug,
      count: categoriesData.categories[slug].count
    }));
    
    return categories;
  } catch (error) {
    console.error('Error loading categories data:', error);
    // 返回默认分类作为后备
    return [
      { slug: 'action', count: 100 },
      { slug: 'adventure', count: 100 },
      { slug: 'arcade', count: 100 },
      { slug: 'casual', count: 100 },
      { slug: 'puzzle', count: 100 },
      { slug: 'simulation', count: 100 },
      { slug: 'sports', count: 100 },
      { slug: 'strategy', count: 100 }
    ];
  }
}

/**
 * 从标签索引加载热门标签数据 (限制前50个)
 */
async function loadTopTagsData() {
  try {
    const tagsDataPath = path.join(process.cwd(), 'scripts/processed/tags-index.json');
    const tagsData = JSON.parse(fs.readFileSync(tagsDataPath, 'utf-8'));
    
    // 提取前50个热门标签
    const tags = Object.entries(tagsData)
      .filter(([key]) => key !== 'metadata') // 排除元数据
      .map(([slug, data]: [string, any]) => ({
        slug,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count) // 按数量降序排序
      .slice(0, 50) // 只取前50个热门标签
      .map(tag => ({ slug: tag.slug }));
    
    return tags;
  } catch (error) {
    console.error('Error loading tags data:', error);
    return [];
  }
}

/**
 * 生成XML格式的sitemap
 */
function generateSitemapXML(urls: Array<{
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
}>) {
  const urlsXML = urls.map(({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXML}
</urlset>`;
}

export async function GET() {
  try {
    const urls = [];
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

    // 添加首页
    urls.push(generateSitemapUrl({
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    }));

    // 添加游戏总览页面
    urls.push(generateSitemapUrl({
      url: '/games',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9
    }));

    // 加载并添加200个游戏页面 (MVP版本)
    const games = await loadLatest200GamesData();
    console.log(`Loading ${games.length} games for sitemap`);
    
    for (const game of games) {
      if (game.slug && game.primary_category) {
        urls.push(generateSitemapUrl({
          url: `/games/${game.primary_category}/${game.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: game.featured ? 0.8 : 0.7 // 精选游戏优先级更高
        }));
      }
    }

    // 加载并添加分类页面
    const categories = await loadCategoriesData();
    console.log(`Loading ${categories.length} categories for sitemap`);
    
    for (const category of categories) {
      if (category.slug) {
        urls.push(generateSitemapUrl({
          url: `/games/${category.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: 0.7
        }));
      }
    }

    // 加载并添加热门标签页面 (限制前50个)
    const tags = await loadTopTagsData();
    console.log(`Loading ${tags.length} top tags for sitemap`);
    
    for (const tag of tags) {
      if (tag.slug) {
        urls.push(generateSitemapUrl({
          url: `/tags/${tag.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: 0.6
        }));
      }
    }

    // 添加其他重要页面
    const staticPages = [
      { path: '/about', priority: 0.5 },
      { path: '/privacy', priority: 0.3 },
      { path: '/terms', priority: 0.3 },
      { path: '/contact', priority: 0.4 }
    ];

    for (const page of staticPages) {
      urls.push(generateSitemapUrl({
        url: page.path,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: page.priority
      }));
    }

    console.log(`Generated sitemap with ${urls.length} URLs`);

    // 生成XML
    const sitemapXML = generateSitemapXML(urls);
    
    return new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 缓存1小时
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}