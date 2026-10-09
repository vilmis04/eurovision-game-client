import {
  useCreateInvitationLinkMutation,
  useDeleteGroupMutation,
  useGetGroupQuery,
} from '../../../api/group/groupApi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { styles } from './GroupView.styles';
import { paths } from '../../../paths';
import { SnackbarContext } from '../../../components/SnackbarContext/SnackbarContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { BackgroundContext } from '../../../components/Layout/Layout';
import { ContextMenu } from './ContextMenu/ContextMenu';
import { DeleteDialog } from './DeleteDialog/DeleteDialog';
import { AuthContext } from '../../../components/Auth/Auth';
import { InviteButton } from './InviteButton/InviteButton';
import { Navbar } from './Navbar/Navbar';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver/useIntersectionObserver';
import { MemberList } from './MemberList/MemberList';
import { useErrorHandler } from '../../../components/ErrorOverlay/useErrorHandler';
import { Spinner } from '../../../components/Spinner/Spinner';
import { GradientType } from '../../../components/Background/Background';

export const GroupView = () => {
  const { id: idString } = useParams();
  const id = Number(idString);
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('isNew');
  const joined = searchParams.get('joined');

  const navigate = useNavigate();
  const { openSnackbar } = useContext(SnackbarContext);
  const selectGradient = useContext(BackgroundContext);
  const username = useContext(AuthContext);

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [navbarTitleOpacity, setNavbarTitleOpacity] = useState(0);
  const inviteLinkRef = useRef<string>('');

  const observerRef = 'observerRef';

  const {
    data: groupList,
    isFetching,
    isError: isGetGroupError,
    error: getGroupError,
  } = useGetGroupQuery({ id }, { skip: !id });

  const [
    deleteGroup,
    {
      isSuccess: isDeleteGroupSuccess,
      isError: isDeleteError,
      error: deleteError,
    },
  ] = useDeleteGroupMutation();
  const [
    createInviteLink,
    { isError: isCreateLinkError, error: createLinkError },
  ] = useCreateInvitationLinkMutation();

  const isError = isDeleteError || isCreateLinkError || isGetGroupError;
  const error = deleteError || createLinkError || getGroupError;
  useErrorHandler({ isError, error });

  useIntersectionObserver({
    action: (entry) => {
      const opacity = 1 - (entry.intersectionRatio - 0.4) / 0.2;
      setNavbarTitleOpacity(opacity > 1 ? 1 : opacity);
    },
    domStatus: Boolean(groupList?.length),
    getObservables: () => {
      const element = document.querySelector(`[data-ref="${observerRef}"]`);

      return element ? [element] : null;
    },
    options: { threshold: { max: 0.6, min: 0.4 } },
  });

  useEffect(() => {
    createInviteLink({ id }).then((res) => {
      const linkCode = res && 'data' in res ? res.data : ''; // returns either data or error. Error is handled with useErrorHandler
      const { origin } = window.location;
      inviteLinkRef.current = `${origin}/groups/join/${linkCode}`;
    });
  }, []);

  useEffect(() => {
    if (isDeleteGroupSuccess) {
      openSnackbar(`Group "${group.name}" deleted.`);
      navigate(paths.groups);
    }
  }, [isDeleteGroupSuccess]);

  useEffect(() => {
    selectGradient(GradientType.GRADIENT2);
  }, []);

  useEffect(() => {
    joined && openSnackbar("You've joined the group.");
  }, [joined]);

  useEffect(() => {
    isNew && openSnackbar('Group created.');
  }, [isNew]);

  if (!groupList?.length) {
    return <Spinner isLoading />;
  }
  const [group] = groupList ?? [];
  const isOwner = username === group.owner;

  const toggleContextMenu = () => setIsContextMenuOpen((isOpen) => !isOpen);
  const toggleDeleteDialog = () => setIsDeleteDialogOpen((isOpen) => !isOpen);

  const handleDelete = () => {
    deleteGroup({ id });
  };
  const handleBack = () => navigate(paths.groups);
  const handleMore = () => {
    toggleContextMenu();
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(inviteLinkRef.current)
      .then(() => {
        openSnackbar(`Invite link copied.`);
      })
      .catch(() => {
        openSnackbar(`Failed to copy invite link.`, 'error');
      });
  };

  return (
    <Spinner isLoading={!groupList?.length}>
      <>
        <Box sx={styles.container}>
          <Navbar
            handleBack={handleBack}
            handleMore={handleMore}
            groupName={group.name}
            titleOpacity={navbarTitleOpacity}
          />
          <MemberList
            isFetching={isFetching}
            groupName={group.name}
            members={group.members}
            groupNameRefName={observerRef}
          />
          <InviteButton copyLink={copyLink} shouldShow={isOwner} />
        </Box>
        <ContextMenu
          isOwner={isOwner}
          copyLink={copyLink}
          deleteGroup={toggleDeleteDialog}
          open={isContextMenuOpen}
          onClose={toggleContextMenu}
        />
        <DeleteDialog
          open={isDeleteDialogOpen}
          deleteGroup={handleDelete}
          handleClose={toggleDeleteDialog}
        />
      </>
    </Spinner>
  );
};
