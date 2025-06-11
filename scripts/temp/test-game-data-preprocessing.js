"use strict";
// test-game-data-preprocessing.ts
// 游戏数据预处理功能测试脚本
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
exports.GameDataPreprocessingTester = void 0;
var fs = require("fs");
var path = require("path");
/**
 * 测试游戏数据预处理结果
 */
var GameDataPreprocessingTester = /** @class */ (function () {
    function GameDataPreprocessingTester() {
        this.testResults = {};
        this.processedDir = path.join(process.cwd(), 'scripts/processed');
    }
    /**
     * 运行所有测试
     */
    GameDataPreprocessingTester.prototype.runAllTests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🧪 开始测试游戏数据预处理结果...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        // 测试1: 验证预处理后的游戏数据
                        return [4 /*yield*/, this.testPreprocessedGames()];
                    case 2:
                        // 测试1: 验证预处理后的游戏数据
                        _a.sent();
                        // 测试2: 验证URL映射表
                        return [4 /*yield*/, this.testUrlMappings()];
                    case 3:
                        // 测试2: 验证URL映射表
                        _a.sent();
                        // 测试3: 验证分类映射
                        return [4 /*yield*/, this.testCategoryMappings()];
                    case 4:
                        // 测试3: 验证分类映射
                        _a.sent();
                        // 测试4: 验证数据完整性
                        return [4 /*yield*/, this.testDataIntegrity()];
                    case 5:
                        // 测试4: 验证数据完整性
                        _a.sent();
                        // 测试5: 验证slug唯一性
                        return [4 /*yield*/, this.testSlugUniqueness()];
                    case 6:
                        // 测试5: 验证slug唯一性
                        _a.sent();
                        // 打印测试结果
                        this.printTestResults();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('❌ 测试过程中发生错误:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 测试预处理后的游戏数据
     */
    GameDataPreprocessingTester.prototype.testPreprocessedGames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, games;
            var _this = this;
            return __generator(this, function (_a) {
                console.log('\n🔍 测试1: 验证预处理后的游戏数据...');
                filePath = path.join(this.processedDir, 'preprocessed-games.json');
                if (!fs.existsSync(filePath)) {
                    throw new Error('预处理游戏数据文件不存在');
                }
                games = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                this.testResults.preprocessedGames = {
                    fileExists: true,
                    totalGames: games.length,
                    sampleGame: games[0],
                    hasRequiredFields: this.validateGameFields(games[0]),
                    allGamesValid: games.every(function (game) { return _this.validateGameFields(game); })
                };
                console.log("\u2705 \u9884\u5904\u7406\u6E38\u620F\u6570\u636E: ".concat(games.length, " \u4E2A\u6E38\u620F"));
                console.log("\u2705 \u6240\u6709\u6E38\u620F\u5B57\u6BB5\u5B8C\u6574: ".concat(this.testResults.preprocessedGames.allGamesValid));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试URL映射表
     */
    GameDataPreprocessingTester.prototype.testUrlMappings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, mappings, mappingKeys, gamesPaths, playPaths, gamePaths;
            return __generator(this, function (_a) {
                console.log('\n🔍 测试2: 验证URL映射表...');
                filePath = path.join(this.processedDir, 'url-mappings.json');
                if (!fs.existsSync(filePath)) {
                    throw new Error('URL映射文件不存在');
                }
                mappings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                mappingKeys = Object.keys(mappings);
                gamesPaths = mappingKeys.filter(function (key) { return key.startsWith('/games/'); });
                playPaths = mappingKeys.filter(function (key) { return key.startsWith('/play/'); });
                gamePaths = mappingKeys.filter(function (key) { return key.startsWith('/game/'); });
                this.testResults.urlMappings = {
                    fileExists: true,
                    totalMappings: mappingKeys.length,
                    gamesPathCount: gamesPaths.length,
                    playPathCount: playPaths.length,
                    gamePathCount: gamePaths.length,
                    sampleMappings: {
                        games: gamesPaths.slice(0, 3),
                        play: playPaths.slice(0, 3),
                        game: gamePaths.slice(0, 3)
                    }
                };
                console.log("\u2705 URL\u6620\u5C04\u8868: ".concat(mappingKeys.length, " \u4E2A\u6620\u5C04"));
                console.log("\u2705 /games/ \u8DEF\u5F84: ".concat(gamesPaths.length, " \u4E2A"));
                console.log("\u2705 /play/ \u8DEF\u5F84: ".concat(playPaths.length, " \u4E2A"));
                console.log("\u2705 /game/ \u8DEF\u5F84: ".concat(gamePaths.length, " \u4E2A"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试分类映射
     */
    GameDataPreprocessingTester.prototype.testCategoryMappings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, mappings, categories, uniqueTargets;
            return __generator(this, function (_a) {
                console.log('\n🔍 测试3: 验证分类映射...');
                filePath = path.join(this.processedDir, 'category-mappings.json');
                if (!fs.existsSync(filePath)) {
                    throw new Error('分类映射文件不存在');
                }
                mappings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                categories = Object.keys(mappings);
                uniqueTargets = Array.from(new Set(Object.values(mappings)));
                this.testResults.categoryMappings = {
                    fileExists: true,
                    totalCategories: categories.length,
                    uniqueTargets: uniqueTargets.length,
                    targetCategories: uniqueTargets,
                    sampleMappings: Object.fromEntries(Object.entries(mappings).slice(0, 10))
                };
                console.log("\u2705 \u5206\u7C7B\u6620\u5C04: ".concat(categories.length, " \u4E2A\u539F\u59CB\u5206\u7C7B -> ").concat(uniqueTargets.length, " \u4E2A\u6807\u51C6\u5206\u7C7B"));
                console.log("\u2705 \u6807\u51C6\u5206\u7C7B: ".concat(uniqueTargets.join(', ')));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试数据完整性
     */
    GameDataPreprocessingTester.prototype.testDataIntegrity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var errorsPath, errors, errorData, originalPath, preprocessedPath, originalGames, preprocessedGames;
            return __generator(this, function (_a) {
                console.log('\n🔍 测试4: 验证数据完整性...');
                errorsPath = path.join(this.processedDir, 'preprocessing-errors.json');
                errors = [];
                if (fs.existsSync(errorsPath)) {
                    errorData = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'));
                    errors = errorData.errors || [];
                }
                originalPath = path.join(this.processedDir, 'games-index.json');
                preprocessedPath = path.join(this.processedDir, 'preprocessed-games.json');
                originalGames = JSON.parse(fs.readFileSync(originalPath, 'utf-8'));
                preprocessedGames = JSON.parse(fs.readFileSync(preprocessedPath, 'utf-8'));
                this.testResults.dataIntegrity = {
                    originalCount: originalGames.length,
                    preprocessedCount: preprocessedGames.length,
                    errorCount: errors.length,
                    dataLossRate: ((originalGames.length - preprocessedGames.length) / originalGames.length * 100).toFixed(2) + '%',
                    sampleErrors: errors.slice(0, 5)
                };
                console.log("\u2705 \u539F\u59CB\u6E38\u620F\u6570: ".concat(originalGames.length));
                console.log("\u2705 \u9884\u5904\u7406\u540E\u6E38\u620F\u6570: ".concat(preprocessedGames.length));
                console.log("\u2705 \u6570\u636E\u4E22\u5931\u7387: ".concat(this.testResults.dataIntegrity.dataLossRate));
                console.log("\u2705 \u9A8C\u8BC1\u9519\u8BEF\u6570: ".concat(errors.length));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试slug唯一性
     */
    GameDataPreprocessingTester.prototype.testSlugUniqueness = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, games, slugs, uniqueSlugs, duplicates;
            return __generator(this, function (_a) {
                console.log('\n🔍 测试5: 验证slug唯一性...');
                filePath = path.join(this.processedDir, 'preprocessed-games.json');
                games = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                slugs = games.map(function (game) { return game.slug; });
                uniqueSlugs = new Set(slugs);
                duplicates = slugs.filter(function (slug, index) {
                    return slugs.indexOf(slug) !== index;
                });
                this.testResults.slugUniqueness = {
                    totalSlugs: slugs.length,
                    uniqueSlugs: uniqueSlugs.size,
                    duplicateCount: duplicates.length,
                    duplicates: Array.from(new Set(duplicates)),
                    isUnique: duplicates.length === 0
                };
                console.log("\u2705 \u603Bslug\u6570: ".concat(slugs.length));
                console.log("\u2705 \u552F\u4E00slug\u6570: ".concat(uniqueSlugs.size));
                console.log("\u2705 \u91CD\u590Dslug\u6570: ".concat(duplicates.length));
                console.log("\u2705 slug\u552F\u4E00\u6027: ".concat(duplicates.length === 0 ? '通过' : '失败'));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 验证游戏字段完整性
     */
    GameDataPreprocessingTester.prototype.validateGameFields = function (game) {
        var requiredFields = [
            'id', 'slug', 'title', 'thumbnail', 'primary_category',
            'iframe_width', 'iframe_height', 'iframe_src', 'all_categories',
            'devices', 'tags', 'batch_number', 'featured'
        ];
        return requiredFields.every(function (field) {
            var hasField = game.hasOwnProperty(field);
            var isNotEmpty = game[field] !== null && game[field] !== undefined && game[field] !== '';
            return hasField && isNotEmpty;
        });
    };
    /**
     * 打印测试结果
     */
    GameDataPreprocessingTester.prototype.printTestResults = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        console.log('\n📊 测试结果摘要:');
        console.log('=====================================');
        // 预处理游戏数据测试
        console.log("\n1. \u9884\u5904\u7406\u6E38\u620F\u6570\u636E:");
        console.log("   - \u6587\u4EF6\u5B58\u5728: ".concat(((_a = this.testResults.preprocessedGames) === null || _a === void 0 ? void 0 : _a.fileExists) ? '✅' : '❌'));
        console.log("   - \u6E38\u620F\u603B\u6570: ".concat(((_b = this.testResults.preprocessedGames) === null || _b === void 0 ? void 0 : _b.totalGames) || 0));
        console.log("   - \u5B57\u6BB5\u5B8C\u6574\u6027: ".concat(((_c = this.testResults.preprocessedGames) === null || _c === void 0 ? void 0 : _c.allGamesValid) ? '✅' : '❌'));
        // URL映射测试
        console.log("\n2. URL\u6620\u5C04\u8868:");
        console.log("   - \u6587\u4EF6\u5B58\u5728: ".concat(((_d = this.testResults.urlMappings) === null || _d === void 0 ? void 0 : _d.fileExists) ? '✅' : '❌'));
        console.log("   - \u6620\u5C04\u603B\u6570: ".concat(((_e = this.testResults.urlMappings) === null || _e === void 0 ? void 0 : _e.totalMappings) || 0));
        console.log("   - /games/ \u8DEF\u5F84: ".concat(((_f = this.testResults.urlMappings) === null || _f === void 0 ? void 0 : _f.gamesPathCount) || 0));
        console.log("   - /play/ \u8DEF\u5F84: ".concat(((_g = this.testResults.urlMappings) === null || _g === void 0 ? void 0 : _g.playPathCount) || 0));
        // 分类映射测试
        console.log("\n3. \u5206\u7C7B\u6620\u5C04:");
        console.log("   - \u6587\u4EF6\u5B58\u5728: ".concat(((_h = this.testResults.categoryMappings) === null || _h === void 0 ? void 0 : _h.fileExists) ? '✅' : '❌'));
        console.log("   - \u539F\u59CB\u5206\u7C7B\u6570: ".concat(((_j = this.testResults.categoryMappings) === null || _j === void 0 ? void 0 : _j.totalCategories) || 0));
        console.log("   - \u6807\u51C6\u5206\u7C7B\u6570: ".concat(((_k = this.testResults.categoryMappings) === null || _k === void 0 ? void 0 : _k.uniqueTargets) || 0));
        // 数据完整性测试
        console.log("\n4. \u6570\u636E\u5B8C\u6574\u6027:");
        console.log("   - \u539F\u59CB\u6E38\u620F\u6570: ".concat(((_l = this.testResults.dataIntegrity) === null || _l === void 0 ? void 0 : _l.originalCount) || 0));
        console.log("   - \u9884\u5904\u7406\u540E\u6E38\u620F\u6570: ".concat(((_m = this.testResults.dataIntegrity) === null || _m === void 0 ? void 0 : _m.preprocessedCount) || 0));
        console.log("   - \u6570\u636E\u4E22\u5931\u7387: ".concat(((_o = this.testResults.dataIntegrity) === null || _o === void 0 ? void 0 : _o.dataLossRate) || '0%'));
        console.log("   - \u9A8C\u8BC1\u9519\u8BEF\u6570: ".concat(((_p = this.testResults.dataIntegrity) === null || _p === void 0 ? void 0 : _p.errorCount) || 0));
        // slug唯一性测试
        console.log("\n5. Slug\u552F\u4E00\u6027:");
        console.log("   - \u603Bslug\u6570: ".concat(((_q = this.testResults.slugUniqueness) === null || _q === void 0 ? void 0 : _q.totalSlugs) || 0));
        console.log("   - \u552F\u4E00slug\u6570: ".concat(((_r = this.testResults.slugUniqueness) === null || _r === void 0 ? void 0 : _r.uniqueSlugs) || 0));
        console.log("   - \u91CD\u590D\u6570\u91CF: ".concat(((_s = this.testResults.slugUniqueness) === null || _s === void 0 ? void 0 : _s.duplicateCount) || 0));
        console.log("   - \u552F\u4E00\u6027\u68C0\u67E5: ".concat(((_t = this.testResults.slugUniqueness) === null || _t === void 0 ? void 0 : _t.isUnique) ? '✅' : '❌'));
        // 总体结果
        var allTestsPassed = (((_u = this.testResults.preprocessedGames) === null || _u === void 0 ? void 0 : _u.fileExists) &&
            ((_v = this.testResults.preprocessedGames) === null || _v === void 0 ? void 0 : _v.allGamesValid) &&
            ((_w = this.testResults.urlMappings) === null || _w === void 0 ? void 0 : _w.fileExists) &&
            ((_x = this.testResults.categoryMappings) === null || _x === void 0 ? void 0 : _x.fileExists) &&
            ((_y = this.testResults.slugUniqueness) === null || _y === void 0 ? void 0 : _y.isUnique));
        console.log("\n\uD83C\uDFAF \u603B\u4F53\u6D4B\u8BD5\u7ED3\u679C: ".concat(allTestsPassed ? '✅ 全部通过' : '❌ 存在问题'));
        if (allTestsPassed) {
            console.log('\n🎉 游戏数据预处理任务已成功完成！');
            console.log('📋 完成的任务清单:');
            console.log('   ✅ 验证所有游戏数据完整性');
            console.log('   ✅ 生成唯一slug标识符');
            console.log('   ✅ 创建游戏URL映射表');
            console.log('   ✅ 预处理iframe嵌入代码');
            console.log('   ✅ 清理和标准化游戏分类');
        }
    };
    return GameDataPreprocessingTester;
}());
exports.GameDataPreprocessingTester = GameDataPreprocessingTester;
/**
 * 主执行函数
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tester, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tester = new GameDataPreprocessingTester();
                    return [4 /*yield*/, tester.runAllTests()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ 测试失败:', error_2);
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
