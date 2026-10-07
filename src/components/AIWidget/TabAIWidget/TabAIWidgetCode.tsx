import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, ButtonGroup, Checkbox, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from '../../../i18n/useTranslation';
import { AiWidgetAppearance, getAppearanceAttributes } from '../../../lib/aiWidgetAppearance';
import { ModelApp } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';
import { resolveWidgetUrl } from '../../../utils/widgetUrl';

import { env } from '../../../config/env';
interface TabAIWidgetCodeProps {
  value: string;
  appId?: string;
  app?: ModelApp;
  userId?: string;
  // Appearance saved in AssistantAppearancePanel above. Live embeds load it
  // from the server, so the snippet stays minimal unless the operator pins
  // it: then its non-default data-* attributes are written into the tag and
  // win over later saved changes on that site.
  appearance?: AiWidgetAppearance;
  handleChange: (_: React.SyntheticEvent, newValue: string) => void;
}

export const TabAIWidgetCode = ({
  value,
  appId,
  app,
  userId,
  appearance,
  handleChange,
}: TabAIWidgetCodeProps): ReactElement => {
  const { t } = useTranslation();
  const currentApp = useAppStore((s) => s.currentApp);
  // Env override first, then the copy bundled with this app. See
  // utils/widgetUrl.ts for why the default is a self-hosted asset.
  const widgetUrl = resolveWidgetUrl();
  // The widget's POST /v2/widget/sessions runs against the install's API
  // host. We can derive it from the script src (widget.<root> -> api.<root>)
  // at runtime in the embed itself, so data-api-base is optional in the
  // generated snippet — but expose VITE_API for installs that intentionally
  // host the widget JS off-domain.
  const apiBaseOverride = (env.VITE_API as string | undefined) || '';

  // displayName / avatar state removed — persona comes from the active
  // Agent now (rendered above as a read-only summary). The script-tag
  // override path (data-bot-display-name / data-bot-avatar) is still
  // documented for white-label scenarios; operators add those attrs by
  // hand to the snippet below if they need them.
  const [pinAppearance, setPinAppearance] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const envXmppHost = env.VITE_XMPP_HOST || '';
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
      // Unreachable once the bundled asset exists; kept so a broken build
      // produces a readable comment rather than src="".
      return '<!-- Widget asset missing: run npm run build (prebuild copies it) -->';
    }

    // MUC variant embed: the widget calls POST /v2/widget/sessions on mount
    // to provision a visitor + persistent room + bot invite, then SASL-binds
    // and joins the room over XMPP. The host page only has to surface appId
    // (and optionally an explicit API base when the widget is hosted off
    // the standard widget./api. subdomain pair).
    //
    // The required attrs appear inside the <script> tag; optional overrides
    // appear directly underneath as a commented-out block ready to copy and
    // uncomment line-by-line. Operators only touch the optional ones when
    // they want to override the active Agent's persona on a specific embed.
    const required = [
      `<script`,
      `  src="${widgetUrl}"`,
      `  id="chat-content-assistant"`,
      `  data-app-id="${appId}"`,
    ];
    if (apiBaseOverride) {
      required.push(`  data-api-base="${apiBaseOverride}"`);
    }
    // Saved appearance is fetched by the widget at load; writing it into the
    // tag is opt-in, for sites that must not follow later changes.
    const chosenAppearance = pinAppearance && appearance ? getAppearanceAttributes(appearance) : [];
    chosenAppearance.forEach(([attr, val]) => {
      required.push(`  ${attr}="${val.replace(/"/g, '&quot;')}"`);
    });
    required.push(`></script>`);

    return required.join('\n');
  }, [appId, widgetUrl, apiBaseOverride, appearance, pinAppearance]);

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
    <div className="p-4">
      <Box>
        <ButtonGroup variant="outlined" size="small" aria-label="code tabs">
          <Button
            onClick={(e) => handleChange(e, '1')}
            variant={value === '1' ? 'contained' : 'outlined'}
            aria-pressed={value === '1'}
          >
            {t('aiWidgetCode.htmlWidgetButton')}
          </Button>
          <Button
            onClick={(e) => handleChange(e, '2')}
            variant={value === '2' ? 'contained' : 'outlined'}
            aria-pressed={value === '2'}
          >
            {t('aiWidgetCode.wordpressButton')}
          </Button>
        </ButtonGroup>
      </Box>

      {value === '1' && (
        <Box sx={{ pt: 3 }}>
          <p className="font-sans text-sm pb-2 flex items-center gap-1">
            {t('aiWidgetCode.insertBodyText')}
          </p>
          <FormControlLabel
            className="pb-2"
            control={
              <Checkbox
                size="small"
                checked={pinAppearance}
                onChange={(e) => setPinAppearance(e.target.checked)}
                slotProps={{ input: { 'aria-describedby': 'pin-appearance-hint' } }}
              />
            }
            label={<span className="font-sans text-sm">{t('aiWidgetCode.pinAppearanceLabel')}</span>}
          />
          <p id="pin-appearance-hint" className="font-sans text-xs text-gray-500 pb-4 -mt-1">
            {pinAppearance ? t('aiWidgetCode.pinAppearanceOnHint') : t('aiWidgetCode.pinAppearanceOffHint')}
          </p>
          <div
            className="relative rounded-md bg-[#454545] overflow-y-auto"
            style={{ maxHeight: 260 }}
          >
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? t('aiWidgetCode.copied') : t('aiWidgetCode.copy')}>
                <IconButton onClick={() => handleCopy(scriptCode)} size="small">
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-[#D9D9D9]"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-[#D9D9D9]"
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
                  // With line numbers + wrapLongLines the highlighter makes each
                  // line a flex row, so every token is a flex item and a plain
                  // select-and-copy put a newline between tokens. A block line
                  // copies as written (the numbers are user-select: none).
                  display: 'block',
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
          <WidgetAttributesReference />
        </Box>
      )}

      {value === '2' && (
        <Box sx={{ pt: 3 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            {t('aiWidgetCode.wordpressInsertPrefix')}{' '}
            <a href="" className="text-brand-500">
              Ethora AI Assistant plugin
            </a>{' '}
            {t('aiWidgetCode.wordpressInsertSuffix')}
          </p>
          <div className="relative rounded-md bg-[#454545]">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? t('aiWidgetCode.copied') : t('aiWidgetCode.copy')}>
                <IconButton
                  onClick={() =>
                    handleCopy(botJid)
                  }
                  size="small"
                >
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-[#D9D9D9]"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-[#D9D9D9]"
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

const WIDGET_README_URL = 'https://github.com/dappros/ethora-ai-chat-widget#readme';

// Every attribute the embed reads, out of the way unless asked for. The list
// comes from the loaded bundle (window.EthoraAssistant, published once the
// widget has run on this page, e.g. after Test widget); otherwise the README.
function WidgetAttributesReference(): ReactElement {
  const { t } = useTranslation();
  const specs = window.EthoraAssistant?.attributes?.filter((a) => !a.required && !a.deprecatedAliasFor) || [];
  return (
    <details className="mt-3 text-sm font-sans" data-testid="widget-attributes-reference">
      <summary className="cursor-pointer text-gray-600 select-none">{t('aiWidgetCode.allAttributesSummary')}</summary>
      <p className="text-xs text-gray-500 mt-2">
        {t('aiWidgetCode.allAttributesIntro')}{' '}
        <a href={WIDGET_README_URL} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
          {t('aiWidgetCode.allAttributesReadme')}
        </a>
      </p>
      {specs.length > 0 && (
        <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <tbody>
              {specs.map((a) => (
                <tr key={a.name} className="border-t first:border-t-0 align-top">
                  <td className="p-2 font-mono whitespace-nowrap">{a.name}</td>
                  <td className="p-2 text-gray-600">{a.doc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
