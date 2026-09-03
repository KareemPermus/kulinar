import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe, MealPlan } from '@/types';
import { FiClock, FiStar, FiArrowRight, FiPlus } from 'react-icons/fi';
import styles from '@/components/HomePage.module.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80';
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
];

const CATEGORIES = ['All', 'Breakfast', 'Dinner', 'Vegetarian', 'Under 30 min', 'Desserts'];

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/recipes').then(r => r.data),
      apiClient.get('/api/meal-plans').then(r => r.data),
    ])
      .then(([r, m]) => { setRecipes(r); setMealPlans(m); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category?.toLowerCase().includes(activeCategory.toLowerCase()));

  const featuredRecipe = recipes[0];

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero} style={{ backgroundImage: `url(${featuredRecipe?.image_url || HERO_IMAGE})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Weekend Feature</span>
          {featuredRecipe ? (
            <>
              <h1 className={styles.heroTitle}>{featuredRecipe.title}</h1>
              <p className={styles.heroSub}>
                {featuredRecipe.description || 'A delicious recipe worth trying'}
                {featuredRecipe.cook_time ? ` · ${featuredRecipe.prep_time || 0 + featuredRecipe.cook_time}m` : ''}
              </p>
            </>
          ) : (
            <>
              <h1 className={styles.heroTitle}>Discover New Recipes</h1>
              <p className={styles.heroSub}>Browse and plan your meals for the week</p>
            </>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className={styles.pills}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : styles.pillInactive}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Popular this week</h2>
        <Link href="/recipes" className={styles.viewAll}>
          View all <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No recipes found. <Link href="/recipes" className={styles.linkAccent}>Add your first recipe</Link></p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((recipe, i) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className={styles.card}>
              <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${recipe.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]})` }}
              />
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <FiClock size={14} />
                  <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                  {recipe.category && <span>· {recipe.category}</span>}
                </div>
                <h3 className={styles.cardTitle}>{recipe.title}</h3>
                <div className={styles.cardRating}>
                  <FiStar size={14} />
                  <span>4.8</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Week at a glance */}
      {mealPlans.length > 0 && (
        <>
          <div className={styles.sectionHeader} style={{ marginTop: '2.5rem' }}>
            <h2 className={styles.sectionTitle}>This week&apos;s meal plan</h2>
            <Link href="/mealplanner" className={styles.viewAll}>
              Plan meals <FiArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.mealGrid}>
            {mealPlans.slice(0, 4).map(mp => (
              <div key={mp.id} className={styles.mealCard}>
                <div className={styles.mealType}>{mp.meal_type}</div>
                <div className={styles.mealDate}>{mp.date}</div>
                <div className={styles.mealRecipe}>{(mp as any).recipe?.title || `Recipe #${mp.recipe_id}`}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className={styles.footer}>
        <span>© 2024 Kulinar. Cook with joy.</span>
      </footer>
    </div>
  );
}