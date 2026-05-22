CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) <= 100),
  description TEXT NOT NULL CHECK(length(description) <= 2000),
  url TEXT NOT NULL,
  icon_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'unpublished')),
  badge_payment TEXT NOT NULL DEFAULT 'free' CHECK(badge_payment IN ('free', 'freemium', 'paid')),
  badge_china_access TEXT NOT NULL DEFAULT 'direct' CHECK(badge_china_access IN ('direct', 'unstable', 'vpn_required')),
  badge_open_source TEXT NOT NULL DEFAULT 'open' CHECK(badge_open_source IN ('open', 'partial', 'closed')),
  badge_maintenance TEXT NOT NULL DEFAULT 'active' CHECK(badge_maintenance IN ('active', 'maintained', 'deprecated')),
  star_count INTEGER NOT NULL DEFAULT 0,
  oppose_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  last_snapshot_version INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  data TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK(length(content) >= 1 AND length(content) <= 500),
  fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('star', 'oppose')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tool_id, fingerprint, type)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at);
CREATE INDEX IF NOT EXISTS idx_tools_star_count ON tools(star_count);
CREATE INDEX IF NOT EXISTS idx_comments_tool_id ON comments(tool_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_tool_fingerprint ON interactions(tool_id, fingerprint);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_snapshots_version ON snapshots(version);
