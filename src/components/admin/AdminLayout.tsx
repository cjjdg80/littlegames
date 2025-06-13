// src/components/admin/AdminLayout.tsx - 管理后台布局组件
// 功能说明: 提供统一的管理后台布局，包含侧边栏导航、顶部栏和主内容区域

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  GamepadIcon, 
  Settings, 
  Shield,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

// 导航菜单项配置
const navigationItems = [
  {
    name: "仪表板",
    href: "/nlwdp",
    icon: Home,
    description: "系统概览和统计"
  },
  {
    name: "游戏管理",
    href: "/nlwdp/games",
    icon: GamepadIcon,
    description: "游戏上线状态管理"
  },
  {
    name: "广告管理",
    href: "/nlwdp/ads",
    icon: Settings,
    description: "广告位控制和配置"
  },
  {
    name: "系统配置",
    href: "/nlwdp/settings",
    icon: Shield,
    description: "网站配置和SEO设置"
  }
];

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-900">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* 侧边栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">管理后台</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 mt-8 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <div>{item.name}</div>
                      <div className="text-xs opacity-75 truncate">{item.description}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-4">
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white mr-4 flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* 面包屑导航 */}
            <nav className="flex items-center space-x-2 text-sm min-w-0">
              <Link 
                href="/" 
                className="text-gray-400 hover:text-white flex items-center flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回网站
              </Link>
              <span className="text-gray-600 flex-shrink-0">/</span>
              <span className="text-white truncate">
                {navigationItems.find(item => item.href === pathname)?.name || "管理后台"}
              </span>
            </nav>
          </div>

          {/* 用户信息 */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="text-sm text-gray-300 hidden sm:block">
              管理员已登录
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* 主内容 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 