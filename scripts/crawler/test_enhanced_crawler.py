#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试版增强爬虫 - 验证新功能
"""

from gamemonetize_enhanced_crawler import GameMonetizeEnhancedCrawler
import json

def main():
    """测试增强版爬虫功能"""
    print("🚀 开始测试增强版GameMonetize爬虫...")
    
    crawler = GameMonetizeEnhancedCrawler()
    
    # 只采集5个游戏进行测试
    success = crawler.crawl_games(target_count=5)
    
    if success and crawler.games:
        print(f"\n✅ 测试完成！成功采集 {len(crawler.games)} 个游戏")
        
        # 显示第一个游戏的详细信息
        first_game = crawler.games[0]
        print(f"\n📋 第一个游戏的详细信息:")
        print(f"游戏名称: {first_game['basic_info']['name']}")
        print(f"游戏标题: {first_game['game_info']['title']}")
        print(f"发布商: {first_game['game_info']['publisher']}")
        print(f"移动端兼容: {first_game['game_info']['mobile_compatible']}")
        print(f"支持语言: {first_game['game_info']['languages']}")
        
        print(f"\n🖼️ iframe信息:")
        iframe_info = first_game['iframe_info']
        print(f"找到iframe: {iframe_info['found']}")
        if iframe_info['found']:
            print(f"宽度: {iframe_info['width']}")
            print(f"高度: {iframe_info['height']}")
            print(f"宽高比: {iframe_info['aspect_ratio']}")
            print(f"iframe地址: {iframe_info['src'][:50]}...")
        
        print(f"\n🖼️ 缩略图信息:")
        thumbnails = first_game['thumbnails']
        print(f"缩略图数量: {len(thumbnails)}")
        for i, thumb in enumerate(thumbnails[:3]):  # 只显示前3个
            print(f"  {i+1}. {thumb['url'][:50]}... (尺寸: {thumb['size']})")
        
        print(f"\n📝 内容信息:")
        print(f"描述: {first_game['description'][:100]}...")
        print(f"操作说明: {first_game['instructions'][:100]}...")
        print(f"分类: {first_game['categories']}")
        print(f"标签: {first_game['tags'][:5]}")  # 只显示前5个标签
        print(f"推荐尺寸: {first_game['recommended_sizes']}")
        
        print(f"\n📊 质量评分: {first_game['quality_score']}/100")
        
        # 统计信息
        print(f"\n📈 采集统计:")
        with_iframe = len([g for g in crawler.games if g['iframe_info']['found']])
        with_thumbnails = len([g for g in crawler.games if g['thumbnails']])
        with_description = len([g for g in crawler.games if g['description']])
        with_categories = len([g for g in crawler.games if g['categories']])
        with_tags = len([g for g in crawler.games if g['tags']])
        
        print(f"有iframe: {with_iframe}/{len(crawler.games)}")
        print(f"有缩略图: {with_thumbnails}/{len(crawler.games)}")
        print(f"有描述: {with_description}/{len(crawler.games)}")
        print(f"有分类: {with_categories}/{len(crawler.games)}")
        print(f"有标签: {with_tags}/{len(crawler.games)}")
        
        # 保存测试结果
        with open('test_enhanced_results.json', 'w', encoding='utf-8') as f:
            json.dump(crawler.games, f, ensure_ascii=False, indent=2)
        print(f"\n💾 测试结果已保存到 test_enhanced_results.json")
        
    else:
        print("❌ 测试失败！")

if __name__ == "__main__":
    main() 