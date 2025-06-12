// src/app/[locale]/games/[category]/[slug]/page.tsx - 多语言游戏详情页面
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supportedLocales } from '../../../layout';
import { getCanonicalUrl, generateBreadcrumbs } from '@/lib/url-utils';
import { generateGameJsonLd, generatePageSEO } from '@/lib/seo-utils';

interface LocaleGamePageProps {
  params: Promise<{
    locale: string;
    category: string;
    slug: string;
  }>;
}

/**
 * 多语言游戏详情页面组件
 */
export default async function LocaleGamePage({ params }: LocaleGamePageProps) {
  const { locale, category, slug } = await params;

  // 验证语言代码
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  // 模拟游戏数据获取（实际应该从数据库或API获取）
  const gameData = {
    title: `Sample Game - ${locale.toUpperCase()}`,
    description: `This is a sample game description in ${locale}`,
    category,
    slug,
    locale
  };

  // 生成面包屑导航
  const breadcrumbs = generateBreadcrumbs(`/${locale}/games/${category}/${slug}`);

  return (
    <div className="game-page" data-locale={locale}>
      {/* 面包屑导航 */}
      <nav className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && ' > '}
            <a href={crumb.url}>{crumb.name}</a>
          </span>
        ))}
      </nav>

      {/* 游戏内容 */}
      <main>
        <h1>{gameData.title}</h1>
        <p>{gameData.description}</p>
        <p>Language: {locale}</p>
        <p>Category: {category}</p>
        <p>Slug: {slug}</p>
      </main>

      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateGameJsonLd({
            title: gameData.title,
            description: gameData.description,
            category: gameData.category,
            url: getCanonicalUrl(`/${locale}/games/${category}/${slug}`)
          })
        }}
      />
    </div>
  );
}

/**
 * 生成页面元数据
 */
export async function generateMetadata({ params }: LocaleGamePageProps): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/${locale}/games/${category}/${slug}`);

  return generatePageSEO({
    title: `Game ${slug} - ${category} | ${locale.toUpperCase()}`,
    description: `Play ${slug} game in ${category} category - ${locale} version`,
    canonical: canonicalUrl
  });
}

/**
 * 生成静态参数（预留，实际应该从游戏数据生成）
 */
export async function generateStaticParams() {
  // 这里应该从实际的游戏数据生成参数
  // 目前返回空数组，表示使用动态渲染
  return [];
}