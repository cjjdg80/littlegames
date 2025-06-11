// scripts/data-processing/gameDataReorganizer.ts
// 游戏数据重新整理器 - 基于采集顺序重新分配ID，优化查询性能

import fs from 'fs';
import path from 'path';

/**
 * 批次文件中的游戏数据结构
 */
interface BatchGameData {
  basic_info: {
    id: string;
    name: string;
    url: string;
    company: string;
    collected_at: string;
    global_id?: number;
  };
  extraction_time?: string;
  url?: string;
  game_info?: {
    title: string;
    publisher: string;
    publisher_url: string;
    mobile_compatible: string;
    languages: string[];
    gender_tags: string[];
    age_groups: string[];
  };
  genres?: string[];
  tags?: string[];
  thumbnails?: Array<{
    url: string;
    size: string;
    alt: string;
  }>;
  iframe_code?: {
    full_code: string;
    src: string;
    width: string;
    height: string;
  };
  description?: string;
  instructions?: string;
  game_id?: {
    global_id: number;
    batch_id: number;
    extraction_order: number;
  };
}

/**
 * 批次文件结构
 */
interface BatchFile {
  metadata: {
    batch_number: number;
    total_games: number;
    created_at: string;
    game_id_range: {
      start_id: number;
      end_id: number;
    };
    extraction_info: {
      success_count: number;
      total_processed: number;
    };
  };
  games: BatchGameData[];
}

/**
 * 重新整理后的游戏数据（轻量级）
 */
interface ReorganizedGame {
  id: number;           // 新的连续ID（最新游戏ID最大）
  slug: string;         // SEO友好的URL slug
  title: string;
  description: string;
  instructions: string; // 游戏操作说明
  thumbnail: string;
  iframe_src: string;
  iframe_width: number;
  iframe_height: number;
  primary_category: string;  // 主分类（用于分片）
  all_categories: string[];  // 所有分类（用于搜索）
  tags: string[];
  devices: string[];
  developer: string;
  batch_number: number;      // 原始批次号
  collection_time: string;   // 采集时间
  featured: boolean;
}

/**
 * 轻量级游戏索引（用于快速查询）
 */
interface GameIndex {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  primary_category: string;
  batch_number: number;
  featured: boolean;
}

/**
 * 分类索引
 */
interface CategoryIndex {
  [category: string]: {
    count: number;
    game_ids: number[];  // 该分类下的游戏ID列表（按ID降序）
  };
}

/**
 * 标签索引
 */
interface TagsIndex {
  [tag: string]: {
    count: number;
    game_ids: number[];  // 包含该标签的游戏ID列表（按ID降序）
  };
}

/**
 * 设备索引
 */
interface DevicesIndex {
  [device: string]: {
    count: number;
    game_ids: number[];  // 支持该设备的游戏ID列表（按ID降序）
  };
}

/**
 * 开发者索引
 */
interface DevelopersIndex {
  [developer: string]: {
    count: number;
    game_ids: number[];  // 该开发者的游戏ID列表（按ID降序）
  };
}

/**
 * 分页配置
 */
interface PaginationConfig {
  total_games: number;
  games_per_page: number;
  total_pages: number;
  latest_game_id: number;
  oldest_game_id: number;
}

/**
 * 游戏数据重新整理器
 */
class GameDataReorganizer {
  private batchesDir: string;
  private outputDir: string;
  private gamesPerChunk: number;

  constructor() {
    this.batchesDir = 'scripts/output/batches';
    this.outputDir = 'scripts/processed';
    this.gamesPerChunk = 50; // 每个分片50个游戏，确保文件大小适中
  }

  /**
   * 生成SEO友好的slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-')         // 空格替换为连字符
      .replace(/-+/g, '-')          // 多个连字符合并为一个
      .trim()
      .replace(/^-|-$/g, '');       // 移除首尾连字符
  }

  /**
   * 确定主分类（取第一个分类）
   */
  private getPrimaryCategory(genres: string[]): string {
    const categoryMap: { [key: string]: string } = {
      'adventure': 'adventure',
      'action': 'action',
      'puzzle': 'puzzle',
      'strategy': 'strategy',
      'sports': 'sports',
      'racing': 'racing',
      'arcade': 'arcade',
      'simulation': 'simulation',
      'casual': 'casual'
    };

    const firstGenre = genres[0]?.toLowerCase() || 'arcade';
    return categoryMap[firstGenre] || 'arcade';
  }

  /**
   * 确定支持的设备类型
   */
  private getDeviceTypes(mobileCompatible: string): string[] {
    const devices = ['desktop'];
    if (mobileCompatible && mobileCompatible.toLowerCase().includes('mobile')) {
      devices.push('mobile', 'tablet');
    }
    return devices;
  }

  /**
   * 读取所有批次文件并按顺序整理
   */
  async reorganizeData(): Promise<void> {
    try {
      console.log('🚀 开始重新整理游戏数据...');
      
      // 读取所有批次文件
      const batchFiles = fs.readdirSync(this.batchesDir)
        .filter(file => file.startsWith('games_batch_') && file.endsWith('.json'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB; // 按批次号升序排列
        });

      console.log(`📁 找到 ${batchFiles.length} 个批次文件`);
      console.log(`📋 批次顺序: ${batchFiles.slice(0, 3).join(', ')} ... ${batchFiles.slice(-2).join(', ')}`);

      // 收集所有游戏数据
      const allGames: BatchGameData[] = [];
      const batchInfo: Array<{ batchNumber: number; gameCount: number; startIndex: number; endIndex: number }> = [];

      for (const batchFile of batchFiles) {
        const filePath = path.join(this.batchesDir, batchFile);
        console.log(`📖 读取批次文件: ${batchFile}`);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const batchData: BatchFile = JSON.parse(fileContent);
        
        const startIndex = allGames.length;
        allGames.push(...batchData.games);
        const endIndex = allGames.length - 1;
        
        batchInfo.push({
          batchNumber: batchData.metadata.batch_number,
          gameCount: batchData.games.length,
          startIndex,
          endIndex
        });
        
        console.log(`  ✅ 批次 ${batchData.metadata.batch_number}: ${batchData.games.length} 个游戏`);
      }

      console.log(`🎮 总计收集到 ${allGames.length} 个游戏`);
      console.log(`📊 数据顺序: 索引0是最新游戏，索引${allGames.length-1}是最老游戏`);

      // 重新分配ID：最新游戏ID最大
      console.log('🔢 重新分配游戏ID...');
      const reorganizedGames: ReorganizedGame[] = [];
      const gameIndex: GameIndex[] = [];
      const categoryIndex: CategoryIndex = {};
      const tagsIndex: TagsIndex = {};
      const devicesIndex: DevicesIndex = {};
      const developersIndex: DevelopersIndex = {};

      allGames.forEach((game, index) => {
        // 新ID：最新游戏（index=0）获得最大ID
        const newId = allGames.length - index;
        
        // 安全获取游戏标题
        const gameTitle = game.game_info?.title || game.basic_info?.name || 'Unknown Game';
        const gameGenres = game.genres || [];
        
        const slug = this.generateSlug(gameTitle);
        const primaryCategory = this.getPrimaryCategory(gameGenres);
        const devices = this.getDeviceTypes(game.game_info?.mobile_compatible || '');
        
        // 确定游戏来自哪个批次
        const batchNumber = batchInfo.find(batch => 
          index >= batch.startIndex && index <= batch.endIndex
        )?.batchNumber || 1;
        
        const reorganizedGame: ReorganizedGame = {
          id: newId,
          slug,
          title: gameTitle,
          description: game.description || `Play ${gameTitle} online for free. ${gameGenres.join(', ')} game.`,
          instructions: game.instructions || 'Click or tap to play',
          thumbnail: game.thumbnails?.[0]?.url || '',
          iframe_src: game.iframe_code?.src || '',
          iframe_width: parseInt(game.iframe_code?.width || '800') || 800,
          iframe_height: parseInt(game.iframe_code?.height || '600') || 600,
          primary_category: primaryCategory,
          all_categories: gameGenres.map(g => g.toLowerCase()),
          tags: game.tags || [],
          devices,
          developer: game.game_info?.publisher || game.basic_info?.company || 'Unknown',
          batch_number: batchNumber,
          collection_time: game.basic_info?.collected_at || '',
          featured: index < 20 // 前20个（最新的）设为推荐
        };

        reorganizedGames.push(reorganizedGame);

        // 创建轻量级索引
        gameIndex.push({
          id: newId,
          slug,
          title: gameTitle,
          thumbnail: game.thumbnails?.[0]?.url || '',
          primary_category: primaryCategory,
          batch_number: batchNumber,
          featured: reorganizedGame.featured
        });

        // 更新分类索引
        if (!categoryIndex[primaryCategory]) {
          categoryIndex[primaryCategory] = { count: 0, game_ids: [] };
        }
        categoryIndex[primaryCategory].count++;
        categoryIndex[primaryCategory].game_ids.push(newId);

        // 更新标签索引
        reorganizedGame.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase().trim();
          if (normalizedTag) {
            if (!tagsIndex[normalizedTag]) {
              tagsIndex[normalizedTag] = { count: 0, game_ids: [] };
            }
            tagsIndex[normalizedTag].count++;
            tagsIndex[normalizedTag].game_ids.push(newId);
          }
        });

        // 更新设备索引
        reorganizedGame.devices.forEach(device => {
          const normalizedDevice = device.toLowerCase().trim();
          if (normalizedDevice) {
            if (!devicesIndex[normalizedDevice]) {
              devicesIndex[normalizedDevice] = { count: 0, game_ids: [] };
            }
            devicesIndex[normalizedDevice].count++;
            devicesIndex[normalizedDevice].game_ids.push(newId);
          }
        });

        // 更新开发者索引
        const normalizedDeveloper = reorganizedGame.developer.toLowerCase().trim();
        if (normalizedDeveloper && normalizedDeveloper !== 'unknown') {
          if (!developersIndex[normalizedDeveloper]) {
            developersIndex[normalizedDeveloper] = { count: 0, game_ids: [] };
          }
          developersIndex[normalizedDeveloper].count++;
          developersIndex[normalizedDeveloper].game_ids.push(newId);
        }
      });

      // 对所有索引中的游戏ID按降序排列（最新游戏在前）
      Object.values(categoryIndex).forEach(category => {
        category.game_ids.sort((a, b) => b - a);
      });
      Object.values(tagsIndex).forEach(tag => {
        tag.game_ids.sort((a, b) => b - a);
      });
      Object.values(devicesIndex).forEach(device => {
        device.game_ids.sort((a, b) => b - a);
      });
      Object.values(developersIndex).forEach(developer => {
        developer.game_ids.sort((a, b) => b - a);
      });

      console.log(`✅ ID重新分配完成: 最新游戏ID=${allGames.length}, 最老游戏ID=1`);

      // 创建输出目录
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // 保存完整游戏数据（按分类分片）
      console.log('💾 保存分类数据分片...');
      const gamesDir = path.join(this.outputDir, 'games');
      if (!fs.existsSync(gamesDir)) {
        fs.mkdirSync(gamesDir, { recursive: true });
      }

      // 按分类分组并保存
      const gamesByCategory: { [category: string]: ReorganizedGame[] } = {};
      reorganizedGames.forEach(game => {
        if (!gamesByCategory[game.primary_category]) {
          gamesByCategory[game.primary_category] = [];
        }
        gamesByCategory[game.primary_category].push(game);
      });

      // 对每个分类内的游戏按ID降序排列（最新在前）
      Object.entries(gamesByCategory).forEach(([category, games]) => {
        games.sort((a, b) => b.id - a.id);
        
        const categoryDir = path.join(gamesDir, category);
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }

        // 分片保存
        const chunks = this.chunkArray(games, this.gamesPerChunk);
        chunks.forEach((chunk, index) => {
          const filename = `page-${index + 1}.json`;
          const filepath = path.join(categoryDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(chunk, null, 2));
        });

        console.log(`  ✅ ${category}: ${games.length} 个游戏，分为 ${chunks.length} 个分片`);
      });

      // 保存轻量级索引文件
      console.log('📇 保存索引文件...');
      
      // 1. 完整游戏索引（按ID降序）
      gameIndex.sort((a, b) => b.id - a.id);
      const indexPath = path.join(this.outputDir, 'games-index.json');
      fs.writeFileSync(indexPath, JSON.stringify(gameIndex, null, 2));

      // 2. 分类索引
      const categoryIndexPath = path.join(this.outputDir, 'category-index.json');
      fs.writeFileSync(categoryIndexPath, JSON.stringify(categoryIndex, null, 2));

      // 3. 标签索引
      const tagsIndexPath = path.join(this.outputDir, 'tags-index.json');
      fs.writeFileSync(tagsIndexPath, JSON.stringify(tagsIndex, null, 2));

      // 4. 设备索引
      const devicesIndexPath = path.join(this.outputDir, 'devices-index.json');
      fs.writeFileSync(devicesIndexPath, JSON.stringify(devicesIndex, null, 2));

      // 5. 开发者索引
      const developersIndexPath = path.join(this.outputDir, 'developers-index.json');
      fs.writeFileSync(developersIndexPath, JSON.stringify(developersIndex, null, 2));

      // 6. 分页配置
      const paginationConfig: PaginationConfig = {
        total_games: allGames.length,
        games_per_page: this.gamesPerChunk,
        total_pages: Math.ceil(allGames.length / this.gamesPerChunk),
        latest_game_id: allGames.length,
        oldest_game_id: 1
      };
      const paginationPath = path.join(this.outputDir, 'pagination-config.json');
      fs.writeFileSync(paginationPath, JSON.stringify(paginationConfig, null, 2));

      // 7. 推荐游戏列表（最新的20个）
      const featuredGames = gameIndex.filter(game => game.featured);
      const featuredPath = path.join(this.outputDir, 'featured-games.json');
      fs.writeFileSync(featuredPath, JSON.stringify(featuredGames, null, 2));

      // 8. 综合统计信息
      const categoryStats = {
        total_categories: Object.keys(categoryIndex).length,
        categories: Object.entries(categoryIndex).map(([name, info]) => ({
          name,
          count: info.count,
          percentage: ((info.count / allGames.length) * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count)
      };
      const categoryStatsPath = path.join(this.outputDir, 'category-stats.json');
      fs.writeFileSync(categoryStatsPath, JSON.stringify(categoryStats, null, 2));

      // 9. 标签统计信息（只保存游戏数量>=5的标签）
      const popularTags = Object.entries(tagsIndex)
        .filter(([_, info]) => info.count >= 5)
        .map(([name, info]) => ({
          name,
          count: info.count,
          percentage: ((info.count / allGames.length) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);
      const tagsStatsPath = path.join(this.outputDir, 'tags-stats.json');
      fs.writeFileSync(tagsStatsPath, JSON.stringify({
        total_tags: Object.keys(tagsIndex).length,
        popular_tags: popularTags
      }, null, 2));

      // 输出统计信息
      console.log('🎉 数据重新整理完成！');
      console.log('📊 统计信息:');
      console.log(`  - 总游戏数: ${allGames.length}`);
      console.log(`  - ID范围: ${allGames.length} (最新) → 1 (最老)`);
      console.log(`  - 分类数量: ${Object.keys(categoryIndex).length}`);
      console.log(`  - 标签数量: ${Object.keys(tagsIndex).length}`);
      console.log(`  - 设备类型: ${Object.keys(devicesIndex).length}`);
      console.log(`  - 开发者数量: ${Object.keys(developersIndex).length}`);
      console.log(`  - 推荐游戏: ${featuredGames.length}`);
      console.log('📋 各分类统计:');
      Object.entries(categoryIndex).forEach(([category, info]) => {
        console.log(`  - ${category}: ${info.count} 个游戏`);
      });
      console.log('🏷️ 热门标签 (>=10个游戏):');
      Object.entries(tagsIndex)
        .filter(([_, info]) => info.count >= 10)
        .sort(([_, a], [__, b]) => b.count - a.count)
        .slice(0, 10)
        .forEach(([tag, info]) => {
          console.log(`  - ${tag}: ${info.count} 个游戏`);
        });
      console.log('📱 设备兼容性统计:');
      Object.entries(devicesIndex).forEach(([device, info]) => {
        console.log(`  - ${device}: ${info.count} 个游戏`);
      });
      console.log('📁 输出文件:');
      console.log(`  - 游戏索引: ${indexPath}`);
      console.log(`  - 分类索引: ${categoryIndexPath}`);
      console.log(`  - 标签索引: ${tagsIndexPath}`);
      console.log(`  - 设备索引: ${devicesIndexPath}`);
      console.log(`  - 开发者索引: ${developersIndexPath}`);
      console.log(`  - 分页配置: ${paginationPath}`);
      console.log(`  - 推荐游戏: ${featuredPath}`);
      console.log(`  - 分类统计: ${categoryStatsPath}`);
      console.log(`  - 标签统计: ${tagsStatsPath}`);
      console.log(`  - 分类数据: ${gamesDir}/`);

    } catch (error) {
      console.error('❌ 数据重新整理失败:', error);
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

// 执行数据重新整理
if (require.main === module) {
  const reorganizer = new GameDataReorganizer();
  reorganizer.reorganizeData().catch(console.error);
}

export default GameDataReorganizer;