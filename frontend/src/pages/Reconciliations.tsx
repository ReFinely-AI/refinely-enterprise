// src/pages/Reconciliations.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface Reconciliation {
  id: number;
  bank_account_id: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

interface BankAccount {
  id: number;
  name: string;
}

const fetchReconciliations = async (): Promise<Reconciliation[]> => {
  const res = await apiClient.get('/reconciliations/');
  return res.data;
};

const fetchBankAccounts = async (): Promise<BankAccount[]> => {
  const res = await apiClient.get('/reconciliations/bank-accounts');
  return res.data;
};

const createReconciliation = async (data: {
  bank_account_id: number;
  period_start: string;
  period_end: string;
}) => {
  const res = await apiClient.post('/reconciliations/', data);
  return res.data as Reconciliation;
};

const ReconciliationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: fetchReconciliations,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: fetchBankAccounts,
  });

  const [open, setOpen] = useState(false);
  const [bankAccountId, setBankAccountId] = useState<number | ''>('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const mutation = useMutation({
    mutationFn: createReconciliation,
    onSuccess: (recon) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      setOpen(false);
      setBankAccountId('');
      setPeriodStart('');
      setPeriodEnd('');
      // go to detail page
      navigate(`/reconciliations/${recon.id}`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountId) return;

    mutation.mutate({
      bank_account_id: Number(bankAccountId),
      period_start: periodStart,
      period_end: periodEnd,
    });
  };

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Reconciliations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sessions that combine bank and ledger data.
            </Typography>
          </Box>
          <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
            New reconciliation
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          {isLoading ? (
            <Typography variant="body2">Loading reconciliations…</Typography>
          ) : reconciliations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No reconciliations yet. Create one to begin.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Bank account</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created at</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconciliations.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/reconciliations/${r.id}`)}
                  >
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.bank_account_id}</TableCell>
                    <TableCell>
                      {r.period_start} – {r.period_end}
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {r.status}
                    </TableCell>
                    <TableCell>
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>New reconciliation</DialogTitle>
          <Box component="form" onSubmit={handleCreate}>
            <DialogContent>
              <TextField
                select
                label="Bank account"
                fullWidth
                margin="normal"
                required
                value={bankAccountId}
                onChange={(e) =>
                  setBankAccountId(e.target.value ? Number(e.target.value) : '')
                }
              >
                {bankAccounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Period start"
                type="date"
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
              <TextField
                label="Period end"
                type="date"
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={mutation.isPending}
              >
                Create
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </AppLayout>
  );
};

export default ReconciliationsPage;
