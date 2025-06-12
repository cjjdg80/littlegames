/**
 * SEO生成器测试脚本
 * 用于测试第一阶段开发的SEO生成器功能
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  createSEOGenerator,
  createSEOBatchGenerator,
  createSEOQualityChecker,
  DEFAULT_SEO_CONFIG,
  DEFAULT_BATCH_CONFIG
} from '../src/lib/seo';
// 定义实际的数据结构
interface GameIndexItem {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  primary_category: string;
  batch_number: number;
  featured: boolean;
}

interface GameData {
  id: number;
  slug: string;
  title: string;
  description: string;
  instructions: string;
  thumbnail: string;
  iframe_src: string;
  iframe_width: number;
  iframe_height: number;
  primary_category: string;
  all_categories: string[];
  tags: string[];
  devices: string[];
  developer: string;
  batch_number: number;
  collection_time: string;
  featured: boolean;
}

interface CategoryIndex {
  [category: string]: {
    count: number;
    games: number[];
  };
}

/**
 * 加载测试数据
 */
function loadTestData() {
  try {
    // 加载游戏索引
    const gameIndexPath = path.join(__dirname, 'processed/games-index.json');
    const gameIndex: GameIndexItem[] = JSON.parse(fs.readFileSync(gameIndexPath, 'utf-8'));
    
    // 加载分类索引
    const categoryIndexPath = path.join(__dirname, 'processed/category-index.json');
    const categoryIndex: CategoryIndex = JSON.parse(fs.readFileSync(categoryIndexPath, 'utf-8'));
    
    // 加载第一个游戏的详细数据作为测试
    const firstGame = gameIndex[0];
    const category = firstGame.primary_category;
    const gameBatchPath = path.join(__dirname, `processed/games/${category}/page-1.json`);
    const batchData: GameData[] = JSON.parse(fs.readFileSync(gameBatchPath, 'utf-8'));
    const testGame = batchData.find((game: GameData) => game.id === firstGame.id);
    
    return {
      gameIndex,
      categoryIndex,
      testGame,
      totalGames: gameIndex.length,
      categories: Object.keys(categoryIndex)
    };
  } catch (error) {
    console.error('加载测试数据失败:', error);
    return null;
  }
}

/**
 * 测试单个游戏SEO生成
 */
async function testGameSEOGeneration(testGame: GameData) {
  console.log('\n=== 测试游戏SEO生成 ===');
  
  const generator = createSEOGenerator(DEFAULT_SEO_CONFIG);
  
  try {
    const seoData = await generator.generateGameSEO(testGame);
    
    console.log('✅ 游戏SEO生成成功');
    console.log('游戏ID:', testGame.id);
    console.log('标题:', seoData.metadata.title);
    console.log('描述:', seoData.metadata.description);
    console.log('关键词:', seoData.metadata.keywords.join(', '));
    console.log('面包屑:', seoData.breadcrumbs.map((b: any) => b.label).join(' > '));
    console.log('相关游戏数量:', seoData.relatedGames?.length || 0);
    console.log('面包屑数量:', seoData.breadcrumbs?.length || 0);
    
    return seoData;
  } catch (error) {
    console.error('❌ 游戏SEO生成失败:', error);
    return null;
  }
}

/**
 * 测试分类SEO生成
 */
async function testCategorySEOGeneration(category: string, gameCount: number) {
  console.log('\n=== 测试分类SEO生成 ===');
  
  const generator = createSEOGenerator(DEFAULT_SEO_CONFIG);
  
  try {
    const seoData = await generator.generateCategorySEO(category, gameCount);
    
    console.log('✅ 分类SEO生成成功');
    console.log('分类:', category);
    console.log('标题:', seoData.metadata.title);
    console.log('描述:', seoData.metadata.description);
    console.log('关键词:', seoData.metadata.keywords.join(', '));
    console.log('显示名称:', seoData.displayName);
    console.log('面包屑数量:', seoData.breadcrumbs?.length || 0);
    
    return seoData;
  } catch (error) {
    console.error('❌ 分类SEO生成失败:', error);
    return null;
  }
}

/**
 * 测试首页SEO生成
 */
async function testHomeSEOGeneration(totalGames: number, categories: string[]) {
  console.log('\n=== 测试首页SEO生成 ===');
  
  const generator = createSEOGenerator(DEFAULT_SEO_CONFIG);
  
  try {
    const seoData = generator.generateHomeSEO([], [], []);
    
    console.log('✅ 首页SEO生成成功');
    console.log('标题:', seoData.metadata.title);
    console.log('描述:', seoData.metadata.description);
    console.log('关键词:', seoData.metadata.keywords.join(', '));
    console.log('特色区块数量:', Object.keys(seoData.featuredSections).length);
    console.log('今日推荐游戏数量:', seoData.featuredSections.todaysFeatured.games.length);
    
    return seoData;
  } catch (error) {
    console.error('❌ 首页SEO生成失败:', error);
    return null;
  }
}

/**
 * 测试SEO质量检查
 */
async function testSEOQualityCheck(seoDataList: any[]) {
  console.log('\n=== 测试SEO质量检查 ===');
  
  const qualityChecker = createSEOQualityChecker();
  
  try {
    const results = await Promise.all(
      seoDataList.map(seoData => qualityChecker.performDetailedQualityCheck(seoData, 'game'))
    );
    
    console.log('✅ SEO质量检查完成');
    results.forEach((result: any, index: number) => {
      console.log(`数据 ${index + 1}:`);
      console.log('  质量分数:', result.overallScore);
      console.log('  是否通过:', result.overallScore >= 0.6 ? '✅' : '❌');
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('  建议:', result.suggestions.join(', '));
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ SEO质量检查失败:', error);
    return [];
  }
}

/**
 * 测试批量生成功能（小规模测试）
 */
async function testBatchGeneration(gameIndex: GameIndexItem[], categoryIndex: CategoryIndex) {
  console.log('\n=== 测试批量生成功能 ===');
  
  const batchGenerator = createSEOBatchGenerator({
    ...DEFAULT_BATCH_CONFIG,
    batchSize: 3, // 更小的批次，便于观察日志
    concurrency: 2,
    outputDir: './test-output/seo'
  });
  
  try {
    // 创建测试输出目录
    const testOutputDir = path.join(__dirname, '../test-output/seo');
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
    
    // 获取前5个游戏进行测试
    const gameIds = gameIndex.slice(0, 5).map(game => game.id.toString());
    const categories = Object.keys(categoryIndex).slice(0, 2);
    
    console.log('开始批量生成测试...');
    const report = await batchGenerator.generateFullSEODataset('./scripts/processed');
    
    console.log('✅ 批量生成测试完成');
    console.log('总处理数量:', report.summary.totalProcessed);
    console.log('成功数量:', report.summary.totalSuccessful);
    console.log('失败数量:', report.summary.totalFailed);
    console.log('处理时间:', report.summary.processingTime, 'ms');
    
    const failedGames = report.games.filter((r: any) => !r.success);
    if (failedGames.length > 0) {
      console.log('  游戏生成失败数量:', failedGames.length);
      failedGames.forEach((error: any) => {
        console.log('    -', error.error || 'Unknown error');
      });
    }
    
    return report;
  } catch (error) {
    console.error('❌ 批量生成测试失败:', error);
    return null;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始SEO生成器测试');
  console.log('='.repeat(50));
  
  // 加载测试数据
  const testData = loadTestData();
  if (!testData) {
    console.error('❌ 无法加载测试数据，测试终止');
    return;
  }
  
  console.log('✅ 测试数据加载成功');
  console.log('游戏总数:', testData.totalGames);
  console.log('分类数量:', testData.categories.length);
  console.log('测试游戏:', testData.testGame?.title || 'N/A');
  
  const seoDataList: any[] = [];
  
  // 测试游戏SEO生成
  const gameSEO = await testGameSEOGeneration(testData.testGame!);
  if (gameSEO) seoDataList.push(gameSEO);
  
  // 测试分类SEO生成
  const firstCategory = testData.categories[0];
  const categoryGameCount = testData.categoryIndex[firstCategory]?.count || 0;
  const categorySEO = await testCategorySEOGeneration(firstCategory, categoryGameCount);
  if (categorySEO) seoDataList.push(categorySEO);
  
  // 测试首页SEO生成
  const homeSEO = await testHomeSEOGeneration(testData.totalGames, testData.categories);
  if (homeSEO) seoDataList.push(homeSEO);
  
  // 测试SEO质量检查
  if (seoDataList.length > 0) {
    await testSEOQualityCheck(seoDataList);
  }
  
  // 测试批量生成功能
  await testBatchGeneration(testData.gameIndex, testData.categoryIndex);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 SEO生成器测试完成');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };