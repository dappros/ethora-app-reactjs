import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelApp } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';
import { resolveWidgetUrl } from '../../../utils/widgetUrl';

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
  const { t } = useTranslation();
  const currentApp = useAppStore((s) => s.currentApp);
  const agents = useAppStore((s) => s.agents);
  const botInstances = useAppStore((s) => s.botInstances);

  // Resolve the Agent the active widget bot draws persona from. Same
  // resolution chain as ActiveAgentSelector — defaultBotInstanceId ->
  // BotInstance.agentId -> Agent. Persona surfaces here read-only:
  // operators edit it under Manage agents, not in this panel.
  //
  // Prefer `currentApp` over the parent's `app` prop because the parent
  // page captures `app` at mount time and doesn't re-pass a fresh copy
  // when the operator switches Active Agent above. ActiveAgentSelector
  // pushes the API's updated app row into the store via doUpdateApp,
  // so reading `currentApp` (when it's the same _id) gives us the
  // fresh defaultBotInstanceId without a parent re-render.
  const activeAgent = useMemo(() => {
    const isSameApp =
      (currentApp as any)?._id &&
      (app as any)?._id &&
      String((currentApp as any)._id) === String((app as any)._id);
    const biId = isSameApp
      ? (currentApp as any).defaultBotInstanceId
      : (app as any)?.defaultBotInstanceId
        || (currentApp as any)?.defaultBotInstanceId;
    if (!biId) return null;
    const bi = botInstances.find((b) => b.id === biId);
    if (!bi) return null;
    return agents.find((a) => a.id === bi.agentId) || null;
  }, [agents, botInstances, app, currentApp]);
  // Env override first, then the copy bundled with this app. See
  // utils/widgetUrl.ts for why the default is a self-hosted asset.
  const widgetUrl = resolveWidgetUrl();
  // The widget's POST /v2/widget/sessions runs against the install's API
  // host. We can derive it from the script src (widget.<root> -> api.<root>)
  // at runtime in the embed itself, so data-api-base is optional in the
  // generated snippet — but expose VITE_API for installs that intentionally
  // host the widget JS off-domain.
  const apiBaseOverride = (import.meta.env.VITE_API as string | undefined) || '';

  // displayName / avatar state removed — persona comes from the active
  // Agent now (rendered above as a read-only summary). The script-tag
  // override path (data-bot-display-name / data-bot-avatar) is still
  // documented for white-label scenarios; operators add those attrs by
  // hand to the snippet below if they need them.
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
    required.push(`></script>`);

    // Read the contract from the loaded bundle rather than restating it
    // here. This block used to be a hand-written list of four attributes
    // while the widget read over thirty, so operators simply could not
    // discover most of what they had configured. `window.EthoraAssistant`
    // is published by the widget; the static list below is only a fallback
    // for the case where the operator opens this tab before the preview
    // has ever loaded the bundle.
    const specs = window.EthoraAssistant?.attributes?.filter(
      (a) => !a.required && !a.deprecatedAliasFor
    );

    const lines = specs?.length
      ? (() => {
          const width = Math.max(
            ...specs.map((a) => `${a.name}="${a.example}"`.length)
          );
          const byGroup = new Map<string, typeof specs>();
          specs.forEach((a) => {
            const list = byGroup.get(a.group) || [];
            list.push(a);
            byGroup.set(a.group, list);
          });
          const out: string[] = [];
          for (const [group, items] of byGroup) {
            out.push(``, `  ${group}:`);
            items.forEach((a) => {
              const pair = `${a.name}="${a.example}"`;
              out.push(`    ${pair.padEnd(width)}  ${a.doc}`);
            });
          }
          return out;
        })()
      : [
          ``,
          `    data-bot-name="Custom Bot Name"`,
          `    data-bot-avatar="https://your-cdn/avatar.png"`,
          `    data-title="Help"`,
          `    data-greeting-message="Hi! How can I help?"`,
          `    (load the preview once to list every supported attribute)`,
        ];

    const optional = [
      ``,
      `<!--`,
      `  Optional. Move any of these inside the <script ...> tag above to`,
      `  override the defaults (which come from the active Agent set in your`,
      `  AI Widget admin):`,
      ...lines,
      `-->`,
    ];

    return [...required, ...optional].join('\n');
  }, [appId, widgetUrl, apiBaseOverride]);

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
      <div className="font-semibold font-sans text-[16px] my-4">{t('aiWidgetCode.title')}</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('aiWidgetCode.description')}
      </p>

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
          {/* Persona summary — read-only. The widget pulls displayName +
              avatar straight from the active Agent at runtime via the
              bot's outbound stanza <data fullName=... photo=.../>, so
              there's nothing to set here. Operators wanting to change
              the persona edit it under Manage agents. */}
          <div className="mb-6">
            <div className="text-sm font-semibold mb-2 text-gray-700">
              {t('aiWidgetCode.personaLabel')}
            </div>
            {activeAgent ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                {activeAgent.avatarUrl ? (
                  <img
                    src={activeAgent.avatarUrl}
                    alt={activeAgent.displayName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                    {activeAgent.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {activeAgent.displayName}
                  </div>
                  {activeAgent.bio && (
                    <div className="text-xs text-gray-500 truncate">
                      {activeAgent.bio}
                    </div>
                  )}
                </div>
                <Link
                  to={`/app/admin/agents/${activeAgent.id}/settings`}
                  className="text-brand-500 hover:underline text-sm"
                >
                  {t('aiWidgetCode.editInManageAgents')}
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
                {t('aiWidgetCode.noAgentPrefix')}{' '}
                <span className="font-medium">{t('aiWidgetCode.noAgentSelectorLabel')}</span>{' '}
                {t('aiWidgetCode.noAgentSuffix')}
              </div>
            )}
          </div>

          {/* Inline help replaced by the commented-out block inside the
              snippet itself (see scriptCode useMemo above). One info
              line stays here so first-time integrators know overrides
              exist without reading the snippet end-to-end. */}
          <div className="mb-4 flex items-start gap-2 text-sm text-gray-600">
            <InfoOutlinedIcon fontSize="small" className="mt-0.5 shrink-0" />
            <span>
              {t('aiWidgetCode.infoLinePrefix')}
              <code className="mx-1 px-1 rounded bg-gray-100">data-*</code>
              {t('aiWidgetCode.infoLineMiddle')}
              <code className="mx-1 px-1 rounded bg-gray-100">&lt;script&gt;</code>
              {t('aiWidgetCode.infoLineSuffix')}
            </span>
          </div>

          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            {t('aiWidgetCode.insertBodyText')}
          </p>
          <div
            className="relative rounded-md bg-gray-700 overflow-y-auto"
            style={{ maxHeight: 360 }}
          >
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? t('aiWidgetCode.copied') : t('aiWidgetCode.copy')}>
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
            {t('aiWidgetCode.wordpressInsertPrefix')}{' '}
            <a href="" className="text-brand-500">
              Ethora AI Assistant plugin
            </a>{' '}
            {t('aiWidgetCode.wordpressInsertSuffix')}
          </p>
          <div className="relative rounded-md bg-gray-700">
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
