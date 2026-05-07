import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ModelApp } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';

interface TabAIWidgetCodeProps {
  value: string;
  appId?: string;
  app?: ModelApp;
  userId?: string;
  handleChange: (_: React.SyntheticEvent, newValue: string) => void;
}

export const TabAIWidgetCode = ({
  value,
  appId,
  app,
  userId,
  handleChange,
}: TabAIWidgetCodeProps): ReactElement => {
  const doSetAiValues = useAppStore((s) => s.doSetAiValues);
  const currentApp = useAppStore((s) => s.currentApp);
  const widgetUrl =
    import.meta.env.VITE_WIDGET_URL ||
    import.meta.env.VITE_WIDGET_VERSIONED_URL ||
    '';
  // The widget's POST /v2/widget/sessions runs against the install's API
  // host. We can derive it from the script src (widget.<root> -> api.<root>)
  // at runtime in the embed itself, so data-api-base is optional in the
  // generated snippet — but expose VITE_API for installs that intentionally
  // host the widget JS off-domain.
  const apiBaseOverride = (import.meta.env.VITE_API as string | undefined) || '';

  const [displayName, setDisplayName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  // const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const envXmppHost = import.meta.env.VITE_XMPP_HOST || '';
  const xmppHost = useMemo(() => {
    const jid = app?.systemChatAccount?.jid || currentApp?.systemChatAccount?.jid;
    if (!jid || !jid.includes('@')) {
      return envXmppHost;
    }

    return jid.split('@')[1] || envXmppHost;
  }, [app?.systemChatAccount?.jid, currentApp?.systemChatAccount?.jid, envXmppHost]);
  const botJid = useMemo(() => {
    if (!appId || !userId || !xmppHost) {
      return '';
    }

    return `${appId}_${userId}-bot@${xmppHost}`;
  }, [appId, userId, xmppHost]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setCopiedText(text);
    });
  };

  // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setAvatarFile(file);
  //     setAvatarPreview(reader.result as string);
  //   };
  //   reader.readAsDataURL(file);
  // };

  const scriptCode = useMemo(() => {
    if (!appId) {
      return '<script></script>';
    }

    if (!widgetUrl) {
      return '<!-- Configure VITE_WIDGET_URL in deploy to generate a self-hosted widget embed -->';
    }

    // MUC variant embed: the widget calls POST /v2/widget/sessions on mount
    // to provision a visitor + persistent room + bot invite, then SASL-binds
    // and joins the room over XMPP. The host page only has to surface appId
    // (and optionally an explicit API base when the widget is hosted off
    // the standard widget./api. subdomain pair).
    const lines = [
      `<script`,
      `  src="${widgetUrl}"`,
      `  id="chat-content-assistant"`,
      `  data-app-id="${appId}"`,
    ];

    if (apiBaseOverride) {
      lines.push(`  data-api-base="${apiBaseOverride}"`);
    }

    if (avatar) {
      lines.push(`  data-bot-avatar="${avatar}"`);
    }

    if (displayName) {
      lines.push(`  data-bot-display-name="${displayName}"`);
    }

    lines.push(`></script>`);

    return lines.join('\n');
  }, [appId, avatar, displayName, widgetUrl, apiBaseOverride]);

  const currentCopyTarget = useMemo(() => {
    if (value === '1') {
      return scriptCode;
    }
    if (botJid) {
      return botJid;
    }
    return '';
  }, [value, scriptCode, botJid]);

  useEffect(() => {
    setCopied(copiedText === currentCopyTarget && currentCopyTarget.length > 0);
  }, [copiedText, currentCopyTarget]);

  // useEffect(() => {
  //   if (avatarFile) {
  //     const url = URL.createObjectURL(avatarFile);
  //     setAvatarPreview(url);

  //     return () => {
  //       URL.revokeObjectURL(url);
  //     };
  //   }
  // }, [avatarFile]);

  return (
    <div className="py-6 p-0 md:p-6">
      <div className="font-semibold font-sans text-[16px] my-4">Code</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use this code to integrate widget into your website or external app.
      </p>

      <Box>
        <ButtonGroup variant="outlined" size="small" aria-label="code tabs">
          <Button
            onClick={(e) => handleChange(e, '1')}
            variant={value === '1' ? 'contained' : 'outlined'}
            aria-pressed={value === '1'}
          >
            HTML Widget
          </Button>
          <Button
            onClick={(e) => handleChange(e, '2')}
            variant={value === '2' ? 'contained' : 'outlined'}
            aria-pressed={value === '2'}
          >
            Wordpress
          </Button>
        </ButtonGroup>
      </Box>

      {value === '1' && (
        <Box sx={{ pt: 3 }}>
          <div className="flex flex-col gap-2 mb-8">
            <p className="font-sans text-sm pb-4 flex items-center gap-1">
              Which Display Name should the bot use?
            </p>
            <input
              type="text"
              maxLength={24}
              className={classNames(
                'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4'
              )}
              placeholder="Display name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                doSetAiValues({ displayName: e.target.value, avatar });
              }}
            />

            <p className="font-sans text-sm pb-4 flex items-center gap-1">
              Bot avatar URL (optional)
            </p>
            <input
              type="text"
              className={classNames(
                'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4'
              )}
              placeholder="url"
              value={avatar}
              onChange={(e) => {
                setAvatar(e.target.value);
                doSetAiValues({ avatar: e.target.value, displayName });
              }}
            />
          </div>

          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            {`Insert this code anywhere inside your <body> tag:`}
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton onClick={() => handleCopy(scriptCode)} size="small">
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={true}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {scriptCode}
            </SyntaxHighlighter>
          </div>
        </Box>
      )}

      {value === '2' && (
        <Box sx={{ pt: 3 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            Insert this bot ID in your Wordpress{' '}
            <a href="" className="text-brand-500">
              Ethora AI Assistant plugin
            </a>{' '}
            settings:
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton
                  onClick={() =>
                    handleCopy(botJid)
                  }
                  size="small"
                >
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={false}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {botJid}
            </SyntaxHighlighter>
          </div>
        </Box>
      )}
    </div>
  );
};
