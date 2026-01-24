import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Box,
  Typography,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/Button';
import { reconciliationService } from '../services/reconciliation';
import { CloudUpload, CircleCheck } from 'lucide-react';

// Simple classnames helper
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

interface Props {
  open: boolean;
  reconciliationId: number;
  onClose: () => void;
  onFilesUploaded: () => void;
}

export const FileUploadDialog: React.FC<Props> = ({
  open,
  reconciliationId,
  onClose,
  onFilesUploaded,
}) => {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [ledgerFile, setLedgerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setBankFile(acceptedFiles[0]);
        setError('');
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const ledgerDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setLedgerFile(acceptedFiles[0]);
        setError('');
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!bankFile || !ledgerFile) {
      setError('Please upload both bank statement and ledger files');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      await reconciliationService.uploadBankFile(reconciliationId, bankFile, {
        date_column: 'Date',
        amount_column: 'Amount',
        description_column: 'Description',
      });

      await reconciliationService.uploadLedgerFile(reconciliationId, ledgerFile, {
        date_column: 'Date',
        debit_column: 'Debit',
        credit_column: 'Credit',
        description_column: 'Description',
      });

      setSuccess(true);
      setTimeout(() => {
        onFilesUploaded();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        <CloudUpload size={24} />
        Upload Transaction Files
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CircleCheck className="w-8 h-8 text-green-600" />
            </div>
            <Typography variant="h6" gutterBottom>
              Files uploaded successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ready for matching analysis. Close this dialog to continue.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            {uploading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6">Uploading files...</Typography>
                <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Bank File Upload */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Bank Statement
                  </Typography>
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors',
                      isDragActive && 'border-blue-400 bg-blue-50',
                    )}
                  >
                    <input {...getInputProps()} />
                    {bankFile ? (
                      <div className="space-y-2">
                        <Chip
                          label={bankFile.name}
                          color="primary"
                          size="medium"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBankFile(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CloudUpload size={48} className="mx-auto mb-4 text-gray-400" />
                        <Typography variant="h6" gutterBottom>
                          Drop bank CSV/Excel or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supports .csv, .xlsx, .xls
                        </Typography>
                      </>
                    )}
                  </div>
                </Grid>

                {/* Ledger File Upload */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Ledger File
                  </Typography>
                  <div
                    {...ledgerDropzone.getRootProps()}
                    className={cn(
                      'border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors',
                      ledgerDropzone.isDragActive && 'border-blue-400 bg-blue-50',
                    )}
                  >
                    <input {...ledgerDropzone.getInputProps()} />
                    {ledgerFile ? (
                      <div className="space-y-2">
                        <Chip
                          label={ledgerFile.name}
                          color="success"
                          size="medium"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLedgerFile(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CloudUpload size={48} className="mx-auto mb-4 text-gray-400" />
                        <Typography variant="h6" gutterBottom>
                          Drop ledger CSV/Excel or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Must have Date, Debit, Credit columns
                        </Typography>
                      </>
                    )}
                  </div>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!bankFile || !ledgerFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Files & Analyze'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
