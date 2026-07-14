import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2 rounded-lg border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-primary-100 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message || error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
