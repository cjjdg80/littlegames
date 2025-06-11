// src/lib/seo/templates.ts - SEO内容模板系统

import { SEOTemplateType } from '../../types/seo';

/**
 * SEO内容模板接口
 */
export interface SEOTemplate {
  /** 模板ID */
  id: string;
  /** 模板类型 */
  type: SEOTemplateType;
  /** 标题模板 */
  titleTemplates: string[];
  /** 描述模板 */
  descriptionTemplates: string[];
  /** 关键词模板 */
  keywordTemplates: string[];
  /** 内容变体 */
  contentVariants: {
    /** 推荐理由模板 */
    recommendationReasons: string[];
    /** 特色描述模板 */
    featuredDescriptions: string[];
    /** 游戏玩法描述 */
    gameplayDescriptions: string[];
  };
}

/**
 * 游戏类型SEO模板
 */
export const GAME_SEO_TEMPLATES: Record<string, SEOTemplate> = {
  'action': {
    id: 'game-action',
    type: 'game-action',
    titleTemplates: [
      'Play {title} - Free Action Game Online',
      '{title} - Exciting Action Adventure Game',
      'Free {title} Game - Action Packed Fun',
      '{title} Online - Ultimate Action Gaming Experience',
      'Action Game {title} - Play Free Now'
    ],
    descriptionTemplates: [
      'Experience thrilling action in {title}! This exciting {category} game offers intense gameplay with {features}. Play free online now and enjoy hours of entertainment.',
      'Dive into the action-packed world of {title}. This {category} game features {features} and delivers non-stop excitement. Start playing for free today!',
      'Get ready for adrenaline-pumping action in {title}. This free online {category} game brings you {features} and endless fun. No download required!',
      '{title} delivers heart-racing action and adventure. Experience {features} in this amazing {category} game. Play instantly in your browser!',
      'Join the action in {title}! This captivating {category} game offers {features} and guarantees hours of entertainment. Play free online now!'
    ],
    keywordTemplates: [
      'action games, {title}, free online games, {category} games',
      '{title} game, action adventure, free browser games, online gaming',
      'play {title}, action games online, free {category}, browser games',
      '{title} online, action gaming, free games, {category} adventure'
    ],
    contentVariants: {
      recommendationReasons: [
        'Perfect for action game enthusiasts',
        'Ideal for players seeking thrilling adventures',
        'Great for quick gaming sessions',
        'Excellent for stress relief and entertainment',
        'Perfect for competitive players'
      ],
      featuredDescriptions: [
        'Features intense combat and strategic gameplay',
        'Offers challenging levels and exciting rewards',
        'Includes dynamic environments and smooth controls',
        'Provides immersive storyline and character development',
        'Delivers fast-paced action and stunning visuals'
      ],
      gameplayDescriptions: [
        'Navigate through challenging levels while defeating enemies',
        'Use strategic thinking to overcome obstacles and bosses',
        'Collect power-ups and upgrades to enhance your abilities',
        'Master different combat techniques and special moves',
        'Explore diverse environments and unlock new areas'
      ]
    }
  },
  
  'puzzle': {
    id: 'game-puzzle',
    type: 'game-puzzle',
    titleTemplates: [
      'Play {title} - Free Puzzle Game Online',
      '{title} - Brain Training Puzzle Challenge',
      'Free {title} Game - Mind Bending Puzzles',
      '{title} Online - Logic and Strategy Game',
      'Puzzle Game {title} - Test Your Skills'
    ],
    descriptionTemplates: [
      'Challenge your mind with {title}! This engaging {category} game features {features} and will test your problem-solving skills. Play free online now!',
      'Exercise your brain with {title}. This clever {category} game offers {features} and provides hours of mental stimulation. Start solving puzzles today!',
      'Put your thinking skills to the test in {title}. This free online {category} game brings you {features} and endless brain-teasing fun.',
      '{title} offers the perfect mental workout. Experience {features} in this challenging {category} game. Play instantly and boost your brainpower!',
      'Sharpen your mind with {title}! This captivating {category} game features {features} and guarantees intellectual entertainment. Play free now!'
    ],
    keywordTemplates: [
      'puzzle games, {title}, brain games, {category} puzzles',
      '{title} game, logic puzzles, free brain training, online puzzles',
      'play {title}, puzzle games online, free {category}, mind games',
      '{title} online, brain training, puzzle solving, {category} games'
    ],
    contentVariants: {
      recommendationReasons: [
        'Perfect for brain training and mental exercise',
        'Ideal for players who enjoy logical challenges',
        'Great for improving problem-solving skills',
        'Excellent for relaxation and mindfulness',
        'Perfect for educational entertainment'
      ],
      featuredDescriptions: [
        'Features progressively challenging puzzle levels',
        'Offers multiple solution paths and creative thinking',
        'Includes helpful hints and step-by-step guidance',
        'Provides satisfying "aha!" moments and achievements',
        'Delivers clean interface and intuitive controls'
      ],
      gameplayDescriptions: [
        'Analyze patterns and use logical reasoning to solve puzzles',
        'Think creatively to find unique solutions to challenges',
        'Progress through increasingly difficult levels',
        'Use trial and error to discover the correct approach',
        'Apply strategic thinking to overcome complex obstacles'
      ]
    }
  },
  
  'adventure': {
    id: 'game-adventure',
    type: 'game-adventure',
    titleTemplates: [
      'Play {title} - Epic Adventure Game Online',
      '{title} - Thrilling Adventure Quest',
      'Free {title} Game - Adventure Awaits',
      '{title} Online - Explore and Discover',
      'Adventure Game {title} - Journey Begins'
    ],
    descriptionTemplates: [
      'Embark on an epic journey in {title}! This immersive {category} game features {features} and takes you on unforgettable adventures. Play free online now!',
      'Discover new worlds in {title}. This exciting {category} game offers {features} and provides endless exploration opportunities. Start your adventure today!',
      'Begin your quest in {title}. This free online {category} game brings you {features} and captivating storylines. No download required!',
      '{title} offers incredible adventures and discoveries. Experience {features} in this amazing {category} game. Play instantly and explore new realms!',
      'Start your epic journey with {title}! This engaging {category} game features {features} and promises hours of adventure. Play free now!'
    ],
    keywordTemplates: [
      'adventure games, {title}, exploration games, {category} adventure',
      '{title} game, quest games, free adventure, online exploration',
      'play {title}, adventure games online, free {category}, story games',
      '{title} online, adventure gaming, exploration, {category} quest'
    ],
    contentVariants: {
      recommendationReasons: [
        'Perfect for players who love exploration',
        'Ideal for story-driven gaming experiences',
        'Great for immersive gameplay sessions',
        'Excellent for discovering new worlds',
        'Perfect for narrative adventure fans'
      ],
      featuredDescriptions: [
        'Features rich storylines and character development',
        'Offers vast worlds to explore and secrets to uncover',
        'Includes engaging quests and meaningful choices',
        'Provides beautiful environments and atmospheric music',
        'Delivers memorable characters and epic moments'
      ],
      gameplayDescriptions: [
        'Explore vast landscapes and hidden locations',
        'Interact with interesting characters and make choices',
        'Solve mysteries and uncover ancient secrets',
        'Collect items and upgrade your equipment',
        'Follow compelling storylines and complete quests'
      ]
    }
  }
};

/**
 * 分类页面SEO模板
 */
export const CATEGORY_SEO_TEMPLATES: Record<string, SEOTemplate> = {
  'overview': {
    id: 'category-overview',
    type: 'category-overview',
    titleTemplates: [
      'Free {category} Games - Play Online Now',
      '{category} Games Collection - Best Free Games',
      'Play {category} Games Online - No Download Required',
      'Best {category} Games - Free Browser Gaming',
      '{category} Game Collection - Instant Play'
    ],
    descriptionTemplates: [
      'Discover the best {category} games online! Our collection features {gameCount} amazing games that you can play for free. No downloads required - start playing instantly!',
      'Play top-rated {category} games in your browser. We offer {gameCount} carefully selected games with hours of entertainment. All games are free and ready to play!',
      'Explore our extensive {category} games library with {gameCount} titles. From classic favorites to new releases, find your perfect game and start playing for free!',
      'Enjoy the ultimate {category} gaming experience with our collection of {gameCount} games. All games are browser-based, free to play, and instantly accessible!',
      'Browse {gameCount} exciting {category} games and find your next favorite. Our curated collection offers something for every player. Play free online now!'
    ],
    keywordTemplates: [
      '{category} games, free online games, browser games, {category} collection',
      'play {category} games, free {category}, online gaming, browser entertainment',
      '{category} games online, free games, no download games, instant play',
      'best {category} games, free browser games, online {category}, game collection'
    ],
    contentVariants: {
      recommendationReasons: [
        'Perfect for {category} game enthusiasts',
        'Ideal for discovering new {category} experiences',
        'Great for quick gaming sessions',
        'Excellent variety of {category} styles',
        'Perfect for all skill levels'
      ],
      featuredDescriptions: [
        'Features the most popular {category} games',
        'Offers both classic and modern {category} titles',
        'Includes games for beginners and experts',
        'Provides regular updates with new games',
        'Delivers high-quality {category} gaming experiences'
      ],
      gameplayDescriptions: [
        'Choose from various {category} game styles and difficulties',
        'Experience different themes and gameplay mechanics',
        'Enjoy both single-player and competitive options',
        'Discover hidden gems and popular favorites',
        'Play at your own pace with no time restrictions'
      ]
    }
  }
};

/**
 * 获取随机模板
 * @param templates 模板数组
 * @param seed 随机种子（用于确保一致性）
 * @returns 选中的模板
 */
export function getRandomTemplate(templates: string[], seed?: string): string {
  if (templates.length === 0) return '';
  
  if (seed) {
    // 使用种子生成确定性的随机数
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    const index = Math.abs(hash) % templates.length;
    return templates[index];
  }
  
  // 使用真随机数
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

/**
 * 替换模板中的占位符
 * @param template 模板字符串
 * @param variables 变量对象
 * @returns 替换后的字符串
 */
export function replaceTemplateVariables(
  template: string, 
  variables: Record<string, string | number>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  return result;
}

/**
 * 获取游戏类型对应的SEO模板
 * @param category 游戏分类
 * @returns SEO模板
 */
export function getGameSEOTemplate(category: string): SEOTemplate {
  // 标准化分类名称
  const normalizedCategory = category.toLowerCase();
  
  // 返回对应模板，如果没有找到则返回action模板作为默认
  return GAME_SEO_TEMPLATES[normalizedCategory] || GAME_SEO_TEMPLATES['action'];
}

/**
 * 获取分类页面SEO模板
 * @param templateType 模板类型
 * @returns SEO模板
 */
export function getCategorySEOTemplate(templateType: string = 'overview'): SEOTemplate {
  return CATEGORY_SEO_TEMPLATES[templateType] || CATEGORY_SEO_TEMPLATES['overview'];
}