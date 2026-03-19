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
      'Authorization': `Bearer ${apiKey}`,
      'X-Api-Key': apiKey
    };

    try {
      // 调用火山引擎API获取推理接入点列表
      const response = await fetch(`${baseUrl}/endpoints`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const endpoints = data.data || [];

      console.log('Available endpoints:', endpoints);

      return NextResponse.json({ endpoints });
    } catch (error) {
      console.error('Get endpoints error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to get endpoints' },
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