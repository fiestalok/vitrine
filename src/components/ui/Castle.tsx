import { useEffect, useRef } from 'react';
import styles from './Castle.module.css';

interface CastleProps {
  size?: number;
  rotation?: number;
  className?: string;
  noInflate?: boolean;
}

export function Castle({ size = 200, rotation = 0, className, noInflate = false }: CastleProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaler = scalerRef.current;
    if (!scaler) return;

    if (noInflate) {
      scaler.style.setProperty('--inflate', '1');
      return;
    }

    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const progress = Math.min(1, Math.max(0, (vh - center) / (vh * 0.7)));
      scaler.style.setProperty('--inflate', String(progress));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [noInflate]);

  return (
    <div
      ref={wrapRef}
      className={`${styles.castle} ${className || ''}`}
      style={{ width: size }}
      aria-hidden="true"
    >
      <div
        ref={scalerRef}
        className={styles.scaler}
        style={{ ['--rotation' as string]: `${rotation}deg` }}
      >
        <div className={styles.wobble}>
          <svg
            className={styles.svg}
            viewBox="0 0 280 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="140" cy="305" rx="120" ry="8" fill="rgba(45, 52, 54, 0.18)" />

            <g stroke="#2D3436" strokeWidth="2.5" strokeLinecap="round">
              <line x1="40" y1="60" x2="40" y2="18" />
              <line x1="140" y1="40" x2="140" y2="0" />
              <line x1="240" y1="60" x2="240" y2="18" />
            </g>
            <polygon points="40,20 70,28 40,36" fill="#44CF6C" />
            <polygon points="140,2 175,12 140,22" fill="#FFE66D" />
            <polygon points="240,20 270,28 240,36" fill="#FF6B6B" />

            <ellipse cx="40" cy="105" rx="28" ry="55" fill="#FF6B6B" />
            <ellipse cx="240" cy="105" rx="28" ry="55" fill="#4ECDC4" />
            <rect x="32" y="100" width="16" height="22" rx="6" fill="#2D3436" opacity="0.85" />
            <rect x="232" y="100" width="16" height="22" rx="6" fill="#2D3436" opacity="0.85" />

            <path d="M 88 130 Q 140 50 192 130 Z" fill="#FFE66D" />
            <path d="M 100 130 Q 140 70 180 130" fill="#44CF6C" opacity="0.9" />

            <g>
              <rect x="20" y="130" width="240" height="160" rx="22" fill="#FF6B6B" />
              <rect x="80" y="130" width="40" height="160" fill="#FFE66D" />
              <rect x="160" y="130" width="40" height="160" fill="#4ECDC4" />
              <rect x="20" y="130" width="240" height="14" rx="6" fill="#2D3436" opacity="0.18" />
            </g>

            <path
              d="M 110 290 L 110 220 Q 110 188 140 188 Q 170 188 170 220 L 170 290 Z"
              fill="#2D3436"
            />
            <circle cx="50" cy="220" r="6" fill="#FFE66D" />
            <circle cx="230" cy="240" r="5" fill="#FF6B6B" />
            <circle cx="50" cy="265" r="4" fill="#4ECDC4" />
            <circle cx="230" cy="200" r="4" fill="#44CF6C" />

            <polygon
              points="140,108 144,118 154,118 146,124 149,134 140,128 131,134 134,124 126,118 136,118"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
