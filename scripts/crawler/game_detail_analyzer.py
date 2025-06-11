import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os
from datetime import datetime

class GameDetailAnalyzer:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        
    def setup_driver(self):
        """配置Chrome浏览器"""
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # 先不使用无头模式，方便调试
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        
    def analyze_game_page(self, game_url, game_info):
        """分析单个游戏页面的所有可获取元素"""
        print(f"\n正在分析游戏: {game_info['name']}")
        print(f"URL: {game_url}")
        
        try:
            self.driver.get(game_url)
            time.sleep(3)  # 等待页面加载
            
            # 收集所有可能的数据元素
            game_data = {
                'basic_info': game_info,
                'page_title': self.get_page_title(),
                'game_title': self.get_game_title(),
                'description': self.get_description(),
                'categories': self.get_categories(),
                'tags': self.get_tags(),
                'developer': self.get_developer(),
                'publisher': self.get_publisher(),
                'screenshots': self.get_screenshots(),
                'game_iframe': self.get_game_iframe(),
                'rating': self.get_rating(),
                'play_count': self.get_play_count(),
                'publish_date': self.get_publish_date(),
                'game_size': self.get_game_size(),
                'instructions': self.get_instructions(),
                'related_games': self.get_related_games(),
                'meta_keywords': self.get_meta_keywords(),
                'meta_description': self.get_meta_description(),
                'og_data': self.get_og_data(),
                'json_ld': self.get_json_ld_data(),
                'all_text_content': self.get_all_text_content(),
                'all_images': self.get_all_images(),
                'all_links': self.get_all_links()
            }
            
            return game_data
            
        except Exception as e:
            print(f"分析页面时出错: {str(e)}")
            return None
    
    def get_page_title(self):
        """获取页面标题"""
        try:
            return self.driver.title
        except:
            return None
    
    def get_game_title(self):
        """获取游戏标题 - 尝试多种选择器"""
        selectors = [
            'h1',
            '.game-title',
            '.title',
            '[data-testid="game-title"]',
            '.game-name',
            '.game-header h1',
            '.content h1'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_description(self):
        """获取游戏描述"""
        selectors = [
            '.game-description',
            '.description',
            '.game-info .description',
            '[data-testid="game-description"]',
            '.content .description',
            '.game-details .description',
            'meta[name="description"]'
        ]
        
        for selector in selectors:
            try:
                if 'meta' in selector:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    return element.get_attribute('content')
                else:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.text.strip():
                        return element.text.strip()
            except:
                continue
        return None
    
    def get_categories(self):
        """获取游戏分类"""
        selectors = [
            '.category',
            '.categories',
            '.game-category',
            '.breadcrumb',
            '.tags .category',
            '[data-testid="category"]'
        ]
        
        categories = []
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    text = element.text.strip()
                    if text and text not in categories:
                        categories.append(text)
            except:
                continue
        return categories
    
    def get_tags(self):
        """获取游戏标签"""
        selectors = [
            '.tag',
            '.tags',
            '.game-tags',
            '.keywords',
            '[data-testid="tags"]',
            '.tag-list .tag'
        ]
        
        tags = []
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    text = element.text.strip()
                    if text and text not in tags:
                        tags.append(text)
            except:
                continue
        return tags
    
    def get_developer(self):
        """获取开发商信息"""
        selectors = [
            '.developer',
            '.game-developer',
            '.author',
            '.creator',
            '[data-testid="developer"]',
            '.game-info .developer'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_publisher(self):
        """获取发布商信息"""
        selectors = [
            '.publisher',
            '.game-publisher',
            '[data-testid="publisher"]',
            '.game-info .publisher'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_screenshots(self):
        """获取游戏截图"""
        selectors = [
            '.screenshot img',
            '.screenshots img',
            '.game-images img',
            '.gallery img',
            '[data-testid="screenshot"]',
            '.preview-images img'
        ]
        
        screenshots = []
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    src = element.get_attribute('src')
                    if src and src not in screenshots:
                        screenshots.append(src)
            except:
                continue
        return screenshots
    
    def get_game_iframe(self):
        """获取游戏iframe信息"""
        try:
            iframe = self.driver.find_element(By.TAG_NAME, 'iframe')
            return {
                'src': iframe.get_attribute('src'),
                'width': iframe.get_attribute('width'),
                'height': iframe.get_attribute('height'),
                'id': iframe.get_attribute('id'),
                'class': iframe.get_attribute('class')
            }
        except:
            return None
    
    def get_rating(self):
        """获取游戏评分"""
        selectors = [
            '.rating',
            '.score',
            '.stars',
            '[data-testid="rating"]',
            '.game-rating'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_play_count(self):
        """获取游戏播放次数"""
        selectors = [
            '.play-count',
            '.plays',
            '.views',
            '[data-testid="play-count"]',
            '.game-stats .plays'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_publish_date(self):
        """获取发布日期"""
        selectors = [
            '.publish-date',
            '.date',
            '.created-date',
            '[data-testid="publish-date"]',
            '.game-info .date'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_game_size(self):
        """获取游戏大小"""
        selectors = [
            '.game-size',
            '.size',
            '.file-size',
            '[data-testid="game-size"]'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_instructions(self):
        """获取游戏说明"""
        selectors = [
            '.instructions',
            '.how-to-play',
            '.game-instructions',
            '[data-testid="instructions"]',
            '.controls'
        ]
        
        for selector in selectors:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, selector)
                if element.text.strip():
                    return element.text.strip()
            except:
                continue
        return None
    
    def get_related_games(self):
        """获取相关游戏"""
        selectors = [
            '.related-games a',
            '.similar-games a',
            '.recommended-games a',
            '[data-testid="related-games"] a'
        ]
        
        related = []
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    href = element.get_attribute('href')
                    text = element.text.strip()
                    if href and text:
                        related.append({'url': href, 'title': text})
            except:
                continue
        return related
    
    def get_meta_keywords(self):
        """获取meta keywords"""
        try:
            element = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="keywords"]')
            return element.get_attribute('content')
        except:
            return None
    
    def get_meta_description(self):
        """获取meta description"""
        try:
            element = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
            return element.get_attribute('content')
        except:
            return None
    
    def get_og_data(self):
        """获取Open Graph数据"""
        og_data = {}
        og_properties = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']
        
        for prop in og_properties:
            try:
                element = self.driver.find_element(By.CSS_SELECTOR, f'meta[property="{prop}"]')
                og_data[prop] = element.get_attribute('content')
            except:
                continue
        
        return og_data if og_data else None
    
    def get_json_ld_data(self):
        """获取JSON-LD结构化数据"""
        try:
            scripts = self.driver.find_elements(By.CSS_SELECTOR, 'script[type="application/ld+json"]')
            json_ld_data = []
            for script in scripts:
                try:
                    data = json.loads(script.get_attribute('innerHTML'))
                    json_ld_data.append(data)
                except:
                    continue
            return json_ld_data if json_ld_data else None
        except:
            return None
    
    def get_all_text_content(self):
        """获取页面所有文本内容（用于分析）"""
        try:
            body = self.driver.find_element(By.TAG_NAME, 'body')
            return body.text[:2000]  # 限制长度
        except:
            return None
    
    def get_all_images(self):
        """获取页面所有图片"""
        images = []
        try:
            img_elements = self.driver.find_elements(By.TAG_NAME, 'img')
            for img in img_elements[:10]:  # 限制数量
                src = img.get_attribute('src')
                alt = img.get_attribute('alt')
                if src:
                    images.append({'src': src, 'alt': alt})
        except:
            pass
        return images
    
    def get_all_links(self):
        """获取页面所有链接"""
        links = []
        try:
            link_elements = self.driver.find_elements(By.TAG_NAME, 'a')
            for link in link_elements[:20]:  # 限制数量
                href = link.get_attribute('href')
                text = link.text.strip()
                if href:
                    links.append({'url': href, 'text': text})
        except:
            pass
        return links
    
    def save_analysis_result(self, game_data, filename):
        """保存分析结果"""
        output_dir = 'scripts/output'
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(game_data, f, ensure_ascii=False, indent=2)
        
        print(f"分析结果已保存到: {filepath}")
    
    def close(self):
        """关闭浏览器"""
        if self.driver:
            self.driver.quit()

def main():
    # 读取游戏列表
    with open('scripts/output/all_games_continuous.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 获取第一个游戏信息
    first_game = data['games'][0]
    game_url = first_game['url']
    
    print(f"开始分析第一个游戏: {first_game['name']}")
    print(f"URL: {game_url}")
    
    # 创建分析器
    analyzer = GameDetailAnalyzer()
    
    try:
        # 分析游戏页面
        result = analyzer.analyze_game_page(game_url, first_game)
        
        if result:
            # 保存详细分析结果
            analyzer.save_analysis_result(result, 'game_detail_analysis.json')
            
            # 打印摘要
            print("\n=== 分析结果摘要 ===")
            for key, value in result.items():
                if value is not None and value != [] and value != {}:
                    if isinstance(value, str) and len(value) > 100:
                        print(f"{key}: {value[:100]}...")
                    else:
                        print(f"{key}: {value}")
                else:
                    print(f"{key}: [未找到]")
        else:
            print("分析失败")
    
    except Exception as e:
        print(f"运行出错: {str(e)}")
    
    finally:
        analyzer.close()

if __name__ == "__main__":
    main()