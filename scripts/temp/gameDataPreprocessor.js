"use strict";
// scripts/data-processing/gameDataPreprocessor.ts
// 游戏数据预处理器 - 验证数据完整性、生成slug、URL映射、iframe预处理和分类标准化
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDataPreprocessor = void 0;
var fs = require("fs");
var path = require("path");
/**
 * 游戏数据预处理器
 */
var GameDataPreprocessor = /** @class */ (function () {
    function GameDataPreprocessor() {
        this.processedGames = [];
        this.urlMappings = {};
        this.slugSet = new Set();
        this.categoryMappings = {};
        this.validationErrors = [];
        this.inputDir = path.join(__dirname, '../processed');
        this.outputDir = path.join(__dirname, '../processed');
        this.initializeCategoryMappings();
    }
    /**
     * 初始化分类映射表（标准化分类名称）
     */
    GameDataPreprocessor.prototype.initializeCategoryMappings = function () {
        this.categoryMappings = {
            // 动作类游戏
            'action': 'action',
            'fighting': 'action',
            'shooter': 'action',
            'platform': 'action',
            'beat-em-up': 'action',
            // 冒险类游戏
            'adventure': 'adventure',
            'rpg': 'adventure',
            'role-playing': 'adventure',
            'quest': 'adventure',
            // 休闲类游戏
            'casual': 'casual',
            'arcade': 'casual',
            'family': 'casual',
            'kids': 'casual',
            // 益智类游戏
            'puzzle': 'puzzle',
            'brain': 'puzzle',
            'logic': 'puzzle',
            'word': 'puzzle',
            'trivia': 'puzzle',
            // 体育类游戏
            'sports': 'sports',
            'football': 'sports',
            'basketball': 'sports',
            'soccer': 'sports',
            'racing': 'sports',
            // 策略类游戏
            'strategy': 'strategy',
            'tower-defense': 'strategy',
            'simulation': 'strategy',
            'management': 'strategy',
            // 多人游戏
            'multiplayer': 'multiplayer',
            'io': 'multiplayer',
            'battle-royale': 'multiplayer'
        };
    };
    /**
     * 主预处理流程
     */
    GameDataPreprocessor.prototype.preprocessGameData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var games, validGames, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 开始游戏数据预处理...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.loadGameData()];
                    case 2:
                        games = _a.sent();
                        console.log("\uD83D\uDCCA \u52A0\u8F7D\u4E86 ".concat(games.length, " \u4E2A\u6E38\u620F\u6570\u636E"));
                        // 2. 验证数据完整性
                        console.log('🔍 验证数据完整性...');
                        validGames = this.validateGameData(games);
                        // 3. 生成唯一slug标识符
                        console.log('🏷️ 生成唯一slug标识符...');
                        this.generateUniqueSlugs(validGames);
                        // 4. 创建URL映射表
                        console.log('🗺️ 创建URL映射表...');
                        this.createUrlMappings(validGames);
                        // 5. 预处理iframe嵌入代码
                        console.log('🖼️ 预处理iframe嵌入代码...');
                        this.preprocessIframeCode(validGames);
                        // 6. 清理和标准化游戏分类
                        console.log('📂 标准化游戏分类...');
                        this.standardizeCategories(validGames);
                        // 7. 保存预处理结果
                        console.log('💾 保存预处理结果...');
                        return [4 /*yield*/, this.savePreprocessedData(validGames)];
                    case 3:
                        _a.sent();
                        result = {
                            totalGames: games.length,
                            validGames: validGames.length,
                            invalidGames: games.length - validGames.length,
                            duplicateSlugs: this.slugSet.size - validGames.length,
                            processedGames: validGames,
                            urlMappings: this.urlMappings,
                            categoryMappings: this.categoryMappings,
                            validationErrors: this.validationErrors
                        };
                        console.log('✅ 游戏数据预处理完成！');
                        this.printPreprocessingSummary(result);
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ 预处理过程中发生错误:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载游戏数据
     */
    GameDataPreprocessor.prototype.loadGameData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gamesIndexPath, gamesData;
            return __generator(this, function (_a) {
                gamesIndexPath = path.join(this.inputDir, 'games-index.json');
                if (!fs.existsSync(gamesIndexPath)) {
                    throw new Error('游戏索引文件不存在: ' + gamesIndexPath);
                }
                gamesData = JSON.parse(fs.readFileSync(gamesIndexPath, 'utf-8'));
                return [2 /*return*/, gamesData];
            });
        });
    };
    /**
     * 验证游戏数据完整性
     */
    GameDataPreprocessor.prototype.validateGameData = function (games) {
        var validGames = [];
        for (var _i = 0, games_1 = games; _i < games_1.length; _i++) {
            var game = games_1[_i];
            var errors = [];
            // 检查必需字段
            if (!game.id)
                errors.push('缺少游戏ID');
            if (!game.title || game.title.trim() === '')
                errors.push('缺少游戏标题');
            if (!game.thumbnail || game.thumbnail.trim() === '')
                errors.push('缺少游戏缩略图');
            if (!game.primary_category || game.primary_category.trim() === '')
                errors.push('缺少主分类');
            // 检查ID是否为有效数字
            if (typeof game.id !== 'number' || game.id <= 0) {
                errors.push('游戏ID无效');
            }
            // 检查缩略图URL格式
            if (game.thumbnail && !this.isValidUrl(game.thumbnail)) {
                errors.push('缩略图URL格式无效');
            }
            // 如果有错误，记录并跳过
            if (errors.length > 0) {
                this.validationErrors.push("\u6E38\u620F ".concat(game.id, " (").concat(game.title, "): ").concat(errors.join(', ')));
                continue;
            }
            validGames.push(game);
        }
        return validGames;
    };
    /**
     * 生成唯一slug标识符
     */
    GameDataPreprocessor.prototype.generateUniqueSlugs = function (games) {
        for (var _i = 0, games_2 = games; _i < games_2.length; _i++) {
            var game = games_2[_i];
            var baseSlug = this.generateSlugFromTitle(game.title);
            var uniqueSlug = baseSlug;
            var counter = 1;
            // 确保slug唯一性
            while (this.slugSet.has(uniqueSlug)) {
                uniqueSlug = "".concat(baseSlug, "-").concat(counter);
                counter++;
            }
            game.slug = uniqueSlug;
            this.slugSet.add(uniqueSlug);
        }
    };
    /**
     * 从标题生成slug
     */
    GameDataPreprocessor.prototype.generateSlugFromTitle = function (title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/-+/g, '-') // 多个连字符合并为一个
            .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
            .substring(0, 50); // 限制长度
    };
    /**
     * 创建URL映射表
     */
    GameDataPreprocessor.prototype.createUrlMappings = function (games) {
        for (var _i = 0, games_3 = games; _i < games_3.length; _i++) {
            var game = games_3[_i];
            // 创建多种URL映射
            this.urlMappings["/games/".concat(game.slug)] = game.id;
            this.urlMappings["/game/".concat(game.id)] = game.id;
            this.urlMappings["/play/".concat(game.slug)] = game.id;
            // 如果有分类，添加分类相关的URL
            if (game.primary_category) {
                this.urlMappings["/games/".concat(game.primary_category, "/").concat(game.slug)] = game.id;
            }
        }
    };
    /**
     * 预处理iframe嵌入代码
     */
    GameDataPreprocessor.prototype.preprocessIframeCode = function (games) {
        for (var _i = 0, games_4 = games; _i < games_4.length; _i++) {
            var game = games_4[_i];
            // 设置默认iframe尺寸
            if (!game.iframe_width)
                game.iframe_width = 800;
            if (!game.iframe_height)
                game.iframe_height = 600;
            // 如果没有iframe_src，生成一个占位符
            if (!game.iframe_src) {
                game.iframe_src = "/games/placeholder/".concat(game.id);
            }
            // 确保iframe_src是安全的URL
            if (game.iframe_src && !this.isValidUrl(game.iframe_src) && !game.iframe_src.startsWith('/')) {
                game.iframe_src = "/games/placeholder/".concat(game.id);
            }
        }
    };
    /**
     * 标准化游戏分类
     */
    GameDataPreprocessor.prototype.standardizeCategories = function (games) {
        var _this = this;
        for (var _i = 0, games_5 = games; _i < games_5.length; _i++) {
            var game = games_5[_i];
            // 标准化主分类
            var normalizedCategory = this.categoryMappings[game.primary_category.toLowerCase()] || game.primary_category;
            game.primary_category = normalizedCategory;
            // 标准化所有分类
            if (game.all_categories) {
                game.all_categories = game.all_categories.map(function (cat) {
                    return _this.categoryMappings[cat.toLowerCase()] || cat;
                });
                // 确保主分类在所有分类中
                if (!game.all_categories.includes(game.primary_category)) {
                    game.all_categories.unshift(game.primary_category);
                }
            }
            else {
                game.all_categories = [game.primary_category];
            }
            // 设置默认设备支持
            if (!game.devices || game.devices.length === 0) {
                game.devices = ['desktop', 'mobile'];
            }
            // 设置默认标签
            if (!game.tags || game.tags.length === 0) {
                game.tags = [game.primary_category, 'online', 'free'];
            }
        }
    };
    /**
     * 保存预处理结果
     */
    GameDataPreprocessor.prototype.savePreprocessedData = function (games) {
        return __awaiter(this, void 0, void 0, function () {
            var preprocessedGamesPath, urlMappingsPath, categoryMappingsPath, errorsPath;
            return __generator(this, function (_a) {
                preprocessedGamesPath = path.join(this.outputDir, 'preprocessed-games.json');
                fs.writeFileSync(preprocessedGamesPath, JSON.stringify(games, null, 2));
                urlMappingsPath = path.join(this.outputDir, 'url-mappings.json');
                fs.writeFileSync(urlMappingsPath, JSON.stringify(this.urlMappings, null, 2));
                categoryMappingsPath = path.join(this.outputDir, 'category-mappings.json');
                fs.writeFileSync(categoryMappingsPath, JSON.stringify(this.categoryMappings, null, 2));
                // 保存验证错误报告
                if (this.validationErrors.length > 0) {
                    errorsPath = path.join(this.outputDir, 'preprocessing-errors.json');
                    fs.writeFileSync(errorsPath, JSON.stringify({
                        timestamp: new Date().toISOString(),
                        totalErrors: this.validationErrors.length,
                        errors: this.validationErrors
                    }, null, 2));
                }
                console.log("\uD83D\uDCBE \u9884\u5904\u7406\u6570\u636E\u5DF2\u4FDD\u5B58\u5230: ".concat(this.outputDir));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 验证URL格式
     */
    GameDataPreprocessor.prototype.isValidUrl = function (url) {
        try {
            new URL(url);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * 打印预处理摘要
     */
    GameDataPreprocessor.prototype.printPreprocessingSummary = function (result) {
        console.log('\n📊 预处理摘要:');
        console.log("\u603B\u6E38\u620F\u6570: ".concat(result.totalGames));
        console.log("\u6709\u6548\u6E38\u620F\u6570: ".concat(result.validGames));
        console.log("\u65E0\u6548\u6E38\u620F\u6570: ".concat(result.invalidGames));
        console.log("\u91CD\u590Dslug\u6570: ".concat(result.duplicateSlugs));
        console.log("\u9A8C\u8BC1\u9519\u8BEF\u6570: ".concat(result.validationErrors.length));
        console.log("URL\u6620\u5C04\u6570: ".concat(Object.keys(result.urlMappings).length));
        console.log("\u5206\u7C7B\u6620\u5C04\u6570: ".concat(Object.keys(result.categoryMappings).length));
        if (result.validationErrors.length > 0) {
            console.log('\n⚠️ 验证错误（前10个）:');
            result.validationErrors.slice(0, 10).forEach(function (error) {
                console.log("  - ".concat(error));
            });
        }
    };
    return GameDataPreprocessor;
}());
exports.GameDataPreprocessor = GameDataPreprocessor;
/**
 * 主执行函数
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var preprocessor, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    preprocessor = new GameDataPreprocessor();
                    return [4 /*yield*/, preprocessor.preprocessGameData()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ 预处理失败:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// 如果直接运行此脚本
if (require.main === module) {
    main();
}
