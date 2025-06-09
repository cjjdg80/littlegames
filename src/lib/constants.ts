// src/lib/constants.ts - 项目常量配置

import { GameCategory, DeviceType } from '@/types/game';

/**
 * 网站基础配置
 */
export const SITE_CONFIG = {
  name: 'LittleGames',
  description: 'Free online games for everyone',
  url: 'https://littlegames.com',
  ogImage: '/og-image.jpg',
  links: {
    github: 'https://github.com/littlegames',
    twitter: 'https://twitter.com/littlegames'
  }
} as const;

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  defaultLimit: 12,
  maxLimit: 48,
  defaultPage: 1
} as const;

/**
 * 游戏分类配置
 */
export const CATEGORY_CONFIG = {
  [GameCategory.ACTION]: {
    label: 'Action',
    icon: '⚡',
    color: 'bg-red-500'
  },
  [GameCategory.PUZZLE]: {
    label: 'Puzzle',
    icon: '🧩',
    color: 'bg-blue-500'
  },
  [GameCategory.STRATEGY]: {
    label: 'Strategy',
    icon: '🎯',
    color: 'bg-green-500'
  },
  [GameCategory.SPORTS]: {
    label: 'Sports',
    icon: '⚽',
    color: 'bg-orange-500'
  },
  [GameCategory.RACING]: {
    label: 'Racing',
    icon: '🏎️',
    color: 'bg-yellow-500'
  },
  [GameCategory.ADVENTURE]: {
    label: 'Adventure',
    icon: '🗺️',
    color: 'bg-purple-500'
  },
  [GameCategory.ARCADE]: {
    label: 'Arcade',
    icon: '🕹️',
    color: 'bg-pink-500'
  },
  [GameCategory.SIMULATION]: {
    label: 'Simulation',
    icon: '🏗️',
    color: 'bg-indigo-500'
  }
} as const;

/**
 * 设备类型配置
 */
export const DEVICE_CONFIG = {
  [DeviceType.DESKTOP]: {
    label: 'Desktop',
    icon: '🖥️'
  },
  [DeviceType.MOBILE]: {
    label: 'Mobile',
    icon: '📱'
  },
  [DeviceType.TABLET]: {
    label: 'Tablet',
    icon: '📱'
  }
} as const;

/**
 * 支持的语言配置
 */
export const LOCALE_CONFIG = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Português', flag: '🇵🇹' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  ja: { label: '日本語', flag: '🇯🇵' },
  ko: { label: '한국어', flag: '🇰🇷' },
  zh: { label: '中文', flag: '🇨🇳' }
} as const;