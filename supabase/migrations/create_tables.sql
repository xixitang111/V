-- 创建 accounts 表
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  auth_file TEXT,
  created_at TEXT NOT NULL
);

-- 创建 personas 表
CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  bound_account_id TEXT,
  FOREIGN KEY (bound_account_id) REFERENCES accounts(id)
);

-- 启用行级安全策略（RLS）
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- 创建允许公开读写的策略（开发环境使用）
CREATE POLICY "Allow public read access" ON accounts
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON accounts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON accounts
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON accounts
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON personas
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON personas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON personas
  FOR UPDATE USING (true);
