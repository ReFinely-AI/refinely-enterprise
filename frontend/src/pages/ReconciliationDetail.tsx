import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Alert,
  Button as MuiButton,
  Paper,
} from '@mui/material';
import { FileDown, Play, UploadCloud } from 'lucide-react';
import FileUploadDialog from '../components/FileUploadDialog';
import MatchesTable from '../components/MatchesTable';
import TransactionsSplitView from '../components/TransactionsSplitView';
import {
  useReconciliation,
  useReconciliationTransactions,
  useMatches,
  useRunMatching,
} from '../hooks/useReconciliationData';

const ReconciliationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reconciliationId = id ? parseInt(id, 10) : undefined;

  const [tabValue, setTabValue] = React.useState(0);
  const [openUpload, setOpenUpload] = React.useState(false);

  const { data: reconciliation, isLoading } = useReconciliation(reconciliationId);
  const { data: txData } = useReconciliationTransactions(reconciliationId);
  const { data: matches = [], isLoading: matchesLoading } = useMatches(reconciliationId);
  const runMatching = useRunMatching(reconciliationId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunMatching = async () => {
    if (!reconciliationId) return;
    await runMatching.mutateAsync();
  };

  const matchRate =
    reconciliation && reconciliation.total_bank_transactions > 0
      ? Math.round(
          (reconciliation.matched_count / reconciliation.total_bank_transactions) * 100,
        )
      : 0;

  if (isLoading) {
    return (
      <Container sx={{ mt: 8 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading reconciliation...</Typography>
      </Container>
    );
  }

  if (!reconciliation) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">Reconciliation not found</Alert>
      </Container>
    );
  }

  const bankHasData = reconciliation.total_bank_transactions > 0;
  const ledgerHasData = reconciliation.total_ledger_transactions > 0;
  const bothFilesUploaded = bankHasData && ledgerHasData;

  const unmatchedBankIds = runMatching.data?.unmatched_bank_ids ?? [];
  const unmatchedLedgerIds = runMatching.data?.unmatched_ledger_ids ?? [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Reconciliation #{reconciliation.id}
            </Typography>
            <Chip
              label={reconciliation.status.toUpperCase()}
              size="medium"
              color={
                reconciliation.status === 'completed'
                  ? 'success'
                  : reconciliation.status === 'failed'
                  ? 'error'
                  : 'default'
              }
            />
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {matchRate}%
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Match Rate
            </Typography>
          </Box>
        </Box>

        {/* Action Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 3,
            bgcolor: 'grey.50',
            borderRadius: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {!bothFilesUploaded ? (
            <>
              <MuiButton
                variant="contained"
                color="primary"
                startIcon={<UploadCloud size={18} />}
                onClick={() => setOpenUpload(true)}
              >
                Upload Bank & Ledger Files
              </MuiButton>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Step 1: Upload bank statement and ledger CSV files.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Status: {bankHasData ? 'Bank file uploaded' : 'Bank file missing'} ·{' '}
                {ledgerHasData ? 'Ledger file uploaded' : 'Ledger file missing'}
              </Typography>
            </>
          ) : (
            <>
              <Chip label="Files Uploaded" color="success" />
              <MuiButton
                variant="contained"
                color="primary"
                startIcon={<Play size={18} />}
                onClick={handleRunMatching}
                disabled={runMatching.isLoading}
              >
                {runMatching.isLoading ? 'Running Matching…' : 'Run Matching Engine'}
              </MuiButton>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Step 2: Run the engine to compute matches, unmatched items, and anomalies.
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { fontWeight: 500, textTransform: 'none' },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
          }}
        >
          <Tab label="Summary & Transactions" />
          <Tab label={`Matches (${reconciliation.matched_count})`} />
          <Tab label={`Anomalies (${reconciliation.anomaly_count})`} />
        </Tabs>

        {/* Summary & Transactions */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                mb: 3,
              }}
            >
              <Chip
                label={`Bank Txns: ${reconciliation.total_bank_transactions}`}
                color="default"
              />
              <Chip
                label={`Ledger Txns: ${reconciliation.total_ledger_transactions}`}
                color="default"
              />
              <Chip label={`Matched: ${reconciliation.matched_count}`} color="success" />
              <Chip
                label={`Unmatched Bank: ${reconciliation.unmatched_bank_count}`}
                color="warning"
              />
              <Chip
                label={`Unmatched Ledger: ${reconciliation.unmatched_ledger_count}`}
                color="warning"
              />
            </Box>

            <TransactionsSplitView
              bankTransactions={txData?.bank_transactions || []}
              ledgerTransactions={txData?.ledger_transactions || []}
              unmatchedBankIds={unmatchedBankIds}
              unmatchedLedgerIds={unmatchedLedgerIds}
            />
          </Box>
        )}

        {/* Matches */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {matchesLoading && <LinearProgress sx={{ mb: 2 }} />}
            {matches.length === 0 ? (
              <Alert severity="info">
                {bothFilesUploaded
                  ? 'No matches yet. Click "Run Matching Engine" above to generate matches.'
                  : 'Upload both bank and ledger files, then run the matching engine to see results.'}
              </Alert>
            ) : (
              <MatchesTable matches={matches} />
            )}
          </Box>
        )}

        {/* Anomalies */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography>
                Per‑transaction anomaly details are not exposed yet; only the aggregated
                anomaly_count is available.
              </Typography>
            </Alert>
            <Typography>
              Total anomalies for this reconciliation:{' '}
              <strong>{reconciliation.anomaly_count}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Export Button */}
      {reconciliation.status === 'completed' && (
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <MuiButton variant="outlined" startIcon={<FileDown size={20} />} size="large">
            Export Reconciliation Report
          </MuiButton>
        </Box>
      )}

      <FileUploadDialog
        open={openUpload}
        reconciliationId={reconciliationId || 0}
        onClose={() => setOpenUpload(false)}
        onFilesUploaded={() => {
          // this component uses react-query hooks; after successful upload
          // those queries will typically be invalidated in the hook layer.
        }}
      />
    </Container>
  );
};

export default ReconciliationDetail;
