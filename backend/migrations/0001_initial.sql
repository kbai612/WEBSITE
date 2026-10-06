PRAGMA foreign_keys = ON;

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  pending_request_id TEXT,
  expires_at INTEGER NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER
);
CREATE INDEX messages_conversation_order ON messages(conversation_id, id DESC);
CREATE INDEX conversations_expiry ON conversations(expires_at);

CREATE TABLE requests (
  request_id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  owner_token TEXT NOT NULL,
  conversation_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'complete', 'failed')),
  response_json TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX requests_expiry ON requests(expires_at);

CREATE TABLE daily_usage (
  day TEXT PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0 CHECK (calls >= 0)
);
CREATE TABLE call_reservations (
  request_id TEXT PRIMARY KEY REFERENCES requests(request_id) ON DELETE CASCADE,
  day TEXT NOT NULL REFERENCES daily_usage(day),
  reserved_at INTEGER NOT NULL
);
CREATE INDEX call_reservations_day ON call_reservations(day);
