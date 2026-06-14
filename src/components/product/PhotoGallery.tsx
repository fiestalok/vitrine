import { useState, useEffect, useCallback } from 'react';
import styles from './PhotoGallery.module.css';

interface Props { images: string[]; alt: string; }

export function PhotoGallery({ images, alt }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = useCallback((i: number) => (i - 1 + images.length) % images.length, [images.length]);
  const next = useCallback((i: number) => (i + 1) % images.length, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     setLightbox(null);
      if (e.key === 'ArrowLeft')  setLightbox((i) => prev(i!));
      if (e.key === 'ArrowRight') setLightbox((i) => next(i!));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  const sorted = [...images].sort();
  const preview = sorted.slice(0, 6);

  if (sorted.length === 0) return null;

  return (
    <>
      <div className={styles.grid}>
        {preview.map((src, i) => (
          <button key={src} className={styles.item}
            onClick={() => setLightbox(sorted.indexOf(src))}>
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" />
            <span className={styles.overlay}>⤢</span>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className={styles.lb} onClick={() => setLightbox(null)}>
          <button className={styles.close} onClick={() => setLightbox(null)}>✕</button>
          {images.length > 1 && (
            <>
              <button className={`${styles.nav} ${styles.navPrev}`}
                onClick={(e) => { e.stopPropagation(); setLightbox(prev(lightbox)); }}>‹</button>
              <button className={`${styles.nav} ${styles.navNext}`}
                onClick={(e) => { e.stopPropagation(); setLightbox(next(lightbox)); }}>›</button>
            </>
          )}
          <img className={styles.lbImg} src={sorted[lightbox]} alt={alt}
            onClick={(e) => e.stopPropagation()} />
          <div className={styles.lbThumbs} onClick={(e) => e.stopPropagation()}>
            {sorted.map((src, i) => (
              <button key={src}
                className={`${styles.lbThumb} ${i === lightbox ? styles.lbActive : ''}`}
                onClick={() => setLightbox(i)}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
