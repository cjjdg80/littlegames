# 游戏查询API文档

## 概述

游戏查询API提供了强大的游戏数据查询和筛选功能，支持多种查询条件和索引优化。

## 功能特性

### 📊 数据统计
- **总游戏数**: 9,938个游戏
- **分类数**: 7个主要分类
- **标签数**: 695个不同标签
- **设备类型**: 3种设备支持（desktop, mobile, tablet）
- **开发者数**: 数百个游戏开发者

### 🔍 查询功能

#### 1. 基础查询
```javascript
// 分页查询
api.queryGames({ page: 1, limit: 20 })

// 按分类查询
api.queryGames({ category: 'arcade', limit: 10 })

// 搜索查询
api.queryGames({ search: 'puzzle', limit: 15 })
```

#### 2. 高级筛选
```javascript
// 标签筛选（交集）
api.queryGames({ 
  tags: ['arcade', 'action'], 
  limit: 10 
})

// 设备筛选（并集）
api.queryGames({ 
  devices: ['desktop', 'mobile'], 
  limit: 10 
})

// 开发者筛选
api.queryGames({ 
  developer: 'marketjs', 
  limit: 10 
})
```

#### 3. 多条件组合查询
```javascript
api.queryGames({
  category: 'puzzle',
  tags: ['brain', 'logic'],
  devices: ['desktop'],
  search: 'match',
  limit: 20,
  sort: 'latest'
})
```

### 📈 统计和推荐

#### 热门标签
```javascript
api.getPopularTags(10) // 获取前10个热门标签
```

#### 设备统计
```javascript
api.getDeviceStats() // 获取设备兼容性统计
```

#### 开发者统计
```javascript
api.getDeveloperStats(20) // 获取前20个热门开发者
```

#### 标签推荐
```javascript
api.getGamesByTags(['arcade', 'action'], 15) // 基于标签推荐游戏
```

### 🎯 查询参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `page` | number | 页码 | 1 |
| `limit` | number | 每页游戏数 | 50 |
| `category` | string | 分类筛选 | - |
| `tags` | string[] | 标签筛选（交集） | - |
| `devices` | string[] | 设备筛选（并集） | - |
| `developer` | string | 开发者筛选 | - |
| `search` | string | 搜索关键词 | - |
| `featured` | boolean | 仅推荐游戏 | false |
| `sort` | string | 排序方式（latest/oldest） | 'latest' |

### 📱 支持的设备类型

- **desktop**: 桌面端游戏（9,938个）
- **mobile**: 移动端游戏
- **tablet**: 平板端游戏

### 🎮 主要游戏分类

1. **arcade** - 街机游戏（最热门）
2. **puzzle** - 益智游戏
3. **action** - 动作游戏
4. **adventure** - 冒险游戏
5. **strategy** - 策略游戏
6. **sports** - 体育游戏
7. **racing** - 赛车游戏

### 🏷️ 热门标签

- **arcade** - 街机类游戏
- **puzzle** - 益智类游戏
- **action** - 动作类游戏
- **adventure** - 冒险类游戏
- **strategy** - 策略类游戏

### 👨‍💻 热门开发者

1. **yad.com** - 292个游戏
2. **bestgames.com** - 292个游戏
3. **lof games** - 253个游戏
4. **marketjs** - 228个游戏
5. **kiz10.com** - 223个游戏

## 返回数据格式

### 查询结果
```javascript
{
  games: [
    {
      id: 9938,
      title: "Game Title",
      slug: "game-title",
      thumbnail: "thumbnail_url",
      primary_category: "arcade",
      batch_number: 1,
      featured: false
    }
  ],
  pagination: {
    current_page: 1,
    total_pages: 199,
    total_games: 9938,
    games_per_page: 50,
    has_next: true,
    has_prev: false
  },
  filters: {
    category: "arcade",
    tags: ["action"],
    devices: ["desktop"],
    developer: null,
    search: null,
    featured: false
  }
}
```

### 游戏详情
```javascript
{
  id: 9938,
  title: "Capybara Go!",
  slug: "capybara-go",
  description: "Game description...",
  instructions: "Mouse click or tap to play",
  thumbnail: "thumbnail_url",
  iframe_src: "game_url",
  width: "800",
  height: "600",
  primary_category: "adventure",
  genres: ["adventure", "casual"],
  tags: ["animal", "adventure"],
  publisher: "Publisher Name",
  mobile_compatible: "yes",
  languages: ["en"],
  batch_number: 1,
  featured: false
}
```

## 性能优化

### 索引结构
- **游戏索引**: 轻量级游戏列表，支持快速分页
- **分类索引**: 按分类预计算的游戏ID列表
- **标签索引**: 按标签预计算的游戏ID列表
- **设备索引**: 按设备类型预计算的游戏ID列表
- **开发者索引**: 按开发者预计算的游戏ID列表

### 查询优化
- 使用预计算索引，避免实时筛选
- 支持多条件交集和并集查询
- 分页数据按需加载
- 游戏按ID降序排列（最新在前）

## 使用示例

```javascript
const gameAPI = require('./gameQueryAPI');

// 初始化API
await gameAPI.initialize();

// 获取最新的街机游戏
const arcadeGames = await gameAPI.queryGames({
  category: 'arcade',
  limit: 10,
  sort: 'latest'
});

// 获取支持移动端的益智游戏
const mobilePuzzleGames = await gameAPI.queryGames({
  category: 'puzzle',
  devices: ['mobile'],
  limit: 15
});

// 搜索包含"match"的游戏
const matchGames = await gameAPI.queryGames({
  search: 'match',
  limit: 20
});

// 获取热门标签
const popularTags = await gameAPI.getPopularTags(10);

// 基于标签推荐游戏
const recommendedGames = await gameAPI.getGamesByTags(['puzzle', 'brain'], 10);
```

## 文件结构

```
scripts/processed/
├── games-index.json          # 游戏索引
├── category-index.json       # 分类索引
├── tags-index.json          # 标签索引
├── devices-index.json       # 设备索引
├── developers-index.json    # 开发者索引
├── pagination-config.json   # 分页配置
├── featured-games.json      # 推荐游戏
├── category-stats.json      # 分类统计
├── tags-stats.json         # 标签统计
└── games/                  # 分页游戏数据
    ├── page-1.json
    ├── page-2.json
    └── ...
```

## 注意事项

1. **初始化**: 使用API前必须先调用 `initialize()` 方法
2. **内存使用**: 索引数据会加载到内存中，确保有足够内存
3. **数据更新**: 重新运行 `gameDataReorganizer.ts` 可更新所有索引
4. **查询性能**: 复杂查询可能需要更多时间，建议合理设置limit
5. **标签筛选**: 多个标签使用交集逻辑（AND）
6. **设备筛选**: 多个设备使用并集逻辑（OR）