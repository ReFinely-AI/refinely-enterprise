// src/pages/Organizations.tsx
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
import { useAuth } from '../contexts/AuthContext';

interface Organization {
  id: number;
  name: string;
  currency: string;
  created_at: string;
}

const fetchOrganizations = async (): Promise<Organization[]> => {
  const res = await apiClient.get('/organizations/');
  return res.data;
};

const createOrganization = async (data: { name: string; currency?: string }) => {
  const res = await apiClient.post('/organizations/', data);
  return res.data as Organization;
};

const OrganizationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { setActiveOrgId, activeOrgId } = useAuth();

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PKR');

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      // if no active org, set the newly-created one
      if (!activeOrgId) {
        setActiveOrgId(org.id);
      }
      setOpen(false);
      setName('');
      setCurrency('PKR');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, currency: currency || 'PKR' });
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
              Organizations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage workspaces you belong to.
            </Typography>
          </Box>
          <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
            Add organization
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          {isLoading ? (
            <Typography variant="body2">Loading organizations…</Typography>
          ) : orgs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No organizations yet. Create one to get started.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Created at</TableCell>
                  <TableCell align="right">Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orgs.map((org) => (
                  <TableRow
                    key={org.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setActiveOrgId(org.id)}
                  >
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{org.currency}</TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {activeOrgId === org.id ? 'Current' : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Create organization</DialogTitle>
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
                label="Currency"
                fullWidth
                margin="normal"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                helperText="e.g. PKR, USD"
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

export default OrganizationsPage;
