/**
 * Styled Input component with label, error state, and glowing focus effect.
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl bg-white/5 border border-white/10 
              px-4 py-2.5 text-sm text-white placeholder-gray-500
              outline-none transition-all duration-200
              focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20
              hover:border-white/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
