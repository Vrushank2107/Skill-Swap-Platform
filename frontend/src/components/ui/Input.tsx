import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.ts';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'glass' | 'filled';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon: Icon,
  error,
  helperText,
  variant = 'glass',
  type,
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const variants = {
    default: 'bg-white border border-secondary-200 focus:border-primary-500',
    glass: 'glass backdrop-blur-md border-white/30 focus:border-primary-400 focus:shadow-glow',
    filled: 'bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-500',
  };

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          className="block text-sm font-medium text-secondary-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {Icon && (
          <motion.div
            className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Icon className={cn(
              'h-5 w-5 transition-colors',
              error ? 'text-error-500' : isFocused ? 'text-primary-500' : 'text-secondary-400'
            )} />
          </motion.div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          className={cn(
            'relative block w-full px-4 py-3 rounded-xl transition-all duration-300 text-secondary-900 placeholder-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
            variants[variant],
            Icon && 'pl-12',
            isPassword && 'pr-12',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isPassword && (
          <motion.button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
            ) : (
              <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
            )}
          </motion.button>
        )}
        
        {/* Focus ring animation */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-xl ring-2 ring-primary-500/50 pointer-events-none"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error ? (
            <p className="text-sm text-error-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-error-600 rounded-full" />
              {error}
            </p>
          ) : (
            <p className="text-sm text-secondary-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';

export default Input;
