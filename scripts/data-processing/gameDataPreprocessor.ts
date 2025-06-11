// scripts/data-processing/gameDataPreprocessor.ts
// 游戏数据预处理器 - 验证数据完整性、生成slug、URL映射、iframe预处理和分类标准化

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

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
 * 预处理结果接口
 */
interface PreprocessingResult {
  totalGames: number;
  validGames: number;
  invalidGames: number;
  duplicateSlugs: number;
  processedGames: GameData[];
  urlMappings: Record<string, number>;
  categoryMappings: Record<string, string>;
  validationErrors: string[];
}

/**
 * 游戏数据预处理器
 */
class GameDataPreprocessor {
  private inputDir: string;
  private outputDir: string;
  private processedGames: GameData[] = [];
  private urlMappings: Record<string, number> = {};
  private slugSet: Set<string> = new Set();
  private categoryMappings: Record<string, string> = {};
  private validationErrors: string[] = [];

  constructor() {
    this.inputDir = path.join(__dirname, '../processed');
    this.outputDir = path.join(__dirname, '../processed');
    this.initializeCategoryMappings();
  }

  /**
   * 初始化分类映射表（标准化分类名称）
   */
  private initializeCategoryMappings(): void {
    this.categoryMappings = {
      // 冒险类游戏
      'adventure': 'adventure',
      'rpg': 'adventure',
      'role-playing': 'adventure',
      'quest': 'adventure',
      'fighting': 'adventure',
      'platform': 'adventure',
      
      // 街机类游戏
      'arcade': 'arcade',
      'action': 'arcade',
      'shooter': 'arcade',
      'beat-em-up': 'arcade',
      
      // 休闲类游戏
      'casual': 'casual',
      'family': 'casual',
      'kids': 'casual',
      
      // 益智类游戏
      'puzzle': 'puzzle',
      'brain': 'puzzle',
      'logic': 'puzzle',
      'word': 'puzzle',
      'trivia': 'puzzle',
      
      // 模拟类游戏
      'simulation': 'simulation',
      'management': 'simulation',
      'building': 'simulation',
      
      // 体育类游戏
      'sports': 'sports',
      'football': 'sports',
      'basketball': 'sports',
      'soccer': 'sports',
      'racing': 'sports',
      
      // 策略类游戏
      'strategy': 'strategy',
      'tower-defense': 'strategy',
      'multiplayer': 'strategy',
      'io': 'strategy',
      'battle-royale': 'strategy'
    };
  }

  /**
   * 主预处理流程
   */
  async preprocessGameData(): Promise<PreprocessingResult> {
    console.log('🚀 开始游戏数据预处理...');
    
    try {
      // 1. 加载游戏数据
      const games = await this.loadGameData();
      console.log(`📊 加载了 ${games.length} 个游戏数据`);
      
      // 2. 验证数据完整性
      console.log('🔍 验证数据完整性...');
      const validGames = this.validateGameData(games);
      
      // 3. 生成唯一slug标识符
      console.log('🏷️ 生成唯一slug标识符...');
      this.generateUniqueSlugs(validGames);
      
      // 4. 创建URL映射表
      console.log('🗺️ 创建URL映射表...');
      this.createUrlMappings(validGames);
      
      // 5. 预处理iframe嵌入代码
      console.log('🖼️ 预处理iframe嵌入代码...');
      this.preprocessIframeCode(validGames);
      
      // 6. 清理和标准化游戏分类
      console.log('📂 标准化游戏分类...');
      this.standardizeCategories(validGames);
      
      // 7. 保存预处理结果
      console.log('💾 保存预处理结果...');
      await this.savePreprocessedData(validGames);
      
      const result: PreprocessingResult = {
        totalGames: games.length,
        validGames: validGames.length,
        invalidGames: games.length - validGames.length,
        duplicateSlugs: this.slugSet.size - validGames.length,
        processedGames: validGames,
        urlMappings: this.urlMappings,
        categoryMappings: this.categoryMappings,
        validationErrors: this.validationErrors
      };
      
      console.log('✅ 游戏数据预处理完成！');
      this.printPreprocessingSummary(result);
      
      return result;
      
    } catch (error) {
      console.error('❌ 预处理过程中发生错误:', error);
      throw error;
    }
  }

  /**
   * 加载游戏数据
   */
  private async loadGameData(): Promise<GameData[]> {
    const gamesIndexPath = path.join(this.inputDir, 'games-index.json');
    
    if (!fs.existsSync(gamesIndexPath)) {
      throw new Error('游戏索引文件不存在: ' + gamesIndexPath);
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf-8'));
    return gamesData;
  }

  /**
   * 验证游戏数据完整性
   */
  private validateGameData(games: GameData[]): GameData[] {
    const validGames: GameData[] = [];
    
    for (const game of games) {
      const errors: string[] = [];
      
      // 检查必需字段
      if (!game.id) errors.push('缺少游戏ID');
      if (!game.title || game.title.trim() === '') errors.push('缺少游戏标题');
      if (!game.thumbnail || game.thumbnail.trim() === '') errors.push('缺少游戏缩略图');
      if (!game.primary_category || game.primary_category.trim() === '') errors.push('缺少主分类');
      
      // 检查ID是否为有效数字
      if (typeof game.id !== 'number' || game.id <= 0) {
        errors.push('游戏ID无效');
      }
      
      // 检查缩略图URL格式
      if (game.thumbnail && !this.isValidUrl(game.thumbnail)) {
        errors.push('缩略图URL格式无效');
      }
      
      // 如果有错误，记录并跳过
      if (errors.length > 0) {
        this.validationErrors.push(`游戏 ${game.id} (${game.title}): ${errors.join(', ')}`);
        continue;
      }
      
      validGames.push(game);
    }
    
    return validGames;
  }

  /**
   * 生成唯一slug标识符
   */
  private generateUniqueSlugs(games: GameData[]): void {
    for (const game of games) {
      let baseSlug = this.generateSlugFromTitle(game.title);
      let uniqueSlug = baseSlug;
      let counter = 1;
      
      // 确保slug唯一性
      while (this.slugSet.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      game.slug = uniqueSlug;
      this.slugSet.add(uniqueSlug);
    }
  }

  /**
   * 从标题生成slug
   */
  private generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
      .substring(0, 50); // 限制长度
  }

  /**
   * 创建URL映射表
   */
  private createUrlMappings(games: GameData[]): void {
    for (const game of games) {
      // 创建多种URL映射
      this.urlMappings[`/games/${game.slug}`] = game.id;
      this.urlMappings[`/game/${game.id}`] = game.id;
      this.urlMappings[`/play/${game.slug}`] = game.id;
      
      // 如果有分类，添加分类相关的URL
      if (game.primary_category) {
        this.urlMappings[`/games/${game.primary_category}/${game.slug}`] = game.id;
      }
    }
  }

  /**
   * 预处理iframe嵌入代码
   */
  private preprocessIframeCode(games: GameData[]): void {
    for (const game of games) {
      // 设置默认iframe尺寸
      if (!game.iframe_width) game.iframe_width = 800;
      if (!game.iframe_height) game.iframe_height = 600;
      
      // 如果没有iframe_src，生成一个占位符
      if (!game.iframe_src) {
        game.iframe_src = `/games/placeholder/${game.id}`;
      }
      
      // 确保iframe_src是安全的URL
      if (game.iframe_src && !this.isValidUrl(game.iframe_src) && !game.iframe_src.startsWith('/')) {
        game.iframe_src = `/games/placeholder/${game.id}`;
      }
    }
  }

  /**
   * 标准化游戏分类
   */
  private standardizeCategories(games: GameData[]): void {
    for (const game of games) {
      // 标准化主分类
      const normalizedCategory = this.categoryMappings[game.primary_category.toLowerCase()] || game.primary_category;
      game.primary_category = normalizedCategory;
      
      // 标准化所有分类
      if (game.all_categories) {
        game.all_categories = game.all_categories.map(cat => 
          this.categoryMappings[cat.toLowerCase()] || cat
        );
        
        // 确保主分类在所有分类中
        if (!game.all_categories.includes(game.primary_category)) {
          game.all_categories.unshift(game.primary_category);
        }
      } else {
        game.all_categories = [game.primary_category];
      }
      
      // 设置默认设备支持
      if (!game.devices || game.devices.length === 0) {
        game.devices = ['desktop', 'mobile'];
      }
      
      // 设置默认标签
      if (!game.tags || game.tags.length === 0) {
        game.tags = [game.primary_category, 'online', 'free'];
      }
    }
  }

  /**
   * 保存预处理结果
   */
  private async savePreprocessedData(games: GameData[]): Promise<void> {
    // 保存预处理后的游戏数据
    const preprocessedGamesPath = path.join(this.outputDir, 'preprocessed-games.json');
    fs.writeFileSync(preprocessedGamesPath, JSON.stringify(games, null, 2));
    
    // 保存URL映射表
    const urlMappingsPath = path.join(this.outputDir, 'url-mappings.json');
    fs.writeFileSync(urlMappingsPath, JSON.stringify(this.urlMappings, null, 2));
    
    // 保存分类映射表
    const categoryMappingsPath = path.join(this.outputDir, 'category-mappings.json');
    fs.writeFileSync(categoryMappingsPath, JSON.stringify(this.categoryMappings, null, 2));
    
    // 保存验证错误报告
    if (this.validationErrors.length > 0) {
      const errorsPath = path.join(this.outputDir, 'preprocessing-errors.json');
      fs.writeFileSync(errorsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalErrors: this.validationErrors.length,
        errors: this.validationErrors
      }, null, 2));
    }
    
    console.log(`💾 预处理数据已保存到: ${this.outputDir}`);
  }

  /**
   * 验证URL格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 打印预处理摘要
   */
  private printPreprocessingSummary(result: PreprocessingResult): void {
    console.log('\n📊 预处理摘要:');
    console.log(`总游戏数: ${result.totalGames}`);
    console.log(`有效游戏数: ${result.validGames}`);
    console.log(`无效游戏数: ${result.invalidGames}`);
    console.log(`重复slug数: ${result.duplicateSlugs}`);
    console.log(`验证错误数: ${result.validationErrors.length}`);
    console.log(`URL映射数: ${Object.keys(result.urlMappings).length}`);
    console.log(`分类映射数: ${Object.keys(result.categoryMappings).length}`);
    
    if (result.validationErrors.length > 0) {
      console.log('\n⚠️ 验证错误（前10个）:');
      result.validationErrors.slice(0, 10).forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    const preprocessor = new GameDataPreprocessor();
    await preprocessor.preprocessGameData();
  } catch (error) {
    console.error('❌ 预处理失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { GameDataPreprocessor };
export type { GameData, PreprocessingResult };