import { Box, Button, Dialog, DialogProps, Typography } from '@mui/material';
import { styles } from './DeleteDialog.styles';

interface DeleteDialogProps extends DialogProps {
  deleteGroup: () => void;
  handleClose: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open: isOpen,
  deleteGroup,
  handleClose,
}) => (
  <Dialog open={isOpen} onClose={handleClose} sx={styles.dialog}>
    <Typography variant="body1" sx={[styles.text, styles.title]}>
      Delete group?
    </Typography>
    <Typography variant="body1" sx={[styles.text, styles.mainText]}>
      The group can't be recovered once it's deleted.
    </Typography>
    <Box sx={styles.buttonWrapper}>
      <Button onClick={handleClose} variant="text" sx={styles.cancelButton}>
        <Typography variant="body1">Cancel</Typography>
      </Button>
      <Button onClick={deleteGroup} sx={styles.deleteButton}>
        <Typography variant="body1">Delete</Typography>
      </Button>
    </Box>
  </Dialog>
);
