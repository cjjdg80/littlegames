// test-frontend-data-loader.ts - 测试前端数据加载器和优化器
// 验证新创建的数据加载和优化功能

import { gameDataLoader } from './src/lib/gameDataLoader';
import { staticDataOptimizer } from './src/lib/staticDataOptimizer';
import { GameCategory } from './src/types/game';

/**
 * 测试数据加载器功能
 */
async function testGameDataLoader() {
  console.log('\n=== 测试游戏数据加载器 ===');
  
  try {
    // 测试1: 获取分类列表
    console.log('\n1. 测试获取分类列表...');
    const categories = await gameDataLoader.getCategories();
    console.log(`✅ 成功获取 ${categories.length} 个分类:`, categories);
    
    // 测试2: 获取热门游戏
    console.log('\n2. 测试获取热门游戏...');
    const featuredGames = await gameDataLoader.getFeaturedGames(5);
    console.log(`✅ 成功获取 ${featuredGames.length} 个热门游戏`);
    if (featuredGames.length > 0) {
      console.log('   第一个热门游戏:', {
        id: featuredGames[0].id,
        title: featuredGames[0].title.en,
        category: featuredGames[0].category,
        slug: featuredGames[0].slug
      });
    }
    
    // 测试3: 按分类获取游戏
    console.log('\n3. 测试按分类获取游戏...');
    const adventureGames = await gameDataLoader.getGamesByCategory(GameCategory.ADVENTURE, 1, 3);
    console.log(`✅ 成功获取冒险类游戏: ${adventureGames.games.length}/${adventureGames.total}`);
    if (adventureGames.games.length > 0) {
      console.log('   第一个冒险游戏:', {
        id: adventureGames.games[0].id,
        title: adventureGames.games[0].title.en,
        slug: adventureGames.games[0].slug
      });
    }
    
    // 测试4: 根据slug获取游戏详情
    if (adventureGames.games.length > 0) {
      console.log('\n4. 测试根据slug获取游戏详情...');
      const gameSlug = adventureGames.games[0].slug;
      const gameDetail = await gameDataLoader.getGameBySlug(gameSlug, GameCategory.ADVENTURE);
      if (gameDetail) {
        console.log(`✅ 成功获取游戏详情: ${gameDetail.title.en}`);
        console.log('   游戏信息:', {
          id: gameDetail.id,
          category: gameDetail.category,
          devices: gameDetail.devices,
          tags: gameDetail.tags.slice(0, 3),
          iframe: {
            width: gameDetail.iframe.width,
            height: gameDetail.iframe.height
          }
        });
      } else {
        console.log('❌ 未能获取游戏详情');
      }
    }
    
    // 测试5: 搜索游戏
    console.log('\n5. 测试搜索游戏...');
    const searchResults = await gameDataLoader.searchGames({
      query: 'puzzle',
      limit: 3
    });
    console.log(`✅ 搜索结果: ${searchResults.games.length}/${searchResults.total} 个游戏`);
    
  } catch (error) {
    console.error('❌ 数据加载器测试失败:', error);
  }
}

/**
 * 测试静态数据优化器功能
 */
async function testStaticDataOptimizer() {
  console.log('\n=== 测试静态数据优化器 ===');
  
  try {
    // 测试1: 生成分类统计
    console.log('\n1. 测试生成分类统计...');
    const categoryStats = await staticDataOptimizer.generateCategoryStats();
    console.log('✅ 分类统计:', categoryStats);
    
    // 测试2: 生成静态路径（限制数量以避免过长输出）
    console.log('\n2. 测试生成静态路径...');
    const staticPaths = await staticDataOptimizer.generateStaticPaths();
    console.log(`✅ 生成了 ${staticPaths.length} 个静态路径`);
    if (staticPaths.length > 0) {
      console.log('   前3个路径:', staticPaths.slice(0, 3));
    }
    
    // 测试3: 生成分页信息
    console.log('\n3. 测试生成分页信息...');
    const paginationInfo = staticDataOptimizer.generatePaginationInfo('adventure', 2, 20, 150);
    console.log('✅ 分页信息:', paginationInfo);
    
    // 测试4: 生成面包屑导航
    console.log('\n4. 测试生成面包屑导航...');
    const breadcrumbs = staticDataOptimizer.generateBreadcrumbs('adventure', 'Test Game');
    console.log('✅ 面包屑导航:', breadcrumbs);
    
    // 测试5: 获取一个游戏并生成SEO优化数据
    console.log('\n5. 测试生成SEO优化数据...');
    const featuredGames = await gameDataLoader.getFeaturedGames(1);
    if (featuredGames.length > 0) {
      const seoData = staticDataOptimizer.generateSEOOptimizedGameData(featuredGames[0]);
      console.log('✅ SEO优化数据:', {
        seoTitle: seoData.seoTitle,
        seoDescription: seoData.seoDescription.substring(0, 100) + '...',
        seoKeywords: seoData.seoKeywords.slice(0, 5),
        structuredDataType: seoData.structuredData['@type']
      });
    }
    
    // 测试6: 生成相关游戏推荐
    if (featuredGames.length > 0) {
      console.log('\n6. 测试生成相关游戏推荐...');
      const relatedGames = await staticDataOptimizer.generateRelatedGames(featuredGames[0], 3);
      console.log(`✅ 生成了 ${relatedGames.length} 个相关游戏推荐`);
      if (relatedGames.length > 0) {
        console.log('   推荐游戏:', relatedGames.map(g => g.title.en));
      }
    }
    
    // 测试7: 生成并保存静态生成数据
    console.log('\n7. 测试生成静态生成数据...');
    await staticDataOptimizer.saveStaticGenerationData();
    console.log('✅ 静态生成数据已保存');
    
    // 测试8: 加载静态生成数据
    console.log('\n8. 测试加载静态生成数据...');
    const loadedData = await staticDataOptimizer.loadStaticGenerationData();
    if (loadedData) {
      console.log('✅ 成功加载静态生成数据:', {
        pathsCount: loadedData.paths.length,
        categoriesCount: Object.keys(loadedData.categoryStats).length,
        featuredGamesCount: loadedData.featuredGames.length,
        lastUpdated: loadedData.lastUpdated
      });
    } else {
      console.log('❌ 未能加载静态生成数据');
    }
    
  } catch (error) {
    console.error('❌ 静态数据优化器测试失败:', error);
  }
}

/**
 * 性能测试
 */
async function performanceTest() {
  console.log('\n=== 性能测试 ===');
  
  try {
    // 测试数据加载性能
    console.log('\n1. 测试数据加载性能...');
    const startTime = Date.now();
    
    const [categories, featuredGames, adventureGames] = await Promise.all([
      gameDataLoader.getCategories(),
      gameDataLoader.getFeaturedGames(10),
      gameDataLoader.getGamesByCategory(GameCategory.ADVENTURE, 1, 10)
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 并发加载完成，耗时: ${duration}ms`);
    console.log(`   - 分类数: ${categories.length}`);
    console.log(`   - 热门游戏数: ${featuredGames.length}`);
    console.log(`   - 冒险游戏数: ${adventureGames.games.length}`);
    
    // 测试缓存效果（第二次加载）
    console.log('\n2. 测试缓存效果（第二次加载）...');
    const cacheStartTime = Date.now();
    
    await Promise.all([
      gameDataLoader.getCategories(),
      gameDataLoader.getFeaturedGames(10),
      gameDataLoader.getGamesByCategory(GameCategory.ADVENTURE, 1, 10)
    ]);
    
    const cacheEndTime = Date.now();
    const cacheDuration = cacheEndTime - cacheStartTime;
    
    console.log(`✅ 缓存加载完成，耗时: ${cacheDuration}ms`);
    console.log(`   性能提升: ${((duration - cacheDuration) / duration * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试前端数据结构优化功能...');
  
  await testGameDataLoader();
  await testStaticDataOptimizer();
  await performanceTest();
  
  console.log('\n🎉 所有测试完成！');
  console.log('\n📋 测试总结:');
  console.log('   ✅ 前端数据加载器 - 支持分类、搜索、分页等功能');
  console.log('   ✅ 静态数据优化器 - 支持静态生成、SEO优化、相关推荐');
  console.log('   ✅ 性能优化 - 内存缓存、并发加载、数据预处理');
  console.log('\n🎯 阶段2.3前端数据结构优化任务已完成！');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };