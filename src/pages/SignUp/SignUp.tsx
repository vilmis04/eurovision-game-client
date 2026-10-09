import { Box, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { styles } from './SignUp.styles';
import * as Yup from 'yup';
import {
  useIsAuthenticatedQuery,
  useSignUpMutation,
} from '../../api/auth/authApi';
import { useEffect, useRef } from 'react';
import { paths } from '../../paths';
import { decodeInvite } from '../../utils/decodeInvite';
import { useJoinGroupMutation } from '../../api/group/groupApi';
import { useErrorHandler } from '../../components/ErrorOverlay/useErrorHandler';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import {
  Background,
  GradientType,
} from '../../components/Background/Background';
import { TextFormField } from '../../components/TextFormField/TextFormField';
import { Spinner } from '../../components/Spinner/Spinner';
import { SignUpRequestBody } from '../../types';

const initialValues: SignUpRequestBody = {
  username: '',
  password: '',
  repeatPassword: '',
};

const signUpValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Required')
    .test(
      'allowed characters',
      'quotation marks ("), apostrophes (\'), and commas (,) are not allowed',
      (value) => (value ? !/["',]/.test(value) : true)
    ),
  password: Yup.string()
    .required('Required')
    .min(8, 'Must include at least 8 symbols'),
  repeatPassword: Yup.string()
    .required('Repeated password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export const SignUp = () => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const rawInviteCode = queryParams.get('invite');
  // Ignore malformed invites so login/sign-up still works.
  const inviteCode =
    rawInviteCode && decodeInvite(rawInviteCode).isInviteStructureValid
      ? rawInviteCode
      : null;
  const [
    signUp,
    {
      isSuccess: isSignUpSuccess,
      isLoading: isSignUpLoading,
      isError: isSignUpError,
      error: signUpError,
    },
  ] = useSignUpMutation();
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
    if (isSignUpSuccess && inviteCode) {
      joinGroup({ inviteCode });
    }
  }, [isSignUpSuccess && inviteCode]);

  useEffect(() => {
    if (!inviteCode && (isSignUpSuccess || isLoggedIn)) {
      navigate(paths.home);
    }
  }, [isSignUpSuccess, isLoggedIn, inviteCode]);

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

  const handleSubmit = async (values: SignUpRequestBody) => {
    await signUp(values);
  };

  const errorMessage =
    signUpError && 'data' in signUpError ? `${signUpError.data}` : '';

  return (
    <Spinner isLoading={isCheckingAuthStatus || isUninitialized}>
      <Background variant={GradientType.GRADIENT1}>
        <Box sx={styles.contentWrapper}>
          <Typography variant="h1" sx={styles.title}>
            Sign Up
          </Typography>
          <Typography variant="body1" sx={styles.linkWrapper}>
            {'Already a user? '}
            <Box
              component={Link}
              to={`${paths.login}${inviteCode ? `?invite=${inviteCode}` : ''}`}
              sx={styles.link}
            >
              Login
            </Box>
          </Typography>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={signUpValidationSchema}
          >
            {({ values: { password, repeatPassword, username } }) => (
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
                <TextFormField
                  name="repeatPassword"
                  type="password"
                  label="Repeat password"
                />
                <SubmitButton
                  isLoading={isSignUpLoading}
                  isDisabled={!password || !username || !repeatPassword}
                  isError={isSignUpError}
                  errorMessage={errorMessage}
                >
                  Sign Up
                </SubmitButton>
              </Box>
            )}
          </Formik>
        </Box>
      </Background>
    </Spinner>
  );
};

export default SignUp;
