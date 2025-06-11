# scripts/crawler/batch_game_extractor_v2.py
# 改进版多线程批量游戏数据提取器 - 使用10线程并发，分文件保存，支持游戏编号系统

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

class BatchGameExtractorV2:
    """改进版批量游戏数据提取器
    
    使用10线程并发提取游戏详情数据，按300个游戏分文件保存，支持游戏编号系统、进度监控、错误处理和断点续传
    """
    
    def __init__(self, max_workers=10, delay_range=(1, 3), output_dir="../output"):
        """
        初始化批量提取器
        
        Args:
            max_workers (int): 最大工作线程数，默认10
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
        
        # 游戏编号管理
        self.next_global_id = 1
        self.game_id_mapping = {}  # {game_name: global_id}
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        
        # 创建批次文件目录
        self.batch_dir = os.path.join(output_dir, "batches")
        os.makedirs(self.batch_dir, exist_ok=True)
    
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
    
    def load_existing_game_ids(self):
        """
        从摘要文件中加载已分配的游戏编号
        
        Returns:
            tuple: (next_global_id, game_id_mapping)
        """
        summary_path = os.path.join(self.output_dir, "extraction_summary.json")
        if not os.path.exists(summary_path):
            return 1, {}
        
        try:
            with open(summary_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                game_ids = data.get('game_id_mapping', {})
                next_id = data.get('metadata', {}).get('next_global_id', 1)
                return next_id, game_ids
        except Exception as e:
            print(f"⚠️ 加载游戏编号失败: {e}")
            return 1, {}
    
    def assign_game_ids(self, games_list):
        """
        为游戏列表分配全局编号
        
        Args:
            games_list (list): 游戏列表
        """
        # 加载已有的编号映射
        self.next_global_id, self.game_id_mapping = self.load_existing_game_ids()
        
        # 为新游戏分配编号
        for game in games_list:
            game_name = game.get('name')
            if game_name and game_name not in self.game_id_mapping:
                self.game_id_mapping[game_name] = self.next_global_id
                self.next_global_id += 1
        
        print(f"🔢 游戏编号分配完成: 总计{len(self.game_id_mapping)}个游戏，下一个编号: {self.next_global_id}")
    
    def get_existing_batch_files(self):
        """
        获取已存在的批次文件列表
        
        Returns:
            dict: {batch_number: file_path}
        """
        batch_files = {}
        if not os.path.exists(self.batch_dir):
            return batch_files
            
        for filename in os.listdir(self.batch_dir):
            if filename.startswith('games_batch_') and filename.endswith('.json'):
                try:
                    # 提取批次号：games_batch_001.json -> 1
                    batch_num = int(filename.split('_')[2].split('.')[0])
                    batch_files[batch_num] = os.path.join(self.batch_dir, filename)
                except (ValueError, IndexError):
                    continue
                    
        return batch_files
    
    def load_processed_games_from_batches(self):
        """
        从所有批次文件中加载已处理的游戏名称
        
        Returns:
            set: 已处理游戏名称集合
        """
        processed_games = set()
        batch_files = self.get_existing_batch_files()
        
        for batch_num, file_path in batch_files.items():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    games = data.get('games', [])
                    for game in games:
                        if 'basic_info' in game and 'name' in game['basic_info']:
                            processed_games.add(game['basic_info']['name'])
                print(f"📁 批次{batch_num:03d}: 加载{len(games)}个游戏")
            except Exception as e:
                print(f"⚠️ 加载批次文件{file_path}失败: {e}")
                
        return processed_games
    
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
    
    def extract_single_game(self, game_info, thread_id, global_id, batch_id):
        """
        提取单个游戏的详情数据
        
        Args:
            game_info (dict): 游戏基本信息
            thread_id (int): 线程ID
            global_id (int): 全局游戏编号
            batch_id (int): 批次内编号
            
        Returns:
            dict or None: 提取结果或None(失败时)
        """
        try:
            # 随机延迟避免请求过于频繁
            delay = random.uniform(*self.delay_range)
            time.sleep(delay)
            
            # 创建提取器实例(无头模式)
            extractor = GameDetailExtractor(headless=True)
            
            # 提取游戏详情
            result = extractor.extract_game_details(game_info['url'], game_info)
            
            # 添加编号信息到结果中
            if result:
                result['game_id'] = {
                    'global_id': global_id,
                    'batch_id': batch_id,
                    'extraction_order': global_id  # 提取顺序就是全局编号
                }
            
            # 更新统计信息
            with self.lock:
                self.success_count += 1
                progress = (self.success_count + self.error_count) / self.total_count * 100
                elapsed = time.time() - self.start_time
                avg_time = elapsed / (self.success_count + self.error_count)
                remaining = (self.total_count - self.success_count - self.error_count) * avg_time
                
                print(f"✅ [线程{thread_id}] #{global_id:04d} {game_info['name']} | "
                      f"进度: {self.success_count + self.error_count}/{self.total_count} ({progress:.1f}%) | "
                      f"成功: {self.success_count} | 失败: {self.error_count} | "
                      f"预计剩余: {remaining/60:.1f}分钟")
            
            return result
            
        except Exception as e:
            # 记录错误
            error_info = {
                'game': game_info,
                'global_id': global_id,
                'batch_id': batch_id,
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'thread_id': thread_id
            }
            
            with self.lock:
                self.error_count += 1
                self.errors.append(error_info)
                progress = (self.success_count + self.error_count) / self.total_count * 100
                print(f"❌ [线程{thread_id}] #{global_id:04d} {game_info['name']} 失败: {str(e)} | "
                      f"进度: {self.success_count + self.error_count}/{self.total_count} ({progress:.1f}%)")
            
            return None
    
    def save_batch_results(self, batch_results, batch_number, batch_start_id, batch_end_id):
        """
        保存单个批次的结果到独立文件
        
        Args:
            batch_results (list): 批次结果列表
            batch_number (int): 批次编号
            batch_start_id (int): 批次起始游戏编号
            batch_end_id (int): 批次结束游戏编号
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"games_batch_{batch_number:03d}.json"
        file_path = os.path.join(self.batch_dir, filename)
        
        batch_data = {
            "metadata": {
                "batch_number": batch_number,
                "total_games": len(batch_results),
                "success_count": len([r for r in batch_results if r.get('success', False)]),
                "created_at": timestamp,
                "game_id_range": {
                    "start_id": batch_start_id,
                    "end_id": batch_end_id
                },
                "extraction_info": {
                    "thread_count": self.max_workers,
                    "delay_range": self.delay_range
                }
            },
            "games": batch_results
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(batch_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 批次{batch_number:03d}已保存到: {filename} (游戏编号: {batch_start_id}-{batch_end_id})")
        return file_path
    
    def save_progress_summary(self):
        """
        保存整体进度摘要文件，包含游戏编号映射
        """
        batch_files = self.get_existing_batch_files()
        total_games = 0
        total_success = 0
        
        batch_info = []
        for batch_num in sorted(batch_files.keys()):
            try:
                with open(batch_files[batch_num], 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    metadata = data.get('metadata', {})
                    games_count = metadata.get('total_games', 0)
                    success_count = metadata.get('success_count', 0)
                    id_range = metadata.get('game_id_range', {})
                    
                    batch_info.append({
                        'batch_number': batch_num,
                        'total_games': games_count,
                        'success_count': success_count,
                        'game_id_range': id_range,
                        'file_path': batch_files[batch_num],
                        'created_at': metadata.get('created_at', '')
                    })
                    
                    total_games += games_count
                    total_success += success_count
            except Exception as e:
                print(f"⚠️ 读取批次{batch_num}摘要失败: {e}")
        
        summary = {
            "metadata": {
                "total_batches": len(batch_files),
                "total_games": total_games,
                "total_success": total_success,
                "next_global_id": self.next_global_id,
                "last_updated": datetime.now().strftime("%Y%m%d_%H%M%S"),
                "extraction_config": {
                    "max_workers": self.max_workers,
                    "batch_size": 300,
                    "delay_range": self.delay_range
                }
            },
            "game_id_mapping": self.game_id_mapping,
            "batches": batch_info
        }
        
        summary_path = os.path.join(self.output_dir, "extraction_summary.json")
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        print(f"📊 进度摘要已保存到: extraction_summary.json (包含{len(self.game_id_mapping)}个游戏编号)")
        return summary_path
    
    def batch_extract_with_file_split(self, games_list, start_game_name=None, 
                                     batch_size=300, rest_minutes=1):
        """
        支持分文件保存和游戏编号的批量提取
        
        Args:
            games_list (list): 游戏列表
            start_game_name (str): 开始游戏名称，None表示从头开始
            batch_size (int): 每批处理的游戏数量
            rest_minutes (int): 每批之间的休息时间(分钟)
        """
        # 为所有游戏分配编号
        self.assign_game_ids(games_list)
        
        # 加载已处理的游戏
        processed_games = self.load_processed_games_from_batches()
        print(f"📋 已处理游戏数量: {len(processed_games)}")
        
        # 确定开始位置
        start_index = 0
        if start_game_name:
            start_index = self.find_game_index_by_name(games_list, start_game_name)
            if start_index == -1:
                print(f"❌ 未找到游戏: {start_game_name}")
                return []
            print(f"🎯 从游戏 '{start_game_name}' 开始 (索引: {start_index})")
        
        # 过滤掉已处理的游戏，但保留编号信息
        games_to_process = []
        for i in range(start_index, len(games_list)):
            game = games_list[i]
            game_name = game.get('name')
            if game_name not in processed_games:
                # 添加全局编号到游戏信息中
                game_with_id = game.copy()
                game_with_id['global_id'] = self.game_id_mapping.get(game_name, 0)
                games_to_process.append(game_with_id)
            else:
                print(f"⏭️ 跳过已处理游戏: #{self.game_id_mapping.get(game_name, 0):04d} {game_name}")
        
        if not games_to_process:
            print("✅ 所有游戏都已处理完成！")
            self.save_progress_summary()
            return []
        
        print(f"🚀 需要处理 {len(games_to_process)} 个新游戏")
        print(f"📊 配置: {self.max_workers} 线程, 每{batch_size}个游戏一个文件, 休息{rest_minutes}分钟")
        print("-" * 80)
        
        # 计算起始批次号
        existing_batches = self.get_existing_batch_files()
        start_batch_num = max(existing_batches.keys()) + 1 if existing_batches else 1
        
        # 分批处理
        total_batches = (len(games_to_process) + batch_size - 1) // batch_size
        
        for batch_idx in range(total_batches):
            start_idx = batch_idx * batch_size
            end_idx = min(start_idx + batch_size, len(games_to_process))
            current_batch = games_to_process[start_idx:end_idx]
            current_batch_num = start_batch_num + batch_idx
            
            # 计算批次的游戏编号范围
            batch_start_id = current_batch[0]['global_id']
            batch_end_id = current_batch[-1]['global_id']
            
            print(f"\n🔄 处理批次 {current_batch_num:03d} ({len(current_batch)} 个游戏, 编号: {batch_start_id}-{batch_end_id})")
            
            # 重置统计信息
            self.success_count = 0
            self.error_count = 0
            self.total_count = len(current_batch)
            self.start_time = time.time()
            self.results = []
            self.errors = []
            
            # 使用线程池执行当前批次
            batch_results = []
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_game = {}
                for i, game in enumerate(current_batch):
                    global_id = game['global_id']
                    batch_id = i + 1  # 批次内编号从1开始
                    future = executor.submit(self.extract_single_game, game, i % self.max_workers + 1, global_id, batch_id)
                    future_to_game[future] = game
                
                # 收集结果
                for future in as_completed(future_to_game):
                    result = future.result()
                    if result:
                        batch_results.append(result)
            
            # 输出批次统计
            duration = time.time() - self.start_time
            print(f"📊 批次{current_batch_num:03d}完成: 成功{self.success_count} | 失败{self.error_count} | 耗时{duration/60:.1f}分钟")
            
            # 保存当前批次到独立文件
            self.save_batch_results(batch_results, current_batch_num, batch_start_id, batch_end_id)
            
            # 更新进度摘要
            self.save_progress_summary()
            
            # 如果不是最后一批，休息指定时间
            if batch_idx < total_batches - 1:
                print(f"😴 休息 {rest_minutes} 分钟...")
                time.sleep(rest_minutes * 60)
        
        print("\n🎉 全部批次处理完成！")
        final_summary = self.save_progress_summary()
        print(f"📊 查看完整摘要: {final_summary}")
        
        return True

def main():
    """
    主函数 - 支持命令行参数
    
    使用方法:
    python batch_game_extractor_v2.py                    # 从头开始
    python batch_game_extractor_v2.py --start "游戏名称"  # 从指定游戏开始
    python batch_game_extractor_v2.py --workers 10       # 指定线程数
    """
    parser = argparse.ArgumentParser(description='改进版批量游戏数据提取器 - 支持游戏编号系统')
    parser.add_argument('--start', type=str, help='开始游戏名称，不指定则从头开始')
    parser.add_argument('--workers', type=int, default=10, help='线程数，默认10')
    parser.add_argument('--batch-size', type=int, default=300, help='每批处理游戏数量，默认300')
    parser.add_argument('--rest-minutes', type=int, default=1, help='每批之间休息时间(分钟)，默认1')
    
    args = parser.parse_args()
    
    # 创建提取器实例
    extractor = BatchGameExtractorV2(
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
    extractor.batch_extract_with_file_split(
        games_list=games_list,
        start_game_name=args.start,
        batch_size=args.batch_size,
        rest_minutes=args.rest_minutes
    )

if __name__ == "__main__":
    main()