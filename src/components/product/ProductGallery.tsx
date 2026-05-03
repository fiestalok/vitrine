import { useState } from 'react';
import styles from './ProductGallery.module.css';

interface Props { images: string[]; alt: string; }

export function ProductGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);
  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <img src={images[current]} alt={alt} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((src, i) => (
            <button
              key={src}
              className={`${styles.thumb} ${i === current ? styles.active : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Image ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
