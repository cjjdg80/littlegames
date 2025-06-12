// src/app/[locale]/tags/[tag]/page.tsx - 多语言游戏标签页面
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supportedLocales } from '../../layout';
import { getCanonicalUrl, getTagUrl } from '@/lib/url-utils';
import { generatePageSEO } from '@/lib/seo-utils';

interface LocaleTagPageProps {
  params: Promise<{
    locale: string;
    tag: string;
  }>;
}

/**
 * 多语言游戏标签页面组件
 */
export default async function LocaleTagPage({ params }: LocaleTagPageProps) {
  const { locale, tag } = await params;

  // 验证语言代码
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  // 模拟标签数据获取
  const tagData = {
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    description: `Games tagged with ${tag} in ${locale}`,
    locale,
    tag
  };

  return (
    <div className="tag-page" data-locale={locale}>
      {/* 页面标题 */}
      <header>
        <h1>{tagData.name} Games</h1>
        <p>{tagData.description}</p>
        <p>Language: {locale}</p>
        <p>Tag: {tag}</p>
      </header>

      {/* 游戏列表占位符 */}
      <main>
        <div className="games-grid">
          <p>Games tagged with "{tag}" will be displayed here...</p>
        </div>
      </main>
    </div>
  );
}

/**
 * 生成页面元数据
 */
export async function generateMetadata({ params }: LocaleTagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const canonicalUrl = getCanonicalUrl(`/${locale}/tags/${tag}`);

  return generatePageSEO({
    title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Games | ${locale.toUpperCase()}`,
    description: `Browse games tagged with ${tag} - ${locale} version`,
    canonical: canonicalUrl
  });
}

/**
 * 生成静态参数（预留）
 */
export async function generateStaticParams() {
  // 这里应该从实际的标签数据生成参数
  return [];
}