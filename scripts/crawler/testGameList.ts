// scripts/crawler/testGameList.ts - GameDistribution 游戏列表爬虫测试脚本
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * 测试获取GameDistribution游戏列表
 * 从游戏目录页面获取游戏链接
 */
async function testGameListFetch(): Promise<string[]> {
  try {
    console.log('🚀 开始测试GameDistribution游戏列表获取...');
    
    // 访问游戏目录页面
    const catalogUrl = 'https://gamedistribution.com/games/';
    console.log(`🔍 访问游戏目录: ${catalogUrl}`);
    
    const response = await axios.get(catalogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    console.log(`✅ 成功访问游戏目录，状态码: ${response.status}`);
    
    const $ = cheerio.load(response.data);
    const gameLinks: string[] = [];
    
    console.log('🔍 分析页面结构...');
    console.log('📄 页面标题:', $('title').text());
    console.log('📄 页面描述:', $('meta[name="description"]').attr('content') || '无');
    
    // 基于实际HTML结构的选择器策略
    const selectors = [
      '.ProductItem_productList__sA9IM', // 游戏卡片容器
      '[class*="ProductItem_productList"]', // 包含ProductItem_productList的类名
      '.grid > div', // 网格中的直接子元素
      'div[class*="grid"] > div', // 网格容器中的子元素
      'a[href*="/games/"]' // 包含/games/的链接
    ];
    
    // 尝试获取游戏卡片
    for (const selector of selectors) {
      const gameCards = $(selector);
      console.log(`🔍 选择器 "${selector}" 找到 ${gameCards.length} 个元素`);
      
      if (gameCards.length > 0) {
        gameCards.each((index: number, element: any) => {
          const $card = $(element);
          
          // 查找游戏链接 - 基于实际HTML结构
          const gameLink = $card.find('a.product-img').attr('href') || 
                          $card.find('a[href*="/games/"]').first().attr('href');
          
          if (gameLink) {
            const fullUrl = gameLink.startsWith('http') ? gameLink : `https://gamedistribution.com${gameLink}`;
            
            if (!gameLinks.includes(fullUrl)) {
              // 提取游戏名称和开发商信息
              const gameName = $card.find('a.product-name').text().trim() || 
                              $card.find('a[class*="product-name"]').text().trim();
              const companyName = $card.find('a.company-name').text().trim() || 
                                 $card.find('a[class*="company-name"]').text().trim();
              
              gameLinks.push(fullUrl);
              console.log(`📎 找到游戏: ${gameName || '未知名称'} - ${fullUrl}`);
              if (companyName) {
                console.log(`   开发商: ${companyName}`);
              }
            }
          }
        });
        
        // 如果找到了游戏链接就停止尝试其他选择器
        if (gameLinks.length > 0) {
          console.log(`✅ 使用选择器 "${selector}" 成功找到 ${gameLinks.length} 个游戏链接`);
          break;
        }
      }
    }
    
    // 如果仍然没有找到，尝试更通用的方法
    if (gameLinks.length === 0) {
      console.log('🔍 尝试通用链接提取方法...');
      
      $('a[href*="/games/"]').each((index: number, element: any) => {
        const href = $(element).attr('href');
        if (href && href !== '/games/' && !href.includes('#')) {
          const fullUrl = href.startsWith('http') ? href : `https://gamedistribution.com${href}`;
          
          // 确保是游戏页面链接
          if (fullUrl.match(/\/games\/[^/]+\/?$/) && !gameLinks.includes(fullUrl)) {
            gameLinks.push(fullUrl);
            const linkText = $(element).text().trim();
            console.log(`📎 找到游戏链接: ${fullUrl}${linkText ? ` (${linkText})` : ''}`);
          }
        }
      });
    }
    
    console.log(`\n📊 总共找到 ${gameLinks.length} 个游戏链接`);
    
    // 保存结果到文件
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      catalogUrl: catalogUrl,
      totalGames: gameLinks.length,
      gameLinks: gameLinks.slice(0, 20), // 保存前20个用于测试
      pageTitle: $('title').text(),
      pageDescription: $('meta[name="description"]').attr('content') || ''
    };
    
    fs.writeFileSync(path.join(outputDir, 'game-links.json'), JSON.stringify(result, null, 2));
    console.log('💾 游戏链接已保存到 scripts/output/game-links.json');
    
    return gameLinks.slice(0, 5); // 返回前5个用于下一步测试
    
  } catch (error: any) {
    console.error('❌ 获取游戏列表失败:', error.message);
    return [];
  }
}

/**
 * 测试获取单个游戏页面数据
 * 重点获取iframe嵌入代码和收益分成相关信息
 */
async function testGamePageFetch(gameUrl: string): Promise<void> {
  try {
    console.log(`\n🎮 测试游戏页面: ${gameUrl}`);
    
    const response = await axios.get(gameUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    console.log('✅ 成功获取游戏页面，状态码:', response.status);
    
    const $ = cheerio.load(response.data);
    
    // 提取游戏基本信息
    const gameTitle = extractGameTitle($);
    const publisher = extractPublisher($);
    const gameId = extractGameId($);
    const dimensions = extractDimensions($);
    const iframeData = extractIframeData($, gameUrl);
    const mobileCompatible = extractMobileCompatibility($);
    const languages = extractLanguages($);
    const genres = extractGenres($);
    const ageGroups = extractAgeGroups($);
    
    console.log('🎯 游戏信息:');
    console.log('  标题:', gameTitle);
    console.log('  发布商:', publisher);
    console.log('  游戏ID:', gameId);
    console.log('  尺寸:', dimensions);
    console.log('  移动兼容:', mobileCompatible);
    console.log('  语言:', languages);
    console.log('  类型:', genres);
    console.log('  年龄组:', ageGroups);
    
    const gameData = {
      url: gameUrl,
      title: gameTitle,
      publisher,
      gameId,
      dimensions,
      mobileCompatible,
      languages,
      genres,
      ageGroups,
      iframeData,
      extractedAt: new Date().toISOString()
    };
    
    // 保存单个游戏数据
    const outputDir = path.join(__dirname, '../output');
    const gameSlug = gameUrl.split('/').filter(Boolean).pop() || 'unknown';
    fs.writeFileSync(
      path.join(outputDir, `game-${gameSlug}.json`), 
      JSON.stringify(gameData, null, 2)
    );
    
    console.log(`💾 游戏数据已保存到 scripts/output/game-${gameSlug}.json`);
    
  } catch (error: any) {
    console.error(`❌ 获取游戏页面失败 ${gameUrl}:`, error.message);
  }
}

/**
 * 提取游戏标题
 */
function extractGameTitle($: any): string {
  // 尝试多种方式获取游戏标题
  const title = $('h1').first().text().trim() || 
               $('[class*="title"]').first().text().trim() ||
               $('title').text().replace(/- HTML5 Games.*/, '').trim();
  return title;
}

/**
 * 提取发布商信息
 */
function extractPublisher($: any): string {
  const publisherText = $('body').text();
  const publisherMatch = publisherText.match(/Published by:([^\n]+)/);
  return publisherMatch ? publisherMatch[1].trim() : '';
}

/**
 * 提取游戏ID（32位十六进制）
 */
function extractGameId($: any): string {
  const pageContent = $('body').html();
  const gameIdMatch = pageContent?.match(/[a-f0-9]{32}/);
  return gameIdMatch ? gameIdMatch[0] : '';
}

/**
 * 提取游戏尺寸
 */
function extractDimensions($: any): { width?: number; height?: number } {
  const dimensions: { width?: number; height?: number } = {};
  const pageText = $('body').text();
  
  const dimensionMatch = pageText.match(/Dimensions(\d+)x(\d+)/);
  if (dimensionMatch) {
    dimensions.width = parseInt(dimensionMatch[1]);
    dimensions.height = parseInt(dimensionMatch[2]);
  }
  
  return dimensions;
}

/**
 * 提取iframe嵌入代码（最重要的功能）
 */
function extractIframeData($: any, gameUrl: string): any {
  const iframeData: any = {};
  
  // 查找EMBED区域的iframe代码
  const embedSection = $('body').text();
  const iframeMatch = embedSection.match(/<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>/);
  
  if (iframeMatch) {
    iframeData.originalCode = iframeMatch[0];
    iframeData.gameUrl = iframeMatch[1];
    
    // 提取游戏ID
    const gameIdMatch = iframeMatch[1].match(/\/([a-f0-9]{32})\//); 
    if (gameIdMatch) {
      iframeData.gameId = gameIdMatch[1];
    }
    
    // 提取尺寸
    const widthMatch = iframeMatch[0].match(/width="(\d+)"/);
    const heightMatch = iframeMatch[0].match(/height="(\d+)"/);
    
    if (widthMatch) iframeData.width = parseInt(widthMatch[1]);
    if (heightMatch) iframeData.height = parseInt(heightMatch[1]);
    
    // 生成我们自己的iframe代码（包含正确的referrer_url以确保收益分成）
    if (iframeData.gameId) {
      iframeData.ourIframeCode = generateOurIframeCode(
        iframeData.gameId,
        iframeData.width || 800,
        iframeData.height || 600,
        gameUrl
      );
    }
    
    console.log('✅ 成功提取iframe数据');
  } else {
    console.log('❌ 未找到iframe代码');
  }
  
  return iframeData;
}

/**
 * 生成我们自己的iframe嵌入代码（确保收益分成）
 */
function generateOurIframeCode(gameId: string, width: number, height: number, originalGameUrl: string): string {
  // 使用我们自己的域名作为referrer_url以确保收益分成
  const ourDomain = 'https://yourdomain.com'; // 替换为你的实际域名
  const ourGamePath = `/games/${gameId}`; // 我们网站上的游戏路径
  
  return `<iframe 
  src="https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${ourDomain}${ourGamePath}" 
  width="${width}" 
  height="${height}" 
  scrolling="none" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
}

/**
 * 提取移动端兼容性
 */
function extractMobileCompatibility($: any): boolean {
  const pageText = $('body').text();
  return pageText.includes('Mobile Web Compatible: IOS - Android');
}

/**
 * 提取支持的语言
 */
function extractLanguages($: any): string[] {
  const pageText = $('body').text();
  const languageMatch = pageText.match(/Language([^\n]+)/);
  if (languageMatch) {
    return languageMatch[1].split(/(?=[A-Z])/).map((lang: string) => lang.trim()).filter(Boolean);
  }
  return [];
}

/**
 * 提取游戏类型
 */
function extractGenres($: any): string[] {
  const pageText = $('body').text();
  const genreMatch = pageText.match(/Genres([^\n]+)/);
  if (genreMatch) {
    return genreMatch[1].split(/(?=[A-Z])/).map((genre: string) => genre.trim()).filter(Boolean);
  }
  return [];
}

/**
 * 提取年龄组
 */
function extractAgeGroups($: any): string[] {
  const pageText = $('body').text();
  const ageMatch = pageText.match(/Age Group([^\n]+)/);
  if (ageMatch) {
    return ageMatch[1].split(/(?=[A-Z])/).map((age: string) => age.trim()).filter(Boolean);
  }
  return [];
}

/**
 * 主测试函数
 */
async function runTest(): Promise<void> {
  console.log('🎯 GameDistribution数据采集测试开始\n');
  
  // 第一步：测试游戏列表获取
  const gameLinks = await testGameListFetch();
  
  if (gameLinks.length === 0) {
    console.log('❌ 无法获取游戏链接，尝试测试已知的游戏页面...');
    
    // 如果无法获取列表，测试已知的游戏页面
    const knownGameUrls = [
      'https://gamedistribution.com/games/evermatch/',
      'https://gamedistribution.com/games/portals/',
      'https://gamedistribution.com/games/refuge-solitaire/'
    ];
    
    for (const gameUrl of knownGameUrls) {
      await testGamePageFetch(gameUrl);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 延迟2秒
    }
  } else {
    // 第二步：测试前3个游戏页面的数据获取
    console.log('\n📋 开始测试游戏页面数据获取...');
    for (let i = 0; i < Math.min(3, gameLinks.length); i++) {
      await testGamePageFetch(gameLinks[i]);
      if (i < gameLinks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('\n🎉 测试完成！请检查 scripts/output/ 目录下的结果文件');
  console.log('\n💡 重要提示：');
  console.log('- 确保在iframe代码中使用正确的gd_sdk_referrer_url参数');
  console.log('- 这个参数必须指向你网站上的游戏页面URL以确保广告收益分成');
  console.log('- 示例：https://html5.gamedistribution.com/GAME_ID/?gd_sdk_referrer_url=https://yourdomain.com/games/game-name');
}

// 运行测试
runTest().catch(console.error);

/**
 * 获取游戏列表页面的所有游戏链接
 */
async function getGameList(): Promise<string[]> {
  try {
    console.log('正在获取游戏列表页面...');
    const response = await axios.get('https://gamedistribution.com/games/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const gameLinks: string[] = [];
    
    // 使用正确的选择器获取游戏卡片
    const gameCards = $('.ProductItem_productList__sA9IM');
    console.log(`找到 ${gameCards.length} 个游戏卡片`);
    
    // 修复类型错误：使用 any 类型替代 cheerio.Element
    gameCards.each((index: number, element: any) => {
      // 获取游戏链接 - 从 product-img 链接中提取
      const gameLink = $(element).find('a.product-img').attr('href');
      if (gameLink) {
        const fullLink = gameLink.startsWith('http') ? gameLink : `https://gamedistribution.com${gameLink}`;
        gameLinks.push(fullLink);
        
        // 获取游戏名称用于调试
        const gameName = $(element).find('a.product-name').text().trim();
        const company = $(element).find('a.company-name').text().trim();
        console.log(`游戏 ${index + 1}: ${gameName} (${company}) - ${fullLink}`);
      }
    });
    
    console.log(`总共找到 ${gameLinks.length} 个游戏链接`);
    return gameLinks;
    
  } catch (error) {
    console.error('获取游戏列表失败:', error);
    return [];
  }
}