import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { persona, outline, model } = await request.json();

    if (!persona || !outline || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: persona, outline, and model' },
        { status: 400 }
      );
    }

    console.log('Received request:', { persona, outline, model });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 获取API基础URL
    const baseUrl = process.env.OPENAI_BASE_URL;
    
    // 检查是否配置了自定义API基础URL
    if (!baseUrl) {
      return NextResponse.json(
        { error: '请在.env.local中配置OPENAI_BASE_URL，使用与您的API key匹配的服务提供商地址' },
        { status: 400 }
      );
    }

    const systemPrompt = `你是一个深谙小红书流量密码的商业IP操盘手和爆款写手。你的任务是根据用户提供的【人设信息】和【内容大纲】，写出一篇极具'活人感'、能引发共鸣并引导私信/评论的小红书长文。
必须严格遵守以下排版与格式要求：
1. 标题：必须是'吸睛情绪主标题 + 垂直领域副标题'，含有痛点词，限制在20字以内。
2. 开篇：拒绝废话，直接用一个反常识的结论或真实的经历打破防御。
3. 正文：多用短句，多用空行。核心干货部分用 1. 2. 3. 列出，但要像聊天一样自然。
4. Emoji 含量：每段1-2个恰到好处的 Emoji，绝对不要滥用。
5. 结尾钩子：必须在文末留一个互动钩子，引导用户在评论区留言特定词汇，或者暗示私信可以获取独家资料。`;

    // 构建请求头，兼容不同格式的 API key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // 根据 API key 格式自动选择认证方式
    if (apiKey) {
      // 检测 API key 格式并选择合适的认证方式
      if (apiKey.startsWith('sk-')) {
        // OpenAI 格式
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (apiKey.includes('-')) {
        // 火山引擎等其他服务提供商格式
        // 同时使用 Bearer 和 X-Api-Key 认证，以支持不同的认证方式
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-Api-Key'] = apiKey;
      } else {
        // 其他格式
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    // 构建请求体，兼容不同的 API 提供商
    let requestBody: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `【人设信息】：${persona}\n【内容大纲】：${outline}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };

    // 检查是否是火山引擎API，如果是，使用正确的请求格式
    if (baseUrl.includes('volces.com')) {
      // 火山引擎可能需要不同的请求格式
      // 尝试使用用户提供的模型参数
      requestBody = {
        ...requestBody,
        model: model
      };
    }

    try {
      // 确保使用正确的API端点
      let apiEndpoint = `${baseUrl}/chat/completions`;
      
      // 检查是否是火山引擎API，如果是，使用正确的端点
      if (baseUrl.includes('volces.com')) {
        // 火山引擎的API端点
        apiEndpoint = `${baseUrl}/chat/completions`;
        
        // 只使用 Authorization 头进行认证
        headers['Authorization'] = `Bearer ${apiKey}`;
        delete headers['X-Api-Key'];
      }
      
      console.log('API Endpoint:', apiEndpoint);
      console.log('Model:', model);
      console.log('Headers:', headers);
      console.log('Request Body:', requestBody);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Response Text:', responseText);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          const errorMessage = errorData.error?.message || errorData.error || `API request failed with status ${response.status}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
      }

      const data = JSON.parse(responseText);
      const generatedContent = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({ content: generatedContent });
    } catch (error) {
      console.error('AI generation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}