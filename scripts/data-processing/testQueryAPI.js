// scripts/data-processing/testQueryAPI.js - 测试游戏查询API功能
const fs = require('fs');
const path = require('path');

// 模拟GameQueryAPI的核心功能
class SimpleGameQueryAPI {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'scripts', 'processed');
    this.gameIndex = [];
    this.categoryIndex = {};
    this.tagsIndex = {};
    this.devicesIndex = {};
    this.developersIndex = {};
    this.paginationConfig = {};
    this.featuredGames = [];
  }

  async initialize() {
    try {
      // 加载游戏索引
      const gamesIndexPath = path.join(this.dataDir, 'games-index.json');
      if (fs.existsSync(gamesIndexPath)) {
        this.gameIndex = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf8'));
      }

      // 加载分类索引
      const categoryIndexPath = path.join(this.dataDir, 'category-index.json');
      if (fs.existsSync(categoryIndexPath)) {
        this.categoryIndex = JSON.parse(fs.readFileSync(categoryIndexPath, 'utf8'));
      }

      // 加载标签索引
      const tagsIndexPath = path.join(this.dataDir, 'tags-index.json');
      if (fs.existsSync(tagsIndexPath)) {
        this.tagsIndex = JSON.parse(fs.readFileSync(tagsIndexPath, 'utf8'));
      }

      // 加载设备索引
      const devicesIndexPath = path.join(this.dataDir, 'devices-index.json');
      if (fs.existsSync(devicesIndexPath)) {
        this.devicesIndex = JSON.parse(fs.readFileSync(devicesIndexPath, 'utf8'));
      }

      // 加载开发者索引
      const developersIndexPath = path.join(this.dataDir, 'developers-index.json');
      if (fs.existsSync(developersIndexPath)) {
        this.developersIndex = JSON.parse(fs.readFileSync(developersIndexPath, 'utf8'));
      }

      // 加载分页配置
      const paginationConfigPath = path.join(this.dataDir, 'pagination-config.json');
      if (fs.existsSync(paginationConfigPath)) {
        this.paginationConfig = JSON.parse(fs.readFileSync(paginationConfigPath, 'utf8'));
      }

      // 加载推荐游戏
      const featuredGamesPath = path.join(this.dataDir, 'featured-games.json');
      if (fs.existsSync(featuredGamesPath)) {
        this.featuredGames = JSON.parse(fs.readFileSync(featuredGamesPath, 'utf8'));
      }

      console.log('✅ API初始化完成');
    } catch (error) {
      console.error('❌ API初始化失败:', error.message);
    }
  }

  // 获取热门标签
  getPopularTags(limit = 20) {
    return Object.entries(this.tagsIndex)
      .map(([name, info]) => ({ name, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // 获取设备统计
  getDeviceStats() {
    const totalGames = this.paginationConfig.total_games || 1;
    return Object.entries(this.devicesIndex)
      .map(([name, info]) => ({
        name,
        count: info.count,
        percentage: ((info.count / totalGames) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // 获取开发者统计
  getDeveloperStats(limit = 20) {
    return Object.entries(this.developersIndex)
      .map(([name, info]) => ({ name, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // 获取分类列表
  getCategories() {
    return Object.entries(this.categoryIndex)
      .map(([name, info]) => ({ name, count: info.count }))
      .sort((a, b) => b.count - a.count);
  }

  // 根据标签推荐游戏
  getGamesByTags(tags, limit = 20) {
    if (!tags || tags.length === 0) return [];
    
    const gameIdCounts = new Map();
    
    tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().trim();
      const gameIds = this.tagsIndex[normalizedTag]?.game_ids || [];
      gameIds.forEach(id => {
        gameIdCounts.set(id, (gameIdCounts.get(id) || 0) + 1);
      });
    });
    
    const sortedGameIds = Array.from(gameIdCounts.entries())
      .sort((a, b) => {
        if (a[1] !== b[1]) return b[1] - a[1];
        return b[0] - a[0];
      })
      .slice(0, limit)
      .map(([id]) => id);
    
    return this.gameIndex.filter(game => sortedGameIds.includes(game.id))
      .sort((a, b) => sortedGameIds.indexOf(a.id) - sortedGameIds.indexOf(b.id));
  }

  // 查询游戏
  queryGames(params = {}) {
    const {
      page = 1,
      limit = 50,
      category,
      tags,
      devices,
      developer,
      search,
      featured,
      sort = 'latest'
    } = params;

    let filteredGames = [...this.gameIndex];

    // 分类筛选
    if (category) {
      const categoryGameIds = this.categoryIndex[category]?.game_ids || [];
      filteredGames = filteredGames.filter(game => categoryGameIds.includes(game.id));
    }

    // 标签筛选（交集）
    if (tags && tags.length > 0) {
      const tagGameIds = tags.map(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        return this.tagsIndex[normalizedTag]?.game_ids || [];
      });
      
      if (tagGameIds.length > 0) {
        const intersection = tagGameIds.reduce((acc, curr) => 
          acc.filter(id => curr.includes(id))
        );
        filteredGames = filteredGames.filter(game => intersection.includes(game.id));
      }
    }

    // 设备筛选（并集）
    if (devices && devices.length > 0) {
      const deviceGameIds = new Set();
      devices.forEach(device => {
        const normalizedDevice = device.toLowerCase().trim();
        const gameIds = this.devicesIndex[normalizedDevice]?.game_ids || [];
        gameIds.forEach(id => deviceGameIds.add(id));
      });
      filteredGames = filteredGames.filter(game => deviceGameIds.has(game.id));
    }

    // 开发者筛选
    if (developer) {
      const normalizedDeveloper = developer.toLowerCase().trim();
      const developerGameIds = this.developersIndex[normalizedDeveloper]?.game_ids || [];
      filteredGames = filteredGames.filter(game => developerGameIds.includes(game.id));
    }

    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(searchLower) ||
        game.primary_category.toLowerCase().includes(searchLower)
      );
    }

    // 推荐游戏筛选
    if (featured) {
      const featuredIds = this.featuredGames.map(game => game.id);
      filteredGames = filteredGames.filter(game => featuredIds.includes(game.id));
    }

    // 排序
    if (sort === 'latest') {
      filteredGames.sort((a, b) => b.id - a.id);
    } else if (sort === 'oldest') {
      filteredGames.sort((a, b) => a.id - b.id);
    }

    // 分页
    const totalGames = filteredGames.length;
    const totalPages = Math.ceil(totalGames / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const games = filteredGames.slice(startIndex, endIndex);

    return {
      games,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_games: totalGames,
        games_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
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

  // 获取统计信息
  getStats() {
    return {
      total_games: this.paginationConfig.total_games || 0,
      categories: Object.keys(this.categoryIndex).length,
      tags: Object.keys(this.tagsIndex).length,
      devices: Object.keys(this.devicesIndex).length,
      developers: Object.keys(this.developersIndex).length,
      featured_games: this.featuredGames.length,
      latest_game_id: this.paginationConfig.latest_game_id || 0,
      oldest_game_id: this.paginationConfig.oldest_game_id || 0
    };
  }
}

// 测试函数
async function testAPI() {
  try {
    console.log('🧪 测试游戏查询API...');
    
    const api = new SimpleGameQueryAPI();
    await api.initialize();
    
    // 测试统计信息
    const stats = api.getStats();
    console.log('\n📊 统计信息:', {
      total_games: stats.total_games,
      categories: stats.categories,
      tags: stats.tags,
      devices: stats.devices,
      developers: stats.developers,
      featured_games: stats.featured_games
    });
    
    // 测试热门标签
    const popularTags = api.getPopularTags(10);
    console.log('\n🏷️ 热门标签:', popularTags);
    
    // 测试设备统计
    const deviceStats = api.getDeviceStats();
    console.log('\n📱 设备统计:', deviceStats);
    
    // 测试开发者统计
    const developerStats = api.getDeveloperStats(5);
    console.log('\n👨‍💻 热门开发者:', developerStats);
    
    // 测试分类列表
    const categories = api.getCategories();
    console.log('\n📂 分类列表:', categories);
    
    // 测试标签推荐
    if (popularTags.length > 0) {
      const tagGames = api.getGamesByTags([popularTags[0].name], 5);
      console.log(`\n🎯 "${popularTags[0].name}" 标签游戏:`, 
        tagGames.map(g => `${g.id}: ${g.title}`)
      );
    }
    
    // 测试分页查询
    const pageResult = api.queryGames({ page: 1, limit: 5 });
    console.log('\n📄 分页查询:', {
      games_count: pageResult.games.length,
      pagination: pageResult.pagination,
      first_game: pageResult.games[0] ? `${pageResult.games[0].id}: ${pageResult.games[0].title}` : 'None'
    });
    
    // 测试分类查询
    if (categories.length > 0) {
      const categoryResult = api.queryGames({ 
        category: categories[0].name, 
        limit: 3 
      });
      console.log(`\n🎯 ${categories[0].name} 分类游戏:`, 
        categoryResult.games.map(g => `${g.id}: ${g.title}`)
      );
    }
    
    // 测试多条件查询
    if (popularTags.length > 1) {
      const multiFilterResult = api.queryGames({
        tags: [popularTags[0].name],
        devices: ['desktop'],
        limit: 3
      });
      console.log('\n🔍 多条件查询结果:', {
        games_count: multiFilterResult.games.length,
        filters: multiFilterResult.filters,
        games: multiFilterResult.games.map(g => `${g.id}: ${g.title}`)
      });
    }
    
    // 测试搜索功能
    const searchResult = api.queryGames({ search: 'puzzle', limit: 3 });
    console.log('\n🔍 搜索"puzzle"结果:', {
      games_count: searchResult.games.length,
      games: searchResult.games.map(g => `${g.id}: ${g.title}`)
    });
    
    console.log('\n✅ API测试完成!');
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
}

testAPI();