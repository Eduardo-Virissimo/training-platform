'use client';

import { Snackbar, Alert, AlertColor } from '@mui/material';
import { SnackbarMessage } from '@/hooks/use-snackbar';

interface SnackbarContainerProps {
  snackbars: SnackbarMessage[];
  onClose: (id: string) => void;
}

export function SnackbarContainer({ snackbars, onClose }: SnackbarContainerProps) {
  const getSeverityColor = (severity: string): AlertColor => {
    switch (severity) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <>
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => onClose(snackbar.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ marginBottom: snackbars.indexOf(snackbar) * 60 }}
        >
          <Alert
            onClose={() => onClose(snackbar.id)}
            severity={getSeverityColor(snackbar.severity)}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
