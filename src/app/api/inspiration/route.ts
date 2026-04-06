import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const BASE_URL = process.env.OPENAI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
// 非推理轻量模型，响应快 3-8s
const MODEL_ID = process.env.INSPIRATION_MODEL || 'doubao-1-5-pro-32k-250115';
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { persona } = await request.json();
    if (!persona) {
      return NextResponse.json({ error: '人设不能为空' }, { status: 400 });
    }

    // 从存储中找到该人设的完整 prompt（加超时保护）
    const personas = await Promise.race([
      storage.getPersonas(),
      new Promise<any[]>(r => setTimeout(() => r([]), 3000)),
    ]).catch(() => []);
    const personaData = personas.find((p: any) => p.name === persona);
    const personaPrompt = personaData?.prompt || '';

    // 并行：搜索热点（有 Tavily key 才启用）+ 直接生成
    const [hotTopics] = await Promise.all([
      TAVILY_API_KEY ? fetchHotTopics(persona, personaPrompt) : Promise.resolve([]),
    ]);

    const inspirations = await generateInspirations(persona, personaPrompt, hotTopics);
    return NextResponse.json({ inspirations });

  } catch (error) {
    console.error('选题灵感 API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/** 用 LLM 根据人设 prompt 生成 Tavily 搜索词 */
async function generateSearchQuery(personaPrompt: string, personaName: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ARK_API_KEY || '';
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: 'system',
            content: '根据以下自媒体人设，生成一个用于搜索2026年最新市场热点资讯的中文搜索词（不超过15字，不含引号，直接返回搜索词本身，不要任何说明）。',
          },
          {
            role: 'user',
            content: `人设：${(personaPrompt || personaName).slice(0, 300)}`,
          },
        ],
        max_tokens: 30,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('LLM failed');
    const data = await res.json();
    const query = data.choices?.[0]?.message?.content?.trim() || '';
    return query || `${personaName} 2026 热点`;
  } catch {
    return `${personaName} 2026 最新趋势`;
  }
}

/** 用 Tavily 搜索与人设相关的实时热点 */
async function fetchHotTopics(persona: string, personaPrompt: string): Promise<string[]> {
  const query = await generateSearchQuery(personaPrompt, persona);
  console.log(`🔍 Tavily 搜索词（由人设生成）: "${query}"`);

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 6,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error('Tavily failed');
    const data = await res.json();
    return (data.results || []).map((r: any) => r.title).filter(Boolean);
  } catch {
    return [];
  }
}

async function generateInspirations(
  personaName: string,
  personaPrompt: string,
  hotTopics: string[]
): Promise<Array<{ topic: string; angle: string; outline: string }>> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ARK_API_KEY || '';
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const hotSection = hotTopics.length > 0
    ? `热点参考：${hotTopics.slice(0, 4).join('；')}\n`
    : '';

  const personaSection = personaPrompt
    ? `人设：${personaPrompt.slice(0, 200)}\n`
    : `人设名称：${personaName}\n`;

  const systemPrompt = `你是小红书内容策划。${personaSection}${hotSection}今天${today}，为这个人设生成3个爆款选题，覆盖痛点型、反直觉型、干货型各一个。

直接返回JSON数组，不要任何说明：
[{"topic":"标题(≤12字)","angle":"切入角度(≤40字)","outline":"大纲第一段\\n大纲第二段\\n大纲第三段"}]`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '生成选题灵感' },
        ],
        temperature: 0.85,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error(`LLM API 请求失败: ${response.status}`);

    const data = await response.json();
    const content: string = data.choices[0].message.content.trim();

    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('JSON 解析失败');

    return JSON.parse(match[0]);
  } catch (error) {
    console.error('LLM 生成失败，使用备用数据:', error);
    return getFallbackInspirations(personaName);
  }
}

function getFallbackInspirations(persona: string): Array<{ topic: string; angle: string; outline: string }> {
  const isFuye = persona.includes('副业') || persona.includes('搞钱') || persona.includes('创业');
  const isAI = persona.includes('AI') || persona.includes('技术') || persona.includes('思考');

  if (isFuye) {
    return [
      {
        topic: '月入三千的副业误区',
        angle: '99%的人副业失败不是因为不努力，是选错了赛道——这三类副业看起来火但其实最难变现',
        outline: '大家都在卷的副业为什么赚不到钱\n真正能长期变现的副业有什么特征\n2026年适合普通人的3个低风险副业方向',
      },
      {
        topic: '我副业月入过万后戒掉了什么',
        angle: '反直觉：做成副业之后，我反而减少了"努力"——真正的杠杆不是时间，是系统',
        outline: '副业从月入几百到过万，我做了什么\n让副业自动运转的3个关键动作\n现在每周只花5小时，收入反而涨了',
      },
      {
        topic: '副业必备的AI工具清单',
        angle: '普通人做副业最大的成本是时间，这5个AI工具能让你的效率提升10倍，直接少踩半年坑',
        outline: '没有这些工具前我是怎么浪费时间的\n5个真正改变效率的AI工具实测\n组合用法：一个人顶一个小团队',
      },
    ];
  }

  if (isAI) {
    return [
      {
        topic: 'AI替代的不是工作，是思维',
        angle: '反直觉：最先被AI淘汰的不是体力劳动者，而是"只会执行、不会思考"的知识工作者',
        outline: '大家都在担心被AI替代，但方向搞错了\nAI真正威胁的是哪类人\n如何用AI放大自己的思维而不是被替代',
      },
      {
        topic: '我用AI工作一年后的反思',
        angle: '用了一年AI工具，我发现最大的坑不是工具不够好，而是大多数人根本不知道怎么提问',
        outline: '一年前我以为AI是万能的\n现在我认为AI最大的局限在哪里\n真正高效用AI的3个底层思维',
      },
      {
        topic: '2026年哪些AI工具值得付费',
        angle: '干货向：用烂了几十个AI工具后，这3个我愿意一直续费——不是最贵的，但是ROI最高的',
        outline: '免费AI工具的天花板在哪里\n我付费的3个AI工具及真实使用场景\n如何判断一个AI工具值不值得付费',
      },
    ];
  }

  return [
    {
      topic: '越努力越穷的真相',
      angle: '反直觉：很多人之所以努力却没结果，是因为在用战术勤奋掩盖战略懒惰',
      outline: '为什么努力没有换来想要的结果\n战术勤奋和战略懒惰的区别\n真正改变人生轨迹的3个思维转变',
    },
    {
      topic: '普通人的财务自由路径',
      angle: '不是鸡汤：财务自由不需要天赋，需要的是正确的顺序——大多数人把顺序搞反了',
      outline: '财务自由被包装成了成功学\n真正可执行的财务自由路径长什么样\n从现在开始的3个最优先动作',
    },
    {
      topic: '我学到的最值钱的一件事',
      angle: '30岁之前最值得投资的不是技能，而是眼界——见过好的，才知道自己要什么',
      outline: '我花了多少钱和时间才搞明白这件事\n眼界是怎么改变一个人的决策的\n如何用最低成本快速扩展认知边界',
    },
  ];
}
