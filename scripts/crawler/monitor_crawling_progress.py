# scripts/crawler/monitor_crawling_progress.py - 监控爬虫采集进度
"""
监控GameMonetize增强爬虫的采集进度
实时显示采集状态、成功率、质量分析等信息
"""

import os
import json
import time
import glob
from datetime import datetime

def get_latest_progress_files():
    """获取最新的进度文件"""
    # 查找进度文件
    progress_files = glob.glob("gamemonetize_enhanced_games_progress_*.json")
    failed_files = glob.glob("gamemonetize_enhanced_failed_progress_*.json")
    
    # 获取最新文件
    latest_progress = max(progress_files, key=os.path.getctime) if progress_files else None
    latest_failed = max(failed_files, key=os.path.getctime) if failed_files else None
    
    return latest_progress, latest_failed

def get_final_result_files():
    """获取最终结果文件"""
    # 查找最终结果文件
    result_files = glob.glob("gamemonetize_enhanced_games_*.json")
    failed_files = glob.glob("gamemonetize_enhanced_failed_*.json")
    report_files = glob.glob("gamemonetize_enhanced_report_*.json")
    
    # 排除进度文件
    result_files = [f for f in result_files if "progress" not in f]
    failed_files = [f for f in failed_files if "progress" not in f]
    
    # 获取最新文件
    latest_result = max(result_files, key=os.path.getctime) if result_files else None
    latest_failed = max(failed_files, key=os.path.getctime) if failed_files else None
    latest_report = max(report_files, key=os.path.getctime) if report_files else None
    
    return latest_result, latest_failed, latest_report

def analyze_progress_data(progress_file, failed_file):
    """分析进度数据"""
    games_data = []
    failed_data = []
    
    # 读取成功的游戏数据
    if progress_file and os.path.exists(progress_file):
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                games_data = json.load(f)
        except Exception as e:
            print(f"读取进度文件失败: {e}")
    
    # 读取失败的游戏数据
    if failed_file and os.path.exists(failed_file):
        try:
            with open(failed_file, 'r', encoding='utf-8') as f:
                failed_data = json.load(f)
        except Exception as e:
            print(f"读取失败文件失败: {e}")
    
    return games_data, failed_data

def display_progress_stats(games_data, failed_data):
    """显示进度统计"""
    total_processed = len(games_data) + len(failed_data)
    success_count = len(games_data)
    failed_count = len(failed_data)
    success_rate = (success_count / total_processed * 100) if total_processed > 0 else 0
    
    print(f"📊 采集进度统计:")
    print(f"   总处理: {total_processed} 个游戏")
    print(f"   成功: {success_count} 个")
    print(f"   失败: {failed_count} 个")
    print(f"   成功率: {success_rate:.2f}%")
    
    if games_data:
        # 质量分析
        quality_scores = [game.get('quality_score', 0) for game in games_data]
        avg_quality = sum(quality_scores) / len(quality_scores)
        
        high_quality = len([s for s in quality_scores if s >= 80])
        medium_quality = len([s for s in quality_scores if 50 <= s < 80])
        low_quality = len([s for s in quality_scores if s < 50])
        
        print(f"\n🎯 质量分析:")
        print(f"   平均质量分: {avg_quality:.2f}")
        print(f"   高质量(80+): {high_quality} ({high_quality/len(games_data)*100:.1f}%)")
        print(f"   中等质量(50-79): {medium_quality} ({medium_quality/len(games_data)*100:.1f}%)")
        print(f"   低质量(<50): {low_quality} ({low_quality/len(games_data)*100:.1f}%)")
        
        # 数据完整性分析
        with_iframe = len([g for g in games_data if g.get('iframe_info', {}).get('found', False)])
        with_thumbnails = len([g for g in games_data if g.get('thumbnails', [])])
        with_description = len([g for g in games_data if g.get('description', '')])
        with_categories = len([g for g in games_data if g.get('categories', [])])
        
        print(f"\n📋 数据完整性:")
        print(f"   有iframe: {with_iframe} ({with_iframe/len(games_data)*100:.1f}%)")
        print(f"   有缩略图: {with_thumbnails} ({with_thumbnails/len(games_data)*100:.1f}%)")
        print(f"   有描述: {with_description} ({with_description/len(games_data)*100:.1f}%)")
        print(f"   有分类: {with_categories} ({with_categories/len(games_data)*100:.1f}%)")

def check_crawling_status():
    """检查爬虫状态"""
    print("🔍 检查爬虫采集状态...")
    
    # 检查是否有最终结果文件
    result_file, failed_file, report_file = get_final_result_files()
    
    if result_file and os.path.exists(result_file):
        print("✅ 发现最终结果文件，采集可能已完成！")
        
        # 显示最终报告
        if report_file and os.path.exists(report_file):
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    report = json.load(f)
                
                print(f"\n📋 最终采集报告:")
                print(f"   采集时间: {report.get('采集时间', 'Unknown')}")
                
                total_stats = report.get('总体统计', {})
                print(f"   总处理游戏: {total_stats.get('总处理游戏', 0)}")
                print(f"   成功采集: {total_stats.get('成功采集', 0)}")
                print(f"   失败游戏: {total_stats.get('失败游戏', 0)}")
                print(f"   成功率: {total_stats.get('成功率', '0%')}")
                
                quality_stats = report.get('质量分析', {})
                print(f"\n🎯 质量分析:")
                print(f"   平均质量分: {quality_stats.get('平均质量分', '0')}")
                print(f"   高质量游戏: {quality_stats.get('高质量游戏(80+分)', '0')}")
                print(f"   中等质量: {quality_stats.get('中等质量(50-79分)', '0')}")
                
                data_stats = report.get('数据完整性', {})
                print(f"\n📋 数据完整性:")
                print(f"   有iframe: {data_stats.get('有iframe', '0')}")
                print(f"   有缩略图: {data_stats.get('有缩略图', '0')}")
                print(f"   有描述: {data_stats.get('有描述', '0')}")
                print(f"   有分类: {data_stats.get('有分类', '0')}")
                
                return result_file, True  # 返回结果文件和完成状态
                
            except Exception as e:
                print(f"读取报告文件失败: {e}")
        
        return result_file, True
    
    # 检查进度文件
    progress_file, failed_file = get_latest_progress_files()
    
    if progress_file or failed_file:
        print("🔄 发现进度文件，爬虫正在运行中...")
        
        # 分析进度数据
        games_data, failed_data = analyze_progress_data(progress_file, failed_file)
        
        if games_data or failed_data:
            display_progress_stats(games_data, failed_data)
            
            # 估算剩余时间
            total_processed = len(games_data) + len(failed_data)
            if total_processed > 0:
                remaining = 500 - total_processed
                print(f"\n⏱️ 预估剩余: {remaining} 个游戏")
                
                if total_processed >= 50:  # 有足够数据进行估算
                    # 基于文件修改时间估算
                    if progress_file and os.path.exists(progress_file):
                        file_time = os.path.getmtime(progress_file)
                        current_time = time.time()
                        time_diff = current_time - file_time
                        
                        if time_diff < 300:  # 5分钟内有更新
                            print(f"   最后更新: {time_diff:.0f} 秒前")
                            print("   状态: 🟢 活跃采集中")
                        else:
                            print(f"   最后更新: {time_diff/60:.1f} 分钟前")
                            print("   状态: 🟡 可能已停止")
        
        return progress_file, False
    
    print("❌ 未发现任何采集文件，爬虫可能未启动或出现问题")
    return None, False

def monitor_loop():
    """监控循环"""
    print("🚀 开始监控GameMonetize增强爬虫采集进度...")
    print("按 Ctrl+C 退出监控")
    
    try:
        while True:
            print("\n" + "="*60)
            print(f"⏰ 检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            result_file, is_completed = check_crawling_status()
            
            if is_completed:
                print("\n🎉 采集已完成！")
                print(f"📁 结果文件: {result_file}")
                
                # 询问是否生成SEO文件
                print("\n🤖 准备生成SEO文件...")
                return result_file
            
            print(f"\n⏳ 等待30秒后再次检查...")
            time.sleep(30)
            
    except KeyboardInterrupt:
        print("\n\n👋 监控已停止")
        return None

def main():
    """主函数"""
    # 首先检查当前状态
    result_file, is_completed = check_crawling_status()
    
    if is_completed:
        print("\n🎉 采集已完成！")
        return result_file
    elif result_file:
        print("\n🔄 爬虫正在运行中，开始监控...")
        return monitor_loop()
    else:
        print("\n❌ 未发现采集活动")
        return None

if __name__ == "__main__":
    result = main()
    if result:
        print(f"\n✅ 采集完成，结果文件: {result}")
    else:
        print("\n❌ 采集未完成或出现问题") 