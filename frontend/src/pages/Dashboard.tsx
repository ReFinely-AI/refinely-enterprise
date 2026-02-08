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
  LinearProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  reconciliationService,
  Organization,
  BankAccount,
  Reconciliation,
} from '../services/reconciliation';
import { Button } from '../components/ui/Button';
import NewReconciliationDialog from '../components/NewReconciliationDialog';
import { TrendingUp, Plus, Search } from 'lucide-react';

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
          bgcolor: '#F5F7FA',
        }}
      >
        <LinearProgress sx={{ width: 400 }} />
      </Box>
    );
  }

  const matchRate = 87;
  const anomalies = 3;
  const hasBankAccounts = bankAccounts.length > 0;

  const latestNeedsSetup =
    lastReconciliation &&
    (lastReconciliation.total_bank_transactions === 0 ||
      lastReconciliation.total_ledger_transactions === 0);

  const handleOrgSelect = (orgId: number) => {
    const org = organizations.find((o) => o.id === orgId) || null;
    setSelectedOrg(org);
    setActiveOrgId(orgId);
    if (org) {
      void loadBankAccounts(org.id);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA', color: '#343C6A' }}>
      {/* Left sidebar with real navigation */}
      <Box
        sx={{
          width: 250,
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E6EFF5',
          display: 'flex',
          flexDirection: 'column',
          py: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 3, display: 'flex', alignItems: 'center', mb: 4 }}>
          <img
            src="/dashboard-logo.png"
            alt="Refinely logo"
            style={{ width: 36, height: 36, marginRight: 12 }}
          />
          <Typography
            sx={{
              fontFamily: 'var(--font-roboto-slab)',
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Refinely
          </Typography>
        </Box>

        {/* Nav items */}
        <Box sx={{ px: 3 }}>
          <NavItem label="Dashboard" to="/dashboard" />
          <NavItem label="Organizations" to="/organizations" />
          <NavItem label="Accounts" to="/bank-accounts" />
          <NavItem label="Reconciliations" to="/reconciliations" />
          <NavItem label="Matching" />
          <NavItem label="Anomalies" />
          <NavItem label="Assistant" />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* User footer */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8BA3CB' }}>
                {selectedOrg?.name || 'No organization'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            sx={{ width: '100%', borderColor: '#E6EFF5', color: '#343C6A' }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Right main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar with org switcher */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#343C6A',
            borderBottom: '1px solid #E6EFF5',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 80 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Overview
              </Typography>
              {selectedOrg && (
                <Typography variant="body2" sx={{ color: '#8BA3CB' }}>
                  Working in: {selectedOrg.name} ({selectedOrg.currency || 'PKR'})
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                select
                size="small"
                label="Organization"
                value={selectedOrg ? selectedOrg.id : ''}
                onChange={(e) => handleOrgSelect(Number(e.target.value))}
                sx={{ minWidth: 220 }}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name} ({org.currency || 'PKR'})
                  </MenuItem>
                ))}
              </TextField>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1,
                  borderRadius: 999,
                  bgcolor: '#F5F7FA',
                  minWidth: 220,
                  color: '#8BA3CB',
                  fontSize: 14,
                }}
              >
                <Search size={18} />
                <Typography sx={{ ml: 1 }}>Search for something</Typography>
              </Box>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => setOpenNewRecon(true)}
                disabled={!hasBankAccounts}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  bgcolor: '#1814F3',
                  '&:hover': { bgcolor: '#0f0cc7' },
                }}
              >
                New Reconciliation
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content area */}
        <Box sx={{ flexGrow: 1, bgcolor: '#F5F7FA', p: 3 }}>
          <Container maxWidth="lg" sx={{ px: 0 }}>
            {/* KPI cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Reconciliation"
                  value="1,248"
                  iconBg="#FFE0F0"
                  iconColor="#FF5C8D"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Unmatched Amount"
                  value="$12,750"
                  iconBg="#FFF4DE"
                  iconColor="#FFA500"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Anomalies"
                  value={anomalies.toString()}
                  iconBg="#E2F4FF"
                  iconColor="#2D60FF"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Match rate"
                  value={`${matchRate}%`}
                  iconBg="#E6FFF4"
                  iconColor="#16A34A"
                />
              </Grid>
            </Grid>

            {/* Charts row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Paper
                  sx={{
                    borderRadius: 3,
                    p: 2.5,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                    Cash Balance Over Time
                  </Typography>
                  <Box
                    sx={{
                      height: 260,
                      borderRadius: 3,
                      bgcolor: 'linear-gradient(180deg,#F8FAFC,#EFF3FF)',
                      border: '1px solid #EFF3F9',
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    borderRadius: 3,
                    p: 2.5,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                    Anomalies by Type
                  </Typography>
                  <Box
                    sx={{
                      height: 260,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 170,
                        height: 170,
                        borderRadius: '50%',
                        background:
                          'conic-gradient(#2D60FF 0 110deg,#FFB020 110deg 210deg,#FF5C8D 210deg 280deg,#10B981 280deg 360deg)',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 26,
                          borderRadius: '50%',
                          bgcolor: '#FFFFFF',
                        }}
                      />
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <LegendDot color="#2D60FF" label="Fraud" />
                      <LegendDot color="#FF5C8D" label="Duplicate" />
                      <LegendDot color="#FFB020" label="Timing" />
                      <LegendDot color="#10B981" label="Other" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent reconciliations table */}
            <Paper
              sx={{
                borderRadius: 3,
                p: 2.5,
                bgcolor: '#FFFFFF',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                Recent Reconciliations
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <RecentRow
                    description="Spotify Subscription"
                    id="#12548796"
                    entity="Shopping"
                    status="Matched"
                    date="28 Jan, 12:30 AM"
                    amount="- $2,500"
                    positive={false}
                  />
                  <RecentRow
                    description="Freepik Sales"
                    id="#12548796"
                    entity="Transfer"
                    status="Unmatch"
                    date="25 Jan, 10:40 PM"
                    amount="+ $750"
                    positive
                  />
                  <RecentRow
                    description="Mobile Service"
                    id="#12548796"
                    entity="Service"
                    status="Matched"
                    date="20 Jan, 10:40 PM"
                    amount="- $150"
                    positive={false}
                  />
                  <RecentRow
                    description="Wilson"
                    id="#12548796"
                    entity="Transfer"
                    status="Matched"
                    date="18 Jan, 03:29 PM"
                    amount="- $1,050"
                    positive={false}
                  />
                  <RecentRow
                    description="Emily"
                    id="#12548796"
                    entity="Transfer"
                    status="Anomaly"
                    date="14 Jan, 10:14 PM"
                    amount="+ $840"
                    positive
                  />
                </TableBody>
              </Table>
            </Paper>
          </Container>

          {/* Dialogs */}
          <NewReconciliationDialog
            open={openNewRecon}
            bankAccounts={bankAccounts}
            onClose={() => setOpenNewRecon(false)}
            onCreated={handleReconciliationCreated}
          />

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
        </Box>
      </Box>
    </Box>
  );
};

/* --- Small presentational helpers --- */

interface NavItemProps {
  label: string;
  to?: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, to }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = to ? location.pathname.startsWith(to) : false;

  return (
    <Box
      onClick={to ? () => navigate(to) : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 44,
        borderRadius: 999,
        px: 2.5,
        mb: 1,
        bgcolor: isActive ? '#2D60FF' : 'transparent',
        color: isActive ? '#FFFFFF' : '#B1B1B1',
        cursor: to ? 'pointer' : 'default',
        fontSize: 15,
        fontWeight: isActive ? 600 : 500,
        transition: 'background 0.15s',
        '&:hover': {
          bgcolor: to ? (isActive ? '#2448cc' : '#F5F7FA') : 'transparent',
          color: to ? (isActive ? '#FFFFFF' : '#343C6A') : '#B1B1B1',
        },
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: isActive ? '#FFFFFF' : '#D0D7E2',
          mr: 1.5,
        }}
      />
      {label}
    </Box>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, iconBg, iconColor }) => (
  <Paper
    sx={{
      borderRadius: 3,
      p: 2,
      bgcolor: '#FFFFFF',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box>
      <Typography sx={{ fontSize: 14, color: '#8BA3CB' }}>{label}</Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 600, mt: 0.5 }}>{value}</Typography>
    </Box>
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        bgcolor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
      }}
    >
      <TrendingUp size={20} />
    </Box>
  </Paper>
);

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: color,
        mr: 1,
      }}
    />
    <Typography sx={{ fontSize: 13, color: '#8BA3CB' }}>{label}</Typography>
  </Box>
);

interface RecentRowProps {
  description: string;
  id: string;
  entity: string;
  status: 'Matched' | 'Unmatch' | 'Anomaly';
  date: string;
  amount: string;
  positive: boolean;
}

const RecentRow: React.FC<RecentRowProps> = ({
  description,
  id,
  entity,
  status,
  date,
  amount,
  positive,
}) => {
  const statusColor =
    status === 'Matched' ? '#16A34A' : status === 'Anomaly' ? '#EF4444' : '#F59E0B';
  const statusBg =
    status === 'Matched' ? '#E6FFF4' : status === 'Anomaly' ? '#FFE4E6' : '#FFF7E6';

  return (
    <TableRow sx={{ '&:last-child td': { borderBottom: 0 } }}>
      <TableCell>{description}</TableCell>
      <TableCell>{id}</TableCell>
      <TableCell>{entity}</TableCell>
      <TableCell>
        <Chip
          label={status}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            fontSize: 12,
            fontWeight: 500,
          }}
        />
      </TableCell>
      <TableCell>{date}</TableCell>
      <TableCell align="right" sx={{ color: positive ? '#16A34A' : '#EF4444' }}>
        {amount}
      </TableCell>
      <TableCell>
        <Button variant="outline" size="xs">
          Download
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default Dashboard;
