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

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
type LinkButtonProps = CommonProps & { to: string; href?: never };
type AnchorButtonProps = CommonProps & { href: string; to?: never };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps | AnchorButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => {
    const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
    if ('to' in rest && rest.to) {
      return <Link to={rest.to} className={cls}>{children}</Link>;
    }
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
