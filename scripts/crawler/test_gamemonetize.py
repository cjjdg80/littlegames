#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/crawler/test_gamemonetize.py
GameMonetize爬虫测试脚本 - 测试基本功能和网站访问
"""

import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def test_basic_access():
    """测试基本网站访问"""
    print("🔍 测试基本网站访问...")
    
    try:
        response = requests.get("https://gamemonetize.com", timeout=10)
        print(f"✅ 网站响应状态: {response.status_code}")
        print(f"✅ 响应时间: {response.elapsed.total_seconds():.2f}秒")
        return True
    except Exception as e:
        print(f"❌ 网站访问失败: {e}")
        return False

def test_selenium_access():
    """测试Selenium浏览器访问"""
    print("\n🔍 测试Selenium浏览器访问...")
    
    try:
        # 设置Chrome选项
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-images')
        chrome_options.add_argument('--window-size=1280,720')
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        
        # 访问首页
        driver.get("https://gamemonetize.com")
        time.sleep(3)
        
        page_title = driver.title
        print(f"✅ 页面标题: {page_title}")
        
        # 查找游戏链接
        game_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/game') or contains(@href, '-game')]")
        print(f"✅ 找到游戏链接数量: {len(game_links)}")
        
        # 获取前5个游戏链接进行测试
        test_urls = []
        for i, link in enumerate(game_links[:5]):
            href = link.get_attribute('href')
            if href:
                test_urls.append(href)
                print(f"  游戏链接 {i+1}: {href}")
        
        driver.quit()
        return test_urls
        
    except Exception as e:
        print(f"❌ Selenium访问失败: {e}")
        return []

def test_game_detail_page(game_url):
    """测试单个游戏详情页面"""
    print(f"\n🔍 测试游戏详情页面: {game_url}")
    
    try:
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1280,720')
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        
        driver.get(game_url)
        time.sleep(3)
        
        # 检查页面标题
        page_title = driver.title
        print(f"  页面标题: {page_title}")
        
        # 查找iframe
        iframe_found = False
        try:
            iframe_element = driver.find_element(By.TAG_NAME, "iframe")
            iframe_src = iframe_element.get_attribute("src")
            iframe_found = True
            print(f"  ✅ 找到iframe: {iframe_src[:100]}...")
        except NoSuchElementException:
            print(f"  ❌ 未找到iframe")
        
        # 查找游戏标题
        title_found = False
        title_selectors = ["h1", "h2", ".game-title", ".title"]
        for selector in title_selectors:
            try:
                title_element = driver.find_element(By.CSS_SELECTOR, selector)
                game_title = title_element.text.strip()
                if game_title:
                    print(f"  ✅ 游戏标题: {game_title}")
                    title_found = True
                    break
            except NoSuchElementException:
                continue
        
        if not title_found:
            print(f"  ❌ 未找到游戏标题")
        
        # 查找描述
        desc_found = False
        desc_selectors = [".description", ".game-description", "#description"]
        for selector in desc_selectors:
            try:
                desc_element = driver.find_element(By.CSS_SELECTOR, selector)
                description = desc_element.text.strip()
                if len(description) > 20:
                    print(f"  ✅ 游戏描述: {description[:100]}...")
                    desc_found = True
                    break
            except NoSuchElementException:
                continue
        
        if not desc_found:
            print(f"  ❌ 未找到游戏描述")
        
        driver.quit()
        
        # 计算质量分
        quality_score = 0
        if iframe_found:
            quality_score += 40
        if title_found:
            quality_score += 30
        if desc_found:
            quality_score += 20
        if len(page_title) > 5:
            quality_score += 10
        
        print(f"  📊 页面质量分: {quality_score}/100")
        return quality_score >= 50  # 50分以上认为可用
        
    except Exception as e:
        print(f"  ❌ 访问失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🕷️ GameMonetize爬虫功能测试")
    print("=" * 50)
    
    # 测试1：基本网站访问
    if not test_basic_access():
        print("❌ 基本网站访问失败，无法继续测试")
        return
    
    # 测试2：Selenium访问和游戏链接获取
    test_urls = test_selenium_access()
    if not test_urls:
        print("❌ 无法获取游戏链接，测试终止")
        return
    
    # 测试3：游戏详情页面访问
    print(f"\n🔍 测试 {len(test_urls)} 个游戏详情页面...")
    success_count = 0
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n--- 测试游戏 {i}/{len(test_urls)} ---")
        if test_game_detail_page(url):
            success_count += 1
        time.sleep(2)  # 延迟避免被封
    
    # 测试结果总结
    print("\n" + "=" * 50)
    print("📊 测试结果总结:")
    print(f"  总测试游戏数: {len(test_urls)}")
    print(f"  成功访问数: {success_count}")
    print(f"  成功率: {success_count/len(test_urls)*100:.1f}%")
    
    if success_count > 0:
        print("\n✅ 爬虫基本功能正常，可以开始正式采集")
        print("💡 建议运行: python gamemonetize_crawler.py")
    else:
        print("\n❌ 爬虫功能异常，需要检查网站结构或代码")

if __name__ == "__main__":
    main() 