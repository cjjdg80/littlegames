// scripts/data-processing/gameQueryAPI.ts
// 游戏数据查询API - 提供高效的数据查询接口

import fs from 'fs';
import path from 'path';

/**
 * 轻量级游戏索引
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
    game_ids: number[];
  };
}

/**
 * 标签索引
 */
interface TagsIndex {
  [tag: string]: {
    count: number;
    game_ids: number[];
  };
}

/**
 * 设备索引
 */
interface DevicesIndex {
  [device: string]: {
    count: number;
    game_ids: number[];
  };
}

/**
 * 开发者索引
 */
interface DevelopersIndex {
  [developer: string]: {
    count: number;
    game_ids: number[];
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
 * 查询参数
 */
interface QueryParams {
  page?: number;           // 页码（从1开始）
  category?: string;       // 分类筛选
  tags?: string[];         // 标签筛选（支持多个标签）
  devices?: string[];      // 设备类型筛选
  developer?: string;      // 开发者筛选
  search?: string;         // 搜索关键词
  featured?: boolean;      // 是否只显示推荐游戏
  limit?: number;          // 每页数量（默认50）
  sort?: 'newest' | 'oldest'; // 排序方式（默认newest）
}

/**
 * 查询结果
 */
interface QueryResult {
  games: GameIndex[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_games: number;
    has_next: boolean;
    has_prev: boolean;
    next_page?: number;
    prev_page?: number;
  };
  filters: {
    category?: string;
    tags?: string[];
    devices?: string[];
    developer?: string;
    search?: string;
    featured?: boolean;
  };
}

/**
 * 游戏详情查询结果
 */
interface GameDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  instructions: string;
  thumbnail: string;
  iframe_src: string;
  iframe_width: number;
  iframe_height: number;
  primary_category: string;
  all_categories: string[];
  tags: string[];
  devices: string[];
  developer: string;
  batch_number: number;
  collection_time: string;
  featured: boolean;
}

/**
 * 游戏查询API类
 */
class GameQueryAPI {
  private dataDir: string;
  private gameIndex: GameIndex[] = [];
  private categoryIndex: CategoryIndex = {};
  private tagsIndex: TagsIndex = {};
  private devicesIndex: DevicesIndex = {};
  private developersIndex: DevelopersIndex = {};
  private paginationConfig: PaginationConfig;
  private featuredGames: GameIndex[] = [];
  private isInitialized = false;

  constructor(dataDir: string = 'scripts/processed') {
    this.dataDir = path.join(process.cwd(), 'scripts', 'processed');
    this.paginationConfig = {
      total_games: 0,
      games_per_page: 50,
      total_pages: 0,
      latest_game_id: 0,
      oldest_game_id: 0
    };
  }

  /**
   * 初始化API，加载索引数据
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 初始化游戏查询API...');

      // 加载游戏索引
      const indexPath = path.join(this.dataDir, 'games-index.json');
      if (fs.existsSync(indexPath)) {
        this.gameIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        console.log(`📇 加载游戏索引: ${this.gameIndex.length} 个游戏`);
      }

      // 加载分类索引
      const categoryPath = path.join(this.dataDir, 'category-index.json');
      if (fs.existsSync(categoryPath)) {
        this.categoryIndex = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        console.log(`📂 加载分类索引: ${Object.keys(this.categoryIndex).length} 个分类`);
      }

      // 加载分页配置
      const paginationPath = path.join(this.dataDir, 'pagination-config.json');
      if (fs.existsSync(paginationPath)) {
        this.paginationConfig = JSON.parse(fs.readFileSync(paginationPath, 'utf8'));
        console.log(`📄 加载分页配置: ${this.paginationConfig.total_games} 个游戏`);
      }

      // 加载标签索引
      const tagsPath = path.join(this.dataDir, 'tags-index.json');
      if (fs.existsSync(tagsPath)) {
        this.tagsIndex = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
        console.log(`🏷️ 加载标签索引: ${Object.keys(this.tagsIndex).length} 个标签`);
      }

      // 加载设备索引
      const devicesPath = path.join(this.dataDir, 'devices-index.json');
      if (fs.existsSync(devicesPath)) {
        this.devicesIndex = JSON.parse(fs.readFileSync(devicesPath, 'utf8'));
        console.log(`📱 加载设备索引: ${Object.keys(this.devicesIndex).length} 个设备类型`);
      }

      // 加载开发者索引
      const developersPath = path.join(this.dataDir, 'developers-index.json');
      if (fs.existsSync(developersPath)) {
        this.developersIndex = JSON.parse(fs.readFileSync(developersPath, 'utf8'));
        console.log(`👨‍💻 加载开发者索引: ${Object.keys(this.developersIndex).length} 个开发者`);
      }

      // 加载推荐游戏
      const featuredPath = path.join(this.dataDir, 'featured-games.json');
      if (fs.existsSync(featuredPath)) {
        this.featuredGames = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
        console.log(`⭐ 加载推荐游戏: ${this.featuredGames.length} 个游戏`);
      }

      this.isInitialized = true;
      console.log('✅ API初始化完成');

    } catch (error) {
      console.error('❌ API初始化失败:', error);
      throw error;
    }
  }

  /**
   * 查询游戏列表
   */
  async queryGames(params: QueryParams = {}): Promise<QueryResult> {
    await this.initialize();

    const {
      page = 1,
      category,
      tags,
      devices,
      developer,
      search,
      featured,
      limit = this.paginationConfig.games_per_page,
      sort = 'newest'
    } = params;

    let filteredGames = [...this.gameIndex];

    // 应用筛选条件
    if (category) {
      filteredGames = filteredGames.filter(game => game.primary_category === category);
    }

    if (tags && tags.length > 0) {
      // 获取包含所有指定标签的游戏ID集合
      const tagGameIds = tags.map(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        return this.tagsIndex[normalizedTag]?.game_ids || [];
      });
      
      // 取交集：游戏必须包含所有指定的标签
      const intersectionIds = tagGameIds.reduce((acc, ids) => 
        acc.filter(id => ids.includes(id))
      );
      
      filteredGames = filteredGames.filter(game => intersectionIds.includes(game.id));
    }

    if (devices && devices.length > 0) {
      // 获取支持任一指定设备的游戏ID集合
      const deviceGameIds = new Set<number>();
      devices.forEach(device => {
        const normalizedDevice = device.toLowerCase().trim();
        const ids = this.devicesIndex[normalizedDevice]?.game_ids || [];
        ids.forEach(id => deviceGameIds.add(id));
      });
      
      filteredGames = filteredGames.filter(game => deviceGameIds.has(game.id));
    }

    if (developer) {
      const normalizedDeveloper = developer.toLowerCase().trim();
      const developerGameIds = this.developersIndex[normalizedDeveloper]?.game_ids || [];
      filteredGames = filteredGames.filter(game => developerGameIds.includes(game.id));
    }

    if (featured) {
      filteredGames = filteredGames.filter(game => game.featured);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(searchLower) ||
        game.primary_category.toLowerCase().includes(searchLower)
      );
    }

    // 应用排序
    if (sort === 'oldest') {
      filteredGames.sort((a, b) => a.id - b.id);
    } else {
      filteredGames.sort((a, b) => b.id - a.id); // 默认最新在前
    }

    // 计算分页
    const totalGames = filteredGames.length;
    const totalPages = Math.ceil(totalGames / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    return {
      games: paginatedGames,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_games: totalGames,
        has_next: page < totalPages,
        has_prev: page > 1,
        next_page: page < totalPages ? page + 1 : undefined,
        prev_page: page > 1 ? page - 1 : undefined
      },
      filters: {
        category,
        tags,
        devices,
        developer,
        search,
        featured
      }
    };
  }

  /**
   * 根据ID获取游戏详情
   */
  async getGameById(id: number): Promise<GameDetail | null> {
    await this.initialize();

    // 先从索引中找到游戏基本信息
    const gameIndex = this.gameIndex.find(game => game.id === id);
    if (!gameIndex) {
      return null;
    }

    // 根据分类和ID查找详细数据
    const category = gameIndex.primary_category;
    const gamesDir = path.join(this.dataDir, 'games', category);
    
    // 遍历该分类的所有分片文件
    const files = fs.readdirSync(gamesDir).filter(file => file.startsWith('page-'));
    
    for (const file of files) {
      const filePath = path.join(gamesDir, file);
      const games: GameDetail[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const game = games.find(g => g.id === id);
      if (game) {
        return game;
      }
    }

    return null;
  }

  /**
   * 根据slug获取游戏详情
   */
  async getGameBySlug(slug: string): Promise<GameDetail | null> {
    await this.initialize();

    const gameIndex = this.gameIndex.find(game => game.slug === slug);
    if (!gameIndex) {
      return null;
    }

    return this.getGameById(gameIndex.id);
  }

  /**
   * 获取分类列表
   */
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    await this.initialize();

    return Object.entries(this.categoryIndex).map(([name, info]) => ({
      name,
      count: info.count
    })).sort((a, b) => b.count - a.count); // 按游戏数量降序排列
  }

  /**
   * 获取推荐游戏
   */
  async getFeaturedGames(limit: number = 20): Promise<GameIndex[]> {
    await this.initialize();
    return this.featuredGames.slice(0, limit);
  }

  /**
   * 获取最新游戏
   */
  async getLatestGames(limit: number = 20): Promise<GameIndex[]> {
    await this.initialize();
    return this.gameIndex
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }

  /**
   * 获取随机游戏
   */
  async getRandomGames(limit: number = 20): Promise<GameIndex[]> {
    await this.initialize();
    
    const shuffled = [...this.gameIndex].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  /**
   * 搜索游戏
   */
  async searchGames(query: string, limit: number = 50): Promise<GameIndex[]> {
    await this.initialize();

    const queryLower = query.toLowerCase();
    return this.gameIndex
      .filter(game => 
        game.title.toLowerCase().includes(queryLower) ||
        game.primary_category.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => {
        // 优先显示标题匹配的游戏
        const aTitle = a.title.toLowerCase().includes(queryLower);
        const bTitle = b.title.toLowerCase().includes(queryLower);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        // 然后按ID降序（最新在前）
        return b.id - a.id;
      })
      .slice(0, limit);
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(limit: number = 20): Promise<Array<{ name: string; count: number }>> {
    await this.initialize();
    
    return Object.entries(this.tagsIndex)
      .map(([name, info]) => ({ name, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取设备统计
   */
  async getDeviceStats(): Promise<Array<{ name: string; count: number; percentage: string }>> {
    await this.initialize();
    
    const totalGames = this.paginationConfig.total_games;
    return Object.entries(this.devicesIndex)
      .map(([name, info]) => ({
        name,
        count: info.count,
        percentage: ((info.count / totalGames) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 获取开发者统计
   */
  async getDeveloperStats(limit: number = 20): Promise<Array<{ name: string; count: number }>> {
    await this.initialize();
    
    return Object.entries(this.developersIndex)
      .map(([name, info]) => ({ name, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 根据标签推荐相似游戏
   */
  async getGamesByTags(tags: string[], limit: number = 20): Promise<GameIndex[]> {
    await this.initialize();
    
    if (!tags || tags.length === 0) return [];
    
    // 获取包含任一标签的游戏ID
    const gameIdCounts = new Map<number, number>();
    
    tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().trim();
      const gameIds = this.tagsIndex[normalizedTag]?.game_ids || [];
      gameIds.forEach(id => {
        gameIdCounts.set(id, (gameIdCounts.get(id) || 0) + 1);
      });
    });
    
    // 按匹配标签数量排序，然后按游戏ID降序
    const sortedGameIds = Array.from(gameIdCounts.entries())
      .sort((a, b) => {
        if (a[1] !== b[1]) return b[1] - a[1]; // 匹配标签数量降序
        return b[0] - a[0]; // 游戏ID降序（最新在前）
      })
      .slice(0, limit)
      .map(([id]) => id);
    
    return this.gameIndex.filter(game => sortedGameIds.includes(game.id))
      .sort((a, b) => sortedGameIds.indexOf(a.id) - sortedGameIds.indexOf(b.id));
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    total_games: number;
    categories: number;
    tags: number;
    devices: number;
    developers: number;
    featured_games: number;
    latest_game_id: number;
    oldest_game_id: number;
    categories_detail: Array<{ name: string; count: number }>;
    popular_tags: Array<{ name: string; count: number }>;
    device_stats: Array<{ name: string; count: number; percentage: string }>;
  }> {
    await this.initialize();

    return {
      total_games: this.paginationConfig.total_games,
      categories: Object.keys(this.categoryIndex).length,
      tags: Object.keys(this.tagsIndex).length,
      devices: Object.keys(this.devicesIndex).length,
      developers: Object.keys(this.developersIndex).length,
      featured_games: this.featuredGames.length,
      latest_game_id: this.paginationConfig.latest_game_id,
      oldest_game_id: this.paginationConfig.oldest_game_id,
      categories_detail: await this.getCategories(),
      popular_tags: await this.getPopularTags(10),
      device_stats: await this.getDeviceStats()
    };
  }
}

// 导出单例实例
const gameAPI = new GameQueryAPI();

export default gameAPI;
export { GameQueryAPI, QueryParams, QueryResult, GameDetail, GameIndex };

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  async function test() {
    try {
      console.log('🧪 测试游戏查询API...');
      
      // 测试初始化
      await gameAPI.initialize();
      
      // 测试统计信息
      const stats = await gameAPI.getStats();
      console.log('📊 统计信息:', {
        total_games: stats.total_games,
        categories: stats.categories,
        tags: stats.tags,
        devices: stats.devices,
        developers: stats.developers,
        featured_games: stats.featured_games
      });
      
      // 测试热门标签
      const popularTags = await gameAPI.getPopularTags(10);
      console.log('🏷️ 热门标签:', popularTags);
      
      // 测试设备统计
      const deviceStats = await gameAPI.getDeviceStats();
      console.log('📱 设备统计:', deviceStats);
      
      // 测试开发者统计
      const developerStats = await gameAPI.getDeveloperStats(5);
      console.log('👨‍💻 热门开发者:', developerStats);
      
      // 测试标签推荐
      if (popularTags.length > 0) {
        const tagGames = await gameAPI.getGamesByTags([popularTags[0].name], 5);
        console.log(`🎯 "${popularTags[0].name}" 标签游戏:`, 
          tagGames.map(g => `${g.id}: ${g.title}`)
        );
      }
      
      // 测试查询最新游戏
      const latestGames = await gameAPI.getLatestGames(5);
      console.log('🆕 最新游戏:', latestGames.map(g => `${g.id}: ${g.title}`));
      
      // 测试分页查询
      const pageResult = await gameAPI.queryGames({ page: 1, limit: 10 });
      console.log('📄 分页查询:', {
        games_count: pageResult.games.length,
        pagination: pageResult.pagination
      });
      
      // 测试分类查询
      const categories = await gameAPI.getCategories();
      console.log('📂 分类列表:', categories);
      
      if (categories.length > 0) {
        const categoryResult = await gameAPI.queryGames({ 
          category: categories[0].name, 
          limit: 5 
        });
        console.log(`🎯 ${categories[0].name} 分类游戏:`, 
          categoryResult.games.map(g => `${g.id}: ${g.title}`)
        );
      }
      
      // 测试多条件查询
      if (popularTags.length > 1) {
        const multiFilterResult = await gameAPI.queryGames({
          tags: [popularTags[0].name, popularTags[1].name],
          devices: ['desktop'],
          limit: 5
        });
        console.log('🔍 多条件查询结果:', {
          games_count: multiFilterResult.games.length,
          filters: multiFilterResult.filters
        });
      }
      
      console.log('✅ API测试完成');
      
    } catch (error) {
      console.error('❌ API测试失败:', error);
    }
  }
  
  test();
}