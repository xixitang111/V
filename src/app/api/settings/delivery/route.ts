import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'delivery_settings.json');

interface Product {
  id: number;
  name: string;
  sellingPoints: string;
  storeLink: string;
}

interface DeliverySettings {
  products: Product[];
  autoDmReception: boolean;
  defaultWelcomeMessage: string;
  aiSalesPrompt: string;
  postPurchaseCare: boolean;
  reviewPrompt: string;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  products: [
    {
      id: 1,
      name: '自媒体起号SOP手册',
      sellingPoints: '包含完整的30天起号计划、爆款标题公式、内容选题库，帮助新手0基础快速上手小红书',
      storeLink: '🔑 口令: 起号手册'
    },
    {
      id: 2,
      name: '副业搞钱实操课',
      sellingPoints: '10个可复制的副业案例、从0到1的落地步骤、避坑指南，让你少走弯路',
      storeLink: '🔗 https://shop.xiaohongshu.com/xxx'
    }
  ],
  autoDmReception: true,
  defaultWelcomeMessage: '哈喽！看主页店铺直接拍，全自动发货~ 遇到问题随时留言',
  aiSalesPrompt: '当用户在私信询问价格或犹豫时，强调这份资料能帮他们省去一周的摸索时间，并再次发送商品口令',
  postPurchaseCare: true,
  reviewPrompt: '资料收到啦，觉得有帮助的话麻烦在店铺给个五星好评哦，截图发我再送你一份隐藏资料！'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSettings(): DeliverySettings {
  ensureDataDir();
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read settings file:', error);
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: DeliverySettings) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const settings = loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    saveSettings(settings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
