// src/lib/url-utils.ts - URL工具函数，用于生成SEO友好的URL和处理路由逻辑

/**
 * 将字符串转换为URL友好的slug格式
 * @param text 原始文本
 * @returns URL友好的slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 移除特殊字符，保留字母、数字、空格和连字符
    .replace(/[^a-z0-9\s-]/g, '')
    // 将多个空格替换为单个连字符
    .replace(/\s+/g, '-')
    // 移除多个连续的连字符
    .replace(/-+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '');
}

/**
 * 生成游戏详情页面的URL路径
 * @param category 游戏分类
 * @param gameSlug 游戏slug
 * @returns 游戏详情页面路径
 */
export function getGameUrl(category: string, gameSlug: string): string {
  const categorySlug = createSlug(category);
  const slug = createSlug(gameSlug);
  return `/games/${categorySlug}/${slug}`;
}

/**
 * 生成分类页面的URL路径
 * @param category 游戏分类
 * @returns 分类页面路径
 */
export function getCategoryUrl(category: string): string {
  const categorySlug = createSlug(category);
  return `/games/${categorySlug}`;
}

/**
 * 生成标签页面的URL路径
 * @param tag 标签名称
 * @returns 标签页面路径
 */
export function getTagUrl(tag: string): string {
  const tagSlug = createSlug(tag);
  return `/tags/${tagSlug}`;
}

/**
 * 生成带语言前缀的URL路径（预留多语言支持）
 * @param locale 语言代码 (如: 'en', 'zh', 'es')
 * @param path 原始路径
 * @returns 带语言前缀的路径
 */
export function getLocalizedUrl(locale: string, path: string): string {
  // 如果是默认语言（英文），不添加前缀
  if (locale === 'en') {
    return path;
  }
  return `/${locale}${path}`;
}

/**
 * 生成canonical URL
 * @param path 页面路径
 * @param baseUrl 网站基础URL
 * @returns 完整的canonical URL
 */
export function getCanonicalUrl(path: string, baseUrl: string = 'https://playbrowserminigames.com'): string {
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // 移除baseUrl末尾的斜杠（如果有）
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return `${normalizedBaseUrl}${normalizedPath}`;
}

/**
 * 生成面包屑导航数据
 * @param category 游戏分类
 * @param gameTitle 游戏标题（可选）
 * @returns 面包屑导航数组
 */
export function generateBreadcrumbs(category?: string, gameTitle?: string) {
  const breadcrumbs = [
    {
      name: 'Home',
      url: '/'
    }
  ];

  if (category) {
    breadcrumbs.push({
      name: 'Games',
      url: '/games'
    });
    
    breadcrumbs.push({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      url: getCategoryUrl(category)
    });
  }

  if (gameTitle) {
    breadcrumbs.push({
      name: gameTitle,
      url: '#' // 当前页面，不需要链接
    });
  }

  return breadcrumbs;
}

/**
 * 验证slug格式是否有效
 * @param slug 要验证的slug
 * @returns 是否为有效的slug格式
 */
export function isValidSlug(slug: string): boolean {
  // slug应该只包含小写字母、数字和连字符
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * 从URL路径中提取参数
 * @param pathname URL路径
 * @returns 提取的参数对象
 */
export function extractUrlParams(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  
  // 游戏详情页: /games/[category]/[slug]
  if (segments.length === 3 && segments[0] === 'games') {
    return {
      type: 'game',
      category: segments[1],
      slug: segments[2]
    };
  }
  
  // 分类页: /games/[category]
  if (segments.length === 2 && segments[0] === 'games') {
    return {
      type: 'category',
      category: segments[1]
    };
  }
  
  // 标签页: /tags/[tag]
  if (segments.length === 2 && segments[0] === 'tags') {
    return {
      type: 'tag',
      tag: segments[1]
    };
  }
  
  // 首页
  if (segments.length === 0) {
    return {
      type: 'home'
    };
  }
  
  return {
    type: 'unknown'
  };
}

/**
 * 生成hreflang标签数据（预留多语言支持）
 * @param currentPath 当前页面路径
 * @param supportedLocales 支持的语言列表
 * @returns hreflang标签数据数组
 */
export function generateHreflangTags(currentPath: string, supportedLocales: string[] = ['en']) {
  return supportedLocales.map(locale => ({
    hreflang: locale,
    href: getCanonicalUrl(getLocalizedUrl(locale, currentPath))
  }));
}

/**
 * URL重定向规则配置
 */
export const redirectRules = {
  // 旧URL格式重定向到新格式
  '/game/:slug': '/games/casual/:slug', // 示例：旧的游戏URL重定向
  '/category/:category': '/games/:category', // 示例：旧的分类URL重定向
};

/**
 * 检查是否需要重定向
 * @param pathname 当前路径
 * @returns 重定向目标路径或null
 */
export function checkRedirect(pathname: string): string | null {
  // 这里可以实现具体的重定向逻辑
  // 例如：处理旧URL格式、规范化URL等
  
  // 移除末尾的斜杠（除了根路径）
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  
  return null;
}