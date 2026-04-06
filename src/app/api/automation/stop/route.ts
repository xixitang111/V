import { NextRequest, NextResponse } from 'next/server';
import { taskStatus, addLog } from '../store';

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    if (taskStatus[taskId]) {
      taskStatus[taskId].isRunning = false;
      addLog(taskId, 'info', `🛑 任务已停止: ${taskId}`);
    }

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('Stop automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stop task' },
      { status: 500 }
    );
  }
}
