import { createContext } from 'react';

type SnackbarVariant = 'success' | 'error';

type InitialValues = {
  isOpen: boolean;
  onClose: () => void;
  openSnackbar: (newMessage: string, newVariant?: SnackbarVariant) => void;
  variant: SnackbarVariant;
  message: string;
};

const initialValues: InitialValues = {
  isOpen: false,
  variant: 'success',
  message: '',
  onClose: () => {},
  openSnackbar: (_newMessage: string) => {},
};

export const SnackbarContext = createContext(initialValues);
