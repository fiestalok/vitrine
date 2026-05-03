import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  background?: 'light' | 'dark' | 'accent';
  children: ReactNode;
  id?: string;
}

export function Section({ eyebrow, title, subtitle, background = 'light', children, id }: SectionProps) {
  return (
    <section id={id} className={`${styles.section} ${styles[background]}`}>
      <div className="container">
        {(eyebrow || title || subtitle) && (
          <header className={styles.header}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
