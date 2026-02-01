import React from 'react';
import { cn } from '../../utils';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'primary' && 'bg-blue-100 text-blue-800',
        variant === 'secondary' && 'bg-gray-100 text-gray-800',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800',
        variant === 'error' && 'bg-red-100 text-red-800',
        variant === 'outline' &&
          'border border-gray-300 text-gray-800 bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeProps, BadgeVariant };
