import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CreditCard, X, ArrowRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  reason: 'no-org' | 'no-bank-account';
}

const SetupRequiredDialog: React.FC<Props> = ({ open, onClose, reason }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const isNoOrg = reason === 'no-org';

  const handleGo = () => {
    onClose();
    navigate(isNoOrg ? '/organizations' : '/bank-accounts');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[440px] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <h2 className="text-lg font-bold text-surface-900">Setup Required</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center mb-4">
            {isNoOrg ? <Building2 size={26} /> : <CreditCard size={26} />}
          </div>
          <p className="text-base font-semibold text-surface-800 mb-1.5">
            {isNoOrg ? 'No organization found' : 'No bank account found'}
          </p>
          <p className="text-sm text-surface-500 leading-relaxed">
            {isNoOrg
              ? 'You need to create an organization before starting a reconciliation. Go to Organizations in the sidebar to add one.'
              : 'You need to add a bank account before starting a reconciliation. Go to Bank Accounts in the sidebar to add one.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGo}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-colors"
          >
            {isNoOrg ? 'Go to Organizations' : 'Go to Bank Accounts'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupRequiredDialog;