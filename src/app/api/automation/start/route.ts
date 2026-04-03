import { NextRequest, NextResponse } from 'next/server';
import { getNextPendingItem, removeFromQueue } from '../../../../lib/queue';

let taskStatus: Record<string, { isRunning: boolean; config: any }> = {};
let taskLogs: Record<string, Array<{ timestamp: string; type: string; message: string }>> = {};

export async function POST(request: NextRequest) {
  try {
    const { taskId, config } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    if (taskStatus[taskId]?.isRunning) {
      return NextResponse.json(
        { error: 'Task is already running' },
        { status: 400 }
      );
    }

    taskStatus[taskId] = { isRunning: true, config };
    taskLogs[taskId] = [];

    addLog(taskId, 'info', `🚀 任务已启动: ${taskId}`);
    addLog(taskId, 'info', `📋 配置: ${JSON.stringify(config)}`);

    simulateTask(taskId, config);

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('Start automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start task' },
      { status: 500 }
    );
  }
}

function addLog(taskId: string, type: string, message: string) {
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  if (!taskLogs[taskId]) {
    taskLogs[taskId] = [];
  }
  taskLogs[taskId].push({ timestamp, type, message });
  if (taskLogs[taskId].length > 100) {
    taskLogs[taskId] = taskLogs[taskId].slice(-100);
  }
}

async function simulateTask(taskId: string, config: any) {
  try {
    if (taskId === 'auto-publish') {
      await simulateAutoPublish(taskId, config);
    } else if (taskId === 'comment-reply') {
      await simulateCommentReply(taskId, config);
    } else if (taskId === 'competitor-intercept') {
      await simulateCompetitorIntercept(taskId, config);
    }
  } catch (error) {
    addLog(taskId, 'error', `❌ 任务执行错误: ${error instanceof Error ? error.message : '未知错误'}`);
    if (taskStatus[taskId]) {
      taskStatus[taskId].isRunning = false;
    }
  }
}

async function simulateAutoPublish(taskId: string, config: any) {
  const scheduleTimes = config.scheduleTimes || ['08:00', '12:00', '18:00'];
  
  addLog(taskId, 'info', `📅 发布时间表: ${scheduleTimes.join(', ')}`);
  addLog(taskId, 'info', `🔄 开始检查待发布队列...`);

  while (taskStatus[taskId]?.isRunning) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!taskStatus[taskId]?.isRunning) break;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    addLog(taskId, 'info', `🕐 当前时间: ${currentTime}`);

    const nextItem = getNextPendingItem();
    
    if (nextItem) {
      addLog(taskId, 'success', `📝 提取文章: "${nextItem.title}"`);
      addLog(taskId, 'info', `🚀 开始执行自动排版存草稿...`);

      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(taskId, 'info', `🌐 启动浏览器（无头模式）`);

      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(taskId, 'info', `📱 访问小红书创作者中心`);

      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(taskId, 'info', `✏️ 点击新的创作`);

      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog(taskId, 'info', `📄 填写标题: "${nextItem.title}"`);

      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(taskId, 'info', `📝 填写正文内容`);

      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(taskId, 'info', `🎨 点击一键排版`);

      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(taskId, 'info', `➡️ 点击下一步`);

      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(taskId, 'info', `💾 点击暂存离开`);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      removeFromQueue(nextItem.id);
      
      addLog(taskId, 'success', `✅ 成功存入小红书长文草稿箱！`);
      addLog(taskId, 'info', `🗑️ 已从队列中移除`);
      addLog(taskId, 'info', `⚠️ 安全阀模式: 已存草稿，未发布`);
    } else {
      addLog(taskId, 'info', `📭 待发布队列为空，继续监控...`);
    }
  }
}

async function simulateCommentReply(taskId: string, config: any) {
  const mockComments = [
    { user: '小明', content: '怎么购买？' },
    { user: '小红', content: '求资料链接' },
    { user: '小李', content: '这个太棒了！' },
    { user: '小王', content: '可以私信吗？' },
    { user: '小张', content: '学到了！感谢分享' }
  ];

  let commentIndex = 0;

  while (taskStatus[taskId]?.isRunning) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!taskStatus[taskId]?.isRunning) break;

    const comment = mockComments[commentIndex % mockComments.length];
    commentIndex++;

    addLog(taskId, 'info', `📨 监控到新评论: @${comment.user}: "${comment.content}"`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    let reply = '';
    if (comment.content.includes('购买') || comment.content.includes('链接')) {
      reply = '主页店铺已上架，点击直达~';
    } else if (comment.content.includes('资料') || comment.content.includes('私信')) {
      reply = '已私信你啦，注意查收！';
    } else {
      reply = '谢谢喜欢！可以看看我的其他笔记哦~';
    }

    addLog(taskId, 'success', `🤖 AI 已回复: "${reply}"`);
    addLog(taskId, 'info', `⚠️ 安全阀模式: 未真实发送，仅模拟`);
  }
}

async function simulateCompetitorIntercept(taskId: string, config: any) {
  const mockKeywords = config.keywords || ['AI', '副业', '搞钱'];
  const mockPosts = [
    { author: 'AI达人小王', title: '2026年AI副业新趋势' },
    { author: '搞钱笔记', title: '普通人如何用AI月入过万' },
    { author: '职场干货', title: 'AI工具效率提升10倍' }
  ];

  let postIndex = 0;

  while (taskStatus[taskId]?.isRunning) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!taskStatus[taskId]?.isRunning) break;

    const post = mockPosts[postIndex % mockPosts.length];
    const keyword = mockKeywords[postIndex % mockKeywords.length];
    postIndex++;

    addLog(taskId, 'info', `🔍 搜索关键词: "${keyword}"`);
    addLog(taskId, 'info', `📝 找到爆款笔记: @${post.author} - "${post.title}"`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const reply = '这个观点很棒！我也整理了一份相关的实操手册，可以去我主页看看~';

    addLog(taskId, 'success', `🤖 AI 已生成回复: "${reply}"`);
    addLog(taskId, 'info', `⚠️ 安全阀模式: 未真实发送，仅模拟`);
  }
}

export { taskStatus, taskLogs, addLog };
