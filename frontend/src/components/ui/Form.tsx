import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.ts';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'card';
}

const Form: React.FC<FormProps> = ({
  children,
  title,
  subtitle,
  variant = 'glass',
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white shadow-soft border border-secondary-200',
    glass: 'glass backdrop-blur-xl border-white/20 shadow-glass',
    card: 'bg-white shadow-elegant border border-secondary-100',
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className={cn(
          'rounded-2xl p-8 transition-all duration-300',
          variants[variant],
          className
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {(title || subtitle) && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title && (
              <motion.h2
                className="text-3xl font-bold text-secondary-900 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="text-secondary-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}
        
        <motion.form
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          {...props}
        >
          {children}
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default Form;
