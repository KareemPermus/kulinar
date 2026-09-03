export interface Recipe {
  id: number;
  title: string;
  description?: string;
  category?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  image_url?: string;
  created_at: string;
}

export interface Ingredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: string;
  unit?: string;
}

export interface Step {
  id: number;
  recipe_id: number;
  order: number;
  instruction: string;
}

export interface MealPlan {
  id: number;
  recipe_id: number;
  date: string;
  meal_type: string;
}

// API response types
export interface RecipeListItem {
  id: number;
  title: string;
  description: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url: string;
  created_at: string;
}

export interface RecipeDetail extends RecipeListItem {
  ingredients: { id: number; name: string; quantity: string; unit: string }[];
  steps: { id: number; instruction: string; order: number }[];
}

export interface RecipeCreateResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  ingredients: { id: number; name: string; quantity: string; unit: string }[];
  steps: { id: number; instruction: string; order: number }[];
}

export interface MealPlanItem {
  id: number;
  recipe_id: number;
  date: string;
  meal_type: string;
  recipe: { id: number; title: string; image_url: string };
}

export interface MealPlanCreateResponse {
  id: number;
  recipe_id: number;
  date: string;
  meal_type: string;
}

export interface DeleteResponse {
  success: boolean;
}