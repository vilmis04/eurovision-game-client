import { ArrowBack, MoreVert } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { getStyles } from './Navbar.styles';

interface INavbarProps {
  handleBack: () => void;
  handleMore: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  groupName: string;
  titleOpacity: number;
}

export const Navbar: React.FC<INavbarProps> = ({
  handleBack,
  handleMore,
  groupName,
  titleOpacity,
}) => {
  const styles = getStyles(titleOpacity);

  return (
    <Box sx={[styles.nav, titleOpacity === 1 && styles.navDivider]}>
      <ArrowBack sx={styles.icon} onClick={handleBack} />
      <Typography sx={styles.groupName} variant="body1">
        {groupName}
      </Typography>
      <MoreVert sx={styles.icon} onClick={handleMore} />
    </Box>
  );
};
