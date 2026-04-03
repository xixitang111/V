'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bot,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  TrendingUp,
  Wand2,
  DollarSign,
  Home
} from 'lucide-react';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: Home, label: '灵感有标价', active: true, href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
    { icon: Users, label: '身份管理', href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', href: '/' },
    { icon: Bot, label: '自动化', href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
  ];

  const features = [
    {
      icon: Wand2,
      title: 'AI 内容创作',
      description: '基于人设的智能内容生成，让每一条笔记都有独特风格',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bot,
      title: 'RPA 自动化',
      description: '智能评论回复、同行截流、定时发布，24小时全自动运营',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: '数据驱动',
      description: '全链路数据监控，增长飞轮可视化，让每一个决策都有依据',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: DollarSign,
      title: '商业变现',
      description: '人设、内容、流量、转化、交付，完整的商业化闭环',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Vibe Money
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.highlight
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30'
                  : item.active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-amber-300' : ''}`} />
              {isSidebarOpen && (
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${item.highlight ? 'text-amber-100' : ''}`}>{item.label}</span>
                  {item.highlight && (
                    <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-xs rounded-full">
                      ✨
                    </span>
                  )}
                  {item.label === 'AI创作' && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      Beta
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-4 border-t border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center"
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-slate-900 border border-indigo-500/30 p-12 mb-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                让每一个灵感都有标价
              </div>
              
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Vibe Money
              </h1>
              
              <p className="text-2xl text-slate-300 mb-6">
                Turn your Vibe into Value
              </p>
              
              <p className="text-lg text-slate-400 max-w-2xl mb-8">
                从人设塑造到内容创作，从流量获取到商业变现，
                Vibe Money 为你构建完整的 AI 驱动商业化闭环。
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  开始创作
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-all"
                >
                  查看数据
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">
              完整的商业化解决方案
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={index === 0 ? '/' : index === 1 ? '/automation' : index === 2 ? '/dashboard' : '/delivery'}
                  className="group relative overflow-hidden bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-100 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Flywheel */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">
              增长飞轮
            </h2>
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* 中心 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-sm">Vibe Money</span>
                  </div>
                </div>
                
                {/* 四个节点 */}
                <Link
                  href="/accounts"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <Users className="w-6 h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-xs">身份管理</span>
                  </div>
                </Link>
                
                <Link
                  href="/"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <Sparkles className="w-6 h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-xs">AI创作</span>
                  </div>
                </Link>
                
                <Link
                  href="/automation"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <Bot className="w-6 h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-xs">自动化</span>
                  </div>
                </Link>
                
                <Link
                  href="/delivery"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <ShoppingCart className="w-6 h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-xs">变现</span>
                  </div>
                </Link>

                {/* 连接线 */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                  <circle
                    cx="160"
                    cy="160"
                    r="100"
                    fill="none"
                    stroke="url(#flywheelGradient)"
                    strokeWidth="2"
                    strokeDasharray="10,5"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 160 160"
                      to="360 160 160"
                      dur="20s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <defs>
                    <linearGradient id="flywheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
