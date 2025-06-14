// src/app/faq/page.tsx - 常见问题页面
// 功能说明: 提供常见问题和详细答案

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQClient from "@/components/faq/FAQClient";
import { HelpCircle, Search, Book, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";

// SEO元数据
export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Play Browser Mini Games",
  description: "Find answers to the most common questions about playing games, technical issues, and using our platform.",
  keywords: "FAQ, frequently asked questions, help, support, game help, technical support, troubleshooting",
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Play Browser Mini Games",
    description: "Find answers to the most common questions about playing games, technical issues, and using our platform.",
    url: "https://playbrowserminigames.com/faq",
    type: "website",
  },
};

// FAQ数据
const faqCategories = [
  {
    id: "general",
    title: "General Questions",
    iconName: "HelpCircle",
    questions: [
      {
        question: "What is Play Browser Mini Games?",
        answer: "Play Browser Mini Games is a free online gaming platform where you can play thousands of browser games instantly without downloads. We offer games across multiple categories including action, puzzle, adventure, sports, and more."
      },
      {
        question: "Do I need to create an account to play games?",
        answer: "No, you can play most games without creating an account. However, creating an account allows you to save your progress, track achievements, and get personalized game recommendations."
      },
      {
        question: "Are all games free to play?",
        answer: "Yes, all games on our platform are completely free to play. We support our service through non-intrusive advertisements that help us keep the games free for everyone."
      },
      {
        question: "How often do you add new games?",
        answer: "We add new games regularly, typically several times per week. You can check our 'New Games' section to see the latest additions to our collection."
      }
    ]
  },
  {
    id: "technical",
    title: "Technical Support",
    iconName: "MessageCircle",
    questions: [
      {
        question: "Why won't a game load?",
        answer: "If a game won't load, try these steps: 1) Refresh the page, 2) Clear your browser cache and cookies, 3) Disable browser extensions temporarily, 4) Check your internet connection, 5) Try a different browser. If the problem persists, contact our support team."
      },
      {
        question: "What browsers are supported?",
        answer: "Our games work best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience. Internet Explorer is not supported."
      },
      {
        question: "Why is the game running slowly?",
        answer: "Slow performance can be caused by: 1) Too many browser tabs open, 2) Low system memory, 3) Slow internet connection, 4) Outdated browser. Try closing other tabs, restarting your browser, or playing on a device with better specifications."
      },
      {
        question: "I'm having audio issues. What should I do?",
        answer: "For audio problems: 1) Check if your device volume is turned up, 2) Ensure the game's audio isn't muted, 3) Check browser audio permissions, 4) Try refreshing the page, 5) Test audio in other applications to ensure your device audio is working."
      },
      {
        question: "Can I play games on mobile devices?",
        answer: "Yes! Many of our games are mobile-friendly and work great on smartphones and tablets. Look for the mobile-compatible icon on game pages, or browse our mobile games category."
      }
    ]
  },
  {
    id: "gameplay",
    title: "Gameplay & Features",
    iconName: "Book",
    questions: [
      {
        question: "How do I save my game progress?",
        answer: "Game progress saving depends on the individual game. Some games automatically save progress in your browser's local storage, while others may require an account. Check the game's instructions for specific saving information."
      },
      {
        question: "Can I play multiplayer games?",
        answer: "Yes, we have a selection of multiplayer games. These include both local multiplayer (multiple players on the same device) and online multiplayer games. Check the game description for multiplayer capabilities."
      },
      {
        question: "How do I report a bug in a game?",
        answer: "If you encounter a bug, please use our 'Report Bug' feature. Provide details about what happened, which browser you're using, and steps to reproduce the issue. This helps us fix problems quickly."
      },
      {
        question: "Can I suggest new games to be added?",
        answer: "Absolutely! We welcome game suggestions from our community. Use our 'Suggest Game' feature to recommend games you'd like to see on our platform. We review all suggestions and add popular requests when possible."
      },
      {
        question: "Are there age restrictions for games?",
        answer: "Our games are suitable for all ages, but some games may be more appropriate for certain age groups. We provide content descriptions to help you choose appropriate games. Parental guidance is recommended for younger players."
      }
    ]
  }
];



export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Find quick answers to the most common questions about our games and platform.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQ..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <FAQClient faqCategories={faqCategories} />

        {/* Still Need Help */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-300 mb-8">
              Can't find the answer you're looking for? We're here to help you get back to gaming.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Support */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Mail className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get personalized help from our support team
                </p>
                <a
                  href="mailto:support@playbrowserminigames.com"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  Email Support
                </a>
              </div>

              {/* Help Center */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Book className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Help Center</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Browse detailed guides and tutorials
                </p>
                <Link
                  href="/help"
                  className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  Visit Help Center
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/report"
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                Report a Bug
              </Link>
              <Link
                href="/suggest"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Suggest a Game
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 