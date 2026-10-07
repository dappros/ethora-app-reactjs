import { Box, Button, Tab, Tabs } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  httpGetWidgetAppearance,
  httpSaveWidgetAppearance,
  httpUpdateApp,
  httpV2,
} from '../../http';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

import { TabAIWidgetCode } from '../../components/AIWidget/TabAIWidget/TabAIWidgetCode';
import { ModelApp } from '../../models';
import { ActiveAgentCard } from '../../components/AIWidget/ActiveAgentCard';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useAppStore } from '../../store/useAppStore';
import { Link } from 'react-router-dom';
import { AssistantAppearancePanel } from '../../components/AIWidget/AssistantAppearancePanel';
import { WidgetConversationsPanel } from '../../components/AIWidget/WidgetConversationsPanel';
import { useTranslation } from '../../i18n/useTranslation';
import {
  AiWidgetAppearance,
  defaultAiWidgetAppearance,
  appearanceFromAttributes,
  clearLegacyBrowserAppearance,
  getAppearanceAttributeRecord,
  getAppearanceAttributes,
  loadLegacyBrowserAppearance,
} from '../../lib/aiWidgetAppearance';
import { resolveWidgetUrl } from '../../utils/widgetUrl';
import './AIWidget.scss';

import { env } from '../../config/env';
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
  extraAttrs,
}: {
  widgetUrl: string;
  appId: string;
  apiBase?: string;
  displayName?: string;
  avatar?: string;
  // Operator-chosen appearance overrides (see AssistantAppearancePanel /
  // lib/aiWidgetAppearance.ts), applied to the same test-preview script tag
  // so "Test widget" reflects exactly what Save appearance would ship.
  extraAttrs?: Array<[string, string]>;
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
  // A built .js bundle must stay a classic script: module scripts are
  // fetched in CORS mode, so a bundle served from a host without
  // Access-Control-Allow-Origin would fail to load here.
  if (/\.tsx?($|\?)/.test(widgetUrl)) {
    s.type = 'module';
  }
  s.src = widgetUrl;
  s.setAttribute('data-app-id', appId);
  if (apiBase) s.setAttribute('data-api-base', apiBase);
  if (displayName) s.setAttribute('data-bot-display-name', displayName);
  if (avatar) s.setAttribute('data-bot-avatar', avatar);
  extraAttrs?.forEach(([name, value]) => s.setAttribute(name, value));
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
  const [widgetTab, setWidgetTab] = useState<'code' | 'appearance'>('code');
  const activeAgent = useActiveWidgetAgent(app);
  const currentUserId = useAppStore((s) => (s.currentUser as { _id?: string } | null)?._id);
  const ownsActiveAgent = !!activeAgent && !!currentUserId && String(activeAgent.ownerId) === String(currentUserId);

  // Appearance customization (colors, fonts, layout, launcher, CTA), stored
  // on the App and read by every live embed at load (see
  // lib/aiWidgetAppearance.ts header). `savedAppearance` is what the server
  // holds, used for the "unsaved changes" indicator; `appearance` is what
  // Test widget renders, live, before Save is even clicked.
  const [appearance, setAppearance] = useState<AiWidgetAppearance>(defaultAiWidgetAppearance);
  const [savedAppearance, setSavedAppearance] = useState<AiWidgetAppearance>(defaultAiWidgetAppearance);
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  // Settings an older build of this page kept in this browser only, offered
  // once for saving to the server when the server holds none.
  const [legacyAppearance, setLegacyAppearance] = useState<AiWidgetAppearance | null>(null);

  useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    setAppearanceLoaded(false);
    setLegacyAppearance(null);
    httpGetWidgetAppearance(appId)
      .then((resp) => {
        if (cancelled) return;
        const attrs = resp?.data?.appearance || {};
        const loaded = appearanceFromAttributes(attrs);
        setAppearance(loaded);
        setSavedAppearance(loaded);
        setAppearanceLoaded(true);
        if (!Object.keys(attrs).length) setLegacyAppearance(loadLegacyBrowserAppearance(appId));
      })
      .catch(() => {
        if (cancelled) return;
        setAppearance(defaultAiWidgetAppearance);
        setSavedAppearance(defaultAiWidgetAppearance);
        setAppearanceLoaded(true);
        toast.error(t('aiWidgetAppearance.loadFailed'));
      });
    return () => {
      cancelled = true;
    };
  }, [appId, t]);

  const handleAppearanceChange = useCallback((updates: Partial<AiWidgetAppearance>) => {
    setAppearance((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveAppearance = useCallback(
    async (next: AiWidgetAppearance) => {
      setSavingAppearance(true);
      try {
        const resp = await httpSaveWidgetAppearance(appId, getAppearanceAttributeRecord(next));
        const stored = appearanceFromAttributes(resp?.data?.appearance || {});
        setAppearance(stored);
        setSavedAppearance(stored);
        toast.success(t('aiWidgetAppearance.saved'));
        return true;
      } catch (error) {
        const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast.error(message || t('aiWidgetAppearance.saveFailed'));
        return false;
      } finally {
        setSavingAppearance(false);
      }
    },
    [appId, t]
  );

  const handleSaveAppearance = useCallback(() => {
    if (!appearanceLoaded || savingAppearance) return;
    void saveAppearance(appearance);
  }, [appearance, appearanceLoaded, saveAppearance, savingAppearance]);

  const handleKeepLegacyAppearance = useCallback(async () => {
    if (!legacyAppearance) return;
    if (await saveAppearance(legacyAppearance)) {
      clearLegacyBrowserAppearance(appId);
      setLegacyAppearance(null);
    }
  }, [appId, legacyAppearance, saveAppearance]);

  const handleDiscardLegacyAppearance = useCallback(() => {
    clearLegacyBrowserAppearance(appId);
    setLegacyAppearance(null);
  }, [appId]);

  const handleResetAppearance = useCallback(() => {
    setAppearance(defaultAiWidgetAppearance);
  }, []);

  const appearanceIsDirty = appearanceLoaded && !isEqual(appearance, savedAppearance);

  // Env override first, then the copy bundled with this app. See
  // utils/widgetUrl.ts for the full resolution order.
  const widgetUrl = resolveWidgetUrl();
  const apiBaseOverride =
    (env.VITE_API as string | undefined) || '';

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
      extraAttrs: getAppearanceAttributes(appearance),
    });
    setPreviewActive(true);
  }, [widgetUrl, appId, apiBaseOverride, appearance]);

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
        {/* Top bar: what this page is, and Test widget above (and outside)
            the agent and widget cards it exercises. */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="font-sans font-semibold text-lg">{t('appSettingsAIWidget.pageTitle')}</h2>
            <p className="font-sans text-sm text-gray-600">{t('appSettingsAIWidget.pageSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {/* The agent behind the widget: which one, who it is, whether it
            answers, what it knows. Its full editor is under Agents. */}
        <ActiveAgentCard
          appId={appId as string}
          app={app}
          enabled={statusBot}
          onToggle={handleStatusChange}
          disabled={aiFeatureDisabled}
          conversationsTotal={conversationsTotal}
          legacyKnowledgeMb={ragSize}
        />

        {legacyAppearance && (
          <Box
            role="status"
            className="flex flex-wrap items-center gap-3 px-4 py-3 mt-4 rounded-xl font-sans text-sm"
            sx={{ border: '1px solid', borderColor: 'info.light', backgroundColor: 'info.lighter' }}
          >
            <span className="flex-1 min-w-[16rem]">{t('aiWidgetAppearance.legacyFound')}</span>
            <Button size="small" variant="contained" onClick={handleKeepLegacyAppearance} disabled={savingAppearance}>
              {t('aiWidgetAppearance.legacySave')}
            </Button>
            <Button size="small" onClick={handleDiscardLegacyAppearance} disabled={savingAppearance}>
              {t('aiWidgetAppearance.legacyDiscard')}
            </Button>
          </Box>
        )}

        {/* The website widget: the embed code first, its look on a second
            tab for those who want to change it. */}
        <section className="border border-gray-200 rounded-xl bg-white mt-4" data-testid="website-widget-card">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
            <h3 className="font-sans font-semibold text-base">{t('appSettingsAIWidget.widgetCardTitle')}</h3>
          </div>
          <Tabs
            value={widgetTab}
            onChange={(_, v) => setWidgetTab(v)}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
          >
            <Tab value="code" label={t('appSettingsAIWidget.codeTab')} sx={{ minHeight: 40, textTransform: 'none' }} />
            <Tab
              value="appearance"
              label={appearanceIsDirty ? `${t('appSettingsAIWidget.appearanceTab')} *` : t('appSettingsAIWidget.appearanceTab')}
              sx={{ minHeight: 40, textTransform: 'none' }}
            />
          </Tabs>
          {widgetTab === 'code' && (
            <div className="w-full overflow-x-auto">
              <TabAIWidgetCode
                value={value}
                appId={appId}
                app={app}
                userId={aiBot.userId}
                appearance={savedAppearance}
                handleChange={handleChange}
              />
            </div>
          )}
          {/* Shown once the saved values are in, so nothing typed before the
              load finishes gets overwritten by it. */}
          {widgetTab === 'appearance' && appearanceLoaded && (
            <AssistantAppearancePanel
              embedded
              appearance={appearance}
              onChange={handleAppearanceChange}
              onSave={handleSaveAppearance}
              onReset={handleResetAppearance}
              isDirty={appearanceIsDirty}
              footer={
                <p className="font-sans text-xs text-gray-500 mt-4" data-testid="appearance-agent-note">
                  {t('appSettingsAIWidget.moreInAgentPrefix')}{' '}
                  {activeAgent ? (
                    <>
                      <Link to={`/app/admin/agents/${activeAgent.id}/settings`} className="text-brand-500 hover:underline">
                        {(ownsActiveAgent ? t('appSettingsAIWidget.editAgentLink') : t('appSettingsAIWidget.viewAgentLink')).replace('{name}', activeAgent.displayName)}
                      </Link>
                      {!ownsActiveAgent && <> {t('appSettingsAIWidget.cloneToChange')}</>}
                    </>
                  ) : (
                    <Link to="/app/admin/agents" className="text-brand-500 hover:underline">
                      {t('aiWidgetActiveAgentSelector.manageAgents')}
                    </Link>
                  )}
                </p>
              }
            />
          )}
        </section>

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
