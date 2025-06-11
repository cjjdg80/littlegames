const fs = require('fs');
const path = require('path');

// 简单的测试脚本来验证索引功能
async function testIndexes() {
  try {
    console.log('🧪 测试索引文件...');
    
    const dataDir = path.join(__dirname, '../processed');
    
    // 检查所有索引文件是否存在
    const indexFiles = [
      'games-index.json',
      'category-index.json', 
      'tags-index.json',
      'devices-index.json',
      'developers-index.json',
      'pagination-config.json',
      'featured-games.json',
      'tags-stats.json',
      'category-stats.json'
    ];
    
    console.log('📁 检查索引文件:');
    for (const file of indexFiles) {
      const filePath = path.join(dataDir, file);
      const exists = fs.existsSync(filePath);
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
      
      if (exists) {
        const stats = fs.statSync(filePath);
        console.log(`     大小: ${(stats.size / 1024).toFixed(2)} KB`);
      }
    }
    
    // 读取并显示统计信息
    const tagsStatsPath = path.join(dataDir, 'tags-stats.json');
    if (fs.existsSync(tagsStatsPath)) {
      const tagsStats = JSON.parse(fs.readFileSync(tagsStatsPath, 'utf8'));
      console.log('\n🏷️ 标签统计:');
      console.log(`  总标签数: ${tagsStats.total_tags}`);
      console.log(`  热门标签: ${tagsStats.popular_tags.slice(0, 5).map(t => `${t.name}(${t.count})`).join(', ')}`);
    }
    
    const categoryStatsPath = path.join(dataDir, 'category-stats.json');
    if (fs.existsSync(categoryStatsPath)) {
      const categoryStats = JSON.parse(fs.readFileSync(categoryStatsPath, 'utf8'));
      console.log('\n📂 分类统计:');
      console.log(`  总分类数: ${categoryStats.total_categories}`);
      categoryStats.categories.forEach(cat => {
        console.log(`  ${cat.name}: ${cat.count} 个游戏`);
      });
    }
    
    // 测试设备索引
    const devicesIndexPath = path.join(dataDir, 'devices-index.json');
    if (fs.existsSync(devicesIndexPath)) {
      const devicesIndex = JSON.parse(fs.readFileSync(devicesIndexPath, 'utf8'));
      console.log('\n📱 设备统计:');
      Object.entries(devicesIndex).forEach(([device, info]) => {
        console.log(`  ${device}: ${info.count} 个游戏`);
      });
    }
    
    // 测试开发者索引
    const developersIndexPath = path.join(dataDir, 'developers-index.json');
    if (fs.existsSync(developersIndexPath)) {
      const developersIndex = JSON.parse(fs.readFileSync(developersIndexPath, 'utf8'));
      const topDevelopers = Object.entries(developersIndex)
        .map(([name, info]) => ({ name, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      console.log('\n👨‍💻 热门开发者:');
      topDevelopers.forEach((dev, index) => {
        console.log(`  ${index + 1}. ${dev.name}: ${dev.count} 个游戏`);
      });
    }
    
    // 检查分页文件
    const paginationConfigPath = path.join(dataDir, 'pagination-config.json');
    if (fs.existsSync(paginationConfigPath)) {
      const paginationConfig = JSON.parse(fs.readFileSync(paginationConfigPath, 'utf8'));
      console.log('\n📄 分页配置:');
      console.log(`  总游戏数: ${paginationConfig.total_games}`);
      console.log(`  总页数: ${paginationConfig.total_pages}`);
      console.log(`  每页游戏数: ${paginationConfig.games_per_page}`);
      console.log(`  最新游戏ID: ${paginationConfig.latest_game_id}`);
      console.log(`  最旧游戏ID: ${paginationConfig.oldest_game_id}`);
    }
    
    // 测试第一页数据
    const page1Path = path.join(dataDir, 'page-1.json');
    if (fs.existsSync(page1Path)) {
      const page1Data = JSON.parse(fs.readFileSync(page1Path, 'utf8'));
      console.log('\n📋 第一页数据:');
      console.log(`  游戏数量: ${page1Data.games.length}`);
      
      if (page1Data.games.length > 0) {
        const firstGame = page1Data.games[0];
        console.log(`  第一个游戏: ${firstGame.title} (ID: ${firstGame.id})`);
        console.log(`  包含instructions字段: ${firstGame.instructions ? '✅' : '❌'}`);
        if (firstGame.instructions) {
          console.log(`  操作说明: ${firstGame.instructions}`);
        }
      }
    }
    
    console.log('\n✅ 索引功能测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testIndexes();