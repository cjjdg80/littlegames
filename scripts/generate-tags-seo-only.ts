// scripts/generate-tags-seo-only.ts
// 功能说明: 专门用于生成标签SEO数据的脚本，仅用于测试和调试目的。
import * as fs from 'fs';
import * as path from 'path';

// 确保 BatchGenerationConfig 类型被导入，如果它在 batchGenerator 中定义
// import { BatchGenerationConfig } from '../src/lib/seo/batchGenerator'; // 移除，因为 BatchGenerator 会被动态导入

const LOG_FILE_PATH = path.join(process.cwd(), 'script_debug.log');

/**
 * 主函数，执行标签SEO数据生成。
 */
async function main() {
  // 清空或创建日志文件
  fs.writeFileSync(LOG_FILE_PATH, '');

  /**
   * 将日志消息附加到日志文件和控制台。
   * @param {string} message - 要记录的消息。
   */
  const logMessage = (message: string) => {
    fs.appendFileSync(LOG_FILE_PATH, message + '\n');
    console.log(message);
  };

  logMessage('开始执行 generate-tags-seo-only.ts 脚本...');

  try {
    logMessage('导入模块...');
    // 导入 batchGenerator
    const { SEOBatchGenerator } = require('../src/lib/seo/batchGenerator');
    
    // 定义本地配置接口
    interface BatchGenerationConfig {
      outputDir: string;
      batchSize: number;
      enableQualityCheck: boolean;
      generateProgressReport: boolean;
      concurrency: number;
      baseUrl: string;
    }

    // 加载游戏数据
    const gamesIndexPath = path.join(process.cwd(), 'src/data/games/games-index.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf-8'));
    logMessage(`加载游戏数据: ${Object.keys(gamesData).length} 个游戏`);

    // 加载标签数据
    const tagsIndexPath = path.join(process.cwd(), 'src/data/games/tags-index.json');
    const tagsData = JSON.parse(fs.readFileSync(tagsIndexPath, 'utf-8'));
    logMessage(`加载标签数据: ${Object.keys(tagsData).length} 个标签`);
    logMessage('模块导入成功。');

    // 确保输出目录存在
    const baseOutputDir = path.join(process.cwd(), 'test-output', 'seo');
    if (!fs.existsSync(baseOutputDir)) {
      fs.mkdirSync(baseOutputDir, { recursive: true });
    }
    logMessage(`基础输出目录: ${baseOutputDir}`);

    const config: BatchGenerationConfig = {
      outputDir: baseOutputDir,
      batchSize: 10,
      enableQualityCheck: false,
      generateProgressReport: true,
      concurrency: 3,
      baseUrl: 'https://playbrowserminigames.com'
    };
    logMessage('配置信息准备完毕。');

    const generator = new SEOBatchGenerator(config);
    logMessage('SEOBatchGenerator 实例已创建。');

    logMessage('开始生成标签SEO数据...');
    // generateTagsSEO需要tagsData数组，而不是tagNames
    // 将标签对象转换为包含tag属性的数组格式
    const tagsArray = Object.entries(tagsData).map(([tagName, tagInfo]: [string, any]) => ({
      tag: tagName,
      count: tagInfo.count,
      game_ids: tagInfo.game_ids
    }));
    const gamesArray = Array.isArray(gamesData) ? gamesData : Object.values(gamesData);
    logMessage(`转换后的标签数组长度: ${tagsArray.length}`);
    
    await generator.generateTagsSEO(tagsArray, gamesArray);
    logMessage('标签SEO数据生成完成。');

    // 可以在这里添加一些验证逻辑，例如检查生成的文件数量或内容
    const tagsOutputDir = path.join(baseOutputDir, 'tags');
    const generatedFiles = fs.readdirSync(tagsOutputDir);
    logMessage(`在 ${tagsOutputDir} 中生成的文件数量: ${generatedFiles.length}`);

    if (generatedFiles.length > 0) {
      logMessage(`抽查前3个生成的文件内容:`);
      for (let i = 0; i < Math.min(3, generatedFiles.length); i++) {
        const fileName = generatedFiles[i];
        const filePath = path.join(tagsOutputDir, fileName);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(fileContent);
          logMessage(`  文件: ${fileName}`);
          logMessage(`    og:image: ${jsonData.metadata?.openGraph?.image}`);
          logMessage(`    twitter:image: ${jsonData.metadata?.twitter?.image}`);
          // 检查是否使用了游戏缩略图 (这是一个简化的检查)
          if (jsonData.metadata?.openGraph?.image && !jsonData.metadata.openGraph.image.includes('default_')) {
            logMessage(`    ✅ ${fileName} 使用了游戏缩略图 (OG)。`);
          } else {
            logMessage(`    ❌ ${fileName} 可能使用了默认图片 (OG)。`);
          }
        } catch (e: any) {
          logMessage(`  读取或解析文件 ${fileName} 失败: ${e.message}`);
        }
      }
    }

  } catch (error: any) {
    logMessage(`脚本执行出错: ${error.message}`);
    logMessage(error.stack);
    process.exit(1); // 错误退出
  }
}

// 调用主函数
main().then(() => {
  console.log('generate-tags-seo-only.ts 脚本执行完毕。查看 debug_output.log 获取详细日志。');
}).catch(error => {
  console.error('脚本执行中发生未捕获的顶级错误:', error);
  fs.appendFileSync(LOG_FILE_PATH, '脚本执行中发生未捕获的顶级错误: ' + error.message + '\n' + error.stack + '\n');
  process.exit(1);
});

// 移除了独立的 generateTagsSEOOnly 函数，其逻辑合并到 main 中
// export { generateTagsSEOOnly }; // 如果不需要导出，可以移除