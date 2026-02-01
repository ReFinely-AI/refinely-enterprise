import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reconciliationService } from '../services/reconciliation';
import {
  Reconciliation,
  ReconciliationTransactionsResponse,
  RunMatchResponse,
  Match,
} from '../types/reconciliation';

export const useReconciliation = (id: number | undefined) => {
  return useQuery<Reconciliation>({
    queryKey: ['reconciliation', id],
    queryFn: () => reconciliationService.getReconciliation(id as number),
    enabled: !!id,
  });
};

export const useReconciliationTransactions = (id: number | undefined) => {
  return useQuery<ReconciliationTransactionsResponse>({
    queryKey: ['reconciliation-transactions', id],
    queryFn: () => reconciliationService.getReconciliationTransactions(id as number),
    enabled: !!id,
  });
};

export const useMatches = (id: number | undefined) => {
  return useQuery<Match[]>({
    queryKey: ['reconciliation-matches', id],
    queryFn: () => reconciliationService.getMatches(id as number),
    enabled: !!id,
  });
};

export const useRunMatching = (id: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<RunMatchResponse, unknown, void>({
    mutationFn: () => reconciliationService.runMatching(id as number),
    onSuccess: () => {
      if (!id) return;
      void queryClient.invalidateQueries({ queryKey: ['reconciliation', id] });
      void queryClient.invalidateQueries({ queryKey: ['reconciliation-transactions', id] });
      void queryClient.invalidateQueries({ queryKey: ['reconciliation-matches', id] });
    },
  });
};
