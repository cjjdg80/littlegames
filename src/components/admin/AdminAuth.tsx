// src/components/admin/AdminAuth.tsx - 管理员认证组件
// 功能说明: 简单的密码认证系统，支持本地存储认证状态

"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export default function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 简单的密码验证（实际项目中应该使用更安全的方式）
  const ADMIN_PASSWORD = "nlwdp2024!@#";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === ADMIN_PASSWORD) {
      // 认证成功，保存到本地存储
      const authToken = btoa(`admin_${Date.now()}`);
      localStorage.setItem('admin_auth_token', authToken);
      localStorage.setItem('admin_auth_time', Date.now().toString());
      
      onAuthSuccess();
    } else {
      setError("密码错误，请重试");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 标题区域 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">管理员登录</h2>
          <p className="mt-2 text-gray-400">
            请输入管理员密码以访问后台管理系统
          </p>
        </div>

        {/* 登录表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              管理员密码
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-4 pr-12 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="请输入管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>验证中...</span>
                </div>
              ) : (
                "登录管理后台"
              )}
            </button>
          </div>

          {/* 安全提示 */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              认证状态将保存24小时，请确保在安全环境下使用
            </p>
          </div>
        </form>

        {/* 开发提示 */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-300">
              <p className="font-medium mb-1">开发环境提示:</p>
              <p>当前使用简单密码认证，生产环境请使用更安全的认证方式</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 