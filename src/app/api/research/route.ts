import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
};

type KeyPoint = {
  point: string;
  details: string;
  source: string;
};

type Angle = {
  type: string;       // 类型标签：「真实经历型」「数据颠覆型」等
  hook: string;       // 开篇钩子示例（前两句）
  why: string;        // 一句话说明为什么有效
};

type ResearchData = {
  keyPoints: KeyPoint[];
  angles: Angle[];
  dataSource: 'realtime' | 'ai_knowledge';
};

// ─── Tavily ───────────────────────────────────────────────────────────────────

async function tavilySearch(query: string, maxResults = 6): Promise<TavilyResult[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return [];

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: 'advanced',   // advanced = better quality snippets
        max_results: maxResults,
        include_answer: false,
        include_raw_content: false,
        days: 180,                   // 只返回近 6 个月的结果
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []) as TavilyResult[];
  } catch {
    return [];
  }
}

function formatSearchResults(results: TavilyResult[]): string {
  if (results.length === 0) return '';
  return results
    .map((r, i) => {
      const date = r.published_date ? `（发布时间：${r.published_date}）` : '';
      return `[${i + 1}] 《${r.title}》${date}\n来源：${r.url}\n摘要：${r.content.slice(0, 350)}`;
    })
    .join('\n\n');
}

function formatKeyPoints(keyPoints: KeyPoint[]): string {
  return keyPoints
    .map((kp, i) => `${i + 1}. 【${kp.point}】\n   数据/案例：${kp.details}\n   来源：${kp.source}`)
    .join('\n\n');
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const {
      step, persona, personaPrompt = '', keywords,
      selectedTopic, selectedAngle, sellingPoint, targetAudience, researchData,
    }: {
      step: string; persona: string; personaPrompt?: string; keywords?: string;
      selectedTopic?: string; selectedAngle?: string; sellingPoint?: string;
      targetAudience?: string; researchData?: ResearchData;
    } = await request.json();

    if (!step || !persona) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    const modelId = process.env.AI_MODEL_NAME || 'doubao-seed-2-0-pro-260215';

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: '请在 .env.local 中配置 API 密钥' }, { status: 500 });
    }

    const personaContext = personaPrompt?.trim()
      ? personaPrompt.trim()
      : `你是一位名为「${persona}」的自媒体创作者。`;

    // 用运行时获取当前年份，避免硬编码过期
    const currentYear = new Date().getFullYear();
    const currentYearStr = String(currentYear);

    console.log('📚 调研 API，步骤:', step, '当前年份:', currentYear);

    let systemPrompt = '';
    let userPrompt = '';
    // 是否携带实时搜索数据（仅 do-research 步骤使用）
    let extraMeta: Record<string, unknown> = {};

    // ── 步骤 1：生成选题 ───────────────────────────────────────────────────────
    if (step === 'generate-topics') {

      systemPrompt = `你是一位专业的自媒体内容策划专家。当前年份：${currentYear}。

【当前创作人设】
${personaContext}

请严格以上述人设的视角和语言风格，根据关键词生成 5 个高质量选题建议。

选题必须：
- 符合该人设的调性与受众期待
- 标题有冲击力，能引发点击欲望（≤20字）
- 有明确的卖点和目标人群
- 覆盖以下至少 3 种情绪类型（禁止同质化）：
  * 痛点焦虑型（"你还在…"）
  * 反直觉反转型（"其实大家都做错了…"）
  * 干货攻略型（"X步/X个方法/X个技巧"）
  * 励志共情型（"我曾经…到现在…"）

每个选题包含：
- title: 吸引人的标题（≤20字）
- sellingPoint: 核心价值主张（读者看完能得到什么，≤30字）
- targetAudience: 精准受众画像（具体到人群特征 + 核心痛点，≤30字）

返回格式：纯 JSON 数组，禁止任何 Markdown 标记。`;

      userPrompt = `关键词：${keywords}\n\n请生成 5 个选题建议。`;

    // ── 步骤 2：深度调研 ──────────────────────────────────────────────────────
    } else if (step === 'do-research') {

      // 搜索查询加入当前年份 + 限定近期
      const searchQuery = `${selectedTopic} ${currentYear} 最新数据 案例 趋势`;
      console.log('🔍 Tavily 搜索:', searchQuery);
      const searchResults = await tavilySearch(searchQuery, 6);
      const hasRealData = searchResults.length > 0;
      const searchBlock = formatSearchResults(searchResults);
      console.log(`✅ Tavily 返回 ${searchResults.length} 条结果`);

      extraMeta.dataSource = hasRealData ? 'realtime' : 'ai_knowledge';

      systemPrompt = `你是一位专业的内容研究员。当前年份：${currentYear}。本次任务分两个独立部分。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
第一部分：客观信息提炼（关键信息点）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${hasRealData
  ? `以下是通过联网搜索获取的最新资讯（近 6 个月内），严格基于这些内容提炼事实，禁止编造额外数据：

─────── 搜索结果 ───────
${searchBlock}
────────────────────────

提取 4 个关键信息点，每个必须：
- point: 一个可量化/可验证的核心事实（≤25字，尽量含具体数字或时间）
- details: 完整背景或数据来源说明（≤100字）
- source: 文章标题 + 发布日期（从上方搜索结果中直接引用，不要捏造）`

  : `⚠️ 未能获取实时搜索结果（Tavily 未配置或网络故障）。
请基于你的训练数据提炼信息，并在每个 source 字段中诚实标注"AI知识库（截至约${currentYear-1}年，不保证最新性）"。
避免给出可能已过时的具体数字，重点提炼原理性和结构性信息。

提取 4 个关键信息点（格式同上）。`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
第二部分：写作切入角度（叙事框架设计）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【创作人设】
${personaContext}

【本次选题的受众与定位】
- 目标受众：${targetAudience || '待确定'}
- 核心价值主张：${sellingPoint || '待确定'}

⚠️ 重要说明：
- 「选题」= 写什么（主题方向，已在上一步确定）
- 「切入角度」= 怎么讲（叙事框架 + 情绪钩子 + 视角），必须与选题有明确区分

请提供 3 个完全不同的叙事框架，每个包含：
- type: 框架类型标签，格式为「X型」（≤8字），例如：「真实失败经历反转型」「数据颠覆认知型」「清单干货速成型」「第三方故事借镜型」「追问式悬念型」
- hook: 该框架下的开篇前两句（直接示范文字，让用户感受文章语气，≤60字）
- why: 一句话说明此框架为何能打动「${targetAudience || '目标受众'}」（≤30字）

三个框架必须在以下维度上有显著差异：
1. 叙事视角（第一人称亲历 vs 数据分析 vs 故事借镜）
2. 情绪基调（焦虑驱动 vs 好奇驱动 vs 认同驱动）
3. 内容结构（先讲失败再反转 vs 先抛数据再解读 vs 先列问题再给答案）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
返回格式：纯 JSON 对象，字段如下：
- keyPoints: 数组，每个元素包含 point、details、source
- angles: 数组，每个元素包含 type、hook、why

禁止任何 Markdown 标记。`;

      userPrompt = `请对选题【${selectedTopic}】进行深度分析，返回关键信息点和 3 个叙事切入角度。`;

    // ── 步骤 3：生成大纲 ──────────────────────────────────────────────────────
    } else if (step === 'generate-outline') {

      const hasResearchData = researchData?.keyPoints && researchData.keyPoints.length > 0;
      const keyPointsText = hasResearchData ? formatKeyPoints(researchData!.keyPoints) : '';

      // 解析 selectedAngle（可能是旧格式字符串，也可能是 JSON Angle 对象）
      let angleType = '';
      let angleHook = '';
      let angleWhy = '';
      try {
        const parsed = JSON.parse(selectedAngle || '{}') as Partial<Angle>;
        angleType = parsed.type || '';
        angleHook = parsed.hook || '';
        angleWhy = parsed.why || '';
      } catch {
        // 旧格式：纯字符串
        angleType = selectedAngle || '';
      }

      systemPrompt = `你是一位专业的小红书长文内容主编。当前年份：${currentYear}。

【创作人设】
${personaContext}

【本次创作背景】
- 选题：${selectedTopic}
- 核心价值主张：${sellingPoint || '未指定'}
- 目标受众：${targetAudience || '未指定'}
- 叙事框架类型：${angleType}
${angleHook ? `- 已确定开篇钩子：${angleHook}` : ''}
${angleWhy ? `- 框架逻辑：${angleWhy}` : ''}

${hasResearchData
  ? `【已调研的真实数据与案例】（大纲中需标注哪段具体融入哪条数据）
${keyPointsText}`
  : ''
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
小红书长文爆款结构（严格遵守此框架）：

1. 【开篇破防钩子】（对应 outline[0]）
   - 写法：直接复用或优化上方「已确定开篇钩子」
   - 目标：让读者在 3 秒内觉得"这说的就是我！"
   - 格式示例：「我当时月薪3000，却在副业上赚出了第一个10万」（第一人称情境）
              「90%的人做副业都踩过同一个坑，而且还以为是正确的」（悬念型）

2. 【亮出核心观点】（对应 outline[1]）
   - 一句话讲清楚"这篇文章的核心结论是什么"
   - 不是过渡语，而是让读者觉得"这个 insight 我没想到"

3-5. 【分段论证 · 每段一个具体论点】（对应 outline[2..N-2]，共 2-3 段）
   - 每段必须包含：小标题（≤15字）+ 该段要融入的调研数据编号
   - 论点需层层递进，不能平行堆砌
   - 避免大而化之的道理，每段要有「一个能截图发朋友圈的具体方法或案例」

N-1. 【反转/点睛段】（对应 outline[N-1]，共 1 段）
   - 提供一个让读者"哇！原来如此"的认知反转或隐藏彩蛋
   - 这是文章被「收藏」和「分享」的关键段

N. 【互动收尾】（对应 outline[N]）
   - 自然引导点赞/收藏/评论，不能是硬广，要带情绪承接
   - 格式示例：「如果你也在想做副业，可以先从这件事开始……」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
写作提示（3-4条，必须针对本次创作的具体风险）：
- 指出「${persona}」这类人设最容易写成说教文的一个具体细节
- 指出本次选题最容易踩的一个常见坑（其他博主已经写烂的角度）
- 针对「${targetAudience || '目标受众'}」的一个情绪爆点设计建议

返回格式：纯 JSON 对象：
- outline: 字符串数组（6-7 条，每条≤40字，含 [数据X] 标注）
- tips: 字符串数组（3-4 条，针对本次的具体建议）

禁止任何 Markdown 标记。`;

      userPrompt = `请生成写作大纲。`;
    }

    // ── 调用模型 ──────────────────────────────────────────────────────────────
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('API 错误:', response.status, err);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    if (!content) throw new Error('API 返回内容为空');

    console.log('🤖 模型返回（前200字）:', content.slice(0, 200));

    // ── 解析 JSON ─────────────────────────────────────────────────────────────
    let jsonContent = content.trim()
      .replace(/^```json\s*/m, '').replace(/```\s*$/m, '')
      .replace(/^```\s*/m, '');

    const isArray = step === 'generate-topics';
    const firstBrace = jsonContent.indexOf(isArray ? '[' : '{');
    const lastBrace = jsonContent.lastIndexOf(isArray ? ']' : '}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
    }

    try {
      const result = JSON.parse(jsonContent);

      // do-research 步骤额外注入数据来源标志
      if (step === 'do-research' && typeof result === 'object') {
        result.dataSource = extraMeta.dataSource ?? 'ai_knowledge';
      }

      console.log('✅ JSON 解析成功');
      return NextResponse.json(result);
    } catch {
      console.error('❌ JSON 解析失败:', jsonContent.slice(0, 300));
      return NextResponse.json({ error: '解析失败，请重试' }, { status: 500 });
    }

  } catch (error) {
    console.error('调研 API 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
