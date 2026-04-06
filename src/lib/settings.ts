import { supabase, isSupabaseConfigured } from './supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withTimeout = (p: Promise<any>, ms = 5000): Promise<any> =>
  Promise.race([p, new Promise<any>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/**
 * 从 Supabase settings 表读取一个 key 的值。
 * Supabase 不通时降级到 localStorage。
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('settings').select('value').eq('key', key).single()
      );
      if (!error && data) return data.value as T;
    } catch {}
  }
  // fallback: localStorage
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`setting:${key}`) : null;
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return defaultValue;
}

/**
 * 保存到 Supabase settings 表（upsert）。
 * 同时写入 localStorage 作为缓存。
 */
export async function saveSetting<T>(key: string, value: T): Promise<void> {
  // 写 localStorage（总是写，作为本地缓存）
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`setting:${key}`, JSON.stringify(value));
    }
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await withTimeout(
        supabase.from('settings').upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('saveSetting to Supabase failed, localStorage only:', e);
    }
  }
}
