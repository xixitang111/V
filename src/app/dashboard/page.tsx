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
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Heart,
  Bookmark,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  DollarSign,
  Home
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Scatter,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

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
  {
    id: 1,
    title: '2026年AI副业新趋势，普通人如何月入过万',
    likes: 12500,
    favorites: 8900,
    comments: 450
  },
  {
    id: 2,
    title: '小红书爆款笔记标题公式，看完直接套用',
    likes: 9800,
    favorites: 7200,
    comments: 320
  },
  {
    id: 3,
    title: '新手做自媒体第一个月涨粉10000的秘密',
    likes: 8500,
    favorites: 6100,
    comments: 280
  }
];

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', active: true, href: '/dashboard' },
    { icon: Users, label: '身份管理', href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', href: '/' },
    { icon: Bot, label: '自动化', href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
  ];

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
        <div className="p-6 max-w-7xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1 rounded-bl-lg border-l border-b border-amber-500/30">
            🚧 测试开发中
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              <span>Dashboard</span>
              <span className="text-slate-400 font-normal">数据中心</span>
            </h1>
            <p className="text-slate-400 text-sm">获客 · 转化 · 交付 · 全链路业务监控 · Acquisition · Conversion · Delivery</p>
          </div>

          {/* 第一行：三角形 + 漏斗 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {/* 商业化闭环三角形（填满区域） */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30 p-4 shadow-xl h-full">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-white">Growth Flywheel</h2>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">增长飞轮</span>
                </div>
                
                <div className="relative flex items-center justify-center h-full py-2">
                  {/* 等边三角形主体 */}
                  <div className="relative w-full max-w-xs">
                    <svg viewBox="0 0 300 260" className="w-full">
                      {/* 等边三角形边框 */}
                      <polygon
                        points="150,20 30,225 270,225"
                        fill="none"
                        stroke="url(#triangleGradient)"
                        strokeWidth="2"
                      />
                      <defs>
                        <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                      
                      {/* 循环箭头 */}
                      <path
                        d="M 150 40 Q 230 100 250 200 Q 150 160 50 200 Q 70 100 150 40"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                        opacity="0.6"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 150 130"
                          to="360 150 130"
                          dur="20s"
                          repeatCount="indefinite"
                        />
                      </path>
                      
                      {/* 中心文字 */}
                      <text x="150" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#a855f7">
                        商业化闭环
                      </text>
                      
                      {/* 顶部：获客 */}
                      <g transform="translate(150, 20)">
                        <foreignObject x="-55" y="-5" width="110" height="50">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-white" />
                              <div>
                                <p className="font-bold text-white text-xs">获客</p>
                                <p className="text-[10px] text-white/80">曝光 28.9K</p>
                              </div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                      
                      {/* 左下：交付 */}
                      <g transform="translate(30, 225)">
                        <foreignObject x="-5" y="-30" width="110" height="50">
                          <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-white" />
                              <div>
                                <p className="font-bold text-white text-xs">交付</p>
                                <p className="text-[10px] text-white/80">¥28.6K</p>
                              </div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                      
                      {/* 右下：转化 */}
                      <g transform="translate(270, 225)">
                        <foreignObject x="-105" y="-30" width="110" height="50">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-white" />
                              <div>
                                <p className="font-bold text-white text-xs">转化</p>
                                <p className="text-[10px] text-white/80">引流 892</p>
                              </div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 业务漏斗（紧凑版） */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Conversion Funnel</h2>
                  <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">转化漏斗</span>
                </div>
                
                <div className="flex flex-col items-center space-y-1">
                  {/* 获客阶段 */}
                  <div className="w-full">
                    <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">获客</h3>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">笔记</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">156</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +8
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">曝光</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">2.4M</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +18%
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">互动</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">128K</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +15%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 大箭头 */}
                  <div className="py-1">
                    <ArrowDown className="w-6 h-6 text-indigo-400" />
                  </div>

                  {/* 转化阶段 */}
                  <div className="w-4/5">
                    <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">转化</h3>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">评论</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">452</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +22%
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">私信</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">892</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +24%
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">转化率</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">12.5%</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +2.1%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 大箭头 */}
                  <div className="py-1">
                    <ArrowDown className="w-6 h-6 text-emerald-400" />
                  </div>

                  {/* 交付阶段 */}
                  <div className="w-3/5">
                    <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">交付</h3>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">销量</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">328</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +35%
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">营收</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">¥28.6K</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +42%
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 mb-0.5">客单价</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-white">¥87.3</p>
                            <span className="text-[10px] text-green-400 flex items-center mb-0.5">
                              <ArrowUp className="w-3 h-3" /> +5.2%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 第二行：超级组合图表 */}
          <div className="mb-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Performance Overview</h2>
                  <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">数据概览</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium">7天</button>
                  <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-medium hover:bg-slate-600 transition-colors">30天</button>
                  <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-medium hover:bg-slate-600 transition-colors">90天</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* 主图表 */}
                <div className="lg:col-span-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockTrendData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#a855f7"
                        tick={{ fill: '#a855f7', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px' }} iconSize={8} />
                      
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="views"
                        name="曝光量"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                      
                      <Bar
                        yAxisId="left"
                        dataKey="posts"
                        name="发布笔记"
                        fill="#8b5cf6"
                        radius={[3, 3, 0, 0]}
                        barSize={20}
                      />
                      
                      <Bar
                        yAxisId="left"
                        dataKey="sales"
                        name="商品销量"
                        fill="#22c55e"
                        radius={[3, 3, 0, 0]}
                        barSize={20}
                      />
                      
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="营收"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#f59e0b' }}
                      />
                      
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversion"
                        name="转化率(%)"
                        stroke="#a855f7"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ r: 2, fill: '#a855f7' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* 雷达图 */}
                <div className="lg:col-span-1 bg-slate-900/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-300 mb-2">交付健康度</h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={mockRadarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="健康度"
                          dataKey="A"
                          stroke="#22c55e"
                          fill="#22c55e"
                          fillOpacity={0.5}
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 第三行：AI爆款 + RPA任务 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* AI 爆款 Top 3 */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Top Content</h2>
                <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">爆款笔记</span>
              </div>
              <div className="space-y-3">
                {mockTopPosts.map((post, index) => (
                  <div key={post.id} className="group">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        <h3 className="text-slate-200 text-xs font-medium line-clamp-2 group-hover:text-slate-100 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-7 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        {post.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-yellow-400" />
                        {post.favorites.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        {post.comments.toLocaleString()}
                      </span>
                    </div>
                    {index < mockTopPosts.length - 1 && (
                      <div className="border-b border-slate-700 mt-3"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RPA 任务与账号健康度 */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-green-400" />
                  <h2 className="text-sm font-bold text-white">Automation</h2>
                  <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">自动化</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-200 text-xs font-medium">账号 [Vibe Money]</p>
                      <p className="text-green-400 text-[10px]">在线 · 凭证有效</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-200 text-xs font-medium">今日执行 12 次截流</p>
                      <p className="text-slate-400 text-[10px]">引导 8 次私信咨询</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-200 text-xs font-medium">智能回复运行中</p>
                      <p className="text-slate-400 text-[10px]">已回复 42 条新评论</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-slate-200 text-xs font-medium">定时发布待命</p>
                      <p className="text-slate-400 text-[10px]">待发布队列: 3 篇</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
