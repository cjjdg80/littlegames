/**
 * src/lib/seo/index.ts
 * SEO生成器主入口文件
 * 统一导出所有SEO相关功能
 */

import { SEOGenerator } from './generator';
import { SEOBatchGenerator } from './batchGenerator';
import { QualityChecker } from './qualityChecker';
import type { SEOGenerationConfig } from '../../types/seo';
import type { BatchGenerationConfig } from './batchGenerator';

export {
  // 生成器相关
  SEOGenerator
} from './generator';
export type {
  // 模板相关
  SEOTemplate,
} from './templates';

export type {
  // 数据类型
  SEOMetadata,
  GameSEOData,
  CategorySEOData,
  TagSEOData,
  HomeSEOData,
  BreadcrumbItem,
  RelatedGame,
  SEOGenerationConfig
} from '../../types/seo';

export {
  // 批量生成器
  SEOBatchGenerator
} from './batchGenerator';

export type {
  // 批量生成配置
  BatchGenerationConfig,
  GenerationProgress
} from './batchGenerator';

export {
  // 质量检查器
  QualityChecker as SEOQualityChecker
} from './qualityChecker';

export type {
  // 质量检查结果
  QualityCheckResult
} from './qualityChecker';

// 导出常用工具函数
export {
  generateSlug,
  truncateText,
  formatCategoryName,
  formatTagName,
  seededRandom,
  randomSelect,
  calculateSimilarity,
  chunkArray,
  delay
} from '../utils';

/**
 * 创建SEO生成器实例的工厂函数
 * @param config SEO生成配置
 * @returns SEO生成器实例
 */
export function createSEOGenerator(config?: Partial<SEOGenerationConfig>): SEOGenerator {
  return new SEOGenerator(config);
}

/**
 * 创建批量SEO生成器实例的工厂函数
 * @param config 批量生成配置
 * @returns 批量SEO生成器实例
 */
export function createSEOBatchGenerator(config?: Partial<BatchGenerationConfig>): SEOBatchGenerator {
  return new SEOBatchGenerator(config);
}

/**
 * 创建SEO质量检查器实例的工厂函数
 * @returns SEO质量检查器实例
 */
export function createSEOQualityChecker(): QualityChecker {
  return new QualityChecker();
}

/**
 * 默认SEO配置
 */
export const DEFAULT_SEO_CONFIG: SEOGenerationConfig = {
  maxTitleLength: 60,
  maxDescriptionLength: 160,
  maxKeywordsCount: 10,
  enableContentGeneration: true,
  enableRelatedGames: true,
  enableBreadcrumbs: true,
  minContentLength: 200,
  maxContentLength: 500,
  relatedGamesCount: 6,
  qualityThreshold: 0.7
};

/**
 * 默认批量生成配置
 */
export const DEFAULT_BATCH_CONFIG: BatchGenerationConfig = {
  batchSize: 10, // 减少批次大小，避免程序看起来卡死
  concurrency: 5,
  enableQualityCheck: true,
  outputDirectory: './src/data/seo',
  enableProgressReporting: true,
  retryAttempts: 3,
  retryDelay: 1000
};