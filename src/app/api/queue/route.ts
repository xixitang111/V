import { NextRequest, NextResponse } from 'next/server';
import {
  getQueue,
  getAwaitingReviewCount,
  removeFromQueue,
  updateQueueItem,
  QueueStatus,
} from '../../../lib/queue';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const status = searchParams.get('status') as QueueStatus | null;

    if (action === 'count') {
      const count = await getAwaitingReviewCount();
      return NextResponse.json({ count });
    }

    let queue = await getQueue();
    if (status) {
      queue = queue.filter(item => item.status === status);
    }

    // Supabase already returns sorted desc; sort file-fallback too
    queue.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ queue });
  } catch (error) {
    console.error('获取队列错误:', error);
    return NextResponse.json({ error: '获取队列失败' }, { status: 500 });
  }
}

// 审批 / 拒绝 / 编辑内容
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, content, postDescription } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少 id 参数' }, { status: 400 });
    }

    const updates: Parameters<typeof updateQueueItem>[1] = {};

    if (status) updates.status = status;
    if (content !== undefined) updates.content = content;
    if (postDescription !== undefined) updates.postDescription = postDescription;

    const updated = await updateQueueItem(id, updates);

    if (!updated) {
      return NextResponse.json({ error: '未找到该项目' }, { status: 404 });
    }

    console.log(`✅ 队列项 ${id} 已更新:`, updates);
    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('更新队列项目错误:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少 id 参数' }, { status: 400 });
    }

    const removed = await removeFromQueue(id);
    if (!removed) {
      return NextResponse.json({ error: '未找到该项目' }, { status: 404 });
    }

    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error('删除队列项目错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
