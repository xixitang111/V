const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '..', 'xhs_auth.json');
const PUBLISH_URL = 'https://creator.xiaohongshu.com/publish/publish';

function randomDelay(min = 500, max = 1500) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function publishLongText(title, content) {
  console.log('🚀 开始执行纯长文自动发布脚本启动');
  
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error('登录状态文件不存在，请先运行 npm run xhs:login 进行登录');
  }

  const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  
  console.log('📄 加载登录状态成功');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: authData.userAgent
  });

  await context.addCookies(authData.cookies);

  const page = await context.newPage();

  try {
    console.log('🌐 正在访问发布页面...');
    await page.goto(PUBLISH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await randomDelay();

    console.log('🔍 检查并关闭弹窗...');
    await closePopups(page);

    console.log('📝 定位长文模式...');
    await switchToLongTextMode(page);

    console.log('🆕 点击新的创作...');
    await clickNewCreation(page);

    console.log('✍️  填写标题...');
    await fillTitle(page, title);

    console.log('📄 填写正文...');
    await fillContent(page, content);

    console.log('🎨 点击一键排版...');
    await clickOneClickFormat(page);

    console.log('➡️  点击下一步...');
    await clickNextStep(page);

    console.log('💾 点击暂存离开...');
    await clickSaveAndLeave(page);

    console.log('🎉 操作完成！');

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    throw error;
  } finally {
    console.log('\n👋 正在关闭浏览器...');
    await browser.close();
  }
}

async function closePopups(page) {
  const popupSelectors = [
    'button:has-text("关闭")',
    'button:has-text("知道了")',
    'button:has-text("我知道了")',
    '.close-btn',
    '[class*="close"]',
    '[aria-label*="关闭"]'
  ];

  for (const selector of popupSelectors) {
    try {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          console.log('  - 关闭了一个弹窗');
          await randomDelay();
        }
      }
    } catch (e) {
    }
  }
}

async function switchToLongTextMode(page) {
  try {
    const longTextButton = page.getByText('写长文', { exact: false });
    if (await longTextButton.isVisible({ timeout: 3000 })) {
      await longTextButton.click();
      await randomDelay();
      console.log('  - 已切换到长文模式');
    }
  } catch (e) {
    console.log('  - 无需切换长文模式或切换失败');
  }
}

async function clickNewCreation(page) {
  try {
    const newCreationSelectors = [
      page.getByText('新的创作', { exact: false }),
      page.getByText('新建', { exact: false }),
      page.getByText('创作', { exact: false })
    ];

    for (const selector of newCreationSelectors) {
      try {
        if (await selector.isVisible({ timeout: 2000 })) {
          await selector.click();
          await randomDelay(1000, 2000);
          console.log('  - 已点击新的创作');
          return;
        }
      } catch (e) {
      }
    }
    console.log('  - 未找到新的创作按钮，继续尝试');
  } catch (e) {
    console.log('  - 点击新的创作失败:', e.message);
  }
}

async function fillTitle(page, title) {
  const titleSelectors = [
    'input[placeholder*="标题"]',
    'input[placeholder*="填写标题"]',
    'textarea[placeholder*="标题"]',
    'input[name*="title"]'
  ];

  for (const selector of titleSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 })) {
        await input.click();
        await randomDelay(300, 500);
        await input.fill('');
        await randomDelay(200, 400);
        
        for (const char of title) {
          await input.type(char);
          await randomDelay(50, 150);
        }
        
        await randomDelay();
        console.log('  - 标题填写完成');
        return;
      }
    } catch (e) {
    }
  }

  throw new Error('未找到标题输入框');
}

async function fillContent(page, content) {
  const contentSelectors = [
    'div[contenteditable="true"]',
    '[class*="editor"] div[contenteditable="true"]',
    'div[role="textbox"]'
  ];

  for (const selector of contentSelectors) {
    try {
      const editor = page.locator(selector).first();
      if (await editor.isVisible({ timeout: 2000 })) {
        await editor.click();
        await randomDelay(300, 500);
        
        await editor.fill('');
        await randomDelay(200, 400);
        
        const paragraphs = content.split('\n');
        
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i];
          
          if (paragraph.trim() === '') {
            await page.keyboard.press('Enter');
            await randomDelay(200, 400);
            continue;
          } else {
              for (const char of paragraph) {
                await page.keyboard.type(char);
                await randomDelay(20, 80);
              }
              
              if (i < paragraphs.length - 1) {
                await page.keyboard.press('Enter');
                await randomDelay(300, 600);
              }
            }
          }
        
        await randomDelay();
        console.log('  - 正文填写完成');
        return;
      }
    } catch (e) {
    }
  }

  throw new Error('未找到正文编辑器');
}

async function clickOneClickFormat(page) {
  try {
    const formatSelectors = [
      page.getByText('一键排版', { exact: false }),
      page.getByText('排版', { exact: false })
    ];

    for (const selector of formatSelectors) {
      try {
        if (await selector.isVisible({ timeout: 2000 })) {
          await selector.click();
          await randomDelay(1000, 2000);
          console.log('  - 已点击一键排版');
          return;
        }
      } catch (e) {
      }
    }
    console.log('  - 未找到一键排版按钮，继续');
  } catch (e) {
    console.log('  - 点击一键排版失败:', e.message);
  }
}

async function clickNextStep(page) {
  try {
    const nextSelectors = [
      page.getByText('下一步', { exact: false }),
      page.getByText('继续', { exact: false })
    ];

    for (const selector of nextSelectors) {
      try {
        if (await selector.isVisible({ timeout: 2000 })) {
          await selector.click();
          await randomDelay(1000, 2000);
          console.log('  - 已点击下一步');
          return;
        }
      } catch (e) {
      }
    }
    console.log('  - 未找到下一步按钮，继续');
  } catch (e) {
    console.log('  - 点击下一步失败:', e.message);
  }
}

async function clickSaveAndLeave(page) {
  try {
    const saveSelectors = [
      page.getByText('暂存离开', { exact: false }),
      page.getByText('暂存', { exact: false }),
      page.getByText('保存', { exact: false })
    ];

    for (const selector of saveSelectors) {
      try {
        if (await selector.isVisible({ timeout: 2000 })) {
          await selector.click();
          await randomDelay(1000, 2000);
          console.log('  - 已点击暂存离开');
          return;
        }
      } catch (e) {
      }
    }
    console.log('  - 未找到暂存离开按钮，继续');
  } catch (e) {
    console.log('  - 点击暂存离开失败:', e.message);
  }
}

const title = process.argv[2];
const content = process.argv[3];

if (!title || !content) {
  console.error('使用方法: node scripts/publish_long_text.js <title> <content>');
  process.exit(1);
}

publishLongText(title, content).catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
