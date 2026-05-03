import styles from './Bubbles.module.css';

type BubbleColor = 'turquoise' | 'jaune' | 'corail' | 'vert' | 'lavande' | 'pêche';

interface BubbleSpec {
  top: string;
  left: string;
  size: number;
  color: BubbleColor;
  opacity?: number;
}

const PALETTE: Record<BubbleColor, string> = {
  turquoise: 'radial-gradient(circle at 30% 28%, #E5FAF8 0%, #A8E5DF 40%, #4ECDC4 100%)',
  jaune:     'radial-gradient(circle at 30% 28%, #FFFBE0 0%, #FFEFA8 40%, #FFE66D 100%)',
  corail:    'radial-gradient(circle at 30% 28%, #FFE2E0 0%, #FFB4AE 40%, #FF6B6B 100%)',
  vert:      'radial-gradient(circle at 30% 28%, #E8FAE3 0%, #ABE5A0 40%, #44CF6C 100%)',
  lavande:   'radial-gradient(circle at 30% 28%, #F1EAFF 0%, #C9B6F5 45%, #8E72D9 100%)',
  pêche:     'radial-gradient(circle at 30% 28%, #FFEEDD 0%, #FFC9A1 45%, #FF9C5A 100%)',
};

const PRESETS: Record<string, BubbleSpec[]> = {
  hero: [
    { top: '6%',  left: '3%',  size: 38, color: 'jaune' },
    { top: '14%', left: '92%', size: 26, color: 'turquoise' },
    { top: '38%', left: '48%', size: 14, color: 'corail', opacity: 0.7 },
    { top: '62%', left: '6%',  size: 22, color: 'vert' },
    { top: '78%', left: '88%', size: 44, color: 'corail' },
    { top: '88%', left: '38%', size: 18, color: 'lavande' },
    { top: '28%', left: '70%', size: 12, color: 'jaune', opacity: 0.6 },
    { top: '52%', left: '95%', size: 16, color: 'pêche', opacity: 0.7 },
    { top: '22%', left: '22%', size: 10, color: 'turquoise', opacity: 0.6 },
    { top: '44%', left: '14%', size: 18, color: 'corail', opacity: 0.65 },
    { top: '64%', left: '40%', size: 24, color: 'jaune', opacity: 0.55 },
    { top: '72%', left: '62%', size: 12, color: 'vert', opacity: 0.7 },
    { top: '34%', left: '88%', size: 32, color: 'lavande', opacity: 0.7 },
    { top: '8%',  left: '58%', size: 20, color: 'pêche', opacity: 0.7 },
    { top: '92%', left: '14%', size: 14, color: 'turquoise', opacity: 0.6 },
    { top: '48%', left: '78%', size: 10, color: 'corail', opacity: 0.55 },
  ],
  warm: [
    { top: '6%',  left: '8%',  size: 32, color: 'turquoise' },
    { top: '14%', left: '68%', size: 20, color: 'corail' },
    { top: '36%', left: '94%', size: 46, color: 'jaune' },
    { top: '74%', left: '3%',  size: 28, color: 'lavande' },
    { top: '88%', left: '52%', size: 18, color: 'vert', opacity: 0.7 },
    { top: '22%', left: '38%', size: 12, color: 'corail', opacity: 0.6 },
    { top: '58%', left: '78%', size: 24, color: 'turquoise' },
    { top: '82%', left: '88%', size: 14, color: 'jaune', opacity: 0.7 },
    { top: '12%', left: '24%', size: 16, color: 'pêche', opacity: 0.7 },
    { top: '28%', left: '82%', size: 22, color: 'vert', opacity: 0.65 },
    { top: '46%', left: '12%', size: 14, color: 'corail', opacity: 0.6 },
    { top: '50%', left: '46%', size: 10, color: 'lavande', opacity: 0.6 },
    { top: '66%', left: '60%', size: 20, color: 'pêche', opacity: 0.65 },
    { top: '92%', left: '28%', size: 12, color: 'turquoise', opacity: 0.6 },
    { top: '8%',  left: '54%', size: 26, color: 'corail', opacity: 0.7 },
  ],
  cool: [
    { top: '8%',  left: '6%',  size: 36, color: 'corail' },
    { top: '20%', left: '84%', size: 22, color: 'jaune' },
    { top: '46%', left: '4%',  size: 16, color: 'lavande', opacity: 0.7 },
    { top: '60%', left: '94%', size: 40, color: 'pêche' },
    { top: '82%', left: '24%', size: 26, color: 'turquoise' },
    { top: '90%', left: '72%', size: 14, color: 'corail', opacity: 0.6 },
    { top: '32%', left: '52%', size: 12, color: 'vert', opacity: 0.5 },
    { top: '14%', left: '32%', size: 18, color: 'jaune', opacity: 0.7 },
    { top: '24%', left: '64%', size: 14, color: 'turquoise', opacity: 0.7 },
    { top: '40%', left: '78%', size: 22, color: 'corail', opacity: 0.6 },
    { top: '56%', left: '38%', size: 10, color: 'jaune', opacity: 0.6 },
    { top: '70%', left: '54%', size: 18, color: 'lavande', opacity: 0.6 },
    { top: '76%', left: '8%',  size: 12, color: 'vert', opacity: 0.7 },
    { top: '12%', left: '50%', size: 24, color: 'pêche', opacity: 0.7 },
    { top: '94%', left: '92%', size: 16, color: 'jaune', opacity: 0.55 },
  ],
  sides: [
    { top: '3%',  left: '1%',   size: 40, color: 'jaune',     opacity: 0.75 },
    { top: '8%',  left: '96%',  size: 28, color: 'corail',    opacity: 0.7 },
    { top: '14%', left: '3%',   size: 20, color: 'turquoise', opacity: 0.65 },
    { top: '20%', left: '97%',  size: 42, color: 'vert',      opacity: 0.7 },
    { top: '26%', left: '2%',   size: 16, color: 'lavande',   opacity: 0.65 },
    { top: '32%', left: '95%',  size: 24, color: 'jaune',     opacity: 0.65 },
    { top: '38%', left: '1%',   size: 34, color: 'corail',    opacity: 0.7 },
    { top: '44%', left: '98%',  size: 18, color: 'turquoise', opacity: 0.65 },
    { top: '50%', left: '4%',   size: 22, color: 'pêche',     opacity: 0.7 },
    { top: '56%', left: '96%',  size: 36, color: 'vert',      opacity: 0.65 },
    { top: '62%', left: '2%',   size: 18, color: 'jaune',     opacity: 0.65 },
    { top: '68%', left: '97%',  size: 20, color: 'lavande',   opacity: 0.65 },
    { top: '74%', left: '1%',   size: 28, color: 'corail',    opacity: 0.7 },
    { top: '80%', left: '95%',  size: 32, color: 'pêche',     opacity: 0.65 },
    { top: '86%', left: '3%',   size: 16, color: 'turquoise', opacity: 0.65 },
    { top: '92%', left: '96%',  size: 22, color: 'jaune',     opacity: 0.65 },
    { top: '97%', left: '2%',   size: 24, color: 'vert',      opacity: 0.65 },
  ],
  light: [
    { top: '8%',  left: '4%',  size: 22, color: 'turquoise', opacity: 0.55 },
    { top: '18%', left: '92%', size: 30, color: 'corail',    opacity: 0.6 },
    { top: '70%', left: '2%',  size: 18, color: 'jaune',     opacity: 0.55 },
    { top: '84%', left: '86%', size: 26, color: 'vert',      opacity: 0.55 },
    { top: '50%', left: '50%', size: 10, color: 'lavande',   opacity: 0.4 },
    { top: '32%', left: '24%', size: 14, color: 'pêche',     opacity: 0.55 },
    { top: '40%', left: '74%', size: 18, color: 'turquoise', opacity: 0.55 },
    { top: '60%', left: '38%', size: 12, color: 'corail',    opacity: 0.5 },
    { top: '78%', left: '58%', size: 16, color: 'jaune',     opacity: 0.55 },
    { top: '24%', left: '60%', size: 10, color: 'vert',      opacity: 0.5 },
    { top: '92%', left: '40%', size: 14, color: 'lavande',   opacity: 0.5 },
    { top: '10%', left: '46%', size: 12, color: 'corail',    opacity: 0.5 },
  ],
};

interface BubblesProps {
  variant?: keyof typeof PRESETS;
}


export function Bubbles({ variant = 'light' }: BubblesProps) {
  const bubbles = PRESETS[variant];
  return (
    <div className={styles.bubbles} aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className={styles.bubble}
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background: PALETTE[b.color],
            opacity: b.opacity ?? 0.85,
          }}
        />
      ))}
    </div>
  );
}
