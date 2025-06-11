# scripts/crawler/game_detail_extractor.py - 精确的游戏详情数据提取器
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
import re

class GameDetailExtractor:
    def __init__(self, headless=True):
        self.driver = None
        self.headless = headless
        self.setup_driver()
        
    def setup_driver(self):
        """配置Chrome浏览器"""
        mode_text = "无头模式" if self.headless else "可视模式"
        print(f"正在启动浏览器（{mode_text}）...")
        chrome_options = Options()
        
        # 基础配置
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1280,720')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        # 无头模式配置
        if self.headless:
            chrome_options.add_argument('--headless')
            # 无头模式下的额外优化
            chrome_options.add_argument('--disable-images')  # 禁用图片加载
            chrome_options.add_argument('--disable-javascript')  # 可选：禁用JS（需要测试是否影响数据提取）
            chrome_options.add_argument('--disable-plugins')
            chrome_options.add_argument('--disable-extensions')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(30)
        print(f"浏览器启动成功（{mode_text}）")
        
    def extract_game_details(self, game_url, game_info):
        """提取游戏详细信息"""
        print(f"\n开始提取游戏详情: {game_info['name']}")
        print(f"URL: {game_url}")
        
        try:
            # 访问页面
            self.driver.get(game_url)
            time.sleep(5)  # 等待页面完全加载
            
            # 初始化结果
            result = {
                'basic_info': game_info,
                'extraction_time': datetime.now().isoformat(),
                'url': game_url
            }
            
            # 1. 提取游戏基本信息区域
            print("\n1. 提取游戏基本信息...")
            result['game_info'] = self.extract_game_info()
            
            # 2. 提取游戏类型(Genres)
            print("2. 提取游戏类型...")
            result['genres'] = self.extract_genres()
            
            # 3. 提取游戏标签(Tags)
            print("3. 提取游戏标签...")
            result['tags'] = self.extract_tags()
            
            # 4. 提取缩略图
            print("4. 提取游戏缩略图...")
            result['thumbnails'] = self.extract_thumbnails()
            
            # 5. 提取iframe代码
            print("5. 提取iframe代码...")
            result['iframe_code'] = self.extract_iframe_code()
            
            # 6. 提取游戏描述和说明
            print("6. 提取游戏描述...")
            result['description'] = self.extract_description()
            result['instructions'] = self.extract_instructions()
            
            print("\n=== 提取完成 ===")
            return result
            
        except Exception as e:
            print(f"提取过程中出错: {str(e)}")
            return {
                'basic_info': game_info,
                'url': game_url,
                'error': str(e),
                'extraction_time': datetime.now().isoformat()
            }
    
    def extract_game_info(self):
        """提取游戏基本信息区域"""
        game_info = {}
        
        try:
            # 游戏标题
            title_element = self.driver.find_element(By.CSS_SELECTOR, '.info-line .row span strong')
            game_info['title'] = title_element.text.strip()
            print(f"  游戏标题: {game_info['title']}")
        except:
            game_info['title'] = None
            print("  游戏标题: 未找到")
        
        try:
            # 发布商
            publisher_element = self.driver.find_element(By.CSS_SELECTOR, '.info-line .row a[href*="company"]')
            game_info['publisher'] = publisher_element.text.strip()
            game_info['publisher_url'] = publisher_element.get_attribute('href')
            print(f"  发布商: {game_info['publisher']}")
        except:
            game_info['publisher'] = None
            game_info['publisher_url'] = None
            print("  发布商: 未找到")
        
        try:
            # 移动端兼容性
            mobile_element = self.driver.find_element(By.XPATH, "//span[contains(text(), 'Mobile Web Compatible')]")
            game_info['mobile_compatible'] = mobile_element.text.strip()
            print(f"  移动端兼容: {game_info['mobile_compatible']}")
        except:
            game_info['mobile_compatible'] = None
            print("  移动端兼容: 未找到")
        
        try:
            # 支持语言
            language_tags = self.driver.find_elements(By.XPATH, "//span[text()='Language']/following-sibling::div[@class='tags']//span[@class='tag cursor-pointer']")
            game_info['languages'] = [tag.text.strip() for tag in language_tags]
            print(f"  支持语言: {game_info['languages']}")
        except:
            game_info['languages'] = []
            print("  支持语言: 未找到")
        
        try:
            # 性别标签
            gender_tags = self.driver.find_elements(By.XPATH, "//span[text()='Gender']/following-sibling::div[@class='tags']//span[@class='tag']")
            game_info['gender_tags'] = [tag.text.strip() for tag in gender_tags]
            print(f"  性别标签: {game_info['gender_tags']}")
        except:
            game_info['gender_tags'] = []
            print("  性别标签: 未找到")
        
        try:
            # 年龄组
            age_tags = self.driver.find_elements(By.XPATH, "//span[text()='Age Group']/following-sibling::div[@class='tags']//span[@class='tag']")
            game_info['age_groups'] = [tag.text.strip() for tag in age_tags]
            print(f"  年龄组: {game_info['age_groups']}")
        except:
            game_info['age_groups'] = []
            print("  年龄组: 未找到")
        
        return game_info
    
    def extract_genres(self):
        """提取游戏类型"""
        try:
            genre_elements = self.driver.find_elements(By.XPATH, "//h4[text()='Genres']/following-sibling::div[@class='tags']//span[@class='tag cursor-pointer']")
            genres = [genre.text.strip() for genre in genre_elements]
            print(f"  找到类型: {genres}")
            return genres
        except Exception as e:
            print(f"  提取类型失败: {e}")
            return []
    
    def extract_tags(self):
        """提取游戏标签"""
        try:
            tag_elements = self.driver.find_elements(By.XPATH, "//h4[text()='Tags']/following-sibling::div[@class='tags']//span[@class='tag']")
            tags = [tag.text.strip() for tag in tag_elements]
            print(f"  找到标签: {tags}")
            return tags
        except Exception as e:
            print(f"  提取标签失败: {e}")
            return []
    
    def extract_thumbnails(self):
        """提取游戏缩略图"""
        thumbnails = []
        try:
            # 查找缩略图容器
            thumbnail_container = self.driver.find_element(By.CSS_SELECTOR, '.games_gameThumnailImage__eM2Tb')
            
            # 提取所有图片
            img_elements = thumbnail_container.find_elements(By.TAG_NAME, 'img')
            
            for img in img_elements:
                src = img.get_attribute('src')
                alt = img.get_attribute('alt')
                
                if src:
                    # 从文件名中提取尺寸信息
                    size_match = re.search(r'(\d+x\d+)', alt or src)
                    size = size_match.group(1) if size_match else 'unknown'
                    
                    thumbnails.append({
                        'url': src,
                        'size': size,
                        'alt': alt
                    })
            
            print(f"  找到 {len(thumbnails)} 张缩略图")
            for thumb in thumbnails:
                print(f"    {thumb['size']}: {thumb['url']}")
            
            return thumbnails
            
        except Exception as e:
            print(f"  提取缩略图失败: {e}")
            return []
    
    def extract_iframe_code(self):
        """提取iframe代码"""
        try:
            # 查找包含iframe代码的元素
            iframe_element = self.driver.find_element(By.CSS_SELECTOR, '.copy-input')
            iframe_code = iframe_element.text.strip()
            
            # 提取iframe的src属性
            src_match = re.search(r'src="([^"]+)"', iframe_code)
            iframe_src = src_match.group(1) if src_match else None
            
            # 提取宽度和高度
            width_match = re.search(r'width="([^"]+)"', iframe_code)
            height_match = re.search(r'height="([^"]+)"', iframe_code)
            
            result = {
                'full_code': iframe_code,
                'src': iframe_src,
                'width': width_match.group(1) if width_match else None,
                'height': height_match.group(1) if height_match else None
            }
            
            print(f"  iframe源: {result['src']}")
            print(f"  尺寸: {result['width']}x{result['height']}")
            
            return result
            
        except Exception as e:
            print(f"  提取iframe代码失败: {e}")
            return None
    
    def extract_description(self):
        """提取游戏描述"""
        try:
            desc_element = self.driver.find_element(By.XPATH, "//h3[text()='DESCRIPTION']/following-sibling::p")
            description = desc_element.text.strip()
            print(f"  描述长度: {len(description)} 字符")
            return description
        except Exception as e:
            print(f"  提取描述失败: {e}")
            return None
    
    def extract_instructions(self):
        """提取游戏说明"""
        try:
            inst_element = self.driver.find_element(By.XPATH, "//h3[text()='INSTRUCTIONS']/following-sibling::p")
            instructions = inst_element.text.strip()
            print(f"  说明长度: {len(instructions)} 字符")
            return instructions
        except Exception as e:
            print(f"  提取说明失败: {e}")
            return None
    
    def save_result(self, result, filename):
        """保存提取结果"""
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
    print("=== 游戏详情精确提取器 ===")
    
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
    print(f"\n准备提取第一个游戏的详细信息:")
    print(f"名称: {first_game['name']}")
    print(f"URL: {first_game['url']}")
    
    # 创建提取器
    extractor = GameDetailExtractor()
    
    try:
        # 提取游戏详情
        result = extractor.extract_game_details(first_game['url'], first_game)
        
        if result and 'error' not in result:
            # 保存结果
            extractor.save_result(result, 'game_detail_extracted.json')
            
            # 打印详细摘要
            print("\n=== 提取结果摘要 ===")
            print(f"✓ 游戏标题: {result['game_info'].get('title', 'N/A')}")
            print(f"✓ 发布商: {result['game_info'].get('publisher', 'N/A')}")
            print(f"✓ 支持语言: {len(result['game_info'].get('languages', []))} 种")
            print(f"✓ 游戏类型: {result.get('genres', [])}")
            print(f"✓ 游戏标签: {result.get('tags', [])}")
            print(f"✓ 缩略图数量: {len(result.get('thumbnails', []))}")
            print(f"✓ iframe源: {result.get('iframe_code', {}).get('src', 'N/A')}")
            
            # 验证关键数据
            print("\n=== 关键数据验证 ===")
            iframe_code = result.get('iframe_code')
            if iframe_code and iframe_code.get('src'):
                expected_pattern = "html5.gamedistribution.com/9423ba1c5c0847998ae6bbae78ba4c91"
                if expected_pattern in iframe_code['src']:
                    print("✓ iframe代码验证通过")
                else:
                    print("✗ iframe代码验证失败")
            else:
                print("✗ 未找到iframe代码")
                
        else:
            print(f"提取失败: {result.get('error', 'Unknown error')}")
    
    except KeyboardInterrupt:
        print("\n用户中断操作")
    except Exception as e:
        print(f"\n运行出错: {str(e)}")
    
    finally:
        extractor.close()
        print("\n程序结束")

if __name__ == "__main__":
    # 测试游戏URL和信息
    test_url = "https://gamedistribution.com/games/obby-survive-parkour/"
    test_game_info = {
        "id": "obby-survive-parkour",
        "name": "Obby Survive Parkour",
        "url": test_url,
        "company": "未知开发商",
        "collected_at": datetime.now().isoformat()
    }
    
    # 可以通过参数控制是否使用无头模式
    import sys
    headless_mode = True  # 默认使用无头模式
    if len(sys.argv) > 1 and sys.argv[1] == '--debug':
        headless_mode = False  # 调试模式使用可视界面
    
    extractor = GameDetailExtractor(headless=headless_mode)
    
    try:
        result = extractor.extract_game_details(test_url, test_game_info)
        
        # 保存结果
        output_file = "scripts/output/game_detail_headless_test.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 数据提取完成！结果已保存到: {output_file}")
        
    except Exception as e:
        print(f"❌ 提取过程中出现错误: {str(e)}")
    finally:
        extractor.close()