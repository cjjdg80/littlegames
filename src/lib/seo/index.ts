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
 * 创建SEO批量生成器实例的工厂函数
 * @param config 批量生成配置（可选）
 * @returns SEO批量生成器实例
 */
export function createSEOBatchGenerator(config?: Partial<BatchGenerationConfig>): SEOBatchGenerator {
  const defaultConfig: BatchGenerationConfig = {
    outputDir: './test-output/seo',
    batchSize: 10,
    enableQualityCheck: true,
    generateProgressReport: true,
    concurrency: 3,
    baseUrl: 'https://playbrowserminigames.com'
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  return new SEOBatchGenerator(finalConfig);
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
  enableContentVariation: true,
  maxKeywords: 10,
  descriptionLength: {
    min: 120,
    max: 160
  },
  titleLength: {
    min: 30,
    max: 60
  },
  qualityCheck: {
    minUniquenessScore: 0.7,
    bannedWords: [],
    requiredKeywords: []
  }
};

/**
 * 默认批量生成配置
 */
export const DEFAULT_BATCH_CONFIG: BatchGenerationConfig = {
  batchSize: 10, // 减少批次大小，避免程序看起来卡死
  concurrency: 5,
  enableQualityCheck: true,
  outputDir: './src/data/seo',
  generateProgressReport: true,
  baseUrl: 'https://playbrowserminigames.com'
};