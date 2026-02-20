import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

// GET /api/faqs
app.get('/', async (c) => {
    const db = c.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();
        return c.json(result.results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// POST /api/faqs
app.post('/', async (c) => {
    const data = await c.req.json();
    const db = c.env.DB;
    const id = crypto.randomUUID();
    try {
        await db.prepare(
            "INSERT INTO faqs (id, question, answer, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(id, data.question, data.answer, data.category || 'general', data.sort_order || 0, data.is_active ?? 1).run();
        return c.json({ id, ...data });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/faqs/:id
app.put('/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const db = c.env.DB;
    try {
        await db.prepare(
            "UPDATE faqs SET question=?, answer=?, category=?, sort_order=?, is_active=? WHERE id=?"
        ).bind(data.question, data.answer, data.category || 'general', data.sort_order || 0, data.is_active ?? 1, id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// DELETE /api/faqs/:id
app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;
    try {
        await db.prepare('DELETE FROM faqs WHERE id=?').bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/faqs - Bulk save (replace all)
app.put('/bulk', async (c) => {
    const { faqs } = await c.req.json();
    const db = c.env.DB;
    try {
        const stmts: D1PreparedStatement[] = [db.prepare('DELETE FROM faqs')];
        for (let i = 0; i < faqs.length; i++) {
            const f = faqs[i];
            stmts.push(db.prepare(
                "INSERT INTO faqs (id, question, answer, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(f.id || crypto.randomUUID(), f.question, f.answer, f.category || 'general', i, f.is_active ?? 1));
        }
        await db.batch(stmts);
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
