'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bot,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Settings,
  Play,
  Square,
  Terminal,
  MessageSquare,
  Target,
  Edit3,
  X,
  Clock,
  Home
} from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
};

type Task = {
  id: string;
  name: string;
  description: string;
  icon: any;
  isRunning: boolean;
  config: any;
  priority?: boolean;
  queueCount?: number;
};

type AutoPublishConfig = {
  strategy: 'fixed' | 'optimal' | 'random';
  dailyLimit: number;
  scheduleTimes: string[];
  interval: number;
  days: string[];
};

type CommentReplyConfig = {
  triggers: string[];
  replyStrategy: 'immediate' | 'delayed' | 'smart';
  guideStrategy: 'dm' | 'store' | 'link' | 'none';
  frequencyLimit: number;
};

type CompetitorInterceptConfig = {
  keywords: string[];
  targetTypes: string[];
  commentStrategy: 'professional' | 'friendly' | 'value' | 'humorous';
  dailyLimit: number;
  interval: number;
};

const initialTasks: Task[] = [
  {
    id: 'auto-publish',
    name: '笔记定时发布引擎',
    description: '读取 AI 创作台的待发布队列，按照设定的时间表，全自动排版发布小红书纯长文',
    icon: Edit3,
    isRunning: false,
    priority: true,
    queueCount: 0,
    config: {
      strategy: 'fixed',
      dailyLimit: 3,
      scheduleTimes: ['08:00', '12:00', '18:00'],
      interval: 2,
      days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    }
  },
  {
    id: 'comment-reply',
    name: '智能评论回复',
    description: '监控自己笔记的新评论，调用 LLM 识别意图，自动回复并引导私信/看店铺',
    icon: MessageSquare,
    isRunning: false,
    config: {
      triggers: ['新评论', '评论中的问题'],
      replyStrategy: 'smart',
      guideStrategy: 'dm',
      frequencyLimit: 30
    }
  },
  {
    id: 'competitor-intercept',
    name: '同行笔记评论',
    description: '根据设定关键词搜索同行爆款，在最新评论区自动进行友善的专业回复',
    icon: Target,
    isRunning: false,
    config: {
      keywords: ['AI', '副业', '搞钱'],
      targetTypes: ['同领域大V', '快速增长账号'],
      commentStrategy: 'professional',
      dailyLimit: 15,
      interval: 5
    }
  }
];

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TIME_SLOTS = ['07:00', '08:00', '09:00', '12:00', '14:00', '18:00', '20:00', '22:00'];
const DEFAULT_KEYWORDS = ['AI', '副业', '搞钱', '小红书运营', '自媒体', '创业'];

export default function AutomationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTaskForConfig, setSelectedTaskForConfig] = useState<Task | null>(null);
  
  const [autoPublishConfig, setAutoPublishConfig] = useState<AutoPublishConfig>({
    strategy: 'fixed',
    dailyLimit: 3,
    scheduleTimes: ['08:00', '12:00', '18:00'],
    interval: 2,
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  });
  
  const [commentReplyConfig, setCommentReplyConfig] = useState<CommentReplyConfig>({
    triggers: ['新评论', '评论中的问题'],
    replyStrategy: 'smart',
    guideStrategy: 'dm',
    frequencyLimit: 30
  });
  
  const [competitorInterceptConfig, setCompetitorInterceptConfig] = useState<CompetitorInterceptConfig>({
    keywords: ['AI', '副业', '搞钱'],
    targetTypes: ['同领域大V', '快速增长账号'],
    commentStrategy: 'professional',
    dailyLimit: 15,
    interval: 5
  });
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQueueCount = async () => {
      try {
        const response = await fetch('/api/queue?action=count');
        if (response.ok) {
          const data = await response.json();
          setTasks(prev => prev.map(t => 
            t.id === 'auto-publish' ? { ...t, queueCount: data.count } : t
          ));
        }
      } catch (error) {
        console.error('获取队列数量失败:', error);
      }
    };

    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const openConfigModal = (task: Task) => {
    setSelectedTaskForConfig(task);
    if (task.id === 'auto-publish') {
      setAutoPublishConfig(task.config as AutoPublishConfig);
    } else if (task.id === 'comment-reply') {
      setCommentReplyConfig(task.config as CommentReplyConfig);
    } else if (task.id === 'competitor-intercept') {
      setCompetitorInterceptConfig(task.config as CompetitorInterceptConfig);
    }
    setShowConfigModal(true);
  };

  const saveConfig = () => {
    if (selectedTaskForConfig) {
      let newConfig;
      if (selectedTaskForConfig.id === 'auto-publish') {
        newConfig = autoPublishConfig;
      } else if (selectedTaskForConfig.id === 'comment-reply') {
        newConfig = commentReplyConfig;
      } else if (selectedTaskForConfig.id === 'competitor-intercept') {
        newConfig = competitorInterceptConfig;
      }
      
      setTasks(prev => prev.map(t => 
        t.id === selectedTaskForConfig.id 
          ? { ...t, config: newConfig }
          : t
      ));
    }
    setShowConfigModal(false);
    setSelectedTaskForConfig(null);
  };

  const menuItems = [
    { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
    { icon: Users, label: '身份管理', href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', href: '/' },
    { icon: Bot, label: '自动化', active: true, href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
  ];

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const runningTasks = tasks.filter(t => t.isRunning);
    if (runningTasks.length > 0) {
      interval = setInterval(async () => {
        for (const task of runningTasks) {
          try {
            const response = await fetch(`/api/automation/logs?taskId=${task.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.logs) {
                const newLogs = data.logs.map((log: any) => ({
                  id: `${task.id}-${log.timestamp}`,
                  timestamp: log.timestamp,
                  type: log.type as any,
                  message: log.message
                }));
                setLogs(prev => {
                  const existingIds = new Set(prev.map(l => l.id));
                  const filteredNewLogs = newLogs.filter((l: any) => !existingIds.has(l.id));
                  return [...prev, ...filteredNewLogs].slice(-100);
                });
              }
            }
          } catch (error) {
            console.error('获取日志失败:', error);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tasks]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('zh-CN', { hour12: false });
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp,
      type,
      message
    };
    setLogs(prev => [...prev, newLog].slice(-100));
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newIsRunning = !task.isRunning;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, isRunning: newIsRunning } : t
    ));

    if (newIsRunning) {
      addLog('info', `🚀 启动任务: ${task.name}`);
      
      try {
        const response = await fetch('/api/automation/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, config: task.config })
        });

        if (response.ok) {
          addLog('success', `✅ 任务 ${task.name} 已启动`);
        } else {
          throw new Error('启动失败');
        }
      } catch (error) {
        addLog('error', `❌ 任务 ${task.name} 启动失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, isRunning: false } : t
        ));
      }
    } else {
      addLog('info', `🛑 停止任务: ${task.name}`);
      
      try {
        const response = await fetch('/api/automation/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        });

        if (response.ok) {
          addLog('success', `✅ 任务 ${task.name} 已停止`);
        } else {
          throw new Error('停止失败');
        }
      } catch (error) {
        addLog('error', `❌ 任务 ${task.name} 停止失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-slate-300';
    }
  };

  const toggleTimeSlot = (time: string) => {
    setAutoPublishConfig(prev => ({
      ...prev,
      scheduleTimes: prev.scheduleTimes.includes(time)
        ? prev.scheduleTimes.filter(t => t !== time)
        : [...prev.scheduleTimes, time]
    }));
  };

  const toggleDay = (day: string) => {
    setAutoPublishConfig(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const toggleCommentTrigger = (trigger: string) => {
    setCommentReplyConfig(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const toggleKeyword = (keyword: string) => {
    setCompetitorInterceptConfig(prev => ({
      ...prev,
      keywords: prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : [...prev.keywords, keyword]
    }));
  };

  const toggleTargetType = (type: string) => {
    setCompetitorInterceptConfig(prev => ({
      ...prev,
      targetTypes: prev.targetTypes.includes(type)
        ? prev.targetTypes.filter(t => t !== type)
        : [...prev.targetTypes, type]
    }));
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
                  {item.label === 'AI创作台' && (
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
        <div className="p-8 max-w-7xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1.5 shadow-md">
            🚧 测试开发中
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Bot className="w-6 h-6 text-indigo-400" />
              <span>Automation Hub</span>
              <span className="text-slate-400 font-normal">自动化</span>
            </h1>
            <p className="text-slate-400 text-sm">智能互动 · 自动发布 · 流量截流 · RPA · Auto-Reply</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`bg-slate-800 rounded-xl border ${
                    task.isRunning ? 'border-green-500/50' : 'border-slate-700'
                  } p-6 shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        task.isRunning 
                          ? 'bg-green-500/20 text-green-400' 
                          : task.priority
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-100">{task.name}</h3>
                          {task.priority && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                              优先级
                            </span>
                          )}
                          {task.queueCount !== undefined && task.queueCount > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                              待发布: {task.queueCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.isRunning && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400">运行中</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openConfigModal(task)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>配置规则</span>
                    </button>
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        task.isRunning
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : task.priority
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      {task.isRunning ? (
                        <>
                          <Square className="w-4 h-4" />
                          <span>停止</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>启动</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-300">执行日志终端</h3>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                清空日志
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-8">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>等待任务启动...</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="mb-1">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className={`ml-2 ${getLogColor(log.type)}`}>{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </main>

      {showConfigModal && selectedTaskForConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-100">配置规则</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {selectedTaskForConfig.id === 'auto-publish' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      发布策略
                    </label>
                    <select 
                      value={autoPublishConfig.strategy}
                      onChange={(e) => setAutoPublishConfig(prev => ({ 
                        ...prev, 
                        strategy: e.target.value as any 
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="fixed">固定时间发布</option>
                      <option value="optimal">最优时间发布（基于历史数据）</option>
                      <option value="random">随机时间发布（防风控）</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      每日发布限制
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={autoPublishConfig.dailyLimit}
                        onChange={(e) => setAutoPublishConfig(prev => ({ 
                          ...prev, 
                          dailyLimit: parseInt(e.target.value) 
                        }))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">篇/天</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      发布时间表
                    </label>
                    <div className="space-y-2">
                      {TIME_SLOTS.map((time) => (
                        <label key={time} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={autoPublishConfig.scheduleTimes.includes(time)}
                            onChange={() => toggleTimeSlot(time)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      发布间隔
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="24" 
                        value={autoPublishConfig.interval}
                        onChange={(e) => setAutoPublishConfig(prev => ({ 
                          ...prev, 
                          interval: parseInt(e.target.value) 
                        }))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">小时</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      工作日/周末设置
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day) => (
                        <label key={day} className="flex flex-col items-center gap-1 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={autoPublishConfig.days.includes(day)}
                            onChange={() => toggleDay(day)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-300 text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTaskForConfig.id === 'comment-reply' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      回复触发条件
                    </label>
                    <div className="space-y-2">
                      {['新评论', '评论中的问题', '评论中的负面内容'].map((trigger) => (
                        <label key={trigger} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={commentReplyConfig.triggers.includes(trigger)}
                            onChange={() => toggleCommentTrigger(trigger)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-300">{trigger}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      回复策略
                    </label>
                    <select 
                      value={commentReplyConfig.replyStrategy}
                      onChange={(e) => setCommentReplyConfig(prev => ({ 
                        ...prev, 
                        replyStrategy: e.target.value as any 
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="immediate">立即回复</option>
                      <option value="delayed">延迟回复（3-5分钟）</option>
                      <option value="smart">智能回复（基于评论内容）</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      引导策略
                    </label>
                    <select 
                      value={commentReplyConfig.guideStrategy}
                      onChange={(e) => setCommentReplyConfig(prev => ({ 
                        ...prev, 
                        guideStrategy: e.target.value as any 
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dm">引导私信</option>
                      <option value="store">引导店铺</option>
                      <option value="link">引导外部链接</option>
                      <option value="none">纯内容回复</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      回复频率限制
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={commentReplyConfig.frequencyLimit}
                        onChange={(e) => setCommentReplyConfig(prev => ({ 
                          ...prev, 
                          frequencyLimit: parseInt(e.target.value) 
                        }))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">条/小时</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTaskForConfig.id === 'competitor-intercept' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      目标关键词
                    </label>
                    <div className="space-y-2">
                      {DEFAULT_KEYWORDS.map((keyword) => (
                        <label key={keyword} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={competitorInterceptConfig.keywords.includes(keyword)}
                            onChange={() => toggleKeyword(keyword)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-300">{keyword}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input type="text" placeholder="添加新关键词" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      目标账号类型
                    </label>
                    <div className="space-y-2">
                      {['同领域大V', '快速增长账号', '所有相关账号'].map((type) => (
                        <label key={type} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={competitorInterceptConfig.targetTypes.includes(type)}
                            onChange={() => toggleTargetType(type)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      评论策略
                    </label>
                    <select 
                      value={competitorInterceptConfig.commentStrategy}
                      onChange={(e) => setCompetitorInterceptConfig(prev => ({ 
                        ...prev, 
                        commentStrategy: e.target.value as any 
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="professional">专业回答</option>
                      <option value="friendly">友好交流</option>
                      <option value="value">提供价值</option>
                      <option value="humorous">幽默互动</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      每日评论上限
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="50" 
                        value={competitorInterceptConfig.dailyLimit}
                        onChange={(e) => setCompetitorInterceptConfig(prev => ({ 
                          ...prev, 
                          dailyLimit: parseInt(e.target.value) 
                        }))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">条/天</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      评论间隔
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="60" 
                        value={competitorInterceptConfig.interval}
                        onChange={(e) => setCompetitorInterceptConfig(prev => ({ 
                          ...prev, 
                          interval: parseInt(e.target.value) 
                        }))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">分钟</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!['auto-publish', 'comment-reply', 'competitor-intercept'].includes(selectedTaskForConfig.id) && (
                <div className="text-center py-8 text-slate-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>配置功能开发中...</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveConfig}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
