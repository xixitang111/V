'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  Target,
  AlignLeft,
  Wand2,
  Bot,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

type Inspiration = {
  topic: string;
  angle: string;
  outline: string;
};

type PersonaOption = {
  id?: string;
  name: string;
};

const FALLBACK_PERSONAS: PersonaOption[] = [
  { name: '副业达人小王' },
  { name: '创业搞钱日记' },
  { name: 'AI思考分享博主' },
  { name: '生活哲学家' },
];

export default function HomePage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<PersonaOption[]>(FALLBACK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState('副业达人小王');
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/personas')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPersonas(data);
          setSelectedPersona(data[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const fetchInspirations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selectedPersona }),
      });
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setInspirations(data.inspirations || []);
      setHasLoaded(true);
    } catch {
      setError('灵感获取失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const goToCreate = (item: Inspiration) => {
    const params = new URLSearchParams({
      from: 'inspiration',
      topic: item.topic,
    });
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-slate-900 border border-indigo-500/30 p-10 mb-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Zap className="w-4 h-4" />
                今日灵感工作台
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                让每一个灵感都有标价
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                选择你的人设，AI 为你精准推荐今日选题方向，一键跳转创作台开始输出。
              </p>
            </div>
          </div>

          {/* 灵感发现工作台 */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">灵感发现工作台</h2>
                <p className="text-sm text-slate-400">基于人设 × 市场趋势，AI 每日精选 3 个高潜力选题</p>
              </div>
            </div>

            {/* 控制栏 */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex-1 min-w-48 relative">
                <label className="text-xs text-slate-400 mb-1.5 block">选择人设</label>
                <div className="relative">
                  <select
                    value={selectedPersona}
                    onChange={e => setSelectedPersona(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {personas.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-5">
                <button
                  onClick={fetchInspirations}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      AI 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {hasLoaded ? '换一批灵感' : '获取今日灵感'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* 加载骨架 */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-700/50 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-3 w-3/4" />
                    <div className="h-3 bg-slate-600 rounded mb-2 w-full" />
                    <div className="h-3 bg-slate-600 rounded mb-4 w-2/3" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-600 rounded w-full" />
                      <div className="h-3 bg-slate-600 rounded w-5/6" />
                      <div className="h-3 bg-slate-600 rounded w-4/5" />
                    </div>
                    <div className="mt-4 h-9 bg-slate-600 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* 灵感卡片 */}
            {!isLoading && inspirations.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inspirations.map((item, i) => (
                    <InspirationCard key={i} item={item} index={i} onSelect={() => goToCreate(item)} />
                  ))}
                </div>
                {/* 下一步引导 */}
                <div className="mt-5 flex items-center justify-center gap-3 py-3 px-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm">
                  <span className="text-indigo-300">✓ 选好选题后点卡片跳转创作台</span>
                  <span className="text-slate-600">·</span>
                  <a href="/" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 transition-colors">
                    或直接前往 AI 创作台输入关键词 →
                  </a>
                </div>
              </>
            )}

            {/* 空状态 */}
            {!isLoading && !hasLoaded && inspirations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-2">选择人设，发现今日高潜力选题</p>
                <p className="text-slate-500 text-sm">AI 将基于市场热点和你的人设风格，精选 3 个选题方向</p>
              </div>
            )}
          </div>
          {/* Features Grid */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-center text-slate-200">完整的商业化解决方案</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: Wand2, title: 'AI 内容创作', desc: '基于人设的智能内容生成，让每一条笔记都有独特风格', color: 'from-purple-500 to-pink-500', href: '/' },
                { icon: Bot, title: 'RPA 自动化', desc: '智能评论回复、同行截流、定时发布，24小时全自动运营', color: 'from-blue-500 to-cyan-500', href: '/automation' },
                { icon: TrendingUp, title: '数据驱动', desc: '全链路数据监控，增长飞轮可视化，让每一个决策都有依据', color: 'from-emerald-500 to-green-500', href: '/dashboard' },
                { icon: DollarSign, title: '商业变现', desc: '人设、内容、流量、转化、交付，完整的商业化闭环', color: 'from-amber-500 to-orange-500', href: '/delivery' },
              ].map((f) => (
                <Link
                  key={f.title}
                  href={f.href}
                  className="group relative overflow-hidden bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-100 group-hover:text-white transition-colors">{f.title}</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors text-sm">{f.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Growth Flywheel */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold mb-8 text-center text-slate-200">增长飞轮</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <div className="text-center">
                    <Sparkles className="w-7 h-7 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-xs">Vibe Money</span>
                  </div>
                </div>
                <Link href="/accounts" className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <div className="text-center"><Users className="w-5 h-5 text-white mx-auto mb-1" /><span className="text-white font-bold text-xs">身份管理</span></div>
                </Link>
                <Link href="/" className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <div className="text-center"><Sparkles className="w-5 h-5 text-white mx-auto mb-1" /><span className="text-white font-bold text-xs">AI创作</span></div>
                </Link>
                <Link href="/automation" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <div className="text-center"><Bot className="w-5 h-5 text-white mx-auto mb-1" /><span className="text-white font-bold text-xs">自动化</span></div>
                </Link>
                <Link href="/delivery" className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <div className="text-center"><ShoppingCart className="w-5 h-5 text-white mx-auto mb-1" /><span className="text-white font-bold text-xs">变现</span></div>
                </Link>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 288">
                  <circle cx="144" cy="144" r="90" fill="none" stroke="url(#flywheelGrad)" strokeWidth="2" strokeDasharray="10,5">
                    <animateTransform attributeName="transform" type="rotate" from="0 144 144" to="360 144 144" dur="20s" repeatCount="indefinite" />
                  </circle>
                  <defs>
                    <linearGradient id="flywheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

function InspirationCard({
  item,
  index,
  onSelect,
}: {
  item: Inspiration;
  index: number;
  onSelect: () => void;
}) {
  const colors = [
    'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30',
    'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  ];
  const dotColors = ['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400'];
  const btnColors = [
    'bg-indigo-600 hover:bg-indigo-500',
    'bg-emerald-600 hover:bg-emerald-500',
    'bg-amber-600 hover:bg-amber-500',
  ];

  const outlineLines = item.outline
    ? item.outline.split(/[\n，,]/).map(s => s.replace(/^[-·•\d.]\s*/, '').trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className={`bg-gradient-to-br ${colors[index % 3]} border rounded-xl p-5 flex flex-col`}>
      <div className="flex items-start gap-2 mb-3">
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColors[index % 3]}`} />
        <h3 className="font-semibold text-slate-100 leading-snug">{item.topic}</h3>
      </div>

      <div className="flex items-start gap-2 mb-3">
        <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300 leading-snug">{item.angle}</p>
      </div>

      {outlineLines.length > 0 && (
        <div className="flex items-start gap-2 mb-4 flex-1">
          <AlignLeft className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <ul className="text-xs text-slate-400 space-y-1">
            {outlineLines.map((line, li) => (
              <li key={li} className="leading-snug">· {line}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onSelect()}
        className={`w-full mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 ${btnColors[index % 3]} text-white text-sm font-medium rounded-lg transition-colors`}
      >
        以此选题去创作
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
