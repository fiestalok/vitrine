import type { ReactNode } from 'react';
import styles from './Section.module.css';
import { Bubbles } from './Bubbles';

type Background = 'light' | 'dark' | 'accent' | 'gradientWarm' | 'gradientCool' | 'gradientPlay';

interface SectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  background?: Background;
  bubbles?: 'warm' | 'cool' | 'light' | 'hero' | false;
  children: ReactNode;
  id?: string;
}

const DEFAULT_BUBBLES: Partial<Record<Background, 'warm' | 'cool' | 'light'>> = {
  gradientWarm: 'warm',
  gradientCool: 'cool',
  light: 'light',
};

export function Section({ eyebrow, title, subtitle, background = 'light', bubbles, children, id }: SectionProps) {
  const variant = bubbles === false ? null : (bubbles ?? DEFAULT_BUBBLES[background] ?? null);
  return (
    <section id={id} className={`${styles.section} ${styles[background]}`}>
      {variant && <Bubbles variant={variant} />}
      <div className={`container ${styles.inner}`}>
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
