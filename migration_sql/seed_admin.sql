-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL
);

-- Insert admin user
INSERT OR REPLACE INTO users (id, email, name, role, password_hash) VALUES
('56117dd8-ed59-43da-862f-8ef4c2726aa9', 'gantumaidar@gmail.com', 'Admin', 'admin', '28546834df2b249812883d324084fad9:22d36a2d7088cbd1af0f4efac65282444f079fcc14781af664a800ee7a3c8fa2');
