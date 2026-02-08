// src/pages/BankAccounts.tsx
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
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';

interface BankAccount {
  id: number;
  name: string;
  bank_name: string;
  account_number: string;
  created_at: string;
}

const fetchBankAccounts = async (): Promise<BankAccount[]> => {
  const res = await apiClient.get('/reconciliations/bank-accounts');
  return res.data;
};

const createBankAccount = async (data: {
  name: string;
  bank_name: string;
  account_number: string;
}) => {
  const res = await apiClient.post('/reconciliations/bank-accounts', data);
  return res.data as BankAccount;
};

const BankAccountsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: fetchBankAccounts,
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const mutation = useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setOpen(false);
      setName('');
      setBankName('');
      setAccountNumber('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      bank_name: bankName,
      account_number: accountNumber,
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
              Bank accounts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accounts used for reconciliations.
            </Typography>
          </Box>
          <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
            Add bank account
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          {isLoading ? (
            <Typography variant="body2">Loading bank accounts…</Typography>
          ) : accounts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No bank accounts yet. Add one to start reconciling.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Account number</TableCell>
                  <TableCell>Created at</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>{acc.bank_name}</TableCell>
                    <TableCell>{acc.account_number}</TableCell>
                    <TableCell>
                      {new Date(acc.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Create bank account</DialogTitle>
          <Box component="form" onSubmit={handleCreate}>
            <DialogContent>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Bank name"
                fullWidth
                margin="normal"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <TextField
                label="Account number"
                fullWidth
                margin="normal"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
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

export default BankAccountsPage;
