import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { MealPlan, Recipe } from '@/types';
import { FiPlus, FiTrash2, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import styles from '@/components/mealplanner/MealPlanner.module.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function getWeekDates(offset: number): { label: string; iso: string; dayName: string }[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });
}

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState<{ date: string; meal_type: string } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const week = getWeekDates(weekOffset);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mpRes, rRes] = await Promise.all([
        apiClient.get('/api/meal-plans'),
        apiClient.get('/api/recipes'),
      ]);
      setMealPlans(mpRes.data);
      setRecipes(rRes.data);
    } catch {
      setError('Failed to load meal plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!showAdd || !selectedRecipeId) return;
    try {
      await apiClient.post('/api/meal-plans', {
        recipe_id: selectedRecipeId,
        date: showAdd.date,
        meal_type: showAdd.meal_type,
      });
      setShowAdd(null);
      setSelectedRecipeId(null);
      fetchData();
    } catch { setError('Failed to add meal.'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/meal-plans/${id}`);
      fetchData();
    } catch { setError('Failed to remove meal.'); }
  };

  const getMeal = (date: string, mealType: string) =>
    mealPlans.find((mp) => mp.date === date && mp.meal_type === mealType);

  if (loading) {
    return <div className={styles.loading}>Loading meal planner…</div>;
  }

  if (error && mealPlans.length === 0) {
    return <div className={styles.error}>{error}</div>;
  }

  const weekLabel = `${week[0].label} – ${week[6].label}`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meal Plan</h1>
          <p className={styles.subtitle}>Organize your weekly meals</p>
        </div>
      </div>

      {/* Week nav */}
      <div className={styles.weekNav}>
        <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o - 1)}>
          <FiChevronLeft />
        </button>
        <span className={styles.weekLabel}>
          <FiCalendar className={styles.calIcon} /> {weekLabel}
        </span>
        <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o + 1)}>
          <FiChevronRight />
        </button>
        <button className={styles.todayBtn} onClick={() => setWeekOffset(0)}>Today</button>
      </div>

      {error && <p className={styles.errorInline}>{error}</p>}

      {/* Grid */}
      <div className={styles.grid}>
        {/* Header row */}
        <div className={styles.cornerCell} />
        {week.map((d) => (
          <div key={d.iso} className={styles.dayHeader}>
            <span className={styles.dayName}>{d.dayName}</span>
            <span className={styles.dayDate}>{d.label}</span>
          </div>
        ))}

        {/* Meal rows */}
        {MEAL_TYPES.map((mt) => (
          <>
            <div key={mt} className={styles.mealLabel}>{mt}</div>
            {week.map((d) => {
              const meal = getMeal(d.iso, mt);
              return (
                <div key={`${d.iso}-${mt}`} className={styles.cell}>
                  {meal ? (
                    <div className={styles.mealCard}>
                      <span className={styles.mealTitle}>
                        {(meal as any).recipe?.title || `Recipe #${meal.recipe_id}`}
                      </span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(meal.id)}
                        aria-label="Remove meal"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.addBtn}
                      onClick={() => { setShowAdd({ date: d.iso, meal_type: mt }); setSelectedRecipeId(null); }}
                    >
                      <FiPlus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Add {showAdd.meal_type} — {showAdd.date}
            </h3>
            <select
              className={styles.select}
              value={selectedRecipeId ?? ''}
              onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
            >
              <option value="">Select a recipe…</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowAdd(null)}>Cancel</button>
              <button
                className={styles.confirmBtn}
                disabled={!selectedRecipeId}
                onClick={handleAdd}
              >
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}