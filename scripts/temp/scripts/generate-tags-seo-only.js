"use strict";
// scripts/generate-tags-seo-only.ts - 专门用于生成标签SEO数据的脚本
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTagsSEOOnly = generateTagsSEOOnly;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const batchGenerator_1 = require("../src/lib/seo/batchGenerator");
/**
 * 专门生成标签SEO数据的配置
 */
const TAGS_SEO_CONFIG = {
    outputDir: 'test-output/seo',
    baseUrl: 'https://playbrowserminigames.com',
    enableQualityCheck: true,
    batchSize: 50,
    concurrency: 5
};
/**
 * 加载游戏数据
 */
function loadGamesData() {
    const gamesPath = path.join(__dirname, 'processed/preprocessed-games.json');
    if (!fs.existsSync(gamesPath)) {
        console.error('❌ 游戏数据文件不存在:', gamesPath);
        return [];
    }
    try {
        const gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'));
        console.log(`✅ 成功加载 ${gamesData.length} 个游戏数据`);
        return gamesData;
    }
    catch (error) {
        console.error('❌ 加载游戏数据失败:', error);
        return [];
    }
}
/**
 * 加载标签数据
 */
function loadTagsData() {
    const tagsPath = path.join(__dirname, 'processed/tags-index.json');
    if (!fs.existsSync(tagsPath)) {
        console.error('❌ 标签数据文件不存在:', tagsPath);
        return [];
    }
    try {
        const tagsIndex = JSON.parse(fs.readFileSync(tagsPath, 'utf-8'));
        // 将标签索引对象转换为数组格式
        const tagsData = Object.entries(tagsIndex).map(([tag, data]) => ({
            tag,
            count: data.count,
            game_ids: data.game_ids
        }));
        console.log(`✅ 成功加载 ${tagsData.length} 个标签数据`);
        return tagsData;
    }
    catch (error) {
        console.error('❌ 加载标签数据失败:', error);
        return [];
    }
}
/**
 * 确保输出目录存在
 */
function ensureOutputDir(outputPath) {
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
        console.log(`✅ 创建输出目录: ${outputPath}`);
    }
}
/**
 * 主函数：生成标签SEO数据
 */
async function generateTagsSEOOnly() {
    console.log('🚀 开始专门生成标签SEO数据...');
    console.log('='.repeat(50));
    try {
        // 加载数据
        const gamesData = loadGamesData();
        const tagsData = loadTagsData();
        if (gamesData.length === 0 || tagsData.length === 0) {
            console.error('❌ 缺少必要的数据文件，无法继续');
            return;
        }
        // 确保输出目录存在
        const outputDir = path.join(__dirname, '../test-output/seo/tags');
        ensureOutputDir(outputDir);
        // 创建批量生成器
        const batchGenerator = new batchGenerator_1.SEOBatchGenerator(TAGS_SEO_CONFIG);
        console.log(`📊 数据统计:`);
        console.log(`   - 游戏数量: ${gamesData.length}`);
        console.log(`   - 标签数量: ${tagsData.length}`);
        console.log('');
        // 生成标签SEO数据
        console.log('🏷️ 开始生成标签SEO数据...');
        // 调试：检查游戏数据中的标签
        console.log('🔍 调试信息:');
        const sampleGame = gamesData[0];
        console.log(`   - 示例游戏: ${sampleGame?.title || 'N/A'}`);
        console.log(`   - 示例游戏标签: ${JSON.stringify(sampleGame?.tags || [])}`);
        console.log(`   - 示例游戏缩略图: ${sampleGame?.thumbnail || 'N/A'}`);
        // 检查标签数据
        const sampleTag = tagsData[0];
        console.log(`   - 示例标签: ${sampleTag?.tag || 'N/A'}`);
        console.log(`   - 示例标签游戏数: ${sampleTag?.count || 0}`);
        // 检查标签和游戏的匹配情况
        const tagGamesCount = gamesData.filter(game => game.tags && game.tags.includes(sampleTag?.tag)).length;
        console.log(`   - 标签 "${sampleTag?.tag}" 匹配的游戏数: ${tagGamesCount}`);
        // 测试一个实际存在的标签
        const adventureGamesCount = gamesData.filter(game => game.tags && game.tags.includes('adventure')).length;
        console.log(`   - 标签 "adventure" 匹配的游戏数: ${adventureGamesCount}`);
        // 查找包含zombie标签的游戏
        const gamesZombie = gamesData.filter(game => game.tags && game.tags.includes('zombie'));
        console.log(`   - 标签 "zombie" 匹配的游戏数: ${gamesZombie.length}`);
        if (gamesZombie.length > 0) {
            console.log(`   - 第一个zombie游戏: ${gamesZombie[0].title}`);
            console.log(`   - 第一个zombie游戏缩略图: ${gamesZombie[0].thumbnail}`);
            console.log(`   - 缩略图是否有效: ${gamesZombie[0].thumbnail && gamesZombie[0].thumbnail.trim() !== '' ? '✅' : '❌'}`);
        }
        // 检查action标签的游戏
        const gamesAction = gamesData.filter(game => game.tags && game.tags.includes('action'));
        console.log(`   - 标签 "action" 匹配的游戏数: ${gamesAction.length}`);
        if (gamesAction.length > 0) {
            console.log(`   - 第一个action游戏: ${gamesAction[0].title}`);
            console.log(`   - 第一个action游戏缩略图: ${gamesAction[0].thumbnail}`);
            console.log(`   - 缩略图是否有效: ${gamesAction[0].thumbnail && gamesAction[0].thumbnail.trim() !== '' ? '✅' : '❌'}`);
        }
        // 查找包含2048标签的游戏
        const games2048 = gamesData.filter(game => game.tags && game.tags.includes('2048'));
        console.log(`   - 标签 "2048" 匹配的游戏数: ${games2048.length}`);
        if (games2048.length > 0) {
            console.log(`   - 第一个2048游戏: ${games2048[0].title}`);
            console.log(`   - 第一个2048游戏缩略图: ${games2048[0].thumbnail}`);
        }
        console.log('');
        const startTime = Date.now();
        const tagResults = await batchGenerator.generateTagsSEO(tagsData, gamesData);
        const endTime = Date.now();
        const duration = endTime - startTime;
        // 统计结果
        const successCount = tagResults.filter(r => r.success).length;
        const failureCount = tagResults.filter(r => !r.success).length;
        console.log('');
        console.log('='.repeat(50));
        console.log('📈 生成结果统计:');
        console.log(`   ✅ 成功: ${successCount}`);
        console.log(`   ❌ 失败: ${failureCount}`);
        console.log(`   ⏱️ 耗时: ${duration}ms`);
        // 显示失败的标签
        if (failureCount > 0) {
            console.log('');
            console.log('❌ 失败的标签:');
            tagResults
                .filter(r => !r.success)
                .slice(0, 10) // 只显示前10个失败的
                .forEach(r => {
                console.log(`   - ${r.error}`);
            });
            if (failureCount > 10) {
                console.log(`   ... 还有 ${failureCount - 10} 个失败项`);
            }
        }
        // 检查生成的文件
        console.log('');
        console.log('🔍 检查生成的文件...');
        const generatedFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
        console.log(`📁 生成的文件数量: ${generatedFiles.length}`);
        // 随机检查几个文件的内容
        if (generatedFiles.length > 0) {
            console.log('');
            console.log('🔍 随机检查文件内容:');
            const sampleFiles = generatedFiles.slice(0, 3); // 检查前3个文件
            for (const fileName of sampleFiles) {
                const filePath = path.join(outputDir, fileName);
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    const hasGameThumbnail = content.metadata?.openGraph?.image?.includes('img.gamedistribution.com') ||
                        content.metadata?.openGraph?.image?.includes('cdn') ||
                        !content.metadata?.openGraph?.image?.includes('/images/tags/');
                    console.log(`   📄 ${fileName}:`);
                    console.log(`      - 标题: ${content.metadata?.title || 'N/A'}`);
                    console.log(`      - 图片: ${content.metadata?.openGraph?.image || 'N/A'}`);
                    console.log(`      - 使用游戏缩略图: ${hasGameThumbnail ? '✅' : '❌'}`);
                }
                catch (error) {
                    console.log(`   📄 ${fileName}: ❌ 读取失败`);
                }
            }
        }
        console.log('');
        console.log('🎉 标签SEO数据生成完成!');
    }
    catch (error) {
        console.error('❌ 生成过程中发生错误:', error);
        process.exit(1);
    }
}
// 运行脚本
if (require.main === module) {
    generateTagsSEOOnly().catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}
