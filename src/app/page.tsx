'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Edit3,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

type KeyPoint = {
  point: string;
  details: string;
  source?: string;
};

type Angle = {
  type: string;   // 框架类型标签，如「真实失败经历反转型」
  hook: string;   // 开篇前两句示范文字
  why: string;    // 为什么有效
};

type ResearchResult = {
  keyPoints: KeyPoint[];
  angles: Angle[] | string[];   // 兼容旧格式（string[]）和新格式（Angle[]）
  dataSource?: 'realtime' | 'ai_knowledge';
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

  // ── 创作流程状态（3步简化版）──
  const [currentStep, setCurrentStep] = useState(1);
  const [researchKeywords, setResearchKeywords] = useState('');
  const [fromInspiration, setFromInspiration] = useState(false);        // 来自灵感库
  const [inspirationLabel, setInspirationLabel] = useState('');         // 灵感来源标题
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');       // JSON string of Angle or plain string
  const [outlineResult, setOutlineResult] = useState<OutlineResult | null>(null);
  const [isEditingOutline, setIsEditingOutline] = useState(false);
  const [editedOutline, setEditedOutline] = useState<string[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [commentHook, setCommentHook] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToQueue, setIsAddedToQueue] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedModel] = useState('doubao-1-5-pro-32k-250115');

  // ── URL 参数检测：兼容 ?from=inspiration&topic=xxx 和 legacy ?keyword=xxx ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const topic = params.get('topic');
    const kw = params.get('keyword');

    if (from === 'inspiration' && topic) {
      const decodedTopic = decodeURIComponent(topic);
      setResearchKeywords(decodedTopic);
      setFromInspiration(true);
      setInspirationLabel(decodedTopic);
    } else if (kw) {
      setResearchKeywords(decodeURIComponent(kw));
    }
  }, []);

  /** 根据当前账号找到对应人设，返回 name + prompt */
  const getCurrentPersona = () => {
    const p = personas.find(p => p.boundAccountId === selectedAccount) ?? personas[0];
    return {
      name: p?.name || '生活哲学家',
      prompt: p?.prompt || '',
    };
  };

  // ── 核心方法：直接用用户输入/灵感作为选题，跳过「生成选题」步骤 ──
  const handleResearchDirect = async (topicOverride?: string) => {
    const topic = (topicOverride || researchKeywords).trim();
    if (!topic) {
      alert('请描述你的灵感或想法');
      return;
    }

    setSelectedTopic(topic);
    setIsResearching(true);

    try {
      const { name: personaName, prompt: personaPrompt } = getCurrentPersona();

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'do-research',
          persona: personaName,
          personaPrompt,
          selectedTopic: topic,
          sellingPoint: '',
          targetAudience: '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResearchResult(data);
        setCurrentStep(2);
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

  const handleSelectAngle = async (angle: Angle | string) => {
    // 统一序列化为字符串存入 state，API 端会 JSON.parse 再提取
    const angleStr = typeof angle === 'string' ? angle : JSON.stringify(angle);
    setSelectedAngle(angleStr);
    setIsResearching(true);

    try {
      const { name: personaName, prompt: personaPrompt } = getCurrentPersona();

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'generate-outline',
          persona: personaName,
          personaPrompt,
          selectedTopic,
          selectedAngle: angleStr,
          sellingPoint: '',
          targetAudience: '',
          researchData: researchResult,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutlineResult(data);
        setEditedOutline([...data.outline]);
        setCurrentStep(3);
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
    setArticleContent('');
    setPostDescription('');
    setImagePrompt('');
    setCommentHook('');

    try {
      const { name: personaName, prompt: personaPrompt } = getCurrentPersona();
      const outlineText = editedOutline.join('\n');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: personaName,
          personaPrompt,
          outline: outlineText,
          tips: outlineResult?.tips ?? [],
          selectedTopic,
          selectedAngle,
          sellingPoint: '',
          targetAudience: '',
          researchData: researchResult,
          model: selectedModel,
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成失败，请检查服务设置');
      }

      // 流式消费 SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          try {
            const event = JSON.parse(raw);
            if (event.type === 'article_chunk') {
              setArticleContent(prev => prev + event.chunk);
            } else if (event.type === 'post_description') {
              setPostDescription(event.content);
            } else if (event.type === 'image_prompt') {
              setImagePrompt(event.content);
            } else if (event.type === 'comment_hook') {
              setCommentHook(event.content);
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
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

    try {
      const { name: personaName } = getCurrentPersona();
      const title = postDescription.split('\n').find(l => l.trim().length > 0)?.trim()
        || selectedTopic
        || '未命名文章';

      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: articleContent,
          postDescription,
          persona: personaName,
          topic: selectedTopic,
          accountId: selectedAccount,   // 传递账号 ID，用于自动发布时找 authFile
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || '加入队列失败');
      }

      setIsAddedToQueue(true);
      setTimeout(() => setIsAddedToQueue(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : '加入队列失败，请重试');
      console.error('发布错误:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  void handleRegenerate; // suppress unused warning

  const currentPersona = getCurrentPersona();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl mx-auto">

          {/* ── 页头 ── */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>AI Studio</span>
              <span className="text-slate-400 font-normal">AI 创作台</span>
            </h1>
            <p className="text-slate-400 text-sm">爆款创作 · 内容生成 · 人设驱动</p>
          </div>

          {/* ── Hero Banner ── */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/40">核心功能</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">✓ 真实 AI 驱动</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">一句话灵感 · 30秒成稿 · 可直接发布</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    怎么想怎么说，不用写 Prompt → AI 深度调研 + 差异化叙事框架 → 结构化大纲 → 一键生成 <span className="text-indigo-300 font-medium">1200+字长文 + 外发文案 + 配图建议 + 评论话术</span>
                  </p>
                </div>
                {/* 创作身份（compact inline） */}
                <div className="flex-shrink-0 bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 min-w-[160px]">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">当前创作身份</p>
                  <select
                    value={selectedAccount}
                    onChange={(e) => {
                      setSelectedAccount(e.target.value);
                      const p = personas.find(p => p.boundAccountId === e.target.value);
                      if (p) setSelectedPersona(p.id);
                    }}
                    className="w-full bg-transparent text-slate-100 text-sm font-medium focus:outline-none cursor-pointer mb-1"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-800">{a.nickname}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-indigo-400 truncate">人设：{currentPersona.name}</p>
                </div>
              </div>

              {/* ── 3步进度条 ── */}
              <div className="mt-5 flex items-center gap-1">
                {[
                  { num: 1, label: '描述灵感', desc: '你的想法，AI来深挖' },
                  { num: 2, label: '调研 + 角度', desc: '真实数据 + 叙事框架' },
                  { num: 3, label: '确认大纲', desc: '可编辑的写作结构' },
                ].map((step, i) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <button
                      onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                      className={`flex flex-col items-center group ${currentStep > step.num ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep > step.num ? 'bg-green-500 text-white' :
                        currentStep === step.num ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30' :
                        'bg-slate-700 text-slate-500'
                      }`}>
                        {currentStep > step.num ? '✓' : step.num}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                        currentStep >= step.num ? 'text-slate-200' : 'text-slate-600'
                      }`}>{step.label}</span>
                    </button>
                    {i < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-3 transition-all ${
                        currentStep > step.num ? 'bg-green-500' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 步骤区域 ── */}
          <div className="space-y-4 mb-6">

            {/* ══════════════ 步骤 1：描述你的灵感 ══════════════ */}
            <div className={`rounded-xl border transition-all ${
              currentStep === 1
                ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : currentStep > 1
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-slate-800/30 border-slate-700/30 opacity-60'
            }`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep > 1 ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white'
                    }`}>{currentStep > 1 ? '✓' : '1'}</div>
                    <div>
                      <h3 className="font-semibold text-slate-100">描述你的灵感</h3>
                      <p className="text-xs text-slate-400">随便说，可以很模糊。AI 会帮你提炼选题、深度调研并推荐差异化叙事角度</p>
                    </div>
                  </div>
                  {currentStep > 1 && (
                    <button onClick={() => setCurrentStep(1)} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">修改</button>
                  )}
                </div>

                {currentStep === 1 ? (
                  <div className="space-y-3">
                    {/* 来自灵感库的 Banner */}
                    {fromInspiration && inspirationLabel && (
                      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-amber-300 font-medium">已从灵感工作台导入</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">「{inspirationLabel}」</p>
                        </div>
                        <button
                          onClick={() => { setFromInspiration(false); setInspirationLabel(''); }}
                          className="text-slate-600 hover:text-slate-400 text-xs transition-colors flex-shrink-0"
                        >✕</button>
                      </div>
                    )}
                    <textarea
                      value={researchKeywords}
                      onChange={(e) => setResearchKeywords(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.metaKey && !isResearching && handleResearchDirect()}
                      placeholder={`描述你的想法，可以很模糊，例如：\n· "用 AI 做副业的真实经历"\n· "小红书新手涨粉的底层逻辑"\n· "2026年普通人的轻创业方向"`}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                    />
                    <button
                      onClick={() => handleResearchDirect()}
                      disabled={isResearching}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all text-white font-semibold text-base"
                    >
                      {isResearching ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI 调研中，识别关键数据 + 角度...</>
                      ) : (
                        <><Sparkles className="w-5 h-5" />AI 一键调研 + 生成叙事角度 →</>
                      )}
                    </button>
                    {/* 预期效果预览 */}
                    <div className="mt-1 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">完成后你将看到（示例）</p>
                      <div className="space-y-1.5 opacity-50">
                        {[
                          { tag: '真实失败经历反转型', hook: '"我当时月薪3000，副业第一个月只赚了3块钱..."' },
                          { tag: '数据颠覆认知型', hook: '"2026年做副业，87%的人第一步就走错了..."' },
                          { tag: '清单干货速成型', hook: '"5个步骤，把你的经验变成第一个月入过万的副业..."' },
                        ].map((t, i) => (
                          <div key={i} className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-[10px] text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded-full">{t.tag}</span>
                            <p className="text-xs text-slate-500 mt-1 italic">{t.hook}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 rounded-lg px-4 py-2.5 text-sm text-slate-300">
                    {fromInspiration && <span className="text-amber-400 text-xs mr-2">[灵感库]</span>}
                    灵感：<span className="text-indigo-400 font-medium">「{researchKeywords}」</span>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════ 步骤 2：深度调研 + 选择叙事角度 ══════════════ */}
            <div className={`rounded-xl border transition-all ${
              currentStep === 2
                ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : currentStep > 2
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-slate-800/30 border-slate-700/30 opacity-50'
            }`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep > 2 ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500'
                    }`}>{currentStep > 2 ? '✓' : '2'}</div>
                    <div>
                      <h3 className="font-semibold text-slate-100">深度调研 · 选择叙事框架</h3>
                      <p className="text-xs text-slate-400">AI 搜集真实数据，提供 3 种差异化叙事角度（≠选题，是「怎么讲」的框架），点击选一个</p>
                    </div>
                  </div>
                  {currentStep > 2 && (
                    <button onClick={() => setCurrentStep(2)} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">修改</button>
                  )}
                </div>

                {currentStep === 2 ? (
                  <div className="space-y-5">
                    {/* 数据来源标志 */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                      researchResult?.dataSource === 'realtime'
                        ? 'bg-green-500/10 border-green-500/25 text-green-400'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}>
                      {researchResult?.dataSource === 'realtime' ? (
                        <>
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                          已通过 Tavily 联网搜索，以下数据来自近 6 个月的真实文章
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                          未配置 Tavily API，以下信息来自 AI 知识库（不保证最新性，建议自行核实）
                        </>
                      )}
                    </div>

                    {/* 关键信息点 */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        📊 调研关键信息点（这些「弹药」将自动注入正文）
                      </h4>
                      <div className="space-y-2">
                        {researchResult?.keyPoints.map((point, index) => (
                          <div key={index} className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-100 mb-1">{point.point}</p>
                                <p className="text-xs text-slate-400 leading-relaxed mb-1">{point.details}</p>
                                {point.source && (
                                  <p className="text-[10px] text-slate-600 italic">来源：{point.source}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 叙事角度选择 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          🎬 选择叙事框架（≠选题，是「怎么讲」的框架）
                        </h4>
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full">点击选一个</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        选题决定写什么，框架决定怎么讲。三个框架叙事视角、情绪基调和文章结构均不同，选最适合你人设的一个。
                      </p>
                      <div className="space-y-3">
                        {researchResult?.angles.map((angle, index) => {
                          const isAngleObj = typeof angle === 'object' && angle !== null;
                          const angleObj = isAngleObj ? (angle as Angle) : null;
                          const angleStr = isAngleObj ? null : (angle as string);
                          return (
                            <button
                              key={index}
                              onClick={() => !isResearching && handleSelectAngle(angle as Angle | string)}
                              disabled={isResearching}
                              className="w-full text-left p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/80 transition-all disabled:opacity-50 group"
                            >
                              {angleObj ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                      {index + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                                      {angleObj.type}
                                    </span>
                                  </div>
                                  <div className="pl-7">
                                    <p className="text-sm text-slate-100 leading-relaxed italic border-l-2 border-slate-600 pl-3 mb-2">
                                      &ldquo;{angleObj.hook}&rdquo;
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      <span className="text-slate-400 font-medium">为什么有效：</span>{angleObj.why}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-2 text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0">{index + 1}</span>
                                  {angleStr}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isResearching && (
                      <div className="flex items-center gap-3 py-3 px-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin flex-shrink-0" />
                        <p className="text-indigo-300 text-sm">正在根据框架和调研数据生成写作大纲...</p>
                      </div>
                    )}
                  </div>
                ) : currentStep > 2 ? (
                  <div className="bg-slate-900/50 rounded-lg px-4 py-2.5 text-sm text-slate-300">
                    {(() => {
                      try {
                        const a = JSON.parse(selectedAngle) as Angle;
                        return <>已选框架：<span className="text-indigo-400 font-medium">「{a.type}」</span></>;
                      } catch {
                        return <>已选角度：<span className="text-indigo-400 font-medium">「{selectedAngle}」</span></>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                    <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-wide">完成步骤1后解锁 · 预期效果</p>
                    <div className="space-y-2 opacity-40">
                      {[
                        { tag: '真实失败经历反转型', hook: '"我当时月薪3000，副业第一个月只赚了3块钱..."' },
                        { tag: '数据颠覆认知型', hook: '"2026年做副业，87%的人第一步就走错了..."' },
                        { tag: '清单干货速成型', hook: '"5个步骤，把你的经验变成第一个月入过万的副业..."' },
                      ].map((t, i) => (
                        <div key={i} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded-full">{t.tag}</span>
                          <p className="text-xs text-slate-600 mt-1 italic">{t.hook}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════ 步骤 3：确认大纲 ══════════════ */}
            <div className={`rounded-xl border transition-all ${
              currentStep === 3
                ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : currentStep > 3
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-slate-800/30 border-slate-700/30 opacity-50'
            }`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 3 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-500'
                    }`}>3</div>
                    <div>
                      <h3 className="font-semibold text-slate-100">确认 · 编辑写作大纲</h3>
                      <p className="text-xs text-slate-400">AI 生成结构化大纲，你可以手动调整每个章节标题，再点击「生成长文」</p>
                    </div>
                  </div>
                </div>

                {currentStep === 3 ? (
                  <div className="space-y-4">
                    {!isEditingOutline ? (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">📝 写作大纲</h4>
                              <p className="text-[10px] text-slate-600 mt-0.5">遵循小红书爆款结构：破防开篇 → 核心观点 → 分段论证 → 反转/点睛 → 互动收尾</p>
                            </div>
                            <button
                              onClick={() => setIsEditingOutline(true)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />编辑大纲
                            </button>
                          </div>
                          <div className="bg-slate-900 rounded-lg border border-slate-700 divide-y divide-slate-700/50">
                            {outlineResult?.outline.map((item, index) => {
                              const total = outlineResult.outline.length;
                              let sectionLabel = '';
                              let sectionColor = '';
                              if (index === 0) { sectionLabel = '开篇破防'; sectionColor = 'text-red-400 bg-red-500/15 border-red-500/25'; }
                              else if (index === 1) { sectionLabel = '核心观点'; sectionColor = 'text-blue-400 bg-blue-500/15 border-blue-500/25'; }
                              else if (index === total - 1) { sectionLabel = '互动收尾'; sectionColor = 'text-green-400 bg-green-500/15 border-green-500/25'; }
                              else if (index === total - 2) { sectionLabel = '反转/点睛'; sectionColor = 'text-purple-400 bg-purple-500/15 border-purple-500/25'; }
                              else { sectionLabel = `论证段 ${index - 1}`; sectionColor = 'text-slate-400 bg-slate-700/50 border-slate-600/50'; }
                              return (
                                <div key={index} className="flex items-start gap-3 p-3">
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0 mt-0.5 ${sectionColor}`}>
                                    {sectionLabel}
                                  </span>
                                  <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {outlineResult?.tips && outlineResult.tips.length > 0 && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-amber-400 mb-2">⚠️ 本次写作专属提示（避坑指南）</h4>
                            <div className="space-y-1.5">
                              {outlineResult.tips.map((tip, index) => (
                                <p key={index} className="text-xs text-slate-300 leading-relaxed">• {tip}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">✏️ 编辑大纲</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditedOutline(outlineResult?.outline || []); setIsEditingOutline(false); }}
                              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                            >取消</button>
                            <button
                              onClick={handleSaveEditedOutline}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />保存
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {editedOutline.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleEditOutlineItem(index, e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="输入章节标题..."
                              />
                              <button onClick={() => handleRemoveOutlineItem(index)} className="text-slate-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button onClick={handleAddOutlineItem} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                          <Plus className="w-3.5 h-3.5" />添加章节
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                    <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-wide">完成步骤2后解锁 · 预期效果</p>
                    <div className="space-y-1.5 opacity-40">
                      {['① 引言：为什么这件事对你很重要', '② 核心方法：3个可直接复制的步骤', '③ 真实案例：我的亲身经历与数据', '④ 常见误区：你可能踩过的坑', '⑤ 行动号召：今天就能做的第一步'].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 flex-shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 长文生成区域 ── */}
          <div className={`rounded-xl border transition-all ${
            currentStep >= 3 && outlineResult
              ? 'bg-slate-800 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              : 'bg-slate-800/40 border-slate-700/40 opacity-60'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  currentStep >= 3 && outlineResult ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-100">生成长文草稿 + 外发文案</h2>
                  <p className="text-xs text-slate-400">基于大纲和调研数据，AI 一次性生成完整长文 + 小红书外发文案（含话题 Tags）</p>
                </div>
              </div>

              {currentStep < 3 || !outlineResult ? (
                <div className="mt-4 p-5 bg-slate-900/50 rounded-xl border border-slate-700/40 text-center">
                  <p className="text-slate-500 text-sm">完成上方三步后，此处将输出两部分内容</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 bg-blue-500/20 text-blue-500 rounded text-[10px] font-bold flex items-center justify-center">A</span>
                      长文正文（1200+字）
                    </div>
                    <span className="text-slate-700">+</span>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 bg-purple-500/20 text-purple-500 rounded text-[10px] font-bold flex items-center justify-center">B</span>
                      外发文案（标题 + 摘要 + Tags）
                    </div>
                    <span className="text-slate-700">+</span>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 bg-amber-500/20 text-amber-500 rounded text-[10px] font-bold flex items-center justify-center">C</span>
                      配图建议
                    </div>
                    <span className="text-slate-700">+</span>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-5 h-5 bg-green-500/20 text-green-500 rounded text-[10px] font-bold flex items-center justify-center">D</span>
                      评论区引导话术
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Generate button */}
                  <div className="mt-4 mb-6">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isGenerating ? (
                        <><RefreshCw className="w-6 h-6 animate-spin" />AI 正在生成，请稍候...</>
                      ) : articleContent ? (
                        <><RefreshCw className="w-5 h-5" />重新生成</>
                      ) : (
                        <><Sparkles className="w-6 h-6" />✨ 一键生成长文内容 + 外发文案</>
                      )}
                    </button>
                  </div>

                  {/* Panel A: 长文内容 */}
                  <div className="mb-4 rounded-xl border border-blue-500/25 bg-slate-900/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-blue-500/[0.08] border-b border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500/25 text-blue-400 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">A</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">长文内容</p>
                          <p className="text-xs text-slate-500">标题 + 正文 · 完成后粘贴到小红书「长文编辑器」排版发布</p>
                        </div>
                      </div>
                      {articleContent && (
                        <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />已生成
                        </span>
                      )}
                    </div>
                    <textarea
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      rows={16}
                      placeholder={isGenerating ? '正在流式生成...' : '点击上方按钮生成长文内容（标题 + 正文）...'}
                      className="w-full bg-transparent px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                    />
                  </div>

                  {/* Panel B: 外发文案 */}
                  <div className="mb-6 rounded-xl border border-purple-500/25 bg-slate-900/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-purple-500/[0.08] border-b border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-500/25 text-purple-400 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">B</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">外发文案</p>
                          <p className="text-xs text-slate-500">外发标题 + 人话版摘要 + 话题标签 · 影响小红书搜索曝光与用户点击</p>
                        </div>
                      </div>
                      {postDescription && (
                        <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />已生成
                        </span>
                      )}
                    </div>
                    <textarea
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      rows={8}
                      placeholder={isGenerating ? '正在生成外发文案...' : '点击上方按钮生成外发文案（标题 + 摘要 + #话题标签）...'}
                      className="w-full bg-transparent px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                    />
                  </div>

                  {/* Panel C: 配图建议 */}
                  <div className="mb-4 rounded-xl border border-amber-500/25 bg-slate-900/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-amber-500/[0.08] border-b border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-amber-500/25 text-amber-400 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">C</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">配图建议</p>
                          <p className="text-xs text-slate-500">封面图风格参考，拍摄或生成图时可直接参照</p>
                        </div>
                      </div>
                      {imagePrompt && (
                        <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />已生成
                        </span>
                      )}
                    </div>
                    <div className="px-5 py-4">
                      {imagePrompt ? (
                        <p className="text-sm text-slate-200 leading-relaxed">{imagePrompt}</p>
                      ) : (
                        <p className="text-slate-600 text-sm italic">{isGenerating ? '正在生成配图建议...' : '生成内容后自动出现'}</p>
                      )}
                    </div>
                  </div>

                  {/* Panel D: 评论区引导话术 */}
                  <div className="mb-6 rounded-xl border border-green-500/25 bg-slate-900/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-green-500/[0.08] border-b border-green-500/20">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500/25 text-green-400 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">D</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">评论区引导话术</p>
                          <p className="text-xs text-slate-500">发布后置顶评论，引导读者互动，提升内容权重</p>
                        </div>
                      </div>
                      {commentHook && (
                        <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />已生成
                        </span>
                      )}
                    </div>
                    <div className="px-5 py-4">
                      {commentHook ? (
                        <p className="text-sm text-slate-200 leading-relaxed italic">&ldquo;{commentHook}&rdquo;</p>
                      ) : (
                        <p className="text-slate-600 text-sm italic">{isGenerating ? '正在生成评论引导话术...' : '生成内容后自动出现'}</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!articleContent}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors text-slate-200 text-sm font-medium"
                    >
                      {isSaved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
                      {isSaved ? '草稿已保存' : '保存草稿'}
                    </button>

                    <div className="flex-1" />

                    <button
                      onClick={handleAddToQueue}
                      disabled={!articleContent || isPublishing}
                      className="flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all font-bold text-base shadow-lg shadow-emerald-600/25"
                    >
                      {isPublishing ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />加入队列中...</>
                      ) : isAddedToQueue ? (
                        <><CheckCircle className="w-5 h-5" />已加入队列 · 前往自动化中心审核确认</>
                      ) : (
                        <><Send className="w-5 h-5" />加入自动化发布队列</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
