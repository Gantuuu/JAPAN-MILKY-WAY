// Script to generate admin user SQL with hashed password
// Uses Web Crypto API (available in Node.js 20+)

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );
    const hashArray = new Uint8Array(derivedBits);
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hashHex}`;
}

async function main() {
    const email = 'gantumaidar@gmail.com';
    const password = 'Mongol247@';
    const name = 'Admin';
    const id = crypto.randomUUID();

    const passwordHash = await hashPassword(password);

    // Output the SQL for creating the users and sessions tables, and inserting admin
    const sql = `-- Create tables
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
('${id}', '${email}', '${name}', 'admin', '${passwordHash}');
`;

    console.log(sql);

    // Also save to file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const outputPath = path.join(__dirname, '..', 'migration_sql', 'seed_admin.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`\nSaved to ${outputPath}`);
}

main();
