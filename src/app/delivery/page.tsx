'use client';

import { useState, useEffect } from 'react';
import {
  Store, MessageSquare, Gift, Plus, Save, Trash2,
  CheckCircle2, AlertCircle, ShoppingCart, Sparkles,
  RefreshCw, Eye, User, ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getSetting, saveSetting } from '@/lib/settings';

interface Product {
  id: number;
  name: string;
  sellingPoints: string;
  storeLink: string;
}

interface DeliverySettings {
  products: Product[];
  autoDmReception: boolean;
  defaultWelcomeMessage: string;
  aiSalesPrompt: string;
  postPurchaseCare: boolean;
  reviewPrompt: string;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  products: [
    { id: 1, name: '自媒体起号SOP手册', sellingPoints: '包含完整的30天起号计划、爆款标题公式、内容选题库，帮助新手0基础快速上手小红书', storeLink: '🔑 口令: 起号手册' },
    { id: 2, name: '副业搞钱实操课', sellingPoints: '10个可复制的副业案例、从0到1的落地步骤、避坑指南，让你少走弯路', storeLink: '🔗 https://shop.xiaohongshu.com/xxx' },
  ],
  autoDmReception: true,
  defaultWelcomeMessage: '哈喽！看主页店铺直接拍，全自动发货~ 遇到问题随时留言',
  aiSalesPrompt: '当用户在私信询问价格或犹豫时，强调这份资料能帮他们省去一周的摸索时间，并再次发送商品口令',
  postPurchaseCare: true,
  reviewPrompt: '资料收到啦，觉得有帮助的话麻烦在店铺给个五星好评哦，截图发我再送你一份隐藏资料！',
};

// 私信对话预览的模拟消息
function DmPreview({ settings }: { settings: DeliverySettings }) {
  const [step, setStep] = useState(0);
  const productName = settings.products[0]?.name || '你的商品';
  const storeLink = settings.products[0]?.storeLink || '口令: 商品';

  const conversation = [
    { role: 'user', text: '你好，我看了你的笔记，想了解一下' },
    { role: 'bot', text: settings.defaultWelcomeMessage || '哈喽！' },
    { role: 'user', text: `这个《${productName}》多少钱啊，值得买吗？` },
    { role: 'bot', text: `值得的！${settings.aiSalesPrompt ? '买完能帮你省大量摸索时间。' : ''}直接搜这个口令下单：${storeLink}` },
    { role: 'user', text: '好的收到了！' },
    { role: 'bot', text: settings.reviewPrompt || '感谢购买！' },
  ];

  const visible = conversation.slice(0, step + 1);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">私信对话预览</p>
          <p className="text-xs text-slate-500">AI 机器人视角</p>
        </div>
      </div>

      <div className="space-y-3 min-h-32 mb-4">
        {visible.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
            {msg.role === 'bot' && (
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Zap className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'bot'
                ? 'bg-slate-700 text-slate-100 rounded-tl-none'
                : 'bg-indigo-600 text-white rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setStep(Math.min(step + 1, conversation.length - 1))}
          disabled={step >= conversation.length - 1}
          className="flex-1 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium">
          {step >= conversation.length - 1 ? '✅ 完整流程演示完毕' : '下一条消息 →'}
        </button>
        <button onClick={() => setStep(0)} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
          重播
        </button>
      </div>
    </div>
  );
}

function AiGenButton({ onClick, loading, hint }: { onClick: () => void; loading: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      {hint && (
        <span className="text-[10px] text-slate-500 italic max-w-[180px] text-right leading-tight">{hint}</span>
      )}
      <button onClick={onClick} disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all font-medium whitespace-nowrap">
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        {loading ? 'AI 生成中...' : '✨ AI 一键生成'}
      </button>
    </div>
  );
}

export default function DeliveryPage() {
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', sellingPoints: '', storeLink: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [persona, setPersona] = useState('知识付费博主');
  const [personaList, setPersonaList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // 从 Supabase/localStorage 加载配置
    getSetting('delivery_settings', DEFAULT_SETTINGS).then(data => {
      setSettings(data);
      setIsLoading(false);
    });
    // 加载全部人设列表（用于 AI 生成下拉）
    fetch('/api/personas').then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setPersonaList(data);
        setPersona(data[0].name);
      }
    }).catch(() => {});
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSetting('delivery_settings', settings);
      showToast('✅ 转化与交付配置已保存', 'success');
    } catch {
      showToast('❌ 保存失败，请重试', 'error');
    }
    setIsSaving(false);
  };

  const generateCopy = async (type: 'welcome' | 'sales' | 'review') => {
    setAiLoading(l => ({ ...l, [type]: true }));
    try {
      const currentText = type === 'welcome' ? settings.defaultWelcomeMessage
        : type === 'sales' ? settings.aiSalesPrompt : settings.reviewPrompt;
      const res = await fetch('/api/generate/sales-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, products: settings.products, persona, currentText }),
      });
      if (!res.ok) throw new Error('生成失败');
      const data = await res.json();
      if (data.text) {
        if (type === 'welcome') setSettings(s => ({ ...s, defaultWelcomeMessage: data.text }));
        else if (type === 'sales') setSettings(s => ({ ...s, aiSalesPrompt: data.text }));
        else setSettings(s => ({ ...s, reviewPrompt: data.text }));
        showToast('✅ AI 话术已生成', 'success');
      }
    } catch {
      showToast('❌ AI 生成失败，请重试', 'error');
    }
    setAiLoading(l => ({ ...l, [type]: false }));
  };

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    setSettings(s => ({ ...s, products: [...s.products, { ...newProduct, id: Date.now() }] }));
    setNewProduct({ name: '', sellingPoints: '', storeLink: '' });
    setShowAddProduct(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1.5">
            🚧 测试开发中
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-indigo-400" />
                <span>Monetization</span>
                <span className="text-slate-400 font-normal">变现设置</span>
              </h1>
              <p className="text-slate-400 text-sm">商品管理 · 私信转化 · 售后关怀 · AI 话术生成</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowPreview(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all text-sm">
                <Eye className="w-4 h-4" />
                {showPreview ? '隐藏预览' : '私信流程预览'}
                {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button onClick={saveSettings} disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium transition-all disabled:opacity-50 text-sm">
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>

          {/* 私信预览 */}
          {showPreview && (
            <div className="mb-6">
              <DmPreview settings={settings} />
            </div>
          )}

          {/* 人设选择 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6 flex items-center gap-4">
            <User className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">当前人设（用于 AI 生成话术）</p>
              <p className="text-xs text-slate-400 mt-0.5">AI 将用此人设的风格生成欢迎语、促单话术和好评引导</p>
            </div>
            {personaList.length > 0 ? (
              <select value={persona} onChange={e => setPersona(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                {personaList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            ) : (
              <div className="text-right">
                <p className="text-xs text-slate-400">当前使用默认风格「知识付费博主」</p>
                <a href="/accounts" className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  前往身份管理创建你的人设 →
                </a>
              </div>
            )}
          </div>

          {/* 卡片 A：商品库 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">小红书店铺与商品库</h2>
                <p className="text-slate-400 text-xs">配置知识付费商品，AI 机器人私信时会自动调用卖点话术</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {settings.products.map((product) => (
                <div key={product.id} className="bg-slate-900 rounded-xl p-4 border border-slate-700 flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShoppingCart className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 text-sm mb-1">{product.name}</p>
                    <p className="text-slate-400 text-xs mb-1.5 leading-relaxed">{product.sellingPoints}</p>
                    <p className="text-indigo-400 text-xs font-mono">{product.storeLink}</p>
                  </div>
                  <button onClick={() => setSettings(s => ({ ...s, products: s.products.filter(p => p.id !== product.id) }))}
                    className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {showAddProduct ? (
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="商品名称" />
                <textarea value={newProduct.sellingPoints} onChange={e => setNewProduct({ ...newProduct, sellingPoints: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2} placeholder="核心卖点（AI 会据此生成推销话术）" />
                <input type="text" value={newProduct.storeLink} onChange={e => setNewProduct({ ...newProduct, storeLink: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="店铺口令或链接，例如：🔑 口令: 起号手册" />
                <div className="flex gap-2">
                  <button onClick={addProduct} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> 确认添加
                  </button>
                  <button onClick={() => setShowAddProduct(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">取消</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> 添加商品
              </button>
            )}
          </div>

          {/* 卡片 B：私信承接 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">私信承接与转化话术</h2>
                <p className="text-slate-400 text-xs">用户从评论区被截流后主动私信时，AI 机器人的接待策略</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-xs text-slate-400">智能接待</span>
                <button onClick={() => setSettings(s => ({ ...s, autoDmReception: !s.autoDmReception }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.autoDmReception ? 'bg-green-600' : 'bg-slate-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.autoDmReception ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">默认欢迎语</label>
                  <AiGenButton
                    onClick={() => generateCopy('welcome')}
                    loading={!!aiLoading.welcome}
                    hint="根据你的人设 + 商品卖点生成，非随机"
                  />
                </div>
                <p className="text-xs text-slate-500 mb-2">用户第一次私信你时，AI 机器人会自动发出此欢迎语</p>
                <textarea value={settings.defaultWelcomeMessage}
                  onChange={e => setSettings(s => ({ ...s, defaultWelcomeMessage: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2} placeholder="用户发第一条消息时的快速回复" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <label className="text-sm font-medium text-slate-300">AI 促单指令</label>
                  </div>
                  <AiGenButton
                    onClick={() => generateCopy('sales')}
                    loading={!!aiLoading.sales}
                    hint="AI 用此指令决定如何促成交易"
                  />
                </div>
                <p className="text-xs text-slate-500 mb-2">当用户询价或犹豫时，AI 机器人会按照此指令回复 —— 你可以直接手写，也可以点「AI 一键生成」让 AI 根据你的商品和人设帮你写</p>
                <textarea value={settings.aiSalesPrompt}
                  onChange={e => setSettings(s => ({ ...s, aiSalesPrompt: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3} placeholder="例如：当用户犹豫时，强调资料能帮他省去一周摸索时间..." />
              </div>
            </div>
          </div>

          {/* 卡片 C：售后关怀 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">交付后关怀</h2>
                <p className="text-slate-400 text-xs">用户下单后的自动化好评引导</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-xs text-slate-400">售后关怀</span>
                <button onClick={() => setSettings(s => ({ ...s, postPurchaseCare: !s.postPurchaseCare }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.postPurchaseCare ? 'bg-green-600' : 'bg-slate-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.postPurchaseCare ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-300">好评引导话术</label>
                <AiGenButton
                  onClick={() => generateCopy('review')}
                  loading={!!aiLoading.review}
                  hint="自动用你的商品名生成，带钩子话术"
                />
              </div>
              <p className="text-xs text-slate-500 mb-2">用户下单后自动发送，引导留好评 + 返图领隐藏资料</p>
              <textarea value={settings.reviewPrompt}
                onChange={e => setSettings(s => ({ ...s, reviewPrompt: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={2} placeholder="资料收到啦，觉得有帮助的话麻烦给个五星好评哦..." />
            </div>

            {/* 好评引导流程说明 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { step: '1', text: '用户下单后自动发送好评引导私信' },
                { step: '2', text: '用户截图好评 → 回私信赠送隐藏资料' },
                { step: '3', text: '店铺好评积累 → 提升商品权重与信任度' },
              ].map(item => (
                <div key={item.step} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold mb-2">{item.step}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
