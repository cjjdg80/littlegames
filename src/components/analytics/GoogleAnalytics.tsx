// src/components/analytics/GoogleAnalytics.tsx - Google Analytics跟踪组件
// 功能说明: 提供Google Analytics跟踪代码，优化脚本加载性能

import Script from 'next/script';

// Google Analytics配置
const GA_TRACKING_ID = 'G-DEFN102MJV';

/**
 * Google Analytics跟踪组件
 * 使用Next.js Script组件优化加载性能
 * 跟踪代码会在页面加载后异步加载，不影响首屏性能
 */
export default function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics脚本 - 异步加载 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        id="google-analytics-script"
      />
      
      {/* Google Analytics配置脚本 */}
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
} 