// scripts/generate-latest-200-games.ts - 生成最新200个游戏的数据文件
// 功能说明: 从游戏数据中提取最新200个游戏，生成用于静态页面生成的数据文件

import fs from 'fs';
import path from 'path';

interface GameData {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  primary_category: string;
  batch_number: number;
  featured: boolean;
  iframe_src?: string;
  description?: string;
  tags?: string[];
  developer?: string;
  collection_time?: string;
}

interface GameLinksConfig {
  relatedGames: GameData[];
  discoverMoreGames: GameData[];
  featuredGames: GameData[];
}

class Latest200GamesGenerator {
  private gamesData: GameData[] = [];
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'src/data');
  }

  /**
   * 加载游戏数据
   */
  private async loadGamesData(): Promise<void> {
    console.log('📖 加载游戏数据...');
    
    try {
      // 从处理后的数据文件加载
      const gamesIndexPath = path.join(process.cwd(), 'scripts/processed/games-index.json');
      
      if (!fs.existsSync(gamesIndexPath)) {
        throw new Error('游戏索引文件不存在，请先运行数据处理脚本');
      }
      
      const gamesIndexData = fs.readFileSync(gamesIndexPath, 'utf-8');
      this.gamesData = JSON.parse(gamesIndexData);
      
      console.log(`✅ 成功加载 ${this.gamesData.length} 个游戏数据`);
    } catch (error) {
      console.error('❌ 加载游戏数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成最新200个游戏数据
   */
  private generateLatest200Games(): GameData[] {
    console.log('🔢 生成最新200个游戏...');
    
    // 按ID降序排序，获取最新200个游戏
    const sortedGames = this.gamesData
      .sort((a, b) => b.id - a.id)
      .slice(0, 200);
    
    console.log(`✅ 生成了最新 ${sortedGames.length} 个游戏`);
    
    // 统计分类分布
    const categoryStats: Record<string, number> = {};
    sortedGames.forEach(game => {
      categoryStats[game.primary_category] = (categoryStats[game.primary_category] || 0) + 1;
    });
    
    console.log('📊 分类分布:', categoryStats);
    
    return sortedGames;
  }

  /**
   * 为每个游戏生成内链推荐
   */
  private generateGameLinksConfig(games: GameData[]): Record<string, GameLinksConfig> {
    console.log('🔗 生成游戏内链配置...');
    
    const gameLinksConfig: Record<string, GameLinksConfig> = {};
    
    games.forEach((currentGame, index) => {
      // Related Games: 同分类的6个游戏（排除当前游戏）
      const relatedGames = games
        .filter(game => 
          game.primary_category === currentGame.primary_category && 
          game.id !== currentGame.id
        )
        .slice(0, 6);
      
      // Discover More Games: 6-8个不同分类的游戏（确保内链互联）
      const discoverMoreGames = this.generateDiscoverMoreGames(currentGame, games, index);
      
      // Featured Games: 精选游戏（featured=true的游戏）
      const featuredGames = games
        .filter(game => game.featured && game.id !== currentGame.id)
        .slice(0, 4);
      
      gameLinksConfig[currentGame.id.toString()] = {
        relatedGames,
        discoverMoreGames,
        featuredGames
      };
    });
    
    console.log(`✅ 为 ${games.length} 个游戏生成了内链配置`);
    return gameLinksConfig;
  }

  /**
   * 生成Discover More Games区域的推荐（确保相互内链）
   */
  private generateDiscoverMoreGames(currentGame: GameData, allGames: GameData[], currentIndex: number): GameData[] {
    const discoverMoreCount = Math.random() > 0.5 ? 6 : 8; // 随机6-8个游戏
    const discoverMoreGames: GameData[] = [];
    
    // 策略1: 选择相邻的游戏（确保相互推荐）
    const adjacentGames = [];
    
    // 前面的游戏
    for (let i = Math.max(0, currentIndex - 3); i < currentIndex; i++) {
      if (allGames[i] && allGames[i].id !== currentGame.id) {
        adjacentGames.push(allGames[i]);
      }
    }
    
    // 后面的游戏
    for (let i = currentIndex + 1; i < Math.min(allGames.length, currentIndex + 4); i++) {
      if (allGames[i] && allGames[i].id !== currentGame.id) {
        adjacentGames.push(allGames[i]);
      }
    }
    
    // 添加相邻游戏
    discoverMoreGames.push(...adjacentGames.slice(0, Math.floor(discoverMoreCount / 2)));
    
    // 策略2: 添加不同分类的热门游戏
    const otherCategoryGames = allGames
      .filter(game => 
        game.primary_category !== currentGame.primary_category && 
        game.id !== currentGame.id &&
        !discoverMoreGames.some(g => g.id === game.id)
      )
      .sort((a, b) => {
        // 优先featured游戏
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.id - a.id; // 然后按ID降序
      })
      .slice(0, discoverMoreCount - discoverMoreGames.length);
    
    discoverMoreGames.push(...otherCategoryGames);
    
    // 确保数量符合要求
    return discoverMoreGames.slice(0, discoverMoreCount);
  }

  /**
   * 保存生成的数据文件
   */
  private async saveDataFiles(games: GameData[], gameLinksConfig: Record<string, GameLinksConfig>): Promise<void> {
    console.log('💾 保存数据文件...');
    
    try {
      // 保存最新200个游戏数据
      const latest200Path = path.join(this.outputDir, 'latest-200-games.json');
      fs.writeFileSync(latest200Path, JSON.stringify(games, null, 2));
      console.log(`✅ 保存最新200个游戏数据: ${latest200Path}`);
      
      // 保存游戏内链配置
      const gameLinksConfigPath = path.join(this.outputDir, 'game-links-config-200.json');
      const configData = {
        metadata: {
          total_games: games.length,
          generated_at: new Date().toISOString(),
          version: '1.0.0',
          description: 'Game links configuration for latest 200 games'
        },
        links: gameLinksConfig
      };
      fs.writeFileSync(gameLinksConfigPath, JSON.stringify(configData, null, 2));
      console.log(`✅ 保存游戏内链配置: ${gameLinksConfigPath}`);
      
      // 生成统计报告
      const stats = {
        total_games: games.length,
        categories: [...new Set(games.map(g => g.primary_category))],
        featured_games: games.filter(g => g.featured).length,
        links_per_game: {
          related_avg: Object.values(gameLinksConfig).reduce((sum, config) => sum + config.relatedGames.length, 0) / games.length,
          discover_more_avg: Object.values(gameLinksConfig).reduce((sum, config) => sum + config.discoverMoreGames.length, 0) / games.length,
          featured_avg: Object.values(gameLinksConfig).reduce((sum, config) => sum + config.featuredGames.length, 0) / games.length
        },
        generated_at: new Date().toISOString()
      };
      
      const statsPath = path.join(this.outputDir, 'latest-200-games-stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
      console.log(`✅ 保存统计报告: ${statsPath}`);
      
    } catch (error) {
      console.error('❌ 保存数据文件失败:', error);
      throw error;
    }
  }

  /**
   * 执行生成流程
   */
  public async generate(): Promise<void> {
    console.log('🚀 开始生成最新200个游戏数据...\n');
    
    try {
      // 1. 加载游戏数据
      await this.loadGamesData();
      
      // 2. 生成最新200个游戏
      const latest200Games = this.generateLatest200Games();
      
      // 3. 生成内链配置
      const gameLinksConfig = this.generateGameLinksConfig(latest200Games);
      
      // 4. 保存数据文件
      await this.saveDataFiles(latest200Games, gameLinksConfig);
      
      console.log('\n🎉 最新200个游戏数据生成完成！');
      console.log('📁 生成的文件:');
      console.log('   - src/data/latest-200-games.json');
      console.log('   - src/data/game-links-config-200.json');
      console.log('   - src/data/latest-200-games-stats.json');
      
    } catch (error) {
      console.error('\n❌ 生成失败:', error);
      process.exit(1);
    }
  }
}

// 执行生成
if (require.main === module) {
  const generator = new Latest200GamesGenerator();
  generator.generate();
}

export default Latest200GamesGenerator; 