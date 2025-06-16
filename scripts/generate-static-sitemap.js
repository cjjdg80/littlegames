// scripts/generate-static-sitemap.js - 生成静态sitemap.xml文件

const fs = require('fs');
const path = require('path');

// 游戏数据结构说明
// GameData: {
//   slug: string,
//   primary_category: string,
//   featured?: boolean
// }

/**
 * 从游戏数据文件中加载游戏信息
 */
function loadGamesData() {
  try {
    const gamesFilePath = path.join(__dirname, '../src/data/latest-200-games.json');
    
    if (!fs.existsSync(gamesFilePath)) {
      console.error('Games data file not found:', gamesFilePath);
      return [];
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf-8'));
    console.log(`Loaded ${gamesData.length} games from data source`);
    
    return gamesData.map(game => ({
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
function getUniqueCategories(games) {
  const categories = new Set();
  games.forEach(game => {
    if (game.primary_category) {
      categories.add(game.primary_category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * 生成完整的URL
 */
function generateFullUrl(path) {
  const baseUrl = 'https://playbrowserminigames.com';
  return `${baseUrl}${path}`;
}

/**
 * 确定页面优先级
 */
function getPagePriority(url, featured = false) {
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
function getChangeFrequency(url) {
  if (url === '/') return 'daily';
  if (url === '/games') return 'weekly';
  if (url.match(/^\/games\/[^\/]+$/)) return 'weekly'; // 分类页面
  if (url.match(/^\/games\/[^\/]+\/[^\/]+$/)) return 'weekly'; // 游戏页面
  if (url.startsWith('/tags/')) return 'weekly';
  return 'monthly';
}

/**
 * 生成XML格式的sitemap
 */
function generateSitemapXML(urls) {
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
 * 主函数 - 生成sitemap
 */
function generateSitemap() {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    console.log(`Generating static sitemap on ${currentDate}`);

    // 加载游戏数据
    const games = loadGamesData();
    const categories = getUniqueCategories(games);
    
    const sitemapUrls = [];

    // 1. 添加首页
    sitemapUrls.push({
      url: generateFullUrl('/'),
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    });

    // 2. 添加游戏总览页面
    sitemapUrls.push({
      url: generateFullUrl('/games'),
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9
    });

    // 3. 添加分类页面
    categories.forEach(category => {
      const url = `/games/${category}`;
      sitemapUrls.push({
        url: generateFullUrl(url),
        lastModified: currentDate,
        changeFrequency: getChangeFrequency(url),
        priority: getPagePriority(url)
      });
    });

    // 4. 添加游戏页面
    games.forEach(game => {
      const url = `/games/${game.primary_category}/${game.slug}`;
      sitemapUrls.push({
        url: generateFullUrl(url),
        lastModified: currentDate,
        changeFrequency: getChangeFrequency(url),
        priority: getPagePriority(url, game.featured)
      });
    });

    console.log(`Generated sitemap with ${sitemapUrls.length} URLs:`);
    console.log(`- Home page: 1`);
    console.log(`- Games overview page: 1`);
    console.log(`- Category pages: ${categories.length}`);
    console.log(`- Game pages: ${games.length}`);
    console.log(`- Total URLs: ${sitemapUrls.length}`);

    // 生成XML
    const sitemapXML = generateSitemapXML(sitemapUrls);
    
    // 保存到public目录
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
    
    console.log(`✅ Sitemap saved to: ${outputPath}`);
    console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    return false;
  }
}

// 执行生成
if (require.main === module) {
  const success = generateSitemap();
  process.exit(success ? 0 : 1);
}

module.exports = { generateSitemap }; 