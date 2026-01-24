import React, { ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;     // Top section (title, actions)
  footer?: ReactNode;     // Bottom section (buttons)
  variant?: 'default' | 'elevated';
}

export const Card = ({ 
  children, 
  className, 
  header, 
  footer, 
  variant = 'default' 
}: CardProps) => (
  <div className={cn(
    'bg-white rounded-2xl border border-gray-200 overflow-hidden',
    variant === 'elevated' && 'shadow-lg hover:shadow-xl transition-shadow',
    className
  )}>
    {/* Header */}
    {header && (
      <div className="p-6 pb-4 border-b border-gray-100">
        {header}
      </div>
    )}
    
    {/* Content */}
    <div className="p-6">
      {children}
    </div>
    
    {/* Footer */}
    {footer && (
      <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
        {footer}
      </div>
    )}
  </div>
);
