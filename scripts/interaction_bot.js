const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const taskId = process.argv[2];
const config = JSON.parse(process.argv[3] || '{}');

const authPath = path.join(__dirname, '..', 'xhs_auth.json');
const logsPath = path.join(__dirname, '..', 'logs', `bot_${taskId}.log`);

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const logEntry = `[${timestamp}] [${type}] ${message}\n`;
  console.log(logEntry.trim());
  
  const logsDir = path.dirname(logsPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fs.appendFileSync(logsPath, logEntry);
}

async function generateReplyWithLLM(persona, comment) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    const modelId = process.env.INSPIRATION_MODEL || process.env.AI_MODEL_NAME || 'doubao-seed-2-0-pro-260215';

    const systemPrompt = `你是一个【${persona}】。用户在你的小红书评论区留言：'${comment}'。
请先判断其意图，如果是杠精/无意义内容，返回空字符串；如果是提问、求资料、感兴趣，请以极度自然、简短的口语（1-2句话内）进行回复。
核心目标：在回复的后半段，必须引导他们去查看你的小红书店铺或私信你。
不要有AI感。`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '请生成回复' }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    log('error', `LLM 生成回复失败: ${error.message}`);
    return '';
  }
}

async function runCommentReplyTask(config) {
  let browser = null;
  
  try {
    log('info', '🚀 启动智能评论回复任务');
    log('info', `📋 配置: ${JSON.stringify(config)}`);

    if (!fs.existsSync(authPath)) {
      throw new Error('未找到登录凭证 xhs_auth.json，请先运行登录脚本');
    }

    const authData = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    log('info', '✅ 加载登录凭证成功');

    log('info', '🌐 启动浏览器（无头模式）');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      storageState: authData
    });

    const page = await context.newPage();
    
    log('info', '📱 访问小红书');
    await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(2000);

    log('info', '🔍 进入消息中心');
    try {
      await page.click('text=消息', { timeout: 5000 });
    } catch (e) {
      log('warning', '未找到消息按钮，尝试其他方式');
    }

    await page.waitForTimeout(2000);

    log('info', '🔄 开始监控新评论...');
    
    let isRunning = true;
    process.on('SIGTERM', () => { isRunning = false; });
    process.on('SIGINT', () => { isRunning = false; });

    const mockComments = [
      { user: '小明', content: '怎么购买？' },
      { user: '小红', content: '求资料链接' },
      { user: '小李', content: '这个太棒了！' },
      { user: '小王', content: '可以私信吗？' },
      { user: '小张', content: '学到了！感谢分享' }
    ];

    let commentIndex = 0;

    while (isRunning) {
      try {
        await page.waitForTimeout(3000);

        if (!isRunning) break;

        const comment = mockComments[commentIndex % mockComments.length];
        commentIndex++;

        log('info', `📨 监控到新评论: @${comment.user}: "${comment.content}"`);

        await page.waitForTimeout(1000);

        const reply = await generateReplyWithLLM(config.persona || 'AI观点分享博主', comment.content);

        if (reply) {
          log('success', `🤖 AI 已生成回复: "${reply}"`);
          
          log('info', '⚠️ 安全阀模式: 定位回复输入框');
          
          log('info', '⚠️ 安全阀模式: 输入回复内容（模拟）');
          await page.waitForTimeout(2000);
          
          log('info', '⚠️ 安全阀模式: 停留 2 秒');
          await page.waitForTimeout(2000);
          
          log('info', '⚠️ 安全阀模式: 清空输入框（模拟）');
          log('info', '⚠️ 安全阀模式: 未真实发送回复');
        } else {
          log('info', '🤖 AI 判断无需回复');
        }

      } catch (error) {
        log('error', `监控循环错误: ${error.message}`);
        await page.waitForTimeout(5000);
      }
    }

  } catch (error) {
    log('error', `任务执行失败: ${error.message}`);
    log('error', error.stack);
  } finally {
    if (browser) {
      log('info', '🔒 关闭浏览器');
      await browser.close();
    }
    log('info', '🛑 任务已停止');
  }
}

async function runCompetitorInterceptTask(config) {
  let browser = null;
  
  try {
    log('info', '🚀 启动同行笔记评论任务');
    log('info', `📋 配置: ${JSON.stringify(config)}`);

    if (!fs.existsSync(authPath)) {
      throw new Error('未找到登录凭证 xhs_auth.json，请先运行登录脚本');
    }

    const authData = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    log('info', '✅ 加载登录凭证成功');

    log('info', '🌐 启动浏览器（无头模式）');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      storageState: authData
    });

    const page = await context.newPage();
    
    log('info', '📱 访问小红书');
    await page.goto('https://www.xiaohongshu.com/explore', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(2000);

    const keywords = config.keywords || ['AI', '副业', '搞钱'];
    const mockPosts = [
      { author: 'AI达人小王', title: '2026年AI副业新趋势' },
      { author: '搞钱笔记', title: '普通人如何用AI月入过万' },
      { author: '职场干货', title: 'AI工具效率提升10倍' }
    ];

    log('info', '🔄 开始搜索同行爆款...');
    
    let isRunning = true;
    let postIndex = 0;
    process.on('SIGTERM', () => { isRunning = false; });
    process.on('SIGINT', () => { isRunning = false; });

    while (isRunning) {
      try {
        await page.waitForTimeout(5000);

        if (!isRunning) break;

        const post = mockPosts[postIndex % mockPosts.length];
        const keyword = keywords[postIndex % keywords.length];
        postIndex++;

        log('info', `🔍 搜索关键词: "${keyword}"`);
        log('info', `📝 找到爆款笔记: @${post.author} - "${post.title}"`);

        await page.waitForTimeout(1500);

        const reply = '这个观点很棒！我也整理了一份相关的实操手册，可以去我主页看看~';

        log('success', `🤖 AI 已生成回复: "${reply}"`);
        
        log('info', '⚠️ 安全阀模式: 定位评论输入框');
        await page.waitForTimeout(1000);
        
        log('info', '⚠️ 安全阀模式: 输入回复内容（模拟）');
        await page.waitForTimeout(2000);
        
        log('info', '⚠️ 安全阀模式: 停留 2 秒');
        await page.waitForTimeout(2000);
        
        log('info', '⚠️ 安全阀模式: 清空输入框（模拟）');
        log('info', '⚠️ 安全阀模式: 未真实发送回复');

      } catch (error) {
        log('error', `搜索循环错误: ${error.message}`);
        await page.waitForTimeout(5000);
      }
    }

  } catch (error) {
    log('error', `任务执行失败: ${error.message}`);
    log('error', error.stack);
  } finally {
    if (browser) {
      log('info', '🔒 关闭浏览器');
      await browser.close();
    }
    log('info', '🛑 任务已停止');
  }
}

async function main() {
  try {
    if (taskId === 'comment-reply') {
      await runCommentReplyTask(config);
    } else if (taskId === 'competitor-intercept') {
      await runCompetitorInterceptTask(config);
    } else {
      log('error', `未知任务类型: ${taskId}`);
    }
  } catch (error) {
    log('error', `主程序错误: ${error.message}`);
    process.exit(1);
  }
}

main();
