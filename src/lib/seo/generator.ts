// src/lib/seo/generator.ts - SEO内容生成器核心模块

import { 
  SEOMetadata, 
  GameSEOData, 
  CategorySEOData, 
  TagSEOData, 
  HomeSEOData,
  SEOGenerationConfig,
  BreadcrumbItem,
  RelatedGame
} from '../../types/seo';
import { 
  getGameSEOTemplate, 
  getCategorySEOTemplate,
  getRandomTemplate,
  replaceTemplateVariables
} from './templates';
import { generateSlug } from '../utils';

/**
 * SEO内容生成器类
 */
export class SEOGenerator {
  private config: SEOGenerationConfig;
  private baseUrl: string;
  
  constructor(config?: Partial<SEOGenerationConfig>, baseUrl: string = 'https://littlegames.com') {
    // 默认配置
    const defaultConfig: SEOGenerationConfig = {
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
    
    this.config = { ...defaultConfig, ...config };
    this.baseUrl = baseUrl;
  }

  /**
   * 生成游戏页面SEO数据
   * @param gameData 游戏基础数据
   * @param relatedGames 相关游戏列表
   * @returns 游戏SEO数据
   */
  generateGameSEO(gameData: any, relatedGames: RelatedGame[] = []): GameSEOData {
    const template = getGameSEOTemplate(gameData.primary_category);
    const slug = gameData.slug || generateSlug(gameData.title);
    
    // 生成内容变体ID（基于游戏ID和分类）
    const variantId = this.generateVariantId(gameData.id, gameData.primary_category);
    
    // 准备模板变量
    const templateVars = {
      title: gameData.title,
      category: gameData.primary_category,
      features: this.generateFeaturesList(gameData),
      developer: gameData.developer || 'Unknown Developer'
    };
    
    // 生成SEO元数据
    const metadata = this.generateSEOMetadata(
      template,
      templateVars,
      slug,
      'game'
    );
    
    // 生成面包屑导航
    const breadcrumbs = this.generateGameBreadcrumbs(gameData.title, gameData.primary_category, slug);
    
    // 生成内容变体
    const contentVariant = this.generateContentVariant(template, gameData, variantId);
    
    return {
      gameId: gameData.id,
      slug,
      metadata,
      breadcrumbs,
      relatedGames: relatedGames.slice(0, 6), // 限制相关游戏数量
      contentVariant
    };
  }

  /**
   * 生成分类页面SEO数据
   * @param category 分类名称
   * @param gameCount 游戏数量
   * @returns 分类SEO数据
   */
  generateCategorySEO(category: string, gameCount: number): CategorySEOData {
    const template = getCategorySEOTemplate('overview');
    const displayName = this.formatCategoryName(category);
    
    // 准备模板变量
    const templateVars = {
      category: displayName,
      gameCount: gameCount || 0
    };
    
    // 生成SEO元数据
    const metadata = this.generateSEOMetadata(
      template,
      templateVars,
      category,
      'category'
    );
    
    // 生成面包屑导航
    const breadcrumbs = this.generateCategoryBreadcrumbs(displayName, category);
    
    // 生成分类内容
    const content = this.generateCategoryContent(category, gameCount, template);
    
    return {
        category,
        displayName,
        metadata,
        breadcrumbs,
        content,
        subcategories: this.getSubcategories(category)
      };
  }

  /**
   * 生成标签页面SEO数据
   * @param tagData 标签基础数据
   * @param relatedTags 相关标签列表
   * @returns 标签SEO数据
   */
  generateTagSEO(tagData: any, relatedTags: string[] = []): TagSEOData {
    const displayName = this.formatTagName(tagData.tag);
    
    // 生成基础SEO元数据
    const metadata: SEOMetadata = {
      title: `${displayName} Games - Play Free Online`,
      description: `Discover amazing ${displayName.toLowerCase()} games! Play ${tagData.count || 0} free games with ${displayName.toLowerCase()} theme. No downloads required.`,
      keywords: [
        `${displayName.toLowerCase()} games`,
        'free online games',
        'browser games',
        `${displayName.toLowerCase()} theme`,
        'instant play games'
      ],
      canonical: `${this.baseUrl}/tags/${tagData.tag}`,
      openGraph: {
        title: `${displayName} Games - Free Online Gaming`,
        description: `Play the best ${displayName.toLowerCase()} games online for free. ${tagData.count || 0} games available.`,
        image: `${this.baseUrl}/images/tags/${tagData.tag}-og.jpg`,
        url: `${this.baseUrl}/tags/${tagData.tag}`,
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} Games - Free Online`,
        description: `Play ${tagData.count || 0} free ${displayName.toLowerCase()} games online.`,
        image: `${this.baseUrl}/images/tags/${tagData.tag}-twitter.jpg`
      }
    };
    
    // 生成面包屑导航
    const breadcrumbs = this.generateTagBreadcrumbs(displayName, tagData.tag);
    
    // 生成标签描述
    const description = this.generateTagDescription(tagData, displayName);
    
    return {
      tag: tagData.tag,
      displayName,
      metadata,
      breadcrumbs,
      description,
      relatedTags: relatedTags.slice(0, 8)
    };
  }

  /**
   * 生成首页SEO数据
   * @param featuredGames 特色游戏列表
   * @param popularCategories 热门分类列表
   * @param latestGames 最新游戏列表
   * @returns 首页SEO数据
   */
  generateHomeSEO(
    featuredGames: RelatedGame[] = [],
    popularCategories: any[] = [],
    latestGames: RelatedGame[] = []
  ): HomeSEOData {
    // 生成首页SEO元数据
    const metadata: SEOMetadata = {
      title: 'Free Online Games - Play Instantly in Your Browser | LittleGames',
      description: 'Play thousands of free online games instantly! No downloads required. Enjoy action, puzzle, adventure games and more. Start playing now!',
      keywords: [
        'free online games',
        'browser games',
        'instant play games',
        'no download games',
        'action games',
        'puzzle games',
        'adventure games',
        'free gaming'
      ],
      canonical: this.baseUrl,
      openGraph: {
        title: 'Free Online Games - Play Instantly | LittleGames',
        description: 'Discover thousands of free online games. Play action, puzzle, adventure games and more instantly in your browser!',
        image: `${this.baseUrl}/images/home-og.jpg`,
        url: this.baseUrl,
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Free Online Games - Play Instantly',
        description: 'Thousands of free games available. Play now in your browser!',
        image: `${this.baseUrl}/images/home-twitter.jpg`
      },
      structuredData: this.generateHomeStructuredData()
    };
    
    // 生成特色内容区块
    const featuredSections = {
      todaysFeatured: {
        title: "Today's Featured Games",
        description: 'Hand-picked games that offer the best gaming experience today.',
        games: featuredGames.slice(0, 6)
      },
      popularCategories: {
        title: 'Popular Game Categories',
        description: 'Explore our most popular game categories and find your favorite genre.',
        categories: popularCategories.slice(0, 8).map(cat => ({
          name: cat.category,
          displayName: this.formatCategoryName(cat.category),
          gameCount: cat.count,
          thumbnail: `${this.baseUrl}/images/categories/${cat.category}.jpg`
        }))
      },
      latestGames: {
        title: 'Latest Games',
        description: 'Check out the newest additions to our game collection.',
        games: latestGames.slice(0, 8)
      }
    };
    
    return {
      metadata,
      featuredSections
    };
  }

  /**
   * 生成SEO元数据
   * @param template SEO模板
   * @param variables 模板变量
   * @param slug 页面slug
   * @param pageType 页面类型
   * @returns SEO元数据
   */
  private generateSEOMetadata(
    template: any,
    variables: Record<string, any>,
    slug: string,
    pageType: 'game' | 'category' | 'tag'
  ): SEOMetadata {
    // 生成标题
    const titleTemplate = getRandomTemplate(template.titleTemplates, slug);
    const title = replaceTemplateVariables(titleTemplate, variables);
    
    // 生成描述
    const descTemplate = getRandomTemplate(template.descriptionTemplates, slug + '_desc');
    const description = replaceTemplateVariables(descTemplate, variables);
    
    // 生成关键词
    const keywordTemplate = getRandomTemplate(template.keywordTemplates, slug + '_keywords');
    const keywordString = replaceTemplateVariables(keywordTemplate, variables);
    const keywords = keywordString.split(', ').map(k => k.trim());
    
    // 生成URL
    const url = pageType === 'game' 
      ? `${this.baseUrl}/games/${slug}`
      : pageType === 'category'
      ? `${this.baseUrl}/categories/${slug}`
      : `${this.baseUrl}/tags/${slug}`;
    
    return {
      title: this.truncateText(title, this.config.titleLength.max),
      description: this.truncateText(description, this.config.descriptionLength.max),
      keywords: keywords.slice(0, this.config.maxKeywords),
      canonical: url,
      openGraph: {
        title: this.truncateText(title, 60),
        description: this.truncateText(description, 160),
        image: `${this.baseUrl}/images/${pageType}s/${slug}-og.jpg`,
        url,
        type: pageType === 'game' ? 'article' : 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: this.truncateText(title, 70),
        description: this.truncateText(description, 200),
        image: `${this.baseUrl}/images/${pageType}s/${slug}-twitter.jpg`
      }
    };
  }

  /**
   * 生成内容变体ID
   * @param gameId 游戏ID
   * @param category 游戏分类
   * @returns 变体ID
   */
  private generateVariantId(gameId: number, category: string): string {
    const hash = (gameId * 31 + category.length) % 1000;
    return `${category}_${hash.toString().padStart(3, '0')}`;
  }

  /**
   * 生成游戏特性列表
   * @param gameData 游戏数据
   * @returns 特性描述字符串
   */
  private generateFeaturesList(gameData: any): string {
    const features = [];
    
    if (gameData.devices && gameData.devices.includes('mobile')) {
      features.push('mobile-friendly controls');
    }
    
    if (gameData.tags && gameData.tags.length > 0) {
      features.push(`${gameData.tags[0]} gameplay`);
    }
    
    if (gameData.all_categories && gameData.all_categories.length > 1) {
      features.push('multi-genre elements');
    }
    
    features.push('instant browser play');
    
    return features.slice(0, 3).join(', ');
  }

  /**
   * 生成内容变体
   * @param template SEO模板
   * @param gameData 游戏数据
   * @param variantId 变体ID
   * @returns 内容变体
   */
  private generateContentVariant(template: any, gameData: any, variantId: string) {
    const variants = template.contentVariants;
    
    return {
      variantId,
      customDescription: getRandomTemplate(variants.featuredDescriptions, variantId),
      featuredTags: gameData.tags ? gameData.tags.slice(0, 3) : [],
      recommendationReason: getRandomTemplate(variants.recommendationReasons, variantId + '_reason')
    };
  }

  /**
   * 生成游戏面包屑导航
   * @param gameTitle 游戏标题
   * @param category 游戏分类
   * @param slug 游戏slug
   * @returns 面包屑导航数组
   */
  private generateGameBreadcrumbs(gameTitle: string, category: string, slug: string): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Games', href: '/games' },
      { label: this.formatCategoryName(category), href: `/categories/${category}` },
      { label: gameTitle, href: `/games/${slug}`, current: true }
    ];
  }

  /**
   * 生成分类面包屑导航
   * @param displayName 分类显示名称
   * @param category 分类名称
   * @returns 面包屑导航数组
   */
  private generateCategoryBreadcrumbs(displayName: string, category: string): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Games', href: '/games' },
      { label: displayName, href: `/categories/${category}`, current: true }
    ];
  }

  /**
   * 生成标签面包屑导航
   * @param displayName 标签显示名称
   * @param tag 标签名称
   * @returns 面包屑导航数组
   */
  private generateTagBreadcrumbs(displayName: string, tag: string): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Tags', href: '/tags' },
      { label: displayName, href: `/tags/${tag}`, current: true }
    ];
  }

  /**
   * 生成分类内容
   * @param category 分类名称
   * @param gameCount 游戏数量
   * @param template SEO模板
   * @returns 分类内容
   */
  private generateCategoryContent(category: string, gameCount: number, template: any) {
    const displayName = this.formatCategoryName(category);
    
    return {
      mainDescription: `Explore our collection of ${displayName.toLowerCase()} games! We have carefully selected ${gameCount || 0} amazing games that will provide hours of entertainment.`,
      featuredContent: getRandomTemplate(template.contentVariants.featuredDescriptions, category),
      gameStats: {
        total: gameCount || 0,
        featured: Math.min(Math.floor((gameCount || 0) * 0.1), 10),
        recent: Math.min(Math.floor((gameCount || 0) * 0.2), 20)
      }
    };
  }

  /**
   * 生成标签描述
   * @param tagData 标签数据
   * @param displayName 标签显示名称
   * @returns 标签描述
   */
  private generateTagDescription(tagData: any, displayName: string): string {
    return `Discover games with ${displayName.toLowerCase()} theme! Our collection includes ${tagData.count || 0} carefully selected games that feature ${displayName.toLowerCase()} elements. Perfect for players who enjoy this specific gaming style.`;
  }

  /**
   * 生成首页结构化数据
   * @returns 结构化数据对象
   */
  private generateHomeStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'LittleGames',
      'description': 'Free online games platform with thousands of browser games',
      'url': this.baseUrl,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * 格式化分类名称
   * @param category 分类名称
   * @returns 格式化后的分类名称
   */
  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  }

  /**
   * 格式化标签名称
   * @param tag 标签名称
   * @returns 格式化后的标签名称
   */
  private formatTagName(tag: string): string {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * 获取子分类
   * @param category 主分类
   * @returns 子分类数组
   */
  private getSubcategories(category: string): string[] {
    // 这里可以根据实际需求定义子分类关系
    const subcategoryMap: Record<string, string[]> = {
      'action': ['fighting', 'shooting', 'platform'],
      'puzzle': ['logic', 'word', 'math'],
      'adventure': ['rpg', 'quest', 'exploration'],
      'strategy': ['tower-defense', 'real-time', 'turn-based']
    };
    
    return subcategoryMap[category] || [];
  }

  /**
   * 截断文本到指定长度
   * @param text 原始文本
   * @param maxLength 最大长度
   * @returns 截断后的文本
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // 在单词边界截断
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }
}

/**
 * 创建默认SEO生成配置
 * @returns 默认配置
 */
export function createDefaultSEOConfig(): SEOGenerationConfig {
  return {
    enableContentVariation: true,
    maxKeywords: 8,
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
      bannedWords: ['spam', 'fake', 'virus', 'malware'],
      requiredKeywords: ['free', 'online', 'game']
    }
  };
}