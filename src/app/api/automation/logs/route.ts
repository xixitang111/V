import { NextRequest, NextResponse } from 'next/server';
import { taskLogs } from '../start/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    const logs = taskLogs[taskId] || [];
    return NextResponse.json({ logs, taskId });
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get logs' },
      { status: 500 }
    );
  }
}
