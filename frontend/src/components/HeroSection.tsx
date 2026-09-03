import styles from '@/styles/Home.module.css';

export default function HeroSection() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <span className={styles.heroBadge}>Weekend Feature</span>
        <h1 className={styles.heroTitle}>Slow-Braised Short Ribs with Polenta</h1>
        <p className={styles.heroSub}>A cozy, spoon-tender dish worth the wait · 3h 20m</p>
      </div>
    </div>
  );
}