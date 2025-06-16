# GameMonetize 热门游戏爬虫

## 📋 项目概述

这是一个专门为 [GameMonetize.com](https://gamemonetize.com) 网站设计的游戏爬虫系统，用于采集500个热门游戏的详细信息，包括游戏链接、标题、描述和iframe嵌入代码。

## 🎯 功能特性

### ✅ 核心功能
- **多策略采集** - 首页推荐 + 分页浏览，确保获取热门游戏
- **智能去重** - 自动去除重复游戏链接
- **质量评估** - 对每个游戏页面进行质量评分（0-100分）
- **详情测试** - 验证游戏详情页面的可访问性和完整性
- **进度保存** - 每50个游戏自动保存进度，支持断点续传
- **错误处理** - 完善的异常处理和重试机制

### 📊 数据采集内容
- **基本信息**: 游戏名称、URL、slug、来源标识
- **页面质量**: iframe可用性、标题完整性、描述丰富度
- **嵌入代码**: 游戏iframe源地址（用于网站嵌入）
- **元数据**: 页面标题、描述文本、采集时间

## 🛠️ 技术架构

### 依赖环境
```bash
# Python 3.7+
pip install selenium requests

# Chrome浏览器 + ChromeDriver
# 确保ChromeDriver在PATH中或与脚本同目录
```

### 核心技术栈
- **Selenium WebDriver** - 浏览器自动化
- **Chrome Headless** - 无头浏览器模式
- **Requests** - HTTP请求处理
- **JSON** - 数据存储格式

## 🚀 使用方法

### 1. 环境准备
```bash
# 进入爬虫目录
cd scripts/crawler

# 安装依赖
pip install selenium requests

# 确保Chrome和ChromeDriver已安装
```

### 2. 功能测试
```bash
# 运行测试脚本，验证基本功能
python test_gamemonetize.py
```

**测试内容:**
- ✅ 网站基本访问测试
- ✅ Selenium浏览器驱动测试  
- ✅ 游戏链接获取测试
- ✅ 游戏详情页面访问测试
- ✅ 数据提取质量评估

### 3. 正式采集
```bash
# 开始采集500个热门游戏
python gamemonetize_crawler.py
```

**采集过程:**
1. **初始化** - 设置Chrome无头浏览器
2. **URL收集** - 从首页和分页获取游戏链接
3. **详情采集** - 逐个访问游戏页面提取信息
4. **质量评估** - 对每个页面进行0-100分评分
5. **数据保存** - 每50个游戏保存一次进度

## 📁 输出文件说明

### 成功数据文件
```
gamemonetize_hot_games_YYYYMMDD_HHMMSS.json
```
**数据结构:**
```json
{
  "name": "游戏名称",
  "url": "游戏详情页URL", 
  "slug": "游戏slug标识",
  "source": "gamemonetize",
  "extraction_time": "采集时间",
  "detail_accessible": true,
  "detail_info": {
    "quality_score": 85,
    "iframe_found": true,
    "iframe_src": "游戏iframe地址",
    "game_title": "页面标题",
    "description": "游戏描述",
    "page_title": "HTML标题"
  }
}
```

### 失败数据文件
```
gamemonetize_failed_games_YYYYMMDD_HHMMSS.json
```

### 采集报告文件
```
gamemonetize_crawl_report_YYYYMMDD_HHMMSS.json
```
**报告内容:**
- 📊 采集统计数据
- 📈 成功率分析
- 🎯 质量分布情况
- ❌ 失败原因分析

### 日志文件
```
gamemonetize_crawler.log
```

## ⚙️ 配置参数

### 爬虫配置
```python
# 目标采集数量
target_count = 500

# 页面加载超时
page_load_timeout = 30

# 请求延迟范围
delay_range = (1, 3)  # 1-3秒随机延迟

# 最大分页数
max_pages = 20

# 进度保存间隔
save_interval = 50  # 每50个游戏保存一次
```

### Chrome浏览器选项
```python
chrome_options = [
    '--headless',           # 无头模式
    '--no-sandbox',         # 沙盒模式
    '--disable-dev-shm-usage',
    '--disable-images',     # 禁用图片加载
    '--window-size=1280,720'
]
```

## 📈 质量评分标准

### 评分规则 (总分100分)
- **iframe可用** - 40分 (最重要，游戏可嵌入)
- **标题完整** - 30分 (页面有明确标题)
- **描述丰富** - 20分 (有详细游戏描述)
- **页面正常** - 10分 (HTML标题长度>5字符)

### 质量等级
- **高质量** (80-100分) - 完整可用的游戏页面
- **中等质量** (50-79分) - 基本可用，部分信息缺失
- **低质量** (0-49分) - 信息不完整或无法正常使用

## 🔧 故障排除

### 常见问题

#### 1. ChromeDriver错误
```bash
# 错误: 'chromedriver' executable needs to be in PATH
# 解决: 下载ChromeDriver并添加到PATH
```

#### 2. 网站访问超时
```bash
# 错误: TimeoutException
# 解决: 检查网络连接，增加超时时间
```

#### 3. 元素定位失败
```bash
# 错误: NoSuchElementException  
# 解决: 网站结构可能变化，需要更新选择器
```

### 调试模式
```python
# 启用详细日志
logging.basicConfig(level=logging.DEBUG)

# 禁用无头模式查看浏览器
chrome_options.remove('--headless')
```

## 📊 性能指标

### 预期性能
- **采集速度** - 约2-3秒/游戏 (含延迟)
- **成功率** - 预期85%+ (基于测试结果)
- **内存占用** - 约100-200MB
- **总耗时** - 500个游戏约20-30分钟

### 优化建议
1. **并发控制** - 当前单线程，可考虑多线程优化
2. **缓存机制** - 可添加URL去重缓存
3. **断点续传** - 已支持，可从失败点继续
4. **代理轮换** - 如遇IP限制可添加代理池

## 🔄 与现有系统集成

### 数据格式兼容
输出的JSON格式与现有GameDistribution爬虫保持一致，便于：
- 数据合并处理
- 统一的游戏管理
- 相同的质量评估标准

### 扩展建议
1. **分类采集** - 可扩展支持特定分类游戏
2. **增量更新** - 定期更新热门游戏列表
3. **多网站支持** - 基于此架构适配其他游戏网站

## 📝 使用示例

```bash
# 完整使用流程
cd scripts/crawler

# 1. 测试环境和功能
python test_gamemonetize.py

# 2. 开始正式采集
python gamemonetize_crawler.py

# 3. 查看采集结果
ls -la gamemonetize_*

# 4. 检查采集报告
cat gamemonetize_crawl_report_*.json
```

## ⚠️ 注意事项

### 使用规范
1. **遵守robots.txt** - 尊重网站爬虫协议
2. **合理延迟** - 避免对服务器造成压力
3. **数据使用** - 仅用于学习和合法用途
4. **版权尊重** - 不侵犯游戏版权和网站权益

### 法律合规
- 本工具仅用于技术学习和研究
- 使用前请确认符合当地法律法规
- 商业使用需获得相应授权许可

---

**开发者**: AI Assistant  
**更新时间**: 2024-12-17  
**版本**: v1.0.0 