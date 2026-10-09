import { Box, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { styles } from './Login.styles';
import * as Yup from 'yup';
import { useEffect, useRef } from 'react';
import {
  useIsAuthenticatedQuery,
  useLoginMutation,
} from '../../api/auth/authApi';
import { paths } from '../../paths';
import { useJoinGroupMutation } from '../../api/group/groupApi';
import { decodeInvite } from '../../utils/decodeInvite';
import { useErrorHandler } from '../../components/ErrorOverlay/useErrorHandler';
import {
  Background,
  GradientType,
} from '../../components/Background/Background';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { TextFormField } from '../../components/TextFormField/TextFormField';
import { Spinner } from '../../components/Spinner/Spinner';
import { LoginRequestBody } from '../../types';

const initialValues: LoginRequestBody = {
  username: '',
  password: '',
};

const loginValidationSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

export const Login = () => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const rawInviteCode = queryParams.get('invite');
  // Ignore malformed invites so login/sign-up still works.
  const inviteCode =
    rawInviteCode && decodeInvite(rawInviteCode).isInviteStructureValid
      ? rawInviteCode
      : null;
  const [
    login,
    {
      isSuccess: isLoginSuccess,
      isLoading: isLoginLoading,
      isError: isLoginError,
      error: loginError,
    },
  ] = useLoginMutation();

  const {
    isSuccess: isLoggedIn,
    isLoading: isCheckingAuthStatus,
    isUninitialized,
  } = useIsAuthenticatedQuery();
  const ref = useRef<HTMLElement>();

  const [
    joinGroup,
    {
      isSuccess: isJoinGroupSuccess,
      isError: isJoinGroupError,
      error: joinGroupError,
    },
  ] = useJoinGroupMutation();
  useErrorHandler({ error: joinGroupError, isError: isJoinGroupError });

  useEffect(() => {
    if (isLoginSuccess && inviteCode) {
      joinGroup({ inviteCode });
    }
  }, [isLoginSuccess && inviteCode]);

  useEffect(() => {
    if (!inviteCode && (isLoginSuccess || isLoggedIn)) {
      navigate(paths.home);
    }
  }, [isLoginSuccess, isLoggedIn, inviteCode]);

  useEffect(() => {
    if (isJoinGroupSuccess) {
      const { id } = decodeInvite(inviteCode);
      navigate(`${paths.group.build(id)}?joined=true`);
    }
  }, [isJoinGroupSuccess]);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [isCheckingAuthStatus || isUninitialized]);

  const handleSubmit = async (values: LoginRequestBody) => {
    await login(values);
  };

  const errorMessage =
    loginError && 'data' in loginError ? `${loginError.data}` : '';

  return (
    <Spinner isLoading={isCheckingAuthStatus || isUninitialized}>
      <Background variant={GradientType.GRADIENT1}>
        <Box sx={styles.contentWrapper}>
          <Typography variant="h1" sx={styles.title}>
            Login
          </Typography>
          <Typography variant="body1" sx={styles.linkWrapper}>
            {'New user? '}
            <Box
              component={Link}
              to={`${paths.signUp}${inviteCode ? `?invite=${inviteCode}` : ''}`}
              sx={styles.link}
            >
              Sign up
            </Box>
          </Typography>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={loginValidationSchema}
          >
            {({ values: { password, username } }) => (
              <Box component={Form} sx={styles.form}>
                <TextFormField
                  name="username"
                  label="Nickname"
                  inputRef={ref}
                />
                <TextFormField
                  name="password"
                  type="password"
                  label="Password"
                />
                <SubmitButton
                  isLoading={isLoginLoading}
                  isDisabled={!password || !username}
                  isError={isLoginError}
                  errorMessage={errorMessage}
                >
                  Login
                </SubmitButton>
              </Box>
            )}
          </Formik>
        </Box>
      </Background>
    </Spinner>
  );
};

export default Login;
