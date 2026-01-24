import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  Box,
  Chip,
  Paper,
  Grid,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {
  reconciliationService,
  Organization,
  BankAccount,
  Reconciliation,
} from '../services/reconciliation';
import { Button } from '../components/ui/Button';
import { Card as UiCard } from '../components/ui/Card';
import NewReconciliationDialog from '../components/NewReconciliationDialog';
import ReconciliationCard from '../components/ReconciliationCard';
import { TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const orgs = await reconciliationService.getOrganizations();
      setOrganizations(orgs);

      if (orgs.length > 0) {
        const selected = orgs[0];
        setSelectedOrg(selected);
        const accounts = await reconciliationService.getBankAccounts(selected.id);
        setBankAccounts(accounts);
      }

      // Optionally, you probably want to load reconciliations too:
      // const recs = await reconciliationService.getReconciliations(selected.id);
      // setReconciliations(recs);
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <LinearProgress sx={{ width: 400 }} />
      </Box>
    );
  }

  const matchRate = 87; // Mock data
  const totalReconciliations = 12;
  const anomalies = 3;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFBFC' }}>
      {/* Attio-style AppBar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                mr: 2,
                fontSize: '1.1rem',
              }}
            >
              R
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                ReFinely
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                Agentic AI Reconciliation
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Hi, ${user?.full_name?.split(' ')[0] || 'User'}`}
              size="small"
              sx={{
                height: 32,
                backgroundColor: '#F3F4F6',
                '& .MuiChip-label': { px: 1.5 },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={logout}
              sx={{ borderColor: '#D1D5DB', color: '#374151' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 6, pb: 8 }}>
        {/* Metrics Row - Attio Style */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <UiCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: '#DBEAFE',
                        color: '#1E40AF',
                      }}
                    >
                      <TrendingUp size={24} />
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Average Match Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {matchRate}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={matchRate}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#F3F4F6' }}
                  />
                </Box>
              </CardContent>
            </UiCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <UiCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#FEF3C7', color: '#92400E' }}>
                    <AlertCircle size={24} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Active Anomalies
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {anomalies}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </UiCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <UiCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                  Total Reconciliations
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                  {totalReconciliations}
                </Typography>
              </CardContent>
            </UiCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <UiCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                  Bank Accounts
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {bankAccounts.length}
                </Typography>
              </CardContent>
            </UiCard>
          </Grid>
        </Grid>

        {/* Organizations Section */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: '16px' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Organizations
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {organizations.map((org) => (
              <Chip
                key={org.id}
                label={`${org.name} • ${org.currency}`}
                onClick={() => setSelectedOrg(org)}
                clickable
                sx={{
                  height: 40,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  ...(selectedOrg?.id === org.id && {
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }),
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Bank Accounts */}
          <Grid item xs={12} lg={4}>
            <UiCard header={<Typography variant="h6">Bank Accounts</Typography>}>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {bankAccounts.map((account) => (
                  <Box
                    key={account.id}
                    sx={{
                      p: 3,
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      mb: 2,
                      '&:hover': { backgroundColor: '#F9FAFB' },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {account.account_name}
                    </Typography>
                    <Chip label={account.bank_name || '—'} size="small" sx={{ mb: 1 }} />
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {account.currency} • {account.date_tolerance_days}d tolerance
                    </Typography>
                  </Box>
                ))}
              </Box>
            </UiCard>
          </Grid>

          {/* Reconciliations */}
          <Grid item xs={12} lg={8}>
            <UiCard
              header={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6">Recent Reconciliations</Typography>
                  <Button variant="primary" size="sm" onClick={() => setOpenDialog(true)}>
                    + New
                  </Button>
                </Box>
              }
            >
              {reconciliations.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="h6">No reconciliations yet</Typography>
                  <Typography>
                    Create your first one to get started with automated matching and anomaly
                    detection.
                  </Typography>
                </Alert>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {reconciliations.map((recon) => (
                    <ReconciliationCard key={recon.id} reconciliation={recon} />
                  ))}
                </Box>
              )}
            </UiCard>
          </Grid>
        </Grid>

        <NewReconciliationDialog
          open={openDialog}
          bankAccounts={bankAccounts}
          onClose={() => setOpenDialog(false)}
          onCreated={loadData}
        />
      </Container>
    </Box>
  );
};

export default Dashboard;
