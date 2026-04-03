import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const accounts = await storage.getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('获取账号失败:', error);
    return NextResponse.json(
      { error: '获取账号失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accounts = await storage.getAccounts();
    const newAccount = {
      id: Date.now().toString(),
      nickname: body.nickname,
      avatar: body.avatar,
      status: 'valid' as const,
      authFile: body.authFile,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedAccounts = [...accounts, newAccount];
    await storage.saveAccounts(updatedAccounts);
    
    return NextResponse.json(newAccount);
  } catch (error) {
    console.error('创建账号失败:', error);
    return NextResponse.json(
      { error: '创建账号失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const accounts = await storage.getAccounts();
    const updatedAccounts = accounts.map(a => 
      a.id === body.id ? { ...a, nickname: body.nickname } : a
    );
    await storage.saveAccounts(updatedAccounts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新账号失败:', error);
    return NextResponse.json(
      { error: '更新账号失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const accounts = await storage.getAccounts();
    const updatedAccounts = accounts.filter(a => a.id !== body.id);
    await storage.saveAccounts(updatedAccounts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除账号失败:', error);
    return NextResponse.json(
      { error: '删除账号失败' },
      { status: 500 }
    );
  }
}
