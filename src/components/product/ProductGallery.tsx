import styles from './ProductGallery.module.css';

interface Props { images: string[]; alt: string; }

export function ProductGallery({ images, alt }: Props) {
  return (
    <div className={styles.main}>
      <img src={images[0]} alt={alt} />
    </div>
  );
}
