import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    const { search, category } = req.query;
    if (isSupabase()) {
      let query = db.from('recipes').select('*').order('created_at', { ascending: false });
      if (search) query = query.ilike('title', `%${search}%`);
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } else {
      let sql = 'SELECT * FROM recipes';
      const params: any[] = [];
      const clauses: string[] = [];
      if (search) { clauses.push('title LIKE ?'); params.push(`%${search}%`); }
      if (category) { clauses.push('category = ?'); params.push(category); }
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ' ORDER BY created_at DESC';
      const rows = db.prepare(sql).all(...params);
      return res.json(rows);
    }
  }

  if (req.method === 'POST') {
    const { title, description, category, prep_time, cook_time, servings, image_url, ingredients, steps } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    if (isSupabase()) {
      const { data: recipe, error } = await db.from('recipes').insert({ title, description, category, prep_time, cook_time, servings, image_url }).select().single();
      if (error) return res.status(500).json({ error: error.message });

      let ings: any[] = [];
      let stps: any[] = [];
      if (ingredients?.length) {
        const { data } = await db.from('ingredients').insert(ingredients.map((i: any) => ({ recipe_id: recipe.id, name: i.name, quantity: i.quantity, unit: i.unit }))).select();
        ings = data || [];
      }
      if (steps?.length) {
        const { data } = await db.from('steps').insert(steps.map((s: any, idx: number) => ({ recipe_id: recipe.id, step_order: s.order ?? idx + 1, instruction: s.instruction }))).select();
        stps = (data || []).map((s: any) => ({ id: s.id, order: s.step_order, instruction: s.instruction }));
      }
      return res.status(201).json({ ...recipe, ingredients: ings.map((i: any) => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit })), steps: stps });
    } else {
      const result = db.prepare('INSERT INTO recipes (title, description, category, prep_time, cook_time, servings, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || null, category || null, prep_time || null, cook_time || null, servings || null, image_url || null);
      const recipeId = result.lastInsertRowid;
      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);

      const ings: any[] = [];
      if (ingredients?.length) {
        const stmt = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)');
        for (const i of ingredients) {
          const r = stmt.run(recipeId, i.name, i.quantity || null, i.unit || null);
          ings.push({ id: Number(r.lastInsertRowid), name: i.name, quantity: i.quantity || '', unit: i.unit || '' });
        }
      }
      const stps: any[] = [];
      if (steps?.length) {
        const stmt = db.prepare('INSERT INTO steps (recipe_id, step_order, instruction) VALUES (?, ?, ?)');
        for (let idx = 0; idx < steps.length; idx++) {
          const s = steps[idx];
          const r = stmt.run(recipeId, s.order ?? idx + 1, s.instruction);
          stps.push({ id: Number(r.lastInsertRowid), order: s.order ?? idx + 1, instruction: s.instruction });
        }
      }
      return res.status(201).json({ id: Number(recipe.id), title: recipe.title, description: recipe.description, category: recipe.category, ingredients: ings, steps: stps });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}