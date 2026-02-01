import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reconciliationService } from '../services/reconciliation';
import { Organization } from '../types/reconciliation';
import { useAuth } from '../contexts/AuthContext';

export const useOrganizations = () => {
  const { activeOrgId, setActiveOrgId } = useAuth();

  const query = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => reconciliationService.getOrganizations(),
  });

  useEffect(() => {
    if (query.data && query.data.length > 0 && !activeOrgId) {
      setActiveOrgId(query.data[0].id);
    }
  }, [query.data, activeOrgId, setActiveOrgId]);

  return {
    organizations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    activeOrgId,
    setActiveOrgId,
  };
};
