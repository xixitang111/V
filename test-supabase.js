// 测试 Supabase 连接
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zknyhkcxssdbgbxqsbtl.supabase.co';
const supabaseAnonKey = 'sb_publishable_sisCntaRCkYkF_nWwIBE2g_Jh4lWQhW';

console.log('测试 Supabase 连接...');
console.log('URL:', supabaseUrl);
console.log('Anon Key 长度:', supabaseAnonKey.length);

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 尝试一个简单的查询
  console.log('\n正在尝试查询 accounts 表...');
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Supabase 查询失败:', error.message);
    console.error('错误详情:', error);
  } else {
    console.log('✅ Supabase 连接成功!');
    console.log('查询结果:', data);
  }
} catch (error) {
  console.error('❌ Supabase 连接异常:', error.message);
}
