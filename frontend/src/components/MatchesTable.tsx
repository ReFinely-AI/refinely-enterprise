import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Match } from '../types/reconciliation';

interface Props {
  matches: Match[];
}

const MatchesTable: React.FC<Props> = ({ matches }) => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'match_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value === 'exact' ? 'success' : 'warning'}
          variant={params.value === 'exact' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">
          {(Number(params.value) * 100).toFixed(1)}%
        </Typography>
      ),
    },
    {
      field: 'bank_transaction_id',
      headerName: 'Bank Txn ID',
      width: 130,
    },
    {
      field: 'ledger_transaction_id',
      headerName: 'Ledger Txn ID',
      width: 140,
    },
    {
      field: 'audit_trail',
      headerName: 'Rule / Details',
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        const audit = params.value || {};
        const rule = audit.rule || '—';
        const bankAmount = audit.bank_amount;
        const ledgerAmount = audit.ledger_amount;
        const bankDate = audit.bank_date;
        const ledgerDate = audit.ledger_date;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Rule: {rule}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {bankAmount !== undefined && ledgerAmount !== undefined
                ? `Bank: ${bankAmount} • Ledger: ${ledgerAmount}`
                : null}
              {bankDate && ledgerDate
                ? ` | Dates: ${new Date(bankDate).toLocaleDateString()} ↔ ${new Date(
                    ledgerDate,
                  ).toLocaleDateString()}`
                : null}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={matches}
        columns={columns}
        getRowId={(row) => row.id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{ border: 'none' }}
      />
    </Box>
  );
};

export default MatchesTable;
