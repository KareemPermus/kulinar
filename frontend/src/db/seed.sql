INSERT INTO recipes (title, slug, description, category, prep_time, cook_time, servings, image_url)
VALUES ('Classic Spaghetti Bolognese', 'classic-spaghetti-bolognese', 'A rich and hearty Italian meat sauce over pasta.', 'Italian', 15, 45, 4, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, category, prep_time, cook_time, servings, image_url)
VALUES ('Chicken Stir Fry', 'chicken-stir-fry', 'Quick and easy weeknight dinner.', 'Asian', 10, 15, 2, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, category, prep_time, cook_time, servings, image_url)
VALUES ('Caesar Salad', 'caesar-salad', 'Classic Caesar with homemade dressing.', 'Salads', 15, 0, 2, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 'Spaghetti', '400', 'g')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 'Ground Beef', '500', 'g')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 'Tomato Sauce', '2', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 1, 'Cook spaghetti according to package directions.')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 2, 'Brown the ground beef in a large skillet.')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='classic-spaghetti-bolognese'), 3, 'Add tomato sauce, simmer 30 minutes. Serve over pasta.')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='chicken-stir-fry'), 'Chicken Breast', '300', 'g')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='chicken-stir-fry'), 'Mixed Vegetables', '2', 'cups')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='chicken-stir-fry'), 'Soy Sauce', '3', 'tbsp')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='chicken-stir-fry'), 1, 'Slice chicken into strips.')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='chicken-stir-fry'), 2, 'Stir fry chicken until cooked, add vegetables and soy sauce.')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='caesar-salad'), 'Romaine Lettuce', '1', 'head')
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit)
VALUES ((SELECT id FROM recipes WHERE slug='caesar-salad'), 'Parmesan', '50', 'g')
ON CONFLICT DO NOTHING;

INSERT INTO steps (recipe_id, step_order, instruction)
VALUES ((SELECT id FROM recipes WHERE slug='caesar-salad'), 1, 'Chop lettuce and toss with dressing and parmesan.')
ON CONFLICT DO NOTHING;