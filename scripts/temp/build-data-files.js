"use strict";
// scripts/build-data-files.ts
// 构建数据文件生成器 - 为生产环境构建静态数据文件
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
exports.BuildDataFilesGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * 静态数据构建器
 */
class BuildDataFilesGenerator {
    constructor() {
        this.gamesData = [];
        this.gamesIndex = [];
        this.categoryIndex = {};
        this.tagsIndex = {};
        this.inputDir = path.join(__dirname, 'processed');
        this.outputDir = path.join(__dirname, 'processed');
    }
    /**
     * 执行构建数据文件生成
     */
    async generateBuildDataFiles() {
        console.log('🚀 开始生成构建数据文件...');
        try {
            // 1. 加载现有数据
            await this.loadExistingData();
            // 2. 生成 gameStaticData.json
            await this.generateGameStaticData();
            // 3. 创建 categoryIndex.json (复制现有文件)
            await this.createCategoryIndex();
            // 4. 生成 gameRelations.json
            await this.generateGameRelations();
            // 5. 创建 sitemapData.json
            await this.generateSitemapData();
            // 6. 验证数据格式和完整性
            await this.validateDataFiles();
            console.log('✅ 构建数据文件生成完成!');
        }
        catch (error) {
            console.error('❌ 构建数据文件生成失败:', error);
            throw error;
        }
    }
    /**
     * 加载现有数据
     */
    async loadExistingData() {
        console.log('📖 加载现有数据文件...');
        // 加载游戏索引
        const gamesIndexPath = path.join(this.inputDir, 'games-index.json');
        if (fs.existsSync(gamesIndexPath)) {
            this.gamesIndex = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf8'));
            console.log(`✅ 已加载 ${this.gamesIndex.length} 个游戏索引`);
        }
        // 加载分类索引
        const categoryIndexPath = path.join(this.inputDir, 'category-index.json');
        if (fs.existsSync(categoryIndexPath)) {
            this.categoryIndex = JSON.parse(fs.readFileSync(categoryIndexPath, 'utf8'));
            console.log(`✅ 已加载 ${Object.keys(this.categoryIndex).length} 个分类`);
        }
        // 加载标签索引
        const tagsIndexPath = path.join(this.inputDir, 'tags-index.json');
        if (fs.existsSync(tagsIndexPath)) {
            this.tagsIndex = JSON.parse(fs.readFileSync(tagsIndexPath, 'utf8'));
            console.log(`✅ 已加载 ${Object.keys(this.tagsIndex).length} 个标签`);
        }
        // 加载完整游戏数据
        const validGamesPath = path.join(this.inputDir, 'valid-games.json');
        if (fs.existsSync(validGamesPath)) {
            this.gamesData = JSON.parse(fs.readFileSync(validGamesPath, 'utf8'));
            console.log(`✅ 已加载 ${this.gamesData.length} 个完整游戏数据`);
        }
    }
    /**
     * 生成 gameStaticData.json - 构建时使用的静态数据
     */
    async generateGameStaticData() {
        console.log('🔨 生成 gameStaticData.json...');
        const gameStaticData = {
            metadata: {
                total_games: this.gamesIndex.length,
                generated_at: new Date().toISOString(),
                version: '1.0.0',
                description: 'Static game data for build-time generation'
            },
            games: this.gamesIndex.map(game => ({
                id: game.id,
                slug: game.slug,
                title: game.title,
                thumbnail: game.thumbnail,
                primary_category: game.primary_category,
                featured: game.featured,
                url: `/games/${game.primary_category}/${game.slug}`,
                category_url: `/games/${game.primary_category}`
            })),
            categories: Object.keys(this.categoryIndex).map(category => ({
                slug: category,
                count: this.categoryIndex[category].count,
                url: `/games/${category}`,
                display_name: this.formatCategoryName(category)
            })),
            featured_games: this.gamesIndex
                .filter(game => game.featured)
                .slice(0, 20)
                .map(game => ({
                id: game.id,
                slug: game.slug,
                title: game.title,
                thumbnail: game.thumbnail,
                category: game.primary_category,
                url: `/games/${game.primary_category}/${game.slug}`
            }))
        };
        const outputPath = path.join(this.outputDir, 'gameStaticData.json');
        fs.writeFileSync(outputPath, JSON.stringify(gameStaticData, null, 2));
        console.log(`✅ gameStaticData.json 已生成: ${outputPath}`);
    }
    /**
     * 创建 categoryIndex.json (复制现有文件)
     */
    async createCategoryIndex() {
        console.log('📋 创建 categoryIndex.json...');
        const sourcePath = path.join(this.inputDir, 'category-index.json');
        const targetPath = path.join(this.outputDir, 'categoryIndex.json');
        if (fs.existsSync(sourcePath)) {
            const categoryData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
            // 添加元数据
            const enhancedCategoryIndex = {
                metadata: {
                    total_categories: Object.keys(categoryData).length,
                    generated_at: new Date().toISOString(),
                    description: 'Category index for build-time generation'
                },
                categories: categoryData
            };
            fs.writeFileSync(targetPath, JSON.stringify(enhancedCategoryIndex, null, 2));
            console.log(`✅ categoryIndex.json 已创建: ${targetPath}`);
        }
        else {
            console.warn('⚠️ category-index.json 源文件不存在');
        }
    }
    /**
     * 生成 gameRelations.json - 游戏推荐关系数据
     */
    async generateGameRelations() {
        console.log('🔗 生成 gameRelations.json...');
        const gameRelations = {};
        // 为每个游戏生成推荐关系
        for (const game of this.gamesIndex) {
            const gameId = game.id.toString();
            // 同分类游戏
            const sameCategoryGames = this.gamesIndex
                .filter(g => g.primary_category === game.primary_category && g.id !== game.id)
                .slice(0, 10)
                .map(g => g.id);
            // 推荐游戏 (优先推荐featured游戏)
            const recommendedGames = this.gamesIndex
                .filter(g => g.id !== game.id && (g.featured || g.primary_category === game.primary_category))
                .sort((a, b) => {
                // featured游戏优先
                if (a.featured && !b.featured)
                    return -1;
                if (!a.featured && b.featured)
                    return 1;
                return 0;
            })
                .slice(0, 8)
                .map(g => g.id);
            // 同开发者游戏 (如果有开发者信息)
            const sameDeveloperGames = [];
            const fullGameData = this.gamesData.find(g => g.id === game.id);
            if (fullGameData?.developer) {
                const developerGames = this.gamesData
                    .filter(g => g.developer === fullGameData.developer && g.id !== game.id)
                    .slice(0, 5)
                    .map(g => g.id);
                sameDeveloperGames.push(...developerGames);
            }
            gameRelations[gameId] = {
                similar_games: sameCategoryGames,
                same_category: sameCategoryGames,
                same_developer: sameDeveloperGames,
                recommended: recommendedGames
            };
        }
        const relationsData = {
            metadata: {
                total_games: Object.keys(gameRelations).length,
                generated_at: new Date().toISOString(),
                description: 'Game recommendation relations for build-time generation'
            },
            relations: gameRelations
        };
        const outputPath = path.join(this.outputDir, 'gameRelations.json');
        fs.writeFileSync(outputPath, JSON.stringify(relationsData, null, 2));
        console.log(`✅ gameRelations.json 已生成: ${outputPath}`);
    }
    /**
     * 生成 sitemapData.json - sitemap数据源
     */
    async generateSitemapData() {
        console.log('🗺️ 生成 sitemapData.json...');
        const currentDate = new Date().toISOString().split('T')[0];
        const sitemapData = {
            games: this.gamesIndex.map(game => ({
                slug: `games/${game.primary_category}/${game.slug}`,
                category: game.primary_category,
                lastmod: currentDate,
                priority: game.featured ? 0.8 : 0.6
            })),
            categories: Object.keys(this.categoryIndex).map(category => ({
                slug: `games/${category}`,
                lastmod: currentDate,
                priority: 0.7
            })),
            tags: Object.keys(this.tagsIndex).slice(0, 100).map(tag => ({
                slug: `tags/${tag}`,
                lastmod: currentDate,
                priority: 0.5
            }))
        };
        const sitemapDataWithMeta = {
            metadata: {
                total_urls: sitemapData.games.length + sitemapData.categories.length + sitemapData.tags.length,
                generated_at: new Date().toISOString(),
                description: 'Sitemap data source for build-time generation'
            },
            sitemap: sitemapData
        };
        const outputPath = path.join(this.outputDir, 'sitemapData.json');
        fs.writeFileSync(outputPath, JSON.stringify(sitemapDataWithMeta, null, 2));
        console.log(`✅ sitemapData.json 已生成: ${outputPath}`);
    }
    /**
     * 验证数据格式和完整性
     */
    async validateDataFiles() {
        console.log('🔍 验证数据格式和完整性...');
        const filesToValidate = [
            'gameStaticData.json',
            'categoryIndex.json',
            'gameRelations.json',
            'sitemapData.json'
        ];
        const validationResults = {
            timestamp: new Date().toISOString(),
            files: []
        };
        for (const filename of filesToValidate) {
            const filePath = path.join(this.outputDir, filename);
            const fileResult = {
                filename,
                exists: false,
                valid_json: false,
                size_kb: 0,
                errors: []
            };
            try {
                if (fs.existsSync(filePath)) {
                    fileResult.exists = true;
                    const stats = fs.statSync(filePath);
                    fileResult.size_kb = Math.round(stats.size / 1024);
                    // 验证JSON格式
                    const content = fs.readFileSync(filePath, 'utf8');
                    const jsonData = JSON.parse(content);
                    fileResult.valid_json = true;
                    // 记录数量统计
                    if (filename === 'gameStaticData.json' && jsonData.games) {
                        fileResult.record_count = jsonData.games.length;
                    }
                    else if (filename === 'categoryIndex.json' && jsonData.categories) {
                        fileResult.record_count = Object.keys(jsonData.categories).length;
                    }
                    else if (filename === 'gameRelations.json' && jsonData.relations) {
                        fileResult.record_count = Object.keys(jsonData.relations).length;
                    }
                    else if (filename === 'sitemapData.json' && jsonData.sitemap) {
                        fileResult.record_count = jsonData.sitemap.games.length + jsonData.sitemap.categories.length + jsonData.sitemap.tags.length;
                    }
                }
                else {
                    fileResult.errors.push('文件不存在');
                }
            }
            catch (error) {
                fileResult.errors.push(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
            }
            validationResults.files.push(fileResult);
        }
        // 保存验证报告
        const reportPath = path.join(this.outputDir, 'build-data-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
        // 输出验证结果
        console.log('\n📊 数据文件验证结果:');
        for (const file of validationResults.files) {
            const status = file.exists && file.valid_json && file.errors.length === 0 ? '✅' : '❌';
            console.log(`${status} ${file.filename}: ${file.size_kb}KB${file.record_count ? ` (${file.record_count} 条记录)` : ''}`);
            if (file.errors.length > 0) {
                console.log(`   错误: ${file.errors.join(', ')}`);
            }
        }
        console.log(`\n📋 验证报告已保存: ${reportPath}`);
    }
    /**
     * 格式化分类名称
     */
    formatCategoryName(category) {
        const categoryNames = {
            'action': 'Action Games',
            'adventure': 'Adventure Games',
            'arcade': 'Arcade Games',
            'casual': 'Casual Games',
            'puzzle': 'Puzzle Games',
            'simulation': 'Simulation Games',
            'sports': 'Sports Games',
            'strategy': 'Strategy Games'
        };
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }
}
exports.BuildDataFilesGenerator = BuildDataFilesGenerator;
/**
 * 主函数
 */
async function main() {
    try {
        const generator = new BuildDataFilesGenerator();
        await generator.generateBuildDataFiles();
        console.log('\n🎉 构建数据文件生成任务完成!');
        console.log('\n生成的文件:');
        console.log('- gameStaticData.json (构建时使用的静态数据)');
        console.log('- categoryIndex.json (分类索引文件)');
        console.log('- gameRelations.json (推荐关系数据)');
        console.log('- sitemapData.json (sitemap数据源)');
        console.log('- build-data-validation-report.json (验证报告)');
    }
    catch (error) {
        console.error('❌ 构建数据文件生成失败:', error);
        process.exit(1);
    }
}
// 如果直接运行此脚本
if (require.main === module) {
    main();
}
