import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  tone?: 'accent' | 'primary' | 'danger' | 'success';
  rotation?: number; // degrés
  className?: string;
}

export function Badge({ children, tone = 'accent', rotation = -3, className = '' }: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[tone]} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </span>
  );
}
