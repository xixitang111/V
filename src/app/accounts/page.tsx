'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bot,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  User,
  X,
  Settings,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Copy,
  Wand2,
  Home
} from 'lucide-react';

const PRESET_PERSONAS = [
  {
    name: '生活哲学家',
    prompt: '你是一位生活哲学家。你的风格是：\n- 用深刻的哲学思考解读生活和成长\n- 把复杂的道理用生活化的语言解释\n- 经常引用名人名言和生活感悟\n- 分享成长心得，但不显得功利\n- 鼓励读者思考生活的意义和方向\n\n语气：温暖、睿智、有深度，像一位老朋友在聊天\n\n回复格式：\n1. 先用一句哲理性的话开头\n2. 然后分享具体内容\n3. 最后给读者留下思考空间'
  },
  {
    name: '副业达人小王',
    prompt: '你是副业达人小王，一个接地气的搞钱专家。你的风格是：\n- 真实分享自己的副业经历，包括踩过的坑\n- 用大白话讲副业，拒绝高大上的术语\n- 重点讲可复制的实操方法，不是鸡汤\n- 经常晒真实数据（收入截图、订单量等）\n- 鼓励普通人开始副业，打消顾虑\n- 偶尔会吐槽，但总体积极向上\n\n语气：亲切、真实、有点幽默，像隔壁老大哥在跟你聊天\n\n回复格式：\n1. 直接点题，不绕弯子\n2. 讲具体方法，最好分步骤\n3. 给出真实数据参考\n4. 鼓励行动'
  },
  {
    name: '创业搞钱日记',
    prompt: '你是创业搞钱日记，记录创业路上的点点滴滴。你的风格是：\n- 日记形式，记录每天的进展和感悟\n- 真实展现创业的酸甜苦辣，不美化\n- 分享商业模式、获客方法、营收数据\n- 分析失败原因，总结成功经验\n- 给创业者实用建议\n- 展现坚持和成长的过程\n\n语气：真实、坦诚、有力量，像在看一本真实的创业日记\n\n回复格式：\n1. 日期/第X天\n2. 今日进展/感悟\n3. 数据/成果\n4. 明日计划/思考'
  },
  {
    name: 'AI思考分享博主',
    prompt: '你是AI思考分享博主，专注于AI工具和思维方式。你的风格是：\n- 深度分析AI工具的使用场景和价值\n- 分享AI如何改变工作和生活方式\n- 不是单纯晒工具，而是讲背后的思维\n- 对比不同AI工具的优劣\n- 给出具体的使用技巧和prompt范例\n- 探讨AI时代的个人发展方向\n\n语气：专业、有深度、前瞻性，但不晦涩\n\n回复格式：\n1. 抛出一个有价值的问题/观点\n2. 展开分析和分享\n3. 给出具体方法/技巧\n4. 总结和升华'
  }
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

export default function AccountsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tempAccountData, setTempAccountData] = useState({ nickname: '', avatar: '' });
  const [authFile, setAuthFile] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState('');

  useEffect(() => {
    // 强制清除旧的 localStorage 数据
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibe_money_accounts');
      localStorage.removeItem('vibe_money_personas');
      localStorage.removeItem('vibe_money_data_version');
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, personasRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/personas')
      ]);
      
      if (accountsRes.ok) {
        setAccounts(await accountsRes.json());
      }
      if (personasRes.ok) {
        setPersonas(await personasRes.json());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
    { icon: Users, label: '身份管理', active: true, href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', href: '/' },
    { icon: Bot, label: '自动化', href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', href: '/delivery' },
  ];

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const startAuthorization = async () => {
    setIsAuthorizing(true);
    setIsAuthModalOpen(true);

    try {
      const response = await fetch('/api/accounts/auth', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        showToast('账号授权成功！请填写账号信息', 'success');
        
        // 每次都打开用户信息输入模态框
        setTempAccountData({
          nickname: '',
          avatar: ''
        });
        setAuthFile(data.authFile);
        setIsUserInfoModalOpen(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '授权失败');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '授权失败，请重试', 'error');
    } finally {
      setIsAuthorizing(false);
      setIsAuthModalOpen(false);
    }
  };

  const saveUserInfo = async () => {
    try {
      const nickname = tempAccountData.nickname.trim() || '新账号';
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`;
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname,
          avatar,
          authFile
        })
      });

      if (response.ok) {
        const newAccount = await response.json();
        
        const newPersona = {
          id: Date.now().toString(),
          name: nickname,
          prompt: '',
          boundAccountId: newAccount.id
        };
        
        const updatedPersonas = [...personas, newPersona];
        await fetch('/api/personas', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPersona)
        });
        
        setAccounts(prev => [...prev, newAccount]);
        setPersonas(updatedPersonas);
        setIsUserInfoModalOpen(false);
        setTempAccountData({ nickname: '', avatar: '' });
        setAuthFile('');
        showToast('账号添加成功！', 'success');
      } else {
        throw new Error('添加账号失败');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '添加账号失败', 'error');
    }
  };

  const reauthorizeAccount = (accountId: string) => {
    showToast('正在重新授权...', 'success');
  };

  const deleteAccount = async (accountId: string) => {
    if (confirm('确定要删除这个账号吗？')) {
      try {
        const response = await fetch('/api/accounts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: accountId })
        });

        if (response.ok) {
          setAccounts(prev => prev.filter(a => a.id !== accountId));
          setPersonas(prev => prev.map(p => 
            p.boundAccountId === accountId ? { ...p, boundAccountId: null } : p
          ));
          showToast('账号已删除', 'success');
        } else {
          throw new Error('删除账号失败');
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : '删除账号失败', 'error');
      }
    }
  };

  const bindAccountToPersona = async (personaId: string, accountId: string | null) => {
    try {
      const updatedPersonas = personas.map(p => 
        p.id === personaId ? { ...p, boundAccountId: accountId } : p
      );
      setPersonas(updatedPersonas);
      
      const persona = updatedPersonas.find(p => p.id === personaId);
      if (persona) {
        await fetch('/api/personas', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(persona)
        });
      }
      
      showToast('绑定关系已更新', 'success');
    } catch (error) {
      console.error('更新绑定关系失败:', error);
      showToast('更新绑定关系失败', 'error');
    }
  };

  const updatePersonaPrompt = async (personaId: string, prompt: string) => {
    try {
      const updatedPersonas = personas.map(p => 
        p.id === personaId ? { ...p, prompt } : p
      );
      setPersonas(updatedPersonas);
      
      const persona = updatedPersonas.find(p => p.id === personaId);
      if (persona) {
        await fetch('/api/personas', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(persona)
        });
      }
    } catch (error) {
      console.error('更新人设失败:', error);
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
        <div className="p-8 max-w-7xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1.5 shadow-md">
            🚧 测试开发中
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              <span>Identity Manager</span>
              <span className="text-slate-400 font-normal">身份管理</span>
            </h1>
            <p className="text-slate-400 text-sm">账号管理 · 人设配置 · 多身份切换 · Accounts · Personas</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={startAuthorization}
                disabled={isAuthorizing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthorizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    授权中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    添加小红书账号
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {accounts.map((account) => {
                const persona = personas.find(p => p.boundAccountId === account.id);
                const isExpanded = selectedPersona?.boundAccountId === account.id;
                const isEditingNickname = editingAccountId === account.id;
                
                return (
                  <div key={account.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            src={account.avatar}
                            alt={account.nickname}
                            className="w-14 h-14 rounded-full"
                          />
                          <div className="flex-1">
                            {isEditingNickname ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingNickname}
                                  onChange={(e) => setEditingNickname(e.target.value)}
                                  onBlur={async () => {
                                    if (editingNickname.trim() && editingNickname !== account.nickname) {
                                      const updatedAccounts = accounts.map(a => 
                                        a.id === account.id ? { ...a, nickname: editingNickname.trim() } : a
                                      );
                                      setAccounts(updatedAccounts);
                                      
                                      await fetch('/api/accounts', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: account.id, nickname: editingNickname.trim() })
                                      });
                                      
                                      showToast('账号名称已更新', 'success');
                                    }
                                    setEditingAccountId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingNickname(account.nickname);
                                      setEditingAccountId(null);
                                    }
                                  }}
                                  className="flex-1 bg-slate-950 border border-indigo-500 rounded-lg px-3 py-1.5 text-slate-200 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <h3 
                                className="font-semibold text-slate-100 text-lg cursor-pointer hover:text-indigo-400 transition-colors"
                                onClick={() => {
                                  setEditingNickname(account.nickname);
                                  setEditingAccountId(account.id);
                                }}
                              >
                                {account.nickname}
                              </h3>
                            )}
                            <div className="flex items-center gap-3 flex-wrap mt-1">
                              <div className="flex items-center gap-2 text-sm">
                                {account.status === 'valid' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">凭证有效</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400">凭证过期</span>
                                  </>
                                )}
                              </div>
                              {persona && (
                                <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">
                                  <Wand2 className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium truncate max-w-[180px]">{persona.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => reauthorizeAccount(account.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                            title="重新授权"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedPersona(
                              isExpanded ? null : (persona || { 
                                id: Date.now().toString(),
                                name: account.nickname,
                                prompt: '',
                                boundAccountId: account.id
                              })
                            )}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                              isExpanded 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30'
                            }`}
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">{isExpanded ? '收起' : '编辑人设'}</span>
                          </button>
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && selectedPersona && (
                      <div className="border-t border-slate-700 bg-slate-900">
                        <div className="p-6 space-y-6">
                          {/* 人设名称 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-slate-400">
                                <Wand2 className="w-4 h-4 inline mr-1" />
                                人设名称
                              </label>
                              <button
                                onClick={() => {
                                  const updatedPersona = { ...selectedPersona, name: account.nickname };
                                  setSelectedPersona(updatedPersona);
                                  const updatedPersonas = personas.map(p => 
                                    p.id === selectedPersona.id ? updatedPersona : p
                                  );
                                  setPersonas(updatedPersonas);
                                  showToast('已同步账号名称', 'success');
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                同步账号名称
                              </button>
                            </div>
                            <input
                              type="text"
                              value={selectedPersona.name}
                              onChange={(e) => {
                                const updatedPersona = { ...selectedPersona, name: e.target.value };
                                setSelectedPersona(updatedPersona);
                                const updatedPersonas = personas.map(p => 
                                  p.id === selectedPersona.id ? updatedPersona : p
                                );
                                setPersonas(updatedPersonas);
                              }}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          
                          {/* 预设人设选择 */}
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-3">
                              <Lightbulb className="w-4 h-4 inline mr-1 text-amber-400" />
                              选择预设人设模板
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {PRESET_PERSONAS.map((preset, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    const updatedPersona = { 
                                      ...selectedPersona, 
                                      name: preset.name,
                                      prompt: preset.prompt
                                    };
                                    setSelectedPersona(updatedPersona);
                                    const updatedPersonas = personas.map(p => 
                                      p.id === selectedPersona.id ? updatedPersona : p
                                    );
                                    setPersonas(updatedPersonas);
                                    showToast('已应用预设模板', 'success');
                                  }}
                                  className="text-left p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-all group"
                                >
                                  <div className="font-medium text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">
                                    {preset.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                                    {preset.prompt.split('\n')[0]}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* System Prompt 编辑 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-slate-400">
                                System Prompt
                              </label>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedPersona.prompt);
                                  showToast('已复制到剪贴板', 'success');
                                }}
                                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                复制
                              </button>
                            </div>
                            <textarea
                              value={selectedPersona.prompt}
                              onChange={(e) => {
                                const updatedPersona = { ...selectedPersona, prompt: e.target.value };
                                setSelectedPersona(updatedPersona);
                                const updatedPersonas = personas.map(p => 
                                  p.id === selectedPersona.id ? updatedPersona : p
                                );
                                setPersonas(updatedPersonas);
                              }}
                              rows={10}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                              placeholder="输入人设的System Prompt..."
                            />
                          </div>
                          
                          {/* 人设编辑建议 */}
                          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              人设编辑建议
                            </h4>
                            <ul className="text-xs text-slate-400 space-y-1.5">
                              <li>• 明确角色定位：比如"副业达人"、"技术博主"、"生活哲学家"等</li>
                              <li>• 定义语言风格：亲切、专业、幽默、睿智等</li>
                              <li>• 设定内容结构：如何开头、分点、结尾</li>
                              <li>• 添加专属标签：#副业 #搞钱 #AI 等相关话题</li>
                              <li>• 体现价值观：传递积极、真实、有价值的内容</li>
                            </ul>
                          </div>
                          
                          {/* 保存按钮 */}
                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                try {
                                  await fetch('/api/personas', {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(selectedPersona)
                                  });
                                  showToast('人设已保存', 'success');
                                } catch (error) {
                                  showToast('保存失败', 'error');
                                }
                              }}
                              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
                            >
                              保存人设
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-100">扫码授权</h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 text-center">
              {isAuthorizing ? (
                <>
                  <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-300 mb-2">正在唤起小红书安全登录环境</p>
                  <p className="text-slate-500 text-sm">请准备好手机 App 扫码...</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <p className="text-slate-300">授权成功！</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isUserInfoModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-100">完善账号信息</h3>
              </div>
              <button
                onClick={() => setIsUserInfoModalOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">小红书昵称</label>
                  <input
                    type="text"
                    value={tempAccountData.nickname}
                    onChange={(e) => setTempAccountData({ ...tempAccountData, nickname: e.target.value })}
                    placeholder="请输入小红书昵称"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveUserInfo}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all"
                  >
                    保存账号
                  </button>
                  <button
                    onClick={() => setIsUserInfoModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
