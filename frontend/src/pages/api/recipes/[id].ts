import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    if (isSupabase()) {
      const { data: recipe, error } = await db.from('recipes').select('*').eq('id', id).single();
      if (error || !recipe) return res.status(404).json({ error: 'Not found' });
      const { data: ingredients } = await db.from('ingredients').select('id, name, quantity, unit').eq('recipe_id', id);
      const { data: steps } = await db.from('steps').select('id, step_order, instruction').eq('recipe_id', id).order('step_order', { ascending: true });
      return res.json({ ...recipe, ingredients: ingredients || [], steps: (steps || []).map((s: any) => ({ id: s.id, order: s.step_order, instruction: s.instruction })) });
    } else {
      const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      if (!recipe) return res.status(404).json({ error: 'Not found' });
      const ingredients = db.prepare('SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = ?').all(id);
      const steps = db.prepare('SELECT id, step_order as "order", instruction FROM steps WHERE recipe_id = ? ORDER BY step_order').all(id);
      return res.json({ ...recipe, ingredients, steps });
    }
  }

  if (req.method === 'PUT') {
    const { title, description, category, prep_time, cook_time, servings, image_url } = req.body;
    if (isSupabase()) {
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (prep_time !== undefined) updates.prep_time = prep_time;
      if (cook_time !== undefined) updates.cook_time = cook_time;
      if (servings !== undefined) updates.servings = servings;
      if (image_url !== undefined) updates.image_url = image_url;
      const { data, error } = await db.from('recipes').update(updates).eq('id', id).select('id, title, description, category').single();
      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Not found' });
      return res.json(data);
    } else {
      const existing = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Not found' });
      db.prepare('UPDATE recipes SET title=?, description=?, category=?, prep_time=?, cook_time=?, servings=?, image_url=? WHERE id=?').run(
        title ?? existing.title, description ?? existing.description, category ?? existing.category,
        prep_time ?? existing.prep_time, cook_time ?? existing.cook_time, servings ?? existing.servings,
        image_url ?? existing.image_url, id
      );
      const updated = db.prepare('SELECT id, title, description, category FROM recipes WHERE id = ?').get(id);
      return res.json(updated);
    }
  }

  if (req.method === 'DELETE') {
    if (isSupabase()) {
      await db.from('steps').delete().eq('recipe_id', id);
      await db.from('ingredients').delete().eq('recipe_id', id);
      await db.from('meal_plans').delete().eq('recipe_id', id);
      await db.from('recipes').delete().eq('id', id);
    } else {
      db.prepare('DELETE FROM steps WHERE recipe_id = ?').run(id);
      db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(id);
      db.prepare('DELETE FROM meal_plans WHERE recipe_id = ?').run(id);
      db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    }
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
}