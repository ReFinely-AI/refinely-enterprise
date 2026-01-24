import { ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export const Card = ({ children, className, header, footer }: CardProps) => (
  <div className={cn(
    'bg-white rounded-2xl shadow-attio border border-gray-100',
    'hover:shadow-lg transition-all duration-200',
    className
  )}>
    {header && (
      <div className="p-6 pb-4 border-b border-gray-100">
        {header}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
    {footer && (
      <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        {footer}
      </div>
    )}
  </div>
);
