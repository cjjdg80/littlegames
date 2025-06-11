# 游戏数据处理系统

## 概述

本系统将原始的34个批次文件重新整理为高效的查询结构，解决了编号乱序问题，并提供了快速的数据查询API。

## 数据重新整理结果

### 编号策略
- **最新游戏ID最大**：ID 9938（批次1中的第一个游戏）
- **最老游戏ID最小**：ID 1（批次34中的最后一个游戏）
- **连续编号**：无跳号，便于分页和查询

### 数据统计
- 总游戏数：9,938个
- 分类数量：7个
- 推荐游戏：20个（最新的游戏）
- 分页配置：每页50个游戏，共199页

### 分类分布
```
arcade: 4,530个游戏 (45.6%)
casual: 2,415个游戏 (24.3%)
puzzle: 1,412个游戏 (14.2%)
adventure: 1,101个游戏 (11.1%)
simulation: 274个游戏 (2.8%)
strategy: 111个游戏 (1.1%)
sports: 95个游戏 (1.0%)
```

## 文件结构

```
scripts/processed/
├── games-index.json          # 轻量级游戏索引（用于列表显示）
├── category-index.json       # 分类索引（快速分类查询）
├── pagination-config.json    # 分页配置
├── featured-games.json       # 推荐游戏列表
└── games/                    # 分类数据分片
    ├── arcade/
    │   ├── page-1.json       # 最新的50个arcade游戏
    │   ├── page-2.json
    │   └── ...
    ├── casual/
    ├── puzzle/
    └── ...
```

## 使用方法

### 1. 数据重新整理

```bash
# 重新处理所有批次文件
npx tsx scripts/data-processing/gameDataReorganizer.ts
```

### 2. 查询API使用

```typescript
import gameAPI from './scripts/data-processing/gameQueryAPI';

// 初始化API
await gameAPI.initialize();

// 获取最新游戏
const latestGames = await gameAPI.getLatestGames(10);
console.log('最新游戏:', latestGames);

// 分页查询
const pageResult = await gameAPI.queryGames({
  page: 1,
  limit: 20,
  category: 'arcade'
});

// 搜索游戏
const searchResult = await gameAPI.searchGames('puzzle');

// 获取游戏详情
const gameDetail = await gameAPI.getGameById(9938);
```

### 3. 常用查询示例

#### 首页显示最新游戏
```typescript
// 获取最新20个游戏用于首页展示
const featuredGames = await gameAPI.getFeaturedGames(20);
```

#### 分类页面
```typescript
// 获取arcade分类的第一页游戏
const arcadeGames = await gameAPI.queryGames({
  category: 'arcade',
  page: 1,
  limit: 50
});
```

#### 搜索功能
```typescript
// 搜索包含"puzzle"的游戏
const searchResults = await gameAPI.searchGames('puzzle', 30);
```

#### 随机推荐
```typescript
// 获取随机游戏用于"你可能喜欢"功能
const randomGames = await gameAPI.getRandomGames(10);
```

## 性能优化特点

### 1. 轻量级索引
- `games-index.json`：仅包含必要字段，用于列表显示
- 文件大小：约2MB（相比原始30MB+大幅减少）

### 2. 按需加载
- 游戏详情按分类分片存储
- 每个分片50个游戏，文件大小适中
- 只在需要时加载具体分片

### 3. 快速查询
- 分类索引支持O(1)分类查询
- ID连续编号支持高效分页
- 内存缓存索引数据

### 4. SEO友好
- 每个游戏都有唯一的slug
- ID从大到小表示新旧程度
- 支持按时间排序的URL结构

## 前端集成建议

### 1. 路由结构
```
/                          # 首页（推荐游戏）
/games                     # 游戏列表（最新在前）
/games/page/2              # 分页
/games/category/arcade     # 分类页面
/games/category/arcade/page/2  # 分类分页
/game/9938/capybara-go     # 游戏详情页
/search?q=puzzle           # 搜索结果
```

### 2. 数据加载策略
```typescript
// 首页：加载推荐游戏
const featuredGames = await gameAPI.getFeaturedGames();

// 列表页：分页加载
const { games, pagination } = await gameAPI.queryGames({ page });

// 详情页：按需加载
const gameDetail = await gameAPI.getGameBySlug(slug);
```

### 3. 缓存策略
- 索引数据：启动时加载，内存缓存
- 游戏详情：按需加载，可设置LRU缓存
- 搜索结果：可设置短期缓存

## 扩展功能

### 1. 添加新游戏
新游戏应该获得比当前最大ID更大的ID，确保时间顺序正确。

### 2. 标签系统
可以基于现有的`tags`字段实现标签筛选功能。

### 3. 评分系统
可以在游戏数据中添加评分字段，支持按评分排序。

### 4. 播放统计
可以添加播放次数统计，实现热门游戏推荐。

## 注意事项

1. **数据一致性**：重新整理数据后，确保前端代码使用新的ID系统
2. **缓存更新**：数据更新后需要清理相关缓存
3. **备份策略**：重要的索引文件建议定期备份
4. **监控性能**：关注查询API的响应时间和内存使用