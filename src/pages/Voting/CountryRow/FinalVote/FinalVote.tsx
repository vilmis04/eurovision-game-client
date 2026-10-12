import { Box, Button, Typography } from '@mui/material';
import { FinalVoteProps } from '../CountryRow.types';
import { ExpandMore } from '@mui/icons-material';
import { styles } from './FinalVote.styles';

export const FinalVote: React.FC<FinalVoteProps> = ({
  position,
  openModal,
  isVotingActive,
}) => {
  return (
    <Box>
      <Typography variant="body1" sx={styles.message}>
        Select place
      </Typography>
      <Button
        variant="contained"
        sx={[styles.button, !isVotingActive && styles.disabledButton]}
        onClick={openModal}
        disabled={!isVotingActive}
      >
        <Typography variant="body1">{position || ''}</Typography>
        {isVotingActive && <ExpandMore />}
      </Button>
    </Box>
  );
};
