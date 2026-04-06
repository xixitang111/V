'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Settings,
  Play,
  Square,
  Terminal,
  MessageSquare,
  Target,
  Edit3,
  X,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Send,
  Save,
  Trash2,
  RotateCcw,
  User,
  FileText,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getSetting, saveSetting } from '@/lib/settings';

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

// ── 发布队列相关 ──────────────────────────────────────────────────────────────

type QueueStatus = 'awaiting_review' | 'approved' | 'publishing' | 'published' | 'rejected' | 'failed';

type QueueItem = {
  id: string;
  title: string;
  content: string;
  postDescription: string;
  persona: string;
  topic: string;
  createdAt: string;
  updatedAt?: string;
  status: QueueStatus;
};

type QueueTabKey = 'awaiting_review' | 'approved' | 'published' | 'rejected';

const QUEUE_TAB_CONFIG: Record<QueueTabKey, { label: string; icon: React.ElementType; badgeColor: string; emptyText: string }> = {
  awaiting_review: { label: '待审核', icon: Clock,        badgeColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20',   emptyText: '暂无待审核内容，去 AI 创作台生成文章吧' },
  approved:        { label: '已批准', icon: CheckCircle,  badgeColor: 'bg-blue-400/10 text-blue-400 border-blue-400/20',       emptyText: '暂无已批准内容' },
  published:       { label: '已发布', icon: Send,          badgeColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', emptyText: '暂无已发布内容' },
  rejected:        { label: '已拒绝', icon: XCircle,       badgeColor: 'bg-red-400/10 text-red-400 border-red-400/20',         emptyText: '暂无已拒绝内容' },
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

function QueueCard({
  item,
  onStatusChange,
  onContentChange,
  onDelete,
}: {
  item: QueueItem;
  onStatusChange: (id: string, status: QueueStatus) => Promise<void>;
  onContentChange: (id: string, content: string, postDescription: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editPostDesc, setEditPostDesc] = useState(item.postDescription);
  const [loading, setLoading] = useState(false);

  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const cfg = QUEUE_TAB_CONFIG[item.status as QueueTabKey] ?? QUEUE_TAB_CONFIG.awaiting_review;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-100 leading-snug flex-1 text-sm">{item.title || '未命名文章'}</h3>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>{cfg.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-2">
          {item.persona && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.persona}</span>}
          {item.topic && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{item.topic}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.createdAt)}</span>
        </div>
        {item.postDescription && !editing && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 bg-slate-800 rounded-lg px-3 py-2">{item.postDescription}</p>
        )}
      </div>

      {editing && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">长文正文</label>
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={8}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">外发文案</label>
            <textarea value={editPostDesc} onChange={e => setEditPostDesc(e.target.value)} rows={4}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>
      )}

      {expanded && !editing && (
        <div className="border-t border-slate-700 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">📝 长文正文</p>
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">{item.content || '（无正文内容）'}</div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">📢 外发文案</p>
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{item.postDescription || '（无外发文案）'}</div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-700 px-4 py-2.5 flex flex-wrap items-center gap-2">
        {!editing && (
          <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            {expanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {expanded ? '收起' : '查看全文'}
          </button>
        )}
        {item.status !== 'published' && (
          editing ? (
            <>
              <button onClick={() => withLoading(() => onContentChange(item.id, editContent, editPostDesc).then(() => setEditing(false)))}
                disabled={loading} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50">
                <Save className="w-3 h-3" /> 保存
              </button>
              <button onClick={() => { setEditing(false); setEditContent(item.content); setEditPostDesc(item.postDescription); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                <X className="w-3 h-3" /> 取消
              </button>
            </>
          ) : (
            <button onClick={() => { setEditing(true); setExpanded(false); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <Edit3 className="w-3 h-3" /> 编辑
            </button>
          )
        )}
        {(item.status === 'rejected' || item.status === 'awaiting_review') && !editing && (
          <button onClick={() => withLoading(() => onDelete(item.id))} disabled={loading}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> 删除
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {item.status === 'awaiting_review' && !editing && (
            <>
              <button onClick={() => withLoading(() => onStatusChange(item.id, 'rejected'))} disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-all disabled:opacity-50">
                <XCircle className="w-3 h-3" /> 拒绝
              </button>
              <button onClick={() => withLoading(() => onStatusChange(item.id, 'approved'))} disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 font-medium">
                <CheckCircle className="w-3 h-3" /> 批准发布
              </button>
            </>
          )}
          {item.status === 'approved' && !editing && (
            <>
              <button onClick={() => withLoading(() => onStatusChange(item.id, 'awaiting_review'))} disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all disabled:opacity-50">
                <RotateCcw className="w-3 h-3" /> 撤回
              </button>
              <button onClick={() => withLoading(() => onStatusChange(item.id, 'published'))} disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 font-medium">
                <Send className="w-3 h-3" /> 标记已发布
              </button>
            </>
          )}
          {item.status === 'rejected' && !editing && (
            <button onClick={() => withLoading(() => onStatusChange(item.id, 'awaiting_review'))} disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all disabled:opacity-50">
              <RotateCcw className="w-3 h-3" /> 恢复待审核
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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

const DEFAULT_AUTO_PUBLISH: AutoPublishConfig = {
  strategy: 'fixed', dailyLimit: 3, scheduleTimes: ['08:00', '12:00', '18:00'],
  interval: 2, days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
};
const DEFAULT_COMMENT_REPLY: CommentReplyConfig = {
  triggers: ['新评论', '评论中的问题'], replyStrategy: 'smart', guideStrategy: 'dm', frequencyLimit: 30,
};
const DEFAULT_COMPETITOR: CompetitorInterceptConfig = {
  keywords: ['AI', '副业', '搞钱'], targetTypes: ['同领域大V', '快速增长账号'],
  commentStrategy: 'professional', dailyLimit: 15, interval: 5,
};

export default function AutomationPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTaskForConfig, setSelectedTaskForConfig] = useState<Task | null>(null);

  // ── 任务配置（从 Supabase / localStorage 加载）────────────────────────────
  const [autoPublishConfig, setAutoPublishConfig] = useState<AutoPublishConfig>(DEFAULT_AUTO_PUBLISH);
  const [commentReplyConfig, setCommentReplyConfig] = useState<CommentReplyConfig>(DEFAULT_COMMENT_REPLY);
  const [competitorInterceptConfig, setCompetitorInterceptConfig] = useState<CompetitorInterceptConfig>(DEFAULT_COMPETITOR);

  // 异步加载配置（Supabase 优先，localStorage 降级）
  useEffect(() => {
    getSetting('automation_auto_publish', DEFAULT_AUTO_PUBLISH).then(setAutoPublishConfig);
    getSetting('automation_comment_reply', DEFAULT_COMMENT_REPLY).then(setCommentReplyConfig);
    getSetting('automation_competitor_intercept', DEFAULT_COMPETITOR).then(setCompetitorInterceptConfig);
  }, []);

  // ── 发布队列 ────────────────────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueTab, setQueueTab] = useState<QueueTabKey>('awaiting_review');
  const [queueLoading, setQueueLoading] = useState(false);

  const loadQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch {}
    finally { setQueueLoading(false); }
  };

  const handleQueueStatusChange = async (id: string, status: QueueStatus) => {
    const res = await fetch('/api/queue', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setQueue(q => q.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleQueueContentChange = async (id: string, content: string, postDescription: string) => {
    const res = await fetch('/api/queue', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content, postDescription }),
    });
    if (res.ok) setQueue(q => q.map(item => item.id === id ? { ...item, content, postDescription } : item));
  };

  const handleQueueDelete = async (id: string) => {
    const res = await fetch('/api/queue', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setQueue(q => q.filter(item => item.id !== id));
  };

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始加载队列
    loadQueue();

    const fetchQueueCount = async () => {
      try {
        const response = await fetch('/api/queue?action=count');
        if (response.ok) {
          const data = await response.json();
          setTasks(prev => prev.map(t =>
            t.id === 'auto-publish' ? { ...t, queueCount: data.count } : t
          ));
        }
      } catch {}
    };

    fetchQueueCount();
    const interval = setInterval(fetchQueueCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const openConfigModal = (task: Task) => {
    setSelectedTaskForConfig(task);
    // 直接打开弹窗，使用已从 Supabase 加载的状态，不用 task.config 覆盖
    setShowConfigModal(true);
  };

  const saveConfig = () => {
    if (selectedTaskForConfig) {
      let newConfig: AutoPublishConfig | CommentReplyConfig | CompetitorInterceptConfig;
      if (selectedTaskForConfig.id === 'auto-publish') {
        newConfig = autoPublishConfig;
      } else if (selectedTaskForConfig.id === 'comment-reply') {
        newConfig = commentReplyConfig;
      } else {
        newConfig = competitorInterceptConfig;
      }

      setTasks(prev => prev.map(t =>
        t.id === selectedTaskForConfig.id ? { ...t, config: newConfig } : t
      ));

      // 持久化到 Supabase（fallback: localStorage）
      if (selectedTaskForConfig.id === 'auto-publish') {
        saveSetting('automation_auto_publish', autoPublishConfig);
      } else if (selectedTaskForConfig.id === 'comment-reply') {
        saveSetting('automation_comment_reply', commentReplyConfig);
      } else if (selectedTaskForConfig.id === 'competitor-intercept') {
        saveSetting('automation_competitor_intercept', competitorInterceptConfig);
      }
    }
    setShowConfigModal(false);
    setSelectedTaskForConfig(null);
  };

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
        // 用 Supabase 加载的最新配置，而非 task.config 初始默认值
        const liveConfig = taskId === 'auto-publish' ? autoPublishConfig
          : taskId === 'comment-reply' ? commentReplyConfig
          : competitorInterceptConfig;
        const response = await fetch('/api/automation/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, config: liveConfig })
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
      <Sidebar />

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

          {/* 今日发布计划 */}
          {(() => {
            const approvedItems = queue.filter(i => i.status === 'approved');
            const awaitingItems = queue.filter(i => i.status === 'awaiting_review');
            const times = autoPublishConfig.scheduleTimes.sort();
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            const nextTime = times.find(t => {
              const [h, m] = t.split(':').map(Number);
              return h * 60 + m > nowMin;
            });
            return (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">今日发布计划</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        共 {times.length} 个时间槽 · 已批准 <span className="text-blue-400 font-medium">{approvedItems.length}</span> 篇 · 待审核 <span className="text-amber-400 font-medium">{awaitingItems.length}</span> 篇（↓ 在下方队列审核）
                      </p>
                    </div>
                  </div>
                  {nextTime && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">下次计划时间</p>
                      <p className="text-lg font-bold text-purple-400">{nextTime}</p>
                    </div>
                  )}
                </div>

                {/* 时间线 */}
                <div className="space-y-2">
                  {times.map((time, idx) => {
                    const [h, m] = time.split(':').map(Number);
                    const isPast = h * 60 + m < nowMin;
                    const isNext = time === nextTime;
                    const assignedItem = approvedItems[idx];
                    return (
                      <div key={time} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isNext ? 'border-purple-500/50 bg-purple-500/10' :
                        isPast ? 'border-slate-700 opacity-50' : 'border-slate-700 bg-slate-900/50'
                      }`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isNext ? 'bg-purple-400 animate-pulse' : isPast ? 'bg-slate-600' : 'bg-slate-500'
                        }`} />
                        <span className={`text-sm font-mono font-medium w-12 flex-shrink-0 ${isNext ? 'text-purple-400' : 'text-slate-400'}`}>{time}</span>
                        {assignedItem ? (
                          <span className="text-sm text-slate-200 truncate flex-1">📝 {assignedItem.title}</span>
                        ) : awaitingItems.length > 0 ? (
                          <span className="text-xs text-amber-400 flex-1">⚠️ 有待审核文章，请前往队列审核批准</span>
                        ) : (
                          <span className="text-xs text-slate-500 flex-1">暂无文章排期，去 AI 创作台生成内容</span>
                        )}
                        {isNext && <span className="text-xs text-purple-400 font-medium flex-shrink-0">下一个 →</span>}
                        {isPast && <span className="text-xs text-slate-600 flex-shrink-0">已过</span>}
                      </div>
                    );
                  })}
                </div>

                {approvedItems.length === 0 && awaitingItems.length === 0 && (
                  <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3 text-xs text-indigo-300 flex items-center gap-2">
                    <span>💡</span>
                    <span>队列为空——去 <strong>AI 创作台</strong> 生成内容，审核通过后会自动排入计划</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 发布队列看板 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">发布队列</h3>
                  <p className="text-xs text-slate-400 mt-0.5">审核 AI 生成的文章，批准后进入定时发布引擎</p>
                </div>
              </div>
              <button onClick={loadQueue} disabled={queueLoading}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>

            {/* Tab 导航 */}
            <div className="flex gap-1 mb-4 bg-slate-900 rounded-lg p-1">
              {(Object.entries(QUEUE_TAB_CONFIG) as [QueueTabKey, typeof QUEUE_TAB_CONFIG[QueueTabKey]][]).map(([key, cfg]) => {
                const count = queue.filter(i => i.status === key).length;
                const Icon = cfg.icon;
                return (
                  <button key={key} onClick={() => setQueueTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      queueTab === key ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                    }`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        queueTab === key ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 队列内容 */}
            {queueLoading ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />加载中...
              </div>
            ) : (() => {
              const items = queue.filter(i => i.status === queueTab)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              if (items.length === 0) return (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {QUEUE_TAB_CONFIG[queueTab].emptyText}
                </div>
              );
              return (
                <div className="space-y-3">
                  {items.map(item => (
                    <QueueCard key={item.id} item={item}
                      onStatusChange={handleQueueStatusChange}
                      onContentChange={handleQueueContentChange}
                      onDelete={handleQueueDelete} />
                  ))}
                </div>
              );
            })()}
          </div>

          {/* RPA 本地授权 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100">RPA 本地授权</h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">开发中</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">授权后，自动化引擎可操控本地浏览器完成发布、评论等操作</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-sm font-medium text-slate-300">步骤 1：安装本地代理</span>
                </div>
                <p className="text-xs text-slate-500">下载并运行 Vibe Money 桌面端（Mac / Windows），完成本地 WebDriver 环境初始化</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-sm font-medium text-slate-300">步骤 2：扫码登录小红书</span>
                </div>
                <p className="text-xs text-slate-500">桌面端会唤起浏览器，使用手机小红书 App 完成扫码授权，凭证加密保存在本地</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-sm font-medium text-slate-300">步骤 3：启动自动化任务</span>
                </div>
                <p className="text-xs text-slate-500">授权完成后，回到此页面启动上方的任务，引擎将在后台自动运行</p>
              </div>
            </div>

            <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3 text-indigo-300 text-xs flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">💡</span>
              <span>桌面端客户端正在开发中，预计 <strong>Q2 2026</strong> 发布。目前所有自动化任务均在<strong>安全阀模式</strong>下运行（仅模拟，不真实发送）。</span>
            </div>
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
