const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '..', 'xhs_auth.json');
const LOGIN_URL = 'https://creator.xiaohongshu.com/login';
const TIMEOUT = 3 * 60 * 1000; // 3分钟超时

async function xiaohongshuLogin() {
  console.log('🚀 正在启动浏览器...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 正在访问小红书创作者中心登录页...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    
    console.log('\n📱 请在弹出的浏览器中使用小红书 App 扫码登录...');
    console.log('⏱️  超时时间：3分钟\n');
    
    // 等待登录成功
    await Promise.race([
      waitForLoginSuccess(page, context),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('登录超时')), TIMEOUT)
      )
    ]);
    
    console.log('\n✅ 检测到登录成功！');
    await saveAuthState(context);
    
  } catch (error) {
    if (error.message === '登录超时') {
      console.log('\n❌ 登录超时，请重试');
    } else {
      console.log('\n❌ 发生错误:', error.message);
    }
  } finally {
    console.log('\n👋 正在关闭浏览器...');
    await browser.close();
    console.log('✨ 脚本执行完毕');
  }
}

async function waitForLoginSuccess(page, context) {
  while (true) {
    const currentUrl = page.url();
    
    // 检查URL是否不再是登录页
    if (!currentUrl.includes('/login')) {
      // 等待页面加载完成
      await page.waitForLoadState('networkidle');
      return true;
    }
    
    // 检查是否有用户头像或其他登录成功的标志
    try {
      const hasAvatar = await page.evaluate(() => {
        const avatarSelectors = [
          'img[alt*="头像"]',
          'img[class*="avatar"]',
          'img[class*="user"]',
          '.avatar',
          '.user-avatar'
        ];
        
        for (const selector of avatarSelectors) {
          if (document.querySelector(selector)) {
            return true;
          }
        }
        
        return false;
      });
      
      if (hasAvatar) {
        return true;
      }
    } catch (e) {
      // 继续检查
    }
    
    // 每隔1秒检查一次
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function saveAuthState(context) {
  console.log('💾 正在保存登录状态...');
  
  try {
    // 获取cookies
    const cookies = await context.cookies();
    
    // 获取localStorage
    const pages = context.pages();
    let localStorage = {};
    
    if (pages.length > 0) {
      try {
        localStorage = await pages[0].evaluate(() => {
          const data = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
          }
          return data;
        });
      } catch (e) {
        console.log('⚠️  无法获取localStorage');
      }
    }
    
    const authData = {
      cookies,
      localStorage,
      timestamp: Date.now(),
      userAgent: await pages[0]?.evaluate(() => navigator.userAgent) || ''
    };
    
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), 'utf-8');
    
    console.log(`🎉 登录状态已成功保存到 ${AUTH_FILE}`);
    
  } catch (error) {
    console.log('❌ 保存登录状态失败:', error.message);
    throw error;
  }
}

xiaohongshuLogin();
