import { supabase, isSupabaseConfigured } from './supabase';

export type Account = {
  id: string;
  nickname: string;
  avatar: string;
  status: 'valid' | 'expired';
  authFile: string;
  createdAt: string;
};

export type Persona = {
  id: string;
  name: string;
  prompt: string;
  boundAccountId: string | null;
};

const defaultAccounts: Account[] = [
  {
    id: '1',
    nickname: 'Vibe西希',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VibeXixi',
    status: 'valid',
    authFile: 'xhs_auth_1710000000000.json',
    createdAt: '2026-03-01'
  },
  {
    id: '2',
    nickname: '职场搞钱日记',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    status: 'valid',
    authFile: 'xhs_auth_1710000000001.json',
    createdAt: '2026-03-02'
  },
  {
    id: '3',
    nickname: '副业达人小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    status: 'valid',
    authFile: 'xhs_auth_1710000000002.json',
    createdAt: '2026-03-03'
  }
];

const defaultPersonas: Persona[] = [
  {
    id: '1',
    name: 'Vibe西希的人设',
    prompt: '你是Vibe西希，一个充满活力的生活方式博主。你的语气要亲切自然，像和闺蜜聊天一样。善于分享真实的生活感悟和实用的生活技巧。口头禅包括"姐妹们"、"真的绝了"、"一定要试试"。风格积极向上，充满正能量。',
    boundAccountId: '1'
  },
  {
    id: '2',
    name: '职场搞钱日记的人设',
    prompt: '你是一个千万粉丝的AI观点分享博主。你的语气要专业但不生硬，善于用通俗易懂的语言解释复杂的AI概念。口头禅包括"相信我"、"听我的"、"这个真的有用"。绝对不能提及任何政治敏感话题。',
    boundAccountId: '2'
  },
  {
    id: '3',
    name: '副业达人小王的人设',
    prompt: '你是一个技术小白出身的搞钱博主。你的语气要接地气，像和朋友聊天一样。善于用自己的亲身经历举例，分享真实的搞钱经验。口头禅包括"我跟你说"、"真的假的"、"亲测有效"。绝对不能显得太专业，要保持小白的亲切感。',
    boundAccountId: '3'
  }
];

// ── Supabase 超时保护 ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withTimeout = (p: Promise<any>, ms = 5000): Promise<any> =>
  Promise.race([p, new Promise<any>((_, rej) => setTimeout(() => rej(new Error('Supabase timeout')), ms))]);

// ── 文件系统 fallback（服务端 API 路由用，浏览器无 localStorage）─────────────
let _fsAccounts: Account[] | null = null;
let _fsPersonas: Persona[] | null = null;

function fsGetAccounts(): Account[] {
  if (_fsAccounts !== null) return _fsAccounts;
  try {
    const fs = require('fs');
    const path = require('path');
    const p = path.join(process.cwd(), 'data', 'accounts.json');
    if (fs.existsSync(p)) {
      _fsAccounts = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return _fsAccounts!;
    }
  } catch {}
  return defaultAccounts;
}

function fsSaveAccounts(accounts: Account[]) {
  _fsAccounts = accounts;
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'accounts.json'), JSON.stringify(accounts, null, 2));
  } catch {}
}

function fsGetPersonas(): Persona[] {
  if (_fsPersonas !== null) return _fsPersonas;
  try {
    const fs = require('fs');
    const path = require('path');
    const p = path.join(process.cwd(), 'data', 'personas.json');
    if (fs.existsSync(p)) {
      _fsPersonas = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return _fsPersonas!;
    }
  } catch {}
  return defaultPersonas;
}

function fsSavePersonas(personas: Persona[]) {
  _fsPersonas = personas;
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'personas.json'), JSON.stringify(personas, null, 2));
  } catch {}
}

// ── 浏览器侧 localStorage（客户端组件直接读，不走 API）───────────────────────
const LS_ACCOUNTS = 'vibe_money_accounts';
const LS_PERSONAS = 'vibe_money_personas';

function lsGet<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function lsSet<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Public API ────────────────────────────────────────────────────────────────

export const storage = {
  async getAccounts(): Promise<Account[]> {
    // 1) Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('accounts').select('*').order('created_at', { ascending: false })
        );
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            nickname: item.nickname,
            avatar: item.avatar,
            status: item.status,
            authFile: item.auth_file,
            createdAt: item.created_at
          }));
        }
      } catch (e) {
        console.warn('Supabase getAccounts error:', e);
      }
    }
    // 2) browser localStorage
    const ls = lsGet<Account>(LS_ACCOUNTS);
    if (ls && ls.length > 0) return ls;
    // 3) file system (server-side)
    const fs = fsGetAccounts();
    return fs.length > 0 ? fs : defaultAccounts;
  },

  async saveAccounts(accounts: Account[]): Promise<void> {
    // browser localStorage
    lsSet(LS_ACCOUNTS, accounts);
    // file system (server-side)
    fsSaveAccounts(accounts);
    // Supabase
    if (isSupabaseConfigured()) {
      try {
        for (const account of accounts) {
          await withTimeout(
            supabase.from('accounts').upsert({
              id: account.id,
              nickname: account.nickname,
              avatar: account.avatar,
              status: account.status,
              auth_file: account.authFile,
              created_at: account.createdAt,
            })
          );
        }
      } catch (e) {
        console.warn('Supabase saveAccounts error:', e);
      }
    }
  },

  async getPersonas(): Promise<Persona[]> {
    // 1) Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('personas').select('*').order('id')
        );
        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            prompt: item.prompt,
            boundAccountId: item.bound_account_id
          }));
        }
      } catch (e) {
        console.warn('Supabase getPersonas error:', e);
      }
    }
    // 2) browser localStorage
    const ls = lsGet<Persona>(LS_PERSONAS);
    if (ls && ls.length > 0) return ls;
    // 3) file system (server-side)
    const fs = fsGetPersonas();
    return fs.length > 0 ? fs : defaultPersonas;
  },

  async savePersonas(personas: Persona[]): Promise<void> {
    // browser localStorage
    lsSet(LS_PERSONAS, personas);
    // file system (server-side)
    fsSavePersonas(personas);
    // Supabase
    if (isSupabaseConfigured()) {
      try {
        for (const persona of personas) {
          await withTimeout(
            supabase.from('personas').upsert({
              id: persona.id,
              name: persona.name,
              prompt: persona.prompt,
              bound_account_id: persona.boundAccountId,
            })
          );
        }
      } catch (e) {
        console.warn('Supabase savePersonas error:', e);
      }
    }
  }
};
