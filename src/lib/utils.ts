// src/lib/utils.ts - 通用工具函数

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并Tailwind CSS类名的工具函数
 * @param inputs - CSS类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期的工具函数
 * @param date - 日期字符串或Date对象
 * @param locale - 语言区域设置
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 生成SEO友好的URL slug
 * @param text 原始文本
 * @returns URL slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 替换特殊字符为连字符
    .replace(/[^a-z0-9\s-]/g, '')
    // 替换空格为连字符
    .replace(/\s+/g, '-')
    // 移除多余的连字符
    .replace(/-+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '');
}

/**
 * 截断文本到指定长度，在单词边界处截断
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀（默认为'...'）
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  
  // 在单词边界截断
  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

/**
 * 格式化分类名称
 * @param category 分类名称
 * @returns 格式化后的分类名称
 */
export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 格式化标签名称
 * @param tag 标签名称
 * @returns 格式化后的标签名称
 */
export function formatTagName(tag: string): string {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 生成确定性的随机数（基于种子）
 * @param seed 种子字符串
 * @returns 0-1之间的随机数
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * 从数组中随机选择元素（支持种子）
 * @param array 数组
 * @param count 选择数量
 * @param seed 随机种子
 * @returns 选中的元素数组
 */
export function randomSelect<T>(array: T[], count: number, seed?: string): T[] {
  if (array.length === 0) return [];
  if (count >= array.length) return [...array];
  
  const result: T[] = [];
  const available = [...array];
  
  for (let i = 0; i < count; i++) {
    const randomValue = seed ? seededRandom(seed + i) : Math.random();
    const index = Math.floor(randomValue * available.length);
    result.push(available.splice(index, 1)[0]);
  }
  
  return result;
}

/**
 * 计算两个字符串的相似度
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度 (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * 将数组分块
 * @param array 原数组
 * @param chunkSize 块大小
 * @returns 分块后的数组
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机ID
 * @param length - ID长度
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}