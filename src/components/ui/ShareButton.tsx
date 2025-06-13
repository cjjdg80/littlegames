// src/components/ui/ShareButton.tsx - 游戏分享按钮组件
// 功能说明: 提供多种分享方式，包括社交媒体、聊天工具和原生分享API

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  gameTitle: string;
  gameImage: string;
  gameUrl: string;
  gameDescription?: string;
  gameCategory?: string;
  className?: string;
}

interface ShareOption {
  name: string;
  icon: string;
  color: string;
  action: (data: ShareData) => void;
}

interface ShareData {
  title: string;
  description: string;
  url: string;
  image: string;
}

export default function ShareButton({
  gameTitle,
  gameImage,
  gameUrl,
  gameDescription = "",
  gameCategory = "",
  className = ""
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 构建分享数据
  const shareData: ShareData = {
    title: gameTitle,
    description: gameDescription || `Play ${gameTitle} online for free! ${gameCategory ? `#${gameCategory}` : ''} #BrowserGames #OnlineGames`,
    url: gameUrl,
    image: gameImage
  };

  // 分享选项配置
  const shareOptions: ShareOption[] = [
    {
      name: "Facebook",
      icon: "📘",
      color: "bg-blue-600 hover:bg-blue-700",
      action: (data) => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title + ' - ' + data.description)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Twitter",
      icon: "🐦",
      color: "bg-sky-500 hover:bg-sky-600",
      action: (data) => {
        const text = `🎮 ${data.title}\n\n${data.description}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "WhatsApp",
      icon: "💬",
      color: "bg-green-600 hover:bg-green-700",
      action: (data) => {
        const text = `🎮 *${data.title}*\n\n${data.description}\n\n🔗 ${data.url}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: "Telegram",
      icon: "✈️",
      color: "bg-blue-500 hover:bg-blue-600",
      action: (data) => {
        const text = `🎮 ${data.title}\n\n${data.description}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: "Reddit",
      icon: "🔴",
      color: "bg-orange-600 hover:bg-orange-700",
      action: (data) => {
        const url = `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(`🎮 ${data.title} - Free Browser Game`)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "LinkedIn",
      icon: "💼",
      color: "bg-blue-700 hover:bg-blue-800",
      action: (data) => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Discord",
      icon: "🎮",
      color: "bg-indigo-600 hover:bg-indigo-700",
      action: (data) => {
        const message = `🎮 **${data.title}**\n\n${data.description}\n\n🔗 ${data.url}`;
        copyToClipboard(message);
        showNotification("Discord message copied! Paste it in your Discord chat.");
      }
    },
    {
      name: "QQ",
      icon: "🐧",
      color: "bg-blue-400 hover:bg-blue-500",
      action: (data) => {
        const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.description)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "WeChat",
      icon: "💚",
      color: "bg-green-500 hover:bg-green-600",
      action: (data) => {
        const message = `🎮 ${data.title}\n\n${data.description}\n\n🔗 ${data.url}`;
        copyToClipboard(message);
        showNotification("WeChat message copied! Paste it in your WeChat chat.");
      }
    },
    {
      name: "Line",
      icon: "💚",
      color: "bg-green-400 hover:bg-green-500",
      action: (data) => {
        const text = `🎮 ${data.title}\n\n${data.description}`;
        const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Pinterest",
      icon: "📌",
      color: "bg-red-600 hover:bg-red-700",
      action: (data) => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(data.url)}&media=${encodeURIComponent(data.image)}&description=${encodeURIComponent(data.title + ' - ' + data.description)}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: "Email",
      icon: "📧",
      color: "bg-gray-600 hover:bg-gray-700",
      action: (data) => {
        const subject = encodeURIComponent(`🎮 Check out this awesome game: ${data.title}`);
        const body = encodeURIComponent(`Hi there!\n\nI found this amazing browser game and thought you might enjoy it:\n\n🎮 ${data.title}\n\n${data.description}\n\n🔗 Play it here: ${data.url}\n\nHave fun gaming!\n\nShared from Play Browser Mini Games`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  // 复制到剪贴板功能
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 原生分享API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url,
        });
        setIsOpen(false);
      } catch (err) {
        console.log('Native share cancelled or failed');
      }
    }
  };

  // 显示通知的函数
  const showNotification = (message: string) => {
    // 创建一个临时的通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 3秒后移除通知
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* 分享按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>

      {/* 分享选项下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Share Game</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 游戏信息预览 */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={gameImage}
                  alt={gameTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium line-clamp-1">{gameTitle}</h4>
                <p className="text-gray-400 text-sm line-clamp-1">{shareData.description}</p>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex gap-2">
              {/* 原生分享 */}
              {typeof window !== 'undefined' && window.navigator && 'share' in window.navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
              
              {/* 复制链接 */}
              <button
                onClick={handleCopyLink}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 社交媒体选项 */}
          <div className="p-4">
            <div className="grid grid-cols-6 gap-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action(shareData);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-white",
                    option.color
                  )}
                  title={`Share on ${option.name}`}
                >
                  <span className="text-base">{option.icon}</span>
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 底部提示 */}
          <div className="px-4 pb-4">
            <p className="text-gray-500 text-xs text-center">
              Share this awesome game with your friends!
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 