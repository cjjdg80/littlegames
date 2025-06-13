// src/app/nlwdp/page.tsx - 后台管理系统主页面
// 功能说明: 管理仪表板，包含游戏管理、广告管理、系统配置等功能入口

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  GamepadIcon, 
  BarChart3, 
  Users, 
  FileText, 
  Shield,
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import AdminAuth from "@/components/admin/AdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";

// 管理仪表板数据接口
interface DashboardStats {
  totalGames: number;
  onlineGames: number;
  totalViews: number;
  activeAds: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 100,
    onlineGames: 85,
    totalViews: 12450,
    activeAds: 2
  });

  const router = useRouter();

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('admin_auth_token');
      const authTime = localStorage.getItem('admin_auth_time');
      
      if (authToken && authTime) {
        const now = Date.now();
        const authTimestamp = parseInt(authTime);
        // 认证有效期24小时
        if (now - authTimestamp < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          // 认证过期，清除本地存储
          localStorage.removeItem('admin_auth_token');
          localStorage.removeItem('admin_auth_time');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 处理认证成功
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_time');
    setIsAuthenticated(false);
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // 未认证状态 - 显示登录界面
  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  // 已认证状态 - 显示管理仪表板
  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">管理仪表板</h1>
          <div className="text-sm text-gray-400">
            最后更新: {new Date().toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总游戏数"
            value={stats.totalGames}
            icon={<GamepadIcon className="w-8 h-8" />}
            color="bg-blue-500"
          />
          <StatCard
            title="已上线游戏"
            value={stats.onlineGames}
            icon={<Eye className="w-8 h-8" />}
            color="bg-green-500"
          />
          <StatCard
            title="总访问量"
            value={stats.totalViews.toLocaleString()}
            icon={<BarChart3 className="w-8 h-8" />}
            color="bg-purple-500"
          />
          <StatCard
            title="活跃广告位"
            value={stats.activeAds}
            icon={<Settings className="w-8 h-8" />}
            color="bg-orange-500"
          />
        </div>

        {/* 快速操作 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="游戏管理"
              description="管理游戏上线状态、批量操作"
              icon={<GamepadIcon className="w-6 h-6" />}
              onClick={() => router.push('/nlwdp/games')}
            />
            <QuickActionCard
              title="广告管理"
              description="控制广告位开关、编辑广告代码"
              icon={<Settings className="w-6 h-6" />}
              onClick={() => router.push('/nlwdp/ads')}
            />
            <QuickActionCard
              title="系统配置"
              description="网站配置、SEO设置、统计查看"
              icon={<Shield className="w-6 h-6" />}
              onClick={() => router.push('/nlwdp/settings')}
            />
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">最近活动</h2>
          <div className="space-y-3">
            <ActivityItem
              action="游戏上线"
              target="Puzzle Adventure"
              time="2分钟前"
              type="success"
            />
            <ActivityItem
              action="广告位启用"
              target="游戏详情页 - 侧边栏"
              time="15分钟前"
              type="info"
            />
            <ActivityItem
              action="批量操作"
              target="下线5个游戏"
              time="1小时前"
              type="warning"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// 快速操作卡片组件
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-left transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-400">{icon}</div>
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  );
}

// 活动项组件
interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

function ActivityItem({ action, target, time, type }: ActivityItemProps) {
  const typeColors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-2 h-2 rounded-full ${typeColors[type]}`}></div>
      <div className="flex-1">
        <span className="text-white">{action}</span>
        <span className="text-gray-400 mx-2">·</span>
        <span className="text-gray-300">{target}</span>
      </div>
      <span className="text-gray-500 text-sm">{time}</span>
    </div>
  );
} 