// src/lib/seo/qualityChecker.ts - SEO内容质量检查器

import { GameSEOData, CategorySEOData, TagSEOData, HomeSEOData } from '../../types/seo';

/**
 * 质量检查结果
 */
export interface QualityCheckResult {
  /** 总体质量分数 (0-1) */
  overallScore: number;
  /** 独特性分数 (0-1) */
  uniquenessScore: number;
  /** SEO优化分数 (0-1) */
  seoScore: number;
  /** 内容质量分数 (0-1) */
  contentScore: number;
  /** 检查详情 */
  details: {
    /** 通过的检查项 */
    passed: string[];
    /** 失败的检查项 */
    failed: string[];
    /** 警告项 */
    warnings: string[];
  };
  /** 改进建议 */
  suggestions: string[];
}

/**
 * SEO质量检查器类
 */
export class QualityChecker {
  private contentCache: Set<string> = new Set();
  private titleCache: Set<string> = new Set();
  private descriptionCache: Set<string> = new Set();
  
  // 常见的低质量词汇
  private readonly LOW_QUALITY_WORDS = [
    'awesome', 'amazing', 'incredible', 'fantastic', 'super', 'mega',
    'ultimate', 'best ever', 'perfect', 'unbelievable', 'mind-blowing'
  ];
  
  // 禁用词汇
  private readonly BANNED_WORDS = [
    'spam', 'fake', 'virus', 'malware', 'hack', 'cheat', 'illegal',
    'download', 'install', 'crack', 'pirate', 'torrent'
  ];
  
  // 必需关键词
  private readonly REQUIRED_KEYWORDS = [
    'free', 'online', 'game'
  ];

  /**
   * 检查游戏SEO数据质量
   * @param seoData 游戏SEO数据
   * @returns 质量分数 (0-1)
   */
  async checkGameSEO(seoData: GameSEOData): Promise<number> {
    const result = await this.performQualityCheck(seoData, 'game');
    return result.overallScore;
  }

  /**
   * 检查分类SEO数据质量
   * @param seoData 分类SEO数据
   * @returns 质量分数 (0-1)
   */
  async checkCategorySEO(seoData: CategorySEOData): Promise<number> {
    const result = await this.performQualityCheck(seoData, 'category');
    return result.overallScore;
  }

  /**
   * 检查标签SEO数据质量
   * @param seoData 标签SEO数据
   * @returns 质量分数 (0-1)
   */
  async checkTagSEO(seoData: TagSEOData): Promise<number> {
    const result = await this.performQualityCheck(seoData, 'tag');
    return result.overallScore;
  }

  /**
   * 检查首页SEO数据质量
   * @param seoData 首页SEO数据
   * @returns 质量分数 (0-1)
   */
  async checkHomeSEO(seoData: HomeSEOData): Promise<number> {
    const result = await this.performQualityCheck(seoData, 'home');
    return result.overallScore;
  }

  /**
   * 通用SEO数据质量检查
   * @param seoData SEO数据
   * @param type 数据类型
   * @returns 质量分数 (0-1)
   */
  async checkSEOData(seoData: any, type: string): Promise<number> {
    const result = await this.performQualityCheck(seoData, type);
    return result.overallScore;
  }

  /**
   * 执行详细的质量检查
   * @param seoData SEO数据
   * @param type 数据类型
   * @returns 详细的质量检查结果
   */
  async performDetailedQualityCheck(
    seoData: any, 
    type: string
  ): Promise<QualityCheckResult> {
    return this.performQualityCheck(seoData, type);
  }

  /**
   * 执行质量检查的核心逻辑
   * @param seoData SEO数据
   * @param type 数据类型
   * @returns 质量检查结果
   */
  private async performQualityCheck(
    seoData: any, 
    type: string
  ): Promise<QualityCheckResult> {
    const result: QualityCheckResult = {
      overallScore: 0,
      uniquenessScore: 0,
      seoScore: 0,
      contentScore: 0,
      details: {
        passed: [],
        failed: [],
        warnings: []
      },
      suggestions: []
    };

    // 提取元数据
    const metadata = seoData.metadata || seoData;
    const title = metadata.title || '';
    const description = metadata.description || '';
    const keywords = metadata.keywords || [];

    // 1. 独特性检查
    result.uniquenessScore = this.checkUniqueness(title, description, result);

    // 2. SEO优化检查
    result.seoScore = this.checkSEOOptimization(title, description, keywords, result);

    // 3. 内容质量检查
    result.contentScore = this.checkContentQuality(title, description, keywords, result);

    // 4. 类型特定检查
    this.performTypeSpecificChecks(seoData, type, result);

    // 计算总体分数
    result.overallScore = (
      result.uniquenessScore * 0.3 +
      result.seoScore * 0.4 +
      result.contentScore * 0.3
    );

    // 生成改进建议
    this.generateSuggestions(result);

    // 更新缓存
    this.updateCache(title, description);

    return result;
  }

  /**
   * 检查内容独特性
   * @param title 标题
   * @param description 描述
   * @param result 结果对象
   * @returns 独特性分数
   */
  private checkUniqueness(
    title: string, 
    description: string, 
    result: QualityCheckResult
  ): number {
    let score = 1.0;
    
    // 检查标题独特性
    if (this.titleCache.has(title.toLowerCase())) {
      result.details.failed.push('标题重复');
      score -= 0.5;
    } else {
      result.details.passed.push('标题独特');
    }
    
    // 检查描述独特性
    const descSimilarity = this.calculateSimilarityWithCache(description);
    if (descSimilarity > 0.8) {
      result.details.failed.push('描述相似度过高');
      score -= 0.3;
    } else if (descSimilarity > 0.6) {
      result.details.warnings.push('描述相似度较高');
      score -= 0.1;
    } else {
      result.details.passed.push('描述独特');
    }
    
    // 检查内容变化度
    const contentVariation = this.calculateContentVariation(title, description);
    if (contentVariation < 0.3) {
      result.details.warnings.push('内容变化度较低');
      score -= 0.1;
    }
    
    return Math.max(0, score);
  }

  /**
   * 检查SEO优化程度
   * @param title 标题
   * @param description 描述
   * @param keywords 关键词
   * @param result 结果对象
   * @returns SEO分数
   */
  private checkSEOOptimization(
    title: string, 
    description: string, 
    keywords: string[], 
    result: QualityCheckResult
  ): number {
    let score = 1.0;
    
    // 标题长度检查
    if (title.length < 30 || title.length > 60) {
      result.details.failed.push('标题长度不合适');
      score -= 0.2;
    } else {
      result.details.passed.push('标题长度合适');
    }
    
    // 描述长度检查
    if (description.length < 120 || description.length > 160) {
      result.details.failed.push('描述长度不合适');
      score -= 0.2;
    } else {
      result.details.passed.push('描述长度合适');
    }
    
    // 关键词数量检查
    if (keywords.length < 3 || keywords.length > 8) {
      result.details.warnings.push('关键词数量不理想');
      score -= 0.1;
    } else {
      result.details.passed.push('关键词数量合适');
    }
    
    // 必需关键词检查
    const hasRequiredKeywords = this.REQUIRED_KEYWORDS.some(keyword => 
      title.toLowerCase().includes(keyword) || 
      description.toLowerCase().includes(keyword) ||
      keywords.some(k => k.toLowerCase().includes(keyword))
    );
    
    if (!hasRequiredKeywords) {
      result.details.failed.push('缺少必需关键词');
      score -= 0.3;
    } else {
      result.details.passed.push('包含必需关键词');
    }
    
    // 关键词密度检查
    const keywordDensity = this.calculateKeywordDensity(title + ' ' + description, keywords);
    if (keywordDensity < 0.02 || keywordDensity > 0.05) {
      result.details.warnings.push('关键词密度不理想');
      score -= 0.1;
    }
    
    return Math.max(0, score);
  }

  /**
   * 检查内容质量
   * @param title 标题
   * @param description 描述
   * @param keywords 关键词
   * @param result 结果对象
   * @returns 内容质量分数
   */
  private checkContentQuality(
    title: string, 
    description: string, 
    keywords: string[], 
    result: QualityCheckResult
  ): number {
    let score = 1.0;
    
    // 检查禁用词汇
    const bannedWordsFound = this.findBannedWords(title + ' ' + description);
    if (bannedWordsFound.length > 0) {
      result.details.failed.push(`包含禁用词汇: ${bannedWordsFound.join(', ')}`);
      score -= 0.5;
    } else {
      result.details.passed.push('无禁用词汇');
    }
    
    // 检查低质量词汇
    const lowQualityWordsFound = this.findLowQualityWords(title + ' ' + description);
    if (lowQualityWordsFound.length > 2) {
      result.details.warnings.push(`过多低质量词汇: ${lowQualityWordsFound.join(', ')}`);
      score -= 0.2;
    }
    
    // 检查语法和拼写（简单检查）
    const grammarScore = this.checkBasicGrammar(title, description);
    if (grammarScore < 0.8) {
      result.details.warnings.push('可能存在语法问题');
      score -= 0.1;
    }
    
    // 检查内容可读性
    const readabilityScore = this.calculateReadability(description);
    if (readabilityScore < 0.6) {
      result.details.warnings.push('内容可读性较低');
      score -= 0.1;
    }
    
    // 检查信息完整性
    const completenessScore = this.checkInformationCompleteness(title, description);
    if (completenessScore < 0.7) {
      result.details.warnings.push('信息完整性不足');
      score -= 0.1;
    }
    
    return Math.max(0, score);
  }

  /**
   * 执行类型特定的检查
   * @param seoData SEO数据
   * @param type 数据类型
   * @param result 结果对象
   */
  private performTypeSpecificChecks(
    seoData: any, 
    type: string, 
    result: QualityCheckResult
  ): void {
    switch (type) {
      case 'game':
        this.checkGameSpecificRequirements(seoData, result);
        break;
      case 'category':
        this.checkCategorySpecificRequirements(seoData, result);
        break;
      case 'tag':
        this.checkTagSpecificRequirements(seoData, result);
        break;
      case 'home':
        this.checkHomeSpecificRequirements(seoData, result);
        break;
    }
  }

  /**
   * 检查游戏特定要求
   * @param seoData 游戏SEO数据
   * @param result 结果对象
   */
  private checkGameSpecificRequirements(seoData: GameSEOData, result: QualityCheckResult): void {
    // 检查面包屑导航
    if (!seoData.breadcrumbs || seoData.breadcrumbs.length < 3) {
      result.details.warnings.push('面包屑导航不完整');
    } else {
      result.details.passed.push('面包屑导航完整');
    }
    
    // 检查相关游戏
    if (!seoData.relatedGames || seoData.relatedGames.length < 3) {
      result.details.warnings.push('相关游戏数量不足');
    }
    
    // 检查内容变体
    if (!seoData.contentVariant || !seoData.contentVariant.variantId) {
      result.details.warnings.push('缺少内容变体');
    }
  }

  /**
   * 检查分类特定要求
   * @param seoData 分类SEO数据
   * @param result 结果对象
   */
  private checkCategorySpecificRequirements(seoData: CategorySEOData, result: QualityCheckResult): void {
    // 检查分类内容
    if (!seoData.content || !seoData.content.mainDescription) {
      result.details.failed.push('缺少主要描述');
    }
    
    // 检查游戏统计
    if (!seoData.content?.gameStats || seoData.content.gameStats.total === 0) {
      result.details.warnings.push('游戏统计数据不完整');
    }
  }

  /**
   * 检查标签特定要求
   * @param seoData 标签SEO数据
   * @param result 结果对象
   */
  private checkTagSpecificRequirements(seoData: TagSEOData, result: QualityCheckResult): void {
    // 检查标签描述
    if (!seoData.description || seoData.description.length < 50) {
      result.details.warnings.push('标签描述过短');
    }
    
    // 检查相关标签
    if (!seoData.relatedTags || seoData.relatedTags.length < 2) {
      result.details.warnings.push('相关标签数量不足');
    }
  }

  /**
   * 检查首页特定要求
   * @param seoData 首页SEO数据
   * @param result 结果对象
   */
  private checkHomeSpecificRequirements(seoData: HomeSEOData, result: QualityCheckResult): void {
    // 检查特色区块
    const sections = seoData.featuredSections;
    if (!sections.todaysFeatured.games.length) {
      result.details.warnings.push('缺少今日推荐游戏');
    }
    
    if (!sections.popularCategories.categories.length) {
      result.details.warnings.push('缺少热门分类');
    }
    
    if (!sections.latestGames.games.length) {
      result.details.warnings.push('缺少最新游戏');
    }
    
    // 检查结构化数据
    if (!seoData.metadata.structuredData) {
      result.details.warnings.push('缺少结构化数据');
    }
  }

  /**
   * 计算与缓存内容的相似度
   * @param content 内容
   * @returns 最大相似度
   */
  private calculateSimilarityWithCache(content: string): number {
    // 限制缓存大小以避免性能问题
    const MAX_CACHE_SIZE = 100;
    
    let maxSimilarity = 0;
    const contentLower = content.toLowerCase();
    
    // 如果缓存过大，只检查最近的内容
    const cacheArray = Array.from(this.contentCache);
    const checkItems = cacheArray.length > MAX_CACHE_SIZE 
      ? cacheArray.slice(-MAX_CACHE_SIZE) 
      : cacheArray;
    
    for (const cachedContent of checkItems) {
      const similarity = this.calculateTextSimilarity(contentLower, cachedContent);
      maxSimilarity = Math.max(maxSimilarity, similarity);
      
      // 如果找到高相似度，提前退出
      if (maxSimilarity > 0.9) {
        break;
      }
    }
    
    return maxSimilarity;
  }

  /**
   * 计算文本相似度
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度 (0-1)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * 计算内容变化度
   * @param title 标题
   * @param description 描述
   * @returns 变化度 (0-1)
   */
  private calculateContentVariation(title: string, description: string): number {
    const titleWords = new Set(title.toLowerCase().split(/\s+/));
    const descWords = new Set(description.toLowerCase().split(/\s+/));
    const uniqueWords = new Set([...titleWords, ...descWords]);
    
    // 计算词汇多样性
    const totalWords = title.split(/\s+/).length + description.split(/\s+/).length;
    return uniqueWords.size / totalWords;
  }

  /**
   * 查找禁用词汇
   * @param content 内容
   * @returns 找到的禁用词汇
   */
  private findBannedWords(content: string): string[] {
    const contentLower = content.toLowerCase();
    return this.BANNED_WORDS.filter(word => contentLower.includes(word));
  }

  /**
   * 查找低质量词汇
   * @param content 内容
   * @returns 找到的低质量词汇
   */
  private findLowQualityWords(content: string): string[] {
    const contentLower = content.toLowerCase();
    return this.LOW_QUALITY_WORDS.filter(word => contentLower.includes(word));
  }

  /**
   * 计算关键词密度
   * @param content 内容
   * @param keywords 关键词
   * @returns 关键词密度
   */
  private calculateKeywordDensity(content: string, keywords: string[]): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = keywords.reduce((count, keyword) => {
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      return count + keywordWords.filter(word => words.includes(word)).length;
    }, 0);
    
    return keywordCount / words.length;
  }

  /**
   * 基础语法检查
   * @param title 标题
   * @param description 描述
   * @returns 语法分数 (0-1)
   */
  private checkBasicGrammar(title: string, description: string): number {
    let score = 1.0;
    
    // 检查标题首字母大写
    if (title.charAt(0) !== title.charAt(0).toUpperCase()) {
      score -= 0.1;
    }
    
    // 检查句子结构
    const sentences = description.split(/[.!?]+/);
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3);
    if (shortSentences.length > sentences.length * 0.3) {
      score -= 0.2;
    }
    
    return Math.max(0, score);
  }

  /**
   * 计算可读性
   * @param text 文本
   * @returns 可读性分数 (0-1)
   */
  private calculateReadability(text: string): number {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => 
      sum + this.countSyllables(word), 0) / words.length;
    
    // 简化的Flesch Reading Ease公式
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(1, score / 100));
  }

  /**
   * 计算音节数
   * @param word 单词
   * @returns 音节数
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // 调整规则
    if (word.endsWith('e')) count--;
    if (count === 0) count = 1;
    
    return count;
  }

  /**
   * 检查信息完整性
   * @param title 标题
   * @param description 描述
   * @returns 完整性分数 (0-1)
   */
  private checkInformationCompleteness(title: string, description: string): number {
    let score = 1.0;
    
    // 检查是否包含游戏类型信息
    const gameTypes = ['action', 'puzzle', 'adventure', 'strategy', 'sports', 'racing'];
    const hasGameType = gameTypes.some(type => 
      title.toLowerCase().includes(type) || description.toLowerCase().includes(type)
    );
    
    if (!hasGameType) score -= 0.2;
    
    // 检查是否包含平台信息
    const platforms = ['online', 'browser', 'free', 'instant'];
    const hasPlatform = platforms.some(platform => 
      title.toLowerCase().includes(platform) || description.toLowerCase().includes(platform)
    );
    
    if (!hasPlatform) score -= 0.2;
    
    // 检查是否包含行动号召
    const cta = ['play', 'start', 'begin', 'enjoy', 'experience'];
    const hasCTA = cta.some(action => 
      description.toLowerCase().includes(action)
    );
    
    if (!hasCTA) score -= 0.1;
    
    return Math.max(0, score);
  }

  /**
   * 生成改进建议
   * @param result 质量检查结果
   */
  private generateSuggestions(result: QualityCheckResult): void {
    if (result.uniquenessScore < 0.7) {
      result.suggestions.push('增加内容的独特性，避免与现有内容过于相似');
    }
    
    if (result.seoScore < 0.7) {
      result.suggestions.push('优化标题和描述长度，确保包含必需关键词');
    }
    
    if (result.contentScore < 0.7) {
      result.suggestions.push('提高内容质量，避免使用低质量词汇，改善可读性');
    }
    
    if (result.details.failed.length > 0) {
      result.suggestions.push('修复所有失败的检查项以提高整体质量');
    }
    
    if (result.details.warnings.length > 2) {
      result.suggestions.push('关注警告项，进一步优化内容质量');
    }
  }

  /**
   * 更新缓存
   * @param title 标题
   * @param description 描述
   */
  private updateCache(title: string, description: string): void {
    const MAX_CACHE_SIZE = 100;
    
    // 限制标题缓存大小
    if (this.titleCache.size >= MAX_CACHE_SIZE) {
      const firstItem = this.titleCache.values().next().value;
      if (firstItem !== undefined) {
        this.titleCache.delete(firstItem);
      }
    }
    this.titleCache.add(title.toLowerCase());
    
    // 限制内容缓存大小
    if (this.contentCache.size >= MAX_CACHE_SIZE) {
      const firstItem = this.contentCache.values().next().value;
      if (firstItem !== undefined) {
        this.contentCache.delete(firstItem);
      }
    }
    this.contentCache.add(description.toLowerCase());
    
    // 限制描述缓存大小
    if (this.descriptionCache.size >= MAX_CACHE_SIZE) {
      const firstItem = this.descriptionCache.values().next().value;
      if (firstItem !== undefined) {
        this.descriptionCache.delete(firstItem);
      }
    }
    this.descriptionCache.add(description.toLowerCase());
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.titleCache.clear();
    this.contentCache.clear();
    this.descriptionCache.clear();
  }

  /**
   * 获取缓存统计
   * @returns 缓存统计信息
   */
  getCacheStats(): { titles: number; content: number; descriptions: number } {
    return {
      titles: this.titleCache.size,
      content: this.contentCache.size,
      descriptions: this.descriptionCache.size
    };
  }
}