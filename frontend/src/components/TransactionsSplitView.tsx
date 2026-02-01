import React from 'react';
import { Grid, Box, Typography, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BankTransaction, LedgerTransaction } from '../types/reconciliation';

interface Props {
  bankTransactions: BankTransaction[];
  ledgerTransactions: LedgerTransaction[];
  unmatchedBankIds?: number[];
  unmatchedLedgerIds?: number[];
}

const TransactionsSplitView: React.FC<Props> = ({
  bankTransactions,
  ledgerTransactions,
  unmatchedBankIds = [],
  unmatchedLedgerIds = [],
}) => {
  const bankColumns: GridColDef[] = [
    {
      field: 'transaction_date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) =>
        params.value ? new Date(params.value as string).toLocaleDateString() : '',
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={`PKR ${(params.value || 0).toLocaleString()}`}
          size="small"
          color={(params.value || 0) > 0 ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'is_matched',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Matched' : 'Unmatched'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  const ledgerColumns: GridColDef[] = [
    {
      field: 'transaction_date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) =>
        params.value ? new Date(params.value as string).toLocaleDateString() : '',
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
    {
      field: 'debit',
      headerName: 'Debit',
      width: 120,
      renderCell: (params) =>
        params.value && params.value > 0
          ? `PKR ${(params.value as number).toLocaleString()}`
          : '',
    },
    {
      field: 'credit',
      headerName: 'Credit',
      width: 120,
      renderCell: (params) =>
        params.value && params.value > 0
          ? `PKR ${(params.value as number).toLocaleString()}`
          : '',
    },
    {
      field: 'is_matched',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Matched' : 'Unmatched'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Bank Transactions
        </Typography>
        <DataGrid
          rows={bankTransactions}
          columns={bankColumns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-row.unmatched': {
              bgcolor: '#FEF2F2',
            },
          }}
          getRowClassName={(params) =>
            unmatchedBankIds.includes(params.row.id) ? 'unmatched' : ''
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Ledger Transactions
        </Typography>
        <DataGrid
          rows={ledgerTransactions}
          columns={ledgerColumns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-row.unmatched': {
              bgcolor: '#FEF2F2',
            },
          }}
          getRowClassName={(params) =>
            unmatchedLedgerIds.includes(params.row.id) ? 'unmatched' : ''
          }
        />
      </Grid>
    </Grid>
  );
};

export default TransactionsSplitView;
