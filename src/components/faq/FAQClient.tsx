// src/components/faq/FAQClient.tsx - FAQ客户端交互组件
// 功能说明: 处理FAQ页面的客户端交互，包括展开/收起问题

"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

// FAQ项目组件
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between"
      >
        <span className="font-medium text-white">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

import { HelpCircle, Book, MessageCircle, CheckCircle } from "lucide-react";

// 图标映射
const iconMap = {
  HelpCircle,
  Book,
  MessageCircle,
  CheckCircle
};

// FAQ客户端组件
export default function FAQClient({ faqCategories }: { faqCategories: any[] }) {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        {faqCategories.map((category, categoryIndex) => {
          const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || HelpCircle;
          return (
            <div key={category.id} className={categoryIndex > 0 ? "mt-16" : ""}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{category.title}</h2>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((faq: any, index: number) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 