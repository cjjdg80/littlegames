// src/app/suggest/page.tsx - 游戏推荐页面
// 功能说明: 提供游戏推荐表单，收集用户推荐的游戏

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Lightbulb, Send, CheckCircle, Star, GamepadIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

// SEO元数据
export const metadata: Metadata = {
  title: "Suggest a Game - Share Your Favorites | Play Browser Mini Games",
  description: "Suggest new games to be added to our platform. Help us grow our collection by recommending your favorite browser games.",
  keywords: "suggest game, recommend game, game suggestion, add game, game request, community suggestions",
  openGraph: {
    title: "Suggest a Game - Share Your Favorites | Play Browser Mini Games",
    description: "Suggest new games to be added to our platform. Help us grow our collection by recommending your favorite browser games.",
    url: "https://playbrowserminigames.com/suggest",
    type: "website",
  },
};

// 游戏分类选项
const gameCategories = [
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "arcade", label: "Arcade" },
  { value: "casual", label: "Casual" },
  { value: "puzzle", label: "Puzzle" },
  { value: "simulation", label: "Simulation" },
  { value: "sports", label: "Sports" },
  { value: "strategy", label: "Strategy" }
];

// 游戏平台选项
const gamePlatforms = [
  { value: "web", label: "Web Browser" },
  { value: "flash", label: "Flash Game" },
  { value: "html5", label: "HTML5 Game" },
  { value: "unity", label: "Unity WebGL" },
  { value: "other", label: "Other" }
];

export default function SuggestGamePage() {

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Suggest a Game</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Help us grow our collection! Recommend your favorite browser games and help other players discover amazing new experiences.
            </p>
          </div>
        </section>

        {/* Suggestion Guidelines */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What Makes a Great Suggestion?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <GamepadIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Fun & Engaging</h3>
                <p className="text-gray-400 text-sm">
                  Games that are enjoyable, well-designed, and offer good gameplay experience
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Browser Compatible</h3>
                <p className="text-gray-400 text-sm">
                  Games that work well in modern web browsers without requiring downloads
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">High Quality</h3>
                <p className="text-gray-400 text-sm">
                  Games with good graphics, smooth performance, and polished user experience
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Suggestion Form */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4">
            <form action="mailto:support@playbrowserminigames.com" method="post" encType="text/plain" className="space-y-6">
              {/* Game Name */}
              <div>
                <label htmlFor="gameName" className="block text-sm font-medium text-white mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  id="gameName"
                  name="gameName"

                  required
                  placeholder="Enter the name of the game you want to suggest"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Game URL */}
              <div>
                <label htmlFor="gameUrl" className="block text-sm font-medium text-white mb-2">
                  Game URL (if available)
                </label>
                <input
                  type="url"
                  id="gameUrl"
                  name="gameUrl"

                  placeholder="https://example.com/game"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-gray-400 text-sm mt-2">
                  If you know where the game can be played, please provide the URL
                </p>
              </div>

              {/* Category and Platform */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    Game Category *
                  </label>
                  <select
                    id="category"
                    name="category"

                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    {gameCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-white mb-2">
                    Platform/Technology
                  </label>
                  <select
                    id="platform"
                    name="platform"

                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select platform</option>
                    {gamePlatforms.map(platform => (
                      <option key={platform.value} value={platform.value}>{platform.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Game Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Game Description *
                </label>
                <textarea
                  id="description"
                  name="description"

                  required
                  rows={4}
                  placeholder="Describe the game: What is it about? How do you play? What makes it interesting?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-vertical"
                />
              </div>

              {/* Why Recommend */}
              <div>
                <label htmlFor="whyRecommend" className="block text-sm font-medium text-white mb-2">
                  Why do you recommend this game? *
                </label>
                <textarea
                  id="whyRecommend"
                  name="whyRecommend"

                  required
                  rows={3}
                  placeholder="What makes this game special? Why would other players enjoy it?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-vertical"
                />
              </div>

              {/* Your Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="yourName" className="block text-sm font-medium text-white mb-2">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="yourName"
                    name="yourName"

                    placeholder="Your name or username"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"

                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                We may contact you if we need more information about your suggestion or to give you credit when we add the game.
              </p>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Game Suggestion
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Gaming Community</h2>
            <p className="text-gray-300 mb-8">
              Your suggestions help make our platform better for everyone. Together, we're building the best collection of browser games on the web.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Community Stats */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="text-3xl font-bold text-purple-400 mb-2">9,700+</div>
                <p className="text-gray-300 font-medium">Games Available</p>
                <p className="text-gray-400 text-sm">And growing every day</p>
              </div>

              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                <p className="text-gray-300 font-medium">Community Suggestions</p>
                <p className="text-gray-400 text-sm">From players like you</p>
              </div>

              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                <p className="text-gray-300 font-medium">Approval Rate</p>
                <p className="text-gray-400 text-sm">For quality suggestions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/featured"
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
              >
                Featured Games
              </Link>
              <Link
                href="/popular"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Popular Games
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 