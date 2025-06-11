import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  timestamp: string;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    validPercentage: string;
  };
  validationDetails: {
    structureValidation: {
      passed: number;
      failed: number;
    };
    thumbnailValidation: {
      passed: number;
      failed: number;
    };
  };
  invalidGames: Array<{
    id: number;
    issues: string[];
  }>;
}

class QuickGameDataValidator {
  private validGames: any[] = [];
  private invalidGames: any[] = [];
  private stats = {
    structureValidation: { passed: 0, failed: 0 },
    thumbnailValidation: { passed: 0, failed: 0 }
  };

  async validateAllGames(): Promise<void> {
    console.log('🚀 开始快速游戏数据验证...');
    
    // 读取游戏数据
    const gamesData = this.loadGamesData();
    console.log(`📊 总共需要验证 ${gamesData.length} 个游戏`);

    // 验证每个游戏
    for (let i = 0; i < gamesData.length; i++) {
      const game = gamesData[i];
      const result = this.validateGame(game);
      
      if (result.isValid) {
        this.validGames.push(game);
      } else {
        this.invalidGames.push({
          id: game.id,
          issues: result.issues
        });
      }

      // 显示进度
      if ((i + 1) % 1000 === 0 || i === gamesData.length - 1) {
        console.log(`🔍 已验证 ${i + 1}/${gamesData.length} 个游戏`);
      }
    }

    // 生成报告
    await this.generateReport();
    await this.saveValidGames();
    
    console.log('✅ 快速游戏数据验证完成！\n');
    this.printSummary(gamesData.length);
  }

  private loadGamesData(): any[] {
    const gamesIndexPath = path.join(__dirname, '../processed/games-index.json');
    const gamesDetailsPath = path.join(__dirname, '../processed/games-with-details.json');

    let gamesData: any[];
    if (fs.existsSync(gamesDetailsPath)) {
      gamesData = JSON.parse(fs.readFileSync(gamesDetailsPath, 'utf-8'));
      console.log('📖 使用详细游戏数据文件');
    } else if (fs.existsSync(gamesIndexPath)) {
      gamesData = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf-8'));
      console.log('📖 使用基础游戏索引文件');
    } else {
      console.error('❌ 未找到游戏数据文件');
      process.exit(1);
    }
    
    return gamesData;
  }

  private validateGame(game: any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    let isValid = true;

    // 验证基本结构
    if (!game.id || typeof game.id !== 'number') {
      issues.push('缺少有效的游戏ID');
      isValid = false;
      this.stats.structureValidation.failed++;
    } else {
      this.stats.structureValidation.passed++;
    }

    if (!game.slug || typeof game.slug !== 'string' || game.slug.trim() === '') {
      issues.push('缺少有效的游戏slug');
      isValid = false;
    }

    if (!game.title || typeof game.title !== 'string' || game.title.trim() === '') {
      issues.push('缺少有效的游戏标题');
      isValid = false;
    }

    if (!game.primary_category || typeof game.primary_category !== 'string') {
      issues.push('缺少有效的游戏分类');
      isValid = false;
    }

    // 验证缩略图URL格式
    if (!game.thumbnail || typeof game.thumbnail !== 'string') {
      issues.push('缺少游戏缩略图URL');
      isValid = false;
      this.stats.thumbnailValidation.failed++;
    } else if (!this.isValidUrl(game.thumbnail)) {
      issues.push('游戏缩略图URL格式无效');
      isValid = false;
      this.stats.thumbnailValidation.failed++;
    } else {
      this.stats.thumbnailValidation.passed++;
    }

    return { isValid, issues };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  private async generateReport(): Promise<void> {
    const total = this.validGames.length + this.invalidGames.length;
    const validPercentage = total > 0 ? ((this.validGames.length / total) * 100).toFixed(2) : '0.00';

    const report: ValidationResult = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        valid: this.validGames.length,
        invalid: this.invalidGames.length,
        validPercentage
      },
      validationDetails: {
        structureValidation: this.stats.structureValidation,
        thumbnailValidation: this.stats.thumbnailValidation
      },
      invalidGames: this.invalidGames
    };

    const reportPath = path.join(__dirname, '../processed/quick-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 快速验证报告已生成: ${reportPath}`);
  }

  private async saveValidGames(): Promise<void> {
    const outputPath = path.join(__dirname, '../processed/validated-games.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.validGames, null, 2));
    console.log(`✅ 有效游戏数据已保存: ${outputPath}`);
    console.log(`📊 有效游戏数量: ${this.validGames.length}/${this.validGames.length + this.invalidGames.length}`);
  }

  private printSummary(total: number): void {
    const validCount = this.validGames.length;
    const invalidCount = this.invalidGames.length;
    const validPercentage = total > 0 ? ((validCount / total) * 100).toFixed(2) : '0.00';
    const invalidPercentage = total > 0 ? ((invalidCount / total) * 100).toFixed(2) : '0.00';

    console.log('📊 验证结果摘要:');
    console.log(`总游戏数: ${total}`);
    console.log(`有效游戏: ${validCount} (${validPercentage}%)`);
    console.log(`无效游戏: ${invalidCount} (${invalidPercentage}%)\n`);

    console.log('🔍 详细验证统计:');
    console.log(`结构验证 - 通过: ${this.stats.structureValidation.passed}, 失败: ${this.stats.structureValidation.failed}`);
    console.log(`缩略图验证 - 通过: ${this.stats.thumbnailValidation.passed}, 失败: ${this.stats.thumbnailValidation.failed}`);
    
    if (invalidCount > 0) {
      console.log('\n❌ 发现的主要问题:');
      const issueCount: { [key: string]: number } = {};
      this.invalidGames.forEach(game => {
        game.issues.forEach((issue: string) => {
          issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
      });
      
      Object.entries(issueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([issue, count]) => {
          console.log(`  - ${issue}: ${count} 个游戏`);
        });
    }
    
    console.log('🎉 快速数据验证任务完成！');
  }
}

// 执行验证
const validator = new QuickGameDataValidator();
validator.validateAllGames().catch(console.error);