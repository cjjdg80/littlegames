# GameMonetize增强版爬虫功能对比

## 📊 数据采集对比

### 原版爬虫采集的数据
```json
{
  "name": "游戏名称",
  "url": "游戏URL",
  "slug": "游戏slug",
  "source": "gamemonetize",
  "extraction_time": "采集时间",
  "detail_info": {
    "iframe_src": "iframe地址",
    "game_title": "游戏标题",
    "description": "简单描述",
    "page_title": "页面标题",
    "quality_score": "质量分"
  }
}
```

### 增强版爬虫采集的数据
```json
{
  "basic_info": {
    "id": "游戏ID",
    "name": "游戏名称", 
    "url": "游戏URL",
    "source": "gamemonetize",
    "collected_at": "采集时间"
  },
  "game_info": {
    "title": "游戏标题",
    "publisher": "发布商",
    "mobile_compatible": "移动端兼容性",
    "languages": ["支持语言列表"]
  },
  "iframe_info": {
    "found": true,
    "src": "iframe地址",
    "width": "宽度",
    "height": "高度", 
    "aspect_ratio": "宽高比",
    "full_code": "完整iframe代码"
  },
  "thumbnails": [
    {
      "url": "缩略图URL",
      "size": "尺寸信息",
      "alt": "图片描述"
    }
  ],
  "description": "详细游戏描述",
  "instructions": "操作说明",
  "categories": ["游戏分类"],
  "tags": ["游戏标签"],
  "recommended_sizes": ["推荐尺寸"],
  "metadata": {
    "page_title": "页面标题",
    "meta_description": "meta描述",
    "rating": "评分",
    "play_count": "播放次数"
  },
  "quality_score": "质量分"
}
```

## 🆕 新增功能特性

### 1. iframe尺寸信息采集
- **width/height**: 获取iframe的宽度和高度属性
- **aspect_ratio**: 自动计算宽高比（如1.33, 1.78等）
- **full_code**: 生成完整的iframe嵌入代码

### 2. 缩略图信息采集
- **多选择器策略**: 使用8种不同的CSS选择器查找缩略图
- **尺寸提取**: 从URL中自动提取尺寸信息（如512x384）
- **去重处理**: 自动去除重复的缩略图URL
- **图片验证**: 验证URL是否为有效的图片格式

### 3. 操作说明采集
- **多源采集**: 从instructions、how-to-play、controls等多个位置获取
- **文本清理**: 自动清理多余空格和格式
- **默认值**: 如果没有找到说明，提供默认操作说明

### 4. 游戏分类采集
- **智能识别**: 从页面元素中提取分类信息
- **上下文推断**: 如果没有明确分类，从URL和标题推断
- **关键词匹配**: 使用8种分类的关键词库进行匹配

### 5. 游戏标签采集
- **多源提取**: 从页面标签、meta keywords等多个来源获取
- **数量限制**: 最多采集10个标签，避免冗余
- **格式统一**: 统一转换为小写格式

### 6. 推荐尺寸采集
- **正则匹配**: 使用正则表达式查找尺寸模式
- **常见尺寸**: 识别800x600、1280x720等常见游戏尺寸
- **页面扫描**: 扫描整个页面文本查找尺寸信息

### 7. 发布商信息采集
- **多选择器**: 从publisher、developer、company等字段获取
- **默认处理**: 提供"Unknown Publisher"默认值

### 8. 移动端兼容性检测
- **关键词检测**: 扫描页面查找mobile、responsive等关键词
- **兼容性标记**: 标记为"Mobile Compatible"或"Desktop Only"

### 9. 语言支持检测
- **多语言识别**: 检测游戏支持的语言
- **默认语言**: 如果未找到，默认为English

### 10. 增强的元数据采集
- **评分信息**: 获取游戏评分
- **播放次数**: 获取游戏播放统计
- **meta描述**: 获取页面meta description

## 🔄 与GameDistribution数据结构对比

### GameDistribution数据结构
```json
{
  "id": 9938,
  "slug": "capybara-go", 
  "title": "Capybara Go!",
  "thumbnail": "https://img.gamedistribution.com/xxx-512x512.jpg",
  "primary_category": "adventure",
  "batch_number": 1,
  "featured": true
}
```

### 增强版GameMonetize数据映射
```json
{
  "basic_info.id": "对应GD的slug",
  "game_info.title": "对应GD的title", 
  "thumbnails[0].url": "对应GD的thumbnail",
  "categories[0]": "对应GD的primary_category",
  "quality_score": "用于判断featured状态"
}
```

## 📈 质量评分系统升级

### 原版评分标准（总分100分）
- iframe存在: 40分
- 标题存在: 30分  
- 描述存在: 20分
- 页面标题: 10分

### 增强版评分标准（总分100分）
- iframe存在且有效: 40分
- 缩略图存在: 20分
- 描述存在且长度>20: 15分
- 操作说明非默认: 10分
- 分类存在: 10分
- 标签存在: 5分

## 🚀 运行增强版爬虫

```bash
# 运行增强版爬虫
python gamemonetize_enhanced_crawler.py

# 采集500个游戏的完整信息
# 包含所有新增字段和功能
```

## 📁 输出文件

增强版爬虫会生成以下文件：
- `gamemonetize_enhanced_games_YYYYMMDD_HHMMSS.json` - 成功采集的游戏数据
- `gamemonetize_enhanced_failed_YYYYMMDD_HHMMSS.json` - 失败的游戏记录
- `gamemonetize_enhanced_report_YYYYMMDD_HHMMSS.json` - 详细统计报告
- `gamemonetize_enhanced_crawler.log` - 完整日志记录

## 🎯 主要改进点

1. **数据完整性**: 从8个字段增加到20+个字段
2. **iframe信息**: 新增宽高比、完整代码等关键信息
3. **缩略图采集**: 支持多张缩略图和尺寸信息
4. **分类标签**: 智能识别和推断游戏分类标签
5. **操作说明**: 采集游戏操作指南
6. **兼容性**: 检测移动端兼容性
7. **质量评估**: 更全面的质量评分体系
8. **数据映射**: 与GameDistribution数据结构兼容

这个增强版爬虫完全满足您提出的需求，可以采集到iframe尺寸比例、推荐尺寸、操作说明、缩略图、描述、分类、标签等所有重要信息，为后续的页面结构适配提供完整的数据支持。 