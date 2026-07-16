import React, { useEffect, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { actionAfterLogin } from '../../actions';
import {
  http,
  httpAgentSiteCrawl,
  httpLoginWithEmail,
  httpRegisterWithEmailV2,
  httpV2,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';

const SITE_KEY = (import.meta.env.VITE_SITE_KEY || '').trim();
const TURNSTILE_ENABLED = SITE_KEY.length > 0;

type Step = 'account' | 'configure' | 'provisioning' | 'done' | 'error';

interface ProvisionResult {
  appId: string;
  agentId: string;
}

// Only postMessage back to origins the opener actually claims to be from.
// Anything malformed falls through to the manual-copy fallback.
function normalizeReturnOrigin(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function defaultPrompt(siteTitle: string) {
  return (
    `You are the assistant for ${siteTitle}. Answer using only ` +
    `information from the indexed pages. Be concise and helpful. ` +
    `If you don't know something specific, say so and suggest where ` +
    `on the site to look.`
  );
}

export default function WpSetup() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const siteTitleParam = (searchParams.get('site_title') || '').trim();
  const siteUrlParam = (searchParams.get('site_url') || '').trim();
  const suggestedEmail = (searchParams.get('suggested_email') || '').trim();
  const returnOrigin = normalizeReturnOrigin(searchParams.get('return_origin'));

  const [step, setStep] = useState<Step>('account');
  const [errorMessage, setErrorMessage] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(suggestedEmail);
  const [password, setPassword] = useState('');
  const [cfToken, setCfToken] = useState('');

  const initialAppName = siteTitleParam || 'My Website';
  const [appName, setAppName] = useState(initialAppName);
  const [crawlUrl, setCrawlUrl] = useState(siteUrlParam);
  const [prompt, setPrompt] = useState(defaultPrompt(initialAppName));

  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [crawlIncomplete, setCrawlIncomplete] = useState(false);

  // Tell the WP plugin opener as soon as we have an App ID. Use the configured
  // return_origin as the postMessage target; the opener validates the message
  // shape on its end before persisting.
  useEffect(() => {
    if (step !== 'done' || !result) return;
    if (!returnOrigin || !window.opener) return;
    try {
      window.opener.postMessage(
        { type: 'ethora-wp-setup-complete', appId: result.appId },
        returnOrigin
      );
    } catch (_) {
      // Opener gone (closed tab, blocked); manual-copy fallback is visible.
    }
  }, [step, result, returnOrigin]);

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (TURNSTILE_ENABLED && !cfToken) {
      setErrorMessage(t('wpSetup.errorTurnstile'));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(t('wpSetup.errorPasswordLength'));
      return;
    }
    try {
      await httpRegisterWithEmailV2(
        email.trim(),
        password,
        cfToken,
        firstName.trim(),
        lastName.trim()
      );
      const { data } = await httpLoginWithEmail(email.trim(), password);
      await actionAfterLogin(data);
      setStep('configure');
    } catch (e: any) {
      setErrorMessage(
        e?.response?.data?.error || t('wpSetup.errorSignupFailed')
      );
    }
  };

  const provision = async () => {
    setStep('provisioning');
    setErrorMessage('');
    try {
      const { data: appResp } = await http.post('/apps', {
        displayName: appName.trim(),
        createDefaultChat: true,
      });
      const newAppId: string = appResp?.app?._id;
      const newAgentId: string = appResp?.app?.aiBot?.savedAgentId || '';
      if (!newAppId) {
        throw new Error('App creation returned no ID.');
      }

      if (prompt.trim()) {
        try {
          // Sets aiBot.prompt on the new App (per-tenant override). PUT /v2/agents/:id
          // would 403 here because the Support Agent is a platform-level record
          // owned by 'system', not by the user who just created the app.
          await httpV2.put(`/apps/${newAppId}/bot`, { prompt: prompt.trim() });
        } catch (_) {
          // Non-fatal: app+bot are usable with the default prompt.
        }
      }

      if (newAgentId && crawlUrl.trim()) {
        try {
          await httpAgentSiteCrawl(newAppId, newAgentId, crawlUrl.trim(), true);
        } catch (_) {
          // Treat any crawl failure (incl. client-side timeout before backend
          // finishes) as "still running." App and bot are already usable; the
          // RAG content just keeps filling in.
          setCrawlIncomplete(true);
        }
      }

      setResult({ appId: newAppId, agentId: newAgentId });
      setStep('done');
    } catch (e: any) {
      setErrorMessage(
        e?.response?.data?.error || t('wpSetup.errorSetupFailed')
      );
      setStep('error');
    }
  };

  return (
    <Box sx={{ maxWidth: 520, margin: '40px auto', padding: '0 24px' }}>
      <Typography variant="h5" sx={{ marginBottom: 1, fontWeight: 600 }}>
        {t('wpSetup.heading')}
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', marginBottom: 3 }}>
        {step === 'account' && t('wpSetup.stepAccount.subtitle')}
        {step === 'configure' && t('wpSetup.stepConfigure.subtitle')}
        {step === 'provisioning' &&
          t('wpSetup.stepProvisioning.subtitle')}
        {step === 'done' && t('wpSetup.stepDone.subtitle')}
        {step === 'error' && t('wpSetup.stepError.subtitle')}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {step === 'account' && (
        <Box
          component="form"
          onSubmit={submitAccount}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('wpSetup.firstNameLabel')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t('wpSetup.lastNameLabel')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />
          </Box>
          <TextField
            label={t('wpSetup.emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('wpSetup.passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
            helperText={t('wpSetup.passwordHelper')}
          />
          {TURNSTILE_ENABLED && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Turnstile
                siteKey={SITE_KEY}
                onSuccess={(t) => setCfToken(t)}
                options={{ theme: 'light' }}
              />
            </Box>
          )}
          <Button type="submit" variant="contained" size="large">
            {t('wpSetup.continueButton')}
          </Button>
        </Box>
      )}

      {step === 'configure' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('wpSetup.appNameLabel')}
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('wpSetup.siteUrlLabel')}
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            placeholder="https://example.com"
            fullWidth
            helperText={t('wpSetup.siteUrlHelper')}
          />
          <TextField
            label={t('wpSetup.systemPromptLabel')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline
            rows={5}
            fullWidth
          />
          <Button onClick={provision} variant="contained" size="large">
            {t('wpSetup.setupButton')}
          </Button>
        </Box>
      )}

      {step === 'provisioning' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '40px 0',
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ color: '#666' }}>
            {t('wpSetup.provisioningText')}
          </Typography>
        </Box>
      )}

      {step === 'done' && result && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success">
            {t('wpSetup.doneAlertTitle')}
            {crawlIncomplete && (
              <Box
                component="span"
                sx={{
                  display: 'block',
                  marginTop: 1,
                  fontSize: '0.9em',
                }}
              >
                {t('wpSetup.crawlIncompleteText')}
              </Box>
            )}
          </Alert>
          {returnOrigin ? (
            <Typography variant="body2" sx={{ color: '#666' }}>
              {t('wpSetup.returnOriginText')}
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                {t('wpSetup.copyAppIdText')}
              </Typography>
              <TextField
                value={result.appId}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>
          )}
        </Box>
      )}

      {step === 'error' && (
        <Button
          onClick={() => {
            setStep('account');
            setErrorMessage('');
          }}
        >
          {t('wpSetup.startOverButton')}
        </Button>
      )}
    </Box>
  );
}
