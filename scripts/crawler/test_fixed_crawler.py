# scripts/crawler/test_fixed_crawler.py - 测试修复后的爬虫
"""
使用修复后的爬虫采集少量游戏进行验证
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gamemonetize_enhanced_crawler import GameMonetizeEnhancedCrawler
import json
import logging

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_fixed_crawler():
    """测试修复后的爬虫"""
    print("🧪 开始测试修复后的GameMonetize增强爬虫...")
    
    # 创建爬虫实例
    crawler = GameMonetizeEnhancedCrawler()
    
    # 设置测试URL
    test_urls = [
        "https://gamemonetize.com/among-us-online-edition-game",
        "https://gamemonetize.com/ultimate-robot-fighting-game",
        "https://gamemonetize.com/construction-simulator-lite-game"
    ]
    
    if not crawler.setup_driver():
        print("❌ 浏览器驱动初始化失败")
        return False
    
    try:
        results = []
        
        for i, url in enumerate(test_urls, 1):
            print(f"\n{'='*60}")
            print(f"🎮 测试游戏 {i}/{len(test_urls)}: {url}")
            print(f"{'='*60}")
            
            # 提取游戏信息
            game_info = crawler.extract_complete_game_info(url)
            
            if game_info:
                results.append(game_info)
                
                # 显示提取结果
                basic_info = game_info['basic_info']
                print(f"✅ 游戏名称: {basic_info['name']}")
                print(f"📝 描述: {game_info['description'][:100]}..." if game_info['description'] else "❌ 无描述")
                print(f"🏷️ 标签: {', '.join(game_info['tags'])}" if game_info['tags'] else "❌ 无标签")
                print(f"🎯 质量分: {game_info['quality_score']}")
                print(f"🖼️ 缩略图: {len(game_info['thumbnails'])} 张")
                print(f"🎮 iframe: {'✅' if game_info['iframe_info']['found'] else '❌'}")
                
            else:
                print(f"❌ 提取失败")
        
        # 保存测试结果
        if results:
            test_file = "test_fixed_crawler_results.json"
            with open(test_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            print(f"\n{'='*80}")
            print(f"📊 测试结果汇总")
            print(f"{'='*80}")
            print(f"总测试数: {len(test_urls)}")
            print(f"成功数: {len(results)}")
            print(f"成功率: {len(results)/len(test_urls)*100:.1f}%")
            
            # 数据完整性分析
            with_description = len([g for g in results if g['description']])
            with_tags = len([g for g in results if g['tags']])
            with_iframe = len([g for g in results if g['iframe_info']['found']])
            with_thumbnails = len([g for g in results if g['thumbnails']])
            
            print(f"\n📋 数据完整性:")
            print(f"有描述: {with_description}/{len(results)} ({with_description/len(results)*100:.1f}%)")
            print(f"有标签: {with_tags}/{len(results)} ({with_tags/len(results)*100:.1f}%)")
            print(f"有iframe: {with_iframe}/{len(results)} ({with_iframe/len(results)*100:.1f}%)")
            print(f"有缩略图: {with_thumbnails}/{len(results)} ({with_thumbnails/len(results)*100:.1f}%)")
            
            # 质量分析
            quality_scores = [g['quality_score'] for g in results]
            avg_quality = sum(quality_scores) / len(quality_scores)
            print(f"\n🎯 质量分析:")
            print(f"平均质量分: {avg_quality:.2f}")
            
            print(f"\n💾 测试结果已保存到: {test_file}")
            
            # 检查修复效果
            if with_description == len(results) and with_tags == len(results):
                print(f"\n🎉 修复完全成功！所有游戏都成功提取了描述和标签")
                return True
            elif with_description > 0 or with_tags > 0:
                print(f"\n✅ 修复部分成功！提取到了一些描述和标签")
                return True
            else:
                print(f"\n❌ 修复失败，仍然无法提取描述和标签")
                return False
        else:
            print(f"\n❌ 所有测试都失败了")
            return False
            
    finally:
        if crawler.driver:
            crawler.driver.quit()

def main():
    """主函数"""
    success = test_fixed_crawler()
    
    if success:
        print(f"\n🚀 修复验证成功！可以开始重新采集游戏数据了")
        
        # 询问是否开始重新采集
        print(f"\n💡 建议操作:")
        print(f"1. 删除之前的采集结果文件")
        print(f"2. 重新运行增强爬虫采集500个游戏")
        print(f"3. 生成SEO文件")
        
    else:
        print(f"\n❌ 修复验证失败，需要进一步调试")

if __name__ == "__main__":
    main() 