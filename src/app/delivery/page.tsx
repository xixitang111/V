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
  Store,
  MessageSquare,
  Gift,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';

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

const mockInitialSettings: DeliverySettings = {
  products: [
    {
      id: 1,
      name: '自媒体起号SOP手册',
      sellingPoints: '包含完整的30天起号计划、爆款标题公式、内容选题库，帮助新手0基础快速上手小红书',
      storeLink: '🔑 口令: 起号手册'
    },
    {
      id: 2,
      name: '副业搞钱实操课',
      sellingPoints: '10个可复制的副业案例、从0到1的落地步骤、避坑指南，让你少走弯路',
      storeLink: '🔗 https://shop.xiaohongshu.com/xxx'
    }
  ],
  autoDmReception: true,
  defaultWelcomeMessage: '哈喽！看主页店铺直接拍，全自动发货~ 遇到问题随时留言',
  aiSalesPrompt: '当用户在私信询问价格或犹豫时，强调这份资料能帮他们省去一周的摸索时间，并再次发送商品口令',
  postPurchaseCare: true,
  reviewPrompt: '资料收到啦，觉得有帮助的话麻烦在店铺给个五星好评哦，截图发我再送你一份隐藏资料！'
};

export default function DeliveryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<DeliverySettings>(mockInitialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    sellingPoints: '',
    storeLink: ''
  });

  const menuItems = [
    { icon: Home, label: '灵感有标价', href: '/home', highlight: true },
    { icon: LayoutDashboard, label: '数据中心', href: '/dashboard' },
    { icon: Users, label: '身份管理', href: '/accounts' },
    { icon: Sparkles, label: 'AI创作', href: '/' },
    { icon: Bot, label: '自动化', href: '/automation' },
    { icon: ShoppingCart, label: '变现设置', active: true, href: '/delivery' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings/delivery');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('✅ 转化与交付配置已保存', 'success');
      } else {
        showToast('❌ 保存失败，请重试', 'error');
      }
    } catch (error) {
      showToast('❌ 保存失败，请重试', 'error');
    }
    setIsSaving(false);
  };

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    const product: Product = {
      ...newProduct,
      id: Date.now()
    };
    setSettings({
      ...settings,
      products: [...settings.products, product]
    });
    setNewProduct({ name: '', sellingPoints: '', storeLink: '' });
    setShowAddProduct(false);
  };

  const removeProduct = (id: number) => {
    setSettings({
      ...settings,
      products: settings.products.filter(p => p.id !== id)
    });
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
        <div className="p-8 max-w-5xl mx-auto relative">
          <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1.5 shadow-md">
            🚧 测试开发中
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-indigo-400" />
                <span>Monetization</span>
                <span className="text-slate-400 font-normal">变现设置</span>
              </h1>
              <p className="text-slate-400 text-sm">商品管理 · 销售转化 · 售后关怀 · Products · Sales</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? '保存中...' : '保存配置'}
            </button>
          </div>

          {/* 卡片 A：小红书店铺与商品库 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-xl font-semibold">小红书店铺与商品库</h2>
                <p className="text-slate-400 text-sm">配置你的知识付费产品，供 AI 机器人随时调用</p>
              </div>
            </div>

            {/* 商品列表 */}
            <div className="space-y-4 mb-6">
              {settings.products.map((product) => (
                <div key={product.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100 mb-1">{product.name}</h3>
                      <p className="text-slate-400 text-sm mb-2">{product.sellingPoints}</p>
                      <p className="text-indigo-400 text-sm font-mono">{product.storeLink}</p>
                    </div>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="ml-4 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 添加商品表单 */}
            {showAddProduct ? (
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">商品名称</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：自媒体起号SOP手册"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">商品核心卖点</label>
                  <textarea
                    value={newProduct.sellingPoints}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPoints: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="告诉大模型这个资料解决什么痛点，方便 AI 自动生成推销话术"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">店铺直达口令/链接</label>
                  <input
                    type="text"
                    value={newProduct.storeLink}
                    onChange={(e) => setNewProduct({ ...newProduct, storeLink: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例如：🔑 口令: 起号手册 或 https://shop.xiaohongshu.com/xxx"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    确认添加
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProduct({ name: '', sellingPoints: '', storeLink: '' });
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加商品
              </button>
            )}
          </div>

          {/* 卡片 B：私信承接与转化话术 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold">私信承接与转化话术</h2>
                <p className="text-slate-400 text-sm">当用户被评论区截流吸引，主动私信你时，AI 机器人的自动接待策略</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* 全局开关 */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium text-slate-100">开启智能私信接待</p>
                  <p className="text-slate-400 text-sm">Auto-DM Reception</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoDmReception: !settings.autoDmReception })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoDmReception ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoDmReception ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 默认欢迎语 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">默认欢迎语</label>
                <textarea
                  value={settings.defaultWelcomeMessage}
                  onChange={(e) => setSettings({ ...settings, defaultWelcomeMessage: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="用户发来第一条消息时的快速回复"
                />
              </div>

              {/* AI 逼单促单设定 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">AI 逼单促单设定</label>
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-400 text-xs">System Prompt 微调，告诉大模型如何促单</p>
                </div>
                <textarea
                  value={settings.aiSalesPrompt}
                  onChange={(e) => setSettings({ ...settings, aiSalesPrompt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="当用户在私信询问价格或犹豫时，强调这份资料能帮他们省去一周的摸索时间..."
                />
              </div>
            </div>
          </div>

          {/* 卡片 C：交付后关怀 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-green-400" />
              <div>
                <h2 className="text-xl font-semibold">交付后关怀</h2>
                <p className="text-slate-400 text-sm">用户在店铺下单后的自动化服务（预留拓展）</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* 开关 */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium text-slate-100">开启售后关怀</p>
                  <p className="text-slate-400 text-sm">Post-Purchase Care</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, postPurchaseCare: !settings.postPurchaseCare })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.postPurchaseCare ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.postPurchaseCare ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 好评引导话术 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">好评引导话术</label>
                <textarea
                  value={settings.reviewPrompt}
                  onChange={(e) => setSettings({ ...settings, reviewPrompt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="资料收到啦，觉得有帮助的话麻烦在店铺给个五星好评哦..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast 提示 */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
