'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bot,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Home,
  Map,
  X,
  CheckCircle2,
  Hammer,
  ClipboardList,
  Lightbulb,
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
  { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
  { icon: Users, label: '身份管理', href: '/accounts' },
  { icon: Sparkles, label: 'AI创作', href: '/', badge: 'Beta' },
  { icon: Bot, label: '自动化', href: '/automation' },
  { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
];

const ROADMAP = [
  {
    phase: '已上线',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    dot: 'bg-emerald-400',
    items: [
      'AI 创作台（4步生成流程）',
      '内容审核队列',
      '身份 & 人设管理',
      '变现设置',
      '灵感发现工作台',
    ],
  },
  {
    phase: '开发中 · Q2 2026',
    icon: Hammer,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    dot: 'bg-amber-400',
    items: [
      'Stagehand AI 自动发布',
      '智能评论自动回复',
      '数据大屏真实接入',
    ],
  },
  {
    phase: '规划中 · Q3 2026',
    icon: ClipboardList,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    dot: 'bg-blue-400',
    items: [
      'AI 截流评论（同行引流）',
      '多账号矩阵协同',
      '视频脚本生成',
    ],
  },
  {
    phase: '探索中',
    icon: Lightbulb,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    dot: 'bg-purple-400',
    items: [
      '直播话术 AI 助手',
      '私域转化智能助手',
      '跨平台内容分发',
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Vibe Money
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.highlight
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-amber-300' : ''}`}
                />
                {isOpen && (
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${item.highlight ? 'text-amber-100' : ''}`}>
                      {item.label}
                    </span>
                    {item.highlight && (
                      <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-xs rounded-full">
                        ✨
                      </span>
                    )}
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Roadmap button */}
        <button
          onClick={() => setShowRoadmap(true)}
          className={`mx-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-all ${
            !isOpen ? 'justify-center' : ''
          }`}
        >
          <Map className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">产品路线图</span>}
        </button>

        {/* Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 border-t border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>

      {/* Roadmap Modal */}
      {showRoadmap && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">产品路线图</h2>
                  <p className="text-xs text-slate-400">Vibe Money · Product Roadmap</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoadmap(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-5">
              {ROADMAP.map((section) => (
                <div
                  key={section.phase}
                  className={`border rounded-xl p-5 ${section.bg}`}
                >
                  <div className={`flex items-center gap-2 mb-3 ${section.color}`}>
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{section.phase}</span>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${section.dot}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <p className="text-center text-xs text-slate-500 pt-2">
                路线图会根据用户反馈持续调整 · 感谢每一位早期用户的陪伴 🙏
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
