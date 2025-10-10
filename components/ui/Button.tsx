import React from 'react';
import { Loader2Icon } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60';
    
    const variantClasses = {
      primary: 'text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-purple-500',
      outline: 'border border-primary-500 text-primary-400 hover:bg-primary-500/10 focus:ring-primary-500 disabled:border-slate-700 disabled:text-slate-600 disabled:hover:bg-transparent',
      ghost: 'hover:bg-slate-800 focus:ring-slate-500 disabled:text-slate-600 disabled:hover:bg-transparent',
    };

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
      icon: 'h-11 w-11',
    };
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Loader2Icon className="h-5 w-5 animate-spin" /> : children}
      </button>
    );
  }
);
Button.displayName = 'Button';