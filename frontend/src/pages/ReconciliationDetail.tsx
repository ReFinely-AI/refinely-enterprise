import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Tabs, Tab, Chip, Grid,
  Card, CardContent, LinearProgress, Alert, Button
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../contexts/AuthContext';
import { reconciliationService } from '../services/reconciliation';
import { Reconciliation, Transaction } from '../../types/reconciliation';
import { FileUploadDialog } from '../components/FileUploadDialog';
import { Export } from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <Box sx={{ display: value === index ? 'block' : 'none' }}>
      {children}
    </Box>
  );
};

const ReconciliationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);

  const [bankTransactions, setBankTransactions] = useState<Transaction[]>([]);
  const [ledgerTransactions, setLedgerTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (id) {
      loadReconciliation(parseInt(id));
    }
  }, [id]);

  const loadReconciliation = async (reconId: number) => {
    try {
      const data = await reconciliationService.getReconciliation(reconId);
      setReconciliation(data);
    } catch (error) {
      console.error('Failed to load reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const matchRate = reconciliation 
    ? Math.round((reconciliation.matched_count / reconciliation.total_bank_transactions) * 100)
    : 0;

  const bankColumns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 120, renderCell: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={`PKR ${params.value.toLocaleString()}`}
          size="small"
          color={params.value > 0 ? 'success' : 'error'}
        />
      )
    },
    { 
      field: 'is_matched', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Matched' : 'Unmatched'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      )
    }
  ];

  const ledgerColumns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'debit', 
      headerName: 'Debit', 
      width: 100,
      renderCell: (params) => params.value > 0 ? `PKR ${params.value.toLocaleString()}` : ''
    },
    { 
      field: 'credit', 
      headerName: 'Credit', 
      width: 100,
      renderCell: (params) => params.value > 0 ? `PKR ${params.value.toLocaleString()}` : ''
    },
    { field: 'is_matched', headerName: 'Status', width: 100 }
  ];

  if (loading) {
    return (
      <Container sx={{ mt: 8 }}>
        <LinearProgress />
        <Typography>Loading reconciliation...</Typography>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Reconciliation #{reconciliation.id}
            </Typography>
            <Chip label={reconciliation.status.toUpperCase()} size="medium" />
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
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          p: 3, 
          bgcolor: 'grey.50', 
          borderRadius: '12px',
          alignItems: 'center'
        }}>
          {reconciliation.status === 'pending' && !filesUploaded ? (
            <>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setOpenUpload(true)}
              >
                Upload Bank & Ledger Files
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Step 1 of 3: Upload transaction files to begin matching
              </Typography>
            </>
          ) : (
            <>
              <Chip label="Files Uploaded" color="success" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ready for matching analysis
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
            '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 }
          }}
        >
          <Tab label={`Bank (${reconciliation.total_bank_transactions})`} />
          <Tab label={`Ledger (${reconciliation.total_ledger_transactions})`} />
          <Tab label={`Matches (${reconciliation.matched_count})`} />
          <Tab label={`Anomalies (${reconciliation.anomaly_count})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DataGrid
            rows={bankTransactions}
            columns={bankColumns}
            getRowId={(row) => row.id}
            sx={{ border: 'none', '& .MuiDataGrid-row:hover': { bgcolor: '#F8FAFC' } }}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25, 50]}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataGrid
            rows={ledgerTransactions}
            columns={ledgerColumns}
            getRowId={(row) => row.id}
            sx={{ border: 'none' }}
            disableRowSelectionOnClick
            autoHeight
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography>🧠 Matching engine will populate this table after analysis</Typography>
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography>🔍 Anomaly detection will show potential issues here</Typography>
          </Alert>
        </TabPanel>
      </Paper>

      {/* Export Button */}
      {reconciliation.status === 'completed' && (
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button 
            variant="secondary" 
            startIcon={<Export size={20} />}
            size="lg"
          >
            Export Reconciliation Report
          </Button>
        </Box>
      )}

      <FileUploadDialog
        open={openUpload}
        reconciliationId={parseInt(id || '0')}
        onClose={() => setOpenUpload(false)}
        onFilesUploaded={() => {
          setFilesUploaded(true);
          loadReconciliation(parseInt(id || '0'));
        }}
      />
    </Container>
  );
};

export default ReconciliationDetail;
