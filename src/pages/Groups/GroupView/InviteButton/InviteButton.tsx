import { ContentCopy } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { styles } from './InviteButton.styles';

interface InviteButtonProps {
  shouldShow: boolean;
  copyLink: () => void;
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  copyLink,
  shouldShow,
}) =>
  shouldShow ? (
    <Box sx={styles.container}>
      <Button
        fullWidth
        sx={styles.invitationLinkButton}
        onClick={copyLink}
        variant="contained"
      >
        <ContentCopy sx={styles.copyIcon} />
        Copy invite link
      </Button>
      <Typography variant="body1" sx={styles.invitationLinkInstructions}>
        Copy invite link and share it with your friends so they can join this
        group.
      </Typography>
    </Box>
  ) : null;
