import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe } from '@/types';
import { FiSearch, FiClock, FiPlus, FiSliders, FiX } from 'react-icons/fi';
import styles from '@/components/recipes/Recipes.module.css';

const CATEGORIES = ['All', 'Breakfast', 'Dinner', 'Vegetarian', 'Desserts', 'Lunch'];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    apiClient.get('/api/recipes')
      .then(res => setRecipes(res.data))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = recipes;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.title.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q));
    }
    if (category !== 'All') {
      r = r.filter(x => x.category?.toLowerCase() === category.toLowerCase());
    }
    return r;
  }, [recipes, search, category]);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            placeholder="Search recipes, ingredients…"
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.filterBtn} onClick={() => setFilterOpen(true)}>
          <FiSliders size={16} /> Filters
        </button>
        <Link href="/recipes/new" className={styles.newBtn}>
          <FiPlus size={16} /> New Recipe
        </Link>
      </div>

      <div className={styles.content}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Weekend Feature</span>
            <h1 className={styles.heroTitle}>Slow-Braised Short Ribs with Polenta</h1>
            <p className={styles.heroSub}>A cozy, spoon-tender dish worth the wait · 3h 20m</p>
          </div>
        </div>

        {/* Category pills */}
        <div className={styles.pills}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.pill} ${category === c ? styles.pillActive : styles.pillInactive}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular this week</h2>
        </div>

        {loading && <p className={styles.status}>Loading recipes…</p>}
        {error && <p className={styles.statusError}>{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className={styles.status}>No recipes found.</p>}

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((recipe, i) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className={styles.card}>
              <div
                className={styles.cardImg}
                style={{ backgroundImage: `url(${recipe.image_url || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]})` }}
              />
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <FiClock size={14} />
                  {recipe.prep_time || recipe.cook_time
                    ? `${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min`
                    : 'N/A'}
                  {recipe.category && ` · ${recipe.category}`}
                </div>
                <h3 className={styles.cardTitle}>{recipe.title}</h3>
                {recipe.description && (
                  <p className={styles.cardDesc}>{recipe.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Filter drawer */}
      {filterOpen && <div className={styles.overlay} onClick={() => setFilterOpen(false)} />}
      <div className={`${styles.drawer} ${filterOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>Filters</h3>
          <button onClick={() => setFilterOpen(false)} className={styles.drawerClose}><FiX size={20} /></button>
        </div>
        <div className={styles.drawerBody}>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Category</div>
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <label key={c} className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={category === c}
                  onChange={() => setCategory(category === c ? 'All' : c)}
                  className={styles.checkbox}
                />
                {c}
              </label>
            ))}
          </div>
          <button className={styles.applyBtn} onClick={() => setFilterOpen(false)}>Apply filters</button>
        </div>
      </div>
    </div>
  );
}