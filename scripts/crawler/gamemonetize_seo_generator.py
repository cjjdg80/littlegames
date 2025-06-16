# scripts/crawler/gamemonetize_seo_generator.py - GameMonetize游戏SEO内容生成器
"""
GameMonetize游戏SEO内容生成器
专门处理GameMonetize增强爬虫采集的游戏数据，生成完整的SEO内容
支持iframe尺寸比例、缩略图、操作说明、分类标签等新增数据
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import hashlib

class GameMonetizeSEOGenerator:
    """GameMonetize游戏SEO内容生成器"""
    
    def __init__(self, base_url: str = "https://playbrowserminigames.com"):
        self.base_url = base_url
        self.category_mapping = {
            "Action": "action",
            "Puzzle": "puzzle", 
            "Adventure": "adventure",
            "Casual": "casual",
            "Racing": "racing",
            "Sports": "sports",
            "Strategy": "strategy",
            "Arcade": "arcade",
            "Simulation": "simulation"
        }
        
        # SEO模板配置
        self.seo_templates = {
            "action": {
                "title_patterns": [
                    "{game_name} - Exciting Action Adventure Game",
                    "Play {game_name} - Free Action Game Online", 
                    "{game_name} - Thrilling Action Gaming Experience",
                    "Free {game_name} Game - Action Packed Fun"
                ],
                "description_patterns": [
                    "Experience thrilling action in {game_name}! This exciting {category} game offers intense gameplay with instant browser play. Play free online now and enjoy hours of entertainment.",
                    "Get your adrenaline pumping with {game_name}! This action-packed game features {iframe_ratio} aspect ratio for optimal viewing. {instructions}",
                    "Join the action in {game_name}! This captivating {category} game offers instant browser play and guarantees hours of entertainment. Play free online now!"
                ],
                "keywords": ["action games", "free online games", "browser games", "intense gaming", "adrenaline games"]
            },
            "puzzle": {
                "title_patterns": [
                    "{game_name} - Brain Training Puzzle Challenge",
                    "Play {game_name} - Free Puzzle Game Online",
                    "Puzzle Game {game_name} - Test Your Skills", 
                    "Free {game_name} Game - Mind Bending Puzzles"
                ],
                "description_patterns": [
                    "Put your thinking skills to the test in {game_name}. This free online puzzle game brings you instant browser play and endless brain-teasing fun.",
                    "Sharpen your mind with {game_name}! This captivating puzzle game features instant browser play and guarantees intellectual entertainment. Play free now!",
                    "Exercise your brain with {game_name}. This clever puzzle game offers instant browser play and provides hours of mental stimulation. Start solving puzzles today!"
                ],
                "keywords": ["puzzle games", "brain games", "mind games", "logic games", "brain training"]
            },
            "adventure": {
                "title_patterns": [
                    "{game_name} - Thrilling Adventure Quest",
                    "Free {game_name} Game - Adventure Awaits",
                    "{game_name} Online - Explore and Discover",
                    "{game_name} - Epic Adventure Journey"
                ],
                "description_patterns": [
                    "Start your epic journey with {game_name}! This engaging adventure game features instant browser play and promises hours of adventure. Play free now!",
                    "Discover new worlds in {game_name}. This exciting adventure game offers instant browser play and provides endless exploration opportunities. Start your adventure today!",
                    "Embark on an epic journey in {game_name}! This immersive adventure game features instant browser play and takes you on unforgettable adventures. Play free online now!"
                ],
                "keywords": ["adventure games", "exploration games", "quest games", "story games", "online adventure"]
            },
            "casual": {
                "title_patterns": [
                    "{game_name} - Fun Casual Gaming",
                    "Play {game_name} - Relaxing Casual Game",
                    "{game_name} Online - Easy Fun Gaming",
                    "Free {game_name} - Casual Entertainment"
                ],
                "description_patterns": [
                    "Relax and enjoy {game_name}! This casual game offers easy-to-learn gameplay with instant browser play. Perfect for quick gaming sessions.",
                    "Unwind with {game_name}! This casual gaming experience features simple controls and endless fun. Play instantly in your browser!",
                    "Enjoy casual gaming with {game_name}! This relaxing game offers instant browser play and provides stress-free entertainment. Play free now!"
                ],
                "keywords": ["casual games", "relaxing games", "easy games", "fun games", "stress relief"]
            }
        }
    
    def generate_slug(self, game_name: str) -> str:
        """从游戏名称生成URL slug"""
        # 转换为小写并替换特殊字符
        slug = re.sub(r'[^\w\s-]', '', game_name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    def get_primary_thumbnail(self, thumbnails: List[Dict]) -> str:
        """获取主要缩略图URL"""
        if not thumbnails:
            return f"{self.base_url}/images/default-game.jpg"
        
        # 优先选择512x384尺寸的缩略图
        for thumb in thumbnails:
            if thumb.get('size') == '512x384' and 'gamemonetize.com' in thumb.get('url', ''):
                return thumb['url']
        
        # 其次选择512x512
        for thumb in thumbnails:
            if thumb.get('size') == '512x512' and 'gamemonetize.com' in thumb.get('url', ''):
                return thumb['url']
        
        # 最后选择第一个有效的缩略图
        for thumb in thumbnails:
            if 'gamemonetize.com' in thumb.get('url', ''):
                return thumb['url']
        
        return f"{self.base_url}/images/default-game.jpg"
    
    def get_primary_category(self, categories: List[str]) -> str:
        """获取主要分类"""
        if not categories:
            return "casual"
        
        # 映射到标准分类
        primary = categories[0]
        return self.category_mapping.get(primary, primary.lower())
    
    def format_aspect_ratio(self, aspect_ratio: float) -> str:
        """格式化宽高比描述"""
        if aspect_ratio >= 1.7:
            return "widescreen"
        elif aspect_ratio >= 1.2:
            return "standard"
        else:
            return "portrait"
    
    def generate_game_seo(self, game_data: Dict[str, Any]) -> Dict[str, Any]:
        """为单个游戏生成SEO数据"""
        try:
            # 提取基础信息
            basic_info = game_data.get('basic_info', {})
            game_info = game_data.get('game_info', {})
            iframe_info = game_data.get('iframe_info', {})
            thumbnails = game_data.get('thumbnails', [])
            categories = game_data.get('categories', [])
            
            # 基础数据
            game_id = basic_info.get('id', 'unknown')
            game_name = game_info.get('title', basic_info.get('name', 'Unknown Game'))
            slug = self.generate_slug(game_name)
            primary_category = self.get_primary_category(categories)
            thumbnail_url = self.get_primary_thumbnail(thumbnails)
            publisher = game_info.get('publisher', 'Unknown Publisher')
            instructions = game_data.get('instructions', 'Click or tap to play')
            description = game_data.get('description', '')
            
            # iframe信息
            aspect_ratio = iframe_info.get('aspect_ratio', 1.33)
            iframe_width = iframe_info.get('width', '800')
            iframe_height = iframe_info.get('height', '600')
            iframe_src = iframe_info.get('src', '')
            
            # 获取SEO模板
            template = self.seo_templates.get(primary_category, self.seo_templates['casual'])
            
            # 生成标题
            title_pattern = template['title_patterns'][hash(game_name) % len(template['title_patterns'])]
            seo_title = title_pattern.format(
                game_name=game_name,
                category=primary_category
            )
            
            # 生成描述
            desc_pattern = template['description_patterns'][hash(game_name) % len(template['description_patterns'])]
            seo_description = desc_pattern.format(
                game_name=game_name,
                category=primary_category,
                iframe_ratio=self.format_aspect_ratio(aspect_ratio),
                instructions=instructions
            )
            
            # 限制描述长度
            if len(seo_description) > 160:
                seo_description = seo_description[:157] + "..."
            
            # 生成关键词
            keywords = [
                f"play {game_name}",
                f"{game_name} online",
                f"free {primary_category}",
                f"{primary_category} games"
            ]
            keywords.extend(template['keywords'][:3])
            
            # 生成面包屑导航
            breadcrumbs = [
                {"label": "Home", "href": "/"},
                {"label": "Games", "href": "/games"},
                {"label": primary_category.title(), "href": f"/categories/{primary_category}"},
                {"label": game_name, "href": f"/games/{slug}", "current": True}
            ]
            
            # 生成内容变体
            variant_id = f"{primary_category}_{hash(game_name) % 1000:03d}"
            content_variant = {
                "variantId": variant_id,
                "customDescription": self.generate_custom_description(primary_category),
                "featuredTags": categories[:3] if categories else [],
                "recommendationReason": self.generate_recommendation_reason(primary_category),
                "gameplayFeatures": self.extract_gameplay_features(game_data)
            }
            
            # 构建完整的SEO数据
            seo_data = {
                "gameId": game_id,
                "slug": slug,
                "metadata": {
                    "title": seo_title,
                    "description": seo_description,
                    "keywords": keywords,
                    "canonical": f"{self.base_url}/games/{slug}",
                    "openGraph": {
                        "title": seo_title,
                        "description": seo_description,
                        "image": thumbnail_url,
                        "url": f"{self.base_url}/games/{slug}",
                        "type": "article"
                    },
                    "twitter": {
                        "card": "summary_large_image",
                        "title": seo_title,
                        "description": seo_description,
                        "image": thumbnail_url
                    }
                },
                "breadcrumbs": breadcrumbs,
                "relatedGames": [],  # 可以后续填充
                "contentVariant": content_variant,
                "gameData": {
                    "title": game_name,
                    "category": primary_category,
                    "publisher": publisher,
                    "thumbnail": thumbnail_url,
                    "iframe": {
                        "src": iframe_src,
                        "width": iframe_width,
                        "height": iframe_height,
                        "aspectRatio": aspect_ratio
                    },
                    "instructions": instructions,
                    "description": description,
                    "tags": game_data.get('tags', []),
                    "mobileCompatible": game_info.get('mobile_compatible', 'Unknown'),
                    "languages": game_info.get('languages', ['English']),
                    "qualityScore": game_data.get('quality_score', 0)
                }
            }
            
            return seo_data
            
        except Exception as e:
            print(f"生成SEO数据时出错 - 游戏: {game_data.get('basic_info', {}).get('name', 'Unknown')}, 错误: {str(e)}")
            return None
    
    def generate_custom_description(self, category: str) -> str:
        """生成自定义描述"""
        descriptions = {
            "action": "Features intense combat and strategic gameplay",
            "puzzle": "Provides satisfying \"aha!\" moments and achievements", 
            "adventure": "Features rich storylines and character development",
            "casual": "Offers relaxing gameplay and easy controls",
            "racing": "Delivers high-speed thrills and competition",
            "sports": "Brings authentic sports action and competition",
            "strategy": "Offers challenging levels and exciting rewards",
            "arcade": "Delivers fast-paced action and stunning visuals",
            "simulation": "Provides realistic gameplay and immersive experience"
        }
        return descriptions.get(category, "Offers engaging gameplay and entertainment")
    
    def generate_recommendation_reason(self, category: str) -> str:
        """生成推荐理由"""
        reasons = {
            "action": "Perfect for action game enthusiasts",
            "puzzle": "Great for improving problem-solving skills",
            "adventure": "Excellent for discovering new worlds", 
            "casual": "Excellent for stress relief and entertainment",
            "racing": "Perfect for speed and competition lovers",
            "sports": "Great for sports gaming fans",
            "strategy": "Ideal for tactical thinking development",
            "arcade": "Perfect for retro gaming nostalgia",
            "simulation": "Great for realistic gaming experience"
        }
        return reasons.get(category, "Perfect for casual gaming sessions")
    
    def extract_gameplay_features(self, game_data: Dict[str, Any]) -> List[str]:
        """提取游戏特色功能"""
        features = []
        
        # 基于iframe信息
        iframe_info = game_data.get('iframe_info', {})
        if iframe_info.get('found'):
            aspect_ratio = iframe_info.get('aspect_ratio', 1.33)
            if aspect_ratio >= 1.7:
                features.append("Widescreen Gaming Experience")
            elif aspect_ratio <= 1.0:
                features.append("Portrait Mode Optimized")
            else:
                features.append("Standard Screen Ratio")
        
        # 基于移动端兼容性
        mobile_compatible = game_data.get('game_info', {}).get('mobile_compatible', '')
        if 'Mobile Compatible' in mobile_compatible:
            features.append("Mobile Friendly")
        
        # 基于缩略图数量
        thumbnail_count = len(game_data.get('thumbnails', []))
        if thumbnail_count > 5:
            features.append("Rich Visual Content")
        
        # 基于操作说明
        instructions = game_data.get('instructions', '')
        if 'mouse' in instructions.lower() and 'tap' in instructions.lower():
            features.append("Multi-Input Support")
        
        # 基于质量分数
        quality_score = game_data.get('quality_score', 0)
        if quality_score >= 80:
            features.append("High Quality Game")
        elif quality_score >= 60:
            features.append("Good Quality Game")
        
        return features[:4]  # 限制特色功能数量
    
    def batch_generate_seo(self, games_data: List[Dict[str, Any]], output_dir: str) -> Dict[str, Any]:
        """批量生成游戏SEO数据"""
        print(f"开始批量生成 {len(games_data)} 个游戏的SEO数据...")
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        games_output_dir = os.path.join(output_dir, 'games')
        os.makedirs(games_output_dir, exist_ok=True)
        
        results = {
            "total": len(games_data),
            "successful": 0,
            "failed": 0,
            "games": [],
            "errors": []
        }
        
        for i, game_data in enumerate(games_data, 1):
            try:
                game_name = game_data.get('basic_info', {}).get('name', f'Game_{i}')
                print(f"处理游戏 {i}/{len(games_data)}: {game_name}")
                
                # 生成SEO数据
                seo_data = self.generate_game_seo(game_data)
                
                if seo_data:
                    # 保存到文件
                    slug = seo_data['slug']
                    output_file = os.path.join(games_output_dir, f"{slug}.json")
                    
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(seo_data, f, indent=2, ensure_ascii=False)
                    
                    results["successful"] += 1
                    results["games"].append({
                        "slug": slug,
                        "title": seo_data["gameData"]["title"],
                        "category": seo_data["gameData"]["category"],
                        "file": output_file
                    })
                    
                    print(f"✅ 成功生成: {slug}")
                else:
                    results["failed"] += 1
                    results["errors"].append(f"游戏 {game_name}: SEO数据生成失败")
                    print(f"❌ 失败: {game_name}")
                    
            except Exception as e:
                results["failed"] += 1
                error_msg = f"游戏 {i}: {str(e)}"
                results["errors"].append(error_msg)
                print(f"❌ 错误: {error_msg}")
        
        # 生成汇总报告
        report = {
            "generation_time": datetime.now().isoformat(),
            "total_games": results["total"],
            "successful": results["successful"],
            "failed": results["failed"],
            "success_rate": f"{(results['successful'] / results['total'] * 100):.1f}%" if results["total"] > 0 else "0%",
            "output_directory": output_dir,
            "games_directory": games_output_dir,
            "errors": results["errors"][:10]  # 只保留前10个错误
        }
        
        # 保存报告
        report_file = os.path.join(output_dir, f"seo_generation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 SEO生成完成!")
        print(f"📊 成功: {results['successful']}, 失败: {results['failed']}")
        print(f"📁 输出目录: {games_output_dir}")
        print(f"📋 报告文件: {report_file}")
        
        return results

def main():
    """主函数 - 支持命令行参数的SEO生成器"""
    import sys
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        data_file = sys.argv[1]
    else:
        # 默认使用最新的文件
        data_file = "gamemonetize_enhanced_games_20250615_232004.json"
    
    if not os.path.exists(data_file):
        print(f"❌ 数据文件不存在: {data_file}")
        print("💡 用法: python gamemonetize_seo_generator.py <游戏数据文件.json>")
        return
    
    print("🚀 加载GameMonetize游戏数据...")
    with open(data_file, 'r', encoding='utf-8') as f:
        games_data = json.load(f)
    
    print(f"📊 加载了 {len(games_data)} 个游戏数据")
    
    # 创建SEO生成器
    generator = GameMonetizeSEOGenerator()
    
    # 批量生成SEO数据
    output_dir = "gamemonetize_seo_output"
    results = generator.batch_generate_seo(games_data, output_dir)
    
    print(f"\n✨ 处理完成! 查看输出目录: {output_dir}")

if __name__ == "__main__":
    main() 