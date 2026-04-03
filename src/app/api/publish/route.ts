import { NextResponse } from 'next/server';
import { addToQueue } from '../../../lib/queue';

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容都是必填项' },
        { status: 400 }
      );
    }

    console.log('📥 将内容加入待发布队列...');
    console.log('📄 标题:', title);
    console.log('📄 内容长度:', content.length, '字符');

    const queueItem = addToQueue(title, content);

    return NextResponse.json({
      success: true,
      message: '已加入待发布队列！',
      queueItem
    });
  } catch (error) {
    console.error('发布 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
