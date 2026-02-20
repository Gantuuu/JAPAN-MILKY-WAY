import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

// GET /api/settings
app.get('/', async (c) => {
    const db = c.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM settings').all();
        const settings: Record<string, string> = {};
        for (const row of result.results as any[]) {
            settings[row.key] = row.value;
        }
        return c.json(settings);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/settings
app.put('/', async (c) => {
    const data = await c.req.json();
    const db = c.env.DB;
    try {
        const stmts: D1PreparedStatement[] = [];
        for (const [key, value] of Object.entries(data)) {
            stmts.push(db.prepare(
                "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
            ).bind(key, String(value)));
        }
        if (stmts.length > 0) await db.batch(stmts);
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
