import { supabase, isSupabaseConfigured } from './supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withTimeout = (p: Promise<any>, ms = 5000): Promise<any> =>
  Promise.race([p, new Promise<any>((_, rej) => setTimeout(() => rej(new Error('Supabase timeout')), ms))]);

export type QueueStatus =
  | 'awaiting_review'  // AI 生成完成，等待人工审核
  | 'approved'         // 人工批准，等待自动化发布
  | 'publishing'       // 正在发布中
  | 'published'        // 已发布
  | 'rejected'         // 人工拒绝
  | 'failed';          // 发布失败

export type QueueItem = {
  id: string;
  title: string;
  content: string;          // 长文正文（article_content）
  postDescription: string;  // 外发文案（标题 + 摘要 + Tags）
  persona: string;          // 创作人设名称
  topic: string;            // 选题标题
  accountId?: string;       // 对应的小红书账号 ID（用于找 authFile 真实发布）
  createdAt: string;
  updatedAt?: string;
  status: QueueStatus;
};

// Supabase row → QueueItem
function fromRow(row: any): QueueItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    postDescription: row.post_description || '',
    persona: row.persona || '',
    topic: row.topic || '',
    accountId: row.account_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    status: row.status as QueueStatus,
  };
}

// QueueItem fields → Supabase columns
function toRow(item: Partial<QueueItem> & { id?: string }) {
  const row: any = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.title !== undefined) row.title = item.title;
  if (item.content !== undefined) row.content = item.content;
  if (item.postDescription !== undefined) row.post_description = item.postDescription;
  if (item.persona !== undefined) row.persona = item.persona;
  if (item.topic !== undefined) row.topic = item.topic;
  if (item.accountId !== undefined) row.account_id = item.accountId;
  if (item.status !== undefined) row.status = item.status;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  if (item.updatedAt !== undefined) row.updated_at = item.updatedAt;
  return row;
}

// ──────────────────────────────────────────────────────────────────────────────
// File-system fallback (local dev without Supabase)
// ──────────────────────────────────────────────────────────────────────────────
let _fileQueue: QueueItem[] | null = null;

function fsGetQueue(): QueueItem[] {
  if (_fileQueue) return _fileQueue;
  try {
    const fs = require('fs');
    const path = require('path');
    const queuePath = path.join(process.cwd(), 'data', 'publish_queue.json');
    if (fs.existsSync(queuePath)) {
      _fileQueue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
    }
  } catch {}
  if (!_fileQueue) _fileQueue = [];
  return _fileQueue;
}

function fsSaveQueue(queue: QueueItem[]) {
  _fileQueue = queue;
  try {
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'publish_queue.json'), JSON.stringify(queue, null, 2));
  } catch {}
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

export async function getQueue(): Promise<QueueItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('publish_queue').select('*').order('created_at', { ascending: false })
      );
      if (error) throw error;
      return (data || []).map(fromRow);
    } catch {
      return fsGetQueue();
    }
  }
  return fsGetQueue();
}

export async function addToQueue(params: {
  title: string;
  content: string;
  postDescription?: string;
  persona?: string;
  topic?: string;
  accountId?: string;
}): Promise<QueueItem> {
  const newItem: QueueItem = {
    id: Date.now().toString(),
    title: params.title,
    content: params.content,
    postDescription: params.postDescription || '',
    persona: params.persona || '',
    accountId: params.accountId || undefined,
    topic: params.topic || '',
    createdAt: new Date().toISOString(),
    status: 'awaiting_review',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('publish_queue').insert(toRow(newItem)).select().single()
      );
      if (error) throw error;
      return fromRow(data);
    } catch {
      // fallthrough to file system
    }
  }

  const queue = fsGetQueue();
  queue.unshift(newItem);
  fsSaveQueue(queue);
  return newItem;
}

export async function updateQueueItem(
  id: string,
  updates: Partial<Omit<QueueItem, 'id' | 'createdAt'>>
): Promise<QueueItem | null> {
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const row = toRow({ ...updates, updatedAt });
      const { data, error } = await withTimeout(
        supabase.from('publish_queue').update(row).eq('id', id).select().single()
      );
      if (error) return null;
      return fromRow(data);
    } catch {
      // fallthrough to file system
    }
  }

  const queue = fsGetQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index === -1) return null;
  queue[index] = { ...queue[index], ...updates, updatedAt };
  fsSaveQueue(queue);
  return queue[index];
}

export async function removeFromQueue(id: string): Promise<QueueItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('publish_queue').delete().eq('id', id).select().single()
      );
      if (error) return null;
      return fromRow(data);
    } catch {
      // fallthrough to file system
    }
  }

  const queue = fsGetQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index === -1) return null;
  const removed = queue.splice(index, 1)[0];
  fsSaveQueue(queue);
  return removed;
}

export async function getAwaitingReviewCount(): Promise<number> {
  if (isSupabaseConfigured()) {
    try {
      const { count, error } = await withTimeout(
        supabase.from('publish_queue').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_review')
      );
      if (error) return 0;
      return count || 0;
    } catch {
      // fallthrough to file system
    }
  }
  return fsGetQueue().filter(item => item.status === 'awaiting_review').length;
}

export async function getNextApprovedItem(): Promise<QueueItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('publish_queue').select('*').eq('status', 'approved').order('created_at', { ascending: true }).limit(1).single()
      );
      if (error) return null;
      return fromRow(data);
    } catch {
      // fallthrough to file system
    }
  }
  return fsGetQueue().find(item => item.status === 'approved') || null;
}
