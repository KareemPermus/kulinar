import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      step_order INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get();
  if (count.c === 0) {
    const insertRecipe = db.prepare('INSERT INTO recipes (title, description, category, prep_time, cook_time, servings, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertIngredient = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)');
    const insertStep = db.prepare('INSERT INTO steps (recipe_id, step_order, instruction) VALUES (?, ?, ?)');

    const r1 = insertRecipe.run('Classic Spaghetti Bolognese', 'A rich and hearty Italian meat sauce over pasta.', 'Italian', 15, 45, 4, null);
    insertIngredient.run(r1.lastInsertRowid, 'Spaghetti', '400', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Ground Beef', '500', 'g');
    insertIngredient.run(r1.lastInsertRowid, 'Tomato Sauce', '2', 'cups');
    insertStep.run(r1.lastInsertRowid, 1, 'Cook spaghetti according to package directions.');
    insertStep.run(r1.lastInsertRowid, 2, 'Brown the ground beef in a large skillet.');
    insertStep.run(r1.lastInsertRowid, 3, 'Add tomato sauce, simmer 30 minutes. Serve over pasta.');

    const r2 = insertRecipe.run('Chicken Stir Fry', 'Quick and easy weeknight dinner.', 'Asian', 10, 15, 2, null);
    insertIngredient.run(r2.lastInsertRowid, 'Chicken Breast', '300', 'g');
    insertIngredient.run(r2.lastInsertRowid, 'Mixed Vegetables', '2', 'cups');
    insertIngredient.run(r2.lastInsertRowid, 'Soy Sauce', '3', 'tbsp');
    insertStep.run(r2.lastInsertRowid, 1, 'Slice chicken into strips.');
    insertStep.run(r2.lastInsertRowid, 2, 'Stir fry chicken until cooked, add vegetables and soy sauce.');

    const r3 = insertRecipe.run('Caesar Salad', 'Classic Caesar with homemade dressing.', 'Salads', 15, 0, 2, null);
    insertIngredient.run(r3.lastInsertRowid, 'Romaine Lettuce', '1', 'head');
    insertIngredient.run(r3.lastInsertRowid, 'Parmesan', '50', 'g');
    insertStep.run(r3.lastInsertRowid, 1, 'Chop lettuce and toss with dressing and parmesan.');
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}