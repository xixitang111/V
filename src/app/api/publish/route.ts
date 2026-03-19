import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容都是必填项' },
        { status: 400 }
      );
    }

    const scriptPath = path.join(
      process.cwd(),
      'scripts',
      'publish_long_text.js'
    );

    console.log('🚀 启动自动化发布脚本...');
    console.log('📄 标题:', title);
    console.log('📄 内容长度:', content.length, '字符');

    const child = spawn('node', [scriptPath, title, content], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `脚本执行失败，退出码: ${code}` });
        }
      });

      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '已成功存入小红书长文草稿箱！'
      });
    } else {
      return NextResponse.json(
        { error: result.error || '发布失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('发布 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
