# scripts/crawler/game_crawler.py - GameDistribution游戏爬虫脚本，简化版AJAX分页采集
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import json
import time
import os
from datetime import datetime

def load_existing_games():
    """加载已存在的游戏数据，支持断点续传"""
    output_file = 'scripts/output/all_games_continuous.json'
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                existing_games = data.get('games', [])
                last_page = data.get('last_page', 0)
                processed_urls = {game['url'] for game in existing_games}
                print(f"📂 加载已有数据: {len(existing_games)} 个游戏，上次处理到第 {last_page} 页")
                return existing_games, processed_urls, last_page
        except Exception as e:
            print(f"⚠️ 加载已有数据失败: {e}，将重新开始")
    
    return [], set(), 0

def save_progress(all_games, current_page, processed_urls, is_final=False):
    """保存当前进度"""
    output_dir = 'scripts/output'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, 'all_games_continuous.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'last_page': current_page,
            'total_games': len(all_games),
            'total_urls': len(processed_urls),
            'status': 'completed' if is_final else 'in_progress',
            'games': all_games
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 已保存进度: 第 {current_page} 页，共 {len(all_games)} 个游戏")

def get_games_from_current_page(driver, processed_urls):
    """从当前页面获取游戏列表 - 修复版"""
    try:
        # 等待游戏元素加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='ProductItem'], a[href*='/games/']"))
        )
    except Exception as e:
        print(f"⚠️ 等待页面元素超时: {e}")
        return []
    
    # 简化选择器，优先使用最常见的
    selectors = [
        "[class*='ProductItem']",
        "a[href*='/games/']"
    ]
    
    game_elements = []
    for selector in selectors:
        try:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements and len(elements) >= 20:  # 至少20个元素才认为有效
                game_elements = elements
                print(f"✅ 使用选择器 '{selector}' 找到 {len(game_elements)} 个元素")
                break
        except Exception:
            continue
    
    if not game_elements:
        print("❌ 未找到游戏元素")
        return []
    
    games = []
    successful_extractions = 0
    
    for i, element in enumerate(game_elements):
        try:
            # 获取游戏链接 - 修复版
            game_url = None
            
            if element.tag_name == 'a':
                href = element.get_attribute('href')
                if href and '/games/' in href:
                    game_url = href
            else:
                # 查找子元素中的链接
                try:
                    link = element.find_element(By.CSS_SELECTOR, "a[href*='/games/']")
                    game_url = link.get_attribute('href')
                except:
                    # 如果找不到子链接，尝试获取onclick或其他属性
                    try:
                        onclick = element.get_attribute('onclick')
                        if onclick and '/games/' in onclick:
                            # 从onclick中提取URL
                            import re
                            url_match = re.search(r"'/games/[^']+'", onclick)
                            if url_match:
                                game_url = 'https://gamedistribution.com' + url_match.group().strip("'")
                    except:
                        pass
            
            # 如果还是没有找到URL，跳过
            if not game_url:
                continue
                
            # 确保URL格式正确
            if not game_url.startswith('http'):
                if game_url.startswith('/'):
                    game_url = 'https://gamedistribution.com' + game_url
                else:
                    continue
            
            # 检查是否已处理过
            if game_url in processed_urls:
                continue
            
            processed_urls.add(game_url)
            
            # 获取游戏名称
            game_name = "未知游戏"
            try:
                text_content = element.text.strip()
                if text_content and len(text_content) < 200:
                    # 清理文本内容
                    lines = [line.strip() for line in text_content.split('\n') if line.strip()]
                    if lines:
                        # 取第一行作为游戏名称，但排除一些常见的非游戏名称
                        for line in lines:
                            if (len(line) > 2 and len(line) < 100 and 
                                not line.lower() in ['play', 'free', 'game', 'new', 'hot', 'popular']):
                                game_name = line
                                break
            except:
                pass
            
            # 如果还是没有名称，尝试从URL提取
            if game_name == "未知游戏":
                try:
                    url_parts = game_url.split('/')
                    if len(url_parts) > 2:
                        game_id = url_parts[-2] if url_parts[-1] == '' else url_parts[-1]
                        game_name = game_id.replace('-', ' ').title()
                except:
                    pass
            
            # 从URL提取游戏ID
            try:
                game_id = game_url.split('/')[-2] if game_url.endswith('/') else game_url.split('/')[-1]
            except:
                game_id = f"game_{len(games) + 1}"
            
            games.append({
                'id': game_id,
                'name': game_name,
                'url': game_url,
                'company': "未知开发商",
                'collected_at': datetime.now().isoformat()
            })
            
            successful_extractions += 1
            
            # 调试信息：显示前几个成功提取的游戏
            if successful_extractions <= 3:
                print(f"🎮 游戏 {successful_extractions}: {game_name} - {game_url}")
            
        except Exception as e:
            print(f"⚠️ 处理第 {i+1} 个元素时出错: {e}")
            continue
    
    print(f"📊 成功提取 {len(games)} 个游戏信息")
    return games

def click_next_page_simple(driver):
    """简化版点击下一页按钮"""
    try:
        # 简化的下一页按钮选择器
        next_selectors = [
            "a.pagination-button.next-button",
            "a[class*='next-button']",
            "a[class*='next']",
            "button[class*='next']"
        ]
        
        next_button = None
        for selector in next_selectors:
            try:
                buttons = driver.find_elements(By.CSS_SELECTOR, selector)
                for button in buttons:
                    if button.is_displayed() and button.is_enabled():
                        classes = button.get_attribute('class') or ''
                        if 'disabled' not in classes.lower():
                            next_button = button
                            print(f"✅ 找到下一页按钮: {selector}")
                            break
                if next_button:
                    break
            except Exception:
                continue
        
        if not next_button:
            print("❌ 未找到可用的下一页按钮")
            return False
        
        # 滚动到按钮位置并点击
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
        time.sleep(1)
        
        try:
            next_button.click()
            print("✅ 点击下一页按钮")
        except Exception:
            driver.execute_script("arguments[0].click();", next_button)
            print("✅ JavaScript点击成功")
        
        # 简单等待页面加载
        time.sleep(3)
        return True
        
    except Exception as e:
        print(f"❌ 点击下一页失败: {e}")
        return False

def continuous_crawl_games():
    """持续爬取游戏 - 修复版"""
    # 加载已有数据
    all_games, processed_urls, start_page = load_existing_games()
    
    # 配置Chrome选项
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
    except Exception as e:
        print(f"❌ 无法启动Chrome浏览器: {e}")
        return all_games
    
    current_page = 1
    consecutive_failures = 0
    max_failures = 3
    
    try:
        print("🚀 开始修复版持续爬取游戏...")
        driver.get('https://gamedistribution.com/games/')
        
        # 等待初始页面加载
        print("⏳ 等待初始页面加载...")
        time.sleep(5)
        
        while True:
            print(f"\n📄 正在处理第 {current_page} 页...")
            
            # 获取当前页面的游戏
            page_games = get_games_from_current_page(driver, processed_urls)
            
            if not page_games:
                consecutive_failures += 1
                print(f"❌ 第 {current_page} 页未找到新游戏 (连续失败: {consecutive_failures})")
                
                if consecutive_failures >= max_failures:
                    print(f"🏁 连续 {max_failures} 页失败，可能已到最后一页")
                    break
            else:
                consecutive_failures = 0  # 重置失败计数
                all_games.extend(page_games)
                print(f"✅ 第 {current_page} 页获取到 {len(page_games)} 个新游戏，累计 {len(all_games)} 个游戏")
            
            # 每10页保存一次进度并等待30秒
            if current_page % 10 == 0:
                save_progress(all_games, current_page, processed_urls)
                print(f"⏸️ 第 {current_page} 页完成，等待30秒增加稳定性...")
                time.sleep(30)
            
            # 尝试点击下一页
            if not click_next_page_simple(driver):
                print("🏁 无法点击下一页，爬取完成")
                break
            
            current_page += 1
            time.sleep(2)  # 基础等待时间
        
        # 最终保存
        save_progress(all_games, current_page, processed_urls, is_final=True)
        print(f"\n🎉 爬取完成！总共获取 {len(all_games)} 个游戏，处理了 {current_page} 页")
        
        return all_games
        
    except KeyboardInterrupt:
        print("\n⚠️ 用户中断爬取，保存当前进度...")
        save_progress(all_games, current_page, processed_urls)
        return all_games
        
    except Exception as e:
        print(f"❌ 爬取过程出错: {e}")
        save_progress(all_games, current_page, processed_urls)
        return all_games
    
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    print("🎮 GameDistribution 修复版爬虫启动")
    print("💡 提示: 按 Ctrl+C 可以随时中断并保存进度")
    
    games = continuous_crawl_games()
    print(f"\n🎉 爬取任务完成！总共获取 {len(games)} 个游戏")
    print(f"📁 数据已保存到: scripts/output/all_games_continuous.json")