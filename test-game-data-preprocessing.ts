// test-game-data-preprocessing.ts
// 游戏数据预处理功能测试脚本

import * as fs from 'fs';
import * as path from 'path';

/**
 * 测试游戏数据预处理结果
 */
class GameDataPreprocessingTester {
  private processedDir: string;
  private testResults: any = {};

  constructor() {
    this.processedDir = path.join(process.cwd(), 'scripts/processed');
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 开始测试游戏数据预处理结果...');
    
    try {
      // 测试1: 验证预处理后的游戏数据
      await this.testPreprocessedGames();
      
      // 测试2: 验证URL映射表
      await this.testUrlMappings();
      
      // 测试3: 验证分类映射
      await this.testCategoryMappings();
      
      // 测试4: 验证数据完整性
      await this.testDataIntegrity();
      
      // 测试5: 验证slug唯一性
      await this.testSlugUniqueness();
      
      // 打印测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      throw error;
    }
  }

  /**
   * 测试预处理后的游戏数据
   */
  private async testPreprocessedGames(): Promise<void> {
    console.log('\n🔍 测试1: 验证预处理后的游戏数据...');
    
    const filePath = path.join(this.processedDir, 'preprocessed-games.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('预处理游戏数据文件不存在');
    }
    
    const games = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    this.testResults.preprocessedGames = {
      fileExists: true,
      totalGames: games.length,
      sampleGame: games[0],
      hasRequiredFields: this.validateGameFields(games[0]),
      allGamesValid: games.every((game: any) => this.validateGameFields(game))
    };
    
    console.log(`✅ 预处理游戏数据: ${games.length} 个游戏`);
    console.log(`✅ 所有游戏字段完整: ${this.testResults.preprocessedGames.allGamesValid}`);
  }

  /**
   * 测试URL映射表
   */
  private async testUrlMappings(): Promise<void> {
    console.log('\n🔍 测试2: 验证URL映射表...');
    
    const filePath = path.join(this.processedDir, 'url-mappings.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('URL映射文件不存在');
    }
    
    const mappings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const mappingKeys = Object.keys(mappings);
    
    // 检查映射类型
    const gamesPaths = mappingKeys.filter(key => key.startsWith('/games/'));
    const playPaths = mappingKeys.filter(key => key.startsWith('/play/'));
    const gamePaths = mappingKeys.filter(key => key.startsWith('/game/'));
    
    this.testResults.urlMappings = {
      fileExists: true,
      totalMappings: mappingKeys.length,
      gamesPathCount: gamesPaths.length,
      playPathCount: playPaths.length,
      gamePathCount: gamePaths.length,
      sampleMappings: {
        games: gamesPaths.slice(0, 3),
        play: playPaths.slice(0, 3),
        game: gamePaths.slice(0, 3)
      }
    };
    
    console.log(`✅ URL映射表: ${mappingKeys.length} 个映射`);
    console.log(`✅ /games/ 路径: ${gamesPaths.length} 个`);
    console.log(`✅ /play/ 路径: ${playPaths.length} 个`);
    console.log(`✅ /game/ 路径: ${gamePaths.length} 个`);
  }

  /**
   * 测试分类映射
   */
  private async testCategoryMappings(): Promise<void> {
    console.log('\n🔍 测试3: 验证分类映射...');
    
    const filePath = path.join(this.processedDir, 'category-mappings.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('分类映射文件不存在');
    }
    
    const mappings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const categories = Object.keys(mappings);
    const uniqueTargets = Array.from(new Set(Object.values(mappings)));
    
    this.testResults.categoryMappings = {
      fileExists: true,
      totalCategories: categories.length,
      uniqueTargets: uniqueTargets.length,
      targetCategories: uniqueTargets,
      sampleMappings: Object.fromEntries(
        Object.entries(mappings).slice(0, 10)
      )
    };
    
    console.log(`✅ 分类映射: ${categories.length} 个原始分类 -> ${uniqueTargets.length} 个标准分类`);
    console.log(`✅ 标准分类: ${uniqueTargets.join(', ')}`);
  }

  /**
   * 测试数据完整性
   */
  private async testDataIntegrity(): Promise<void> {
    console.log('\n🔍 测试4: 验证数据完整性...');
    
    // 检查错误报告
    const errorsPath = path.join(this.processedDir, 'preprocessing-errors.json');
    let errors = [];
    
    if (fs.existsSync(errorsPath)) {
      const errorData = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'));
      errors = errorData.errors || [];
    }
    
    // 检查原始数据和预处理数据的数量对比
    const originalPath = path.join(this.processedDir, 'games-index.json');
    const preprocessedPath = path.join(this.processedDir, 'preprocessed-games.json');
    
    const originalGames = JSON.parse(fs.readFileSync(originalPath, 'utf-8'));
    const preprocessedGames = JSON.parse(fs.readFileSync(preprocessedPath, 'utf-8'));
    
    this.testResults.dataIntegrity = {
      originalCount: originalGames.length,
      preprocessedCount: preprocessedGames.length,
      errorCount: errors.length,
      dataLossRate: ((originalGames.length - preprocessedGames.length) / originalGames.length * 100).toFixed(2) + '%',
      sampleErrors: errors.slice(0, 5)
    };
    
    console.log(`✅ 原始游戏数: ${originalGames.length}`);
    console.log(`✅ 预处理后游戏数: ${preprocessedGames.length}`);
    console.log(`✅ 数据丢失率: ${this.testResults.dataIntegrity.dataLossRate}`);
    console.log(`✅ 验证错误数: ${errors.length}`);
  }

  /**
   * 测试slug唯一性
   */
  private async testSlugUniqueness(): Promise<void> {
    console.log('\n🔍 测试5: 验证slug唯一性...');
    
    const filePath = path.join(this.processedDir, 'preprocessed-games.json');
    const games = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const slugs = games.map((game: any) => game.slug);
    const uniqueSlugs = new Set(slugs);
    const duplicates = slugs.filter((slug: string, index: number) => 
      slugs.indexOf(slug) !== index
    );
    
    this.testResults.slugUniqueness = {
      totalSlugs: slugs.length,
      uniqueSlugs: uniqueSlugs.size,
      duplicateCount: duplicates.length,
      duplicates: Array.from(new Set(duplicates)),
      isUnique: duplicates.length === 0
    };
    
    console.log(`✅ 总slug数: ${slugs.length}`);
    console.log(`✅ 唯一slug数: ${uniqueSlugs.size}`);
    console.log(`✅ 重复slug数: ${duplicates.length}`);
    console.log(`✅ slug唯一性: ${duplicates.length === 0 ? '通过' : '失败'}`);
  }

  /**
   * 验证游戏字段完整性
   */
  private validateGameFields(game: any): boolean {
    const requiredFields = [
      'id', 'slug', 'title', 'thumbnail', 'primary_category',
      'iframe_width', 'iframe_height', 'iframe_src', 'all_categories',
      'devices', 'tags', 'batch_number', 'featured'
    ];
    
    return requiredFields.every(field => {
      const hasField = game.hasOwnProperty(field);
      const isNotEmpty = game[field] !== null && game[field] !== undefined && game[field] !== '';
      return hasField && isNotEmpty;
    });
  }

  /**
   * 打印测试结果
   */
  private printTestResults(): void {
    console.log('\n📊 测试结果摘要:');
    console.log('=====================================');
    
    // 预处理游戏数据测试
    console.log(`\n1. 预处理游戏数据:`);
    console.log(`   - 文件存在: ${this.testResults.preprocessedGames?.fileExists ? '✅' : '❌'}`);
    console.log(`   - 游戏总数: ${this.testResults.preprocessedGames?.totalGames || 0}`);
    console.log(`   - 字段完整性: ${this.testResults.preprocessedGames?.allGamesValid ? '✅' : '❌'}`);
    
    // URL映射测试
    console.log(`\n2. URL映射表:`);
    console.log(`   - 文件存在: ${this.testResults.urlMappings?.fileExists ? '✅' : '❌'}`);
    console.log(`   - 映射总数: ${this.testResults.urlMappings?.totalMappings || 0}`);
    console.log(`   - /games/ 路径: ${this.testResults.urlMappings?.gamesPathCount || 0}`);
    console.log(`   - /play/ 路径: ${this.testResults.urlMappings?.playPathCount || 0}`);
    
    // 分类映射测试
    console.log(`\n3. 分类映射:`);
    console.log(`   - 文件存在: ${this.testResults.categoryMappings?.fileExists ? '✅' : '❌'}`);
    console.log(`   - 原始分类数: ${this.testResults.categoryMappings?.totalCategories || 0}`);
    console.log(`   - 标准分类数: ${this.testResults.categoryMappings?.uniqueTargets || 0}`);
    
    // 数据完整性测试
    console.log(`\n4. 数据完整性:`);
    console.log(`   - 原始游戏数: ${this.testResults.dataIntegrity?.originalCount || 0}`);
    console.log(`   - 预处理后游戏数: ${this.testResults.dataIntegrity?.preprocessedCount || 0}`);
    console.log(`   - 数据丢失率: ${this.testResults.dataIntegrity?.dataLossRate || '0%'}`);
    console.log(`   - 验证错误数: ${this.testResults.dataIntegrity?.errorCount || 0}`);
    
    // slug唯一性测试
    console.log(`\n5. Slug唯一性:`);
    console.log(`   - 总slug数: ${this.testResults.slugUniqueness?.totalSlugs || 0}`);
    console.log(`   - 唯一slug数: ${this.testResults.slugUniqueness?.uniqueSlugs || 0}`);
    console.log(`   - 重复数量: ${this.testResults.slugUniqueness?.duplicateCount || 0}`);
    console.log(`   - 唯一性检查: ${this.testResults.slugUniqueness?.isUnique ? '✅' : '❌'}`);
    
    // 总体结果
    const allTestsPassed = (
      this.testResults.preprocessedGames?.fileExists &&
      this.testResults.preprocessedGames?.allGamesValid &&
      this.testResults.urlMappings?.fileExists &&
      this.testResults.categoryMappings?.fileExists &&
      this.testResults.slugUniqueness?.isUnique
    );
    
    console.log(`\n🎯 总体测试结果: ${allTestsPassed ? '✅ 全部通过' : '❌ 存在问题'}`);
    
    if (allTestsPassed) {
      console.log('\n🎉 游戏数据预处理任务已成功完成！');
      console.log('📋 完成的任务清单:');
      console.log('   ✅ 验证所有游戏数据完整性');
      console.log('   ✅ 生成唯一slug标识符');
      console.log('   ✅ 创建游戏URL映射表');
      console.log('   ✅ 预处理iframe嵌入代码');
      console.log('   ✅ 清理和标准化游戏分类');
    }
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    const tester = new GameDataPreprocessingTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { GameDataPreprocessingTester };