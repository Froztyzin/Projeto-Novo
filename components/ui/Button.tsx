import React from 'react';
import { Loader2Icon } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800 bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border border-primary-600 dark:border-primary-500',
      outline: 'border border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10 focus:ring-primary-500 disabled:border-gray-300 disabled:text-gray-500 dark:disabled:border-slate-700 dark:disabled:text-slate-600 disabled:hover:bg-transparent',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
    };

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
      icon: 'h-10 w-10',
    };
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2Icon className="h-5 w-5 animate-spin" />}
        {!isLoading && children}
      </button>
    );
  }
);
Button.displayName = 'Button';