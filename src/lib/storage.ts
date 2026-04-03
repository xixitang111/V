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

const ACCOUNTS_KEY = 'vibe_money_accounts';
const PERSONAS_KEY = 'vibe_money_personas';
const DATA_VERSION_KEY = 'vibe_money_data_version';
const CURRENT_DATA_VERSION = '3';

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

export const storage = {
  async getAccounts(): Promise<Account[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data?.map((item: any) => ({
          id: item.id,
          nickname: item.nickname,
          avatar: item.avatar,
          status: item.status,
          authFile: item.auth_file,
          createdAt: item.created_at
        })) || defaultAccounts;
      } catch (error) {
        console.error('Supabase getAccounts error:', error);
      }
    }
    
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
      if (savedVersion !== CURRENT_DATA_VERSION) {
        localStorage.removeItem(ACCOUNTS_KEY);
        localStorage.removeItem(PERSONAS_KEY);
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
        return defaultAccounts;
      }
      const saved = localStorage.getItem(ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : defaultAccounts;
    }
    return defaultAccounts;
  },

  async saveAccounts(accounts: Account[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        for (const account of accounts) {
          const { error } = await supabase
            .from('accounts')
            .upsert({
              id: account.id,
              nickname: account.nickname,
              avatar: account.avatar,
              status: account.status,
              auth_file: account.authFile,
              created_at: account.createdAt
            });
          
          if (error) throw error;
        }
        return;
      } catch (error) {
        console.error('Supabase saveAccounts error:', error);
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  },

  async getPersonas(): Promise<Persona[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('personas')
          .select('*')
          .order('id');
        
        if (error) throw error;
        return data?.map((item: any) => ({
          id: item.id,
          name: item.name,
          prompt: item.prompt,
          boundAccountId: item.bound_account_id
        })) || defaultPersonas;
      } catch (error) {
        console.error('Supabase getPersonas error:', error);
      }
    }
    
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
      if (savedVersion !== CURRENT_DATA_VERSION) {
        localStorage.removeItem(ACCOUNTS_KEY);
        localStorage.removeItem(PERSONAS_KEY);
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
        return defaultPersonas;
      }
      const saved = localStorage.getItem(PERSONAS_KEY);
      return saved ? JSON.parse(saved) : defaultPersonas;
    }
    return defaultPersonas;
  },

  async savePersonas(personas: Persona[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        for (const persona of personas) {
          const { error } = await supabase
            .from('personas')
            .upsert({
              id: persona.id,
              name: persona.name,
              prompt: persona.prompt,
              bound_account_id: persona.boundAccountId
            });
          
          if (error) throw error;
        }
        return;
      } catch (error) {
        console.error('Supabase savePersonas error:', error);
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
    }
  }
};
