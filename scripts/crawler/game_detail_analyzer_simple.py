# scripts/crawler/game_detail_analyzer_simple.py - 简化版游戏详情页面分析器
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

class SimpleGameAnalyzer:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        
    def setup_driver(self):
        """配置Chrome浏览器 - 简化版"""
        print("正在启动浏览器...")
        chrome_options = Options()
        # 不使用无头模式，方便调试
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1280,720')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        # 禁用图片和CSS加载以提高速度
        prefs = {
            "profile.managed_default_content_settings.images": 2,
            "profile.default_content_setting_values.notifications": 2
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(30)  # 设置页面加载超时
        print("浏览器启动成功")
        
    def analyze_game_page(self, game_url, game_info):
        """简化版页面分析"""
        print(f"\n开始访问: {game_url}")
        
        try:
            # 访问页面
            print("正在加载页面...")
            self.driver.get(game_url)
            print("页面加载完成，等待3秒...")
            time.sleep(3)
            
            # 获取基本信息
            result = {
                'url': game_url,
                'basic_info': game_info,
                'analysis_time': datetime.now().isoformat(),
                'page_loaded': True
            }
            
            # 获取页面标题
            print("获取页面标题...")
            try:
                result['page_title'] = self.driver.title
                print(f"页面标题: {result['page_title']}")
            except Exception as e:
                print(f"获取页面标题失败: {e}")
                result['page_title'] = None
            
            # 获取页面源码长度（用于验证页面是否正常加载）
            try:
                page_source_length = len(self.driver.page_source)
                result['page_source_length'] = page_source_length
                print(f"页面源码长度: {page_source_length} 字符")
            except Exception as e:
                print(f"获取页面源码失败: {e}")
                result['page_source_length'] = 0
            
            # 检查是否有游戏iframe
            print("检查游戏iframe...")
            try:
                iframes = self.driver.find_elements(By.TAG_NAME, 'iframe')
                result['iframe_count'] = len(iframes)
                if iframes:
                    iframe_info = []
                    for i, iframe in enumerate(iframes[:3]):  # 只检查前3个
                        info = {
                            'src': iframe.get_attribute('src'),
                            'width': iframe.get_attribute('width'),
                            'height': iframe.get_attribute('height'),
                            'id': iframe.get_attribute('id')
                        }
                        iframe_info.append(info)
                        print(f"iframe {i+1}: {info['src']}")
                    result['iframes'] = iframe_info
                else:
                    result['iframes'] = []
                    print("未找到iframe")
            except Exception as e:
                print(f"检查iframe失败: {e}")
                result['iframe_count'] = 0
                result['iframes'] = []
            
            # 获取所有h1标签
            print("获取标题信息...")
            try:
                h1_elements = self.driver.find_elements(By.TAG_NAME, 'h1')
                h1_texts = [h1.text.strip() for h1 in h1_elements if h1.text.strip()]
                result['h1_titles'] = h1_texts
                print(f"找到 {len(h1_texts)} 个h1标题: {h1_texts}")
            except Exception as e:
                print(f"获取h1标题失败: {e}")
                result['h1_titles'] = []
            
            # 获取meta描述
            print("获取meta信息...")
            try:
                meta_desc = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
                result['meta_description'] = meta_desc.get_attribute('content')
                print(f"Meta描述: {result['meta_description'][:100]}...")
            except:
                result['meta_description'] = None
                print("未找到meta描述")
            
            # 获取所有图片
            print("获取图片信息...")
            try:
                images = self.driver.find_elements(By.TAG_NAME, 'img')
                image_info = []
                for img in images[:5]:  # 只检查前5张图片
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt')
                    if src:
                        image_info.append({'src': src, 'alt': alt})
                result['images'] = image_info
                print(f"找到 {len(images)} 张图片，记录前5张")
            except Exception as e:
                print(f"获取图片失败: {e}")
                result['images'] = []
            
            # 获取页面文本内容（前500字符）
            print("获取页面文本...")
            try:
                body = self.driver.find_element(By.TAG_NAME, 'body')
                body_text = body.text[:500]
                result['body_text_preview'] = body_text
                print(f"页面文本预览: {body_text[:100]}...")
            except Exception as e:
                print(f"获取页面文本失败: {e}")
                result['body_text_preview'] = None
            
            print("\n=== 分析完成 ===")
            return result
            
        except TimeoutException:
            print("页面加载超时")
            return {
                'url': game_url,
                'basic_info': game_info,
                'error': 'Page load timeout',
                'page_loaded': False
            }
        except Exception as e:
            print(f"分析过程中出错: {str(e)}")
            return {
                'url': game_url,
                'basic_info': game_info,
                'error': str(e),
                'page_loaded': False
            }
    
    def save_result(self, result, filename):
        """保存分析结果"""
        output_dir = 'scripts/output'
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n结果已保存到: {filepath}")
    
    def close(self):
        """关闭浏览器"""
        if self.driver:
            print("正在关闭浏览器...")
            self.driver.quit()
            print("浏览器已关闭")

def main():
    print("=== 简化版游戏页面分析器 ===")
    
    # 读取游戏列表
    try:
        with open('scripts/output/all_games_continuous.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"成功读取游戏列表，共 {data['total_games']} 个游戏")
    except Exception as e:
        print(f"读取游戏列表失败: {e}")
        return
    
    # 获取第一个游戏
    first_game = data['games'][0]
    print(f"\n准备分析第一个游戏:")
    print(f"名称: {first_game['name']}")
    print(f"URL: {first_game['url']}")
    
    # 创建分析器
    analyzer = SimpleGameAnalyzer()
    
    try:
        # 分析游戏页面
        result = analyzer.analyze_game_page(first_game['url'], first_game)
        
        if result:
            # 保存结果
            analyzer.save_result(result, 'simple_game_analysis.json')
            
            # 打印摘要
            print("\n=== 分析结果摘要 ===")
            if result.get('page_loaded'):
                print(f"✓ 页面加载成功")
                print(f"✓ 页面标题: {result.get('page_title', 'N/A')}")
                print(f"✓ 页面大小: {result.get('page_source_length', 0)} 字符")
                print(f"✓ iframe数量: {result.get('iframe_count', 0)}")
                print(f"✓ 图片数量: {len(result.get('images', []))}")
                print(f"✓ H1标题: {result.get('h1_titles', [])}")
            else:
                print(f"✗ 页面加载失败: {result.get('error', 'Unknown error')}")
        else:
            print("分析失败，未获取到结果")
    
    except KeyboardInterrupt:
        print("\n用户中断操作")
    except Exception as e:
        print(f"\n运行出错: {str(e)}")
    
    finally:
        analyzer.close()
        print("\n程序结束")

if __name__ == "__main__":
    main()