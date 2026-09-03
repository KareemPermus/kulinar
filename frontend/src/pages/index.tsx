import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe, MealPlan } from '@/types';
import HeroSection from '@/components/HeroSection';
import FeaturedRecipes from '@/components/FeaturedRecipes';
import WeekAtAGlance from '@/components/WeekAtAGlance';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Breakfast', 'Dinner', 'Vegetarian', 'Desserts'];

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/recipes'),
      apiClient.get('/api/meal-plans'),
    ])
      .then(([recRes, mpRes]) => {
        setRecipes(recRes.data);
        setMealPlans(mpRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category?.toLowerCase() === activeCategory.toLowerCase());

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading recipes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <HeroSection />

      <div className={styles.pills}>
        {categories.map(c => (
          <button
            key={c}
            className={`${styles.pill} ${activeCategory === c ? styles.pillActive : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Popular this week</h2>
        <Link href="/recipes" className={styles.viewAll}>View all →</Link>
      </div>

      <FeaturedRecipes recipes={filtered.slice(0, 6)} />

      <div className={styles.sectionHeader} style={{ marginTop: '2.5rem' }}>
        <h2 className={styles.sectionTitle}>Week at a Glance</h2>
        <Link href="/mealplanner" className={styles.viewAll}>Plan meals →</Link>
      </div>

      <WeekAtAGlance mealPlans={mealPlans} />

      <footer className={styles.footer}>
        <span>© 2024 Kulinar. Cook with joy.</span>
        <span className={styles.footerLinks}>
          <Link href="/">About</Link>
          <Link href="/">Help</Link>
        </span>
      </footer>
    </div>
  );
}