'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Eye,
  MessageSquare,
  Heart,
  Bookmark,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Sparkles,
  Clock,
  XCircle,
  Send,
  RefreshCw,
  FileText,
  AlertCircle,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import Sidebar from '@/components/Sidebar';

// ── Mock 数据 ─────────────────────────────────────────────────────────────────

const mockTrendData = [
  { date: '03-18', views: 12500, interactions: 890, posts: 8, sales: 12, revenue: 3500, conversion: 12.5 },
  { date: '03-19', views: 15800, interactions: 1200, posts: 10, sales: 15, revenue: 4200, conversion: 13.2 },
  { date: '03-20', views: 14200, interactions: 980, posts: 7, sales: 11, revenue: 3800, conversion: 11.8 },
  { date: '03-21', views: 18500, interactions: 1450, posts: 12, sales: 18, revenue: 5100, conversion: 14.1 },
  { date: '03-22', views: 22100, interactions: 1890, posts: 14, sales: 22, revenue: 6200, conversion: 15.5 },
  { date: '03-23', views: 25600, interactions: 2150, posts: 11, sales: 19, revenue: 5800, conversion: 14.8 },
  { date: '03-24', views: 28900, interactions: 2480, posts: 15, sales: 25, revenue: 7200, conversion: 16.2 },
];

const mockRadarData = [
  { subject: '销量', A: 85, fullMark: 100 },
  { subject: '营收', A: 90, fullMark: 100 },
  { subject: '复购', A: 75, fullMark: 100 },
  { subject: '客单价', A: 80, fullMark: 100 },
  { subject: '满意度', A: 95, fullMark: 100 },
];

const mockTopPosts = [
  { id: 1, title: '2026年AI副业新趋势，普通人如何月入过万', likes: 12500, favorites: 8900, comments: 450 },
  { id: 2, title: '小红书爆款笔记标题公式，看完直接套用', likes: 9800, favorites: 7200, comments: 320 },
  { id: 3, title: '新手做自媒体第一个月涨粉10000的秘密', likes: 8500, favorites: 6100, comments: 280 },
];

// ── 队列项简化类型（仅读取，不在此操作）────────────────────────────────────────
type QueueStatus = 'awaiting_review' | 'approved' | 'publishing' | 'published' | 'rejected' | 'failed';

type QueueItem = {
  id: string;
  title: string;
  persona: string;
  topic: string;
  createdAt: string;
  status: QueueStatus;
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

// ── 模拟数据提示徽章 ─────────────────────────────────────────────────────────
function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-medium rounded border border-amber-500/25">
      <FlaskConical className="w-2.5 h-2.5" />
      模拟数据
    </span>
  );
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch (e) {
      console.error('加载队列失败:', e);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const counts = {
    awaiting_review: queue.filter(i => i.status === 'awaiting_review').length,
    approved:        queue.filter(i => i.status === 'approved').length,
    published:       queue.filter(i => i.status === 'published').length,
    rejected:        queue.filter(i => i.status === 'rejected').length,
  };

  // 最近3条待审核
  const recentPending = queue
    .filter(i => i.status === 'awaiting_review')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
          <p className="text-slate-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1 rounded-bl-lg border-l border-b border-amber-500/30">
            🚧 测试开发中
          </div>

          <div className="mb-5">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              <span>Dashboard</span>
              <span className="text-slate-400 font-normal">数据中心</span>
            </h1>
            <p className="text-slate-400 text-sm">获客 · 转化 · 交付 · 全链路业务监控 · Acquisition · Conversion · Delivery</p>
          </div>

          {/* ── DEMO 数据提示横幅 ── */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 mb-6 text-sm">
            <FlaskConical className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-300 font-medium">数据中心目前展示的是模拟演示数据</span>
              <span className="text-amber-400/70 ml-2 text-xs">真实数据采集需接入小红书数据接口，计划在 RPA 桌面端（Q2 2026）上线后同步支持。</span>
              <span className="text-slate-400 ml-2 text-xs">下方内容控制台为真实队列数据 ✓</span>
            </div>
          </div>

          {/* ── 第一行：三角形 + 漏斗 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30 p-4 shadow-xl h-full">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-white">Growth Flywheel</h2>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">增长飞轮</span>
                  <DemoBadge />
                </div>
                <div className="relative flex items-center justify-center h-full py-2">
                  <div className="relative w-full max-w-xs">
                    <svg viewBox="0 0 300 260" className="w-full">
                      <polygon points="150,20 30,225 270,225" fill="none" stroke="url(#triangleGradient)" strokeWidth="2" />
                      <defs>
                        <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                      <path d="M 150 40 Q 230 100 250 200 Q 150 160 50 200 Q 70 100 150 40"
                        fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate"
                          from="0 150 130" to="360 150 130" dur="20s" repeatCount="indefinite" />
                      </path>
                      <text x="150" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#a855f7">商业化闭环</text>
                      <g transform="translate(150, 20)">
                        <foreignObject x="-55" y="-5" width="110" height="50">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-white" />
                              <div><p className="font-bold text-white text-xs">获客</p><p className="text-[10px] text-white/80">曝光 28.9K</p></div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                      <g transform="translate(30, 225)">
                        <foreignObject x="-5" y="-30" width="110" height="50">
                          <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-white" />
                              <div><p className="font-bold text-white text-xs">交付</p><p className="text-[10px] text-white/80">¥28.6K</p></div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                      <g transform="translate(270, 225)">
                        <foreignObject x="-105" y="-30" width="110" height="50">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-white" />
                              <div><p className="font-bold text-white text-xs">转化</p><p className="text-[10px] text-white/80">引流 892</p></div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Conversion Funnel</h2>
                  <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">转化漏斗</span>
                  <DemoBadge />
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-full">
                    <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-white">获客</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['笔记','156','+8'],['曝光','2.4M','+18%'],['互动','128K','+15%']].map(([label, val, diff]) => (
                          <div key={label} className="bg-slate-900/50 rounded-lg p-2">
                            <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                            <div className="flex items-end gap-1">
                              <p className="text-lg font-bold text-white">{val}</p>
                              <span className="text-[10px] text-green-400 flex items-center mb-0.5"><ArrowUp className="w-3 h-3" />{diff}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="py-1"><ArrowDown className="w-6 h-6 text-indigo-400" /></div>
                  <div className="w-4/5">
                    <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-white">转化</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['评论','452','+22%'],['私信','892','+24%'],['转化率','12.5%','+2.1%']].map(([label, val, diff]) => (
                          <div key={label} className="bg-slate-900/50 rounded-lg p-2">
                            <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                            <div className="flex items-end gap-1">
                              <p className="text-sm font-bold text-white">{val}</p>
                              <span className="text-[10px] text-green-400 flex items-center mb-0.5"><ArrowUp className="w-3 h-3" />{diff}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="py-1"><ArrowDown className="w-6 h-6 text-indigo-400" /></div>
                  <div className="w-3/5">
                    <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-white">交付</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['订单','98','+18%'],['营收','¥28.6K','+22%'],['客单价','¥292','+4%']].map(([label, val, diff]) => (
                          <div key={label} className="bg-slate-900/50 rounded-lg p-2">
                            <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                            <div className="flex items-end gap-1">
                              <p className="text-sm font-bold text-white">{val}</p>
                              <span className="text-[10px] text-green-400 flex items-center mb-0.5"><ArrowUp className="w-3 h-3" />{diff}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 第二行：趋势图 ── */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Trend Analysis</h2>
              <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">趋势分析</span>
              <DemoBadge />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTrendData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#a855f7" tick={{ fill: '#a855f7', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} iconSize={8} />
                    <Area yAxisId="left" type="monotone" dataKey="views" name="曝光量" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorViews)" />
                    <Bar yAxisId="left" dataKey="posts" name="发布笔记" fill="#8b5cf6" radius={[3,3,0,0]} barSize={20} />
                    <Bar yAxisId="left" dataKey="sales" name="商品销量" fill="#22c55e" radius={[3,3,0,0]} barSize={20} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="营收" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                    <Line yAxisId="right" type="monotone" dataKey="conversion" name="转化率(%)" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2, fill: '#a855f7' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-1 bg-slate-900/50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-slate-300 mb-2">交付健康度</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={mockRadarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="健康度" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── 第三行：爆款笔记 + 自动化状态 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Top Content</h2>
                <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">爆款笔记</span>
                <DemoBadge />
              </div>
              <div className="space-y-3">
                {mockTopPosts.map((post, index) => (
                  <div key={post.id} className="group">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <h3 className="text-slate-200 text-xs font-medium line-clamp-2 group-hover:text-slate-100 transition-colors">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 ml-7 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{post.likes.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3 h-3 text-yellow-400" />{post.favorites.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-blue-400" />{post.comments.toLocaleString()}</span>
                    </div>
                    {index < mockTopPosts.length - 1 && <div className="border-b border-slate-700 mt-3" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 自动化状态 —— 尽量用真实队列数据 */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-bold text-white">Automation</h2>
                <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">自动化</span>
              </div>
              <div className="space-y-3">
                {/* 真实数据 */}
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-xs font-medium">待审核内容</p>
                    <p className="text-amber-400 text-[10px]">
                      {queueLoading ? '加载中...' : `${counts.awaiting_review} 篇待审核 · ${counts.approved} 篇已批准`}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">实时</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                  <Send className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-xs font-medium">已发布笔记</p>
                    <p className="text-slate-400 text-[10px]">
                      {queueLoading ? '加载中...' : `${counts.published} 篇已发布`}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">实时</span>
                </div>
                {/* 模拟数据 */}
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-xs font-medium">今日截流互动</p>
                    <p className="text-slate-400 text-[10px]">引导 8 次私信咨询</p>
                  </div>
                  <DemoBadge />
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-xs font-medium">智能评论回复</p>
                    <p className="text-slate-400 text-[10px]">已回复 42 条新评论</p>
                  </div>
                  <DemoBadge />
                </div>
              </div>
            </div>
          </div>

          {/* ══ 内容队列概览（真实数据，操作跳转自动化模块）══════════════════════ */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  内容队列概览
                  <span className="text-slate-400 font-normal text-base">Content Queue</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 font-normal">真实数据</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">展示各阶段内容数量 · 详细审核请前往自动化模块操作</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadQueue} disabled={queueLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin' : ''}`} />
                  刷新
                </button>
                <a href="/automation"
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  前往审核 →
                </a>
              </div>
            </div>

            {/* 4 个状态计数卡片 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {([
                { key: 'awaiting_review', label: '待审核', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
                { key: 'approved',        label: '已批准', icon: CheckCircle,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
                { key: 'published',       label: '已发布', icon: Send,          color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                { key: 'rejected',        label: '已拒绝', icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
              ] as const).map(({ key, label, icon: Icon, color, bg, border }) => (
                <div key={key} className={`p-4 rounded-xl border ${bg} ${border}`}>
                  <div className={`flex items-center gap-2 mb-1 ${color}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{counts[key as keyof typeof counts]}</p>
                </div>
              ))}
            </div>

            {/* 最近待审核内容（仅预览，不可操作）*/}
            {queueLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-400 text-sm">加载中...</span>
              </div>
            ) : recentPending.length > 0 ? (
              <div>
                <p className="text-xs text-slate-500 mb-3">最近待审核（共 {counts.awaiting_review} 篇）：</p>
                <div className="space-y-2">
                  {recentPending.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                      <p className="text-sm text-slate-200 font-medium flex-1 truncate">{item.title || '未命名文章'}</p>
                      {item.persona && <span className="text-xs text-slate-500 hidden sm:block">{item.persona}</span>}
                      <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <a href="/automation"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                    前往自动化模块审核全部 {counts.awaiting_review} 篇内容
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">暂无待审核内容</p>
                <a href="/" className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  前往 AI 创作台生成内容 →
                </a>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
