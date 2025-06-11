// scripts/data-processing/gameDataValidator.ts
// 游戏数据验证脚本 - 验证URL、iframe代码和图片资源的有效性

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

/**
 * 游戏数据验证器
 * 功能：验证游戏URL、iframe代码和图片资源的有效性
 */
class GameDataValidator {
  private inputFile: string;
  private outputDir: string;
  private validationResults: ValidationResults;
  private batchSize: number = 50; // 批量处理大小，避免过多并发请求
  private requestDelay: number = 100; // 请求间隔（毫秒）

  constructor() {
    this.inputFile = path.join(__dirname, '../output/all_games_extracted.json');
    this.outputDir = path.join(__dirname, '../processed');
    this.validationResults = {
      total: 0,
      valid: 0,
      invalid: 0,
      validGames: [],
      invalidGames: [],
      validationSummary: {
        urlValidation: { passed: 0, failed: 0 },
        iframeValidation: { passed: 0, failed: 0 },
        imageValidation: { passed: 0, failed: 0 }
      }
    };
  }

  /**
   * 主验证流程
   */
  async validateAllGames(): Promise<void> {
    console.log('🚀 开始游戏数据验证...');
    
    try {
      // 读取游戏数据
      const games = await this.loadGamesData();
      console.log(`📊 总共需要验证 ${games.length} 个游戏`);
      
      this.validationResults.total = games.length;
      
      // 分批验证游戏
      await this.validateGamesBatch(games);
      
      // 生成验证报告
      await this.generateValidationReport();
      
      // 更新索引文件（移除无效游戏）
      await this.updateIndexFiles();
      
      console.log('✅ 游戏数据验证完成！');
      this.printValidationSummary();
      
    } catch (error) {
      console.error('❌ 验证过程中发生错误:', error);
      throw error;
    }
  }

  /**
   * 加载游戏数据
   */
  private async loadGamesData(): Promise<any[]> {
    // 读取游戏数据
    const gamesIndexPath = path.join(__dirname, '../processed/games-index.json');
    const gamesDetailsPath = path.join(__dirname, '../processed/games-with-details.json');

    let gamesData: any[];
    if (fs.existsSync(gamesDetailsPath)) {
      gamesData = JSON.parse(fs.readFileSync(gamesDetailsPath, 'utf-8'));
    } else if (fs.existsSync(gamesIndexPath)) {
      gamesData = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf-8'));
    } else if (fs.existsSync(this.inputFile)) {
      gamesData = JSON.parse(fs.readFileSync(this.inputFile, 'utf-8'));
    } else {
      console.error('❌ 未找到游戏数据文件');
      process.exit(1);
    }
    
    return gamesData;
  }

  /**
   * 分批验证游戏
   */
  private async validateGamesBatch(games: any[]): Promise<void> {
    const totalBatches = Math.ceil(games.length / this.batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * this.batchSize;
      const end = Math.min(start + this.batchSize, games.length);
      const batch = games.slice(start, end);
      
      console.log(`🔍 验证批次 ${i + 1}/${totalBatches} (${start + 1}-${end})`);
      
      // 并行验证当前批次的游戏
      const batchPromises = batch.map(game => this.validateSingleGame(game));
      await Promise.all(batchPromises);
      
      // 批次间延迟，避免请求过于频繁
      if (i < totalBatches - 1) {
        await this.delay(this.requestDelay * 5);
      }
    }
  }

  /**
   * 验证单个游戏
   */
  private async validateSingleGame(game: any): Promise<void> {
    const validationResult: GameValidationResult = {
      id: game.id,
      name: game.name,
      url: game.url,
      isValid: true,
      issues: [],
      validationDetails: {
        urlValid: false,
        iframeValid: false,
        imageValid: false
      }
    };

    try {
      // 检查基本字段
      if (!game.id || !game.slug || !game.title) {
        validationResult.isValid = false;
        validationResult.issues.push('缺少基本游戏信息');
      }

      // 验证缩略图
      if (!game.thumbnail) {
        validationResult.validationDetails.imageValid = false;
        validationResult.issues.push('缺少游戏缩略图');
      } else {
        validationResult.validationDetails.imageValid = await this.validateImageUrl(game.thumbnail);
        if (!validationResult.validationDetails.imageValid) {
          validationResult.issues.push('游戏缩略图无法访问');
        }
      }

      // 对于基础索引数据，URL和iframe验证标记为通过
      // 因为这些数据将在后续阶段生成
      if (!game.url && !game.iframe_code) {
        // 基础索引数据，跳过URL和iframe验证
        validationResult.validationDetails.urlValid = true;
        validationResult.validationDetails.iframeValid = true;
      } else {
        // 如果有URL和iframe数据，则进行验证
        if (game.url) {
          validationResult.validationDetails.urlValid = await this.validateGameUrl(game.url);
          if (!validationResult.validationDetails.urlValid) {
            validationResult.issues.push('游戏URL无法访问');
            validationResult.isValid = false;
          }
        }

        if (game.iframe_code) {
          validationResult.validationDetails.iframeValid = this.validateIframeCode(game.iframe_code);
          if (!validationResult.validationDetails.iframeValid) {
            validationResult.issues.push('iframe代码格式无效');
            validationResult.isValid = false;
          }
        }
      }

      // 更新统计
      this.updateValidationStats(validationResult);
      
      // 对于基础索引数据，只要有基本信息和有效缩略图就认为是有效的
      if (!game.url && !game.iframe_code && game.id && game.slug && game.title && validationResult.validationDetails.imageValid) {
        validationResult.isValid = true;
        validationResult.issues = validationResult.issues.filter(issue => !issue.includes('缺少游戏缩略图') && !issue.includes('游戏缩略图无法访问'));
      }
      
      // 分类存储结果
      if (validationResult.isValid) {
        this.validationResults.valid++;
        this.validationResults.validGames.push(game);
      } else {
        this.validationResults.invalid++;
        this.validationResults.invalidGames.push({
          ...game,
          validationResult
        });
      }

      // 添加请求间隔
      await this.delay(this.requestDelay);
      
    } catch (error) {
      console.error(`验证游戏 ${game.name} 时发生错误:`, error);
      validationResult.isValid = false;
      validationResult.issues.push(`验证过程出错: ${error.message}`);
      this.validationResults.invalid++;
      this.validationResults.invalidGames.push({
        ...game,
        validationResult
      });
    }
  }

  /**
   * 验证游戏URL
   */
  private async validateGameUrl(url: string): Promise<boolean> {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 10000, // 10秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      return response.ok; // 200-299状态码
    } catch (error) {
      return false;
    }
  }

  /**
   * 验证iframe代码
   */
  private validateIframeCode(iframeCode: string): boolean {
    if (!iframeCode || typeof iframeCode !== 'string') {
      return false;
    }

    // 检查基本的iframe格式
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/i;
    const match = iframeCode.match(iframeRegex);
    
    if (!match) {
      return false;
    }

    // 检查src属性是否为有效URL
    const src = match[1];
    try {
      new URL(src);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证图片URL
   */
  private async validateImageUrl(imageUrl: string): Promise<boolean> {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        timeout: 8000, // 8秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        return false;
      }

      // 检查Content-Type是否为图片
      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : false;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * 更新验证统计
   */
  private updateValidationStats(result: GameValidationResult): void {
    if (result.validationDetails.urlValid) {
      this.validationResults.validationSummary.urlValidation.passed++;
    } else {
      this.validationResults.validationSummary.urlValidation.failed++;
    }

    if (result.validationDetails.iframeValid) {
      this.validationResults.validationSummary.iframeValidation.passed++;
    } else {
      this.validationResults.validationSummary.iframeValidation.failed++;
    }

    if (result.validationDetails.imageValid) {
      this.validationResults.validationSummary.imageValidation.passed++;
    } else {
      this.validationResults.validationSummary.imageValidation.failed++;
    }
  }

  /**
   * 生成验证报告
   */
  private async generateValidationReport(): Promise<void> {
    const reportPath = path.join(this.outputDir, 'validation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.validationResults.total,
        valid: this.validationResults.valid,
        invalid: this.validationResults.invalid,
        validPercentage: ((this.validationResults.valid / this.validationResults.total) * 100).toFixed(2)
      },
      validationDetails: this.validationResults.validationSummary,
      invalidGames: this.validationResults.invalidGames.map(game => ({
        id: game.id,
        name: game.name,
        url: game.url,
        issues: game.validationResult.issues
      }))
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 验证报告已生成: ${reportPath}`);
  }

  /**
   * 更新索引文件（移除无效游戏）
   */
  private async updateIndexFiles(): Promise<void> {
    // 保存有效游戏数据
    const validGamesPath = path.join(this.outputDir, 'valid-games.json');
    fs.writeFileSync(validGamesPath, JSON.stringify(this.validationResults.validGames, null, 2));
    
    console.log(`✅ 有效游戏数据已保存: ${validGamesPath}`);
    console.log(`📊 有效游戏数量: ${this.validationResults.valid}/${this.validationResults.total}`);
  }

  /**
   * 打印验证摘要
   */
  private printValidationSummary(): void {
    console.log('\n📊 验证结果摘要:');
    console.log(`总游戏数: ${this.validationResults.total}`);
    console.log(`有效游戏: ${this.validationResults.valid} (${((this.validationResults.valid / this.validationResults.total) * 100).toFixed(2)}%)`);
    console.log(`无效游戏: ${this.validationResults.invalid} (${((this.validationResults.invalid / this.validationResults.total) * 100).toFixed(2)}%)`);
    
    console.log('\n🔍 详细验证统计:');
    console.log(`URL验证 - 通过: ${this.validationResults.validationSummary.urlValidation.passed}, 失败: ${this.validationResults.validationSummary.urlValidation.failed}`);
    console.log(`iframe验证 - 通过: ${this.validationResults.validationSummary.iframeValidation.passed}, 失败: ${this.validationResults.validationSummary.iframeValidation.failed}`);
    console.log(`图片验证 - 通过: ${this.validationResults.validationSummary.imageValidation.passed}, 失败: ${this.validationResults.validationSummary.imageValidation.failed}`);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 类型定义
interface ValidationResults {
  total: number;
  valid: number;
  invalid: number;
  validGames: any[];
  invalidGames: any[];
  validationSummary: {
    urlValidation: { passed: number; failed: number };
    iframeValidation: { passed: number; failed: number };
    imageValidation: { passed: number; failed: number };
  };
}

interface GameValidationResult {
  id: string;
  name: string;
  url: string;
  isValid: boolean;
  issues: string[];
  validationDetails: {
    urlValid: boolean;
    iframeValid: boolean;
    imageValid: boolean;
  };
}

// 主执行函数
async function main() {
  const validator = new GameDataValidator();
  
  try {
    await validator.validateAllGames();
    console.log('🎉 数据验证任务完成！');
  } catch (error) {
    console.error('❌ 数据验证失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { GameDataValidator };