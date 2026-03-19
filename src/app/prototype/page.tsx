'use client';

import React, { useState } from 'react';
import { RefreshCw, Plus, CheckCircle2, ChevronRight, X, PlayCircle } from 'lucide-react';

// --- Shared Components ---

const Avatar = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
    AI
  </div>
);

const MessageHeader = () => (
  <div className="flex items-center gap-2 mb-1">
    <span className="text-[#333333] font-medium text-[14px]">小二</span>
    <span className="text-[#999999] text-[12px]">10:00</span>
  </div>
);

const GuideText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[#333333] text-[14px] leading-relaxed mb-3">
    {children}
  </div>
);

const GradientLabel = ({ text }: { text: string }) => (
  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[11px] px-1.5 py-0.5 rounded-[4px] font-medium inline-block mb-2">
    {text}
  </span>
);

const CTAButton = ({ 
  onClick, 
  disabled, 
  loading, 
  text, 
  successText 
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  loading?: boolean; 
  text: string;
  successText?: string;
}) => {
  if (successText) {
    return (
      <div className="w-full py-2.5 flex items-center justify-center gap-1.5 text-green-600 font-medium text-[15px]">
        <CheckCircle2 size={18} />
        {successText}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full relative rounded-md p-[1px] transition-all overflow-hidden ${
        disabled 
          ? 'bg-gray-200 cursor-not-allowed' 
          : 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] active:opacity-80'
      }`}
    >
      <div className={`w-full h-full rounded-[5px] flex items-center justify-center py-2 ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
        {loading ? (
          <span className="text-[#3B82F6] flex items-center gap-1.5 text-[14px] font-medium">
            <RefreshCw size={16} className="animate-spin" /> 创建中...
          </span>
        ) : (
          <span className={`${disabled ? 'text-gray-400' : 'text-[#3B82F6]'} text-[14px] font-medium`}>
            {text}
          </span>
        )}
      </div>
    </button>
  );
};

const ProductItem = ({ name, price, sales, score, imgUrl }: any) => (
  <div className="w-[100px] flex-shrink-0">
    <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg mb-1.5 overflow-hidden">
      <img src={imgUrl} alt="product" className="w-full h-full object-cover" />
    </div>
    <div className="text-[12px] text-[#333333] leading-[16px] line-clamp-1 mb-0.5">{name}</div>
    <div className="text-[12px] font-bold text-[#FF4D4F]">¥{price}</div>
    <div className="flex items-center justify-between mt-0.5">
      <div className="text-[10px] text-[#999999]">销量 {sales || '-'}</div>
      <div className="text-[10px] text-[#999999]">分 {score || '-'}</div>
    </div>
  </div>
);

// --- Strategies ---

// 2.1 Product Strategy (P0)
const ProductStrategy = () => {
  const [budget, setBudget] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'no_account' | 'low_score'>('idle');
  const [showEditor, setShowEditor] = useState(false);
  const [sortType, setSortType] = useState('gmv');
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2]);

  const products = [
    { id: 1, name: "夏季新款碎花裙", price: "99.00", sales: "128", score: "98", imgUrl: "https://picsum.photos/seed/p1/200/200" },
    { id: 2, name: "百搭直筒牛仔裤", price: "129.00", sales: "256", score: "95", imgUrl: "https://picsum.photos/seed/p2/200/200" },
    { id: 3, name: "法式复古衬衫", price: "89.00", sales: "-", score: "-", imgUrl: "https://picsum.photos/seed/p3/200/200" },
  ];

  const handlePublish = () => {
    setState('loading');
    setTimeout(() => {
      // Randomly choose a branch for demonstration
      const branches: any[] = ['success', 'no_account', 'low_score'];
      setState(branches[Math.floor(Math.random() * branches.length)]);
    }, 1500);
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex gap-3 px-4 pt-4 pb-10">
      <Avatar />
      <div className="flex-1">
        <MessageHeader />
        <GuideText>
          老板好，您最近上新了 <strong>6</strong> 个潜力商品呢，同行都在抓紧时间对新品投放测试，您也不能落后呀！我们特意为您准备了 <strong>500</strong> 元红包帮您提升新品销量，现在行动，额外获得 500元千川激励红包！
        </GuideText>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 relative">
          <div className="flex items-center justify-between mb-2">
            <GradientLabel text="潜力新品" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
            {products.filter(p => selectedIds.includes(p.id)).map(p => (
              <ProductItem key={p.id} {...p} />
            ))}
          </div>

          {/* Editor Toggle */}
          <button 
            onClick={() => setShowEditor(!showEditor)}
            className="w-full text-[12px] text-[#666666] flex items-center justify-center gap-1 py-2 border-t border-b border-gray-100 mb-3 hover:bg-gray-50 transition-colors"
          >
            手动增减商品 & 排序 <ChevronRight size={14} className={`transform transition-transform ${showEditor ? 'rotate-90' : ''}`} />
          </button>

          {showEditor && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 animate-fade-in">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setSortType('gmv')}
                  className={`text-[12px] px-3 py-1 rounded-full ${sortType === 'gmv' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  按 GMV 排序
                </button>
                <button 
                  onClick={() => setSortType('order')}
                  className={`text-[12px] px-3 py-1 rounded-full ${sortType === 'order' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  按订单量排序
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-100" onClick={() => toggleSelect(p.id)}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedIds.includes(p.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                      {selectedIds.includes(p.id) && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <img src={p.imgUrl} className="w-10 h-10 rounded object-cover" alt="prod" />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[12px] text-[#333333] line-clamp-1">{p.name}</div>
                      <div className="text-[11px] text-[#999999]">销量: {p.sales}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-2.5 mb-3 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#666666]">预估 ROI</span>
              <span className="text-[#333333] font-medium">1.5 - 2.8</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#666666]">推荐预算</span>
              <input 
                type="number" 
                placeholder="请输入预算" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-24 text-right bg-transparent border-b border-gray-300 focus:border-[#3B82F6] outline-none text-[#333333]"
              />
            </div>
          </div>

          <CTAButton 
            text="一键投广" 
            disabled={!budget || state === 'success' || selectedIds.length === 0} 
            loading={state === 'loading'} 
            onClick={handlePublish}
          />
        </div>

        {/* Branch B: No Account */}
        {state === 'no_account' && (
          <div className="animate-fade-in mt-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-[14px] text-[#333333] mb-4">您还没有创建账户哦，完成开户领取 500 元千川激励红包</div>
              <button className="w-full bg-[#3B82F6] text-white text-[14px] font-medium py-2 rounded-md active:bg-blue-600">
                跳转开户
              </button>
            </div>
          </div>
        )}

        {/* Branch C: Low Score */}
        {state === 'low_score' && (
          <div className="animate-fade-in mt-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-[14px] text-[#333333] mb-4">经营分不足，您还未满足所需经营分大于 60 的条件</div>
              <button className="w-full border border-[#3B82F6] text-[#3B82F6] text-[14px] font-medium py-2 rounded-md active:bg-blue-50">
                查看经营分如何提升
              </button>
            </div>
          </div>
        )}

        {/* Branch A: Success Chat Reply */}
        {state === 'success' && (
          <div className="animate-fade-in mt-2">
             <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center text-[#15803D] font-medium gap-1.5 mb-3">
                <CheckCircle2 size={18} />
                您的推广计划已成功创建！
              </div>
              <button className="w-full bg-white border border-[#22C55E] text-[#15803D] text-[14px] font-medium py-2 rounded-md shadow-sm">
                查看计划
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2.2 Short Video Strategy (P1)
const VideoStrategy = () => {
  const [budget, setBudget] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'no_account' | 'low_score'>('idle');
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [sortType, setSortType] = useState('play');
  const [selectedIds, setSelectedIds] = useState<number[]>([1]);

  const videos = [
    { 
      id: 1, 
      title: "初秋穿搭分享，这套法式复古真的很绝！", 
      play: "5.4w", 
      like: "2.1k", 
      comment: "342", 
      productName: "法式复古衬衫",
      imgUrl: "https://picsum.photos/seed/vid1/200/300"
    },
    { 
      id: 2, 
      title: "微胖女孩怎么穿？这条神裤闭眼入", 
      play: "8.2w", 
      like: "5.6k", 
      comment: "890", 
      productName: "高腰阔腿裤",
      imgUrl: "https://picsum.photos/seed/vid2/200/300"
    },
    { 
      id: 3, 
      title: "百搭神器，今年秋冬必备单品", 
      play: "3.1w", 
      like: "1.2k", 
      comment: "128", 
      productName: "针织开衫",
      imgUrl: "https://picsum.photos/seed/vid3/200/300"
    },
  ];

  const handlePublish = () => {
    setState('loading');
    setTimeout(() => {
      const branches: any[] = ['success', 'no_account', 'low_score'];
      setState(branches[Math.floor(Math.random() * branches.length)]);
    }, 1500);
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex gap-3 px-4 pt-4 pb-10">
      <Avatar />
      <div className="flex-1">
        <MessageHeader />
        <GuideText>
          老板好，您最近发了 3 个<span onClick={() => setShowVideoSelector(true)} className="text-blue-500 underline cursor-pointer">优质带货视频</span>，店铺流量有明显提升趋势！我们特意为您准备了 <strong>300</strong> 元红包帮您扩大曝光优势，现在行动，快速吸引目标客户，提升爆单几率！
        </GuideText>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 relative">
          <div className="flex items-center justify-between mb-2">
            <GradientLabel text="优质视频" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
            {videos.filter(v => selectedIds.includes(v.id)).map(v => (
              <div key={v.id} className="w-[120px] flex-shrink-0">
                <div className="w-[120px] h-[160px] bg-gray-200 rounded-lg mb-1.5 relative overflow-hidden">
                  <img src={v.imgUrl} alt="video" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <PlayCircle className="text-white/80 w-8 h-8" />
                  </div>
                </div>
                <div className="text-[12px] text-[#333333] leading-[16px] line-clamp-2 mb-1">{v.title}</div>
                <div className="text-[10px] text-[#FF6600] bg-orange-50 px-1.5 py-0.5 rounded inline-block mb-1">播放 {v.play}</div>
                <div className="text-[10px] text-[#666666] flex gap-2 mb-1">
                  <span>赞 {v.like}</span>
                  <span>评 {v.comment}</span>
                </div>
                <div className="text-[11px] text-[#999999] bg-gray-50 px-1.5 py-0.5 rounded truncate">🛒 {v.productName}</div>
              </div>
            ))}
          </div>

          {/* Video Selector Toggle */}
          <button 
            onClick={() => setShowVideoSelector(!showVideoSelector)}
            className="w-full text-[12px] text-[#666666] flex items-center justify-center gap-1 py-2 border-t border-b border-gray-100 mb-3 hover:bg-gray-50 transition-colors"
          >
            筛选 & 排序 <ChevronRight size={14} className={`transform transition-transform ${showVideoSelector ? 'rotate-90' : ''}`} />
          </button>

          {showVideoSelector && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 animate-fade-in">
              <div className="flex flex-wrap gap-2 mb-3">
                <button 
                  onClick={() => setSortType('play')}
                  className={`text-[11px] px-2 py-1 rounded-full ${sortType === 'play' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  播放量前 20%
                </button>
                <button 
                  onClick={() => setSortType('like')}
                  className={`text-[11px] px-2 py-1 rounded-full ${sortType === 'like' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  点赞量前 20%
                </button>
                <button 
                  onClick={() => setSortType('comment')}
                  className={`text-[11px] px-2 py-1 rounded-full ${sortType === 'comment' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  评论量前 20%
                </button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {videos.map(v => (
                  <div key={v.id} className="flex gap-2 bg-white p-2 rounded-md border border-gray-100" onClick={() => toggleSelect(v.id)}>
                    <div className="flex items-center justify-center pt-8">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedIds.includes(v.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {selectedIds.includes(v.id) && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    </div>
                    <div className="w-16 h-20 bg-gray-200 rounded-md relative flex-shrink-0 overflow-hidden">
                      <img src={v.imgUrl} className="w-full h-full object-cover" alt="vid" />
                      <PlayCircle className="absolute inset-0 m-auto text-white/80 w-6 h-6" />
                    </div>
                    <div className="flex-1 overflow-hidden py-0.5">
                      <div className="text-[12px] text-[#333333] font-medium line-clamp-2 mb-1">{v.title}</div>
                      <div className="text-[10px] text-[#999999] mb-1">播放 {v.play} | 赞 {v.like} | 评 {v.comment}</div>
                      <div className="text-[10px] text-[#666666] bg-gray-50 px-1.5 py-0.5 rounded inline-block truncate max-w-full">🛒 {v.productName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-2.5 mb-3 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#666666]">预估 ROI</span>
              <span className="text-[#333333] font-medium">1.8 - 3.2</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#666666]">推荐预算</span>
              <input 
                type="number" 
                placeholder="请输入" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-20 text-right bg-transparent border-b border-gray-300 focus:border-[#3B82F6] outline-none text-[#333333]"
              />
            </div>
          </div>

          <CTAButton 
            text="一键投广" 
            disabled={!budget || state === 'success' || selectedIds.length === 0} 
            loading={state === 'loading'} 
            onClick={handlePublish}
          />
        </div>

        {/* Branch B: No Account */}
        {state === 'no_account' && (
          <div className="animate-fade-in mt-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-[14px] text-[#333333] mb-4">您还没有创建账户哦，完成开户领取 300 元千川激励红包</div>
              <button className="w-full bg-[#3B82F6] text-white text-[14px] font-medium py-2 rounded-md active:bg-blue-600">
                跳转开户
              </button>
            </div>
          </div>
        )}

        {/* Branch C: Low Score */}
        {state === 'low_score' && (
          <div className="animate-fade-in mt-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-[14px] text-[#333333] mb-4">经营分不足，您还未满足所需经营分大于 60 的条件</div>
              <button className="w-full border border-[#3B82F6] text-[#3B82F6] text-[14px] font-medium py-2 rounded-md active:bg-blue-50">
                查看经营分如何提升
              </button>
            </div>
          </div>
        )}

        {/* Branch A: Success Chat Reply */}
        {state === 'success' && (
          <div className="animate-fade-in mt-2">
             <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center text-[#15803D] font-medium gap-1.5 mb-3">
                <CheckCircle2 size={18} />
                您的推广计划已成功创建！
              </div>
              <button className="w-full bg-white border border-[#22C55E] text-[#15803D] text-[14px] font-medium py-2 rounded-md shadow-sm">
                查看计划
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3.1 Release Product (P0)
const ReleaseProductStrategy = () => {
  return (
    <div className="flex gap-3 px-4 pt-4">
      <Avatar />
      <div className="flex-1">
        <MessageHeader />
        <GuideText>
          老板好，您最近只上新了 <strong>2</strong> 个潜力商品呢，同行都在抓紧时间上架新品投放抢量，GMV 平均提升 20%，您也不能落后呀！现在行动+送红包。
        </GuideText>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
            <Plus size={24} />
          </div>
          <h3 className="text-[15px] font-medium text-[#333333] mb-4">发布新品，获取更多流量</h3>
          <button className="w-full bg-[#3B82F6] text-white text-[14px] font-medium py-2.5 rounded-md active:bg-blue-600 shadow-sm">
            立即发布新品
          </button>
        </div>
      </div>
    </div>
  );
};

// 引导发短视频
const AIGCVideoStrategy = () => {
  const [hasProduct, setHasProduct] = useState(false);
  const [aigcState, setAigcState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [budget, setBudget] = useState('');
  const [publishState, setPublishState] = useState<'idle' | 'loading' | 'success'>('idle');

  return (
    <div className="flex gap-3 px-4 pt-4 pb-10">
      <Avatar />
      <div className="flex-1">
        <MessageHeader />
        <GuideText>
          老板好，经诊断您近期只上新了 <strong>0</strong> 个潜力短视频，同行都在抓紧时间上新短视频投放抢量，GMV 平均提升 30%，您有点落后啦，还在为不知道怎么生成素材担心吗？平台重磅推出 AI 智能成片能力，帮您一键生成优质短视频，获得更多精准流量，快来试试吧！
        </GuideText>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3">
          <div className="mb-3">
            <GradientLabel text="AI 视频生成工具" />
          </div>
          
          {!hasProduct ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center mb-3">
              <div className="text-[13px] text-[#666666] mb-3">请选择要生成短视频的商品</div>
              <button 
                onClick={() => setHasProduct(true)}
                className="mx-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-200 text-[13px] text-[#333333] hover:bg-gray-50"
              >
                <Plus size={14} /> 添加商品
              </button>
            </div>
          ) : (
            <div className="border border-gray-100 bg-gray-50 rounded-lg p-2 mb-3 flex gap-2 items-center relative">
              <button onClick={() => {setHasProduct(false); setAigcState('idle');}} className="absolute top-2 right-2 text-gray-400"><X size={14}/></button>
              <img src="https://picsum.photos/seed/aigc/80/80" className="w-12 h-12 rounded object-cover" alt="prod" />
              <div>
                <div className="text-[13px] text-[#333333] line-clamp-1">秋季新款百搭风衣女中长款</div>
                <div className="text-[12px] text-[#FF4D4F] font-bold">¥199.00</div>
              </div>
            </div>
          )}

          {aigcState === 'success' ? (
            <div className="bg-white border border-gray-100 rounded-lg p-3 mb-3 animate-fade-in shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-[#333333]">✨ 视频生成成功</span>
                <span className="text-[11px] text-blue-500 cursor-pointer">重新生成</span>
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-28 bg-gray-200 rounded-md relative flex-shrink-0 overflow-hidden">
                  <img src="https://picsum.photos/seed/aigc2/100/150" className="w-full h-full object-cover" alt="generated video" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <PlayCircle className="text-white/80 w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] text-[#333333] font-medium line-clamp-2 mb-1">【秋季必入】这件风衣太飒了，穿上秒变气质女神！</div>
                    <div className="text-[11px] text-[#999999] bg-gray-50 px-1.5 py-0.5 rounded inline-block truncate max-w-[120px]">
                      🛒 挂载：秋季新款百搭风衣女中长款
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              disabled={!hasProduct || aigcState === 'loading'}
              onClick={() => {
                setAigcState('loading');
                setTimeout(() => setAigcState('success'), 2000);
              }}
              className={`w-full py-2 rounded-md text-[14px] font-medium mb-3 transition-colors ${
                !hasProduct ? 'bg-gray-100 text-gray-400' 
                : aigcState === 'loading' ? 'bg-indigo-50 text-indigo-500' 
                : 'bg-indigo-100 text-indigo-600 active:bg-indigo-200'
              }`}
            >
              {aigcState === 'loading' ? 'AI 正在生成视频中...' : '一键生成短视频'}
            </button>
          )}

          {aigcState === 'success' && (
            <div className="animate-fade-in">
              <div className="bg-gray-50 rounded-lg p-2.5 mb-3 space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#666666]">预估 ROI</span>
                  <span className="text-[#333333] font-medium">1.5 - 2.5</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#666666]">推荐预算</span>
                  <input 
                    type="number" 
                    placeholder="请输入预算" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-24 text-right bg-transparent border-b border-gray-300 focus:border-[#3B82F6] outline-none text-[#333333]"
                  />
                </div>
              </div>

              <CTAButton 
                text="一键投广" 
                disabled={!budget || publishState === 'success'} 
                loading={publishState === 'loading'} 
                onClick={() => {
                  setPublishState('loading');
                  setTimeout(() => setPublishState('success'), 1500);
                }}
              />
            </div>
          )}
        </div>

        {publishState === 'success' && (
          <div className="animate-fade-in mt-2">
             <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center text-[#15803D] font-medium gap-1.5 mb-3">
                <CheckCircle2 size={18} />
                您的推广计划已成功创建！
              </div>
              <button className="w-full bg-white border border-[#22C55E] text-[#15803D] text-[14px] font-medium py-2 rounded-md shadow-sm">
                查看计划
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Layout ---

export default function PrototypePage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: '商品策略', category: '投广供给', component: <ProductStrategy /> },
    { name: '短视频策略', category: '投广供给', component: <VideoStrategy /> },
    { name: '引导发新品', category: '经营供给', component: <ReleaseProductStrategy /> },
    { name: '引导发短视频', category: '经营供给', component: <AIGCVideoStrategy /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 shadow-sm z-10 flex flex-col">
        <h1 className="text-xl font-bold text-[#333333] mb-2">AI 客增主动推 MVP 交互原型</h1>
        
        <div className="space-y-6 flex-1 mt-6">
          {/* 投广供给分区 */}
          <div>
            <div className="text-[12px] font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">投广供给</div>
            <div className="space-y-2">
              {tabs.filter(t => t.category === '投广供给').map((tab, idx) => {
                const globalIdx = tabs.findIndex(t => t.name === tab.name);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(globalIdx)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === globalIdx 
                        ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                        : 'bg-white text-[#333333] hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <span className="text-[14px]">{tab.name}</span>
                    <ChevronRight size={16} className={activeTab === globalIdx ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 经营供给分区 */}
          <div>
            <div className="text-[12px] font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">经营供给</div>
            <div className="space-y-2">
              {tabs.filter(t => t.category === '经营供给').map((tab, idx) => {
                const globalIdx = tabs.findIndex(t => t.name === tab.name);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(globalIdx)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                      activeTab === globalIdx 
                        ? 'bg-blue-50 text-blue-600 font-medium border border-blue-100' 
                        : 'bg-white text-[#333333] hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <span className="text-[14px]">{tab.name}</span>
                    <ChevronRight size={16} className={activeTab === globalIdx ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6 flex items-center justify-center overflow-hidden relative">
        <div className="w-[375px] h-[812px] bg-[#F5F5F7] rounded-[40px] border-[12px] border-black relative shadow-2xl overflow-hidden shrink-0 flex flex-col">
          {/* iOS Status Bar */}
          <div className="h-12 w-full flex justify-between items-center px-6 text-black z-20 shrink-0">
            <span className="text-[13px] font-semibold mt-1">9:41</span>
            <div className="flex gap-1.5 items-center mt-1">
              <div className="w-4 h-3 bg-black rounded-[2px]"></div>
              <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
          </div>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-30"></div>

          {/* Chat Header */}
          <div className="h-12 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-center relative shrink-0 z-10">
            <span className="font-medium text-[16px] text-[#333333]">抖店 IM</span>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth relative">
            {tabs[activeTab].component}
          </div>
          
          {/* Home Indicator */}
          <div className="h-8 w-full flex justify-center items-center bg-transparent shrink-0">
            <div className="w-[120px] h-[4px] bg-black/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
