import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, products, persona, currentText } = await request.json();
    // type: 'welcome' | 'sales' | 'review'

    const apiKey = process.env.DOUBAO_API_KEY;
    const baseUrl = process.env.DOUBAO_BASE_URL;
    const model = process.env.INSPIRATION_MODEL || 'doubao-1-5-pro-32k-250115';

    if (!apiKey || !baseUrl) {
      return NextResponse.json({ error: '未配置 API Key' }, { status: 500 });
    }

    const productList = (products || [])
      .map((p: any, i: number) => `${i + 1}. ${p.name}：${p.sellingPoints}（${p.storeLink}）`)
      .join('\n');

    const prompts: Record<string, { system: string; user: string }> = {
      welcome: {
        system: `你是一个专业的小红书私信承接文案专家。用户刚主动私信博主，需要一条热情简短的欢迎语，自然引导他们看商品。风格要像真人、口语化、不生硬。≤60字，不要用感叹号堆砌。直接输出文案，不要任何说明。`,
        user: `博主人设：${persona || '知识付费博主'}\n在售商品：\n${productList || '暂无商品'}\n\n${currentText ? `当前文案（可参考优化）：${currentText}` : '请生成一条欢迎语'}`,
      },
      sales: {
        system: `你是一个专业的小红书私信销售转化文案专家。用户在私信中询问商品或犹豫下单，需要一段 System Prompt 风格的促单指令，告诉 AI 机器人怎么促成交易。≤100字，重点突出，直接输出指令文本。`,
        user: `博主人设：${persona || '知识付费博主'}\n在售商品：\n${productList || '暂无商品'}\n\n${currentText ? `当前设定（可参考优化）：${currentText}` : '请生成促单话术指令'}`,
      },
      review: {
        system: `你是一个专业的小红书好评引导文案专家。用户刚完成购买，需要一条催好评的私信，要真诚、有钩子（比如送隐藏资料）。≤60字，像朋友发消息一样自然。直接输出文案。`,
        user: `博主人设：${persona || '知识付费博主'}\n在售商品：\n${productList || '暂无商品'}\n\n${currentText ? `当前文案（可参考优化）：${currentText}` : '请生成好评引导话术'}`,
      },
    };

    const prompt = prompts[type];
    if (!prompt) return NextResponse.json({ error: '无效的类型' }, { status: 400 });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        temperature: 0.85,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`API 错误: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('生成话术失败:', error);
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 });
  }
}
