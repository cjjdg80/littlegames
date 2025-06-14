// src/app/[locale]/layout.tsx - 多语言布局组件
import React from 'react';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

// 支持的语言列表
const supportedLocales = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'];

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

/**
 * 多语言布局组件
 * 处理不同语言版本的页面布局
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // 等待params参数
  const { locale } = await params;
  
  // 验证语言代码是否支持
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        {/* 多语言内容包装器 */}
        <div className="locale-wrapper" data-locale={locale}>
          {children}
        </div>
      </body>
    </html>
  );
}

/**
 * 生成静态参数（用于静态生成）
 */
export async function generateStaticParams() {
  return supportedLocales.map((locale) => ({
    locale,
  }));
}

// 注意：supportedLocales 不能在布局文件中导出，因为Next.js类型限制
// 如需使用，请从 src/lib/seo-utils.ts 中的 SUPPORTED_LOCALES 导入