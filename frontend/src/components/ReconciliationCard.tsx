import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card as UiCard } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Reconciliation } from '../types/reconciliation';

interface Props {
  reconciliation: Reconciliation;
}

const ReconciliationCard: React.FC<Props> = ({ reconciliation }) => {
  const navigate = useNavigate();

  const matchRate =
    reconciliation.total_bank_transactions > 0
      ? Math.round(
          (reconciliation.matched_count / reconciliation.total_bank_transactions) * 100,
        )
      : 0;

  const statusColor =
    reconciliation.status === 'completed'
      ? 'success'
      : reconciliation.status === 'failed'
      ? 'error'
      : 'warning';

  return (
    <UiCard
      variant="elevated"
      onClick={() => navigate(`/reconciliations/${reconciliation.id}`)}
      className="cursor-pointer hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              statusColor === 'success'
                ? 'bg-green-500'
                : statusColor === 'error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          />
          <Badge variant={statusColor as any}>{reconciliation.status.toUpperCase()}</Badge>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{matchRate}%</div>
          <div className="text-sm text-gray-500">Match Rate</div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>
            {format(new Date(reconciliation.period_start), 'MMM dd')} -{' '}
            {format(new Date(reconciliation.period_end), 'MMM dd, yyyy')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Bank Txns:</span>
          <span className="font-medium">{reconciliation.total_bank_transactions}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Ledger Txns:</span>
          <span className="font-medium">{reconciliation.total_ledger_transactions}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Anomalies:</span>
          <span
            className={`font-medium ${
              reconciliation.anomaly_count > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {reconciliation.anomaly_count}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/reconciliations/${reconciliation.id}`);
          }}
        >
          View Details
        </Button>
        {reconciliation.status === 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // later: trigger export action
            }}
          >
            Export Report
          </Button>
        )}
      </div>
    </UiCard>
  );
};

export default ReconciliationCard;
