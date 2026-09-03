import Link from 'next/link';
import { Recipe } from '@/types';
import { FiClock } from 'react-icons/fi';
import styles from '@/styles/Home.module.css';

const placeholderImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
];

export default function FeaturedRecipes({ recipes }: { recipes: Recipe[] }) {
  if (!recipes.length) {
    return <p className={styles.emptyText}>No recipes yet. Add your first one!</p>;
  }

  return (
    <div className={styles.grid}>
      {recipes.map((r, i) => (
        <Link href={`/recipes/${r.id}`} key={r.id} className={styles.card}>
          <div
            className={styles.cardImg}
            style={{ backgroundImage: `url(${r.image_url || placeholderImages[i % placeholderImages.length]})` }}
          />
          <div className={styles.cardBody}>
            <div className={styles.cardMeta}>
              <FiClock size={14} />
              <span>{(r.prep_time || 0) + (r.cook_time || 0)} min</span>
              {r.category && <span>· {r.category}</span>}
            </div>
            <h3 className={styles.cardTitle}>{r.title}</h3>
            {r.description && (
              <p className={styles.cardDesc}>{r.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}