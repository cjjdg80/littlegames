#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/crawler/analyze_results.py
分析GameMonetize采集结果
"""

import json

def analyze_results():
    """分析采集结果"""
    with open('gamemonetize_hot_games_20250615_163401.json', 'r', encoding='utf-8') as f:
        games = json.load(f)

    print('🎮 GameMonetize采集结果分析')
    print('=' * 50)
    print(f'总游戏数: {len(games)}')

    # 统计有iframe的游戏
    iframe_games = [g for g in games if g.get('detail_info', {}).get('iframe_found', False)]
    print(f'有iframe的游戏: {len(iframe_games)}')

    # 显示前5个有iframe的游戏
    print('\n📋 前5个有iframe的游戏:')
    count = 0
    for game in games:
        if game.get('detail_info', {}).get('iframe_found', False) and game.get('detail_info', {}).get('iframe_src'):
            count += 1
            if count <= 5:
                print(f'{count}. {game["name"]}')
                print(f'   URL: {game["url"]}')
                print(f'   质量分: {game.get("detail_info", {}).get("quality_score", 0)}')
                iframe_src = game.get('detail_info', {}).get('iframe_src', '')
                if iframe_src:
                    print(f'   iframe: {iframe_src[:80]}...')
                print()
            else:
                break

    # 质量分布
    quality_scores = [g.get('detail_info', {}).get('quality_score', 0) for g in games]
    high_quality = len([s for s in quality_scores if s >= 80])
    medium_quality = len([s for s in quality_scores if 50 <= s < 80])
    low_quality = len([s for s in quality_scores if s < 50])

    print(f'📊 质量分布:')
    print(f'   高质量(80+分): {high_quality}')
    print(f'   中等质量(50-79分): {medium_quality}')
    print(f'   低质量(<50分): {low_quality}')

    # 显示一些真正的游戏
    print('\n🎯 真正的游戏示例:')
    real_games = [g for g in games if 'game' in g['url'] and g.get('detail_info', {}).get('quality_score', 0) >= 80]
    for i, game in enumerate(real_games[:3], 1):
        print(f'{i}. {game["name"]}')
        print(f'   URL: {game["url"]}')
        print(f'   质量分: {game.get("detail_info", {}).get("quality_score", 0)}')
        iframe_src = game.get('detail_info', {}).get('iframe_src', '')
        if iframe_src and len(iframe_src) > 10:
            print(f'   iframe: {iframe_src[:100]}...')
        print()

if __name__ == "__main__":
    analyze_results() 