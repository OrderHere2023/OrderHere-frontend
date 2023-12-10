import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Router, { useRouter } from 'next/router';
import ForgetPassword from './ForgetPassword';
import ResetPassword from './ResetPassword';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Checkbox,
  Divider,
  FormControlLabel,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { closeSignDialog } from '../../store/actions/signAction';
import hotToast from '../../utils/hotToast';
import GoogleSignInBtn from './UI/GoogleSignInBtn';
import FacebookSignInBtn from './UI/FacebookSignInBtn';
import { getSession, signIn, useSession } from 'next-auth/react';
import { getCsrfToken } from 'next-auth/react';
import { loginSuccess } from '../../store/actions/httpAction';
import store, { saveState } from '../../store/store';

const Login = ({ register }) => {
  /** state */
  const [isLoading, setLoading] = useState(false);
  const [csrfValue, setCsrfValue] = useState();
  const { data: session, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    getCsrfToken().then(setCsrfValue);
  }, []);

  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'must be at least 6 characters long')
        .max(16)
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;
      signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
        callbackUrl: '/',
      })
        .then((response) => {
          hotToast('success', 'login success');
          getSession().then((session) => {
            const jwtToken = session.token.user.jwt;
            dispatch(loginSuccess(jwtToken));
          });
        })
        .catch((error) => {
          hotToast('error', 'Invalid Email or Password');
          console.error('login fail', error);
        })
        .then(() => saveState(store.getState()));
    },
  });

  //set state for Remeber me Checkbox and event handler
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);
  const handleRememberMeChange = (event) => {
    setIsRememberMeChecked(event.target.checked);
  };

  const [emailForReset, setEmailForReset] = useState('');
  const [isForgetPasswordModalOpen, setIsForgetPasswordModalOpen] =
    useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const handleOpenForgetPasswordModal = () => {
    setIsForgetPasswordModalOpen(true);
  };

  // const resetPassword = () => {
  //   // dispatch(closeSignDialog());
  //   setIsResetPasswordModalOpen(true);
  // }

  const handleCloseForgetPasswordModal = (emailSent, userEmail) => {
    setIsForgetPasswordModalOpen(false);
    if (emailSent) {
      setEmailForReset(userEmail);
      setIsResetPasswordModalOpen(true);
    }
  };

  // const notresetPassword = () => {
  //   // dispatch(closeSignDialog());
  //   setIsResetPasswordModalOpen(false);
  //   // Router.push('/password-email', undefined, {shallow: true} );
  // };

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        minWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <input name="csrfToken" type="hidden" defaultValue={csrfValue} />
        <form onSubmit={formik.handleSubmit}>
          <Typography align="center">
            <Image src="/logo.png" height="55" width="55" alt="logo" />
          </Typography>
          <Typography color="textPrimary" variant="h4" align="center">
            WELCOME BACK, LOG IN
          </Typography>
          <Typography
            color="textSecondary"
            sx={{ mt: 2 }}
            variant="body2"
            align="center"
          >
            Sign in to your account and make recharges. payments and bookings
            faster
          </Typography>
          <Box sx={{ my: 4 }}>
            <TextField
              error={Boolean(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Enter your email..."
              margin="normal"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
              variant="outlined"
            />
            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Enter your password..."
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              variant="outlined"
            />
            <Grid container alignItems="center">
              <Grid item xs={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isRememberMeChecked}
                      onChange={handleRememberMeChange}
                    />
                  }
                  label="Remember Me"
                />
              </Grid>
              <Grid item xs={4}>
                <Typography color="textSecondary" variant="body2">
                  <Button onClick={handleOpenForgetPasswordModal}>
                    Forget password?
                  </Button>
                  <ForgetPassword
                    open={isForgetPasswordModalOpen}
                    onClose={() => setIsForgetPasswordModalOpen(false)}
                    onEmailSent={(emailSent, userEmail) =>
                      handleCloseForgetPasswordModal(emailSent, userEmail)
                    }
                  />
                  <ResetPassword
                    open={isResetPasswordModalOpen}
                    onClose={() => setIsResetPasswordModalOpen(false)}
                    email={emailForReset}
                  />
                </Typography>
              </Grid>
            </Grid>

            <Grid sx={{ py: 3 }}>
              <LoadingButton
                loading={isLoading}
                color="error"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                LOG IN
              </LoadingButton>
            </Grid>

            <Box sx={{ mt: 0, mb: 1 }}>
              <Divider> OR </Divider>
            </Box>

            {/* place to contain Google Login and Facebook Login  */}
            <Grid container spacing={2} justifyContent={'space-between'}>
              <Grid item xs={6}>
                <GoogleSignInBtn>Sign in With Google</GoogleSignInBtn>
              </Grid>
              <Grid item xs={6}>
                <FacebookSignInBtn></FacebookSignInBtn>
              </Grid>
            </Grid>

            <Box>
              <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item>
                  <Typography>Don't have an account?</Typography>
                </Grid>
                <Grid item>
                  <Typography color="textSecondary" variant="body2">
                    <Button onClick={() => register()}>Sign Up</Button>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default Login;
