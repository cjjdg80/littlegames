// scripts/data-processing/generateLatest100Games.js
// 生成最新100个游戏的索引数据，便于静态页面开发和测试

const fs = require('fs');
const path = require('path');

// 主游戏索引文件路径
const indexPath = path.join(__dirname, '../../src/data/games/games-index.json');
// 输出文件路径
const outputPath = path.join(__dirname, '../../src/data/latest-100-games.json');

// 读取主索引数据
const games = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// 按id降序排序，取最新100个
const latest100 = games
  .sort((a, b) => b.id - a.id)
  .slice(0, 100);

// 写入输出文件
fs.writeFileSync(outputPath, JSON.stringify(latest100, null, 2), 'utf-8');
console.log(`最新100个游戏已生成: ${outputPath}`);
console.log(`游戏ID范围: ${latest100[latest100.length-1].id} - ${latest100[0].id}`);
console.log(`包含分类: ${[...new Set(latest100.map(g => g.primary_category))].join(', ')}`); 