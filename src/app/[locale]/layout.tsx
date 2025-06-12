// src/app/[locale]/layout.tsx - 多语言布局组件
import React from 'react';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "../../styles/home.css";
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

/**
 * 导出支持的语言列表
 */
export { supportedLocales };