const INVITE_INFO_LIST_LENGTH = 4;

const INVALID_INVITE = {
  isInviteStructureValid: false,
  groupName: '',
  id: NaN,
};

export const decodeInvite = (invite: string | null) => {
  try {
    const inviteData = window.atob(invite ?? '').split(':');
    const [groupName, , rawId] = inviteData;
    const id = Number(rawId);
    const isInviteStructureValid =
      inviteData.length === INVITE_INFO_LIST_LENGTH &&
      Number.isInteger(id) &&
      id > 0;

    return isInviteStructureValid
      ? { isInviteStructureValid, groupName, id }
      : INVALID_INVITE;
  } catch {
    // atob throws on input that is not valid base64
    return INVALID_INVITE;
  }
};
