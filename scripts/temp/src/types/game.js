"use strict";
// src/types/game.ts - 游戏相关类型定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceType = exports.GameCategory = void 0;
/**
 * 游戏分类枚举
 */
var GameCategory;
(function (GameCategory) {
    GameCategory["ACTION"] = "action";
    GameCategory["PUZZLE"] = "puzzle";
    GameCategory["STRATEGY"] = "strategy";
    GameCategory["SPORTS"] = "sports";
    GameCategory["RACING"] = "racing";
    GameCategory["ADVENTURE"] = "adventure";
    GameCategory["ARCADE"] = "arcade";
    GameCategory["SIMULATION"] = "simulation";
})(GameCategory || (exports.GameCategory = GameCategory = {}));
/**
 * 设备支持类型
 */
var DeviceType;
(function (DeviceType) {
    DeviceType["DESKTOP"] = "desktop";
    DeviceType["MOBILE"] = "mobile";
    DeviceType["TABLET"] = "tablet";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
