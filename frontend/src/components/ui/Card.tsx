import React, { ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  header,
  footer,
  variant = 'default',
}) => (
  <div
    className={cn(
      'bg-white rounded-2xl border border-gray-200 overflow-hidden',
      variant === 'elevated' && 'shadow-lg hover:shadow-xl transition-shadow',
      className,
    )}
  >
    {header && (
      <div className="p-6 pb-4 border-b border-gray-100">
        {header}
      </div>
    )}

    <div className="p-6">{children}</div>

    {footer && (
      <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
        {footer}
      </div>
    )}
  </div>
);

export { Card };
export type { CardProps };
