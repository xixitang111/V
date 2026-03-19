import { NextResponse } from 'next/server';

const fallbackNews = [
  '再见 Openclaw，桌面端 Agent 起飞了！',
  'Claude Code 换成了Kimi K2.5后，我再也回不去了',
  'OpenClaw：从"19万星标"到"行业封杀"，这只"赛博龙虾"究竟触动了谁的神经？',
  'OpenClaw 连接飞书完整指南：插件安装、配置与踩坑记录',
  '2026最新OpenClaw(龙虾ai)安装配置API思路与推荐方案',
  '机器人全程自主收拾客厅！390亿美元估值机器人端到端新技能，英伟达持续加注',
  '只要1分钟！电脑装满血龙虾，现在跟下载APP似的',
  '企业微信支持接入OpenClaw，仅需3步即可快速上手'
];

export async function POST(request: Request) {
  try {
    const { persona, sourceUrl } = await request.json();

    if (!persona) {
      return NextResponse.json(
        { error: '人设不能为空' },
        { status: 400 }
      );
    }

    console.log('🚀 开始生成选题灵感，人设:', persona);

    let fetchedTitles: string[];
    
    try {
      const response = await fetch(sourceUrl || 'https://tophub.today/c/ai', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const html = await response.text();
        fetchedTitles = parseTitlesFromHtml(html);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.log('⚠️ 抓取失败，使用备用数据');
      fetchedTitles = fallbackNews;
    }

    if (fetchedTitles.length === 0) {
      fetchedTitles = fallbackNews;
    }

    console.log('📰 获取到的新闻标题:', fetchedTitles.slice(0, 5));

    const inspirations = await generateInspirationsWithLLM(persona, fetchedTitles);

    console.log('✅ 生成的选题灵感:', inspirations);

    return NextResponse.json({ inspirations });

  } catch (error) {
    console.error('选题灵感 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

function parseTitlesFromHtml(html: string): string[] {
  const titles: string[] = [];
  const patterns = [
    /<h\d[^>]*>([^<]+)<\/h\d>/gi,
    /class="[^"]*title[^"]*"[^>]*>([^<]+)</gi,
    /<a[^>]*>([^<]{10,100})<\/a>/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && titles.length < 10) {
      const title = match[1]?.trim();
      if (title && title.length > 10 && title.length < 100) {
        if (!titles.includes(title)) {
          titles.push(title);
        }
      }
    }
    if (titles.length >= 10) break;
  }

  return titles;
}

async function generateInspirationsWithLLM(persona: string, titles: string[]): Promise<Array<{ topic: string; angle: string; outline: string }>> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const modelId = process.env.INSPIRATION_MODEL || process.env.AI_MODEL_NAME || 'doubao-seed-2-0-pro-260215';
  
  console.log('🤖 使用模型生成选题灵感:', modelId);

  const systemPrompt = `你是一个千万粉丝的【${persona}】操盘手和内容主编。

以下是今天 AI 圈的热点新闻标题：
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

请从这些新闻中挑选最值得探讨的 3 个话题，不要做新闻播报，而是给出极具深度的、反常识的、或者结合普通人搞钱/职场视角的切入点。

返回格式必须是一段纯 JSON 数组（不要包含 Markdown 代码块标记），每个对象包含：
- topic: 简短的选题名称 (15字以内)
- angle: 独特的切入观点或反共识视角 (30-50字)
- outline: 针对这个观点，生成一个可直接执行的三段式大纲

只返回 JSON，不要其他任何文字！`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '请生成选题灵感' }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('LLM 生成失败，使用备用灵感:', error);
    return getFallbackInspirations(persona);
  }
}

function getFallbackInspirations(persona: string): Array<{ topic: string; angle: string; outline: string }> {
  const inspirations = {
    'AI观点分享博主': [
      {
        topic: 'OpenClaw 争议',
        angle: '从19万星标到行业封杀，OpenClaw的争议背后是AI安全边界的博弈',
        outline: '1. 痛点引入：OpenClaw火了又被封，普通人看得云里雾里\n2. 深度剖析：Agent工具的安全红线到底在哪\n3. 行动建议：普通人如何安全使用AI Agent'
      },
      {
        topic: 'Kimi vs Claude',
        angle: 'Claude Code换成Kimi K2.5后回不去，说明大模型体验只差一点就是质变',
        outline: '1. 痛点引入：很多人觉得大模型都差不多\n2. 深度剖析：Kimi K2.5到底赢在了哪里\n3. 行动建议：如何选择适合自己的AI编程助手'
      },
      {
        topic: '机器人端到端',
        angle: '机器人全程自主收拾客厅不是炫技，是家用机器人商业化的信号',
        outline: '1. 痛点引入：觉得机器人离家用还很远\n2. 深度剖析：390亿美元估值背后的商业逻辑\n3. 行动建议：普通人如何关注这波机会'
      }
    ],
    '技术小白搞钱流': [
      {
        topic: 'OpenClaw 变现',
        angle: '别光围观OpenClaw争议，提示词模板、场景定制才是普通人的赚钱机会',
        outline: '1. 痛点引入：大家都在吃瓜，但没人说怎么用它赚钱\n2. 深度剖析：3个普通人能用Agent变现的小赛道\n3. 行动建议：本周就能开始的实操步骤'
      },
      {
        topic: '飞书+AI',
        angle: '企业微信接入OpenClaw，职场人效率提升的同时也藏着副业机会',
        outline: '1. 痛点引入：觉得企业工具和自己没关系\n2. 深度剖析：企业AI工具带来的3个副业方向\n3. 行动建议：从今天开始可以做的3件事'
      },
      {
        topic: '一分钟安装',
        angle: '电脑装AI像下载APP一样简单，门槛降低意味着普通人的机会来了',
        outline: '1. 痛点引入：之前觉得AI安装太复杂\n2. 深度剖析：门槛降低后什么人能赚到钱\n3. 行动建议：2026年最值得投入的3个方向'
      }
    ],
    'default': [
      {
        topic: 'Agent 时代',
        angle: '桌面Agent不是玩具，是下一波生产力革命的起点',
        outline: '1. 痛点引入：很多人觉得Agent是概念\n2. 深度剖析：OpenClaw等工具真正改变了什么\n3. 行动建议：普通人如何抓住这波机会'
      },
      {
        topic: '大模型选择',
        angle: '不是大模型越贵越好，适合自己场景的才是最好的',
        outline: '1. 痛点引入：不知道选哪个大模型\n2. 深度剖析：如何判断大模型是否适合自己\n3. 行动建议：2026年最值得关注的3个大模型'
      },
      {
        topic: '机器人商业化',
        angle: '英伟达持续加注机器人，说明家用机器人的商业化拐点快到了',
        outline: '1. 痛点引入：觉得机器人还很遥远\n2. 深度剖析：机器人端到端技术突破的意义\n3. 行动建议：个人如何关注这波趋势'
      }
    ]
  };

  if (persona.includes('AI观点')) {
    return inspirations['AI观点分享博主'];
  } else if (persona.includes('搞钱')) {
    return inspirations['技术小白搞钱流'];
  } else {
    return inspirations['default'];
  }
}
