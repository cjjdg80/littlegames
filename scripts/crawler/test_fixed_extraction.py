# scripts/crawler/test_fixed_extraction.py - 测试修复后的提取功能
"""
测试修复后的GameMonetize描述和标签提取功能
"""

import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestExtractor:
    def __init__(self):
        self.driver = None
    
    def setup_driver(self):
        """设置浏览器驱动"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            logger.error(f"浏览器驱动初始化失败: {e}")
            return False
    
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
    
    def _extract_description(self):
        """提取游戏描述 - 修复后的版本"""
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
    
    def _extract_tags(self):
        """提取游戏标签 - 修复后的版本"""
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
    
    def test_game_extraction(self, game_url):
        """测试单个游戏的提取"""
        try:
            logger.info(f"测试游戏: {game_url}")
            self.driver.get(game_url)
            
            # 等待页面加载
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(3)
            
            print(f"\n{'='*60}")
            print(f"🎮 测试游戏: {game_url}")
            print(f"页面标题: {self.driver.title}")
            print(f"{'='*60}")
            
            # 测试描述提取
            description = self._extract_description()
            print(f"\n📝 描述提取结果:")
            if description:
                print(f"✅ 成功提取描述 ({len(description)} 字符)")
                print(f"内容: {description}")
            else:
                print("❌ 未提取到描述")
            
            # 测试标签提取
            tags = self._extract_tags()
            print(f"\n🏷️ 标签提取结果:")
            if tags:
                print(f"✅ 成功提取 {len(tags)} 个标签")
                print(f"标签: {', '.join(tags)}")
            else:
                print("❌ 未提取到标签")
            
            return {
                'url': game_url,
                'title': self.driver.title,
                'description': description,
                'tags': tags,
                'success': bool(description or tags)
            }
            
        except Exception as e:
            logger.error(f"测试失败: {e}")
            return {
                'url': game_url,
                'error': str(e),
                'success': False
            }
    
    def run_tests(self):
        """运行测试"""
        test_urls = [
            "https://gamemonetize.com/among-us-online-edition-game",
            "https://gamemonetize.com/ultimate-robot-fighting-game",
            "https://gamemonetize.com/construction-simulator-lite-game"
        ]
        
        if not self.setup_driver():
            print("❌ 无法初始化浏览器驱动")
            return
        
        results = []
        try:
            for url in test_urls:
                result = self.test_game_extraction(url)
                results.append(result)
                time.sleep(2)  # 避免请求过快
            
            # 汇总结果
            print(f"\n{'='*80}")
            print(f"📊 测试结果汇总")
            print(f"{'='*80}")
            
            success_count = sum(1 for r in results if r.get('success', False))
            total_count = len(results)
            
            print(f"总测试数: {total_count}")
            print(f"成功数: {success_count}")
            print(f"成功率: {success_count/total_count*100:.1f}%")
            
            # 详细结果
            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result['url']}")
                if result.get('success'):
                    print(f"   ✅ 成功")
                    if result.get('description'):
                        print(f"   📝 描述: {len(result['description'])} 字符")
                    if result.get('tags'):
                        print(f"   🏷️ 标签: {len(result['tags'])} 个")
                else:
                    print(f"   ❌ 失败: {result.get('error', '未知错误')}")
            
            return results
            
        finally:
            if self.driver:
                self.driver.quit()

def main():
    """主函数"""
    print("🧪 开始测试修复后的提取功能...")
    
    extractor = TestExtractor()
    results = extractor.run_tests()
    
    if results:
        success_results = [r for r in results if r.get('success')]
        if success_results:
            print(f"\n🎉 测试完成！成功提取了 {len(success_results)} 个游戏的数据")
            print("✅ 修复成功，可以重新运行爬虫了！")
        else:
            print(f"\n❌ 测试失败，需要进一步调试")
    else:
        print(f"\n❌ 测试过程出现问题")

if __name__ == "__main__":
    main() 