/**
 * Styled Select dropdown component.
 */

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-400"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full rounded-xl bg-white/5 border border-white/10
            px-4 py-2.5 text-sm text-white
            outline-none transition-all duration-200
            focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20
            hover:border-white/20
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
            bg-[length:16px] bg-[right_12px_center] bg-no-repeat
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
