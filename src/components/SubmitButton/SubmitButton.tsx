import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { styles } from './SubmitButton.styles';
import { ErrorOutline } from '@mui/icons-material';
import { Spinner } from '../Spinner/Spinner';

interface SubmitButtonProps extends React.PropsWithChildren, ButtonProps {
  isLoading: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  isDisabled,
  children,
  variant = 'contained',
  isError,
  errorMessage = '',
  ...props
}) => (
  <Box sx={styles.container}>
    <Box component="span" sx={styles.errorContainer}>
      {isError && errorMessage && (
        <>
          <ErrorOutline sx={styles.icon} />
          {errorMessage}
        </>
      )}
    </Box>
    <Button
      {...props}
      type="submit"
      variant={variant}
      disabled={isDisabled}
      fullWidth
    >
      <Spinner color="secondary" isLoading={isLoading} size={24}>
        <Typography variant="body1" sx={styles.label}>
          {children}
        </Typography>
      </Spinner>
    </Button>
  </Box>
);
