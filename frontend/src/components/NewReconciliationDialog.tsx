import { FileText } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, Box, CircularProgress
} from '@mui/material';
import { BankAccount } from './../types/reconciliation';
import { Button } from './ui/Button';
import { reconciliationService } from './../services/reconciliation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Props {
  open: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onCreated: () => void;
}

const steps = ['Select Bank Account', 'Set Date Range', 'Review & Create'];

const NewReconciliationDialog: React.FC<Props> = ({
  open, onClose, bankAccounts, onCreated
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [bankAccountId, setBankAccountId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (activeStep === 0 && !bankAccountId) {
      setError('Please select a bank account');
      return;
    }
    if (activeStep === 1 && (!startDate || !endDate)) {
      setError('Please select date range');
      return;
    }
    setActiveStep(activeStep + 1);
    setError('');
  };

  const handleCreate = async () => {
    if (!bankAccountId || !startDate || !endDate) return;
    
    setLoading(true);
    setError('');
    
    try {
      await reconciliationService.createReconciliation({
        bank_account_id: parseInt(bankAccountId),
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0]
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reconciliation');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <select
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select bank account</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_name} ({account.bank_name})
                </option>
              ))}
            </select>
          </Box>
        );
      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2, gap: 2, display: 'flex', flexDirection: 'column' }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
          </LocalizationProvider>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between">
                <span>Bank Account:</span>
                <span className="font-medium">
                  {bankAccounts.find(a => a.id === parseInt(bankAccountId))?.account_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Period:</span>
                <span className="font-medium">
                  {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        <FileText size={20} />
        New Reconciliation
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <div className="mt-6">
          {getStepContent(activeStep)}
        </div>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCreate}
            disabled={loading || !bankAccountId || !startDate || !endDate}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : (
              'Create Reconciliation'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewReconciliationDialog;
