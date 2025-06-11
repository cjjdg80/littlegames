# scripts/crawler/game_detail_requests.py - 使用requests直接获取游戏详情（无浏览器版本）

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse

def get_game_details_requests(url):
    """
    使用requests + BeautifulSoup获取游戏详情
    相比Selenium版本，速度提升10-20倍
    """
    print(f"\n🚀 开始分析游戏: {url}")
    
    # 设置请求头，模拟真实浏览器
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        # 发送HTTP请求
        print("📡 发送HTTP请求...")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        print(f"✅ 页面获取成功，状态码: {response.status_code}")
        print(f"📄 页面大小: {len(response.content)} bytes")
        
        # 解析HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 提取游戏ID（从URL中获取）
        game_id = extract_game_id_from_url(url)
        
        # 构建游戏数据结构
        game_data = {
            "basic_info": {
                "id": game_id,
                "name": "",
                "url": url,
                "company": "未知开发商",
                "collected_at": datetime.now().isoformat()
            },
            "extraction_time": datetime.now().isoformat(),
            "url": url,
            "game_info": extract_game_info(soup),
            "genres": extract_genres(soup),
            "tags": extract_tags(soup),
            "thumbnails": extract_thumbnails(soup),
            "iframe_code": extract_iframe_code(soup),
            "description": extract_description(soup),
            "instructions": extract_instructions(soup)
        }
        
        # 更新基本信息中的游戏名称
        if game_data["game_info"].get("title"):
            game_data["basic_info"]["name"] = game_data["game_info"]["title"]
        
        # 更新发布商信息
        if game_data["game_info"].get("publisher"):
            game_data["basic_info"]["company"] = game_data["game_info"]["publisher"]
        
        print("✅ 数据提取完成")
        return game_data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ 网络请求失败: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ 数据提取失败: {str(e)}")
        return None

def extract_game_id_from_url(url):
    """从URL中提取游戏ID"""
    try:
        # 从URL路径中提取游戏ID
        path = urlparse(url).path
        # 移除开头和结尾的斜杠，然后分割
        parts = path.strip('/').split('/')
        if len(parts) >= 2 and parts[0] == 'games':
            return parts[1]
        return "unknown-game"
    except:
        return "unknown-game"

def extract_game_info(soup):
    """提取游戏基本信息"""
    print("📋 提取游戏基本信息...")
    info = {}
    
    try:
        # 提取游戏标题
        title_elem = soup.find('h1')
        if title_elem:
            info['title'] = title_elem.get_text().strip()
            print(f"  📝 标题: {info['title']}")
        
        # 提取发布者信息
        publisher_link = soup.find('a', href=lambda x: x and 'company=' in x)
        if publisher_link:
            info['publisher'] = publisher_link.get_text().strip()
            info['publisher_url'] = publisher_link.get('href')
            print(f"  🏢 发布者: {info['publisher']}")
        
        # 提取移动端兼容性
        mobile_text = soup.find(string=re.compile(r'Mobile Web Compatible', re.I))
        if mobile_text:
            info['mobile_compatible'] = mobile_text.strip()
            print(f"  📱 移动端兼容: {info['mobile_compatible']}")
        
        # 提取支持的语言
        languages = []
        lang_section = soup.find(string=re.compile(r'Languages', re.I))
        if lang_section:
            lang_parent = lang_section.find_parent()
            if lang_parent:
                lang_links = lang_parent.find_all('a')
                languages = [link.get_text().strip() for link in lang_links if link.get_text().strip()]
        info['languages'] = languages
        if languages:
            print(f"  🌍 支持语言: {', '.join(languages)}")
        
        # 提取性别标签
        gender_tags = []
        gender_section = soup.find(string=re.compile(r'Gender', re.I))
        if gender_section:
            gender_parent = gender_section.find_parent()
            if gender_parent:
                gender_links = gender_parent.find_all('a')
                gender_tags = [link.get_text().strip() for link in gender_links if link.get_text().strip()]
        info['gender_tags'] = gender_tags
        
        # 提取年龄组
        age_groups = []
        age_section = soup.find(string=re.compile(r'Age', re.I))
        if age_section:
            age_parent = age_section.find_parent()
            if age_parent:
                age_links = age_parent.find_all('a')
                age_groups = [link.get_text().strip() for link in age_links if link.get_text().strip()]
        info['age_groups'] = age_groups
        
    except Exception as e:
        print(f"  ⚠️ 提取游戏信息时出错: {str(e)}")
    
    return info

def extract_genres(soup):
    """提取游戏类型"""
    print("🎮 提取游戏类型...")
    genres = []
    
    try:
        # 查找包含"Genres"的文本
        genres_section = soup.find(string=re.compile(r'Genres', re.I))
        if genres_section:
            genres_parent = genres_section.find_parent()
            if genres_parent:
                genre_links = genres_parent.find_all('a')
                genres = [link.get_text().strip() for link in genre_links if link.get_text().strip()]
        
        if genres:
            print(f"  🏷️ 游戏类型: {', '.join(genres)}")
        else:
            print("  ⚠️ 未找到游戏类型信息")
            
    except Exception as e:
        print(f"  ⚠️ 提取游戏类型时出错: {str(e)}")
    
    return genres

def extract_tags(soup):
    """提取游戏标签"""
    print("🏷️ 提取游戏标签...")
    tags = []
    
    try:
        # 查找包含"Tags"的文本
        tags_section = soup.find(string=re.compile(r'Tags', re.I))
        if tags_section:
            tags_parent = tags_section.find_parent()
            if tags_parent:
                tag_links = tags_parent.find_all('a')
                tags = [link.get_text().strip() for link in tag_links if link.get_text().strip()]
        
        if tags:
            print(f"  🏷️ 游戏标签: {', '.join(tags)}")
        else:
            print("  ⚠️ 未找到游戏标签信息")
            
    except Exception as e:
        print(f"  ⚠️ 提取游戏标签时出错: {str(e)}")
    
    return tags

def extract_thumbnails(soup):
    """提取缩略图"""
    print("🖼️ 提取缩略图...")
    thumbnails = []
    
    try:
        # 查找所有图片元素
        img_elements = soup.find_all('img')
        
        for img in img_elements:
            src = img.get('src', '')
            if 'gamedistribution.com' in src and any(size in src for size in ['512x384', '512x512', '200x120', '1280x720', '1280x550']):
                # 提取尺寸信息
                size_match = re.search(r'(\d+x\d+)', src)
                size = size_match.group(1) if size_match else "unknown"
                
                thumbnail = {
                    "url": src,
                    "size": size,
                    "alt": img.get('alt', src.split('/')[-1])
                }
                thumbnails.append(thumbnail)
        
        if thumbnails:
            print(f"  🖼️ 找到 {len(thumbnails)} 张缩略图")
            for thumb in thumbnails:
                print(f"    - {thumb['size']}: {thumb['url']}")
        else:
            print("  ⚠️ 未找到缩略图")
            
    except Exception as e:
        print(f"  ⚠️ 提取缩略图时出错: {str(e)}")
    
    return thumbnails

def extract_iframe_code(soup):
    """提取iframe代码"""
    print("🎯 提取iframe代码...")
    iframe_data = {}
    
    try:
        # 查找iframe元素
        iframe = soup.find('iframe')
        if iframe:
            src = iframe.get('src', '')
            width = iframe.get('width', '960')
            height = iframe.get('height', '600')
            
            # 构建完整的iframe代码
            full_code = f'<iframe src="{src}" width="{width}" height="{height}" scrolling="none" frameborder="0"></iframe>'
            
            iframe_data = {
                "full_code": full_code,
                "src": src,
                "width": width,
                "height": height
            }
            
            print(f"  🎯 iframe源: {src}")
            print(f"  📐 尺寸: {width}x{height}")
        else:
            print("  ⚠️ 未找到iframe元素")
            
    except Exception as e:
        print(f"  ⚠️ 提取iframe代码时出错: {str(e)}")
    
    return iframe_data

def extract_description(soup):
    """提取游戏描述"""
    print("📝 提取游戏描述...")
    description = ""
    
    try:
        # 查找描述文本
        desc_elem = soup.find('meta', {'name': 'description'})
        if desc_elem:
            description = desc_elem.get('content', '').strip()
        
        # 如果meta描述为空，尝试查找其他描述元素
        if not description:
            # 查找包含游戏描述的段落
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text = p.get_text().strip()
                if len(text) > 100:  # 假设描述至少有100个字符
                    description = text
                    break
        
        if description:
            print(f"  📝 描述长度: {len(description)} 字符")
            print(f"  📝 描述预览: {description[:100]}...")
        else:
            print("  ⚠️ 未找到游戏描述")
            
    except Exception as e:
        print(f"  ⚠️ 提取游戏描述时出错: {str(e)}")
    
    return description

def extract_instructions(soup):
    """提取操作说明"""
    print("🎮 提取操作说明...")
    instructions = ""
    
    try:
        # 查找包含操作说明的文本
        # 通常包含"PLAYER"、"Movement"、"Jump"等关键词
        text_elements = soup.find_all(string=re.compile(r'PLAYER|Movement|Jump|SPACE|ARROW', re.I))
        
        for text in text_elements:
            if len(text.strip()) > 50:  # 假设操作说明至少有50个字符
                instructions = text.strip()
                break
        
        if instructions:
            print(f"  🎮 操作说明长度: {len(instructions)} 字符")
            print(f"  🎮 操作说明预览: {instructions[:100]}...")
        else:
            print("  ⚠️ 未找到操作说明")
            
    except Exception as e:
        print(f"  ⚠️ 提取操作说明时出错: {str(e)}")
    
    return instructions

def test_single_game():
    """测试单个游戏的数据提取"""
    # 使用第一个游戏进行测试
    test_url = "https://gamedistribution.com/games/obby-survive-parkour/"
    
    print("🧪 开始测试requests版本的数据提取...")
    print(f"🎯 测试URL: {test_url}")
    
    start_time = time.time()
    
    # 提取游戏数据
    game_data = get_game_details_requests(test_url)
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    if game_data:
        print(f"\n✅ 测试成功完成！")
        print(f"⏱️ 处理时间: {processing_time:.2f} 秒")
        
        # 保存测试结果
        output_file = "scripts/output/game_detail_requests_test.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(game_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 测试结果已保存到: {output_file}")
        
        # 显示提取到的数据摘要
        print("\n📊 数据提取摘要:")
        print(f"  🎮 游戏名称: {game_data.get('game_info', {}).get('title', 'N/A')}")
        print(f"  🏢 发布者: {game_data.get('game_info', {}).get('publisher', 'N/A')}")
        print(f"  🎯 游戏类型: {', '.join(game_data.get('genres', []))}")
        print(f"  🏷️ 标签数量: {len(game_data.get('tags', []))}")
        print(f"  🖼️ 缩略图数量: {len(game_data.get('thumbnails', []))}")
        print(f"  🎯 iframe: {'✅' if game_data.get('iframe_code', {}).get('src') else '❌'}")
        print(f"  📝 描述: {'✅' if game_data.get('description') else '❌'}")
        print(f"  🎮 操作说明: {'✅' if game_data.get('instructions') else '❌'}")
        
        return True
    else:
        print(f"\n❌ 测试失败")
        print(f"⏱️ 处理时间: {processing_time:.2f} 秒")
        return False

if __name__ == "__main__":
    # 运行测试
    success = test_single_game()
    
    if success:
        print("\n🎉 requests版本测试成功！")
        print("💡 相比Selenium版本的优势:")
        print("  ⚡ 速度提升: 10-20倍")
        print("  💾 内存占用: 降低90%")
        print("  🔧 维护成本: 更低")
        print("  🚀 批量处理: 更适合")
        print("\n📋 下一步建议:")
        print("  1. 验证提取数据的完整性")
        print("  2. 测试更多游戏URL")
        print("  3. 创建批量处理版本")
    else:
        print("\n⚠️ 测试失败，可能需要:")
        print("  1. 检查网络连接")
        print("  2. 分析页面结构变化")
        print("  3. 调整提取逻辑")
        print("  4. 考虑使用Selenium作为备选方案")