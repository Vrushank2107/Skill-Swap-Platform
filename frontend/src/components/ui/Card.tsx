import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.ts';

interface CardProps {
  variant?: 'default' | 'glass' | 'glass-light' | 'elegant' | 'gradient';
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  className,
  children,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white shadow-soft border border-secondary-200',
    glass: 'glass backdrop-blur-lg border-white/20',
    'glass-light': 'bg-white/90 backdrop-blur-lg border-white/30 shadow-2xl',
    elegant: 'bg-white shadow-elegant border border-secondary-100',
    gradient: 'bg-gradient-brand text-white shadow-glow',
  };

  const hoverStyles = hover 
    ? 'hover:scale-105 hover:shadow-elegant cursor-pointer' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => (
  <div className={cn('p-6 pb-4', className)}>{children}</div>
);

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children }) => (
  <div className={cn('px-6 pb-4', className)}>{children}</div>
);

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => (
  <div className={cn('px-6 pb-6 pt-2', className)}>{children}</div>
);

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => (
  <h3 className={cn('text-xl font-semibold text-secondary-900', className)}>
    {children}
  </h3>
);

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => (
  <p className={cn('text-secondary-600 mt-2', className)}>
    {children}
  </p>
);

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
