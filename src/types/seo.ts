// src/types/seo.ts - SEO相关数据类型定义

import { MultiLanguageText } from './game';

/**
 * SEO元数据接口
 */
export interface SEOMetadata {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description: string;
  /** 关键词 */
  keywords: string[];
  /** 规范URL */
  canonical?: string;
  /** Open Graph数据 */
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'website' | 'article';
  };
  /** Twitter Card数据 */
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  /** 结构化数据 */
  structuredData?: any;
}

/**
 * 游戏页面SEO数据
 */
export interface GameSEOData {
  /** 游戏ID */
  gameId: number;
  /** 游戏slug */
  slug: string;
  /** SEO元数据 */
  metadata: SEOMetadata;
  /** 面包屑导航 */
  breadcrumbs: BreadcrumbItem[];
  /** 相关游戏推荐 */
  relatedGames: RelatedGame[];
  /** 内容变体（用于差异化） */
  contentVariant: {
    /** 描述变体ID */
    variantId: string;
    /** 自定义描述 */
    customDescription: string;
    /** 特色标签 */
    featuredTags: string[];
    /** 推荐理由 */
    recommendationReason: string;
  };
}

/**
 * 分类页面SEO数据
 */
export interface CategorySEOData {
  /** 分类名称 */
  category: string;
  /** 分类显示名称 */
  displayName: string;
  /** SEO元数据 */
  metadata: SEOMetadata;
  /** 面包屑导航 */
  breadcrumbs: BreadcrumbItem[];
  /** 分类描述内容 */
  content: {
    /** 主要描述 */
    mainDescription: string;
    /** 特色介绍 */
    featuredContent: string;
    /** 游戏数量统计 */
    gameStats: {
      total: number;
      featured: number;
      recent: number;
    };
  };
  /** 子分类 */
  subcategories?: string[];
}

/**
 * 标签页面SEO数据
 */
export interface TagSEOData {
  /** 标签名称 */
  tag: string;
  /** 标签显示名称 */
  displayName: string;
  /** SEO元数据 */
  metadata: SEOMetadata;
  /** 面包屑导航 */
  breadcrumbs: BreadcrumbItem[];
  /** 标签描述 */
  description: string;
  /** 相关标签 */
  relatedTags: string[];
}

/**
 * 首页SEO数据
 */
export interface HomeSEOData {
  /** SEO元数据 */
  metadata: SEOMetadata;
  /** 特色内容区块 */
  featuredSections: {
    /** 今日推荐 */
    todaysFeatured: {
      title: string;
      description: string;
      games: RelatedGame[];
    };
    /** 热门分类 */
    popularCategories: {
      title: string;
      description: string;
      categories: Array<{
        name: string;
        displayName: string;
        gameCount: number;
        thumbnail: string;
      }>;
    };
    /** 最新游戏 */
    latestGames: {
      title: string;
      description: string;
      games: RelatedGame[];
    };
  };
}

/**
 * 面包屑导航项
 */
export interface BreadcrumbItem {
  /** 显示文本 */
  label: string;
  /** 链接URL */
  href: string;
  /** 是否为当前页面 */
  current?: boolean;
}

/**
 * 相关游戏信息
 */
export interface RelatedGame {
  /** 游戏ID */
  id: number;
  /** 游戏slug */
  slug: string;
  /** 游戏标题 */
  title: string;
  /** 缩略图 */
  thumbnail: string;
  /** 主分类 */
  category: string;
  /** 推荐分数 */
  score?: number;
}

/**
 * SEO内容模板类型
 */
export type SEOTemplateType = 
  | 'game-action'
  | 'game-puzzle'
  | 'game-adventure'
  | 'game-strategy'
  | 'game-sports'
  | 'game-racing'
  | 'game-shooting'
  | 'game-platform'
  | 'category-overview'
  | 'category-detailed'
  | 'tag-popular'
  | 'tag-niche'
  | 'home-main';

/**
 * SEO生成配置
 */
export interface SEOGenerationConfig {
  /** 是否启用内容差异化 */
  enableContentVariation: boolean;
  /** 最大关键词数量 */
  maxKeywords: number;
  /** 描述长度范围 */
  descriptionLength: {
    min: number;
    max: number;
  };
  /** 标题长度范围 */
  titleLength: {
    min: number;
    max: number;
  };
  /** 内容质量检查 */
  qualityCheck: {
    /** 最小独特性分数 */
    minUniquenessScore: number;
    /** 禁用词列表 */
    bannedWords: string[];
    /** 必需关键词 */
    requiredKeywords: string[];
  };
}