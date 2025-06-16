# scripts/crawler/test_gamemonetize_seo.py - 测试GameMonetize SEO生成器
"""
测试GameMonetize SEO生成器
验证新的SEO生成器能否正确处理GameMonetize增强数据
"""

import json
import os
from gamemonetize_seo_generator import GameMonetizeSEOGenerator

def test_single_game_seo():
    """测试单个游戏的SEO生成"""
    print("🧪 测试单个游戏SEO生成...")
    
    # 模拟游戏数据
    test_game = {
        "basic_info": {
            "id": "ultimate-robot-fighting",
            "name": "Ultimate Robot Fighting",
            "url": "https://gamemonetize.com/ultimate-robot-fighting-game",
            "source": "gamemonetize",
            "collected_at": "2025-06-15T23:19:27.292552"
        },
        "game_info": {
            "title": "Ultimate Robot Fighting",
            "publisher": "bestgames.com",
            "mobile_compatible": "Mobile Compatible",
            "languages": ["English"]
        },
        "iframe_info": {
            "found": True,
            "src": "https://gamemonetize.com/ultimate-robot-fighting-game?referer=original",
            "width": "800",
            "height": "600",
            "aspect_ratio": 1.33,
            "full_code": "<iframe src=\"https://gamemonetize.com/ultimate-robot-fighting-game?referer=original\" width=\"800\" height=\"600\" scrolling=\"none\" frameborder=\"0\"></iframe>"
        },
        "thumbnails": [
            {
                "url": "https://img.gamemonetize.com/xo851pwg3e5nh7act1wsy486mjyb8w6u/512x384.jpg",
                "size": "512x384",
                "alt": "Ultimate Robot Fighting"
            },
            {
                "url": "https://img.gamemonetize.com/xo851pwg3e5nh7act1wsy486mjyb8w6u/512x512.jpg",
                "size": "512x512",
                "alt": "Ultimate Robot Fighting"
            }
        ],
        "description": "Enter ultimate showdown Ultimate Robot Fighting. Control your robot in battle.",
        "instructions": "Mouse click or tap to play",
        "categories": ["Action"],
        "tags": ["robot", "fighting", "action"],
        "quality_score": 70
    }
    
    # 创建SEO生成器
    generator = GameMonetizeSEOGenerator()
    
    # 生成SEO数据
    seo_data = generator.generate_game_seo(test_game)
    
    if seo_data:
        print("✅ SEO数据生成成功!")
        print(f"📝 标题: {seo_data['metadata']['title']}")
        print(f"📄 描述: {seo_data['metadata']['description']}")
        print(f"🏷️ 关键词: {', '.join(seo_data['metadata']['keywords'])}")
        print(f"🔗 Slug: {seo_data['slug']}")
        print(f"📂 分类: {seo_data['gameData']['category']}")
        print(f"🖼️ 缩略图: {seo_data['gameData']['thumbnail']}")
        print(f"📱 移动端兼容: {seo_data['gameData']['mobileCompatible']}")
        print(f"📐 宽高比: {seo_data['gameData']['iframe']['aspectRatio']}")
        print(f"⭐ 质量分数: {seo_data['gameData']['qualityScore']}")
        print(f"🎮 游戏特色: {', '.join(seo_data['contentVariant']['gameplayFeatures'])}")
        
        # 保存测试结果
        with open('test_seo_output.json', 'w', encoding='utf-8') as f:
            json.dump(seo_data, f, indent=2, ensure_ascii=False)
        print("💾 测试结果已保存到 test_seo_output.json")
        
        return True
    else:
        print("❌ SEO数据生成失败!")
        return False

def test_batch_seo_generation():
    """测试批量SEO生成"""
    print("\n🧪 测试批量SEO生成...")
    
    # 检查测试数据文件
    test_data_file = "gamemonetize_enhanced_games_20250615_232004.json"
    
    if not os.path.exists(test_data_file):
        print(f"❌ 测试数据文件不存在: {test_data_file}")
        print("请确保已运行增强爬虫并生成了测试数据")
        return False
    
    # 加载测试数据
    with open(test_data_file, 'r', encoding='utf-8') as f:
        games_data = json.load(f)
    
    print(f"📊 加载了 {len(games_data)} 个游戏数据")
    
    # 只测试前3个游戏
    test_games = games_data[:3]
    print(f"🎯 测试前 {len(test_games)} 个游戏")
    
    # 创建SEO生成器
    generator = GameMonetizeSEOGenerator()
    
    # 批量生成SEO数据
    output_dir = "test_seo_batch_output"
    results = generator.batch_generate_seo(test_games, output_dir)
    
    print(f"\n📊 批量测试结果:")
    print(f"   总数: {results['total']}")
    print(f"   成功: {results['successful']}")
    print(f"   失败: {results['failed']}")
    
    if results['successful'] > 0:
        print(f"✅ 批量生成测试成功!")
        print(f"📁 输出目录: {output_dir}/games")
        
        # 显示生成的游戏列表
        for game in results['games']:
            print(f"   - {game['title']} ({game['category']}) -> {game['slug']}.json")
        
        return True
    else:
        print("❌ 批量生成测试失败!")
        if results['errors']:
            print("错误信息:")
            for error in results['errors'][:3]:
                print(f"   - {error}")
        return False

def test_seo_data_structure():
    """测试SEO数据结构完整性"""
    print("\n🧪 测试SEO数据结构完整性...")
    
    # 创建测试游戏数据
    test_game = {
        "basic_info": {
            "id": "test-puzzle-game",
            "name": "Test Puzzle Game",
            "url": "https://gamemonetize.com/test-puzzle-game",
            "source": "gamemonetize"
        },
        "game_info": {
            "title": "Test Puzzle Game",
            "publisher": "TestPublisher",
            "mobile_compatible": "Mobile Compatible",
            "languages": ["English", "Spanish"]
        },
        "iframe_info": {
            "found": True,
            "src": "https://gamemonetize.com/test-puzzle-game",
            "width": "1024",
            "height": "768",
            "aspect_ratio": 1.33
        },
        "thumbnails": [
            {
                "url": "https://img.gamemonetize.com/test123/512x384.jpg",
                "size": "512x384",
                "alt": "Test Puzzle Game"
            }
        ],
        "description": "A challenging puzzle game to test your skills",
        "instructions": "Use mouse to click and drag pieces",
        "categories": ["Puzzle"],
        "tags": ["puzzle", "brain", "logic"],
        "quality_score": 85
    }
    
    generator = GameMonetizeSEOGenerator()
    seo_data = generator.generate_game_seo(test_game)
    
    if not seo_data:
        print("❌ SEO数据生成失败!")
        return False
    
    # 检查必需字段
    required_fields = [
        'gameId', 'slug', 'metadata', 'breadcrumbs', 
        'relatedGames', 'contentVariant', 'gameData'
    ]
    
    missing_fields = []
    for field in required_fields:
        if field not in seo_data:
            missing_fields.append(field)
    
    if missing_fields:
        print(f"❌ 缺少必需字段: {', '.join(missing_fields)}")
        return False
    
    # 检查metadata结构
    metadata_fields = ['title', 'description', 'keywords', 'canonical', 'openGraph', 'twitter']
    for field in metadata_fields:
        if field not in seo_data['metadata']:
            print(f"❌ metadata缺少字段: {field}")
            return False
    
    # 检查gameData结构
    gamedata_fields = ['title', 'category', 'publisher', 'thumbnail', 'iframe', 'instructions']
    for field in gamedata_fields:
        if field not in seo_data['gameData']:
            print(f"❌ gameData缺少字段: {field}")
            return False
    
    # 检查数据类型
    if not isinstance(seo_data['metadata']['keywords'], list):
        print("❌ keywords应该是数组类型")
        return False
    
    if not isinstance(seo_data['breadcrumbs'], list):
        print("❌ breadcrumbs应该是数组类型")
        return False
    
    if not isinstance(seo_data['gameData']['iframe']['aspectRatio'], (int, float)):
        print("❌ aspectRatio应该是数字类型")
        return False
    
    print("✅ SEO数据结构完整性检查通过!")
    print(f"   - 包含所有必需字段")
    print(f"   - metadata结构正确")
    print(f"   - gameData结构正确")
    print(f"   - 数据类型正确")
    
    return True

def main():
    """主测试函数"""
    print("🚀 开始测试GameMonetize SEO生成器")
    print("=" * 50)
    
    # 测试计数
    tests_passed = 0
    total_tests = 3
    
    # 测试1: 单个游戏SEO生成
    if test_single_game_seo():
        tests_passed += 1
    
    # 测试2: 批量SEO生成
    if test_batch_seo_generation():
        tests_passed += 1
    
    # 测试3: SEO数据结构完整性
    if test_seo_data_structure():
        tests_passed += 1
    
    # 测试结果汇总
    print("\n" + "=" * 50)
    print(f"🎯 测试完成: {tests_passed}/{total_tests} 通过")
    
    if tests_passed == total_tests:
        print("🎉 所有测试通过! SEO生成器工作正常")
        print("✨ 可以开始批量生成GameMonetize游戏的SEO数据了")
    else:
        print("⚠️ 部分测试失败，请检查错误信息并修复")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    main() 