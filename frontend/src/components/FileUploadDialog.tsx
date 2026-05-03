import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, X, FileText, CheckCircle2 } from 'lucide-react';
import { reconciliationService } from '../services/reconciliation';
import { cn } from '../utils';

interface Props {
  open: boolean;
  reconciliationId: number;
  type: 'bank' | 'ledger';
  onClose: () => void;
  onSuccess: () => void;
}

const FileUploadDialog: React.FC<Props> = ({
  open, reconciliationId, type, onClose, onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'ledger'>(type);

  useEffect(() => {
    if (open) {
      setActiveTab(type);
      setFile(null);
      setError('');
      setSuccess(false);
    }
  }, [open, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
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
    if (!file) { setError('Please select a file'); return; }
    setUploading(true);
    setError('');
    try {
      if (activeTab === 'bank') {
        await reconciliationService.uploadBankFile(reconciliationId, file, {
          date_column: 'Date',
          amount_column: 'Amount',
          description_column: 'Description',
        });
      } else {
        await reconciliationService.uploadLedgerFile(reconciliationId, file, {
          date_column: 'Date',
          debit_column: 'Debit',
          credit_column: 'Credit',
          description_column: 'Description',
        });
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setFile(null);
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Upload failed. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[560px] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <CloudUpload size={18} className="text-brand-500" />
            <h2 className="text-lg font-bold text-surface-900">Upload Files</h2>
          </div>
          <button onClick={handleClose} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 px-6">
          {(['bank', 'ledger'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setFile(null); setError(''); }}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-[3px] transition-colors -mb-px',
                activeTab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-700',
              )}
            >
              {t === 'bank' ? 'Bank Statement' : 'Ledger File'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={28} className="text-success-500" />
              </div>
              <p className="text-base font-semibold text-surface-800">File uploaded successfully!</p>
              <p className="text-sm text-surface-400 mt-1">Closing...</p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                  isDragActive
                    ? 'border-brand-500 bg-brand-50'
                    : file
                    ? 'border-success-400 bg-success-50/30'
                    : 'border-surface-300 hover:border-brand-400 hover:bg-surface-50',
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="text-success-500" />
                    <p className="text-sm font-semibold text-surface-800">{file.name}</p>
                    <p className="text-xs text-surface-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-danger-500 hover:text-danger-600 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <CloudUpload size={36} className="text-surface-400" />
                    <p className="text-sm font-medium text-surface-700">
                      Drag & drop your{' '}
                      {activeTab === 'bank' ? 'bank statement' : 'ledger file'} here
                    </p>
                    <p className="text-xs text-surface-400">
                      or{' '}
                      <span className="text-brand-500 font-medium">browse files</span>
                    </p>
                    <p className="text-xs text-surface-400 mt-1">Supports .csv, .xlsx, .xls · Max 10MB</p>
                  </div>
                )}
              </div>

              {/* Column hints */}
              <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                <p className="text-xs font-semibold text-surface-600 mb-1.5">
                  Required columns in your {activeTab === 'bank' ? 'bank statement' : 'ledger file'}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(activeTab === 'bank'
                    ? ['Date', 'Amount', 'Description', 'Reference (optional)']
                    : ['Date', 'Debit', 'Credit', 'Description (optional)']
                  ).map((col) => (
                    <span key={col} className="text-xs px-2 py-0.5 bg-white border border-surface-200 rounded-md text-surface-600 font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-200">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : 'Upload & Save →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadDialog;
