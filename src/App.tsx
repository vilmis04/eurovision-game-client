import { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import SignUp from './pages/SignUp/SignUp';
import Login from './pages/Login/Login';
import { paths } from './paths';
import { ThemeProvider } from '@mui/material';
import { Layout } from './components/Layout/Layout';
import { SnackbarContext } from './components/SnackbarContext/SnackbarContext';
import { Provider } from 'react-redux';
import { theme } from '../theme';
import { store } from './redux/store';
import { useSnackbar } from './components/SnackbarContext/useSnackbar';
import { Auth } from './components/Auth/Auth';
import { ErrorContext } from './components/ErrorOverlay/ErrorContext';
import { useErrorOverlay } from './components/ErrorOverlay/useErrorOverlay';
import { GlobalStyles } from './components/GlobalStyles/GlobalStyles';
import { setUnauthorizedHandler } from './api/baseApi';
import { Spinner } from './components/Spinner/Spinner';

const Groups = lazy(() =>
  import('./pages/Groups/Groups').then((m) => ({ default: m.Groups }))
);
const GroupView = lazy(() =>
  import('./pages/Groups/GroupView/GroupView').then((m) => ({
    default: m.GroupView,
  }))
);
const GroupJoin = lazy(() =>
  import('./pages/Groups/GroupView/GroupJoin/GroupJoin').then((m) => ({
    default: m.GroupJoin,
  }))
);
const Voting = lazy(() =>
  import('./pages/Voting/Voting').then((m) => ({ default: m.Voting }))
);
const Leaderboard = lazy(() =>
  import('./pages/Leaderboard/Leaderboard').then((m) => ({
    default: m.Leaderboard,
  }))
);

const lazyElement = (element: JSX.Element) => (
  <Suspense fallback={<Spinner isLoading>{null}</Spinner>}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: paths.home,
    element: (
      <Auth>
        <Layout />
      </Auth>
    ),
    children: [
      {
        path: paths.groups,
        element: lazyElement(<Groups />),
      },
      {
        path: paths.group.url,
        element: lazyElement(<GroupView />),
      },
      {
        path: paths.voting,
        element: lazyElement(<Voting />),
      },
      {
        path: paths.leaderboard,
        element: lazyElement(<Leaderboard />),
      },
    ],
  },
  {
    path: paths.joinGroup,
    element: lazyElement(<GroupJoin />),
  },
  {
    path: paths.signUp,
    element: <SignUp />,
    index: true,
  },
  {
    path: paths.login,
    element: <Login />,
    index: true,
  },
]);

setUnauthorizedHandler(() => {
  const { pathname } = router.state.location;
  if (pathname !== paths.login && pathname !== paths.signUp) {
    router.navigate(paths.login);
  }
});

export const App = () => {
  const snackbar = useSnackbar();
  const errorOverlay = useErrorOverlay();

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarContext.Provider value={snackbar}>
          <ErrorContext.Provider value={errorOverlay}>
            <GlobalStyles />
            <RouterProvider router={router} />
          </ErrorContext.Provider>
        </SnackbarContext.Provider>
      </ThemeProvider>
    </Provider>
  );
};
