import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Turnstile } from '@marsidev/react-turnstile';
import { Box, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../../../actions';
import CustomInput from '../../../../components/input/Input';
import PasswordInput from '../../../../components/input/PasswordInput';
import { logLogin } from '../../../../hooks/withTracking';
import {
  httpLoginWithEmail,
  httpRegisterWithEmailV2,
  sendHSFormData,
} from '../../../../http';
import { useAppStore } from '../../../../store/useAppStore';
import { navigateToUserPage } from '../../../../utils/navigateToUserPage';
import CustomButton from '../../Button';
import { GoogleButton } from '../../GoogleButton';
import { MetamaskButton } from '../../MetamaskButton';
import SkeletonLoader from '../../SkeletonLoader';

const ROOT_DOMAIN = String(import.meta.env.VITE_ROOT_DOMAIN || '').trim();

function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

interface FirstStepProps {
  setStep: Dispatch<SetStateAction<number>>;
  isSmallDevice?: boolean;
}

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const FirstStep: React.FC<FirstStepProps> = ({ isSmallDevice = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = useAppStore((s) => s.currentApp);
  const utmParams = localStorage.getItem('urlParams');
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm<Inputs>();

  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

  const commonDomains = [
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yandex.ru',
    'yandex.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'mail.ru',
    'bk.ru',
    'list.ru',
    'inbox.ru',
    'proton.me',
  ];

  const levenshtein = (a: string, b: string) => {
    if (a === b) return 0;
    const an = a.length;
    const bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix: number[][] = Array.from({ length: an + 1 }, () =>
      new Array(bn + 1).fill(0)
    );
    for (let i = 0; i <= an; i++) matrix[i][0] = i;
    for (let j = 0; j <= bn; j++) matrix[0][j] = j;
    for (let i = 1; i <= an; i++) {
      const ca = a.charCodeAt(i - 1);
      for (let j = 1; j <= bn; j++) {
        const cb = b.charCodeAt(j - 1);
        const cost = ca === cb ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[an][bn];
  };

  const suggestEmail = (email: string): string | null => {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return null;
    const local = email.slice(0, atIndex).trim();
    const domain = email
      .slice(atIndex + 1)
      .trim()
      .toLowerCase();
    if (!local || !domain) return null;
    if (commonDomains.includes(domain)) return null;
    let best: { d: number; domain: string } | null = null;
    for (const candidate of commonDomains) {
      const distance = levenshtein(domain, candidate);
      if (!best || distance < best.d) best = { d: distance, domain: candidate };
    }
    if (best && best.d > 0 && best.d <= 2) {
      return `${local}@${best.domain}`;
    }
    return null;
  };

  if (!config) {
    return null;
  }

  const onSubmit = async ({ email, firstName, lastName, password }: Inputs) => {
    const suggested = suggestEmail(email);
    if (suggested && suggested !== email) {
      setEmailSuggestion(suggested);
      setError('email', {
        type: 'suggestion',
        message: `Perhaps you meant ${suggested}?`,
      });
      return;
    }
    const formData = new FormData(formRef.current!);
    const cfToken = formData.get('cf-turnstile-response');

    if (!cfToken || typeof cfToken !== 'string' || cfToken.trim() === '') {
      return;
    }

    try {
      await httpRegisterWithEmailV2(
        email,
        password,
        cfToken,
        firstName,
        lastName,
        utmParams || ''
      ).then(async () => {
        const website = window.location.origin;
        const currentDomain = window.location.hostname;
        const allowedDomains =
          import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];

        const hubspotData = {
          fields: [
            { name: 'firstname', value: firstName },
            { name: 'lastname', value: lastName },
            { name: 'email', value: email },
            { name: 'website', value: website },
          ],
        };

        if (!allowedDomains.includes(currentDomain)) {
          return;
        }

        const hubspotEnabled = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
        const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
        const formId = String(import.meta.env.VITE_HUBSPOT_FORM_ID_SIGNUP || '').trim();
        if (!hubspotEnabled || !portalId || !formId) {
          return;
        }

        await sendHSFormData(
          portalId,
          formId,
          hubspotData
        );
      });
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        email: email,
      });
      // setStep((prev) => prev + 1);

      httpLoginWithEmail(email, password)
        .then(async ({ data }) => {
          setEthoraUserCookie('1');

          await actionAfterLogin(data);

          logLogin('email', data.user._id);
          if (config?.afterLoginPage) {
            navigateToUserPage(navigate, config.afterLoginPage as string);
          }
        })
        .catch((error) => {
          toast.error(error.response.data.error);
          localStorage.removeItem('token-538');
        });
    } catch (error: AxiosError | any) {
      toast.error(
        error?.response?.data?.error ||
          'An account with this email already exists.'
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: '320px',
        paddingTop: '16px',
      }}
    >
      {config?.signonOptions.includes('google') && (
        <GoogleButton utm={utmParams} />
      )}
      {config?.signonOptions.length > 1 && (
        <Box className="flex items-center w-full my-2">
          <span className="flex-grow border-t border-2 border-gray-300 mx-4 border-r-2" />
          <Typography
            variant="h6"
            className="mx-4 text-black"
            style={{ whiteSpace: 'nowrap' }}
          >
            OR
          </Typography>
          <span className="flex-grow border-t border-2 border-gray-300 mx-4 border-r-2" />
        </Box>
      )}
      <SkeletonLoader loading={false}>
        <Box
          ref={formRef}
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flexWrap: 'wrap',
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box
            sx={{
              display: 'flex',
              minWidth: '320px',
              gap: 3,
              flex: 1,
              flexWrap: isSmallDevice ? 'wrap' : 'nowrap',
            }}
          >
            <CustomInput
              placeholder="First Name"
              id="firstName"
              fullWidth
              {...register('firstName', { required: 'First Name is required' })}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              required={true}
            />
            <CustomInput
              placeholder="Last Name"
              id="lastName"
              fullWidth
              {...register('lastName')}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
            />
          </Box>
          <CustomInput
            fullWidth
            placeholder="Email"
            id="email"
            required={true}
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
              onBlur: (e) => {
                const value = e.target.value?.trim();
                if (!value) {
                  setEmailSuggestion(null);
                  return;
                }
                const suggestion = suggestEmail(value);
                setEmailSuggestion(suggestion);
              },
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          {emailSuggestion && (
            <Typography
              variant="body2"
              sx={{ color: '#8C8C8C', cursor: 'pointer' }}
              onClick={() => {
                setValue('email', emailSuggestion, { shouldValidate: true });
                setEmailSuggestion(null);
                clearErrors('email');
              }}
            >
              Возможно, вы имели в виду {emailSuggestion}?
            </Typography>
          )}
          <PasswordInput
            type="password"
            placeholder={'Password'}
            sx={{ flex: 1, width: '100%' }}
            {...register('password', { required: 'Required field' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Box className="flex justify-center items-center">
            <Turnstile
              options={{
                theme: 'light',
              }}
              siteKey="0x4AAAAAABu5unVlwIkWIU9X"
            />
          </Box>
          <CustomButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{
              backgroundColor: config?.primaryColor
                ? config.primaryColor
                : '#0052CD',
            }}
          >
            Sign Up
          </CustomButton>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '8px',
                color: '#8C8C8C',
                flexWrap: 'wrap',
                maxWidth: '486px',
                fontSize: '14px',
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 'inherit',
                  color: 'inherit',
                  flexWrap: 'wrap',
                }}
              >
                By clicking the 'Sign Up' button, you agree to our
              </Typography>
              <Typography
                component="a"
                href="/terms"
                sx={{
                  textDecoration: 'underline',
                  color: config?.primaryColor ? config.primaryColor : '#0052CD',
                  fontSize: 'inherit',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Terms & Conditions
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {config?.signonOptions.includes('metamask') && (
            <MetamaskButton utm={utmParams} />
          )}
        </Box>
      </SkeletonLoader>
    </Box>
  );
};

export default FirstStep;
