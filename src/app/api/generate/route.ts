import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { persona, outline, model, history = '' } = await request.json();

    if (!persona || !outline || !model) {
      return NextResponse.json(
        { error: '缺少必填字段：persona, outline, model' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DOUBAO_API_KEY;
    const baseUrl = process.env.DOUBAO_BASE_URL;
    
    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: '请在 .env.local 中配置 DOUBAO_API_KEY 和 DOUBAO_BASE_URL' },
        { status: 500 }
      );
    }

    const systemPrompt = `你现在是我的专属自媒体爆款写手与商业分析智囊。你的核心任务是：以我提供的【最新创作 Idea：${outline}】为导向，参考当前的【人设特征：${persona}】以及【历史过往内容参考：${history}】（如无则忽略），为我生成一篇极具深度的、可以直接发布的小红书长文。

### 必须严格遵守的四大创作军规：
1. **人设高度统一**：严格贴合传入的人设身份、语言风格和专属标签。保持账号极强的辨识度，杜绝任何与人设相悖的表述。
2. **风格延续但绝对避雷同**：主动创新！观点角度、案例选取必须与历史内容不同，不做重复创作，给老粉新鲜感。
3. **深度下钻与情绪嘴替**：
   - 开头必须抓人：用痛点、悬念或反直觉/反常识的结论打破读者防御。
   - 内容必须硬核：多用具体、甚至有些酷炫的行业案例和降维分析，提供极强的 Insights 和 Takeaways。
   - 情绪必须到位：做目标受众的"嘴替"，激发评论区的分享欲和讨论欲。
   - 态度必须去油：**绝对不要有"爹味"和高高在上的说教感**，保持平视沟通。
4. **小红书原生语感与排版**：
   - 减少双引号的死板引用，多用长短句交错，营造极强的"活人真实感"。
   - 结构必须清晰分段，合理使用且不滥用 Emoji 作为视觉停顿提示。

### 输出格式约束：
你必须返回一个合法的 JSON 对象，不要包含任何额外的 Markdown 标记（如 \`\`\`json），必须包含以下两个字段：
- \`article_content\`: 长文正文内容（包含内部的小标题、带有合理换行符 \\n 和 Emoji 的正文，用于直接复制进小红书长文编辑器排版）。
- \`post_description\`: 小红书笔记外发文案（包含：1. 极具吸引力的主标题；2. 一段"说人话"的精简摘要/导语；3. 紧跟在底部的几个精准热点话题 #Tags）。`;
    
    console.log('调用豆包 API...');
    console.log('模型:', model);
    console.log('人设:', persona);
    console.log('创作思路:', outline);
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: outline }
        ],
        temperature: 0.8,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('API 返回内容为空');
    }

    console.log('大模型返回内容:', content);

    // 增强的 JSON 解析逻辑
    let jsonContent = content.trim();
    
    // 清理可能的 Markdown 代码块标记
    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/```$/, '');
    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/```$/, '');
    
    // 尝试找到第一个 { 和最后一个 } 之间的内容
    const firstBraceIndex = jsonContent.indexOf('{');
    const lastBraceIndex = jsonContent.lastIndexOf('}');
    
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      jsonContent = jsonContent.substring(firstBraceIndex, lastBraceIndex + 1);
    }

    try {
      const generatedData = JSON.parse(jsonContent);
      
      // 验证必需的字段是否存在
      if (!generatedData.article_content) {
        console.warn('返回数据缺少 article_content 字段');
        generatedData.article_content = content;
      }
      
      if (!generatedData.post_description) {
        console.warn('返回数据缺少 post_description 字段');
        generatedData.post_description = '请根据长文内容手动编辑外发文案';
      }
      
      console.log('生成成功！');
      return NextResponse.json(generatedData);
    } catch (parseError) {
      console.error('解析JSON失败:', parseError);
      console.error('尝试解析的内容:', jsonContent);
      
      // 如果解析失败，返回原始内容作为 article_content
      return NextResponse.json({
        article_content: content,
        post_description: '请根据长文内容手动编辑外发文案'
      });
    }
    
  } catch (error) {
    console.error('生成内容失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成内容失败' },
      { status: 500 }
    );
  }
}
