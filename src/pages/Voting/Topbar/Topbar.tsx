import { ExpandMore } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { styles } from './Topbar.styles';
import { GameType } from '../../../types';

interface TopbarProps {
  gameType: GameType | undefined;
  selected: number | undefined;
  endTime: Date | undefined;
  timeLeft: string;
  toggleOrderDrawer: () => void;
  countryLimit: number | undefined;
}

const SEMI_LIMIT = 10;
const FINAL_LIMIT = 26;

export const Topbar: React.FC<TopbarProps> = ({
  gameType,
  selected = 0,
  endTime,
  timeLeft,
  toggleOrderDrawer,
  countryLimit = FINAL_LIMIT,
}) => {
  const gameTypeMessage =
    (gameType &&
      {
        [GameType.SEMI1]: '1st semi-final',
        [GameType.SEMI2]: '2nd semi-final',
        [GameType.FINAL]: 'Final',
      }[gameType]) ||
    '';

  const getEndTimeMessage = (endTime: Date | undefined) => {
    const timeString = timeLeft ? 'Time left ' : 'Voting ended';
    return endTime ? timeString : '';
  };

  const selectionLimit = gameType === GameType.FINAL ? countryLimit : SEMI_LIMIT;

  return (
    <Box>
      <Box sx={styles.topRow}>
        <Typography variant="body1" sx={styles.mediumText}>
          {gameTypeMessage}
        </Typography>
        <Box sx={[styles.timer, Boolean(timeLeft) && styles.runningTimer]}>
          <Typography variant="body1" sx={styles.timeMessage}>
            {getEndTimeMessage(endTime)}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            sx={[styles.mediumText, styles.time]}
          >
            {timeLeft.split('').map((char, index) => (
              <Box key={index} sx={[char !== ':' && styles.digit]}>
                {char}
              </Box>
            ))}
          </Typography>
        </Box>
      </Box>
      <Box sx={styles.bottomRow}>
        <Button variant="text" sx={styles.button} onClick={toggleOrderDrawer}>
          Order
          <ExpandMore />
        </Button>
        <Typography variant="body1" sx={styles.lightText}>
          {`${selected} / ${selectionLimit} selected`}
        </Typography>
      </Box>
    </Box>
  );
};
