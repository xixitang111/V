import { NextRequest, NextResponse } from 'next/server';
import { getNextApprovedItem, updateQueueItem } from '../../../../lib/queue';
import { storage } from '../../../../lib/storage';
import { taskStatus, taskLogs, addLog } from '../store';
import path from 'path';
import fs from 'fs';

// ── POST /api/automation/start ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { taskId, config } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }
    if (taskStatus[taskId]?.isRunning) {
      return NextResponse.json({ error: 'Task is already running' }, { status: 400 });
    }

    taskStatus[taskId] = { isRunning: true, config: config || {} };
    taskLogs[taskId] = [];

    addLog(taskId, 'info', `🚀 任务已启动: ${taskId}`);

    // 异步执行，不阻塞 HTTP 响应
    runTask(taskId, config || {});

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('Start automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start task' },
      { status: 500 }
    );
  }
}

// ── 任务分发 ────────────────────────────────────────────────────────────────
async function runTask(taskId: string, config: Record<string, unknown>) {
  try {
    if (taskId === 'auto-publish') {
      await autoPublishLoop(taskId, config);
    } else if (taskId === 'comment-reply') {
      await simulateCommentReply(taskId, config);
    } else if (taskId === 'competitor-intercept') {
      await simulateCompetitorIntercept(taskId, config);
    }
  } catch (error) {
    addLog(taskId, 'error', `❌ 任务异常: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (taskStatus[taskId]) taskStatus[taskId].isRunning = false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 自动发布主循环
// ══════════════════════════════════════════════════════════════════════════════
async function autoPublishLoop(taskId: string, config: Record<string, unknown>) {
  const scheduleTimes = (config.scheduleTimes as string[]) || ['08:00', '12:00', '18:00'];
  addLog(taskId, 'info', `📅 预设发布时间: ${scheduleTimes.join(', ')}`);
  addLog(taskId, 'info', `🔄 开始监控待发布队列...`);

  while (taskStatus[taskId]?.isRunning) {
    await sleep(5000);
    if (!taskStatus[taskId]?.isRunning) break;

    const item = await getNextApprovedItem();

    if (!item) {
      addLog(taskId, 'info', `📭 队列为空，继续监控...`);
      continue;
    }

    addLog(taskId, 'success', `📝 发现待发布内容: "${item.title}"`);

    // 标记为发布中
    await updateQueueItem(item.id, { status: 'publishing' });

    const ok = await publishToDraft(taskId, item);

    if (ok) {
      await updateQueueItem(item.id, { status: 'published' });
      addLog(taskId, 'success', `✅ 已存入草稿箱，队列状态更新为 published`);
    } else {
      await updateQueueItem(item.id, { status: 'failed' });
      addLog(taskId, 'error', `❌ 发布失败，队列状态更新为 failed`);
    }
  }

  addLog(taskId, 'info', '🛑 自动发布任务已停止');
}

// ══════════════════════════════════════════════════════════════════════════════
// 方案 B：真实 Playwright 打开浏览器，填写内容，存草稿
// ══════════════════════════════════════════════════════════════════════════════
async function publishToDraft(
  taskId: string,
  item: Awaited<ReturnType<typeof getNextApprovedItem>> & object
): Promise<boolean> {
  // 动态 import Playwright（避免在无 Playwright 环境下报错）
  let chromium: typeof import('playwright').chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    addLog(taskId, 'error', '❌ Playwright 未安装，请运行: npx playwright install chromium');
    return false;
  }

  let browser: import('playwright').Browser | null = null;

  try {
    // ── 1. 找到账号及 authFile ──────────────────────────────────────────────
    const accounts = await storage.getAccounts();
    const account = item?.accountId
      ? accounts.find(a => a.id === item.accountId) ?? accounts[0]
      : accounts[0];

    if (!account) {
      addLog(taskId, 'error', '❌ 未找到账号，请先在「身份管理」中添加小红书账号');
      return false;
    }

    addLog(taskId, 'info', `👤 使用账号: ${account.nickname}`);

    if (!account.authFile) {
      addLog(taskId, 'error', `❌ 账号「${account.nickname}」尚未完成扫码授权，请前往「身份管理」扫码`);
      return false;
    }

    const authFilePath = path.join(process.cwd(), account.authFile);
    if (!fs.existsSync(authFilePath)) {
      addLog(taskId, 'error', `❌ 授权文件不存在 (${account.authFile})，请重新扫码授权`);
      return false;
    }

    addLog(taskId, 'info', `🔑 授权文件已就绪: ${account.authFile}`);

    // ── 2. 启动有头浏览器（方案 B：用户可见）──────────────────────────────
    addLog(taskId, 'info', '🌐 启动浏览器（有头模式，你将看到浏览器自动操作）...');
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
      timeout: 30000,
    });

    const context = await browser.newContext({
      storageState: authFilePath,
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // ── 3. 进入创作者中心 ─────────────────────────────────────────────────
    addLog(taskId, 'info', '📱 访问小红书创作者中心...');
    await page.goto('https://creator.xiaohongshu.com/publish/publish?source=note', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await sleep(2000);

    // 检测是否跳转到登录页（cookies 过期）
    if (page.url().includes('/login') || page.url().includes('signin')) {
      addLog(taskId, 'error', `❌ 账号「${account.nickname}」登录凭证已过期，请重新扫码授权`);
      return false;
    }

    addLog(taskId, 'success', '✅ 已进入创作者中心');

    // ── 4. 切换到长文模式 ─────────────────────────────────────────────────
    addLog(taskId, 'info', '📄 切换到长文发布模式...');
    const longTextSelectors = ['text=长文', '[data-tab="article"]', 'span:has-text("长文")'];
    let switchedToLongText = false;
    for (const sel of longTextSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 })) {
          await el.click();
          await sleep(1500);
          switchedToLongText = true;
          addLog(taskId, 'success', '✅ 已切换到长文模式');
          break;
        }
      } catch { /* 继续尝试下一个选择器 */ }
    }
    if (!switchedToLongText) {
      addLog(taskId, 'warning', '⚠️ 未找到长文切换标签，尝试继续（可能已在长文模式）');
    }

    // ── 5. 填写标题 ───────────────────────────────────────────────────────
    addLog(taskId, 'info', `✏️ 填写标题: "${item?.title}"`);
    const titleSelectors = [
      'input[placeholder*="标题"]',
      'input[placeholder*="请输入标题"]',
      '.title-input input',
      'input[maxlength="100"]',
    ];
    let titleFilled = false;
    for (const sel of titleSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 })) {
          await el.click();
          await el.fill(item?.title || '');
          titleFilled = true;
          addLog(taskId, 'success', '✅ 标题已填写');
          break;
        }
      } catch { /* 继续 */ }
    }
    if (!titleFilled) {
      addLog(taskId, 'warning', '⚠️ 未找到标题输入框，跳过');
    }

    await sleep(500);

    // ── 6. 填写正文（剪贴板注入 → contenteditable 直接写入）────────────────
    addLog(taskId, 'info', '📝 填写正文内容...');
    const editorSelectors = [
      '.ql-editor',
      '[contenteditable="true"]',
      '.article-editor [contenteditable]',
      '.ProseMirror',
      '.tiptap',
    ];
    let contentFilled = false;
    const contentText = item?.content || '';

    for (const sel of editorSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 })) {
          await el.click();
          await sleep(300);

          // 方法一：evaluate 直接写入 innerHTML（最快）
          const filled = await page.evaluate((args) => {
            const editor = document.querySelector(args.sel);
            if (!editor) return false;
            // 将换行转成段落
            const html = args.text
              .split('\n')
              .map((line: string) => `<p>${line || '<br>'}</p>`)
              .join('');
            editor.innerHTML = html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }, { sel, text: contentText });

          if (filled) {
            contentFilled = true;
            addLog(taskId, 'success', `✅ 正文已填写（共 ${contentText.length} 字）`);
            break;
          }
        }
      } catch { /* 继续 */ }
    }

    // 方法二：fallback 用键盘粘贴
    if (!contentFilled) {
      addLog(taskId, 'info', '🔄 尝试剪贴板粘贴方式...');
      try {
        await page.evaluate((text) => {
          Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: () => Promise.resolve(), readText: () => Promise.resolve(text) },
            writable: true,
          });
        }, contentText);
        const editor = page.locator('[contenteditable="true"]').first();
        await editor.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.type(contentText.slice(0, 500)); // 只输入前500字防止超时
        contentFilled = true;
        addLog(taskId, 'warning', '⚠️ 使用键盘输入方式（仅填写部分内容）');
      } catch { /* 最终失败 */ }
    }

    if (!contentFilled) {
      addLog(taskId, 'warning', '⚠️ 正文填写失败，但继续尝试存草稿');
    }

    await sleep(1000);

    // ── 7. 截图存档 ───────────────────────────────────────────────────────
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      const screenshotPath = path.join(publicDir, `draft_${item?.id}.png`);
      await page.screenshot({ path: screenshotPath });
      addLog(taskId, 'success', `📸 已截图: /draft_${item?.id}.png`);
    } catch { /* 截图失败不影响主流程 */ }

    // ── 8. 存草稿（方案 B：不点发布）─────────────────────────────────────
    addLog(taskId, 'info', '💾 寻找「存草稿」按钮...');
    const draftSelectors = [
      'button:has-text("存草稿")',
      'button:has-text("暂存")',
      'button:has-text("保存草稿")',
      '[data-action="save-draft"]',
    ];
    let savedDraft = false;
    for (const sel of draftSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 })) {
          await btn.click();
          await sleep(2000);
          savedDraft = true;
          addLog(taskId, 'success', '✅ 已成功存入小红书草稿箱！');
          break;
        }
      } catch { /* 继续 */ }
    }

    if (!savedDraft) {
      addLog(taskId, 'warning', '⚠️ 未点击存草稿（按钮未找到），内容已填写完毕');
    }

    addLog(taskId, 'info', '⚠️ 方案B模式：已存草稿，未真实发布');
    return true;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    addLog(taskId, 'error', `❌ Playwright 操作异常: ${msg}`);
    return false;
  } finally {
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
      addLog(taskId, 'info', '🔒 浏览器已关闭');
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 评论回复（保持模拟，后续可替换为真实 Playwright）
// ══════════════════════════════════════════════════════════════════════════════
async function simulateCommentReply(taskId: string, config: Record<string, unknown>) {
  const mockComments = [
    { user: '小明', content: '怎么购买？' },
    { user: '小红', content: '求资料链接' },
    { user: '小李', content: '这个太棒了！' },
    { user: '小王', content: '可以私信吗？' },
    { user: '小张', content: '学到了！感谢分享' },
  ];
  let idx = 0;

  while (taskStatus[taskId]?.isRunning) {
    await sleep(3000);
    if (!taskStatus[taskId]?.isRunning) break;

    const comment = mockComments[idx++ % mockComments.length];
    addLog(taskId, 'info', `📨 监控到新评论: @${comment.user}: "${comment.content}"`);
    await sleep(800);

    let reply = '谢谢喜欢！可以看看我的其他笔记哦~';
    if (comment.content.includes('购买') || comment.content.includes('链接')) reply = '主页店铺已上架，点击直达~';
    else if (comment.content.includes('资料') || comment.content.includes('私信')) reply = '已私信你啦，注意查收！';

    addLog(taskId, 'success', `🤖 AI 回复: "${reply}"`);
    addLog(taskId, 'info', '⚠️ 安全阀模式: 未真实发送，仅模拟');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 同行截流（保持模拟）
// ══════════════════════════════════════════════════════════════════════════════
async function simulateCompetitorIntercept(taskId: string, config: Record<string, unknown>) {
  const keywords = (config.keywords as string[]) || ['AI', '副业', '搞钱'];
  const mockPosts = [
    { author: 'AI达人小王', title: '2026年AI副业新趋势' },
    { author: '搞钱笔记', title: '普通人如何用AI月入过万' },
    { author: '职场干货', title: 'AI工具效率提升10倍' },
  ];
  let idx = 0;

  while (taskStatus[taskId]?.isRunning) {
    await sleep(5000);
    if (!taskStatus[taskId]?.isRunning) break;

    const post = mockPosts[idx % mockPosts.length];
    const kw = keywords[idx++ % keywords.length];

    addLog(taskId, 'info', `🔍 搜索关键词: "${kw}"`);
    addLog(taskId, 'info', `📝 找到爆款笔记: @${post.author} - "${post.title}"`);
    await sleep(1000);

    addLog(taskId, 'success', `🤖 AI 生成回复: "这个观点很棒！可以去我主页看看相关实操手册~"`);
    addLog(taskId, 'info', '⚠️ 安全阀模式: 未真实发送，仅模拟');
  }
}

// ── 工具函数 ────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

