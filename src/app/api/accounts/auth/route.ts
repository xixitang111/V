import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST() {
  let browser = null;

  // 动态 import Playwright（Vercel 等 serverless 平台不支持，graceful fallback）
  let chromium: typeof import('playwright').chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    return NextResponse.json(
      { error: '扫码授权需要在本地环境运行，Vercel 等云平台暂不支持此功能。请在本地运行 npm run dev 后重试。' },
      { status: 501 }
    );
  }

  try {
    console.log('🚀 启动小红书扫码授权...');

    console.log('🌐 启动浏览器（非无头模式）');
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('📱 访问小红书创作者服务平台');
    await page.goto('https://creator.xiaohongshu.com/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ 等待用户扫码登录...');
    console.log('💡 提示：请在弹出的浏览器中使用小红书 App 扫码');

    let loginSuccess = false;
    const startTime = Date.now();
    const timeout = 3 * 60 * 1000;

    while (!loginSuccess && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          loginSuccess = true;
          console.log('✅ 检测到登录成功！');
          break;
        }
      } catch (e) {
        console.log('⚠️ 检查URL时出错:', e instanceof Error ? e.message : String(e));
        continue;
      }
    }

    if (!loginSuccess) {
      throw new Error('登录超时，请重试');
    }

    await page.waitForTimeout(2000);

    const timestamp = Date.now();
    const authFileName = `xhs_auth_${timestamp}.json`;
    const authFilePath = path.join(process.cwd(), authFileName);

    console.log('💾 保存登录凭证...');
    const storageState = await context.storageState();
    fs.writeFileSync(authFilePath, JSON.stringify(storageState, null, 2));

    console.log('🔒 关闭浏览器');
    await browser.close();

    console.log('✅ 授权成功！');
    return NextResponse.json({ 
      success: true, 
      authFile: authFileName
    });

  } catch (error) {
    console.error('❌ 授权失败:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('关闭浏览器失败:', e);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : '授权失败' },
      { status: 500 }
    );
  }
}
