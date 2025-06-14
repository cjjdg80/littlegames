// src/lib/admin-auth.ts - 管理员认证工具库
// 功能说明: 提供管理员认证相关的工具函数和类型定义

/**
 * 管理员认证配置
 */
export const ADMIN_CONFIG = {
  // 认证有效期（24小时）
  AUTH_DURATION: 24 * 60 * 60 * 1000,
  // 本地存储键名
  STORAGE_KEYS: {
    AUTH_TOKEN: 'admin_auth_token',
    AUTH_TIME: 'admin_auth_time',
    USER_PREFERENCES: 'admin_preferences'
  },
  // 管理员密码（生产环境应使用环境变量）
  ADMIN_PASSWORD: 'nlwdp2024!@#'
};

/**
 * 管理员用户信息接口
 */
export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
  loginTime: number;
  lastActivity: number;
}

/**
 * 认证状态接口
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
}

/**
 * 检查管理员认证状态
 * @returns 认证状态对象
 */
export function checkAuthStatus(): AuthState {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }

  const token = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const authTime = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TIME);

  if (!token || !authTime) {
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }

  const now = Date.now();
  const authTimestamp = parseInt(authTime);

  // 检查认证是否过期
  if (now - authTimestamp > ADMIN_CONFIG.AUTH_DURATION) {
    clearAuthData();
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }

  // 构建用户信息
  const user: AdminUser = {
    id: 'admin_001',
    username: 'admin',
    role: 'admin',
    loginTime: authTimestamp,
    lastActivity: now
  };

  return {
    isAuthenticated: true,
    user,
    token
  };
}

/**
 * 验证管理员密码
 * @param password 输入的密码
 * @returns 验证结果
 */
export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_CONFIG.ADMIN_PASSWORD;
}

/**
 * 设置认证数据
 * @param password 验证通过的密码
 * @returns 生成的认证令牌
 */
export function setAuthData(password: string): string {
  if (!validateAdminPassword(password)) {
    throw new Error('Invalid password');
  }

  const now = Date.now();
  const token = btoa(`admin_${now}_${Math.random()}`);

  localStorage.setItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TIME, now.toString());

  return token;
}

/**
 * 清除认证数据
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(ADMIN_CONFIG.STORAGE_KEYS.AUTH_TIME);
  localStorage.removeItem(ADMIN_CONFIG.STORAGE_KEYS.USER_PREFERENCES);
}

/**
 * 更新最后活动时间
 */
export function updateLastActivity(): void {
  if (typeof window === 'undefined') return;

  const authState = checkAuthStatus();
  if (authState.isAuthenticated) {
    // 可以在这里更新活动时间，目前简单实现
    console.log('Admin activity updated');
  }
}

/**
 * 获取认证剩余时间（毫秒）
 * @returns 剩余时间，-1表示未认证
 */
export function getAuthRemainingTime(): number {
  const authState = checkAuthStatus();
  
  if (!authState.isAuthenticated || !authState.user) {
    return -1;
  }

  const now = Date.now();
  const elapsed = now - authState.user.loginTime;
  const remaining = ADMIN_CONFIG.AUTH_DURATION - elapsed;

  return Math.max(0, remaining);
}

/**
 * 格式化剩余时间为可读字符串
 * @returns 格式化的时间字符串
 */
export function formatRemainingTime(): string {
  const remaining = getAuthRemainingTime();
  
  if (remaining <= 0) {
    return '已过期';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

/**
 * 管理员权限检查
 * @param requiredRole 需要的角色
 * @returns 是否有权限
 */
export function hasPermission(requiredRole: 'admin' | 'super_admin' = 'admin'): boolean {
  const authState = checkAuthStatus();
  
  if (!authState.isAuthenticated || !authState.user) {
    return false;
  }

  // 简单的权限检查逻辑
  if (requiredRole === 'admin') {
    return authState.user.role === 'admin' || authState.user.role === 'super_admin';
  }
  
  if (requiredRole === 'super_admin') {
    return authState.user.role === 'super_admin';
  }

  return false;
} 