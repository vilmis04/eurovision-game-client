import { ContentCopy, DeleteOutline, Logout } from '@mui/icons-material';
import { Drawer, DrawerProps, MenuItem, Typography } from '@mui/material';
import { styles } from './ContextMenu.styles';
import { useLogoutMutation } from '../../../../api/auth/authApi';
import { useEffect } from 'react';
import { useErrorHandler } from '../../../../components/ErrorOverlay/useErrorHandler';

interface ContextMenuProps extends DrawerProps {
  copyLink: () => void;
  deleteGroup: () => void;
  isOwner: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  open: isOpen,
  onClose,
  copyLink,
  deleteGroup,
  isOwner,
}) => {
  const [logout, { isSuccess: isLogoutSuccess, isError, error }] =
    useLogoutMutation();

  useErrorHandler({ isError, error });

  useEffect(() => {
    if (isLogoutSuccess) {
      window.location.reload();
    }
  }, [isLogoutSuccess]);

  const handleClose = () => {
    onClose?.({}, 'escapeKeyDown'); // default on close func requires close reason
  };

  const handleCopyLink = () => {
    copyLink();
    handleClose();
  };

  const handleDeleteGroup = () => {
    deleteGroup();
    handleClose();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor="bottom"
      PaperProps={{ sx: styles.menu }}
    >
      {...isOwner
        ? [
            <MenuItem onClick={handleCopyLink}>
              <Typography variant="body1" sx={styles.row}>
                <ContentCopy />
                Copy invite link
              </Typography>
            </MenuItem>,
            <MenuItem onClick={handleDeleteGroup}>
              <Typography variant="body1" sx={styles.row}>
                <DeleteOutline /> Delete Group
              </Typography>
            </MenuItem>,
          ]
        : []}
      <MenuItem onClick={handleLogout}>
        <Typography variant="body1" sx={styles.row}>
          <Logout /> Logout
        </Typography>
      </MenuItem>
    </Drawer>
  );
};
