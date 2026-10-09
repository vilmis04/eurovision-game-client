import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { paths } from '../../../../paths';
import { makeStore } from '../../../../redux/store';
import { GroupJoin } from './GroupJoin';

const renderAt = (inviteCode: string) => {
  const router = createMemoryRouter(
    [{ path: paths.joinGroup, element: <GroupJoin /> }],
    { initialEntries: [`${paths.groups}/join/${inviteCode}`] }
  );

  render(
    <Provider store={makeStore()}>
      <RouterProvider router={router} />
    </Provider>
  );
};

describe('GroupJoin', () => {
  it('shows the group name for a valid invite', () => {
    renderAt(window.btoa('Friends:x:7:y'));

    expect(screen.getByText('Join "Friends"?')).toBeInTheDocument();
  });

  it('shows a friendly message instead of throwing for a malformed invite', () => {
    renderAt('%%%not-base64%%%');

    expect(screen.getByText('Invalid invitation link')).toBeInTheDocument();
  });
});
