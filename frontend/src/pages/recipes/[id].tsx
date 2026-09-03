import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Recipe, Ingredient, Step } from '@/types';
import Link from 'next/link';
import { FiClock, FiUsers, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import styles from '@/components/RecipeDetail.module.css';

interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  steps: Step[];
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/api/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this recipe?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/recipes/${id}`);
      router.push('/recipes');
    } catch {
      setError('Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <div className={styles.center}>Loading…</div>;
  if (error || !recipe) return <div className={styles.center}>{error || 'Not found'}</div>;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <Link href="/recipes" className={styles.backLink}>
          <FiArrowLeft /> Back to Recipes
        </Link>
        <button onClick={handleDelete} disabled={deleting} className={styles.deleteBtn}>
          <FiTrash2 /> {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {/* Hero */}
      <div className={styles.hero} style={{ backgroundImage: recipe.image_url ? `url(${recipe.image_url})` : undefined }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {recipe.category && <span className={styles.badge}>{recipe.category}</span>}
          <h1 className={styles.title}>{recipe.title}</h1>
          {recipe.description && <p className={styles.desc}>{recipe.description}</p>}
        </div>
      </div>

      {/* Meta */}
      <div className={styles.metaRow}>
        {recipe.prep_time != null && (
          <div className={styles.metaItem}><FiClock /> Prep: {recipe.prep_time}m</div>
        )}
        {recipe.cook_time != null && (
          <div className={styles.metaItem}><FiClock /> Cook: {recipe.cook_time}m</div>
        )}
        {totalTime > 0 && (
          <div className={styles.metaItem}><FiClock /> Total: {totalTime}m</div>
        )}
        {recipe.servings != null && (
          <div className={styles.metaItem}><FiUsers /> {recipe.servings} servings</div>
        )}
      </div>

      <div className={styles.grid}>
        {/* Ingredients */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          {recipe.ingredients?.length ? (
            <ul className={styles.ingredientList}>
              {recipe.ingredients.map(ing => (
                <li key={ing.id} className={styles.ingredientItem}>
                  <span className={styles.dot} />
                  {ing.quantity && <span className={styles.qty}>{ing.quantity} {ing.unit}</span>}
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          ) : <p className={styles.empty}>No ingredients listed.</p>}
        </section>

        {/* Steps */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Instructions</h2>
          {recipe.steps?.length ? (
            <ol className={styles.stepList}>
              {recipe.steps.sort((a, b) => a.order - b.order).map(step => (
                <li key={step.id} className={styles.stepItem}>
                  <span className={styles.stepNum}>{step.order}</span>
                  <p>{step.instruction}</p>
                </li>
              ))}
            </ol>
          ) : <p className={styles.empty}>No steps listed.</p>}
        </section>
      </div>
    </div>
  );
}