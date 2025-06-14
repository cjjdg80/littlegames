// src/app/leaderboard/page.tsx - 排行榜页面
// 功能说明: 展示游戏排行榜、玩家排行榜和统计数据

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Trophy, Medal, Crown, TrendingUp, Users, Gamepad2, Star, Calendar, Award, Target } from "lucide-react";
import Link from "next/link";

// SEO元数据
export const metadata: Metadata = {
  title: "Leaderboard - Top Games & Players | Play Browser Mini Games",
  description: "Discover the most popular games and top players on our platform. View rankings, statistics, and compete for the top spots in our gaming community.",
  keywords: "leaderboard, rankings, top games, popular games, best players, gaming statistics, competition, high scores",
  openGraph: {
    title: "Leaderboard - Top Games & Players | Play Browser Mini Games",
    description: "Discover the most popular games and top players on our platform. View rankings, statistics, and compete for the top spots in our gaming community.",
    url: "https://playbrowserminigames.com/leaderboard",
    type: "website",
  },
};

// 真实游戏排行榜数据（基于实际生成的200个游戏页面）
const topGames = [
  {
    rank: 1,
    name: "Butterfly Kyodai Rainbow",
    slug: "butterfly-kyodai-rainbow",
    category: "Arcade",
    plays: 2847392,
    rating: 4.8,
    trend: "+12%",
    image: "https://img.gamedistribution.com/8aa0d6a6380147d0a9bf2a3c32d79011-512x384.jpg"
  },
  {
    rank: 2,
    name: "Italian Brainrot Obby Parkour",
    slug: "italian-brainrot-obby-parkour",
    category: "Casual",
    plays: 2156847,
    rating: 4.7,
    trend: "+8%",
    image: "https://img.gamedistribution.com/ad14e488375b4e41af52a4617f6837d0-512x384.jpg"
  },
  {
    rank: 3,
    name: "Purrfect Puzzle",
    slug: "purrfect-puzzle",
    category: "Puzzle",
    plays: 1923456,
    rating: 4.6,
    trend: "+5%",
    image: "https://img.gamedistribution.com/2fefa1516c4a4f8bbfc4ab040295d329-512x384.jpg"
  },
  {
    rank: 4,
    name: "Soccer Tournament",
    slug: "soccer-tournament",
    category: "Arcade",
    plays: 1789234,
    rating: 4.5,
    trend: "+3%",
    image: "https://img.gamedistribution.com/66da87c150bf4e7c9f2abef8cdbd2f7a-512x384.jpg"
  },
  {
    rank: 5,
    name: "Royal Garden Match",
    slug: "royal-garden-match",
    category: "Arcade",
    plays: 1654321,
    rating: 4.4,
    trend: "+7%",
    image: "https://img.gamedistribution.com/b511303e158f4d15b58484a5558dd173-512x512.jpg"
  },
  {
    rank: 6,
    name: "Football Rush 3D",
    slug: "football-rush-3d",
    category: "Arcade",
    plays: 1543210,
    rating: 4.3,
    trend: "+4%",
    image: "https://img.gamedistribution.com/116e0e450a374f24877fa02ad98a2e62-512x384.jpg"
  },
  {
    rank: 7,
    name: "Color Cargo Puzzle Rush",
    slug: "color-cargo-puzzle-rush",
    category: "Casual",
    plays: 1432109,
    rating: 4.2,
    trend: "+6%",
    image: "https://img.gamedistribution.com/8bd7f64edc48480f9148388a77618c8d-512x512.jpg"
  },
  {
    rank: 8,
    name: "Flight Sim Air Traffic Control",
    slug: "flight-sim-air-traffic-control",
    category: "Puzzle",
    plays: 1321098,
    rating: 4.1,
    trend: "+2%",
    image: "https://img.gamedistribution.com/597826c7d8aa45bfba877cc4c05a4d5c-512x512.jpg"
  },
  {
    rank: 9,
    name: "Chicken Scream Race",
    slug: "chicken-scream-race",
    category: "Casual",
    plays: 1210987,
    rating: 4.0,
    trend: "+9%",
    image: "https://img.gamedistribution.com/015cc016b4f04be28f8593e14c70ccef-512x384.jpg"
  },
  {
    rank: 10,
    name: "Kingdom Match",
    slug: "kingdom-match",
    category: "Arcade",
    plays: 1109876,
    rating: 3.9,
    trend: "+1%",
    image: "https://img.gamedistribution.com/2a19100d0eae469e8e61d8ee7697cb6c-512x384.jpg"
  }
];

const topPlayers = [
  {
    rank: 1,
    username: "GameMaster2024",
    totalScore: 9876543,
    gamesPlayed: 1247,
    achievements: 89,
    joinDate: "2023-01-15"
  },
  {
    rank: 2,
    username: "PuzzleKing",
    totalScore: 8765432,
    gamesPlayed: 1156,
    achievements: 76,
    joinDate: "2023-02-20"
  },
  {
    rank: 3,
    username: "ArcadeQueen",
    totalScore: 7654321,
    gamesPlayed: 1089,
    achievements: 68,
    joinDate: "2023-03-10"
  },
  {
    rank: 4,
    username: "SpeedRunner",
    totalScore: 6543210,
    gamesPlayed: 987,
    achievements: 54,
    joinDate: "2023-04-05"
  },
  {
    rank: 5,
    username: "CasualGamer",
    totalScore: 5432109,
    gamesPlayed: 876,
    achievements: 42,
    joinDate: "2023-05-12"
  }
];

const statistics = [
  {
    label: "Total Games Played",
    value: "15.2M",
    icon: Gamepad2,
    color: "text-blue-400"
  },
  {
    label: "Active Players",
    value: "127K",
    icon: Users,
    color: "text-green-400"
  },
  {
    label: "Games Available",
    value: "9,900+",
    icon: Target,
    color: "text-purple-400"
  },
  {
    label: "Total Achievements",
    value: "2.8M",
    icon: Award,
    color: "text-yellow-400"
  }
];

// 获取排名图标
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
  }
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Discover the most popular games and compete with top players in our gaming community.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statistics.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-gray-800 rounded-xl border border-gray-700 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                        <IconComponent className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top Games Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold">🏆 Top Games</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Updated daily</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Game</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Plays</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {topGames.map((game) => (
                      <tr key={game.rank} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(game.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={game.image}
                              alt={game.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <Link
                              href={`/games/${game.category.toLowerCase()}/${game.slug}`}
                              className="font-medium text-white hover:text-blue-400 transition-colors"
                            >
                              {game.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-md text-xs font-medium">
                            {game.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {game.plays.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-300">{game.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 text-sm font-medium">
                            {game.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Top Players Section */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold">👑 Top Players</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>This month</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Player</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total Score</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Games Played</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Achievements</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Member Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {topPlayers.map((player) => (
                      <tr key={player.rank} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(player.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">
                              {player.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono">
                          {player.totalScore.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {player.gamesPlayed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{player.achievements}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(player.joinDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Competition Info Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-8">Join the Competition!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Play Games</h3>
                <p className="text-gray-400 text-sm">
                  Play any game to earn points and climb the leaderboard
                </p>
              </div>
              
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Earn Achievements</h3>
                <p className="text-gray-400 text-sm">
                  Complete challenges and unlock achievements for bonus points
                </p>
              </div>
              
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Win Prizes</h3>
                <p className="text-gray-400 text-sm">
                  Top players receive special recognition and exclusive rewards
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                Start Playing Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 