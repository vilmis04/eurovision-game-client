import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HomePaths, paths } from '../../paths';
import { createContext, useEffect, useState } from 'react';
import { styles } from './Layout.styles';
import {
  GroupsActiveIcon,
  GroupsIcon,
  LeaderboardActiveIcon,
  LeaderboardIcon,
  VotingActiveIcon,
  VotingIcon,
} from '../icons/icons';
import { Toast } from '../Toast/Toast';
import { ErrorOverlay } from '../ErrorOverlay/ErrorOverlay';
import { Background, GradientType } from '../Background/Background';

export const BackgroundContext = createContext((_variant: GradientType) => {});

export const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [gradient, setGradient] = useState(GradientType.GRADIENT1);
  const selectBackground = (variant: GradientType) => setGradient(variant);

  const [rootPath] = pathname.slice(1).split('/');

  useEffect(() => {
    if (pathname === paths.home) {
      navigate(paths.voting);
    }
  }, []);

  const currentTab = {
    [HomePaths.GROUPS]: 0,
    [HomePaths.VOTING]: 1,
    [HomePaths.LEADERBOARD]: 2,
  }[rootPath];

  const navConfig = [
    {
      label: 'Groups',
      icon: <GroupsIcon />,
      activeIcon: <GroupsActiveIcon />,
      path: paths.groups,
    },
    {
      label: 'Voting',
      icon: <VotingIcon />,
      activeIcon: <VotingActiveIcon />,
      path: paths.voting,
    },
    {
      label: 'Leaders',
      icon: <LeaderboardIcon />,
      activeIcon: <LeaderboardActiveIcon />,
      path: paths.leaderboard,
    },
  ];

  return (
    <BackgroundContext.Provider value={selectBackground}>
      <Background variant={gradient}>
        <Box sx={styles.outlet}>
          <Outlet />
        </Box>
        <BottomNavigation showLabels value={currentTab} sx={styles.navbar}>
          {navConfig.map(({ icon, activeIcon, label, path }, index) => {
            const isActive = currentTab === index;

            return (
              <BottomNavigationAction
                sx={isActive ? styles.active : styles.default}
                key={label}
                label={label}
                icon={isActive ? activeIcon : icon}
                onClick={() => navigate(path)}
                disableRipple
              />
            );
          })}
        </BottomNavigation>
        <Toast />
        <ErrorOverlay />
      </Background>
    </BackgroundContext.Provider>
  );
};
