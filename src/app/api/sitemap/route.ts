// src/app/api/sitemap/route.ts - 动态生成sitemap.xml文件 (基于游戏数据源)

import { NextResponse } from 'next/server';
import { generateSitemapUrl, SITE_CONFIG } from '@/lib/seo-utils';
import fs from 'fs';
import path from 'path';

interface GameData {
  slug: string;
  primary_category: string;
  featured?: boolean;
}

/**
 * 从游戏数据文件中加载游戏信息
 */
async function loadGamesData(): Promise<GameData[]> {
  try {
    const gamesFilePath = path.join(process.cwd(), 'src/data/latest-200-games.json');
    
    if (!fs.existsSync(gamesFilePath)) {
      console.error('Games data file not found:', gamesFilePath);
      return [];
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf-8'));
    console.log(`Loaded ${gamesData.length} games from data source`);
    
    return gamesData.map((game: any) => ({
      slug: game.slug,
      primary_category: game.primary_category,
      featured: game.featured || false
    }));
  } catch (error) {
    console.error('Error loading games data:', error);
    return [];
  }
}

/**
 * 获取所有可用的游戏分类
 */
function getUniqueCategories(games: GameData[]): string[] {
  const categories = new Set<string>();
  games.forEach(game => {
    if (game.primary_category) {
      categories.add(game.primary_category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * 生成XML格式的sitemap
 */
function generateSitemapXML(urls: Array<{
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
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

/**
 * 确定页面优先级
 */
function getPagePriority(url: string, featured: boolean = false): number {
  if (url === '/') return 1.0;
  if (url === '/games') return 0.9;
  if (url.match(/^\/games\/[^\/]+$/)) return 0.8; // 分类页面
  if (url.match(/^\/games\/[^\/]+\/[^\/]+$/)) {
    // 游戏页面 - 推荐游戏优先级更高
    return featured ? 0.8 : 0.7;
  }
  if (url.startsWith('/tags/')) return 0.6;
  return 0.5;
}

/**
 * 确定更新频率
 */
function getChangeFrequency(url: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  if (url === '/') return 'daily';
  if (url === '/games') return 'weekly';
  if (url.match(/^\/games\/[^\/]+$/)) return 'weekly'; // 分类页面
  if (url.match(/^\/games\/[^\/]+\/[^\/]+$/)) return 'weekly'; // 游戏页面
  if (url.startsWith('/tags/')) return 'weekly';
  return 'monthly';
}

export async function GET() {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    console.log(`Generating sitemap on ${currentDate} based on games data`);

    // 加载游戏数据
    const games = await loadGamesData();
    const categories = getUniqueCategories(games);
    
    const sitemapUrls: Array<{
      url: string;
      lastModified: string;
      changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority: number;
    }> = [];

    // 1. 添加首页
    sitemapUrls.push({
      url: generateSitemapUrl({
        url: '/',
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 1.0
      }).url,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    });

    // 2. 添加游戏总览页面
    sitemapUrls.push({
      url: generateSitemapUrl({
        url: '/games',
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9
      }).url,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9
    });

    // 3. 添加分类页面
    categories.forEach(category => {
      const url = `/games/${category}`;
      sitemapUrls.push({
        url: generateSitemapUrl({
          url,
          lastmod: currentDate,
          changefreq: getChangeFrequency(url),
          priority: getPagePriority(url)
        }).url,
        lastModified: currentDate,
        changeFrequency: getChangeFrequency(url),
        priority: getPagePriority(url)
      });
    });

    // 4. 添加游戏页面
    games.forEach(game => {
      const url = `/games/${game.primary_category}/${game.slug}`;
      sitemapUrls.push({
        url: generateSitemapUrl({
          url,
          lastmod: currentDate,
          changefreq: getChangeFrequency(url),
          priority: getPagePriority(url, game.featured)
        }).url,
        lastModified: currentDate,
        changeFrequency: getChangeFrequency(url),
        priority: getPagePriority(url, game.featured)
      });
    });

    console.log(`Generated sitemap with ${sitemapUrls.length} URLs from games data:`);
    console.log(`- Home page: 1`);
    console.log(`- Games overview page: 1`);
    console.log(`- Category pages: ${categories.length}`);
    console.log(`- Game pages: ${games.length}`);
    console.log(`- Total URLs: ${sitemapUrls.length}`);

    // 生成XML
    const sitemapXML = generateSitemapXML(sitemapUrls);
    
    return new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}