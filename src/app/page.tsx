'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bot,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Save,
  Send,
  Edit3,
  TrendingUp,
  Clock,
  Copy,
  Plus
} from 'lucide-react';

type HotTopic = {
  id: number;
  title: string;
  heat: number;
  time: string;
  likes?: string;
};

type Inspiration = {
  id: number;
  topic: string;
  angle: string;
  outline: string;
};

type Account = {
  id: number;
  name: string;
};

type Persona = {
  id: number;
  name: string;
};

const mockHotTopics: HotTopic[] = [
  { id: 1, title: '2024年副业新趋势，普通人如何月入过万', heat: 9800, time: '2小时前' },
  { id: 2, title: '小红书爆款笔记标题公式，看完直接套用', heat: 7500, time: '4小时前' },
  { id: 3, title: '新手做自媒体第一个月涨粉10000的秘密', heat: 6200, time: '6小时前' },
  { id: 4, title: '在家做的5个轻创业项目，0成本启动', heat: 5800, time: '8小时前' },
  { id: 5, title: '如何用AI工具高效创作内容，解放双手', heat: 4900, time: '12小时前' },
];

const mockAccounts: Account[] = [
  { id: 1, name: '职场搞钱日记' },
  { id: 2, name: '副业达人小王' },
];

const mockPersonas: Persona[] = [
  { id: 1, name: 'AI观点分享博主' },
  { id: 2, name: '技术小白搞钱流' },
  { id: 3, name: '干货分享博主' },
  { id: 4, name: '情感治愈导师' },
];

const mockGeneratedContent = `# 2024年副业新趋势，普通人如何月入过万

大家好，今天来聊聊2024年最适合普通人的副业新趋势！

## 为什么要做副业？
现在的经济环境下，单一收入来源真的太危险了。身边好多朋友都在做副业，有的甚至副业收入超过了主业。

## 2024年最火的三个副业方向
1. **小红书图文带货** - 不需要露脸，不需要拍摄，选对品就能出单
2. **AI内容创作** - 用AI工具写文案、做视频，效率提升10倍
3. **知识付费** - 把你的经验变成钱，打造个人IP

## 我的真实经历
我也是从副业开始的，第一个月只赚了800块，但第二个月就涨到了5000+，现在稳定在2-3万。

想知道具体怎么做的吗？点赞收藏，下期分享详细操作步骤！

#副业 #搞钱 #创业 #小红书 #2024`;

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState(1);
  const [keywords, setKeywords] = useState('');
  const [outline, setOutline] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToQueue, setIsAddedToQueue] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedModel] = useState('doubao-seed-2-0-pro-260215');
  const [hotTopics, setHotTopics] = useState<HotTopic[]>(mockHotTopics);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isGeneratingInspiration, setIsGeneratingInspiration] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('https://tophub.today/c/ai');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAdoptTopic = (topic: HotTopic) => {
    setKeywords(topic.title);
    setOutline(`请参考标题：${topic.title}，分析其爆款逻辑并生成一篇类似结构的干货长文`);
  };

  const fetchTrends = async () => {
    const selectedPersonaName = mockPersonas.find(p => p.id === selectedPersona)?.name || '';
    const searchQuery = selectedPersonaName.includes('搞钱') ? '搞钱副业' : 
                        selectedPersonaName.includes('干货') ? '干货分享' : 
                        selectedPersonaName.includes('情感') ? '情感治愈' : '小红书爆款';

    setIsFetchingTrends(true);
    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.trends && data.trends.length > 0) {
          const formattedTopics = data.trends.map((item: any, index: number) => ({
            id: index + 1,
            title: item.title,
            heat: parseInt(item.likes) || Math.floor(Math.random() * 10000),
            time: item.time || '刚刚'
          }));
          setHotTopics(formattedTopics);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || '获取热点失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取热点失败，请重试';
      alert(errorMessage);
      console.error('获取热点错误:', error);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const fetchInspirations = async () => {
    const selectedPersonaName = mockPersonas.find(p => p.id === selectedPersona)?.name || '';

    setIsGeneratingInspiration(true);
    try {
      const response = await fetch('/api/inspiration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          persona: selectedPersonaName,
          sourceUrl: sourceUrl
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.inspirations && data.inspirations.length > 0) {
          const formattedInspirations = data.inspirations.map((item: any, index: number) => ({
            id: index + 1,
            topic: item.topic,
            angle: item.angle,
            outline: item.outline
          }));
          setInspirations(formattedInspirations);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || '获取选题灵感失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取选题灵感失败，请重试';
      alert(errorMessage);
      console.error('获取选题灵感错误:', error);
    } finally {
      setIsGeneratingInspiration(false);
    }
  };

  const handleAdoptInspiration = (inspiration: Inspiration) => {
    setKeywords(inspiration.topic);
    setOutline(`观点：${inspiration.angle}\n\n${inspiration.outline}`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const selectedPersonaName = mockPersonas.find(p => p.id === selectedPersona)?.name || '';
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: selectedPersonaName,
          outline: outline || keywords,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成失败，请检查服务设置');
      }

      const data = await response.json();
      if (data.content) {
        setGeneratedContent(data.content);
      } else {
        throw new Error('生成结果为空，请重试');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败，请检查服务设置';
      alert(errorMessage);
      console.error('生成错误:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddToQueue = async () => {
    if (!generatedContent) {
      alert('请先生成内容');
      return;
    }

    setIsPublishing(true);
    setIsAddedToQueue(true);

    try {
      const lines = generatedContent.trim().split('\n');
      let title = '';
      let content = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('###') && !line.startsWith('---')) {
          title = line;
          content = lines.slice(i + 1).join('\n').trim();
          break;
        }
      }

      if (!title) {
        title = '小红书笔记';
        content = generatedContent;
      }

      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || '已成功存入小红书长文草稿箱！');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '发布失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发布失败，请重试';
      alert(errorMessage);
      console.error('发布错误:', error);
    } finally {
      setIsPublishing(false);
      setTimeout(() => setIsAddedToQueue(false), 2000);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: '数据大盘' },
    { icon: Users, label: '人设与账号管理' },
    { icon: Sparkles, label: 'AI创作台', active: true },
    { icon: Bot, label: 'RPA自动化任务' },
    { icon: ShoppingCart, label: '交付与转化设置' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载 Vibe Money...</p>
        </div>
      </div>
    );
  }

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
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
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
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI创作台</h1>
            <p className="text-slate-400">创作爆款内容，开启自动化发布</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                上下文配置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">选择账号</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {mockAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">选择人设模板</label>
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {mockPersonas.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name}
                      </option>
                    ))}
                  </select>
                </div>



                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-200">
                  <Edit3 className="w-4 h-4" />
                  编辑该人设Prompt
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                热点情报与输入
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">信息源 (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://tophub.today/c/ai"
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={fetchInspirations}
                    disabled={isGeneratingInspiration}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white text-sm font-medium"
                  >
                    {isGeneratingInspiration ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        洞察中...
                      </>
                    ) : (
                      <>
                        <span>🧠</span>
                        洞察今日热点
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">深度选题建议</label>
                <div className="bg-slate-900 rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
                  {isGeneratingInspiration ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                          <div className="h-5 bg-slate-700 rounded w-full mb-2"></div>
                          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : inspirations.length > 0 ? (
                    inspirations.map((inspiration) => (
                      <div
                        key={inspiration.id}
                        className="p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-100 mb-2">{inspiration.topic}</p>
                            <p className="text-sm text-emerald-400 mb-2">💡 {inspiration.angle}</p>
                            <p className="text-xs text-slate-400 line-clamp-2">{inspiration.outline}</p>
                          </div>
                          <button
                            onClick={() => handleAdoptInspiration(inspiration)}
                            className="ml-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium rounded transition-colors flex-shrink-0"
                          >
                            一键采纳
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      <p className="mb-2">点击"🧠 洞察今日热点"</p>
                      <p className="text-xs">AI 将基于今日热榜生成深度选题建议</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    核心关键词
                    <span className="text-slate-500 ml-2">{keywords.length}/100</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    maxLength={100}
                    placeholder="输入核心关键词，用逗号分隔..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    内容大纲
                    <span className="text-slate-500 ml-2">{outline.length}/500</span>
                  </label>
                  <textarea
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="1. 开头引入&#10;2. 核心观点&#10;3. 实操步骤&#10;4. 总结互动"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              长文生成与发布准备
            </h2>

            <div className="mb-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !keywords || !outline}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    AI正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    ✨ AI生成长文草稿
                  </>
                )}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                生成文案预览（可编辑）
              </label>
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={12}
                placeholder="AI生成的文案将显示在这里，您可以进行二次编辑..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || !generatedContent}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!generatedContent}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-200"
              >
                {isSaved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                {isSaved ? '已保存' : '保存草稿'}
              </button>

              <button
                onClick={handleAddToQueue}
                disabled={!generatedContent || isPublishing}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-semibold shadow-lg shadow-emerald-600/20"
              >
                {isPublishing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    正在启动浏览器自动排版...
                  </>
                ) : isAddedToQueue ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    已加入发布队列
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    确认无误，加入RPA发布队列
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}