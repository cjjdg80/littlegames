// src/lib/seo/batchGenerator.ts - SEO数据批量生成器

import * as fs from 'fs/promises';
import * as path from 'path';
import { SEOGenerator, createDefaultSEOConfig } from './generator';
import { GameSEOData, CategorySEOData, TagSEOData, HomeSEOData } from '../../types/seo';
import { QualityChecker } from './qualityChecker';

/**
 * 批量生成配置
 */
export interface BatchGenerationConfig {
  /** 输出目录 */
  outputDir: string;
  /** 批次大小 */
  batchSize: number;
  /** 是否启用质量检查 */
  enableQualityCheck: boolean;
  /** 是否生成进度报告 */
  generateProgressReport: boolean;
  /** 并发处理数量 */
  concurrency: number;
  /** 基础URL */
  baseUrl: string;
}

/**
 * 生成进度信息
 */
export interface GenerationProgress {
  /** 总数量 */
  total: number;
  /** 已处理数量 */
  processed: number;
  /** 成功数量 */
  successful: number;
  /** 失败数量 */
  failed: number;
  /** 开始时间 */
  startTime: Date;
  /** 当前时间 */
  currentTime: Date;
  /** 预估剩余时间（毫秒） */
  estimatedTimeRemaining: number;
}

/**
 * 生成结果
 */
export interface GenerationResult {
  /** 是否成功 */
  success: boolean;
  /** 生成的文件路径 */
  filePath?: string;
  /** 错误信息 */
  error?: string;
  /** 质量分数 */
  qualityScore?: number;
}

/**
 * SEO批量生成器类
 */
export class SEOBatchGenerator {
  private generator: SEOGenerator;
  private qualityChecker: QualityChecker;
  private config: BatchGenerationConfig;
  
  constructor(config: BatchGenerationConfig) {
    this.config = config;
    this.generator = new SEOGenerator(createDefaultSEOConfig(), config.baseUrl);
    this.qualityChecker = new QualityChecker();
  }

  /**
   * 批量生成游戏SEO数据
   * @param gamesData 游戏数据数组
   * @param progressCallback 进度回调函数
   * @returns 生成结果数组
   */
  async generateGamesSEO(
    gamesData: any[],
    progressCallback?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult[]> {
    console.log(`开始批量生成 ${gamesData.length} 个游戏的SEO数据...`);
    
    const startTime = new Date();
    const results: GenerationResult[] = [];
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    // 确保输出目录存在
    const gamesOutputDir = path.join(this.config.outputDir, 'games');
    await this.ensureDirectoryExists(gamesOutputDir);
    
    // 分批处理
    for (let i = 0; i < gamesData.length; i += this.config.batchSize) {
      const batch = gamesData.slice(i, i + this.config.batchSize);
      const batchNumber = Math.floor(i / this.config.batchSize) + 1;
      const totalBatches = Math.ceil(gamesData.length / this.config.batchSize);
      
      console.log(`正在处理第 ${batchNumber}/${totalBatches} 批游戏 (${i + 1}-${Math.min(i + this.config.batchSize, gamesData.length)})...`);
      
      const batchResults = await this.processBatch(
        batch,
        'game',
        gamesOutputDir
      );
      
      results.push(...batchResults);
      processed += batch.length;
      successful += batchResults.filter(r => r.success).length;
      failed += batchResults.filter(r => !r.success).length;
      
      console.log(`第 ${batchNumber} 批完成: ${batchResults.filter(r => r.success).length} 成功, ${batchResults.filter(r => !r.success).length} 失败`);
      
      // 调用进度回调
      if (progressCallback) {
        const currentTime = new Date();
        const elapsed = currentTime.getTime() - startTime.getTime();
        const avgTimePerItem = elapsed / processed;
        const remaining = gamesData.length - processed;
        const estimatedTimeRemaining = avgTimePerItem * remaining;
        
        progressCallback({
          total: gamesData.length,
          processed,
          successful,
          failed,
          startTime,
          currentTime,
          estimatedTimeRemaining
        });
      }
      
      // 短暂延迟以避免过度占用资源
      if (i + this.config.batchSize < gamesData.length) {
        await this.delay(100);
      }
    }
    
    console.log(`游戏SEO生成完成: ${successful} 成功, ${failed} 失败`);
    return results;
  }

  /**
   * 批量生成分类SEO数据
   * @param categoriesData 分类数据数组
   * @param gameStats 游戏统计数据
   * @param allGames 所有游戏数据（可选，用于获取分类下的游戏）
   * @returns 生成结果数组
   */
  async generateCategoriesSEO(
    categoriesData: any[],
    gameStats: any,
    allGames?: any[]
  ): Promise<GenerationResult[]> {
    console.log(`开始生成 ${categoriesData.length} 个分类的SEO数据...`);
    
    const categoriesOutputDir = path.join(this.config.outputDir, 'categories');
    await this.ensureDirectoryExists(categoriesOutputDir);
    
    const results: GenerationResult[] = [];
    
    for (const categoryData of categoriesData) {
      try {
        // 获取该分类下的游戏数据
        const categoryGames = allGames ? allGames.filter(game => 
          game.primary_category === categoryData.category || 
          (game.all_categories && game.all_categories.includes(categoryData.category))
        ) : [];
        
        const seoData = this.generator.generateCategorySEO(categoryData.category, categoryData.count || 0, categoryGames);
        
        // 质量检查
        if (this.config.enableQualityCheck) {
          const qualityScore = await this.qualityChecker.checkCategorySEO(seoData);
          if (qualityScore < 0.7) {
            results.push({
              success: false,
              error: `质量分数过低: ${qualityScore}`,
              qualityScore
            });
            continue;
          }
        }
        
        // 保存文件
        const fileName = `${categoryData.category}.json`;
        const filePath = path.join(categoriesOutputDir, fileName);
        await fs.writeFile(filePath, JSON.stringify(seoData, null, 2), 'utf-8');
        
        results.push({
          success: true,
          filePath,
          qualityScore: this.config.enableQualityCheck ? 
            await this.qualityChecker.checkCategorySEO(seoData) : undefined
        });
        
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`分类SEO生成完成: ${results.filter(r => r.success).length} 成功`);
    return results;
  }

  /**
   * 批量生成标签SEO数据
   * @param tagsData 标签数据数组
   * @param allGames 所有游戏数据（可选，用于获取标签下的游戏）
   * @returns 生成结果数组
   */
  async generateTagsSEO(tagsData: any[], allGames?: any[]): Promise<GenerationResult[]> {
    console.log(`开始生成 ${tagsData.length} 个标签的SEO数据...`);
    
    const tagsOutputDir = path.join(this.config.outputDir, 'tags');
    await this.ensureDirectoryExists(tagsOutputDir);
    
    const results: GenerationResult[] = [];
    
    // 获取相关标签映射
    const relatedTagsMap = this.buildRelatedTagsMap(tagsData);
    
    for (const tagData of tagsData) {
      try {
        const relatedTags = relatedTagsMap[tagData.tag] || [];
        
        // 获取该标签下的游戏数据
        // 优先使用标签数据中的game_ids，如果没有则通过标签名匹配
        const tagGames = allGames ? (
          tagData.game_ids && tagData.game_ids.length > 0 ?
            allGames.filter(game => tagData.game_ids.includes(game.id)) :
            allGames.filter(game => game.tags && game.tags.includes(tagData.tag))
        ) : [];
        
        // 调试信息：检查标签游戏匹配情况
        if (tagData.tag === 'animal' || tagData.tag === 'adventure' || tagData.tag === 'action') {
          console.log(`🔍 调试 - 标签 "${tagData.tag}":`);  
          console.log(`   - 匹配游戏数: ${tagGames.length}`);
          if (tagGames.length > 0) {
            console.log(`   - 第一个游戏: ${tagGames[0].title}`);
            console.log(`   - 第一个游戏缩略图: ${tagGames[0].thumbnail}`);
            console.log(`   - 缩略图有效性: ${tagGames[0].thumbnail && tagGames[0].thumbnail.trim() !== '' ? '✅' : '❌'}`);
          }
        }
        
        const seoData = this.generator.generateTagSEO(tagData, relatedTags, tagGames);
        
        // 质量检查
        if (this.config.enableQualityCheck) {
          const qualityScore = await this.qualityChecker.checkTagSEO(seoData);
          if (qualityScore < 0.6) {
            results.push({
              success: false,
              error: `质量分数过低: ${qualityScore}`,
              qualityScore
            });
            continue;
          }
        }
        
        // 保存文件
        const fileName = `${tagData.tag}.json`;
        const filePath = path.join(tagsOutputDir, fileName);

        // 调试信息：检查写入文件前的数据
        if (tagData.tag === 'animal' || tagData.tag === 'adventure' || tagData.tag === 'action') {
          console.log(`💾 写入文件前调试 - 标签 "${tagData.tag}":`);
          console.log(`   - seoData.metadata.openGraph.image: ${seoData.metadata?.openGraph?.image}`);
          console.log(`   - seoData.metadata.twitter.image: ${seoData.metadata?.twitter?.image}`);
        }

        await fs.writeFile(filePath, JSON.stringify(seoData, null, 2), 'utf-8');
        
        results.push({
          success: true,
          filePath,
          qualityScore: this.config.enableQualityCheck ? 
            await this.qualityChecker.checkTagSEO(seoData) : undefined
        });
        
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`标签SEO生成完成: ${results.filter(r => r.success).length} 成功`);
    return results;
  }

  /**
   * 生成首页SEO数据
   * @param featuredGames 特色游戏
   * @param popularCategories 热门分类
   * @param latestGames 最新游戏
   * @returns 生成结果
   */
  async generateHomeSEO(
    featuredGames: any[],
    popularCategories: any[],
    latestGames: any[]
  ): Promise<GenerationResult> {
    console.log('开始生成首页SEO数据...');
    
    try {
      console.log('调用generator.generateHomeSEO...');
      const seoData = this.generator.generateHomeSEO(
        featuredGames,
        popularCategories,
        latestGames
      );
      console.log('generator.generateHomeSEO完成');
      
      // 质量检查
      if (this.config.enableQualityCheck) {
        console.log('开始首页SEO质量检查...');
        const qualityScore = await this.qualityChecker.checkHomeSEO(seoData);
        console.log(`首页SEO质量检查完成，分数: ${qualityScore}`);
        if (qualityScore < 0.8) {
          return {
            success: false,
            error: `首页SEO质量分数过低: ${qualityScore}`,
            qualityScore
          };
        }
      }
      
      // 保存文件
      console.log('开始保存首页SEO文件...');
      const filePath = path.join(this.config.outputDir, 'home.json');
      await fs.writeFile(filePath, JSON.stringify(seoData, null, 2), 'utf-8');
      console.log(`首页SEO文件保存完成: ${filePath}`);
      
      console.log('首页SEO生成完成');
      return {
        success: true,
        filePath,
        qualityScore: this.config.enableQualityCheck ? 
          await this.qualityChecker.checkHomeSEO(seoData) : undefined
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 生成完整的SEO数据集
   * @param sourceDataDir 源数据目录
   * @param progressCallback 进度回调
   * @returns 生成结果汇总
   */
  async generateFullSEODataset(
    sourceDataDir: string,
    progressCallback?: (progress: GenerationProgress) => void
  ): Promise<{
    games: GenerationResult[];
    categories: GenerationResult[];
    tags: GenerationResult[];
    home: GenerationResult;
    summary: {
      totalProcessed: number;
      totalSuccessful: number;
      totalFailed: number;
      processingTime: number;
    };
  }> {
    const startTime = new Date();
    console.log('开始生成完整SEO数据集...');
    
    // 加载源数据
    const [gamesData, categoriesData, tagsData, gameStats] = await Promise.all([
      this.loadJSONFile(path.join(sourceDataDir, 'validated-games.json')),
      this.loadJSONFile(path.join(sourceDataDir, 'category-index.json')),
      this.loadJSONFile(path.join(sourceDataDir, 'tags-index.json')),
      this.loadJSONFile(path.join(sourceDataDir, 'category-stats.json'))
    ]);
    
    // 转换数据格式
    const games = Array.isArray(gamesData) ? gamesData : Object.values(gamesData);
    const categories = Object.entries(categoriesData).map(([category, data]: [string, any]) => ({
      category,
      ...data
    }));
    const tags = Object.entries(tagsData).map(([tag, data]: [string, any]) => ({
      tag,
      ...data
    }));
    
    // 生成SEO数据 - 改为串行执行以便调试
    console.log('开始串行生成SEO数据...');
    
    console.log('步骤1: 开始生成游戏SEO数据...');
    const gameResults = await this.generateGamesSEO(games, progressCallback);
    console.log(`步骤1完成: 游戏SEO生成完成，成功 ${gameResults.filter(r => r.success).length} 个`);
    
    console.log('步骤2: 开始生成分类SEO数据...');
    const categoryResults = await this.generateCategoriesSEO(categories, gameStats, games);
    console.log(`步骤2完成: 分类SEO生成完成，成功 ${categoryResults.filter(r => r.success).length} 个`);
    
    console.log('步骤3: 开始生成标签SEO数据...');
    const tagResults = await this.generateTagsSEO(tags, games);
    console.log(`步骤3完成: 标签SEO生成完成，成功 ${tagResults.filter(r => r.success).length} 个`);
    
    console.log('步骤4: 开始生成首页SEO数据...');
    const featuredGames = games.filter((g: any) => g.featured).slice(0, 6);
    const topCategories = categories.slice(0, 8);
    const latestGames = games.slice(0, 8);
    console.log(`首页SEO参数: 特色游戏 ${featuredGames.length} 个, 热门分类 ${topCategories.length} 个, 最新游戏 ${latestGames.length} 个`);
    
    const homeResult = await this.generateHomeSEO(featuredGames, topCategories, latestGames);
    console.log(`步骤4完成: 首页SEO生成完成，成功: ${homeResult.success}`);
    
    const endTime = new Date();
    const processingTime = endTime.getTime() - startTime.getTime();
    
    const summary = {
      totalProcessed: gameResults.length + categoryResults.length + tagResults.length + 1,
      totalSuccessful: 
        gameResults.filter(r => r.success).length +
        categoryResults.filter(r => r.success).length +
        tagResults.filter(r => r.success).length +
        (homeResult.success ? 1 : 0),
      totalFailed: 
        gameResults.filter(r => !r.success).length +
        categoryResults.filter(r => !r.success).length +
        tagResults.filter(r => !r.success).length +
        (homeResult.success ? 0 : 1),
      processingTime
    };
    
    // 生成汇总报告
    if (this.config.generateProgressReport) {
      await this.generateSummaryReport({
        games: gameResults,
        categories: categoryResults,
        tags: tagResults,
        home: homeResult,
        summary
      });
    }
    
    console.log(`SEO数据集生成完成: ${summary.totalSuccessful} 成功, ${summary.totalFailed} 失败, 耗时 ${processingTime}ms`);
    
    return {
      games: gameResults,
      categories: categoryResults,
      tags: tagResults,
      home: homeResult,
      summary
    };
  }

  /**
   * 处理单个批次
   * @param batch 批次数据
   * @param type 数据类型
   * @param outputDir 输出目录
   * @returns 批次处理结果
   */
  private async processBatch(
    batch: any[],
    type: 'game' | 'category' | 'tag',
    outputDir: string
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    
    // 使用并发处理提高效率
    const chunks = this.chunkArray(batch, this.config.concurrency);
    
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      console.log(`  处理子批次 ${chunkIndex + 1}/${chunks.length} (${chunk.length} 个${type === 'game' ? '游戏' : type === 'category' ? '分类' : '标签'})...`);
      
      const chunkPromises = chunk.map(async (item) => {
        try {
          let seoData: any;
          let fileName: string;
          
          switch (type) {
            case 'game':
              seoData = this.generator.generateGameSEO(item);
              fileName = `${item.slug || item.id}.json`;
              break;
            case 'category':
              seoData = this.generator.generateCategorySEO(item.category, item.count || 0);
              fileName = `${item.category}.json`;
              break;
            case 'tag':
              seoData = this.generator.generateTagSEO(item, []);
              fileName = `${item.tag}.json`;
              break;
            default:
              throw new Error(`Unknown type: ${type}`);
          }
          
          // 质量检查
          if (this.config.enableQualityCheck) {
            const qualityScore = await this.qualityChecker.checkSEOData(seoData, type);
            if (qualityScore < 0.6) {
              return {
                success: false,
                error: `质量分数过低: ${qualityScore}`,
                qualityScore
              };
            }
          }
          
          // 保存文件
          const filePath = path.join(outputDir, fileName);
          await fs.writeFile(filePath, JSON.stringify(seoData, null, 2), 'utf-8');
          
          return {
            success: true,
            filePath,
            qualityScore: this.config.enableQualityCheck ? 
              await this.qualityChecker.checkSEOData(seoData, type) : undefined
          };
          
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      const chunkSuccessful = chunkResults.filter(r => r.success).length;
      const chunkFailed = chunkResults.filter(r => !r.success).length;
      console.log(`  子批次 ${chunkIndex + 1} 完成: ${chunkSuccessful} 成功, ${chunkFailed} 失败`);
      
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * 构建相关标签映射
   * @param tagsData 标签数据数组
   * @returns 相关标签映射
   */
  private buildRelatedTagsMap(tagsData: any[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    
    // 简单的相关性算法：基于标签名称的相似性
    tagsData.forEach(tagData => {
      const relatedTags = tagsData
        .filter(other => other.tag !== tagData.tag)
        .filter(other => this.calculateTagSimilarity(tagData.tag, other.tag) > 0.3)
        .sort((a, b) => this.calculateTagSimilarity(tagData.tag, b.tag) - 
                       this.calculateTagSimilarity(tagData.tag, a.tag))
        .slice(0, 5)
        .map(other => other.tag);
      
      map[tagData.tag] = relatedTags;
    });
    
    return map;
  }

  /**
   * 计算标签相似性
   * @param tag1 标签1
   * @param tag2 标签2
   * @returns 相似性分数 (0-1)
   */
  private calculateTagSimilarity(tag1: string, tag2: string): number {
    const words1 = tag1.toLowerCase().split('-');
    const words2 = tag2.toLowerCase().split('-');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  /**
   * 生成汇总报告
   * @param results 生成结果
   */
  private async generateSummaryReport(results: any): Promise<void> {
    const reportPath = path.join(this.config.outputDir, 'generation-report.json');
    const report = {
      generatedAt: new Date().toISOString(),
      config: this.config,
      results: {
        games: {
          total: results.games.length,
          successful: results.games.filter((r: any) => r.success).length,
          failed: results.games.filter((r: any) => !r.success).length,
          averageQualityScore: this.calculateAverageQualityScore(results.games)
        },
        categories: {
          total: results.categories.length,
          successful: results.categories.filter((r: any) => r.success).length,
          failed: results.categories.filter((r: any) => !r.success).length,
          averageQualityScore: this.calculateAverageQualityScore(results.categories)
        },
        tags: {
          total: results.tags.length,
          successful: results.tags.filter((r: any) => r.success).length,
          failed: results.tags.filter((r: any) => !r.success).length,
          averageQualityScore: this.calculateAverageQualityScore(results.tags)
        },
        home: {
          successful: results.home.success,
          qualityScore: results.home.qualityScore
        }
      },
      summary: results.summary
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`生成报告已保存到: ${reportPath}`);
  }

  /**
   * 计算平均质量分数
   * @param results 结果数组
   * @returns 平均质量分数
   */
  private calculateAverageQualityScore(results: GenerationResult[]): number {
    const scoresWithQuality = results.filter(r => r.qualityScore !== undefined);
    if (scoresWithQuality.length === 0) return 0;
    
    const totalScore = scoresWithQuality.reduce((sum, r) => sum + (r.qualityScore || 0), 0);
    return totalScore / scoresWithQuality.length;
  }

  /**
   * 将数组分块
   * @param array 原数组
   * @param chunkSize 块大小
   * @returns 分块后的数组
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 确保目录存在
   * @param dirPath 目录路径
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 加载JSON文件
   * @param filePath 文件路径
   * @returns JSON数据
   */
  private async loadJSONFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`无法加载文件 ${filePath}:`, error);
      return {};
    }
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 创建默认批量生成配置
 * @param outputDir 输出目录
 * @returns 默认配置
 */
export function createDefaultBatchConfig(outputDir: string): BatchGenerationConfig {
  return {
    outputDir,
    batchSize: 10, // 减少批次大小，避免程序看起来卡死
    enableQualityCheck: true,
    generateProgressReport: true,
    concurrency: 5,
    baseUrl: 'https://playbrowserminigames.com'
  };
}