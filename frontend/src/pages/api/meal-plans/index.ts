import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    if (isSupabase()) {
      const { data: plans, error } = await db.from('meal_plans').select('id, recipe_id, date, meal_type').order('date', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      const recipeIds = [...new Set((plans || []).map((p: any) => p.recipe_id))];
      let recipesMap: Record<number, any> = {};
      if (recipeIds.length) {
        const { data: recipes } = await db.from('recipes').select('id, title, image_url').in('id', recipeIds);
        for (const r of (recipes || [])) recipesMap[r.id] = r;
      }
      return res.json((plans || []).map((p: any) => ({ ...p, recipe: recipesMap[p.recipe_id] || { id: p.recipe_id, title: '', image_url: null } })));
    } else {
      const rows = db.prepare(`
        SELECT mp.id, mp.recipe_id, mp.date, mp.meal_type, r.id as r_id, r.title as r_title, r.image_url as r_image_url
        FROM meal_plans mp LEFT JOIN recipes r ON mp.recipe_id = r.id ORDER BY mp.date
      `).all();
      return res.json(rows.map((r: any) => ({ id: r.id, recipe_id: r.recipe_id, date: r.date, meal_type: r.meal_type, recipe: { id: r.r_id, title: r.r_title, image_url: r.r_image_url } })));
    }
  }

  if (req.method === 'POST') {
    const { recipe_id, date, meal_type } = req.body;
    if (!recipe_id || !date || !meal_type) return res.status(400).json({ error: 'recipe_id, date, meal_type required' });

    if (isSupabase()) {
      const { data, error } = await db.from('meal_plans').insert({ recipe_id, date, meal_type }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    } else {
      const result = db.prepare('INSERT INTO meal_plans (recipe_id, date, meal_type) VALUES (?, ?, ?)').run(recipe_id, date, meal_type);
      return res.status(201).json({ id: Number(result.lastInsertRowid), recipe_id, date, meal_type });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}