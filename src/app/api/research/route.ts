import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { step, persona, keywords, selectedTopic, selectedAngle } = await request.json();

    if (!step || !persona) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    const defaultModelId = process.env.AI_MODEL_NAME || 'doubao-seed-2-0-pro-260215';
    
    // 所有步骤都使用同一个模型（避免模型不存在的问题）
    let modelId = defaultModelId;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: '请在 .env.local 中配置 API 密钥' },
        { status: 500 }
      );
    }

    console.log('📚 调研 API 调用，步骤:', step);

    let systemPrompt = '';
    let userPrompt = '';

    if (step === 'generate-topics') {
      systemPrompt = `你是一位专业的自媒体内容策划专家，擅长为【${persona}】策划爆款选题。

请根据用户提供的关键词，生成 5-8 个高质量的选题建议。

每个选题必须包含：
- title: 吸引人的标题（20字以内）
- sellingPoint: 核心卖点/价值（一句话）
- targetAudience: 目标受众描述

返回格式必须是纯 JSON 数组，不要包含任何 Markdown 标记。`;
      userPrompt = `关键词：${keywords}\n\n请生成选题建议。`;
    } else if (step === 'do-research') {
      systemPrompt = `你是一位专业的自媒体深度研究员，当前人设是【${persona}】。

重要：必须使用联网搜索功能！绝对不能编造或臆造信息！

请针对选题【${selectedTopic}】进行深度调研：

1. 首先联网搜索 2026 年最新的相关资讯、数据和案例
   - 搜索最近 3 个月内的真实新闻、报道、数据
   - 必须包含具体的来源、时间、数据
   - 如果搜索不到相关信息，明确说明"暂无最新公开数据"

2. 提取 3-5 个关键信息点，每个包含：
   - point: 核心观点（必须基于真实信息）
   - details: 具体数据或案例（包含时间、来源）
   - source: 参考来源（例如："2026年3月 xx 媒体报道"）

3. 提供 3 个不同的切入角度

返回格式必须是纯 JSON 对象，包含：
- keyPoints: 数组，每个元素包含 point, details, source
- angles: 字符串数组，3 个不同的切入角度

再次强调：绝对不能编造数据！所有信息必须真实可查证！`;
      userPrompt = `请对选题【${selectedTopic}】进行深度调研，务必使用联网搜索获取真实信息。`;
    } else if (step === 'generate-outline') {
      systemPrompt = `你是一位专业的自媒体内容主编，当前人设是【${persona}】。

请根据以下信息生成详细的写作大纲：
- 选题：${selectedTopic}
- 切入角度：${selectedAngle}

要求：
1. 生成三段式或五段式大纲
2. 每个段落提供核心要点和写作提示
3. 适合小红书长文风格

返回格式必须是纯 JSON 对象，包含：
- outline: 字符串数组，每个元素是一个段落的要点
- tips: 字符串数组，写作提示

不要包含任何 Markdown 标记。`;
      userPrompt = `请生成写作大纲。`;
    }

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('API 返回内容为空');
    }

    console.log('🤖 大模型返回:', content);

    let jsonContent = content.trim();
    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/```$/, '');
    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/```$/, '');

    const firstBrace = jsonContent.indexOf(step === 'generate-topics' ? '[' : '{');
    const lastBrace = jsonContent.lastIndexOf(step === 'generate-topics' ? ']' : '}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
    }

    try {
      const result = JSON.parse(jsonContent);
      console.log('✅ 解析成功');
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('❌ JSON 解析失败:', parseError);
      return NextResponse.json(
        { error: '解析失败，请重试' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('调研 API 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
