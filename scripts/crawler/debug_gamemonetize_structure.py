# scripts/crawler/debug_gamemonetize_structure.py - 调试GameMonetize页面结构
"""
调试GameMonetize游戏页面的HTML结构
找出描述和标签的正确选择器
"""

import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_driver():
    """设置浏览器驱动"""
    try:
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # 无头模式
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        return driver
    except Exception as e:
        logger.error(f"浏览器驱动初始化失败: {e}")
        return None

def debug_game_page(driver, game_url):
    """调试游戏页面结构"""
    try:
        logger.info(f"正在访问: {game_url}")
        driver.get(game_url)
        
        # 等待页面加载
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(3)
        
        print(f"\n{'='*60}")
        print(f"🔍 调试游戏页面: {game_url}")
        print(f"页面标题: {driver.title}")
        print(f"{'='*60}")
        
        # 1. 查找描述相关的元素
        print(f"\n📝 查找描述元素:")
        description_selectors = [
            ".description", ".game-description", "#description",
            ".game-info p", ".content p", ".summary", ".about",
            "[data-testid='description']", ".game-content",
            ".game-details", ".info", ".game-summary"
        ]
        
        found_descriptions = []
        for selector in description_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for i, element in enumerate(elements):
                    text = element.text.strip()
                    if text and len(text) > 20:  # 只显示有意义的文本
                        found_descriptions.append({
                            'selector': selector,
                            'index': i,
                            'text': text[:200] + "..." if len(text) > 200 else text,
                            'full_length': len(text)
                        })
            except Exception as e:
                continue
        
        if found_descriptions:
            print("✅ 找到描述元素:")
            for desc in found_descriptions:
                print(f"   选择器: {desc['selector']} (索引: {desc['index']})")
                print(f"   长度: {desc['full_length']} 字符")
                print(f"   内容: {desc['text']}")
                print()
        else:
            print("❌ 未找到描述元素")
        
        # 2. 查找标签相关的元素
        print(f"\n🏷️ 查找标签元素:")
        tag_selectors = [
            ".tags", ".tag", ".keywords", ".game-tags",
            ".labels", "[data-testid='tags']", ".tag-list",
            ".categories", ".genre", ".game-category"
        ]
        
        found_tags = []
        for selector in tag_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for i, element in enumerate(elements):
                    text = element.text.strip()
                    if text:
                        # 检查是否包含链接
                        links = element.find_elements(By.TAG_NAME, "a")
                        if links:
                            link_texts = [link.text.strip() for link in links if link.text.strip()]
                            if link_texts:
                                found_tags.append({
                                    'selector': selector,
                                    'index': i,
                                    'type': 'links',
                                    'tags': link_texts
                                })
                        else:
                            found_tags.append({
                                'selector': selector,
                                'index': i,
                                'type': 'text',
                                'text': text
                            })
            except Exception as e:
                continue
        
        if found_tags:
            print("✅ 找到标签元素:")
            for tag_info in found_tags:
                print(f"   选择器: {tag_info['selector']} (索引: {tag_info['index']})")
                if tag_info['type'] == 'links':
                    print(f"   标签: {', '.join(tag_info['tags'])}")
                else:
                    print(f"   文本: {tag_info['text']}")
                print()
        else:
            print("❌ 未找到标签元素")
        
        # 3. 检查页面源码中的关键信息
        print(f"\n🔍 检查页面源码:")
        page_source = driver.page_source.lower()
        
        # 查找可能的描述关键词
        description_keywords = ['description', 'welcome to', 'game based on', 'you can play']
        for keyword in description_keywords:
            if keyword in page_source:
                print(f"✅ 页面包含关键词: '{keyword}'")
        
        # 查找可能的标签关键词
        tag_keywords = ['1 player', 'action', 'arcade', 'multiplayer', 'shooter', 'shooting']
        found_tag_keywords = []
        for keyword in tag_keywords:
            if keyword in page_source:
                found_tag_keywords.append(keyword)
        
        if found_tag_keywords:
            print(f"✅ 页面包含标签关键词: {', '.join(found_tag_keywords)}")
        
        # 4. 检查特定的GameMonetize结构
        print(f"\n🎮 检查GameMonetize特定结构:")
        
        # 检查游戏信息区域
        game_info_selectors = [
            ".game-info", ".game-details", ".game-content",
            "#game-info", "#game-details", ".info-section"
        ]
        
        for selector in game_info_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"✅ 找到游戏信息区域: {selector}")
                    for i, element in enumerate(elements):
                        inner_html = element.get_attribute('innerHTML')[:500]
                        print(f"   内容预览 (索引 {i}): {inner_html}...")
                        print()
            except:
                continue
        
        # 5. 检查meta标签
        print(f"\n📋 检查Meta标签:")
        try:
            meta_desc = driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
            content = meta_desc.get_attribute('content')
            if content:
                print(f"✅ Meta描述: {content}")
        except:
            print("❌ 未找到Meta描述")
        
        try:
            meta_keywords = driver.find_element(By.CSS_SELECTOR, 'meta[name="keywords"]')
            content = meta_keywords.get_attribute('content')
            if content:
                print(f"✅ Meta关键词: {content}")
        except:
            print("❌ 未找到Meta关键词")
        
        return True
        
    except Exception as e:
        logger.error(f"调试页面失败: {e}")
        return False

def main():
    """主函数"""
    # 测试游戏URL列表
    test_urls = [
        "https://gamemonetize.com/among-us-online-edition-game",
        "https://gamemonetize.com/ultimate-robot-fighting-game",
        "https://gamemonetize.com/construction-simulator-lite-game"
    ]
    
    driver = setup_driver()
    if not driver:
        print("❌ 无法初始化浏览器驱动")
        return
    
    try:
        for url in test_urls:
            debug_game_page(driver, url)
            print(f"\n{'='*80}\n")
            time.sleep(2)  # 避免请求过快
            
    finally:
        driver.quit()
        print("🔚 调试完成")

if __name__ == "__main__":
    main() 