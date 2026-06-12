import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, badge }) => {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-surface-200 flex-shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-surface-900 tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
