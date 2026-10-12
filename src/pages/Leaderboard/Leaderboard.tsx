import { Box, Button, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { BackgroundContext } from '../../components/Layout/Layout';
import { ExpandMore } from '@mui/icons-material';
import { styles } from './Leaderboard.styles';
import { useGetLeaderboardQuery } from '../../api/group/groupApi';
import { BronzeStar, GoldStar, SilverStar } from '../../components/icons/icons';
import { FilterSelectDrawer } from './FilterSelectDrawer/FilterSelectDrawer';
import { NoResults } from './NoResults/NoResults';
import { useErrorHandler } from '../../components/ErrorOverlay/useErrorHandler';
import { GradientType } from '../../components/Background/Background';
import { Spinner } from '../../components/Spinner/Spinner';

export const Leaderboard = () => {
  const setBackground = useContext(BackgroundContext);
  useEffect(() => {
    setBackground(GradientType.GRADIENT2);
  }, []);

  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [filter, setFilter] = useState(0);
  const {
    data: leaderboardData,
    isLoading,
    isError,
    error,
  } = useGetLeaderboardQuery(filter, { pollingInterval: 15 * 1000 });

  useErrorHandler({ isError, error });

  const toggleGroupMenu = () => setIsGroupMenuOpen((isOpen) => !isOpen);
  const selectedGroup = leaderboardData?.groups[filter];

  const ranking = [<GoldStar />, <SilverStar />, <BronzeStar />];
  const showRanking =
    leaderboardData &&
    Object.values(leaderboardData.playerList).some(({ score }) => score !== 0);

  return (
    <Spinner isLoading={isLoading}>
      <>
        <Box sx={styles.container}>
          <Box sx={styles.topBar}>
            <Button
              variant="text"
              sx={styles.groupSelectionButton}
              onClick={toggleGroupMenu}
            >
              <Typography variant="body1" sx={styles.buttonText}>
                {filter ? selectedGroup : 'All'}
              </Typography>
              <ExpandMore />
            </Button>
          </Box>
          {!showRanking ? (
            <NoResults />
          ) : (
            <Box sx={styles.memberList}>
              {(leaderboardData?.playerList || []).map(
                ({ name, score, position }) => (
                  <Box key={name} sx={styles.playerNameBox}>
                    <Typography variant="body1" sx={styles.positionNumber}>
                      {position}
                    </Typography>
                    <Box sx={styles.playerTextContainer}>
                      <Typography variant="body1" sx={styles.playerName}>
                        {name}
                      </Typography>
                      <Typography variant="body1" sx={styles.playerScore}>
                        {score} points
                      </Typography>
                    </Box>
                    <Box sx={styles.ranking}>
                      {showRanking && ranking[position - 1]}
                    </Box>
                  </Box>
                )
              )}
            </Box>
          )}
        </Box>
        <FilterSelectDrawer
          filter={filter}
          setFilter={setFilter}
          leaderboardData={leaderboardData}
          isOpen={isGroupMenuOpen}
          toggleOpen={toggleGroupMenu}
        />
      </>
    </Spinner>
  );
};
