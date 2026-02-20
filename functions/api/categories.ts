import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

// GET /api/categories
app.get('/', async (c) => {
    const db = c.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
        return c.json(result.results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// POST /api/categories
app.post('/', async (c) => {
    const data = await c.req.json();
    const db = c.env.DB;
    const id = data.id || crypto.randomUUID();
    try {
        await db.prepare(
            "INSERT INTO categories (id, name, description, icon, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, data.name, data.description || '', data.icon || '', data.image || '', data.sort_order || 0, data.is_active ?? 1).run();
        return c.json({ id, ...data });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/categories/:id
app.put('/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const db = c.env.DB;
    try {
        await db.prepare(
            "UPDATE categories SET name=?, description=?, icon=?, image=?, sort_order=?, is_active=? WHERE id=?"
        ).bind(data.name, data.description || '', data.icon || '', data.image || '', data.sort_order || 0, data.is_active ?? 1, id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// DELETE /api/categories/:id
app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;
    try {
        await db.prepare('DELETE FROM categories WHERE id=?').bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/categories/bulk - Replace all categories
app.put('/bulk', async (c) => {
    const { categories } = await c.req.json();
    const db = c.env.DB;
    try {
        const stmts: D1PreparedStatement[] = [db.prepare('DELETE FROM categories')];
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            stmts.push(db.prepare(
                "INSERT INTO categories (id, name, description, icon, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(cat.id || crypto.randomUUID(), cat.name, cat.description || '', cat.icon || '', cat.image || '', i, cat.is_active ?? 1));
        }
        await db.batch(stmts);
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;
