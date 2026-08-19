import { Box, Button } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpUpdateApp, httpV2 } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

import { TabAIWidgetCode } from '../../components/AIWidget/TabAIWidget/TabAIWidgetCode';
import { ModelApp } from '../../models';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import { WidgetConversationsPanel } from '../../components/AIWidget/WidgetConversationsPanel';
import { useTranslation } from '../../i18n/useTranslation';
import './AIWidget.scss';

const statusAiBot = {
  on: true,
  off: false,
};

interface Props {
  appId: string;
  app?: ModelApp;
  setAiBot: (aiBot: ModelAIbot) => void;
  aiBot: ModelAIbot;
  defaultChatRooms: Array<ModelAppDefaulRooom>;
  primaryColor: string;
  isDisabled: boolean;
  // True when this install does NOT ship AI features (features.ai_service=false
  // in deploy.yml). The page still renders so operators on non-AI deployments
  // can preview what's available, but interactive elements are disabled and a
  // banner explains the state.
  aiFeatureDisabled?: boolean;
  handleRagChange: () => void;
}

// Inject the production widget bundle into the admin page so the operator
// preview exercises the same end-to-end flow visitors hit: script load ->
// POST /v2/widget/sessions -> SASL bind as visitor -> MUC join -> groupchat.
// The widget bundle owns its own DOM (#chat-widget div appended to body),
// so we just inject the <script> tag and let it bootstrap. Reset removes
// the script + the chat widget DOM + any persisted visitor identity, so a
// subsequent Test mints a fresh visitor and a fresh room.
const TEST_SCRIPT_ID = 'chat-content-assistant';

// The widget publishes its own control surface once loaded. We drive it
// through that instead of reaching into its localStorage: it owns twelve
// keys and the list changes, and this file used to clear exactly one of
// them - so "Reset" left the cached rooms map behind, which is what made
// the next Test fire history requests at rooms that no longer existed.
type EthoraAssistantApi = {
  reset(): void;
  destroy(): void;
  isMounted(): boolean;
  attributes: {
    name: string;
    group: string;
    required?: boolean;
    deprecatedAliasFor?: string;
    example: string;
    doc: string;
  }[];
  version: string;
};

declare global {
  interface Window {
    EthoraAssistant?: EthoraAssistantApi;
  }
}

function injectWidgetScript({
  widgetUrl,
  appId,
  apiBase,
  displayName,
  avatar,
}: {
  widgetUrl: string;
  appId: string;
  apiBase?: string;
  displayName?: string;
  avatar?: string;
}) {
  if (document.getElementById(TEST_SCRIPT_ID)) return;
  const s = document.createElement('script');
  s.id = TEST_SCRIPT_ID;
  // A TypeScript entry means the widget is being served straight from its
  // own Vite dev server (VITE_WIDGET_URL pointing at .../src/main.tsx).
  // That is an ES module, and loading it as a classic script fails on the
  // first bare import. Supporting it lets this preview run the widget's
  // current source with no build step, which is the only way to test an
  // unreleased widget without publishing a bundle first.
  if (/\.[tj]sx?($|\?)/.test(widgetUrl)) {
    s.type = 'module';
  }
  s.src = widgetUrl;
  s.setAttribute('data-app-id', appId);
  if (apiBase) s.setAttribute('data-api-base', apiBase);
  if (displayName) s.setAttribute('data-bot-display-name', displayName);
  if (avatar) s.setAttribute('data-bot-avatar', avatar);
  document.body.appendChild(s);
}

function teardownWidget() {
  // Unmount and erase everything the widget owns, so the next Test is a
  // genuine first-time visit: fresh visitor, fresh room, no cached history.
  try {
    window.EthoraAssistant?.reset();
  } catch {
    // an older bundle without the API; the DOM removal below still applies
  }
  // The <script> is ours, not the widget's, so we always remove it here.
  document.getElementById(TEST_SCRIPT_ID)?.remove();
  // Belt and braces for bundles predating window.EthoraAssistant.
  document.getElementById('chat-widget')?.remove();
}

export function AIWidget({
  appId,
  app,
  aiBot,
  setAiBot,
  handleRagChange: _handleRagChange,
  aiFeatureDisabled = false,
}: Props) {
  const { t } = useTranslation();
  const [statusBot, setStatusBot] = useState<boolean>(false);
  const [value, setValue] = useState('1');
  const [previewActive, setPreviewActive] = useState<boolean>(false);
  const [conversationsTotal, setConversationsTotal] = useState<number | null>(null);

  // Versioned first. With the plain URL taking precedence the versioned one
  // could never take effect while both were set, and the operator's browser
  // happily served a cached 3 MB bundle after a deploy - which reads exactly
  // like "the fix did not work".
  const widgetUrl =
    (import.meta.env.VITE_WIDGET_VERSIONED_URL as string | undefined) ||
    (import.meta.env.VITE_WIDGET_URL as string | undefined) ||
    '';
  const apiBaseOverride =
    (import.meta.env.VITE_API as string | undefined) || '';

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleStatusChange = async () => {
    try {
      const status = statusBot ? 'off' : 'on';
      const response = await httpUpdateApp(appId, { botStatus: status });
      const nextAiBot = response?.data?.result?.aiBot;
      if (nextAiBot) setAiBot(nextAiBot);
      setStatusBot(nextAiBot?.status === 'on');
    } catch (error) {
      console.error('Error updating AI bot status:', error);
    }
  };

  const handleStartPreview = useCallback(() => {
    if (!widgetUrl || !appId) {
      console.warn('[AIWidget] cannot start preview: widgetUrl or appId missing');
      return;
    }
    injectWidgetScript({
      widgetUrl,
      appId,
      apiBase: apiBaseOverride || undefined,
    });
    setPreviewActive(true);
  }, [widgetUrl, appId, apiBaseOverride]);

  const handleStopPreview = useCallback(() => {
    teardownWidget();
    setPreviewActive(false);
  }, []);

  // Bot RAG size — surfaced at the agent level. Kept here as a quick
  // glanceable readout; the authoritative editor lives under
  // /app/admin/agents/:agentId.
  const ragSize = useMemo(() => {
    if (!aiBot?.siteUrlsV2 || !aiBot.siteUrlsV2.length) return null;
    return (
      aiBot.siteUrlsV2.reduce((sum, l) => sum + l.mdByteSize, 0) /
      (1024 * 1024)
    ).toFixed(2);
  }, [aiBot?.siteUrlsV2]);

  useEffect(() => {
    if (aiBot?.status) {
      setStatusBot(statusAiBot[aiBot.status]);
    }
  }, [aiBot?.status]);

  // Light conversation-count probe so the "Conversations: N" readout in the
  // header strip stays honest. Re-fetched whenever the conversations panel
  // signals a change. AbortController prevents a stale response from
  // overwriting state if the user switches apps mid-flight.
  useEffect(() => {
    if (!appId || aiFeatureDisabled) return;
    const ac = new AbortController();
    httpV2
      .get(`/apps/${appId}/widget/conversations`, {
        params: { limit: 1, offset: 0 },
        signal: ac.signal,
      })
      .then((resp) => {
        const total = resp?.data?.total ?? resp?.data?.pagination?.total;
        setConversationsTotal(typeof total === 'number' ? total : 0);
      })
      .catch(() => {
        setConversationsTotal(null);
      });
    return () => ac.abort();
  }, [appId, aiFeatureDisabled]);

  // Tear the preview down on unmount — operators navigating away from the
  // tab shouldn't keep a connected widget hanging in the DOM.
  useEffect(() => {
    return () => {
      teardownWidget();
    };
  }, []);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      {aiFeatureDisabled && (
        // Preview-mode banner. The page below renders normally (so operators
        // on non-AI deployments can see what AI Widget would offer), but the
        // content is wrapped in a non-interactive layer below.
        <Box
          role="alert"
          sx={{
            mx: 2,
            mt: 2,
            mb: 1,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.light',
            backgroundColor: 'warning.lighter',
            color: 'warning.dark',
          }}
        >
          <div className="font-sans text-sm">
            <strong>{t('appSettingsAIWidget.disabledBannerStrong')}</strong>{' '}
            {t('appSettingsAIWidget.disabledBannerText')}
          </div>
        </Box>
      )}

      <div
        className={
          aiFeatureDisabled
            ? 'opacity-60 pointer-events-none select-none'
            : ''
        }
        aria-disabled={aiFeatureDisabled || undefined}
      >
        {/* Pick which Agent backs this app's widget. The full Agent editor
            (persona, prompt, RAG sources, model) lives under /app/admin/agents. */}
        <ActiveAgentSelector appId={appId as string} app={app} />

        {/* Slim agent / widget status strip. Replaces the legacy
            HeaderAIWidget (Status / Local context / Model) — Local context
            and Model moved to per-Agent settings; Status is reduced to a
            single-line indicator + toggle here. */}
        <Box className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 mt-4 border border-gray-200 rounded-xl bg-white">
          <div className="flex items-center gap-2 text-sm font-sans">
            <PowerSettingsNewIcon
              fontSize="small"
              color={statusBot ? 'success' : 'error'}
            />
            <span className="font-semibold">{t('appSettingsAIWidget.aiBotLabel')}</span>
            <span>
              {statusBot
                ? t('appSettingsAIWidget.statusEnabled')
                : t('appSettingsAIWidget.statusDisabled')}
            </span>
            <Button
              size="small"
              variant="outlined"
              onClick={handleStatusChange}
              disabled={aiFeatureDisabled}
              sx={{ ml: 1 }}
            >
              {statusBot
                ? t('appSettingsAIWidget.disableButton')
                : t('appSettingsAIWidget.enableButton')}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
            <span className="font-semibold">{t('appSettingsAIWidget.ragLabel')}</span>
            <span>{ragSize ? `${ragSize} MB` : t('appSettingsAIWidget.ragEmpty')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
            <span className="font-semibold">{t('appSettingsAIWidget.conversationsLabel')}</span>
            <span>{conversationsTotal === null ? '—' : conversationsTotal}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {previewActive ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={handleStopPreview}
                  disabled={aiFeatureDisabled}
                >
                  {t('appSettingsAIWidget.stopTestButton')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    handleStopPreview();
                    setTimeout(handleStartPreview, 50);
                  }}
                  disabled={aiFeatureDisabled}
                >
                  {t('appSettingsAIWidget.newSessionButton')}
                </Button>
              </>
            ) : (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartPreview}
                disabled={aiFeatureDisabled || !widgetUrl || !statusBot}
                title={
                  !statusBot
                    ? t('appSettingsAIWidget.enableBotFirstTooltip')
                    : !widgetUrl
                    ? t('appSettingsAIWidget.widgetHostingNotConfiguredTooltip')
                    : undefined
                }
              >
                {t('appSettingsAIWidget.testWidgetButton')}
              </Button>
            )}
          </div>
        </Box>

        {/* Embed Code panel — generates the <script> snippet operators paste
            into their own site. */}
        <div className="w-full overflow-x-auto">
          <TabAIWidgetCode
            value={value}
            appId={appId}
            app={app}
            userId={aiBot.userId}
            handleChange={handleChange}
          />
        </div>

        {/* Widget Conversations: lists rooms with chats.type='widget' for
            this app. Operators can review historical visitor sessions
            here. */}
        <WidgetConversationsPanel
          appId={appId}
          onTotalChange={setConversationsTotal}
        />
      </div>
    </div>
  );
}
