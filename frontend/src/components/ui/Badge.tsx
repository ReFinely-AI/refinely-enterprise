import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className 
}: BadgeProps) => (
  <div className={cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    
    // Variants
    variant === 'success' && 'bg-green-100 text-green-800',
    variant === 'warning' && 'bg-yellow-100 text-yellow-800',
    variant === 'error' && 'bg-red-100 text-red-800',
    variant === 'default' && 'bg-gray-100 text-gray-800',
    
    // Sizes
    size === 'sm' && 'px-2 py-0.5 text-xs',
    size === 'md' && 'px-2.5 py-0.5 text-sm',
    
    className
  )}>
    {children}
  </div>
);
