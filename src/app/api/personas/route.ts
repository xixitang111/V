import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const personas = await storage.getPersonas();
    return NextResponse.json(personas);
  } catch (error) {
    console.error('获取人设失败:', error);
    return NextResponse.json(
      { error: '获取人设失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const personas = await storage.getPersonas();
    const updated = personas.filter(p => p.id !== id);
    await storage.savePersonas(updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除人设失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const personas = await storage.getPersonas();
    const exists = personas.some(p => p.id === body.id);
    const updatedPersonas = exists
      ? personas.map(p => p.id === body.id ? { ...p, ...body } : p)
      : [...personas, body]; // 不存在时插入新人设
    await storage.savePersonas(updatedPersonas);

    return NextResponse.json(updatedPersonas.find(p => p.id === body.id));
  } catch (error) {
    console.error('更新人设失败:', error);
    return NextResponse.json(
      { error: '更新人设失败' },
      { status: 500 }
    );
  }
}
