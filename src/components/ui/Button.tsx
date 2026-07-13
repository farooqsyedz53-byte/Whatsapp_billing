/**
 * Reusable Button component with multiple style variants.
 * Supports primary, secondary, danger, ghost, and success variants.
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
  secondary:
    'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25',
  ghost:
    'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 ease-out
        active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
