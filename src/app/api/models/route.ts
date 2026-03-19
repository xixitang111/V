import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.OPENAI_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: '请在.env.local中配置OPENAI_BASE_URL，使用与您的API key匹配的服务提供商地址' },
        { status: 400 }
      );
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    try {
      // 调用火山引擎API获取模型列表
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const models = data.data || [];
      
      // 打印模型列表，以便调试
      console.log('Available models:', models);

      // 过滤出文本生成模型
      const textGenerationModels = models.filter((model: any) => 
        model.task_type && model.task_type.includes('TextGeneration')
      );

      // 格式化模型数据
      const formattedModels = textGenerationModels.map((model: any) => ({
        id: model.id,
        name: model.name
      }));

      return NextResponse.json({ models: formattedModels });
    } catch (error) {
      console.error('Get models error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to get models' },
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