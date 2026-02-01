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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
import {
  TrendingUp,
  AlertCircle,
  Plus,
  Building2,
  Banknote,
  FileText,
  PlayCircle,
  Bell,
  Search,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, activeOrgId, setActiveOrgId } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [lastReconciliation, setLastReconciliation] = useState<Reconciliation | null>(null);

  const [openNewRecon, setOpenNewRecon] = useState(false);
  const [openNewOrg, setOpenNewOrg] = useState(false);
  const [openNewBank, setOpenNewBank] = useState(false);
  const [loading, setLoading] = useState(true);

  // New org/bank form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCurrency, setNewOrgCurrency] = useState('PKR');
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccountName, setNewBankAccountName] = useState('');
  const [newBankAccountNumber, setNewBankAccountNumber] = useState('');
  const [newBankCurrency, setNewBankCurrency] = useState('PKR');
  const [newBankTolerance, setNewBankTolerance] = useState<number>(3);
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState('');

  useEffect(() => {
    void loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      void loadBankAccounts(selectedOrg.id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const orgs = await reconciliationService.getOrganizations();
      setOrganizations(orgs);

      if (orgs.length > 0) {
        let initialOrg: Organization | null = null;

        if (activeOrgId) {
          initialOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];
        } else {
          initialOrg = orgs[0];
        }

        setSelectedOrg(initialOrg);
        setActiveOrgId(initialOrg.id);
      }
    } catch (error) {
      console.error('Load organizations failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async (orgId: number) => {
    try {
      const accounts = await reconciliationService.getBankAccounts(orgId);
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Load bank accounts failed:', error);
    }
  };

  // --- Create Organization ---
  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      setCreationError('Organization name is required');
      return;
    }
    setCreating(true);
    setCreationError('');
    try {
      const res = await reconciliationService.createOrganization({
        name: newOrgName.trim(),
        currency: newOrgCurrency || undefined,
      });
      setOrganizations((prev) => [...prev, res]);
      setSelectedOrg(res);
      setActiveOrgId(res.id);
      setOpenNewOrg(false);
      setNewOrgName('');
    } catch (err: any) {
      setCreationError(err?.response?.data?.detail || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  // --- Create Bank Account ---
  const handleCreateBankAccount = async () => {
    if (!selectedOrg) {
      setCreationError('Select or create an organization first');
      return;
    }
    if (!newBankAccountName.trim()) {
      setCreationError('Account name is required');
      return;
    }
    setCreating(true);
    setCreationError('');
    try {
      const res = await reconciliationService.createBankAccount(selectedOrg.id, {
        account_name: newBankAccountName.trim(),
        account_number: newBankAccountNumber.trim() || null,
        bank_name: newBankName.trim() || null,
        currency: newBankCurrency || null,
        date_tolerance_days: newBankTolerance || null,
      });
      setBankAccounts((prev) => [...prev, res]);
      setOpenNewBank(false);
      setNewBankAccountName('');
      setNewBankAccountNumber('');
      setNewBankName('');
    } catch (err: any) {
      setCreationError(err?.response?.data?.detail || 'Failed to create bank account');
    } finally {
      setCreating(false);
    }
  };

  // --- After New Reconciliation created from dialog ---
  const handleReconciliationCreated = (recon: Reconciliation) => {
    setLastReconciliation(recon);
    setOpenNewRecon(false);
    navigate(`/reconciliations/${recon.id}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#020617',
        }}
      >
        <LinearProgress sx={{ width: 400 }} />
      </Box>
    );
  }

  const matchRate = 87; // placeholder
  const anomalies = 3;
  const hasOrg = organizations.length > 0;
  const hasBankAccounts = bankAccounts.length > 0;

  const latestNeedsSetup =
    lastReconciliation &&
    (lastReconciliation.total_bank_transactions === 0 ||
      lastReconciliation.total_ledger_transactions === 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#020617' }}>
      {/* Left sidebar */}
      <Box
        sx={{
          width: 248,
          bgcolor: '#020617',
          borderRight: '1px solid rgba(15,23,42,0.9)',
          color: 'rgba(248,250,252,0.9)',
          display: 'flex',
          flexDirection: 'column',
          pt: 3,
          pb: 4,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 3, display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid #22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              R
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ReFinely
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)' }}>
              AI Reconciliation
            </Typography>
          </Box>
        </Box>

        {/* Main nav */}
        <Box sx={{ px: 2 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: 1, color: '#64748b' }}
          >
            Main
          </Typography>

          <Box
            sx={{
              mt: 1.5,
              mb: 2,
              p: 1.3,
              borderRadius: 2.5,
              background:
                'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.18))',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(15,23,42,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <TrendingUp size={18} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Overview
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.8)' }}>
                Reconciliation workspace
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#64748b',
            }}
          >
            Entities
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip
              icon={<Building2 size={14} />}
              label="Organizations"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(51,65,85,0.9)',
                color: 'rgba(226,232,240,0.9)',
                '& .MuiChip-icon': { color: '#38bdf8' },
                borderRadius: 999,
              }}
            />
            <Chip
              icon={<Banknote size={14} />}
              label="Bank Accounts"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(51,65,85,0.9)',
                color: 'rgba(226,232,240,0.9)',
                '& .MuiChip-icon': { color: '#22c55e' },
                borderRadius: 999,
              }}
            />
            <Chip
              icon={<FileText size={14} />}
              label="Reconciliations"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(51,65,85,0.9)',
                color: 'rgba(226,232,240,0.9)',
                '& .MuiChip-icon': { color: '#a855f7' },
                borderRadius: 999,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* User footer */}
        <Box sx={{ px: 3 }}>
          <Divider sx={{ borderColor: 'rgba(30,64,175,0.8)', mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#1d4ed8',
                fontSize: 14,
              }}
            >
              {user?.full_name?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                {selectedOrg?.name || 'No organization'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            sx={{
              mt: 2,
              width: '100%',
              borderColor: 'rgba(51,65,85,0.9)',
              color: 'rgba(248,250,252,0.9)',
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Right main content */}
      <Box sx={{ flexGrow: 1, bgcolor: 'radial-gradient(circle at top, #020617, #020617 40%, #020617)' }}>
        {/* Top bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(90deg, #020617, #020617)',
            borderBottom: '1px solid rgba(15,23,42,0.9)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#e5e7eb' }}>
                Overview
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Monitor reconciliations, anomalies and data health.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 999,
                  bgcolor: '#020617',
                  border: '1px solid rgba(31,41,55,0.9)',
                  color: '#6b7280',
                  fontSize: 13,
                  minWidth: 200,
                }}
              >
                <Search size={16} />
                <Typography sx={{ ml: 1 }}>Search reconciliations</Typography>
              </Box>

              {selectedOrg && (
                <Chip
                  label={selectedOrg.name}
                  size="small"
                  sx={{
                    height: 30,
                    bgcolor: 'rgba(37,99,235,0.3)',
                    color: '#e5e7eb',
                    borderRadius: 999,
                  }}
                />
              )}

              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(51,65,85,0.9)',
                  color: '#9ca3af',
                }}
              >
                <Bell size={16} />
              </IconButton>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => setOpenNewRecon(true)}
                disabled={!hasBankAccounts}
              >
                New Reconciliation
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
          {/* Getting started + latest + fake activity */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.96)',
                  border: '1px solid rgba(30,64,175,0.7)',
                  boxShadow: '0 18px 45px rgba(15,23,42,0.9)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    Getting started
                  </Typography>
                  <Chip
                    label={
                      hasOrg
                        ? hasBankAccounts
                          ? 'Ready to reconcile'
                          : 'Add bank account'
                        : 'Create organization'
                    }
                    size="small"
                    sx={{
                      height: 26,
                      bgcolor: hasOrg && hasBankAccounts ? '#14532d' : '#1d4ed8',
                      color: '#e5e7eb',
                      borderRadius: 999,
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(37,99,235,0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#60a5fa',
                        }}
                      >
                        <Building2 size={18} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                          1. Organization
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          Create or select your company entity.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(45,212,191,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#22c55e',
                        }}
                      >
                        <Banknote size={18} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                          2. Bank Account
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          Add the account to reconcile.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(168,85,247,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#a855f7',
                        }}
                      >
                        <FileText size={18} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                          3. Reconciliation
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          Upload CSVs, run matching, review anomalies.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => setOpenNewOrg(true)}
                  >
                    New Organization
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => setOpenNewBank(true)}
                    disabled={!hasOrg}
                  >
                    New Bank Account
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.96)',
                  border: '1px solid rgba(30,64,175,0.6)',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ color: '#e5e7eb', mb: 1, fontWeight: 600 }}>
                  Latest Reconciliation
                </Typography>
                {!lastReconciliation ? (
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    No reconciliations yet. Create one to start automated matching.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                      #{lastReconciliation.id} • {lastReconciliation.status}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Period {lastReconciliation.period_start} → {lastReconciliation.period_end}
                    </Typography>

                    {latestNeedsSetup ? (
                      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                        Upload bank and ledger CSV files, then run the matching engine.
                      </Alert>
                    ) : (
                      <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                        Files uploaded. Open the reconciliation screen to review matches.
                      </Alert>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<PlayCircle size={16} />}
                      onClick={() => navigate(`/reconciliations/${lastReconciliation.id}`)}
                    >
                      Open Matching Engine
                    </Button>
                  </>
                )}
              </Paper>

              {/* Simple fake recent activity list for visual richness */}
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.96)',
                  border: '1px solid rgba(30,64,175,0.45)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#e5e7eb', mb: 1.5, fontWeight: 600 }}
                >
                  Recent activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#e5e7eb' }}>
                      New bank account added
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      5 min ago
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#e5e7eb' }}>
                      Reconciliation session created
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      18 min ago
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#e5e7eb' }}>
                      2 anomalies marked as resolved
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      1 hr ago
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Metrics row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <UiCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Average Match Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {matchRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={matchRate}
                    sx={{
                      mt: 2,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e5e7eb',
                    }}
                  />
                </CardContent>
              </UiCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <UiCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Active Anomalies
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {anomalies}
                    </Typography>
                    <AlertCircle size={18} color="#f97316" />
                  </Box>
                </CardContent>
              </UiCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <UiCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Bank Accounts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {bankAccounts.length}
                  </Typography>
                </CardContent>
              </UiCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <UiCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Organizations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {organizations.length}
                  </Typography>
                </CardContent>
              </UiCard>
            </Grid>
          </Grid>

          {/* Organizations + bank accounts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.96)',
                  border: '1px solid rgba(30,64,175,0.6)',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    Organizations
                  </Typography>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setOpenNewOrg(true)}
                  >
                    Add
                  </Button>
                </Box>

                {organizations.length === 0 ? (
                  <Alert severity="info">
                    No organizations yet. Create one to start configuring accounts.
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {organizations.map((org) => (
                      <Chip
                        key={org.id}
                        label={`${org.name} • ${org.currency}`}
                        onClick={() => {
                          setSelectedOrg(org);
                          setActiveOrgId(org.id);
                          void loadBankAccounts(org.id);
                        }}
                        clickable
                        sx={{
                          height: 34,
                          fontSize: '0.8rem',
                          borderRadius: 999,
                          bgcolor:
                            selectedOrg?.id === org.id
                              ? 'rgba(37,99,235,0.95)'
                              : 'rgba(15,23,42,0.9)',
                          color: '#e5e7eb',
                          border:
                            selectedOrg?.id === org.id
                              ? 'none'
                              : '1px solid rgba(148,163,184,0.6)',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <UiCard
                header={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">Bank Accounts</Typography>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => setOpenNewBank(true)}
                      disabled={!hasOrg}
                    >
                      Add
                    </Button>
                  </Box>
                }
              >
                {bankAccounts.length === 0 ? (
                  <Alert severity="info">
                    No bank accounts for this organization. Add one to start reconciling.
                  </Alert>
                ) : (
                  <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                    {bankAccounts.map((account) => (
                      <Box
                        key={account.id}
                        sx={{
                          p: 2.5,
                          border: '1px solid #e5e7eb',
                          borderRadius: 2,
                          mb: 1.5,
                          '&:hover': { backgroundColor: '#f9fafb' },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {account.account_name}
                        </Typography>
                        <Chip
                          label={account.bank_name || '—'}
                          size="small"
                          sx={{ mt: 0.5, mb: 0.5 }}
                        />
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {account.currency} • {account.date_tolerance_days}d tolerance
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </UiCard>
            </Grid>
          </Grid>

          {/* New Reconciliation Dialog */}
          <NewReconciliationDialog
            open={openNewRecon}
            bankAccounts={bankAccounts}
            onClose={() => setOpenNewRecon(false)}
            onCreated={handleReconciliationCreated}
          />

          {/* New Organization Dialog */}
          <Dialog open={openNewOrg} onClose={() => setOpenNewOrg(false)} maxWidth="sm" fullWidth>
            <DialogTitle>New Organization</DialogTitle>
            <DialogContent>
              {creationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {creationError}
                </Alert>
              )}
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Organization Name"
                  fullWidth
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <TextField
                  label="Currency"
                  fullWidth
                  value={newOrgCurrency}
                  onChange={(e) => setNewOrgCurrency(e.target.value)}
                  helperText="e.g. PKR, USD"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button variant="outline" size="sm" onClick={() => setOpenNewOrg(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateOrganization}
                loading={creating}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>

          {/* New Bank Account Dialog */}
          <Dialog open={openNewBank} onClose={() => setOpenNewBank(false)} maxWidth="sm" fullWidth>
            <DialogTitle>New Bank Account</DialogTitle>
            <DialogContent>
              {creationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {creationError}
                </Alert>
              )}
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Account Name"
                  fullWidth
                  value={newBankAccountName}
                  onChange={(e) => setNewBankAccountName(e.target.value)}
                />
                <TextField
                  label="Account Number"
                  fullWidth
                  value={newBankAccountNumber}
                  onChange={(e) => setNewBankAccountNumber(e.target.value)}
                />
                <TextField
                  label="Bank Name"
                  fullWidth
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                />
                <TextField
                  label="Currency"
                  fullWidth
                  value={newBankCurrency}
                  onChange={(e) => setNewBankCurrency(e.target.value)}
                />
                <TextField
                  label="Date Tolerance (days)"
                  type="number"
                  fullWidth
                  value={newBankTolerance}
                  onChange={(e) => setNewBankTolerance(Number(e.target.value) || 0)}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button variant="outline" size="sm" onClick={() => setOpenNewBank(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateBankAccount}
                loading={creating}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
