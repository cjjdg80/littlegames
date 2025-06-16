#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/crawler/gamemonetize_hot_games_crawler.py
GameMonetize热门游戏采集器 - 采集500个热门游戏列表并测试详情页面访问
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
        logging.FileHandler('gamemonetize_crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GameMonetizeHotGamesCrawler:
    """GameMonetize热门游戏采集器"""
    
    def __init__(self):
        self.base_url = "https://gamemonetize.com"
        self.games_url = "https://gamemonetize.com/games"
        self.session = requests.Session()
        self.driver = None
        self.hot_games = []
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
            chrome_options.add_argument('--disable-images')  # 禁用图片加载
            chrome_options.add_argument('--disable-javascript')  # 禁用JS（如果不需要）
            chrome_options.add_argument('--window-size=1280,720')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
            logger.info("Chrome驱动初始化成功")
            return True
        except Exception as e:
            logger.error(f"Chrome驱动初始化失败: {e}")
            return False
    
    def get_hot_games_urls(self):
        """获取热门游戏的URL列表"""
        hot_games_urls = []
        
        try:
            # 方法1：尝试获取Trending Games
            trending_urls = self._get_trending_games()
            hot_games_urls.extend(trending_urls)
            logger.info(f"获取到 {len(trending_urls)} 个Trending游戏")
            
            # 方法2：获取Hot Games分类
            hot_urls = self._get_hot_category_games()
            hot_games_urls.extend(hot_urls)
            logger.info(f"获取到 {len(hot_urls)} 个Hot分类游戏")
            
            # 方法3：获取Editor's Picks
            editor_urls = self._get_editors_picks()
            hot_games_urls.extend(editor_urls)
            logger.info(f"获取到 {len(editor_urls)} 个Editor's Picks游戏")
            
            # 方法4：获取首页推荐游戏
            featured_urls = self._get_featured_games()
            hot_games_urls.extend(featured_urls)
            logger.info(f"获取到 {len(featured_urls)} 个首页推荐游戏")
            
            # 方法5：分页获取更多热门游戏
            if len(hot_games_urls) < 500:
                paginated_urls = self._get_paginated_games(500 - len(hot_games_urls))
                hot_games_urls.extend(paginated_urls)
                logger.info(f"通过分页获取到 {len(paginated_urls)} 个游戏")
            
            # 去重并限制数量
            unique_urls = list(dict.fromkeys(hot_games_urls))  # 保持顺序去重
            return unique_urls[:500]
            
        except Exception as e:
            logger.error(f"获取热门游戏URL列表失败: {e}")
            return []
    
    def _get_trending_games(self):
        """获取Trending Games"""
        urls = []
        try:
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # 查找Trending Games区域
            trending_selectors = [
                "//h2[contains(text(), 'Trending')]/following-sibling::*//a[contains(@href, '/')]",
                "//h3[contains(text(), 'Trending')]/following-sibling::*//a[contains(@href, '/')]",
                "//*[contains(@class, 'trending')]//a[contains(@href, '/')]",
                "//div[contains(text(), 'Trending')]//a[contains(@href, '/')]"
            ]
            
            for selector in trending_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        for element in elements[:20]:  # 最多20个
                            href = element.get_attribute('href')
                            if href and '/game' in href:
                                urls.append(href)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"获取Trending游戏失败: {e}")
        
        return urls
    
    def _get_hot_category_games(self):
        """获取Hot Games分类"""
        urls = []
        try:
            # 尝试访问热门游戏分类页面
            hot_urls = [
                f"{self.games_url}?popularity=hot",
                f"{self.games_url}?category=hot",
                f"{self.base_url}/hot-games",
                f"{self.games_url}?sort=popular"
            ]
            
            for url in hot_urls:
                try:
                    self.driver.get(url)
                    time.sleep(2)
                    
                    # 查找游戏链接
                    game_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
                    
                    for link in game_links[:50]:  # 每个页面最多50个
                        href = link.get_attribute('href')
                        if href:
                            urls.append(href)
                    
                    if urls:  # 如果找到了游戏，就不再尝试其他URL
                        break
                        
                except Exception as e:
                    logger.warning(f"访问热门分类页面失败 {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"获取Hot分类游戏失败: {e}")
        
        return urls
    
    def _get_editors_picks(self):
        """获取Editor's Picks"""
        urls = []
        try:
            # 尝试访问Editor's Picks页面
            editors_urls = [
                f"{self.base_url}/games-editor-picks",
                f"{self.games_url}?category=editors-picks",
                f"{self.base_url}/editors-picks"
            ]
            
            for url in editors_urls:
                try:
                    self.driver.get(url)
                    time.sleep(2)
                    
                    # 查找游戏链接
                    game_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
                    
                    for link in game_links[:30]:
                        href = link.get_attribute('href')
                        if href:
                            urls.append(href)
                    
                    if urls:
                        break
                        
                except Exception as e:
                    logger.warning(f"访问Editor's Picks页面失败 {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"获取Editor's Picks失败: {e}")
        
        return urls
    
    def _get_featured_games(self):
        """获取首页推荐游戏"""
        urls = []
        try:
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # 查找首页所有游戏链接
            game_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
            
            for link in game_links[:100]:  # 首页最多100个
                href = link.get_attribute('href')
                if href:
                    urls.append(href)
                    
        except Exception as e:
            logger.warning(f"获取首页推荐游戏失败: {e}")
        
        return urls
    
    def _get_paginated_games(self, needed_count):
        """通过分页获取更多游戏"""
        urls = []
        page = 1
        max_pages = 20  # 最多20页
        
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
                        if href and href not in urls:
                            page_urls.append(href)
                    
                    if not page_urls:  # 如果这一页没有找到游戏，停止
                        logger.info(f"第 {page} 页没有找到游戏，停止分页获取")
                        break
                    
                    urls.extend(page_urls)
                    logger.info(f"第 {page} 页获取到 {len(page_urls)} 个游戏")
                    
                    page += 1
                    time.sleep(random.uniform(1, 3))  # 随机延迟
                    
                except Exception as e:
                    logger.warning(f"获取第 {page} 页失败: {e}")
                    page += 1
                    continue
                    
        except Exception as e:
            logger.error(f"分页获取游戏失败: {e}")
        
        return urls
    
    def extract_game_basic_info(self, game_url):
        """从游戏列表页面提取基本信息"""
        try:
            # 从URL中提取游戏名称
            game_name = self._extract_game_name_from_url(game_url)
            
            # 构造基本游戏信息
            game_info = {
                "name": game_name,
                "url": game_url,
                "slug": self._generate_slug(game_name),
                "source": "gamemonetize",
                "extraction_time": datetime.now().isoformat(),
                "status": "pending_detail_extraction"
            }
            
            return game_info
            
        except Exception as e:
            logger.error(f"提取游戏基本信息失败 {game_url}: {e}")
            return None
    
    def test_game_detail_access(self, game_url):
        """测试游戏详情页面是否可以访问"""
        try:
            logger.info(f"测试访问游戏详情页: {game_url}")
            
            self.driver.get(game_url)
            time.sleep(3)
            
            # 检查页面是否正常加载
            page_title = self.driver.title
            if "404" in page_title or "Not Found" in page_title:
                return False, "页面不存在"
            
            # 查找iframe嵌入代码
            iframe_found = False
            iframe_src = ""
            
            try:
                iframe_element = self.driver.find_element(By.TAG_NAME, "iframe")
                iframe_src = iframe_element.get_attribute("src")
                iframe_found = True
            except NoSuchElementException:
                # 查找其他可能的游戏嵌入元素
                try:
                    embed_element = self.driver.find_element(By.TAG_NAME, "embed")
                    iframe_src = embed_element.get_attribute("src")
                    iframe_found = True
                except NoSuchElementException:
                    pass
            
            # 查找游戏标题
            title_found = False
            game_title = ""
            
            title_selectors = ["h1", "h2", ".game-title", ".title", "#game-title"]
            for selector in title_selectors:
                try:
                    title_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    game_title = title_element.text.strip()
                    if game_title:
                        title_found = True
                        break
                except NoSuchElementException:
                    continue
            
            # 查找游戏描述
            description_found = False
            description = ""
            
            desc_selectors = [".description", ".game-description", "#description", "p"]
            for selector in desc_selectors:
                try:
                    desc_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    description = desc_element.text.strip()
                    if len(description) > 20:  # 描述长度大于20字符
                        description_found = True
                        break
                except NoSuchElementException:
                    continue
            
            # 评估页面质量
            quality_score = 0
            if iframe_found:
                quality_score += 40
            if title_found:
                quality_score += 30
            if description_found:
                quality_score += 20
            if len(page_title) > 5:
                quality_score += 10
            
            result = {
                "accessible": True,
                "quality_score": quality_score,
                "iframe_found": iframe_found,
                "iframe_src": iframe_src,
                "title_found": title_found,
                "game_title": game_title,
                "description_found": description_found,
                "description": description[:200] if description else "",
                "page_title": page_title
            }
            
            return True, result
            
        except TimeoutException:
            return False, "页面加载超时"
        except Exception as e:
            return False, f"访问失败: {str(e)}"
    
    def _extract_game_name_from_url(self, url):
        """从URL中提取游戏名称"""
        try:
            # 从URL路径中提取游戏名称
            path = urlparse(url).path
            
            # 移除常见的前缀和后缀
            name = path.split('/')[-1]  # 获取最后一部分
            name = name.replace('-game', '').replace('_game', '')
            name = name.replace('-', ' ').replace('_', ' ')
            
            # 首字母大写
            name = ' '.join(word.capitalize() for word in name.split())
            
            return name if name else "Unknown Game"
            
        except Exception as e:
            logger.warning(f"从URL提取游戏名称失败 {url}: {e}")
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
    
    def crawl_hot_games(self, target_count=500):
        """采集热门游戏列表"""
        logger.info(f"开始采集 {target_count} 个热门游戏...")
        
        if not self.setup_driver():
            logger.error("浏览器驱动初始化失败，无法继续")
            return False
        
        try:
            # 获取热门游戏URL列表
            game_urls = self.get_hot_games_urls()
            logger.info(f"获取到 {len(game_urls)} 个游戏URL")
            
            if not game_urls:
                logger.error("未获取到任何游戏URL")
                return False
            
            # 处理每个游戏
            processed_count = 0
            success_count = 0
            
            for i, game_url in enumerate(game_urls[:target_count], 1):
                logger.info(f"处理游戏 {i}/{min(len(game_urls), target_count)}: {game_url}")
                
                try:
                    # 提取基本信息
                    game_info = self.extract_game_basic_info(game_url)
                    if not game_info:
                        self.failed_games.append({"url": game_url, "reason": "提取基本信息失败"})
                        continue
                    
                    # 测试详情页面访问
                    accessible, detail_result = self.test_game_detail_access(game_url)
                    
                    if accessible:
                        game_info.update({
                            "detail_accessible": True,
                            "detail_info": detail_result
                        })
                        self.hot_games.append(game_info)
                        success_count += 1
                        logger.info(f"✓ 游戏 {game_info['name']} 处理成功 (质量分: {detail_result.get('quality_score', 0)})")
                    else:
                        game_info.update({
                            "detail_accessible": False,
                            "error_reason": detail_result
                        })
                        self.failed_games.append(game_info)
                        logger.warning(f"✗ 游戏详情页面不可访问: {detail_result}")
                    
                    processed_count += 1
                    
                    # 添加延迟避免被封
                    time.sleep(random.uniform(1, 3))
                    
                    # 每处理50个游戏保存一次
                    if processed_count % 50 == 0:
                        self.save_progress()
                        logger.info(f"已处理 {processed_count} 个游戏，成功 {success_count} 个")
                
                except Exception as e:
                    logger.error(f"处理游戏失败 {game_url}: {e}")
                    self.failed_games.append({"url": game_url, "reason": str(e)})
                    continue
            
            # 最终保存
            self.save_results()
            
            logger.info(f"采集完成！总计处理 {processed_count} 个游戏，成功 {success_count} 个，失败 {len(self.failed_games)} 个")
            return True
            
        except Exception as e:
            logger.error(f"采集过程中发生错误: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
    
    def save_progress(self):
        """保存进度"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 保存成功的游戏
            if self.hot_games:
                with open(f"gamemonetize_hot_games_progress_{timestamp}.json", 'w', encoding='utf-8') as f:
                    json.dump(self.hot_games, f, ensure_ascii=False, indent=2)
            
            # 保存失败的游戏
            if self.failed_games:
                with open(f"gamemonetize_failed_games_progress_{timestamp}.json", 'w', encoding='utf-8') as f:
                    json.dump(self.failed_games, f, ensure_ascii=False, indent=2)
                    
        except Exception as e:
            logger.error(f"保存进度失败: {e}")
    
    def save_results(self):
        """保存最终结果"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 保存成功的游戏列表
            success_file = f"gamemonetize_hot_games_{timestamp}.json"
            with open(success_file, 'w', encoding='utf-8') as f:
                json.dump(self.hot_games, f, ensure_ascii=False, indent=2)
            logger.info(f"成功游戏列表已保存到: {success_file}")
            
            # 保存失败的游戏列表
            if self.failed_games:
                failed_file = f"gamemonetize_failed_games_{timestamp}.json"
                with open(failed_file, 'w', encoding='utf-8') as f:
                    json.dump(self.failed_games, f, ensure_ascii=False, indent=2)
                logger.info(f"失败游戏列表已保存到: {failed_file}")
            
            # 生成统计报告
            self.generate_report(timestamp)
            
        except Exception as e:
            logger.error(f"保存结果失败: {e}")
    
    def generate_report(self, timestamp):
        """生成采集报告"""
        try:
            total_games = len(self.hot_games) + len(self.failed_games)
            success_rate = (len(self.hot_games) / total_games * 100) if total_games > 0 else 0
            
            # 质量分析
            quality_scores = [game.get('detail_info', {}).get('quality_score', 0) for game in self.hot_games]
            avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
            
            high_quality_games = len([score for score in quality_scores if score >= 80])
            medium_quality_games = len([score for score in quality_scores if 50 <= score < 80])
            low_quality_games = len([score for score in quality_scores if score < 50])
            
            report = {
                "采集时间": timestamp,
                "总游戏数": total_games,
                "成功游戏数": len(self.hot_games),
                "失败游戏数": len(self.failed_games),
                "成功率": f"{success_rate:.2f}%",
                "平均质量分": f"{avg_quality:.2f}",
                "质量分布": {
                    "高质量游戏(80+分)": high_quality_games,
                    "中等质量游戏(50-79分)": medium_quality_games,
                    "低质量游戏(<50分)": low_quality_games
                },
                "iframe可用游戏数": len([g for g in self.hot_games if g.get('detail_info', {}).get('iframe_found', False)]),
                "主要失败原因": self._analyze_failure_reasons()
            }
            
            report_file = f"gamemonetize_crawl_report_{timestamp}.json"
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"采集报告已生成: {report_file}")
            logger.info(f"采集统计: 成功 {len(self.hot_games)}/{total_games} ({success_rate:.2f}%)")
            logger.info(f"平均质量分: {avg_quality:.2f}")
            
        except Exception as e:
            logger.error(f"生成报告失败: {e}")
    
    def _analyze_failure_reasons(self):
        """分析失败原因"""
        reasons = {}
        for failed_game in self.failed_games:
            reason = failed_game.get('reason', failed_game.get('error_reason', 'Unknown'))
            reasons[reason] = reasons.get(reason, 0) + 1
        
        return dict(sorted(reasons.items(), key=lambda x: x[1], reverse=True))

def main():
    """主函数"""
    print("🕷️ GameMonetize热门游戏采集器")
    print("=" * 50)
    
    crawler = GameMonetizeHotGamesCrawler()
    
    try:
        # 开始采集500个热门游戏
        success = crawler.crawl_hot_games(target_count=500)
        
        if success:
            print("\n✅ 采集完成！")
            print(f"成功采集: {len(crawler.hot_games)} 个游戏")
            print(f"失败数量: {len(crawler.failed_games)} 个游戏")
        else:
            print("\n❌ 采集失败！")
            
    except KeyboardInterrupt:
        print("\n⏹️ 用户中断采集")
        crawler.save_progress()
    except Exception as e:
        print(f"\n💥 程序异常: {e}")
        crawler.save_progress()

if __name__ == "__main__":
    main() 