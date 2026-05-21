import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkButtonProps = CommonProps & { href: string; to?: never };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => {
    const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
    if ('href' in rest && rest.href) {
      return <a href={rest.href} className={cls}>{children}</a>;
    }
    return (
      <button ref={ref} className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
