import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never };
type LinkButtonProps = CommonProps & { to: string; href?: never };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => {
    const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
    if ('to' in rest && rest.to) {
      return <Link to={rest.to} className={cls}>{children}</Link>;
    }
    return (
      <button ref={ref} className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
