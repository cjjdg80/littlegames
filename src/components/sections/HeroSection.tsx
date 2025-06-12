// src/components/sections/HeroSection.tsx - Hero区域组件
// 功能说明: 网站主要介绍区域，包含标题、描述和主要行动号召

"use client";

import React from "react";
import Link from "next/link";
import { Play, Star, TrendingUp, Zap } from "lucide-react";

interface HeroSectionProps {
  gameCount?: number;
  userCount?: string;
}

export default function HeroSection({ gameCount = 9900, userCount = "12.5K" }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          {/* 主标题 */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Play <span className="text-blue-400">Free Games</span>
            <br className="hidden sm:block" />
            Instantly in Your Browser
          </h1>

          {/* 副标题 */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of free online games. No downloads, no installations. 
            Just pure gaming fun that works on any device.
          </p>

          {/* 统计数据 */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-gray-300">
              <Play className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{gameCount.toLocaleString()}+ Games</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-lg">Rated 4.8/5</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-lg">{userCount} Playing Now</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-lg">Instant Play</span>
            </div>
          </div>

          {/* CTA按钮组 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/games"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Playing Now
            </Link>
            
            <Link
              href="/popular"
              className="bg-transparent border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Popular Games
            </Link>
          </div>

          {/* 功能特点 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Play</h3>
              <p className="text-gray-400">No downloads or installations required. Click and play immediately.</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High Quality</h3>
              <p className="text-gray-400">Curated collection of the best free games from around the web.</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Always Updated</h3>
              <p className="text-gray-400">New games added daily. Fresh content to keep you entertained.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 