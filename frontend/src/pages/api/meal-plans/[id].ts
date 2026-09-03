import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).end();
  }

  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (isSupabase()) {
    await db.from('meal_plans').delete().eq('id', id);
  } else {
    db.prepare('DELETE FROM meal_plans WHERE id = ?').run(id);
  }
  return res.json({ success: true });
}