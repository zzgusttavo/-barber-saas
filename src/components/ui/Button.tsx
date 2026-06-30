import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    
    // Concatena as classes condicionalmente
    const baseClasses = styles.button;
    const variantClass = styles[variant];
    const sizeClass = size !== 'md' ? styles[size] : '';
    const widthClass = fullWidth ? styles.fullWidth : '';
    
    const combinedClasses = [
      baseClasses,
      variantClass,
      sizeClass,
      widthClass,
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
