# scripts/crawler/batch_game_extractor.py
# 多线程批量游戏数据提取器 - 使用6线程并发处理游戏详情页面数据提取

import json
import os
import time
import random
import threading
import argparse
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from game_detail_extractor import GameDetailExtractor

class BatchGameExtractor:
    """批量游戏数据提取器
    
    使用多线程并发提取游戏详情数据，支持进度监控、错误处理和断点续传
    """
    
    def __init__(self, max_workers=6, delay_range=(1, 3), output_dir="../output"):
        """
        初始化批量提取器
        
        Args:
            max_workers (int): 最大工作线程数，默认6
            delay_range (tuple): 请求延迟范围(秒)，默认1-3秒
            output_dir (str): 输出目录路径
        """
        self.max_workers = max_workers
        self.delay_range = delay_range
        self.output_dir = output_dir
        
        # 统计信息
        self.success_count = 0
        self.error_count = 0
        self.total_count = 0
        self.start_time = None
        
        # 线程锁
        self.lock = threading.Lock()
        
        # 结果存储
        self.results = []
        self.errors = []
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
    
    def load_games_list(self, file_path):
        """
        加载游戏列表数据
        
        Args:
            file_path (str): 游戏列表JSON文件路径
            
        Returns:
            list: 游戏信息列表
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('games', [])
        except Exception as e:
            print(f"❌ 加载游戏列表失败: {e}")
            return []
    
    def find_game_index_by_name(self, games_list, game_name):
        """
        根据游戏名称查找在列表中的索引位置
        
        Args:
            games_list (list): 游戏列表
            game_name (str): 游戏名称
            
        Returns:
            int: 游戏索引，未找到返回-1
        """
        for i, game in enumerate(games_list):
            if game.get('name') == game_name:
                return i
        return -1
    
    def load_existing_results(self, main_result_file):
        """
        加载已存在的结果文件，返回已处理的游戏名称集合
        
        Args:
            main_result_file (str): 主结果文件路径
            
        Returns:
            tuple: (已处理游戏名称集合, 现有结果列表)
        """
        if not os.path.exists(main_result_file):
            return set(), []
        
        try:
            with open(main_result_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                processed_games = set()
                existing_results = data.get('games', [])
                
                for game in existing_results:
                    if 'basic_info' in game and 'name' in game['basic_info']:
                        processed_games.add(game['basic_info']['name'])
                
                return processed_games, existing_results
        except Exception as e:
            print(f"⚠️ 加载现有结果文件失败: {e}")
            return set(), []
    
    def extract_single_game(self, game_info, thread_id):
        """
        提取单个游戏的详情数据
        
        Args:
            game_info (dict): 游戏基本信息
            thread_id (int): 线程ID
            
        Returns:
            dict or None: 提取结果或None(失败时)
        """
        try:
            # 随机延迟避免请求过于频繁
            delay = random.uniform(*self.delay_range)
            time.sleep(delay)
            
            # 创建提取器实例(无头模式)
            extractor = GameDetailExtractor(headless=True)
            
            # 提取游戏详情 - 修复：传递两个参数
            result = extractor.extract_game_details(game_info['url'], game_info)
            
            # 更新统计信息
            with self.lock:
                self.success_count += 1
                progress = (self.success_count + self.error_count) / self.total_count * 100
                elapsed = time.time() - self.start_time
                avg_time = elapsed / (self.success_count + self.error_count)
                remaining = (self.total_count - self.success_count - self.error_count) * avg_time
                
                print(f"✅ [线程{thread_id}] {game_info['name']} | "
                      f"进度: {self.success_count + self.error_count}/{self.total_count} ({progress:.1f}%) | "
                      f"成功: {self.success_count} | 失败: {self.error_count} | "
                      f"预计剩余: {remaining/60:.1f}分钟")
            
            return result
            
        except Exception as e:
            # 记录错误
            error_info = {
                'game': game_info,
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'thread_id': thread_id
            }
            
            with self.lock:
                self.error_count += 1
                self.errors.append(error_info)
                progress = (self.success_count + self.error_count) / self.total_count * 100
                print(f"❌ [线程{thread_id}] {game_info['name']} 失败: {str(e)} | "
                      f"进度: {self.success_count + self.error_count}/{self.total_count} ({progress:.1f}%)")
            
            return None
    
    def save_unified_results(self, all_results, result_file_path):
        """
        保存统一的结果文件
        
        Args:
            all_results (list): 所有结果列表
            result_file_path (str): 结果文件路径
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        result_data = {
            "metadata": {
                "total_games": len(all_results),
                "last_updated": timestamp,
                "extraction_info": {
                    "success_count": len([r for r in all_results if r.get('success', False)]),
                    "total_processed": len(all_results)
                }
            },
            "games": all_results
        }
        
        with open(result_file_path, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 结果已保存到: {result_file_path}")
    
    def batch_extract_with_resume(self, games_list, start_game_name=None, 
                                 main_result_file="all_games_extracted.json",
                                 batch_size=300, rest_minutes=1):
        """
        支持按游戏名称断点续传的批量提取，每处理batch_size个游戏休息rest_minutes分钟
        
        Args:
            games_list (list): 游戏列表
            start_game_name (str): 开始游戏名称，None表示从头开始
            main_result_file (str): 主结果文件名
            batch_size (int): 每批处理的游戏数量
            rest_minutes (int): 每批之间的休息时间(分钟)
        """
        # 构建完整的结果文件路径
        result_file_path = os.path.join(self.output_dir, main_result_file)
        
        # 加载已处理的游戏
        processed_games, existing_results = self.load_existing_results(result_file_path)
        print(f"📋 已处理游戏数量: {len(processed_games)}")
        
        # 确定开始位置
        start_index = 0
        if start_game_name:
            start_index = self.find_game_index_by_name(games_list, start_game_name)
            if start_index == -1:
                print(f"❌ 未找到游戏: {start_game_name}")
                return []
            print(f"🎯 从游戏 '{start_game_name}' 开始 (索引: {start_index})")
        
        # 过滤掉已处理的游戏
        games_to_process = []
        for i in range(start_index, len(games_list)):
            game = games_list[i]
            if game.get('name') not in processed_games:
                games_to_process.append(game)
            else:
                print(f"⏭️ 跳过已处理游戏: {game.get('name')}")
        
        if not games_to_process:
            print("✅ 所有游戏都已处理完成！")
            return existing_results
        
        print(f"🚀 需要处理 {len(games_to_process)} 个新游戏")
        print(f"📊 配置: {self.max_workers} 线程, 每{batch_size}个游戏休息{rest_minutes}分钟")
        print("-" * 80)
        
        # 分批处理
        all_new_results = []
        total_batches = (len(games_to_process) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, len(games_to_process))
            current_batch = games_to_process[start_idx:end_idx]
            
            print(f"\n🔄 处理第 {batch_num + 1}/{total_batches} 批 ({len(current_batch)} 个游戏)")
            
            # 重置统计信息
            self.success_count = 0
            self.error_count = 0
            self.total_count = len(current_batch)
            self.start_time = time.time()
            self.results = []
            self.errors = []
            
            # 使用线程池执行当前批次
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_game = {
                    executor.submit(self.extract_single_game, game, i % self.max_workers + 1): game 
                    for i, game in enumerate(current_batch)
                }
                
                # 收集结果
                for future in as_completed(future_to_game):
                    result = future.result()
                    if result:
                        all_new_results.append(result)
            
            # 输出批次统计
            duration = time.time() - self.start_time
            print(f"📊 第{batch_num + 1}批完成: 成功{self.success_count} | 失败{self.error_count} | 耗时{duration/60:.1f}分钟")
            
            # 保存当前进度到主文件
            current_all_results = existing_results + all_new_results
            self.save_unified_results(current_all_results, result_file_path)
            
            # 如果不是最后一批，休息指定时间
            if batch_num < total_batches - 1:
                print(f"😴 休息 {rest_minutes} 分钟...")
                time.sleep(rest_minutes * 60)
        
        print("\n🎉 全部批次处理完成！")
        final_results = existing_results + all_new_results
        print(f"📊 最终统计: 总计{len(final_results)}个游戏 | 新增{len(all_new_results)}个")
        
        return final_results

def main():
    """
    主函数 - 支持命令行参数
    
    使用方法:
    python batch_game_extractor.py                    # 从头开始
    python batch_game_extractor.py --start "游戏名称"  # 从指定游戏开始
    """
    parser = argparse.ArgumentParser(description='批量游戏数据提取器')
    parser.add_argument('--start', type=str, help='开始游戏名称，不指定则从头开始')
    parser.add_argument('--workers', type=int, default=6, help='线程数，默认6')
    parser.add_argument('--batch-size', type=int, default=300, help='每批处理游戏数量，默认300')
    parser.add_argument('--rest-minutes', type=int, default=1, help='每批之间休息时间(分钟)，默认1')
    
    args = parser.parse_args()
    
    # 创建提取器实例
    extractor = BatchGameExtractor(
        max_workers=args.workers,
        delay_range=(1, 3),
        output_dir="../output"
    )
    
    # 加载游戏列表
    games_list = extractor.load_games_list("../output/all_games_continuous.json")
    
    if not games_list:
        print("❌ 未找到游戏列表数据")
        return
    
    print(f"📋 加载到 {len(games_list)} 个游戏")
    
    if args.start:
        print(f"🎯 从游戏 '{args.start}' 开始处理")
    else:
        print("🚀 从头开始处理所有游戏")
    
    # 开始批量提取
    extractor.batch_extract_with_resume(
        games_list=games_list,
        start_game_name=args.start,
        main_result_file="all_games_extracted.json",
        batch_size=args.batch_size,
        rest_minutes=args.rest_minutes
    )

if __name__ == "__main__":
    main()