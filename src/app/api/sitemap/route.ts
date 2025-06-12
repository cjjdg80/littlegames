// src/app/api/sitemap/route.ts - 动态生成sitemap.xml文件

import { NextResponse } from 'next/server';
import { generateSitemapUrl, SITE_CONFIG } from '@/lib/seo-utils';
import fs from 'fs';
import path from 'path';

/**
 * 从数据文件加载游戏数据
 */
async function loadGamesData() {
  try {
    const gamesDataPath = path.join(process.cwd(), 'test-output', 'games.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf-8'));
    return gamesData;
  } catch (error) {
    console.error('Error loading games data:', error);
    return [];
  }
}

/**
 * 从数据文件加载分类数据
 */
async function loadCategoriesData() {
  try {
    const categoriesDataPath = path.join(process.cwd(), 'test-output', 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesDataPath, 'utf-8'));
    return categoriesData;
  } catch (error) {
    console.error('Error loading categories data:', error);
    return [];
  }
}

/**
 * 从数据文件加载标签数据
 */
async function loadTagsData() {
  try {
    const tagsDataPath = path.join(process.cwd(), 'test-output', 'tags.json');
    const tagsData = JSON.parse(fs.readFileSync(tagsDataPath, 'utf-8'));
    return tagsData;
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
    const currentDate = new Date().toISOString();

    // 添加首页
    urls.push(generateSitemapUrl({
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    }));

    // 加载并添加游戏页面
    const games = await loadGamesData();
    for (const game of games) {
      if (game.slug && game.category) {
        urls.push(generateSitemapUrl({
          url: `/games/${game.category}/${game.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: 0.8
        }));
      }
    }

    // 加载并添加分类页面
    const categories = await loadCategoriesData();
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

    // 加载并添加标签页面
    const tags = await loadTagsData();
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