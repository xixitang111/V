import { NextRequest } from 'next/server';

type KeyPoint = {
  point: string;
  details: string;
  source: string;
};

type ResearchData = {
  keyPoints: KeyPoint[];
  angles: string[];
};

export async function POST(request: NextRequest) {
  const {
    persona,
    personaPrompt = '',
    outline,
    tips = [],
    selectedTopic = '',
    selectedAngle = '',
    sellingPoint = '',
    targetAudience = '',
    model,
    researchData,
    history = '',
  }: {
    persona: string;
    personaPrompt?: string;
    outline: string;
    tips?: string[];
    selectedTopic?: string;
    selectedAngle?: string;
    sellingPoint?: string;
    targetAudience?: string;
    model: string;
    researchData?: ResearchData;
    history?: string;
  } = await request.json();

  if (!persona || !outline || !model) {
    return new Response(
      JSON.stringify({ error: '缺少必填字段：persona, outline, model' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.DOUBAO_API_KEY;
  const baseUrl = process.env.DOUBAO_BASE_URL;

  if (!apiKey || !baseUrl) {
    return new Response(
      JSON.stringify({ error: '请在 .env.local 中配置 DOUBAO_API_KEY 和 DOUBAO_BASE_URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const personaContext = personaPrompt?.trim()
    ? personaPrompt.trim()
    : `你是一位名为「${persona}」的自媒体创作者。`;

  const hasResearch = researchData?.keyPoints && researchData.keyPoints.length > 0;
  const researchBlock = hasResearch
    ? researchData!.keyPoints
        .map((kp, i) =>
          `[${i + 1}] ${kp.point}\n    数据：${kp.details}\n    来源：${kp.source}`
        )
        .join('\n\n')
    : '';

  const historyBlock = history?.trim()
    ? `\n\n【历史内容参考（避免重复）】\n${history.trim()}`
    : '';

  const tipsBlock = tips.length > 0
    ? `\n\n【本次专项写作提示】\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : '';

  const articleSystemPrompt = `你现在是我的专属自媒体爆款写手。

【人设档案】
${personaContext}
${historyBlock}

【本次创作背景】
- 选题：${selectedTopic || '见大纲'}
- 核心卖点：${sellingPoint || '见大纲'}
- 目标受众：${targetAudience || '见大纲'}
- 写作切入角度：${selectedAngle || '见大纲'}

【本次创作大纲】
${outline}

${hasResearch
  ? `【调研获得的真实数据与案例】（正文中必须自然融入这些素材）
${researchBlock}`
  : ''
}
${tipsBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
四大创作军规（必须严格遵守）：

1. 【人设高度统一】严格贴合「人设档案」的身份、语气和价值主张，杜绝与人设相悖的表述。

2. 【数据落地，拒绝空谈】${hasResearch
     ? '每一个论点必须落到具体数据或案例上，让读者感受到信息密度。'
     : '多用具体案例和数据支撑论点，避免空洞的鸡汤式表达。'
   }

3. 【精准击中目标受众】开头直击「${targetAudience || '目标受众'}」最在意的痛点或反直觉认知，破防开篇；内容硬核，给读者真正有用的 Insights；情绪到位，做目标受众的嘴替；态度平视，用「我」的真实经历代入。

4. 【小红书原生语感与排版】长短句交错，合理使用 Emoji（每段1-2个），结尾有自然的行动号召（引导点赞/收藏/评论）。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【输出要求】
- 字数控制在 1200-1600 字之间（必须足够充实，每个章节有实质内容）
- 直接输出长文正文内容，包含小标题（用「**标题**」加粗格式）、换行和 Emoji
- 不要输出 JSON，不要加任何说明，直接输出正文`;

  const postSystemPrompt = `你是一位专精小红书平台运营的文案专家。

【创作人设】
${personaContext}

【本文受众与卖点】
- 目标受众：${targetAudience || '见正文'}
- 核心卖点：${sellingPoint || '见正文'}

你的任务是为下方已写好的长文，创作一套完整的「可直接发布的小红书内容外围件」。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【输出格式】严格按以下 JSON 结构返回，不包含任何 Markdown 标记：
{
  "titles": ["钩子式标题1（≤20字，含数字或反转感）", "钩子式标题2（≤20字，第一人称视角）", "钩子式标题3（≤20字，疑问或悬念感）"],
  "summary": "人话版摘要（恰好2句话，自带emoji，口语化，可直接用于私信回复/朋友圈预告，≤70字）",
  "tags": "话题标签（恰好10个#话题，全部写在一行用空格分隔，前5个为大词，后5个为蓝海长尾词）"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // ── SSE 流式响应 ─────────────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const sendEvent = async (data: object) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      console.log('🚀 流式生成正文，模型:', model);

      // ── 第一步：流式生成正文 ──────────────────────────────────────────────
      const articleRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: articleSystemPrompt },
            { role: 'user', content: '请根据上方大纲、调研数据和写作提示，生成完整的小红书长文正文。' },
          ],
          temperature: 0.85,
          max_tokens: 2500,
          stream: true,
        }),
      });

      if (!articleRes.ok) {
        const errorText = await articleRes.text();
        await sendEvent({ type: 'error', message: `正文生成失败: ${articleRes.status} - ${errorText}` });
        await writer.close();
        return;
      }

      const reader = articleRes.body!.getReader();
      const decoder = new TextDecoder();
      let articleContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              articleContent += delta;
              await sendEvent({ type: 'article_chunk', chunk: delta });
            }
          } catch {}
        }
      }

      if (!articleContent) {
        await sendEvent({ type: 'error', message: '正文生成返回内容为空，请重试' });
        await writer.close();
        return;
      }

      console.log('✅ 正文流式输出完成，字数约:', articleContent.length);

      // ── 第二步：生成外发文案（非流式，通常很快）────────────────────────────
      await sendEvent({ type: 'status', message: '正在生成外发文案...' });

      const postRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: postSystemPrompt },
            {
              role: 'user',
              content: `以下是已生成的长文正文：\n\n${articleContent}\n\n请为上述文章生成小红书外发文案，严格按 JSON 格式返回。`,
            },
          ],
          temperature: 0.75,
          max_tokens: 400,
        }),
      });

      let postTitles: string[] = [];
      let postSummary = '';
      let postTags = '';
      if (postRes.ok) {
        const postData = await postRes.json();
        const postRaw = postData.choices?.[0]?.message?.content || '';
        try {
          let jsonStr = postRaw.trim()
            .replace(/^```json\s*/m, '').replace(/```\s*$/m, '')
            .replace(/^```\s*/m, '');
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
          }
          const postObj = JSON.parse(jsonStr);
          postTitles = Array.isArray(postObj.titles) ? postObj.titles : (postObj.title ? [postObj.title] : []);
          postSummary = postObj.summary || '';
          postTags = postObj.tags || '';
        } catch {
          // fallback: send raw
          postSummary = postRaw;
        }
      }

      // send structured post data
      await sendEvent({ type: 'post_titles', titles: postTitles });
      await sendEvent({ type: 'post_summary', content: postSummary });
      await sendEvent({ type: 'post_tags', content: postTags });
      // legacy field for backward compat
      const postDescription = [postTitles[0] || '', '', postSummary, '', postTags].filter(Boolean).join('\n');
      await sendEvent({ type: 'post_description', content: postDescription });
      await sendEvent({ type: 'done' });
      console.log('🎉 全部生成完成！');
    } catch (error) {
      console.error('生成内容失败:', error);
      await sendEvent({ type: 'error', message: error instanceof Error ? error.message : '生成内容失败' });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
