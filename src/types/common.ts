// src/types/common.ts - 通用类型定义

/**
 * 支持的语言类型
 */
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh';

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  status: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 是否成功 */
  success: boolean;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总数量 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 组件基础Props接口
 */
export interface BaseComponentProps {
  /** CSS类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}