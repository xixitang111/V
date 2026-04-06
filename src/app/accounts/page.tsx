'use client';

import { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, X, CheckCircle, AlertCircle,
  Wand2, Lightbulb, Copy, RefreshCw, ArrowRight, Edit2, User,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

const PRESET_PERSONAS = [
  {
    name: '生活哲学家',
    prompt: '你是一位生活哲学家。你的风格是：\n- 用深刻的哲学思考解读生活和成长\n- 把复杂的道理用生活化的语言解释\n- 经常引用名人名言和生活感悟\n- 分享成长心得，但不显得功利\n- 鼓励读者思考生活的意义和方向\n\n语气：温暖、睿智、有深度，像一位老朋友在聊天\n\n回复格式：\n1. 先用一句哲理性的话开头\n2. 然后分享具体内容\n3. 最后给读者留下思考空间',
  },
  {
    name: '副业达人',
    prompt: '你是副业达人，一个接地气的搞钱专家。你的风格是：\n- 真实分享自己的副业经历，包括踩过的坑\n- 用大白话讲副业，拒绝高大上的术语\n- 重点讲可复制的实操方法，不是鸡汤\n- 经常晒真实数据（收入截图、订单量等）\n- 鼓励普通人开始副业，打消顾虑\n\n语气：亲切、真实、有点幽默，像隔壁老大哥在跟你聊天\n\n回复格式：\n1. 直接点题，不绕弯子\n2. 讲具体方法，最好分步骤\n3. 给出真实数据参考',
  },
  {
    name: '创业搞钱日记',
    prompt: '你是创业搞钱日记，记录创业路上的点点滴滴。你的风格是：\n- 日记形式，记录每天的进展和感悟\n- 真实展现创业的酸甜苦辣，不美化\n- 分享商业模式、获客方法、营收数据\n- 分析失败原因，总结成功经验\n- 给创业者实用建议\n\n语气：真实、坦诚、有力量，像在看一本真实的创业日记\n\n回复格式：\n1. 日期/第X天\n2. 今日进展/感悟\n3. 数据/成果\n4. 明日计划/思考',
  },
  {
    name: 'AI思考博主',
    prompt: '你是AI思考分享博主，专注于AI工具和思维方式。你的风格是：\n- 深度分析AI工具的使用场景和价值\n- 分享AI如何改变工作和生活方式\n- 不是单纯晒工具，而是讲背后的思维\n- 对比不同AI工具的优劣\n- 给出具体的使用技巧和prompt范例\n\n语气：专业、有深度、前瞻性，但不晦涩\n\n回复格式：\n1. 抛出一个有价值的问题/观点\n2. 展开分析和分享\n3. 给出具体方法/技巧',
  },
];

type Account = {
  id: string;
  nickname: string;
  avatar: string;
  status: 'valid' | 'expired';
  authFile: string;
  createdAt: string;
};

type Persona = {
  id: string;
  name: string;
  prompt: string;
  boundAccountId: string | null;
};

const freshPersona = (): Persona => ({
  id: Date.now().toString(),
  name: '',
  prompt: '',
  boundAccountId: null,
});

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add account modal
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Persona editor modal
  const [showPersonaEditor, setShowPersonaEditor] = useState(false);
  const [editorData, setEditorData] = useState<Persona>(freshPersona());
  const [isNewPersona, setIsNewPersona] = useState(true);
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ar, pr] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/personas'),
      ]);
      if (ar.ok) setAccounts(await ar.json());
      if (pr.ok) setPersonas(await pr.json());
    } catch (e) {
      console.error('加载数据失败:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Account ops ─────────────────────────────────────────────────────────────
  const addAccount = async () => {
    if (!newNickname.trim()) return;
    setIsAddingAccount(true);
    try {
      const r = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: newNickname.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newNickname)}`,
          authFile: '',
        }),
      });
      if (r.ok) {
        const acc = await r.json();
        setAccounts(prev => [...prev, acc]);
        setNewNickname('');
        setShowAddAccount(false);
        showToast('账号已添加', 'success');
      } else {
        throw new Error('添加失败');
      }
    } catch {
      showToast('添加账号失败', 'error');
    } finally {
      setIsAddingAccount(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('确定删除此账号？删除后关联的人设将自动解绑。')) return;
    try {
      const r = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (r.ok) {
        setAccounts(prev => prev.filter(a => a.id !== id));
        setPersonas(prev => prev.map(p => p.boundAccountId === id ? { ...p, boundAccountId: null } : p));
        showToast('账号已删除', 'success');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  // ── Persona binding ──────────────────────────────────────────────────────────
  // personaId = '' means unbind current
  const setAccountPersona = async (accountId: string, personaId: string) => {
    const originalPersonas = [...personas];
    const updated = personas.map(p => {
      if (personaId && p.id === personaId) return { ...p, boundAccountId: accountId };
      if (p.boundAccountId === accountId) return { ...p, boundAccountId: null }; // unbind old
      return p;
    });
    setPersonas(updated);

    for (const p of updated) {
      const orig = originalPersonas.find(op => op.id === p.id);
      if (orig?.boundAccountId !== p.boundAccountId) {
        await fetch('/api/personas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).catch(e => console.warn('保存人设绑定失败:', e));
      }
    }
    showToast(personaId ? '人设已绑定 ✓' : '已解绑人设', 'success');
  };

  // ── Persona editor ───────────────────────────────────────────────────────────
  const openNewPersona = () => {
    setEditorData(freshPersona());
    setIsNewPersona(true);
    setShowPersonaEditor(true);
  };

  const openEditPersona = (persona: Persona) => {
    setEditorData({ ...persona });
    setIsNewPersona(false);
    setShowPersonaEditor(true);
  };

  const savePersona = async () => {
    if (!editorData.name.trim()) { showToast('请填写人设名称', 'error'); return; }
    if (!editorData.prompt.trim()) { showToast('请填写 System Prompt 内容', 'error'); return; }
    setIsSavingPersona(true);
    try {
      const originalPersonas = [...personas];
      let toSave: Persona[] = [editorData];

      // If binding to an account, unset any other persona currently bound there
      let updatedPersonas = personas.map(p => {
        if (p.id === editorData.id) return editorData;
        if (editorData.boundAccountId && p.boundAccountId === editorData.boundAccountId) {
          const unbound = { ...p, boundAccountId: null };
          toSave.push(unbound);
          return unbound;
        }
        return p;
      });

      // If new persona, add it
      const exists = originalPersonas.some(p => p.id === editorData.id);
      if (!exists) updatedPersonas = [...updatedPersonas, editorData];

      setPersonas(updatedPersonas);

      for (const p of toSave) {
        await fetch('/api/personas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
      }

      setShowPersonaEditor(false);
      showToast(isNewPersona ? '人设已创建 ✓' : '人设已保存 ✓', 'success');
    } catch {
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsSavingPersona(false);
    }
  };

  const deletePersona = async (id: string) => {
    if (!confirm('确定删除此人设？此操作不可恢复。')) return;
    try {
      await fetch('/api/personas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPersonas(prev => prev.filter(p => p.id !== id));
      showToast('人设已删除', 'success');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              <span>Identity Manager</span>
              <span className="text-slate-400 font-normal">身份管理</span>
            </h1>
            <p className="text-slate-400 text-sm">账号管理 · 人设配置 · 多身份切换</p>
          </div>

          {/* ── Relationship explanation ── */}
          <div className="mb-8 bg-gradient-to-br from-indigo-900/40 via-slate-800/60 to-purple-900/30 rounded-xl border border-indigo-500/30 p-6">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-5">账号与人设的关系</p>
            <div className="flex items-start gap-3 flex-wrap">
              {/* Account block */}
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 min-w-[160px]">
                <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">小红书账号</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">你的账号登录凭证<br />对应你的小红书主页</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 pt-3">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">绑定一个</span>
              </div>

              {/* Persona block */}
              <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 min-w-[160px]">
                <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">AI 人设</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">System Prompt<br />决定 AI 的风格与口吻</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 pt-3">
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] text-slate-500 whitespace-nowrap">自动应用于</span>
              </div>

              {/* Output targets */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="bg-slate-700/60 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0" />
                  AI 创作台 · 内容风格与写作角度
                </div>
                <div className="bg-slate-700/60 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0" />
                  变现设置 · 私信话术 AI 生成
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-5 leading-relaxed">
              💡 每个账号绑定一个人设。在 AI 创作台选择不同账号时，AI 会自动切换为对应人设的风格。多个账号可使用不同人设，实现多身份差异化运营。
            </p>
          </div>

          {/* ── Section 1: Accounts ── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  我的小红书账号
                  <span className="text-sm font-normal text-slate-500">（{accounts.length} 个）</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">每个账号可在右侧下拉绑定一个 AI 人设，创作时自动匹配风格</p>
              </div>
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />添加账号
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-slate-800/50 border border-dashed border-slate-600 rounded-xl p-10 text-center">
                <User className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-1">还没有小红书账号</p>
                <p className="text-slate-600 text-xs">点击「添加账号」开始</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(account => {
                  const boundPersona = personas.find(p => p.boundAccountId === account.id);
                  return (
                    <div key={account.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4">
                      <img
                        src={account.avatar}
                        alt={account.nickname}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100">{account.nickname}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {account.status === 'valid' ? (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />凭证有效
                            </span>
                          ) : (
                            <span className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />凭证过期
                            </span>
                          )}
                          {boundPersona && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Wand2 className="w-2.5 h-2.5" />{boundPersona.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div>
                          <p className="text-[10px] text-slate-500 mb-1 text-right">绑定人设</p>
                          <select
                            value={boundPersona?.id || ''}
                            onChange={(e) => setAccountPersona(account.id, e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-sm text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="">未绑定</option>
                            {personas.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="p-2 hover:bg-red-900/30 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                          title="删除账号"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 2: Persona Library ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  人设库
                  <span className="text-sm font-normal text-slate-500">（{personas.length} 个）</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  人设是给 AI 的角色扮演指令（System Prompt），绑定账号后自动用于 AI 创作台与变现设置
                </p>
              </div>
              <button
                onClick={openNewPersona}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />新建人设
              </button>
            </div>

            {personas.length === 0 ? (
              <div className="bg-slate-800/50 border border-dashed border-slate-600 rounded-xl p-10 text-center">
                <Wand2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-1">还没有人设</p>
                <p className="text-slate-600 text-xs mb-5">创建你的第一个 AI 人设，可从预设模板一键填入</p>
                <button
                  onClick={openNewPersona}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />新建人设
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {personas.map(persona => {
                  const boundAccount = accounts.find(a => a.id === persona.boundAccountId);
                  return (
                    <div key={persona.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Wand2 className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <p className="font-semibold text-slate-100">{persona.name}</p>
                              {boundAccount ? (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                  <ArrowRight className="w-2.5 h-2.5" />{boundAccount.nickname}
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-700 text-slate-500 border border-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  未绑定账号
                                </span>
                              )}
                            </div>
                            {persona.prompt ? (
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                {persona.prompt.split('\n').filter(l => l.trim()).join(' · ').slice(0, 120)}
                                {persona.prompt.length > 120 ? '...' : ''}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-600 italic">暂无内容，点击「编辑」完善</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditPersona(persona)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-slate-100 transition-colors font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5" />编辑
                          </button>
                          <button
                            onClick={() => deletePersona(persona.id)}
                            className="p-1.5 hover:bg-red-900/30 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            title="删除人设"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Add Account Modal ── */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                添加小红书账号
              </h3>
              <button onClick={() => setShowAddAccount(false)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">小红书昵称</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAddingAccount && addAccount()}
                  placeholder="请输入你的小红书昵称"
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-300 text-xs flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>账号添加后，请前往<strong>自动化中心</strong>完成 RPA 本地授权，以启用自动发布功能。</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addAccount}
                  disabled={isAddingAccount || !newNickname.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
                >
                  {isAddingAccount ? '添加中...' : '保存账号'}
                </button>
                <button
                  onClick={() => { setShowAddAccount(false); setNewNickname(''); }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Persona Editor Modal ── */}
      {showPersonaEditor && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Sticky header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{isNewPersona ? '新建人设' : '编辑人设'}</h3>
              </div>
              <button
                onClick={() => setShowPersonaEditor(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  人设名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editorData.name}
                  onChange={e => setEditorData(d => ({ ...d, name: e.target.value }))}
                  placeholder="例如：副业达人小王、AI 思考博主、生活哲学家..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preset templates */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-1 text-amber-400" />
                  快速开始：选择预设模板（点击填入后可修改）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PERSONAS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setEditorData(d => ({ ...d, name: preset.name, prompt: preset.prompt }))}
                      className="text-left p-3 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-all group"
                    >
                      <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{preset.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{preset.prompt.split('\n')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    System Prompt（人设指令）<span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={() => { navigator.clipboard.writeText(editorData.prompt); showToast('已复制到剪贴板', 'success'); }}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />复制
                  </button>
                </div>
                <textarea
                  value={editorData.prompt}
                  onChange={e => setEditorData(d => ({ ...d, prompt: e.target.value }))}
                  rows={10}
                  placeholder={`描述 AI 的角色、语气、内容风格、常用口头禅等...\n例如：\n你是一个接地气的副业达人。你的风格是：\n- 用大白话讲副业，拒绝高大上的术语\n- 经常分享真实数据和亲身经历\n- 语气亲切幽默，像朋友聊天...`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Bound Account */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">绑定到账号（选填）</label>
                <p className="text-xs text-slate-500 mb-2">
                  绑定后，在 AI 创作台或变现设置中选择该账号时，此人设将自动生效
                </p>
                <select
                  value={editorData.boundAccountId || ''}
                  onChange={e => setEditorData(d => ({ ...d, boundAccountId: e.target.value || null }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">不绑定任何账号（可在创作台手动选择）</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.nickname}</option>)}
                </select>
              </div>

              {/* Tips */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />好的人设 Prompt 包含哪些要素？
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 leading-relaxed">
                  <li>• <span className="text-slate-300 font-medium">角色定位</span>：副业达人、AI 博主、生活哲学家...</li>
                  <li>• <span className="text-slate-300 font-medium">语言风格</span>：口语化亲切 / 专业深度 / 幽默风趣...</li>
                  <li>• <span className="text-slate-300 font-medium">内容结构</span>：如何开头、如何分段、如何结尾</li>
                  <li>• <span className="text-slate-300 font-medium">禁忌规范</span>：不能提什么话题、避免什么表达</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500">保存后立即在 AI 创作台和变现设置中生效</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPersonaEditor(false)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={savePersona}
                    disabled={isSavingPersona}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
                  >
                    {isSavingPersona ? '保存中...' : (isNewPersona ? '创建人设' : '保存更改')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-[100] ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
          }
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
