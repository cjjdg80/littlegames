// scripts/test-build-data-files.ts
// 构建数据文件测试脚本 - 验证生成的数据文件质量和完整性

import * as fs from 'fs';
import * as path from 'path';

/**
 * 数据文件测试器
 */
class BuildDataFilesTester {
  private processedDir: string;
  private testResults: Record<string, any> = {};

  constructor() {
    this.processedDir = path.join(__dirname, 'processed');
  }

  /**
   * 执行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 开始测试构建数据文件...');
    
    try {
      // 1. 测试 gameStaticData.json
      await this.testGameStaticData();
      
      // 2. 测试 categoryIndex.json
      await this.testCategoryIndex();
      
      // 3. 测试 gameRelations.json
      await this.testGameRelations();
      
      // 4. 测试 sitemapData.json
      await this.testSitemapData();
      
      // 5. 数据一致性测试
      await this.testDataConsistency();
      
      // 6. 生成测试报告
      await this.generateTestReport();
      
      console.log('✅ 所有测试完成!');
      
    } catch (error) {
      console.error('❌ 测试失败:', error);
      throw error;
    }
  }

  /**
   * 测试 gameStaticData.json
   */
  private async testGameStaticData(): Promise<void> {
    console.log('\n🎮 测试 gameStaticData.json...');
    
    const filePath = path.join(this.processedDir, 'gameStaticData.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const tests = {
      file_exists: fs.existsSync(filePath),
      has_metadata: !!data.metadata,
      has_games_array: Array.isArray(data.games),
      has_categories_array: Array.isArray(data.categories),
      has_featured_games: Array.isArray(data.featured_games),
      games_count_matches: data.metadata.total_games === data.games.length,
      all_games_have_required_fields: data.games.every((game: any) => 
        game.id && game.slug && game.title && game.thumbnail && 
        game.primary_category && game.url && game.category_url
      ),
      featured_games_valid: data.featured_games.every((game: any) => 
        game.id && game.slug && game.title && game.thumbnail && 
        game.category && game.url
      ),
      categories_have_display_names: data.categories.every((cat: any) => 
        cat.slug && cat.display_name && cat.url && typeof cat.count === 'number'
      ),
      urls_format_correct: data.games.every((game: any) => 
        game.url.startsWith('/games/') && game.category_url.startsWith('/games/')
      )
    };
    
    this.testResults.gameStaticData = {
      ...tests,
      total_games: data.games.length,
      total_categories: data.categories.length,
      featured_games_count: data.featured_games.length,
      sample_game: data.games[0],
      sample_category: data.categories[0]
    };
    
    // 输出测试结果
    const passed = Object.values(tests).every(test => test === true);
    console.log(`${passed ? '✅' : '❌'} gameStaticData.json: ${data.games.length} 游戏, ${data.categories.length} 分类, ${data.featured_games.length} 推荐游戏`);
    
    if (!passed) {
      console.log('失败的测试:', Object.entries(tests).filter(([_, result]) => !result).map(([test, _]) => test));
    }
  }

  /**
   * 测试 categoryIndex.json
   */
  private async testCategoryIndex(): Promise<void> {
    console.log('\n📂 测试 categoryIndex.json...');
    
    const filePath = path.join(this.processedDir, 'categoryIndex.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const tests = {
      file_exists: fs.existsSync(filePath),
      has_metadata: !!data.metadata,
      has_categories: !!data.categories,
      categories_have_counts: Object.values(data.categories).every((cat: any) => 
        typeof cat.count === 'number' && Array.isArray(cat.game_ids)
      ),
      game_ids_are_numbers: Object.values(data.categories).every((cat: any) => 
        cat.game_ids.every((id: any) => typeof id === 'number')
      )
    };
    
    const totalGamesInCategories = Object.values(data.categories)
      .reduce((sum: number, cat: any) => sum + cat.count, 0);
    
    this.testResults.categoryIndex = {
      ...tests,
      total_categories: Object.keys(data.categories).length,
      total_games_in_categories: totalGamesInCategories,
      categories_list: Object.keys(data.categories),
      sample_category: Object.entries(data.categories)[0]
    };
    
    const passed = Object.values(tests).every(test => test === true);
    console.log(`${passed ? '✅' : '❌'} categoryIndex.json: ${Object.keys(data.categories).length} 分类, 总计 ${totalGamesInCategories} 游戏`);
    
    if (!passed) {
      console.log('失败的测试:', Object.entries(tests).filter(([_, result]) => !result).map(([test, _]) => test));
    }
  }

  /**
   * 测试 gameRelations.json
   */
  private async testGameRelations(): Promise<void> {
    console.log('\n🔗 测试 gameRelations.json...');
    
    const filePath = path.join(this.processedDir, 'gameRelations.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const relationKeys = Object.keys(data.relations);
    const sampleRelation = data.relations[relationKeys[0]];
    
    const tests = {
      file_exists: fs.existsSync(filePath),
      has_metadata: !!data.metadata,
      has_relations: !!data.relations,
      relations_count_matches: data.metadata.total_games === relationKeys.length,
      all_relations_have_required_fields: relationKeys.every(gameId => {
        const rel = data.relations[gameId];
        return Array.isArray(rel.similar_games) && 
               Array.isArray(rel.same_category) && 
               Array.isArray(rel.same_developer) && 
               Array.isArray(rel.recommended);
      }),
      game_ids_are_strings: relationKeys.every(id => typeof id === 'string'),
      relation_arrays_contain_numbers: relationKeys.slice(0, 10).every(gameId => {
        const rel = data.relations[gameId];
        return rel.similar_games.every((id: any) => typeof id === 'number') &&
               rel.same_category.every((id: any) => typeof id === 'number') &&
               rel.recommended.every((id: any) => typeof id === 'number');
      })
    };
    
    this.testResults.gameRelations = {
      ...tests,
      total_relations: relationKeys.length,
      sample_relation: sampleRelation,
      avg_similar_games: this.calculateAverage(relationKeys.slice(0, 100).map(id => data.relations[id].similar_games.length)),
      avg_recommended: this.calculateAverage(relationKeys.slice(0, 100).map(id => data.relations[id].recommended.length))
    };
    
    const passed = Object.values(tests).every(test => test === true);
    console.log(`${passed ? '✅' : '❌'} gameRelations.json: ${relationKeys.length} 游戏关系`);
    
    if (!passed) {
      console.log('失败的测试:', Object.entries(tests).filter(([_, result]) => !result).map(([test, _]) => test));
    }
  }

  /**
   * 测试 sitemapData.json
   */
  private async testSitemapData(): Promise<void> {
    console.log('\n🗺️ 测试 sitemapData.json...');
    
    const filePath = path.join(this.processedDir, 'sitemapData.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const tests = {
      file_exists: fs.existsSync(filePath),
      has_metadata: !!data.metadata,
      has_sitemap: !!data.sitemap,
      has_games_array: Array.isArray(data.sitemap.games),
      has_categories_array: Array.isArray(data.sitemap.categories),
      has_tags_array: Array.isArray(data.sitemap.tags),
      total_urls_matches: data.metadata.total_urls === 
        (data.sitemap.games.length + data.sitemap.categories.length + data.sitemap.tags.length),
      games_have_required_fields: data.sitemap.games.every((game: any) => 
        game.slug && game.category && game.lastmod && typeof game.priority === 'number'
      ),
      categories_have_required_fields: data.sitemap.categories.every((cat: any) => 
        cat.slug && cat.lastmod && typeof cat.priority === 'number'
      ),
      tags_have_required_fields: data.sitemap.tags.every((tag: any) => 
        tag.slug && tag.lastmod && typeof tag.priority === 'number'
      ),
      slugs_format_correct: data.sitemap.games.every((game: any) => 
        game.slug.startsWith('games/')
      ),
      priorities_in_range: [...data.sitemap.games, ...data.sitemap.categories, ...data.sitemap.tags]
        .every((item: any) => item.priority >= 0 && item.priority <= 1)
    };
    
    this.testResults.sitemapData = {
      ...tests,
      total_urls: data.metadata.total_urls,
      games_count: data.sitemap.games.length,
      categories_count: data.sitemap.categories.length,
      tags_count: data.sitemap.tags.length,
      sample_game_url: data.sitemap.games[0],
      sample_category_url: data.sitemap.categories[0],
      sample_tag_url: data.sitemap.tags[0]
    };
    
    const passed = Object.values(tests).every(test => test === true);
    console.log(`${passed ? '✅' : '❌'} sitemapData.json: ${data.metadata.total_urls} 总URL (${data.sitemap.games.length} 游戏, ${data.sitemap.categories.length} 分类, ${data.sitemap.tags.length} 标签)`);
    
    if (!passed) {
      console.log('失败的测试:', Object.entries(tests).filter(([_, result]) => !result).map(([test, _]) => test));
    }
  }

  /**
   * 数据一致性测试
   */
  private async testDataConsistency(): Promise<void> {
    console.log('\n🔍 测试数据一致性...');
    
    // 加载所有数据文件
    const gameStaticData = JSON.parse(fs.readFileSync(path.join(this.processedDir, 'gameStaticData.json'), 'utf8'));
    const categoryIndex = JSON.parse(fs.readFileSync(path.join(this.processedDir, 'categoryIndex.json'), 'utf8'));
    const gameRelations = JSON.parse(fs.readFileSync(path.join(this.processedDir, 'gameRelations.json'), 'utf8'));
    const sitemapData = JSON.parse(fs.readFileSync(path.join(this.processedDir, 'sitemapData.json'), 'utf8'));
    
    const tests = {
      game_counts_consistent: 
        gameStaticData.games.length === Object.keys(gameRelations.relations).length &&
        gameStaticData.games.length === sitemapData.sitemap.games.length,
      category_counts_consistent:
        gameStaticData.categories.length === Object.keys(categoryIndex.categories).length &&
        gameStaticData.categories.length === sitemapData.sitemap.categories.length,
      game_ids_exist_in_relations: gameStaticData.games.slice(0, 10).every((game: any) => 
        gameRelations.relations.hasOwnProperty(game.id.toString())
      ),
      category_slugs_consistent: gameStaticData.categories.every((cat: any) => 
        categoryIndex.categories.hasOwnProperty(cat.slug)
      ),
      sitemap_game_slugs_valid: sitemapData.sitemap.games.slice(0, 10).every((item: any) => {
        const parts = item.slug.split('/');
        return parts.length === 3 && parts[0] === 'games';
      })
    };
    
    this.testResults.dataConsistency = tests;
    
    const passed = Object.values(tests).every(test => test === true);
    console.log(`${passed ? '✅' : '❌'} 数据一致性检查`);
    
    if (!passed) {
      console.log('失败的测试:', Object.entries(tests).filter(([_, result]) => !result).map(([test, _]) => test));
    }
  }

  /**
   * 生成测试报告
   */
  private async generateTestReport(): Promise<void> {
    console.log('\n📋 生成测试报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.countTotalTests(),
        passed_tests: this.countPassedTests(),
        failed_tests: this.countFailedTests()
      },
      test_results: this.testResults,
      overall_status: this.countFailedTests() === 0 ? 'PASSED' : 'FAILED'
    };
    
    const reportPath = path.join(this.processedDir, 'build-data-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 测试报告摘要:`);
    console.log(`总测试数: ${report.summary.total_tests}`);
    console.log(`通过: ${report.summary.passed_tests}`);
    console.log(`失败: ${report.summary.failed_tests}`);
    console.log(`整体状态: ${report.overall_status}`);
    console.log(`\n📋 详细报告已保存: ${reportPath}`);
  }

  /**
   * 计算平均值
   */
  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length * 100) / 100 : 0;
  }

  /**
   * 统计总测试数
   */
  private countTotalTests(): number {
    let total = 0;
    for (const testGroup of Object.values(this.testResults)) {
      for (const [key, value] of Object.entries(testGroup as Record<string, any>)) {
        if (typeof value === 'boolean') {
          total++;
        }
      }
    }
    return total;
  }

  /**
   * 统计通过的测试数
   */
  private countPassedTests(): number {
    let passed = 0;
    for (const testGroup of Object.values(this.testResults)) {
      for (const [key, value] of Object.entries(testGroup as Record<string, any>)) {
        if (value === true) {
          passed++;
        }
      }
    }
    return passed;
  }

  /**
   * 统计失败的测试数
   */
  private countFailedTests(): number {
    let failed = 0;
    for (const testGroup of Object.values(this.testResults)) {
      for (const [key, value] of Object.entries(testGroup as Record<string, any>)) {
        if (value === false) {
          failed++;
        }
      }
    }
    return failed;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const tester = new BuildDataFilesTester();
    await tester.runAllTests();
    
    console.log('\n🎉 构建数据文件测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { BuildDataFilesTester };