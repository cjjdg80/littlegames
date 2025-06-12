// scripts/build-data-files.ts
// 构建数据文件生成器 - 为生产环境构建静态数据文件

import * as fs from 'fs';
import * as path from 'path';

/**
 * 游戏数据接口
 */
interface GameData {
  id: number;
  slug: string;
  title: string;
  description?: string;
  instructions?: string;
  thumbnail: string;
  iframe_src?: string;
  iframe_width?: number;
  iframe_height?: number;
  primary_category: string;
  all_categories?: string[];
  tags?: string[];
  devices?: string[];
  developer?: string;
  batch_number: number;
  collection_time?: string;
  featured: boolean;
}

/**
 * 游戏索引项接口
 */
interface GameIndexItem {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  primary_category: string;
  batch_number: number;
  featured: boolean;
}

/**
 * 分类索引接口
 */
interface CategoryIndex {
  [category: string]: {
    count: number;
    game_ids: number[];
  };
}

/**
 * 游戏关系数据接口
 */
interface GameRelations {
  metadata: {
    total_games: number;
    generated_at: string;
    version: string;
    description: string;
  };
  relations: {
    [gameId: string]: {
      similar_games: number[];
      same_category: number[];
      same_developer: number[];
      recommended: number[];
    };
  };
}

/**
 * Sitemap数据接口
 */
interface SitemapData {
  games: Array<{
    slug: string;
    category: string;
    lastmod: string;
    priority: number;
  }>;
  categories: Array<{
    slug: string;
    lastmod: string;
    priority: number;
  }>;
  tags: Array<{
    slug: string;
    lastmod: string;
    priority: number;
  }>;
}

/**
 * 静态数据构建器
 */
class BuildDataFilesGenerator {
  private inputDir: string;
  private outputDir: string;
  private gamesData: GameData[] = [];
  private gamesIndex: GameIndexItem[] = [];
  private categoryIndex: CategoryIndex = {};
  private tagsIndex: Record<string, { count: number; game_ids: number[] }> = {};

  constructor() {
    this.inputDir = path.join(__dirname, 'processed');
    this.outputDir = path.join(__dirname, 'processed');
  }

  /**
   * 执行构建数据文件生成
   */
  async generateBuildDataFiles(): Promise<void> {
    console.log('🚀 开始生成构建数据文件...');
    
    try {
      // 1. 加载现有数据
      await this.loadExistingData();
      
      // 2. 生成 gameStaticData.json
      await this.generateGameStaticData();
      
      // 3. 创建 categoryIndex.json (复制现有文件)
      await this.createCategoryIndex();
      
      // 4. 生成 gameRelations.json
      await this.generateGameRelations();
      
      // 5. 创建 sitemapData.json
      await this.generateSitemapData();
      
      // 6. 验证数据格式和完整性
      await this.validateDataFiles();
      
      console.log('✅ 构建数据文件生成完成!');
      
    } catch (error) {
      console.error('❌ 构建数据文件生成失败:', error);
      throw error;
    }
  }

  /**
   * 加载现有数据
   */
  private async loadExistingData(): Promise<void> {
    console.log('📖 加载现有数据文件...');
    
    // 加载游戏索引
    const gamesIndexPath = path.join(this.inputDir, 'games-index.json');
    if (fs.existsSync(gamesIndexPath)) {
      this.gamesIndex = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf8'));
      console.log(`✅ 已加载 ${this.gamesIndex.length} 个游戏索引`);
    }
    
    // 加载分类索引
    const categoryIndexPath = path.join(this.inputDir, 'category-index.json');
    if (fs.existsSync(categoryIndexPath)) {
      this.categoryIndex = JSON.parse(fs.readFileSync(categoryIndexPath, 'utf8'));
      console.log(`✅ 已加载 ${Object.keys(this.categoryIndex).length} 个分类`);
    }
    
    // 加载标签索引
    const tagsIndexPath = path.join(this.inputDir, 'tags-index.json');
    if (fs.existsSync(tagsIndexPath)) {
      this.tagsIndex = JSON.parse(fs.readFileSync(tagsIndexPath, 'utf8'));
      console.log(`✅ 已加载 ${Object.keys(this.tagsIndex).length} 个标签`);
    }
    
    // 加载完整游戏数据
    const validGamesPath = path.join(this.inputDir, 'valid-games.json');
    if (fs.existsSync(validGamesPath)) {
      this.gamesData = JSON.parse(fs.readFileSync(validGamesPath, 'utf8'));
      console.log(`✅ 已加载 ${this.gamesData.length} 个完整游戏数据`);
    }
  }

  /**
   * 生成 gameStaticData.json - 构建时使用的静态数据
   */
  private async generateGameStaticData(): Promise<void> {
    console.log('🔨 生成 gameStaticData.json...');
    
    const gameStaticData = {
      metadata: {
        total_games: this.gamesIndex.length,
        generated_at: new Date().toISOString(),
        version: '1.0.0',
        description: 'Static game data for build-time generation'
      },
      games: this.gamesIndex.map(game => ({
        id: game.id,
        slug: game.slug,
        title: game.title,
        thumbnail: game.thumbnail && game.thumbnail.trim() !== '' 
          ? game.thumbnail 
          : '/images/default-game-thumbnail.svg', // 为没有缩略图的游戏提供默认缩略图
        primary_category: game.primary_category,
        featured: game.featured,
        url: `/games/${game.primary_category}/${game.slug}`,
        category_url: `/games/${game.primary_category}`
      })),
      categories: Object.keys(this.categoryIndex).map(category => ({
        slug: category,
        count: this.categoryIndex[category].count,
        url: `/games/${category}`,
        display_name: this.formatCategoryName(category)
      })),
      featured_games: this.gamesIndex
        .filter(game => game.featured)
        .slice(0, 20)
        .map(game => ({
          id: game.id,
          slug: game.slug,
          title: game.title,
          thumbnail: game.thumbnail,
          category: game.primary_category,
          url: `/games/${game.primary_category}/${game.slug}`
        }))
    };
    
    const outputPath = path.join(this.outputDir, 'gameStaticData.json');
    fs.writeFileSync(outputPath, JSON.stringify(gameStaticData, null, 2));
    console.log(`✅ gameStaticData.json 已生成: ${outputPath}`);
  }

  /**
   * 创建 categoryIndex.json (复制现有文件)
   */
  private async createCategoryIndex(): Promise<void> {
    console.log('📋 创建 categoryIndex.json...');
    
    const sourcePath = path.join(this.inputDir, 'category-index.json');
    const targetPath = path.join(this.outputDir, 'categoryIndex.json');
    
    if (fs.existsSync(sourcePath)) {
      const categoryData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      
      // 添加元数据
      const enhancedCategoryIndex = {
        metadata: {
          total_categories: Object.keys(categoryData).length,
          generated_at: new Date().toISOString(),
          description: 'Category index for build-time generation'
        },
        categories: categoryData
      };
      
      fs.writeFileSync(targetPath, JSON.stringify(enhancedCategoryIndex, null, 2));
      console.log(`✅ categoryIndex.json 已创建: ${targetPath}`);
    } else {
      console.warn('⚠️ category-index.json 源文件不存在');
    }
  }

  /**
   * 生成 gameRelations.json - 游戏推荐关系数据
   */
  private async generateGameRelations(): Promise<void> {
    console.log('🔗 生成 gameRelations.json...');
    
    const gameRelations: GameRelations = {
      metadata: {
        total_games: this.gamesIndex.length,
        generated_at: new Date().toISOString(),
        version: '1.0.0',
        description: 'Game relationship data for recommendations'
      },
      relations: {}
    };
    
    // 为每个游戏生成推荐关系
    for (const game of this.gamesIndex) {
      const gameId = game.id.toString();
      
      // 同分类游戏
      const sameCategoryGames = this.gamesIndex
        .filter(g => g.primary_category === game.primary_category && g.id !== game.id)
        .slice(0, 10)
        .map(g => g.id);
      
      // 推荐游戏 (优先推荐featured游戏)
      const recommendedGames = this.gamesIndex
        .filter(g => g.id !== game.id && (g.featured || g.primary_category === game.primary_category))
        .sort((a, b) => {
          // featured游戏优先
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        })
        .slice(0, 8)
        .map(g => g.id);
      
      // 同开发者游戏 (如果有开发者信息)
      const sameDeveloperGames: number[] = [];
      const fullGameData = this.gamesData.find(g => g.id === game.id);
      if (fullGameData?.developer) {
        const developerGames = this.gamesData
          .filter(g => g.developer === fullGameData.developer && g.id !== game.id)
          .slice(0, 5)
          .map(g => g.id);
        sameDeveloperGames.push(...developerGames);
      }
      
      gameRelations.relations[gameId] = {
        similar_games: sameCategoryGames,
        same_category: sameCategoryGames,
        same_developer: sameDeveloperGames,
        recommended: recommendedGames
      };
    }
    
    // gameRelations已经包含了正确的结构，直接使用
    const relationsData = gameRelations;
    
    const outputPath = path.join(this.outputDir, 'gameRelations.json');
    fs.writeFileSync(outputPath, JSON.stringify(relationsData, null, 2));
    console.log(`✅ gameRelations.json 已生成: ${outputPath}`);
  }

  /**
   * 生成 sitemapData.json - sitemap数据源
   */
  private async generateSitemapData(): Promise<void> {
    console.log('🗺️ 生成 sitemapData.json...');
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapData: SitemapData = {
      games: this.gamesIndex.map(game => ({
        slug: `games/${game.primary_category}/${game.slug}`,
        category: game.primary_category,
        lastmod: currentDate,
        priority: game.featured ? 0.8 : 0.6
      })),
      categories: Object.keys(this.categoryIndex).map(category => ({
        slug: `games/${category}`,
        lastmod: currentDate,
        priority: 0.7
      })),
      tags: Object.keys(this.tagsIndex).slice(0, 100).map(tag => ({
        slug: `tags/${tag}`,
        lastmod: currentDate,
        priority: 0.5
      }))
    };
    
    const sitemapDataWithMeta = {
      metadata: {
        total_urls: sitemapData.games.length + sitemapData.categories.length + sitemapData.tags.length,
        generated_at: new Date().toISOString(),
        description: 'Sitemap data source for build-time generation'
      },
      sitemap: sitemapData
    };
    
    const outputPath = path.join(this.outputDir, 'sitemapData.json');
    fs.writeFileSync(outputPath, JSON.stringify(sitemapDataWithMeta, null, 2));
    console.log(`✅ sitemapData.json 已生成: ${outputPath}`);
  }

  /**
   * 验证数据格式和完整性
   */
  private async validateDataFiles(): Promise<void> {
    console.log('🔍 验证数据格式和完整性...');
    
    const filesToValidate = [
      'gameStaticData.json',
      'categoryIndex.json',
      'gameRelations.json',
      'sitemapData.json'
    ];
    
    const validationResults = {
      timestamp: new Date().toISOString(),
      files: [] as Array<{
        filename: string;
        exists: boolean;
        valid_json: boolean;
        size_kb: number;
        record_count?: number;
        errors: string[];
      }>
    };
    
    for (const filename of filesToValidate) {
      const filePath = path.join(this.outputDir, filename);
      const fileResult = {
        filename,
        exists: false,
        valid_json: false,
        size_kb: 0,
        record_count: undefined as number | undefined,
        errors: [] as string[]
      };
      
      try {
        if (fs.existsSync(filePath)) {
          fileResult.exists = true;
          
          const stats = fs.statSync(filePath);
          fileResult.size_kb = Math.round(stats.size / 1024);
          
          // 验证JSON格式
          const content = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(content);
          fileResult.valid_json = true;
          
          // 记录数量统计
          if (filename === 'gameStaticData.json' && jsonData.games) {
            fileResult.record_count = jsonData.games.length;
          } else if (filename === 'categoryIndex.json' && jsonData.categories) {
            fileResult.record_count = Object.keys(jsonData.categories).length;
          } else if (filename === 'gameRelations.json' && jsonData.relations) {
            fileResult.record_count = Object.keys(jsonData.relations).length;
          } else if (filename === 'sitemapData.json' && jsonData.sitemap) {
            fileResult.record_count = jsonData.sitemap.games.length + jsonData.sitemap.categories.length + jsonData.sitemap.tags.length;
          }
          
        } else {
          fileResult.errors.push('文件不存在');
        }
      } catch (error) {
        fileResult.errors.push(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      validationResults.files.push(fileResult);
    }
    
    // 保存验证报告
    const reportPath = path.join(this.outputDir, 'build-data-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
    
    // 输出验证结果
    console.log('\n📊 数据文件验证结果:');
    for (const file of validationResults.files) {
      const status = file.exists && file.valid_json && file.errors.length === 0 ? '✅' : '❌';
      console.log(`${status} ${file.filename}: ${file.size_kb}KB${file.record_count ? ` (${file.record_count} 条记录)` : ''}`);
      if (file.errors.length > 0) {
        console.log(`   错误: ${file.errors.join(', ')}`);
      }
    }
    
    console.log(`\n📋 验证报告已保存: ${reportPath}`);
  }

  /**
   * 格式化分类名称
   */
  private formatCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'action': 'Action Games',
      'adventure': 'Adventure Games',
      'arcade': 'Arcade Games',
      'casual': 'Casual Games',
      'puzzle': 'Puzzle Games',
      'simulation': 'Simulation Games',
      'sports': 'Sports Games',
      'strategy': 'Strategy Games'
    };
    
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const generator = new BuildDataFilesGenerator();
    await generator.generateBuildDataFiles();
    
    console.log('\n🎉 构建数据文件生成任务完成!');
    console.log('\n生成的文件:');
    console.log('- gameStaticData.json (构建时使用的静态数据)');
    console.log('- categoryIndex.json (分类索引文件)');
    console.log('- gameRelations.json (推荐关系数据)');
    console.log('- sitemapData.json (sitemap数据源)');
    console.log('- build-data-validation-report.json (验证报告)');
    
  } catch (error) {
    console.error('❌ 构建数据文件生成失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { BuildDataFilesGenerator };