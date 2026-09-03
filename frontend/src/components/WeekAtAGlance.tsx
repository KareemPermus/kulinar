import Link from 'next/link';
import { MealPlan } from '@/types';
import styles from '@/styles/Home.module.css';

export default function WeekAtAGlance({ mealPlans }: { mealPlans: MealPlan[] }) {
  if (!mealPlans.length) {
    return (
      <div className={styles.weekEmpty}>
        <p>No meals planned yet.</p>
        <Link href="/mealplanner" className={styles.planBtn}>Start planning</Link>
      </div>
    );
  }

  return (
    <div className={styles.weekGrid}>
      {mealPlans.slice(0, 7).map(mp => (
        <div key={mp.id} className={styles.weekCard}>
          <div className={styles.weekDate}>{mp.date}</div>
          <div className={styles.weekMealType}>{mp.meal_type}</div>
          <div className={styles.weekRecipe}>
            {(mp as any).recipe?.title || `Recipe #${mp.recipe_id}`}
          </div>
        </div>
      ))}
    </div>
  );
}