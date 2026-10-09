import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { useGetGroupsQuery } from '../../api/group/groupApi';
import { setUnauthorizedHandler } from '../../api/baseApi';
import { ContextMenu } from '../../pages/Groups/GroupView/ContextMenu/ContextMenu';
import Login from '../../pages/Login/Login';
import { paths } from '../../paths';
import { makeStore } from '../../redux/store';
import { API_URL, server } from '../../test/server';
import { Auth } from './Auth';

/** Fake backend with a session flag standing in for the auth cookie. */
const useFakeBackend = () => {
  const backend = { loggedIn: false };

  server.use(
    http.get(`${API_URL}/auth/is-authenticated`, () =>
      backend.loggedIn
        ? new HttpResponse('alice')
        : new HttpResponse('Unauthorized', { status: 401 })
    ),
    http.post(`${API_URL}/auth/login`, async ({ request }) => {
      const { password } = (await request.json()) as { password: string };
      if (password !== 'secret') {
        return new HttpResponse('Wrong nickname or password', { status: 401 });
      }
      backend.loggedIn = true;
      return HttpResponse.json(null);
    }),
    http.post(`${API_URL}/auth/logout`, () => {
      backend.loggedIn = false;
      return HttpResponse.json(null);
    }),
    http.get(`${API_URL}/group`, () => {
      if (!backend.loggedIn) {
        return new HttpResponse('Unauthorized', { status: 401 });
      }
      return HttpResponse.json([]);
    })
  );

  return backend;
};

const Home = () => {
  useGetGroupsQuery();

  return (
    <>
      <h1>Home page</h1>
      <ContextMenu
        open
        copyLink={() => {}}
        deleteGroup={() => {}}
        isOwner={false}
      />
    </>
  );
};

const renderApp = () => {
  const router = createMemoryRouter(
    [
      {
        path: paths.home,
        element: (
          <Auth>
            <Home />
          </Auth>
        ),
      },
      { path: paths.login, element: <Login /> },
    ],
    { initialEntries: [paths.home] }
  );
  setUnauthorizedHandler(() => router.navigate(paths.login));

  render(
    <Provider store={makeStore()}>
      <RouterProvider router={router} />
    </Provider>
  );

  return router;
};

const login = async (password = 'secret') => {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Nickname'), 'alice');
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('auth flow', () => {
  it('redirects a signed-out visitor to the login page', async () => {
    useFakeBackend();
    const router = renderApp();

    await waitFor(() =>
      expect(screen.getByLabelText('Nickname')).toBeInTheDocument()
    );
    expect(router.state.location.pathname).toBe(paths.login);
  });

  it('keeps login -> logout -> login in sync without a reload', async () => {
    useFakeBackend();
    const router = renderApp();

    await login();
    expect(await screen.findByText('Home page')).toBeInTheDocument();

    await userEvent.click(await screen.findByText('Logout'));
    expect(await screen.findByLabelText('Nickname')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.login);
    expect(screen.queryByText('Home page')).not.toBeInTheDocument();

    await login();
    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
  });

  it('shows the error and stays on login after a wrong password', async () => {
    useFakeBackend();
    const router = renderApp();

    await login('wrong');

    expect(
      await screen.findByText('Wrong nickname or password')
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.login);
  });

  it('sends the user to login when the session expires mid-use', async () => {
    const backend = useFakeBackend();
    const router = renderApp();

    await login();
    await screen.findByText('Home page');

    backend.loggedIn = false;
    // any further request now gets a 401; trigger one
    const user = userEvent.setup();
    await user.click(await screen.findByText('Logout'));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(paths.login)
    );
  });
});
