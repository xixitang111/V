import { NextRequest, NextResponse } from 'next/server';
import { getQueue, getPendingCount, removeFromQueue } from '../../../lib/queue';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'count') {
      const count = getPendingCount();
      return NextResponse.json({ count });
    }

    const queue = getQueue();
    return NextResponse.json({ queue });
  } catch (error) {
    console.error('获取队列错误:', error);
    return NextResponse.json(
      { error: '获取队列失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 参数' },
        { status: 400 }
      );
    }

    const removed = removeFromQueue(id);
    if (!removed) {
      return NextResponse.json(
        { error: '未找到该项目' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error('删除队列项目错误:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
