import { Box, Typography } from '@mui/material';
import { styles } from './CountryRow.styles';
import { FinalVote } from './FinalVote/FinalVote';
import { SemiVote } from './SemiVote/SemiVote';
import { CountryRowProps } from './CountryRow.types';
import { memo } from 'react';
import { GameType, UpdateScoreRequestBody } from '../../../types';

export const CountryRow: React.FC<CountryRowProps> = memo(function CountryRow({
  artist,
  code,
  name,
  song,
  gameType,
  inFinal,
  position,
  updateScore,
  isSemiSpotAvailable,
  openVotingModal,
  isVotingActive,
}) {
  const isFinal = gameType === GameType.FINAL;
  const isSelected = isFinal ? position : inFinal;

  const handleUpdateScore = (body: Partial<UpdateScoreRequestBody>) => {
    updateScore({ country: name, inFinal, position, ...body });
  };

  const openModal = () => {
    openVotingModal(code);
  };

  const voteInput = isFinal ? (
    <FinalVote
      position={position}
      openModal={openModal}
      isVotingActive={isVotingActive}
    />
  ) : (
    <SemiVote
      inFinal={inFinal}
      updateScore={handleUpdateScore}
      isDisabled={!(isSemiSpotAvailable && isVotingActive)}
      isVotingActive={isVotingActive}
    />
  );

  return (
    <Box sx={[styles.container, Boolean(isSelected) && styles.selected]}>
      <Box sx={styles.countryInfo}>
        <Box component="img" src={`flags/${code}.svg`} sx={styles.flag} />
        <Box sx={styles.textWrapper}>
          <Typography variant="body1" sx={styles.name}>
            {name}
          </Typography>
          <Typography variant="body1" sx={styles.artist}>
            {artist}
          </Typography>
          <Typography variant="body1" sx={styles.song}>
            {song}
          </Typography>
        </Box>
      </Box>
      {voteInput}
    </Box>
  );
});
