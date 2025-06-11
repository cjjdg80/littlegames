// scripts/data-processing/gameDataSplitter.ts - 游戏数据分片处理脚本
import fs from 'fs';
import path from 'path';

/**
 * 原始游戏数据接口（从爬虫数据转换）
 */
interface RawGameData {
  basic_info: {
    id: string;
    name: string;
    url: string;
    company: string;
    collected_at: string;
  };
  game_info: {
    title: string;
    publisher: string;
    publisher_url: string;
    mobile_compatible: string;
    languages: string[];
    gender_tags: string[];
    age_groups: string[];
  };
  genres: string[];
  tags: string[];
  thumbnails: Array<{
    url: string;
    size: string;
    alt: string;
  }>;
  iframe_code: {
    full_code: string;
    src: string;
    width: string;
    height: string;
  };
  description: string;
  instructions: string;
}

/**
 * 整个JSON文件的结构接口
 */
interface GameDataFile {
  metadata: {
    total_games: number;
    last_updated: string;
    extraction_info: {
      success_count: number;
      total_processed: number;
    };
  };
  games: RawGameData[];
}

/**
 * 处理后的游戏数据接口
 */
interface ProcessedGame {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  iframe: {
    src: string;
    width: number;
    height: number;
  };
  category: string;
  tags: string[];
  devices: string[];
  developer: string;
  featured: boolean;
  createdAt: string;
  // 新增字段：顺序控制
  originalIndex: number;  // 原始顺序编号（0为最新，数字越大越老）
  collectionOrder: number; // 采集顺序编号（与originalIndex相同）
  generationPriority: number; // 生成优先级（数字越小越先生成，确保老游戏先生成）
}

/**
 * 游戏索引接口
 */
interface GameIndex {
  id: string;
  name: string;
  category: string;
  slug: string;
  thumbnail: string;
  originalIndex: number; // 新增：原始顺序
  generationPriority: number; // 新增：生成优先级
}

/**
 * 生成配置接口
 */
interface GenerationConfig {
  totalGames: number;
  oldestFirst: boolean;
  categories: Array<{
    category: string;
    count: number;
    oldestGameIndex: number;
    newestGameIndex: number;
    generationOrder: Array<{
      id: string;
      slug: string;
      originalIndex: number;
      generationPriority: number;
    }>;
  }>;
}

/**
 * 数据分片处理器类
 */
class GameDataSplitter {
  private inputFile: string;
  private outputDir: string;
  private gamesPerChunk: number;

  constructor() {
    // 使用最小测试文件
    this.inputFile = 'scripts/output/games_test_minimal.json';
    this.outputDir = 'scripts/processed';
    this.gamesPerChunk = 50;
  }
  
  /**
   * 生成SEO友好的slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .trim()
      .replace(/^-|-$/g, ''); // 移除首尾连字符
  }

  /**
   * 映射游戏分类
   */
  private mapCategory(genres: string[]): string {
    const categoryMap: { [key: string]: string } = {
      'adventure': 'adventure',
      'action': 'action',
      'puzzle': 'puzzle',
      'strategy': 'strategy',
      'sports': 'sports',
      'racing': 'racing',
      'arcade': 'arcade',
      'simulation': 'simulation'
    };

    // 取第一个匹配的分类，如果没有匹配则默认为arcade
    const firstGenre = genres[0]?.toLowerCase() || 'arcade';
    return categoryMap[firstGenre] || 'arcade';
  }

  /**
   * 确定支持的设备类型
   */
  private getDeviceTypes(mobileCompatible: string): string[] {
    const devices = ['desktop']; // 默认支持桌面
    
    if (mobileCompatible && mobileCompatible.toLowerCase().includes('mobile')) {
      devices.push('mobile', 'tablet');
    }
    
    return devices;
  }

  /**
   * 转换原始游戏数据为处理后的格式
   * @param rawGame 原始游戏数据
   * @param index 在原始数组中的索引位置
   * @param totalGames 游戏总数
   */
  private transformGame(rawGame: RawGameData, index: number, totalGames: number): ProcessedGame {
    const slug = this.generateSlug(rawGame.game_info.title);
    const category = this.mapCategory(rawGame.genres);
    const devices = this.getDeviceTypes(rawGame.game_info.mobile_compatible);
    
    // 计算生成优先级：最老的游戏优先级最高（数字最小）
    // index=0是最新游戏，index=totalGames-1是最老游戏
    // 生成优先级：最老游戏=0，最新游戏=totalGames-1
    const generationPriority = totalGames - index - 1;
    
    return {
      id: rawGame.basic_info.id,
      slug,
      title: rawGame.game_info.title,
      description: rawGame.description || `Play ${rawGame.game_info.title} online for free. ${rawGame.genres.join(', ')} game.`,
      thumbnail: rawGame.thumbnails[0]?.url || '',
      iframe: {
        src: rawGame.iframe_code.src,
        width: parseInt(rawGame.iframe_code.width) || 800,
        height: parseInt(rawGame.iframe_code.height) || 600
      },
      category,
      tags: rawGame.tags || [],
      devices,
      developer: rawGame.game_info.publisher || rawGame.basic_info.company || 'Unknown',
      featured: false, // 后续可以根据规则设置
      createdAt: rawGame.basic_info.collected_at,
      // 新增字段：顺序控制
      originalIndex: index, // 原始数组中的位置（0为最新）
      collectionOrder: index, // 采集顺序（与originalIndex相同）
      generationPriority: generationPriority // 生成优先级（老游戏优先）
    };
  }

  /**
   * 处理数据分片
   */
  async processData(): Promise<void> {
    try {
      console.log('🚀 开始处理游戏数据...');
      console.log('📖 读取原始数据文件...');
      
      const absolutePath = path.resolve(this.inputFile);
      console.log('📁 输入文件路径:', absolutePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`文件不存在: ${absolutePath}`);
      }
      
      // 获取文件信息
      const stats = fs.statSync(absolutePath);
      console.log('📊 文件大小:', Math.round(stats.size / 1024), 'KB');
      
      // 使用更安全的方式读取文件
      let fileContent: string;
      try {
        fileContent = fs.readFileSync(absolutePath, { encoding: 'utf8', flag: 'r' });
      } catch (readError) {
        console.log('❌ 文件读取失败，尝试其他编码...');
        fileContent = fs.readFileSync(absolutePath, { encoding: 'utf8' });
      }
      
      console.log('📄 文件内容长度:', fileContent.length);
      console.log('📝 文件开头:', fileContent.substring(0, 100));
      console.log('📝 文件结尾:', fileContent.substring(fileContent.length - 100));
      
      // 检查文件内容是否为空
      if (!fileContent.trim()) {
        throw new Error('文件内容为空');
      }
      
      // 清理文件内容（移除可能的BOM和其他不可见字符）
      const cleanContent = fileContent.replace(/^\uFEFF/, '').trim();
      console.log('🧹 清理后内容长度:', cleanContent.length);
      console.log('🔍 清理后开头字符:', cleanContent.charAt(0), '(ASCII:', cleanContent.charCodeAt(0), ')');
      console.log('🔍 清理后结尾字符:', cleanContent.charAt(cleanContent.length - 1), '(ASCII:', cleanContent.charCodeAt(cleanContent.length - 1), ')');
      
      console.log('🔍 开始解析 JSON...');
      
      // 尝试解析JSON
      let gameDataFile: GameDataFile;
      try {
        gameDataFile = JSON.parse(cleanContent);
      } catch (parseError) {
        console.log('❌ JSON 解析失败，详细错误信息:');
        console.log('错误:', parseError);
        
        // 尝试找到 JSON 错误的具体位置
        const lines = cleanContent.split('\n');
        console.log('📄 文件总行数:', lines.length);
        
        // 检查最后几行是否有问题
        console.log('📝 最后5行内容:');
        for (let i = Math.max(0, lines.length - 5); i < lines.length; i++) {
          console.log(`行 ${i + 1}: "${lines[i]}"`);
        }
        
        throw parseError;
      }
      
      console.log('✅ JSON 解析成功!');
      console.log('🎮 游戏总数:', gameDataFile.metadata?.total_games || '未知');
      
      const games: RawGameData[] = gameDataFile.games || [];
      
      console.log(`📊 找到 ${games.length} 个游戏`);
      console.log(`📅 游戏顺序: 第0个是最新的，第${games.length-1}个是最老的`);
      
      // 转换数据格式（保持原始顺序，添加顺序编号）
      console.log('🔄 转换数据格式并添加顺序编号...');
      const processedGames: ProcessedGame[] = games.map((game, index) => 
        this.transformGame(game, index, games.length)
      );
      
      // 按分类分组
      console.log('📂 按分类分组游戏...');
      const gamesByCategory: { [category: string]: ProcessedGame[] } = {};
      const gameIndex: GameIndex[] = [];
      
      processedGames.forEach(game => {
        // 分类分组
        if (!gamesByCategory[game.category]) {
          gamesByCategory[game.category] = [];
        }
        gamesByCategory[game.category].push(game);
        
        // 创建索引
        gameIndex.push({
          id: game.id,
          name: game.title,
          category: game.category,
          slug: game.slug,
          thumbnail: game.thumbnail,
          originalIndex: game.originalIndex,
          generationPriority: game.generationPriority
        });
      });
      
      // 对每个分类内的游戏按生成优先级排序（确保老游戏先生成）
      console.log('🔄 按生成优先级排序各分类游戏...');
      Object.keys(gamesByCategory).forEach(category => {
        gamesByCategory[category].sort((a, b) => a.generationPriority - b.generationPriority);
        console.log(`  - ${category}: 已按生成优先级排序 (${gamesByCategory[category].length}个游戏)`);
      });
      
      // 创建输出目录
      const gamesDir = path.join(this.outputDir, 'games');
      if (!fs.existsSync(gamesDir)) {
        fs.mkdirSync(gamesDir, { recursive: true });
      }
      
      // 保存按分类分组的数据
      console.log('💾 保存分类数据...');
      for (const [category, categoryGames] of Object.entries(gamesByCategory)) {
        const categoryDir = path.join(gamesDir, category);
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }
        
        // 将分类内的游戏进一步分片（已按生成优先级排序）
        const chunks = this.chunkArray(categoryGames, this.gamesPerChunk);
        chunks.forEach((chunk, index) => {
          const filename = `games-${index + 1}.json`;
          const filepath = path.join(categoryDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(chunk, null, 2));
        });
        
        console.log(`✅ ${category}: ${categoryGames.length} 个游戏，分为 ${chunks.length} 个文件`);
      }
      
      // 保存游戏索引（按生成优先级排序）
      console.log('📇 保存游戏索引...');
      gameIndex.sort((a, b) => a.generationPriority - b.generationPriority);
      const indexPath = path.join(this.outputDir, 'games-index.json');
      fs.writeFileSync(indexPath, JSON.stringify(gameIndex, null, 2));
      
      // 保存分类统计
      const categoryStats = Object.entries(gamesByCategory).map(([category, games]) => ({
        category,
        count: games.length,
        chunks: Math.ceil(games.length / this.gamesPerChunk)
      }));
      
      const statsPath = path.join(this.outputDir, 'category-stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(categoryStats, null, 2));
      
      // 保存生成顺序配置
      console.log('🎯 保存生成顺序配置...');
      const generationConfig: GenerationConfig = {
        totalGames: games.length,
        oldestFirst: true, // 标记：老游戏优先生成
        categories: Object.entries(gamesByCategory).map(([category, categoryGames]) => ({
          category,
          count: categoryGames.length,
          oldestGameIndex: Math.max(...categoryGames.map(g => g.originalIndex)),
          newestGameIndex: Math.min(...categoryGames.map(g => g.originalIndex)),
          generationOrder: categoryGames.map(g => ({
            id: g.id,
            slug: g.slug,
            originalIndex: g.originalIndex,
            generationPriority: g.generationPriority
          }))
        }))
      };
      
      const configPath = path.join(this.outputDir, 'generation-config.json');
      fs.writeFileSync(configPath, JSON.stringify(generationConfig, null, 2));
      
      console.log('🎉 数据处理完成！');
      console.log('📊 统计信息:');
      categoryStats.forEach(stat => {
        console.log(`  - ${stat.category}: ${stat.count} 个游戏 (${stat.chunks} 个文件)`);
      });
      
      console.log('🎯 生成顺序配置已保存');
      console.log('📋 各分类生成顺序:');
      generationConfig.categories.forEach(cat => {
        console.log(`  - ${cat.category}: ${cat.count}个游戏，从第${cat.oldestGameIndex}个到第${cat.newestGameIndex}个`);
      });
      
    } catch (error) {
      console.error('❌ 数据处理失败:', error);
      throw error;
    }
  }
  
  /**
   * 数组分片工具函数
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// 执行数据处理
if (require.main === module) {
  const splitter = new GameDataSplitter();
  splitter.processData().catch(console.error);
}

export default GameDataSplitter;