import fs from 'fs';
import path from 'path';

const queuePath = path.join(process.cwd(), 'data', 'publish_queue.json');

type QueueItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'publishing' | 'published' | 'failed';
};

export function ensureQueueFile() {
  const dataDir = path.dirname(queuePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(queuePath)) {
    fs.writeFileSync(queuePath, JSON.stringify([], null, 2));
  }
}

export function getQueue(): QueueItem[] {
  ensureQueueFile();
  const data = fs.readFileSync(queuePath, 'utf-8');
  return JSON.parse(data);
}

export function addToQueue(title: string, content: string): QueueItem {
  ensureQueueFile();
  const queue = getQueue();
  const newItem: QueueItem = {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  queue.push(newItem);
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  return newItem;
}

export function removeFromQueue(id: string): QueueItem | null {
  ensureQueueFile();
  const queue = getQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index === -1) return null;
  const removed = queue.splice(index, 1)[0];
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  return removed;
}

export function updateQueueItemStatus(id: string, status: QueueItem['status']): QueueItem | null {
  ensureQueueFile();
  const queue = getQueue();
  const item = queue.find(item => item.id === id);
  if (!item) return null;
  item.status = status;
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  return item;
}

export function getPendingCount(): number {
  const queue = getQueue();
  return queue.filter(item => item.status === 'pending').length;
}

export function getNextPendingItem(): QueueItem | null {
  const queue = getQueue();
  return queue.find(item => item.status === 'pending') || null;
}
