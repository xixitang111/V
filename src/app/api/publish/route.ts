import { NextResponse } from 'next/server';
import { addToQueue } from '../../../lib/queue';

export async function POST(request: Request) {
  try {
    const { title, content, postDescription, persona, topic, accountId } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容都是必填项' },
        { status: 400 }
      );
    }

    console.log('📥 将内容加入待审核队列...');
    console.log('📄 标题:', title);
    console.log('👤 人设:', persona || '未指定', '| 选题:', topic || '未指定');
    console.log('🔗 账号ID:', accountId || '未指定');

    const queueItem = await addToQueue({
      title,
      content,
      postDescription: postDescription || '',
      persona: persona || '',
      topic: topic || '',
      accountId: accountId || undefined,
    });

    return NextResponse.json({
      success: true,
      message: '已加入待审核队列，请前往数据中心确认',
      queueItem,
    });
  } catch (error) {
    console.error('发布 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
