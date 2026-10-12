import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { useGetGroupsQuery } from '../../api/group/groupApi';
import { ContextMenu } from '../../pages/Groups/GroupView/ContextMenu/ContextMenu';
import Login from '../../pages/Login/Login';
import { paths } from '../../paths';
import { makeStore } from '../../redux/store';
import { API_URL, server } from '../../test/server';
import { Auth } from './Auth';

/** Fake backend with a session flag standing in for the auth cookie. */
const useFakeBackend = () => {
  const backend = {
    loggedIn: false,
    user: '',
    credentialsModes: [] as string[],
  };

  server.use(
    http.get(`${API_URL}/auth/is-authenticated`, ({ request }) => {
      backend.credentialsModes.push(request.credentials);
      return backend.loggedIn
        ? new HttpResponse(backend.user)
        : new HttpResponse('Unauthorized', { status: 401 });
    }),
    http.post(`${API_URL}/auth/login`, async ({ request }) => {
      backend.credentialsModes.push(request.credentials);
      const { username, password } = (await request.json()) as {
        username: string;
        password: string;
      };
      if (password !== 'secret') {
        return new HttpResponse('Wrong nickname or password', { status: 401 });
      }
      backend.loggedIn = true;
      backend.user = username;
      return HttpResponse.json(null);
    }),
    http.post(`${API_URL}/auth/logout`, () => {
      if (!backend.loggedIn) {
        return new HttpResponse('Unauthorized', { status: 401 });
      }
      backend.loggedIn = false;
      return HttpResponse.json(null);
    }),
    http.get(`${API_URL}/group`, () => {
      if (!backend.loggedIn) {
        return new HttpResponse('Unauthorized', { status: 401 });
      }
      return HttpResponse.json([
        {
          id: 1,
          name: `${backend.user} group`,
          members: [backend.user],
          owner: backend.user,
        },
      ]);
    })
  );

  return backend;
};

/** Every list of group names the Home page rendered, to catch stale data. */
const renderedGroups: string[] = [];

const Home = () => {
  const { data: groups, refetch } = useGetGroupsQuery();
  renderedGroups.push((groups ?? []).map(({ name }) => name).join(','));

  return (
    <>
      <h1>Home page</h1>
      <button onClick={refetch}>Reload groups</button>
      <ul>
        {groups?.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
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

  render(
    <Provider store={makeStore()}>
      <RouterProvider router={router} />
    </Provider>
  );

  return router;
};

const login = async (password = 'secret', username = 'alice') => {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Nickname'), username);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('auth flow', () => {
  beforeEach(() => {
    renderedGroups.length = 0;
  });

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

  it("never shows the previous user's groups to the next user", async () => {
    useFakeBackend();
    renderApp();

    await login('secret', 'alice');
    await screen.findByText('alice group');

    await userEvent.click(await screen.findByText('Logout'));
    await screen.findByLabelText('Nickname');
    renderedGroups.length = 0;

    await login('secret', 'bob');
    await screen.findByText('bob group');

    expect(renderedGroups.filter((names) => names.includes('alice'))).toEqual(
      []
    );
  });

  it('sends cookies with auth requests', async () => {
    const backend = useFakeBackend();
    renderApp();

    await login();
    await screen.findByText('Home page');

    expect(backend.credentialsModes.length).toBeGreaterThan(0);
    expect(new Set(backend.credentialsModes)).toEqual(new Set(['include']));
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
    // a plain protected request now gets a 401
    await userEvent.click(await screen.findByText('Reload groups'));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(paths.login)
    );
  });
});
