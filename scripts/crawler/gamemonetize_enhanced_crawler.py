#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/crawler/gamemonetize_enhanced_crawler.py
GameMonetize增强版游戏采集器 - 采集完整的游戏信息
包括：iframe尺寸比例、推荐尺寸、操作说明、缩略图、描述、分类、标签等
"""

import requests
import time
import json
import random
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gamemonetize_enhanced_crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GameMonetizeEnhancedCrawler:
    """GameMonetize增强版游戏采集器"""
    
    def __init__(self):
        self.base_url = "https://gamemonetize.com"
        self.games_url = "https://gamemonetize.com/games"
        self.session = requests.Session()
        self.driver = None
        self.games = []
        self.failed_games = []
        
        # 配置请求头
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def setup_driver(self):
        """设置Chrome浏览器驱动"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')  # 无头模式
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--window-size=1280,720')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            # 不禁用图片加载，因为需要获取缩略图
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
            logger.info("Chrome驱动初始化成功")
            return True
        except Exception as e:
            logger.error(f"Chrome驱动初始化失败: {e}")
            return False
    
    def get_game_urls(self, target_count=500):
        """获取游戏URL列表"""
        game_urls = []
        
        try:
            # 方法1：获取首页推荐游戏
            featured_urls = self._get_featured_games()
            game_urls.extend(featured_urls)
            logger.info(f"获取到 {len(featured_urls)} 个首页推荐游戏")
            
            # 方法2：分页获取更多游戏
            if len(game_urls) < target_count:
                paginated_urls = self._get_paginated_games(target_count - len(game_urls))
                game_urls.extend(paginated_urls)
                logger.info(f"通过分页获取到 {len(paginated_urls)} 个游戏")
            
            # 去重并限制数量
            unique_urls = list(dict.fromkeys(game_urls))
            return unique_urls[:target_count]
            
        except Exception as e:
            logger.error(f"获取游戏URL列表失败: {e}")
            return []
    
    def _get_featured_games(self):
        """获取首页推荐游戏"""
        urls = []
        try:
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # 查找首页所有游戏链接
            game_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
            
            for link in game_links[:100]:
                href = link.get_attribute('href')
                if href and self._is_valid_game_url(href):
                    urls.append(href)
                    
        except Exception as e:
            logger.warning(f"获取首页推荐游戏失败: {e}")
        
        return urls
    
    def _get_paginated_games(self, needed_count):
        """通过分页获取更多游戏"""
        urls = []
        page = 1
        max_pages = 20
        
        try:
            while len(urls) < needed_count and page <= max_pages:
                page_url = f"{self.games_url}?page={page}"
                logger.info(f"正在获取第 {page} 页游戏...")
                
                try:
                    self.driver.get(page_url)
                    time.sleep(2)
                    
                    # 查找游戏链接
                    game_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
                    
                    page_urls = []
                    for link in game_links:
                        href = link.get_attribute('href')
                        if href and self._is_valid_game_url(href) and href not in urls:
                            page_urls.append(href)
                    
                    if not page_urls:
                        logger.info(f"第 {page} 页没有找到游戏，停止分页获取")
                        break
                    
                    urls.extend(page_urls)
                    logger.info(f"第 {page} 页获取到 {len(page_urls)} 个游戏")
                    
                    page += 1
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.warning(f"获取第 {page} 页失败: {e}")
                    page += 1
                    continue
                    
        except Exception as e:
            logger.error(f"分页获取游戏失败: {e}")
        
        return urls
    
    def _is_valid_game_url(self, url):
        """检查是否是有效的游戏URL"""
        if not url or url == self.base_url or url == self.games_url:
            return False
        
        # 排除非游戏页面
        exclude_patterns = [
            '/games$', '/games/$', '/game-walkthrough', '/games-editor-picks',
            '/login', '/register', '/contact', '/about', '/privacy', '/terms'
        ]
        
        for pattern in exclude_patterns:
            if re.search(pattern, url):
                return False
        
        return True
    
    def extract_complete_game_info(self, game_url):
        """提取完整的游戏信息"""
        try:
            logger.info(f"正在提取游戏信息: {game_url}")
            
            self.driver.get(game_url)
            time.sleep(3)
            
            # 检查页面是否正常加载
            page_title = self.driver.title
            if "404" in page_title or "Not Found" in page_title:
                return None
            
            # 基本信息
            basic_info = self._extract_basic_info(game_url)
            
            # 游戏详细信息
            game_info = self._extract_game_details()
            
            # iframe信息和尺寸
            iframe_info = self._extract_iframe_info()
            
            # 缩略图信息
            thumbnails = self._extract_thumbnails()
            
            # 描述信息
            description = self._extract_description()
            
            # 操作说明
            instructions = self._extract_instructions()
            
            # 分类和标签
            categories = self._extract_categories()
            tags = self._extract_tags()
            
            # 推荐尺寸信息
            recommended_sizes = self._extract_recommended_sizes()
            
            # 其他元数据
            metadata = self._extract_metadata()
            
            # 组装完整的游戏信息
            complete_game_info = {
                "basic_info": basic_info,
                "extraction_time": datetime.now().isoformat(),
                "url": game_url,
                "game_info": game_info,
                "iframe_info": iframe_info,
                "thumbnails": thumbnails,
                "description": description,
                "instructions": instructions,
                "categories": categories,
                "tags": tags,
                "recommended_sizes": recommended_sizes,
                "metadata": metadata,
                "quality_score": self._calculate_quality_score(
                    iframe_info, thumbnails, description, instructions, categories, tags
                )
            }
            
            return complete_game_info
            
        except Exception as e:
            logger.error(f"提取游戏信息失败 {game_url}: {e}")
            return None
    
    def _extract_basic_info(self, game_url):
        """提取基本信息"""
        try:
            game_name = self._extract_game_name_from_url(game_url)
            
            return {
                "id": self._generate_slug(game_name),
                "name": game_name,
                "url": game_url,
                "source": "gamemonetize",
                "collected_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.warning(f"提取基本信息失败: {e}")
            return {}
    
    def _extract_game_details(self):
        """提取游戏详细信息"""
        try:
            # 游戏标题
            title = self._find_text_by_selectors([
                "h1", "h2", ".game-title", ".title", "#game-title",
                ".game-name", "[data-testid='game-title']"
            ])
            
            # 发布商信息
            publisher = self._find_text_by_selectors([
                ".publisher", ".developer", ".company", ".author",
                "[data-testid='publisher']", ".game-publisher"
            ])
            
            # 移动端兼容性
            mobile_compatible = self._check_mobile_compatibility()
            
            # 语言支持
            languages = self._extract_languages()
            
            return {
                "title": title or "Unknown Game",
                "publisher": publisher or "Unknown Publisher",
                "mobile_compatible": mobile_compatible,
                "languages": languages
            }
        except Exception as e:
            logger.warning(f"提取游戏详细信息失败: {e}")
            return {}
    
    def _extract_iframe_info(self):
        """提取iframe信息和尺寸"""
        try:
            iframe_element = self.driver.find_element(By.TAG_NAME, "iframe")
            
            src = iframe_element.get_attribute("src")
            width = iframe_element.get_attribute("width") or "800"
            height = iframe_element.get_attribute("height") or "600"
            
            # 计算宽高比
            try:
                w = int(width)
                h = int(height)
                aspect_ratio = round(w / h, 2)
            except:
                aspect_ratio = 1.33  # 默认4:3比例
            
            # 生成完整的iframe代码
            full_code = f'<iframe src="{src}" width="{width}" height="{height}" scrolling="none" frameborder="0"></iframe>'
            
            return {
                "found": True,
                "src": src,
                "width": width,
                "height": height,
                "aspect_ratio": aspect_ratio,
                "full_code": full_code
            }
            
        except NoSuchElementException:
            return {
                "found": False,
                "src": "",
                "width": "800",
                "height": "600",
                "aspect_ratio": 1.33,
                "full_code": ""
            }
    
    def _extract_thumbnails(self):
        """提取缩略图信息"""
        thumbnails = []
        try:
            # 查找各种可能的缩略图
            img_selectors = [
                ".game-thumbnail img", ".thumbnail img", ".preview img",
                ".game-image img", ".screenshot img", ".game-cover img",
                "img[alt*='game']", "img[src*='game']"
            ]
            
            found_urls = set()
            
            for selector in img_selectors:
                try:
                    img_elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for img in img_elements:
                        src = img.get_attribute('src')
                        alt = img.get_attribute('alt') or ""
                        
                        if src and src not in found_urls and self._is_valid_image_url(src):
                            # 尝试从URL中提取尺寸信息
                            size = self._extract_size_from_url(src)
                            
                            thumbnails.append({
                                "url": src,
                                "size": size,
                                "alt": alt
                            })
                            found_urls.add(src)
                            
                except Exception as e:
                    continue
            
            logger.info(f"找到 {len(thumbnails)} 张缩略图")
            return thumbnails
            
        except Exception as e:
            logger.warning(f"提取缩略图失败: {e}")
            return []
    
    def _extract_description(self):
        """提取游戏描述"""
        try:
            # GameMonetize特定的描述选择器
            description = self._find_text_by_selectors([
                "#descriptionId",  # GameMonetize主要描述ID
                ".gamedesc",       # GameMonetize描述class
                ".description", ".game-description", "#description",
                ".game-info p", ".content p", ".summary",
                "[data-testid='description']", ".about"
            ])
            
            # 清理描述文本
            if description:
                description = re.sub(r'\s+', ' ', description).strip()
                # 限制长度
                if len(description) > 1000:
                    description = description[:1000] + "..."
            
            return description or ""
            
        except Exception as e:
            logger.warning(f"提取描述失败: {e}")
            return ""
    
    def _extract_instructions(self):
        """提取操作说明"""
        try:
            instructions = self._find_text_by_selectors([
                ".instructions", ".how-to-play", ".controls",
                ".game-instructions", "#instructions", ".gameplay",
                "[data-testid='instructions']", ".how-to"
            ])
            
            # 清理说明文本
            if instructions:
                instructions = re.sub(r'\s+', ' ', instructions).strip()
            
            return instructions or "Mouse click or tap to play"
            
        except Exception as e:
            logger.warning(f"提取操作说明失败: {e}")
            return "Mouse click or tap to play"
    
    def _extract_categories(self):
        """提取游戏分类"""
        categories = []
        try:
            category_selectors = [
                ".category", ".genre", ".game-category",
                ".categories a", ".genres a", ".tags .category",
                "[data-testid='category']"
            ]
            
            for selector in category_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        text = element.text.strip()
                        if text and text not in categories:
                            categories.append(text)
                except:
                    continue
            
            # 如果没有找到分类，尝试从URL或标题推断
            if not categories:
                categories = self._infer_categories_from_context()
            
            return categories[:5]  # 限制最多5个分类
            
        except Exception as e:
            logger.warning(f"提取分类失败: {e}")
            return []
    
    def _extract_tags(self):
        """提取游戏标签"""
        tags = []
        try:
            # GameMonetize特定的标签选择器
            tag_selectors = [
                ".filters li a",   # GameMonetize主要标签结构
                ".filters a",      # 备用选择器
                ".tags a", ".tag", ".keywords", ".game-tags a",
                ".labels a", "[data-testid='tags'] a", ".tag-list a"
            ]
            
            for selector in tag_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        text = element.text.strip()
                        if text and text not in tags and len(text) > 1:
                            # 保持原始大小写，但去重时忽略大小写
                            if text.lower() not in [t.lower() for t in tags]:
                                tags.append(text)
                except:
                    continue
            
            # 从meta keywords中提取
            try:
                meta_keywords = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="keywords"]')
                keywords = meta_keywords.get_attribute('content')
                if keywords:
                    keyword_list = [k.strip() for k in keywords.split(',')]
                    for k in keyword_list:
                        if k and k.lower() not in [t.lower() for t in tags]:
                            tags.append(k)
            except:
                pass
            
            return tags[:10]  # 限制最多10个标签
            
        except Exception as e:
            logger.warning(f"提取标签失败: {e}")
            return []
    
    def _extract_recommended_sizes(self):
        """提取推荐尺寸信息"""
        sizes = []
        try:
            # 查找Size参数相关信息
            size_selectors = [
                ".size-info", ".recommended-size", ".game-size",
                ".dimensions", "[data-testid='size']"
            ]
            
            for selector in size_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        text = element.text.strip()
                        # 查找尺寸模式 (如 800x600, 1024x768等)
                        size_matches = re.findall(r'\d{3,4}x\d{3,4}', text)
                        sizes.extend(size_matches)
                except:
                    continue
            
            # 从页面文本中查找常见游戏尺寸
            try:
                page_text = self.driver.find_element(By.TAG_NAME, 'body').text
                common_sizes = re.findall(r'\b(?:800x600|1024x768|1280x720|1920x1080|512x384|960x640)\b', page_text)
                sizes.extend(common_sizes)
            except:
                pass
            
            # 去重并返回
            unique_sizes = list(dict.fromkeys(sizes))
            return unique_sizes[:5]
            
        except Exception as e:
            logger.warning(f"提取推荐尺寸失败: {e}")
            return []
    
    def _extract_metadata(self):
        """提取其他元数据"""
        try:
            metadata = {}
            
            # 页面标题
            metadata['page_title'] = self.driver.title
            
            # meta描述
            try:
                meta_desc = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
                metadata['meta_description'] = meta_desc.get_attribute('content')
            except:
                metadata['meta_description'] = ""
            
            # 评分信息
            rating = self._find_text_by_selectors([
                ".rating", ".score", ".stars", "[data-testid='rating']"
            ])
            if rating:
                metadata['rating'] = rating
            
            # 播放次数
            play_count = self._find_text_by_selectors([
                ".play-count", ".plays", ".views", "[data-testid='play-count']"
            ])
            if play_count:
                metadata['play_count'] = play_count
            
            return metadata
            
        except Exception as e:
            logger.warning(f"提取元数据失败: {e}")
            return {}
    
    def _find_text_by_selectors(self, selectors):
        """通过多个选择器查找文本"""
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                text = element.text.strip()
                if text:
                    return text
            except:
                continue
        return None
    
    def _check_mobile_compatibility(self):
        """检查移动端兼容性"""
        try:
            # 查找移动端相关信息
            mobile_indicators = [
                "mobile", "responsive", "touch", "ios", "android",
                "mobile-friendly", "mobile-compatible"
            ]
            
            page_text = self.driver.find_element(By.TAG_NAME, 'body').text.lower()
            
            for indicator in mobile_indicators:
                if indicator in page_text:
                    return "Mobile Compatible"
            
            return "Desktop Only"
            
        except:
            return "Unknown"
    
    def _extract_languages(self):
        """提取支持的语言"""
        try:
            # 查找语言信息
            lang_selectors = [
                ".language", ".languages", ".lang", "[data-testid='language']"
            ]
            
            languages = []
            for selector in lang_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        text = element.text.strip()
                        if text:
                            languages.append(text)
                except:
                    continue
            
            # 默认英语
            if not languages:
                languages = ["English"]
            
            return languages
            
        except:
            return ["English"]
    
    def _infer_categories_from_context(self):
        """从上下文推断分类"""
        try:
            # 从URL和标题推断分类
            url_lower = self.driver.current_url.lower()
            title_lower = self.driver.title.lower()
            
            category_keywords = {
                "action": ["action", "fight", "battle", "war", "shoot"],
                "puzzle": ["puzzle", "brain", "logic", "match", "solve"],
                "adventure": ["adventure", "quest", "explore", "journey"],
                "racing": ["racing", "car", "drive", "speed", "race"],
                "sports": ["sport", "football", "soccer", "basketball", "tennis"],
                "arcade": ["arcade", "classic", "retro", "old"],
                "strategy": ["strategy", "tower", "defense", "build", "manage"],
                "casual": ["casual", "simple", "easy", "fun", "relax"]
            }
            
            text_to_check = f"{url_lower} {title_lower}"
            
            for category, keywords in category_keywords.items():
                for keyword in keywords:
                    if keyword in text_to_check:
                        return [category.title()]
            
            return ["Casual"]  # 默认分类
            
        except:
            return ["Casual"]
    
    def _is_valid_image_url(self, url):
        """检查是否是有效的图片URL"""
        if not url:
            return False
        
        # 检查图片扩展名
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        url_lower = url.lower()
        
        return any(ext in url_lower for ext in image_extensions)
    
    def _extract_size_from_url(self, url):
        """从URL中提取尺寸信息"""
        try:
            # 查找尺寸模式 (如 512x384, 1280x720等)
            size_match = re.search(r'(\d{3,4}x\d{3,4})', url)
            if size_match:
                return size_match.group(1)
            return "unknown"
        except:
            return "unknown"
    
    def _calculate_quality_score(self, iframe_info, thumbnails, description, instructions, categories, tags):
        """计算质量分数"""
        score = 0
        
        # iframe存在且有效 (40分)
        if iframe_info.get('found') and iframe_info.get('src'):
            score += 40
        
        # 有缩略图 (20分)
        if thumbnails:
            score += 20
        
        # 有描述 (15分)
        if description and len(description) > 20:
            score += 15
        
        # 有操作说明 (10分)
        if instructions and instructions != "Mouse click or tap to play":
            score += 10
        
        # 有分类 (10分)
        if categories:
            score += 10
        
        # 有标签 (5分)
        if tags:
            score += 5
        
        return score
    
    def _extract_game_name_from_url(self, url):
        """从URL中提取游戏名称"""
        try:
            path = urlparse(url).path
            name = path.split('/')[-1]
            name = name.replace('-game', '').replace('_game', '')
            name = name.replace('-', ' ').replace('_', ' ')
            name = ' '.join(word.capitalize() for word in name.split())
            return name if name else "Unknown Game"
        except:
            return "Unknown Game"
    
    def _generate_slug(self, name):
        """生成游戏slug"""
        try:
            slug = name.lower()
            slug = re.sub(r'[^a-z0-9\s-]', '', slug)
            slug = re.sub(r'\s+', '-', slug)
            slug = slug.strip('-')
            return slug
        except:
            return "unknown-game"
    
    def crawl_games(self, target_count=500):
        """采集游戏"""
        logger.info(f"开始采集 {target_count} 个游戏的完整信息...")
        
        if not self.setup_driver():
            logger.error("浏览器驱动初始化失败，无法继续")
            return False
        
        try:
            # 获取游戏URL列表
            game_urls = self.get_game_urls(target_count)
            logger.info(f"获取到 {len(game_urls)} 个游戏URL")
            
            if not game_urls:
                logger.error("未获取到任何游戏URL")
                return False
            
            # 处理每个游戏
            processed_count = 0
            success_count = 0
            
            for i, game_url in enumerate(game_urls, 1):
                logger.info(f"处理游戏 {i}/{len(game_urls)}: {game_url}")
                
                try:
                    # 提取完整游戏信息
                    game_info = self.extract_complete_game_info(game_url)
                    
                    if game_info:
                        self.games.append(game_info)
                        success_count += 1
                        logger.info(f"✓ 游戏 {game_info['basic_info']['name']} 处理成功 (质量分: {game_info['quality_score']})")
                    else:
                        self.failed_games.append({"url": game_url, "reason": "提取信息失败"})
                        logger.warning(f"✗ 游戏信息提取失败")
                    
                    processed_count += 1
                    
                    # 每50个游戏保存一次进度
                    if processed_count % 50 == 0:
                        self.save_progress()
                        logger.info(f"已处理 {processed_count} 个游戏，成功 {success_count} 个")
                    
                    # 随机延迟
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"处理游戏失败 {game_url}: {e}")
                    self.failed_games.append({"url": game_url, "reason": str(e)})
                    continue
            
            # 保存最终结果
            self.save_results()
            
            logger.info(f"采集完成！总共处理 {processed_count} 个游戏，成功 {success_count} 个，失败 {len(self.failed_games)} 个")
            return True
            
        except Exception as e:
            logger.error(f"采集过程出错: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
    
    def save_progress(self):
        """保存进度"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 保存成功的游戏
            if self.games:
                success_file = f"gamemonetize_enhanced_games_progress_{timestamp}.json"
                with open(success_file, 'w', encoding='utf-8') as f:
                    json.dump(self.games, f, ensure_ascii=False, indent=2)
                logger.info(f"进度已保存到 {success_file}")
            
            # 保存失败的游戏
            if self.failed_games:
                failed_file = f"gamemonetize_enhanced_failed_progress_{timestamp}.json"
                with open(failed_file, 'w', encoding='utf-8') as f:
                    json.dump(self.failed_games, f, ensure_ascii=False, indent=2)
                logger.info(f"失败记录已保存到 {failed_file}")
                
        except Exception as e:
            logger.error(f"保存进度失败: {e}")
    
    def save_results(self):
        """保存最终结果"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 保存成功的游戏
            success_file = f"gamemonetize_enhanced_games_{timestamp}.json"
            with open(success_file, 'w', encoding='utf-8') as f:
                json.dump(self.games, f, ensure_ascii=False, indent=2)
            logger.info(f"成功游戏数据已保存到 {success_file}")
            
            # 保存失败的游戏
            failed_file = f"gamemonetize_enhanced_failed_{timestamp}.json"
            with open(failed_file, 'w', encoding='utf-8') as f:
                json.dump(self.failed_games, f, ensure_ascii=False, indent=2)
            logger.info(f"失败游戏记录已保存到 {failed_file}")
            
            # 生成统计报告
            self.generate_report(timestamp)
            
        except Exception as e:
            logger.error(f"保存结果失败: {e}")
    
    def generate_report(self, timestamp):
        """生成统计报告"""
        try:
            total_games = len(self.games) + len(self.failed_games)
            success_rate = (len(self.games) / total_games * 100) if total_games > 0 else 0
            
            # 质量分析
            quality_scores = [game['quality_score'] for game in self.games]
            avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
            
            high_quality = len([s for s in quality_scores if s >= 80])
            medium_quality = len([s for s in quality_scores if 50 <= s < 80])
            low_quality = len([s for s in quality_scores if s < 50])
            
            # 数据完整性分析
            with_iframe = len([g for g in self.games if g['iframe_info']['found']])
            with_thumbnails = len([g for g in self.games if g['thumbnails']])
            with_description = len([g for g in self.games if g['description']])
            with_categories = len([g for g in self.games if g['categories']])
            with_tags = len([g for g in self.games if g['tags']])
            
            report = {
                "采集时间": timestamp,
                "总体统计": {
                    "总处理游戏": total_games,
                    "成功采集": len(self.games),
                    "失败游戏": len(self.failed_games),
                    "成功率": f"{success_rate:.2f}%"
                },
                "质量分析": {
                    "平均质量分": f"{avg_quality:.2f}",
                    "高质量游戏(80+分)": f"{high_quality} ({high_quality/len(self.games)*100:.1f}%)" if self.games else "0",
                    "中等质量(50-79分)": f"{medium_quality} ({medium_quality/len(self.games)*100:.1f}%)" if self.games else "0",
                    "低质量(<50分)": f"{low_quality} ({low_quality/len(self.games)*100:.1f}%)" if self.games else "0"
                },
                "数据完整性": {
                    "有iframe": f"{with_iframe} ({with_iframe/len(self.games)*100:.1f}%)" if self.games else "0",
                    "有缩略图": f"{with_thumbnails} ({with_thumbnails/len(self.games)*100:.1f}%)" if self.games else "0",
                    "有描述": f"{with_description} ({with_description/len(self.games)*100:.1f}%)" if self.games else "0",
                    "有分类": f"{with_categories} ({with_categories/len(self.games)*100:.1f}%)" if self.games else "0",
                    "有标签": f"{with_tags} ({with_tags/len(self.games)*100:.1f}%)" if self.games else "0"
                }
            }
            
            report_file = f"gamemonetize_enhanced_report_{timestamp}.json"
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"统计报告已保存到 {report_file}")
            logger.info(f"采集完成：成功 {len(self.games)} 个，失败 {len(self.failed_games)} 个，成功率 {success_rate:.2f}%")
            
        except Exception as e:
            logger.error(f"生成报告失败: {e}")

def main():
    """主函数"""
    crawler = GameMonetizeEnhancedCrawler()
    
    # 开始采集
    success = crawler.crawl_games(target_count=500)
    
    if success:
        print("✅ 采集任务完成！")
    else:
        print("❌ 采集任务失败！")

if __name__ == "__main__":
    main() 