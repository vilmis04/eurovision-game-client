import { Drawer, Box, Typography, Button } from '@mui/material';
import { CountryResponse } from '../../../api/country/countryApi.types';
import { useContext, useEffect, useState } from 'react';
import { styles } from './FinalVoteDrawer.styles';
import { ErrorContext } from '../../../components/ErrorOverlay/ErrorContext';
import { GetScoresResponse } from '../../../types';

interface FinalVoteDrawerProps {
  handleClose: () => void;
  updateScore: (score: GetScoresResponse) => void;
  notAvailableSpots: number[];
  countryCode: string | null;
  votingScore: GetScoresResponse | undefined;
  votingCountry: CountryResponse | undefined;
  countryLimit: number | undefined;
}

export const FinalVoteDrawer: React.FC<FinalVoteDrawerProps> = ({
  countryCode,
  handleClose,
  updateScore,
  notAvailableSpots,
  votingScore,
  votingCountry,
  countryLimit = 26,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  const { setErrorMessage } = useContext(ErrorContext);

  useEffect(() => {
    if (votingScore) {
      setSelectedPosition(votingScore.position);
    }
  }, [countryCode]);

  const handleUpdateScore = () => {
    if (votingScore) {
      updateScore({ ...votingScore, position: selectedPosition });
      handleClose();
    } else {
      setErrorMessage('scores failed to load');
    }
  };

  return (
    <Drawer
      open={Boolean(countryCode)}
      anchor="bottom"
      PaperProps={{ sx: styles.container }}
      onClose={handleClose}
    >
      <Box sx={styles.topBar}>
        <Box
          component="img"
          src={`flags/${countryCode}.svg`}
          sx={styles.flag}
        />
        <Box sx={styles.countryInfoWrapper}>
          <Typography variant="body1" sx={styles.countryName}>
            {votingCountry?.name}
          </Typography>
          <Typography variant="body1" sx={styles.label}>
            Select place
          </Typography>
        </Box>
      </Box>
      <Box sx={styles.voteGrid}>
        {Array(countryLimit)
          .fill(null)
          .map((_, index) => {
            const positionIndex = index + 1;
            const isSelected = positionIndex === selectedPosition;
            const isOccupied = notAvailableSpots
              .filter((spot) => spot !== votingScore?.position)
              .includes(positionIndex);
            const variant = isSelected ? 'contained' : 'text';

            return (
              <Button
                key={index}
                disableRipple
                variant={variant}
                onClick={() =>
                  setSelectedPosition(
                    positionIndex === selectedPosition ? 0 : positionIndex
                  )
                }
                disabled={isOccupied}
                sx={[
                  isOccupied && styles.isOccupied,
                  isSelected && styles.selected,
                  variant === 'text' && styles.textVariant,
                ]}
              >
                {positionIndex}
              </Button>
            );
          })}
      </Box>
      <Box sx={styles.buttonContainer}>
        <Button
          variant="text"
          sx={[styles.textVariant, styles.cancelButton]}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleUpdateScore}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
};
