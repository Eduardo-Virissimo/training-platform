import { useState, useRef } from 'react';

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  open: boolean;
}

export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const counterRef = useRef(0);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = `snackbar-${counterRef.current++}`;
    const newSnackbar: SnackbarMessage = {
      id,
      message,
      severity,
      open: true,
    };

    setSnackbars((prev) => [...prev, newSnackbar]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      closeSnackbar(id);
    }, 5000);
  };

  const closeSnackbar = (id: string) => {
    setSnackbars((prev) =>
      prev.map((snackbar) => (snackbar.id === id ? { ...snackbar, open: false } : snackbar))
    );

    // Remove from array after animation
    setTimeout(() => {
      setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
    }, 300);
  };

  return {
    snackbars,
    showSnackbar,
    closeSnackbar,
  };
}
