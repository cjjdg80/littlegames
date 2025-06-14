// src/app/report/page.tsx - 错误报告页面
// 功能说明: 提供错误报告表单，收集用户反馈的问题

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Bug, AlertTriangle, Send, CheckCircle, Info, HelpCircle } from "lucide-react";
import Link from "next/link";

// SEO元数据
export const metadata: Metadata = {
  title: "Report Bug - Help Us Improve | Play Browser Mini Games",
  description: "Report bugs and technical issues to help us improve your gaming experience. Your feedback helps us fix problems quickly.",
  keywords: "report bug, bug report, technical issues, feedback, support, problem report",
  openGraph: {
    title: "Report Bug - Help Us Improve | Play Browser Mini Games",
    description: "Report bugs and technical issues to help us improve your gaming experience. Your feedback helps us fix problems quickly.",
    url: "https://playbrowserminigames.com/report",
    type: "website",
  },
};

// 错误类型选项
const bugTypes = [
  { value: "game-loading", label: "Game won't load" },
  { value: "game-crash", label: "Game crashes or freezes" },
  { value: "audio-issues", label: "Audio problems" },
  { value: "visual-issues", label: "Visual/graphics problems" },
  { value: "performance", label: "Slow performance" },
  { value: "controls", label: "Control issues" },
  { value: "website", label: "Website functionality" },
  { value: "other", label: "Other issue" }
];

// 浏览器选项
const browsers = [
  { value: "chrome", label: "Google Chrome" },
  { value: "firefox", label: "Mozilla Firefox" },
  { value: "safari", label: "Safari" },
  { value: "edge", label: "Microsoft Edge" },
  { value: "opera", label: "Opera" },
  { value: "other", label: "Other" }
];

// 设备类型选项
const deviceTypes = [
  { value: "desktop", label: "Desktop Computer" },
  { value: "laptop", label: "Laptop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile Phone" }
];

export default function ReportBugPage() {

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Report a Bug</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Help us improve your gaming experience by reporting any issues you encounter. Your feedback is valuable to us.
            </p>
          </div>
        </section>

        {/* Bug Report Form */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4">
            <form action="mailto:support@playbrowserminigames.com" method="post" encType="text/plain" className="space-y-6">
              {/* Bug Type */}
              <div>
                <label htmlFor="bugType" className="block text-sm font-medium text-white mb-2">
                  What type of issue are you experiencing? *
                </label>
                <select
                  id="bugType"
                  name="bugType"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select issue type</option>
                  {bugTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Game Name */}
              <div>
                <label htmlFor="gameName" className="block text-sm font-medium text-white mb-2">
                  Game Name (if applicable)
                </label>
                <input
                  type="text"
                  id="gameName"
                  name="gameName"
                  placeholder="Enter the name of the game where you experienced the issue"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Browser and Device */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="browser" className="block text-sm font-medium text-white mb-2">
                    Browser *
                  </label>
                  <select
                    id="browser"
                    name="browser"
                    
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Select browser</option>
                    {browsers.map(browser => (
                      <option key={browser.value} value={browser.value}>{browser.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="deviceType" className="block text-sm font-medium text-white mb-2">
                    Device Type *
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Select device</option>
                    {deviceTypes.map(device => (
                      <option key={device.value} value={device.value}>{device.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Describe the issue *
                </label>
                <textarea
                  id="description"
                  name="description"
                  
                  required
                  rows={4}
                  placeholder="Please describe what happened, what you expected to happen, and any error messages you saw..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-vertical"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-white mb-2">
                  Steps to reproduce the issue
                </label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  
                  rows={4}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. The issue occurs when..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-vertical"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Provide your email if you'd like us to follow up with you about this issue.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Bug Report
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Fixes */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Quick Fixes</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Try these common solutions before reporting
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Refresh the page</li>
                  <li>• Clear browser cache</li>
                  <li>• Disable extensions</li>
                  <li>• Try a different browser</li>
                </ul>
              </div>

              {/* FAQ */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <HelpCircle className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Check FAQ</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Your issue might already be answered
                </p>
                <Link
                  href="/faq"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  View FAQ →
                </Link>
              </div>

              {/* Contact */}
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <Info className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">Need More Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Contact our support team directly
                </p>
                <a
                  href="mailto:support@playbrowserminigames.com"
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  Email Support →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 