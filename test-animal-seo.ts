// test-animal-seo.ts - 测试animal标签SEO生成
import * as fs from 'fs';
import * as path from 'path';
import { SEOGenerator } from './src/lib/seo/generator';

async function testAnimalSEO() {
  try {
    // 加载游戏数据
    const gamesPath = path.join(__dirname, 'scripts/processed/preprocessed-games.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'));
    console.log(`✅ 加载了 ${gamesData.length} 个游戏`);
    
    // 加载标签数据
    const tagsPath = path.join(__dirname, 'scripts/processed/tags-index.json');
    const tagsIndex = JSON.parse(fs.readFileSync(tagsPath, 'utf-8'));
    const animalTag = tagsIndex.tags.find((tag: any) => tag.tag === 'animal');
    
    if (!animalTag) {
      console.error('❌ 找不到animal标签');
      return;
    }
    
    console.log('🔍 Animal标签数据:', animalTag);
    
    // 获取animal标签下的游戏
    const tagGames = animalTag.game_ids && animalTag.game_ids.length > 0 ?
      gamesData.filter((game: any) => animalTag.game_ids.includes(game.id)) :
      gamesData.filter((game: any) => game.tags && game.tags.includes('animal'));
    
    console.log(`🔍 匹配到 ${tagGames.length} 个游戏`);
    if (tagGames.length > 0) {
      console.log(`🔍 第一个游戏: ${tagGames[0].title}`);
      console.log(`🔍 第一个游戏缩略图: ${tagGames[0].thumbnail}`);
    }
    
    // 创建SEO生成器
    const generator = new SEOGenerator('https://playbrowserminigames.com');
    
    // 生成SEO数据
    console.log('\n🔄 生成SEO数据...');
    const seoData = generator.generateTagSEO(animalTag, [], tagGames);
    
    console.log('\n🔍 生成的SEO数据:');
    console.log('- OpenGraph图片:', seoData.metadata.openGraph.image);
    console.log('- Twitter图片:', seoData.metadata.twitter.image);
    
    // 保存文件
    const outputPath = path.join(__dirname, 'test-output/seo/tags/animal.json');
    fs.writeFileSync(outputPath, JSON.stringify(seoData, null, 2), 'utf-8');
    console.log(`\n✅ 文件已保存到: ${outputPath}`);
    
    // 立即读取文件验证
    const savedData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    console.log('\n🔍 保存后读取的图片:');
    console.log('- OpenGraph图片:', savedData.metadata.openGraph.image);
    console.log('- Twitter图片:', savedData.metadata.twitter.image);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testAnimalSEO();