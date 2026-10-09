import { Snackbar, Alert, Typography } from '@mui/material';
import { useContext } from 'react';
import { SnackbarContext } from '../SnackbarContext/SnackbarContext';
import { styles } from './Toast.styles';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';

export const Toast = () => {
  const { isOpen, variant, message, onClose } = useContext(SnackbarContext);

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={4000}
      onClose={onClose}
      sx={styles.toast}
    >
      <Alert
        severity={variant}
        sx={styles.alert}
        icon={variant === 'error' ? <Error /> : <CheckCircle />}
      >
        <Typography variant="body1" sx={styles.message}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};
