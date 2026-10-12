import { Button, Typography } from '@mui/material';
import { styles } from './GroupJoin.styles';
import { useNavigate, useParams } from 'react-router-dom';
import { useLazyIsAuthenticatedQuery } from '../../../../api/auth/authApi';
import { useEffect } from 'react';
import { useJoinGroupMutation } from '../../../../api/group/groupApi';
import { paths } from '../../../../paths';
import { decodeInvite } from '../../../../utils/decodeInvite';
import { useErrorHandler } from '../../../../components/ErrorOverlay/useErrorHandler';
import {
  Background,
  GradientType,
} from '../../../../components/Background/Background';
import { Spinner } from '../../../../components/Spinner/Spinner';

export const GroupJoin = () => {
  const { inviteCode = '' } = useParams();
  const navigate = useNavigate();

  const { groupName, id, isInviteStructureValid } = decodeInvite(inviteCode);

  const [
    getIsAuthenticated,
    {
      isFetching: isAuthFetching,
      isSuccess: isAuthSuccess,
      isError: isAuthError,
    },
  ] = useLazyIsAuthenticatedQuery();

  const [
    joinGroup,
    {
      isSuccess: isJoinGroupSuccess,
      isError: isJoinGroupError,
      error: joinGroupError,
    },
  ] = useJoinGroupMutation();

  useErrorHandler({ isError: isJoinGroupError, error: joinGroupError });

  useEffect(() => {
    if (isAuthSuccess) {
      joinGroup({ inviteCode });
    }
  }, [isAuthSuccess]);

  useEffect(() => {
    if (isAuthError) {
      navigate(`${paths.login}?invite=${inviteCode}`);
    }
  }, [isAuthError]);

  useEffect(() => {
    if (isJoinGroupSuccess) {
      navigate(`${paths.group.build(Number(id))}?joined=true`);
    }
  }, [isJoinGroupSuccess]);

  const handleClick = () => {
    getIsAuthenticated();
  };

  return (
    <Background variant={GradientType.GRADIENT1} sx={styles.container}>
      {isInviteStructureValid ? (
        <>
          <Typography variant="h1" sx={styles.title}>
            {`Join "${groupName}"?`}
          </Typography>
          <Typography variant="body1" sx={styles.infoText}>
            To compete with this group's members, join the group.
          </Typography>
          <Button variant="contained" onClick={handleClick} sx={styles.button}>
            <Spinner isLoading={isAuthFetching}>Join Group</Spinner>
          </Button>
        </>
      ) : (
        <Typography variant="h1" sx={styles.title}>
          Invalid invitation link
        </Typography>
      )}
    </Background>
  );
};
