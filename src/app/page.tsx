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
  TrendingUp,
  Edit3,
  Save,
  Send,
  Copy,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  Home
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

const mockHotTopics: HotTopic[] = [
  { id: 1, title: '2024年副业新趋势，普通人如何月入过万', heat: 9800, time: '2小时前' },
  { id: 2, title: '小红书爆款笔记标题公式，看完直接套用', heat: 7500, time: '4小时前' },
  { id: 3, title: '新手做自媒体第一个月涨粉10000的秘密', heat: 6200, time: '6小时前' },
  { id: 4, title: '在家做的5个轻创业项目，0成本启动', heat: 5800, time: '8小时前' },
  { id: 5, title: '如何用AI工具高效创作内容，解放双手', heat: 4900, time: '12小时前' },
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

type Topic = {
  title: string;
  sellingPoint: string;
  targetAudience: string;
};

type KeyPoint = {
  point: string;
  details: string;
  source?: string;
};

type ResearchResult = {
  keyPoints: KeyPoint[];
  angles: string[];
};

type OutlineResult = {
  outline: string[];
  tips: string[];
};

type UnifiedAccount = {
  id: string;
  nickname: string;
  avatar: string;
  status: 'valid' | 'expired';
  authFile: string;
  createdAt: string;
};

type UnifiedPersona = {
  id: string;
  name: string;
  prompt: string;
  boundAccountId: string | null;
};

export default function AICreationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 使用 useRef 防止无限循环
  const hasLoadedRef = useRef(false);
  
  const [accounts, setAccounts] = useState<UnifiedAccount[]>([
    {
      id: '1',
      nickname: 'Vibe Money',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vibe',
      status: 'valid',
      authFile: 'auth.json',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [personas, setPersonas] = useState<UnifiedPersona[]>([
    {
      id: '1',
      name: '生活哲学家',
      prompt: '你是一个热爱生活、善于思考的哲学家',
      boundAccountId: '1'
    }
  ]);
  
  const [selectedAccount, setSelectedAccount] = useState('1');
  const [selectedPersona, setSelectedPersona] = useState('1');
  
  // 安全地加载数据，只执行一次
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadData = async () => {
      try {
        console.log('🔄 正在加载账号和人设数据...');
        const [accountsRes, personasRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/personas')
        ]);
        
        if (accountsRes.ok) {
          const data = await accountsRes.json();
          if (data && data.length > 0) {
            setAccounts(data);
            setSelectedAccount(data[0].id);
          }
        }
        
        if (personasRes.ok) {
          const data = await personasRes.json();
          if (data && data.length > 0) {
            setPersonas(data);
            const persona = data.find((p: UnifiedPersona) => p.boundAccountId === accounts[0]?.id) || data[0];
            setSelectedPersona(persona.id);
          }
        }
        console.log('✅ 数据加载完成');
      } catch (error) {
        console.warn('⚠️ 使用模拟数据（API加载失败）:', error);
      }
    };
    
    loadData();
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [researchKeywords, setResearchKeywords] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [outlineResult, setOutlineResult] = useState<OutlineResult | null>(null);
  const [isEditingOutline, setIsEditingOutline] = useState(false);
  const [editedOutline, setEditedOutline] = useState<string[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToQueue, setIsAddedToQueue] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedModel] = useState('doubao-seed-2-0-pro-260215');

  const menuItems = [
    { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
    { icon: Users, label: '身份管理', href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', active: true, href: '/' },
    { icon: Bot, label: '自动化', href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
  ];

  const handleGenerateTopics = async () => {
    if (!researchKeywords.trim()) {
      alert('请输入关键词');
      return;
    }

    setIsResearching(true);
    try {
      console.log('🔍 调试信息：');
      console.log('- selectedAccount:', selectedAccount);
      console.log('- personas:', personas);
      
      let currentPersona = personas.find(p => p.boundAccountId === selectedAccount);
      if (!currentPersona && personas.length > 0) {
        currentPersona = personas[0];
      }
      const selectedPersonaName = currentPersona?.name || '生活哲学家';
      
      console.log('- selectedPersonaName:', selectedPersonaName);
      
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'generate-topics',
          persona: selectedPersonaName,
          keywords: researchKeywords
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data);
        setCurrentStep(2);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || '生成选题失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成选题失败，请重试';
      alert(errorMessage);
      console.error('生成选题错误:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic.title);
    setIsResearching(true);
    
    try {
      let currentPersona = personas.find(p => p.boundAccountId === selectedAccount);
      if (!currentPersona && personas.length > 0) {
        currentPersona = personas[0];
      }
      const selectedPersonaName = currentPersona?.name || '生活哲学家';
      
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'do-research',
          persona: selectedPersonaName,
          selectedTopic: topic.title
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResearchResult(data);
        setCurrentStep(3);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || '调研失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '调研失败，请重试';
      alert(errorMessage);
      console.error('调研错误:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSelectAngle = async (angle: string) => {
    setSelectedAngle(angle);
    setIsResearching(true);
    
    try {
      let currentPersona = personas.find(p => p.boundAccountId === selectedAccount);
      if (!currentPersona && personas.length > 0) {
        currentPersona = personas[0];
      }
      const selectedPersonaName = currentPersona?.name || '生活哲学家';
      
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'generate-outline',
          persona: selectedPersonaName,
          selectedTopic: selectedTopic,
          selectedAngle: angle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutlineResult(data);
        setEditedOutline([...data.outline]);
        setCurrentStep(4);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || '生成大纲失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成大纲失败，请重试';
      alert(errorMessage);
      console.error('生成大纲错误:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const handleEditOutlineItem = (index: number, newValue: string) => {
    const newOutline = [...editedOutline];
    newOutline[index] = newValue;
    setEditedOutline(newOutline);
  };

  const handleSaveEditedOutline = () => {
    if (outlineResult) {
      setOutlineResult({
        ...outlineResult,
        outline: editedOutline
      });
      setIsEditingOutline(false);
    }
  };

  const handleAddOutlineItem = () => {
    setEditedOutline([...editedOutline, '']);
  };

  const handleRemoveOutlineItem = (index: number) => {
    if (editedOutline.length > 1) {
      setEditedOutline(editedOutline.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    if (!outlineResult || editedOutline.length === 0) {
      alert('请先完成前面的步骤');
      return;
    }

    setIsGenerating(true);
    try {
      let currentPersona = personas.find(p => p.boundAccountId === selectedAccount);
      if (!currentPersona && personas.length > 0) {
        currentPersona = personas[0];
      }
      const selectedPersonaName = currentPersona?.name || '生活哲学家';
      const outlineText = editedOutline.join('\n');
      
      console.log('📝 生成长文调试信息：');
      console.log('- persona:', selectedPersonaName);
      console.log('- model:', selectedModel);
      console.log('- outline:', outlineText.substring(0, 100) + '...');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: selectedPersonaName,
          outline: outlineText,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成失败，请检查服务设置');
      }

      const data = await response.json();
      console.log('✅ 生成长文返回数据:', data);
      
      if (data.article_content && data.post_description) {
        setArticleContent(data.article_content);
        setPostDescription(data.post_description);
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
    if (!articleContent) {
      alert('请先生成内容');
      return;
    }

    setIsPublishing(true);
    setIsAddedToQueue(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('已成功存入小红书长文草稿箱！');
    } catch (error) {
      alert('发布失败，请重试');
      console.error('发布错误:', error);
    } finally {
      setIsPublishing(false);
      setTimeout(() => setIsAddedToQueue(false), 2000);
    }
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
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>AI Studio</span>
              <span className="text-slate-400 font-normal">AI创作</span>
            </h1>
            <p className="text-slate-400 text-sm">爆款创作 · 内容生成 · 人设驱动 · Content Creation · AI Writing</p>
          </div>

          <div className="space-y-6 mb-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                选择创作身份
              </h2>
              
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">选择账号</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => {
                      setSelectedAccount(e.target.value);
                      const persona = personas.find(p => p.boundAccountId === e.target.value);
                      if (persona) {
                        setSelectedPersona(persona.id);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                四步结构化创作流程
              </h2>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                  { num: 1, name: '输入关键词' },
                  { num: 2, name: '选择选题' },
                  { num: 3, name: '深度调研' },
                  { num: 4, name: '确认大纲' }
                ].map((step, index) => (
                  <div key={step.num} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step.num 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {step.num}
                    </div>
                    <span className={`ml-2 text-sm ${
                      currentStep >= step.num ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </span>
                    {index < 3 && (
                      <div className={`w-8 h-1 mx-2 ${
                        currentStep > step.num ? 'bg-indigo-600' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-slate-200 mb-2">步骤 1：输入关键词</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      核心创作关键词
                    </label>
                    <input
                      type="text"
                      value={researchKeywords}
                      onChange={(e) => setResearchKeywords(e.target.value)}
                      placeholder="例如：AI副业、小红书运营"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={handleGenerateTopics}
                    disabled={isResearching}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
                  >
                    {isResearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        生成选题中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        生成选题建议
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-slate-200">步骤 2：选择选题</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      返回上一步
                    </button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {topics.map((topic, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectTopic(topic)}
                        className="p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 cursor-pointer transition-all"
                      >
                        <h4 className="font-semibold text-slate-100 mb-1">{topic.title}</h4>
                        <p className="text-sm text-emerald-400 mb-2">{topic.sellingPoint}</p>
                        <p className="text-xs text-slate-400">目标：{topic.targetAudience}</p>
                      </div>
                    ))}
                  </div>
                  {isResearching && (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 mt-2 text-sm">正在进行深度调研...</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-slate-200">步骤 3：选择切入角度</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      返回上一步
                    </button>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">📊 关键信息点</h4>
                    <div className="space-y-2">
                      {researchResult?.keyPoints.map((point, index) => (
                        <div key={index} className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                          <p className="text-sm font-medium text-slate-100 mb-1">{point.point}</p>
                          <p className="text-xs text-slate-400">{point.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">💡 选择切入角度</h4>
                    <div className="space-y-2">
                      {researchResult?.angles.map((angle, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAngle(angle)}
                          disabled={isResearching}
                          className="w-full text-left p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                          <p className="text-sm text-slate-100">{angle}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {isResearching && (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 mt-2 text-sm">正在生成写作大纲...</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-slate-200">步骤 4：确认大纲</h3>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      返回上一步
                    </button>
                  </div>
                  
                  {!isEditingOutline ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-300">📝 写作大纲</h4>
                          <button
                            onClick={() => setIsEditingOutline(true)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            编辑
                          </button>
                        </div>
                        <div className="space-y-2 mb-4">
                          {outlineResult?.outline.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-indigo-400 font-semibold">{index + 1}.</span>
                              <p className="text-sm text-slate-100">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {outlineResult?.tips && outlineResult.tips.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">💡 写作提示</h4>
                          <div className="space-y-1">
                            {outlineResult.tips.map((tip, index) => (
                              <p key={index} className="text-xs text-slate-400">• {tip}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-300">✏️ 编辑大纲</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditedOutline(outlineResult?.outline || []);
                                setIsEditingOutline(false);
                              }}
                              className="text-sm text-slate-400 hover:text-slate-300"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleSaveEditedOutline}
                              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <Save className="w-4 h-4" />
                              保存
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {editedOutline.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-indigo-400 font-semibold mt-2">{index + 1}.</span>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => handleEditOutlineItem(index, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                  placeholder="输入要点..."
                                />
                              </div>
                              <button
                                onClick={() => handleRemoveOutlineItem(index)}
                                className="text-slate-500 hover:text-red-400 mt-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleAddOutlineItem}
                          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                        >
                          <Plus className="w-4 h-4" />
                          添加要点
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                disabled={isGenerating || !outlineResult || currentStep < 4}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  长文标题与正文（供小红书长文编辑器排版使用）
                </label>
                <textarea
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  rows={12}
                  placeholder="AI生成的长文内容将显示在这里，您可以进行二次编辑..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  小红书外发文案（含标题、人话版摘要、话题 Tags）
                </label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  rows={12}
                  placeholder="AI生成的外发文案将显示在这里，您可以进行二次编辑..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || !articleContent || !outlineResult}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!articleContent}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-200"
              >
                {isSaved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                {isSaved ? '已保存' : '保存草稿'}
              </button>

              <button
                onClick={handleAddToQueue}
                disabled={!articleContent || isPublishing}
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
