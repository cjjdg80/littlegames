// src/app/help/page.tsx - 帮助中心页面
// 功能说明: 提供用户帮助、支持信息和常见问题解答

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HelpCircle, Search, Book, MessageCircle, Mail, Phone, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

// SEO元数据
export const metadata: Metadata = {
  title: "Help Center - Support & FAQ | Play Browser Mini Games",
  description: "Get help with playing games, technical issues, and account questions. Find answers to common questions and contact our support team.",
  keywords: "help center, support, FAQ, technical help, game help, customer service, troubleshooting",
  openGraph: {
    title: "Help Center - Support & FAQ | Play Browser Mini Games",
    description: "Get help with playing games, technical issues, and account questions. Find answers to common questions and contact our support team.",
    url: "https://playbrowserminigames.com/help",
    type: "website",
  },
};

// 帮助分类数据
const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of playing games on our platform",
    icon: Book,
    color: "bg-blue-500",
    articles: [
      "How to play games",
      "System requirements",
      "Browser compatibility",
      "Creating an account"
    ]
  },
  {
    id: "technical-issues",
    title: "Technical Issues",
    description: "Troubleshoot common technical problems",
    icon: HelpCircle,
    color: "bg-red-500",
    articles: [
      "Game won't load",
      "Audio/video problems",
      "Performance issues",
      "Browser crashes"
    ]
  },
  {
    id: "gameplay",
    title: "Gameplay Help",
    description: "Get help with specific games and features",
    icon: MessageCircle,
    color: "bg-green-500",
    articles: [
      "Game controls",
      "Saving progress",
      "Achievements",
      "Multiplayer games"
    ]
  },
  {
    id: "account",
    title: "Account & Settings",
    description: "Manage your account and preferences",
    icon: CheckCircle,
    color: "bg-purple-500",
    articles: [
      "Account settings",
      "Privacy options",
      "Notification preferences",
      "Data management"
    ]
  }
];

// 快速帮助链接
const quickHelp = [
  {
    title: "Game Won't Load?",
    description: "Try refreshing the page or clearing your browser cache",
    link: "/help/game-loading"
  },
  {
    title: "Audio Issues?",
    description: "Check your browser's audio settings and permissions",
    link: "/help/audio-problems"
  },
  {
    title: "Performance Problems?",
    description: "Close other tabs and ensure stable internet connection",
    link: "/help/performance"
  },
  {
    title: "Can't Find a Game?",
    description: "Use our search feature or browse by category",
    link: "/help/finding-games"
  }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Help Center</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Find answers to your questions and get the support you need to enjoy our games.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">Quick Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickHelp.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="group p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">Browse Help Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {helpCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {category.description}
                        </p>
                        <ul className="space-y-2">
                          {category.articles.map((article, index) => (
                            <li key={index}>
                              <Link
                                href={`/help/${category.id}/${article.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                              >
                                {article}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-300 mb-8">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Email Support */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Mail className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Email Support</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get detailed help via email
                </p>
                <a
                  href="mailto:support@playbrowserminigames.com"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  support@playbrowserminigames.com
                </a>
              </div>

              {/* FAQ */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Book className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">FAQ</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Check our frequently asked questions
                </p>
                <Link
                  href="/faq"
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  View FAQ
                </Link>
              </div>

              {/* Response Time */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Response Time</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We typically respond within
                </p>
                <span className="text-yellow-400 font-semibold">24 hours</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/faq"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                View FAQ
              </Link>
              <Link
                href="/report"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Report an Issue
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 