// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyButton } from '../../components/CopyButton';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import {
  httpCreateUserApiKey,
  httpListUserApiKeys,
  httpListUserOauthGrants,
  httpRevokeUserApiKey,
  httpRevokeUserOauthGrant,
  UserApiKey,
  UserApiKeyCreated,
  UserOauthGrant,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { EmailVerification } from './EmailVerification';

// Public MCP endpoint, e.g. https://mcp.chat.example.com/mcp. Blank when the
// deployment does not run the hosted MCP server; the page then hides the
// connection snippets but still manages API keys.
const MCP_URL = (import.meta.env.VITE_MCP_PUBLIC_URL || '').trim().replace(/\/+$/, '');
// Base without the trailing /mcp so the personal URL can be built as
// <base>/mcp/k/<key> (same scheme the MCP server accepts as a bearer).
const MCP_BASE = MCP_URL.replace(/\/mcp$/, '');

const TTL_OPTIONS = [30, 90, 365] as const;

// While the "key created" panel is open the list is re-read on this cadence,
// so the status flips to "Connected" in front of the user once their
// assistant makes its first request. The API throttles the write to once a
// minute, so polling faster would not show anything sooner.
const STATUS_POLL_MS = 15_000;

type ClientId =
  | 'claudeAi'
  | 'claudeDesktop'
  | 'chatgpt'
  | 'cursor'
  | 'vscode'
  | 'claudeCode'
  | 'other';

const CLIENTS: ClientId[] = [
  'claudeAi',
  'chatgpt',
  'claudeDesktop',
  'cursor',
  'vscode',
  'claudeCode',
  'other',
];

function formatDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

// "3 min", "2 h", "5 d": enough precision for "did my assistant just talk to
// this key", which is the only question the column answers.
function relativeAge(value: string, t: (key: string) => string) {
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms) || ms < 45_000) return t('userSettingsAi.justNow');
  const min = Math.round(ms / 60_000);
  const text =
    min < 60
      ? `${min} min`
      : min < 60 * 24
        ? `${Math.round(min / 60)} h`
        : `${Math.round(min / (60 * 24))} d`;
  return t('userSettingsAi.ago').replace('{time}', text);
}

// The API stores "mcp/26.9.3 cursor-vscode/1.2": the transport, then the
// assistant behind it. The assistant is the part a person recognises.
function prettyClient(value?: string | null) {
  if (!value) return '';
  const parts = value.split(' ').filter(Boolean);
  const agent = parts.find((p) => !p.startsWith('mcp/')) || parts[0] || '';
  return agent.replace('/', ' ');
}

function personalUrl(token: string) {
  return `${MCP_BASE}/mcp/k/${token}`;
}

function urlConfigSnippet(token: string) {
  return JSON.stringify(
    { mcpServers: { ethora: { url: personalUrl(token) } } },
    null,
    2
  );
}

function bearerConfigSnippet(token: string) {
  return JSON.stringify(
    {
      mcpServers: {
        ethora: {
          url: MCP_URL,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );
}

function vscodeConfigSnippet(token: string) {
  return JSON.stringify(
    { servers: { ethora: { type: 'http', url: personalUrl(token) } } },
    null,
    2
  );
}

// One-click installers. Both take the server config in the URL, so the
// personal URL (a credential) travels through the vendor's redirector; that
// is the same exposure as pasting it into the client's settings file.
function cursorInstallLink(token: string) {
  const config = btoa(JSON.stringify({ url: personalUrl(token) }));
  return `https://cursor.com/en/install-mcp?name=ethora&config=${encodeURIComponent(config)}`;
}

function vscodeInstallLink(token: string) {
  const config = encodeURIComponent(
    JSON.stringify({ name: 'ethora', type: 'http', url: personalUrl(token) })
  );
  return `https://insiders.vscode.dev/redirect?url=${encodeURIComponent(`vscode:mcp/install?${config}`)}`;
}

interface SnippetProps {
  label: string;
  value: string;
  hint?: string;
  multiline?: boolean;
}

function Snippet({ label, value, hint, multiline }: SnippetProps) {
  return (
    <div className="mb-4">
      <div className="font-sans text-regular font-semibold mb-1">{label}</div>
      {hint && (
        <div className="text-[#8C8C8C] font-sans text-[12px] mb-2">{hint}</div>
      )}
      <div className="flex items-start gap-2 bg-[#F5F7F9] rounded-xl px-[12px] py-[12px]">
        {multiline ? (
          <pre className="flex-1 min-w-0 overflow-x-auto text-[12px] font-mono whitespace-pre">
            {value}
          </pre>
        ) : (
          <div className="flex-1 min-w-0 overflow-x-auto text-[13px] font-mono whitespace-nowrap">
            {value}
          </div>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function InstallButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mb-4 py-[10px] px-5 rounded-xl bg-brand-500 text-white hover:bg-brand-darker"
    >
      {label}
    </a>
  );
}

// Per-client instructions for a freshly created key. The plan notes exist
// because two users in the first week created a key and never used it: a
// free Claude.ai or ChatGPT account has nowhere to paste a custom connector.
function ClientSteps({
  client,
  token,
  t,
}: {
  client: ClientId;
  token: string;
  t: (key: string) => string;
}) {
  const url = personalUrl(token);
  const steps = (
    <div className="font-sans text-[13px] mb-4 whitespace-pre-line">
      {t(`userSettingsAi.steps.${client}`)}
    </div>
  );
  const planNote = (key: string) => (
    <div className="font-sans text-[12px] mb-4 rounded-xl px-[12px] py-[10px] bg-amber-50 text-amber-800 border border-amber-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900">
      {t(key)}
    </div>
  );
  switch (client) {
    case 'claudeAi':
    case 'claudeDesktop':
      return (
        <>
          {steps}
          {planNote('userSettingsAi.plan.claude')}
          <Snippet label={t('userSettingsAi.personalUrlLabel')} value={url} />
        </>
      );
    case 'chatgpt':
      return (
        <>
          {steps}
          {planNote('userSettingsAi.plan.chatgpt')}
          <Snippet label={t('userSettingsAi.personalUrlLabel')} value={url} />
        </>
      );
    case 'cursor':
      return (
        <>
          {steps}
          <InstallButton
            href={cursorInstallLink(token)}
            label={t('userSettingsAi.installCursor')}
          />
          <Snippet
            label={t('userSettingsAi.snippetJson')}
            value={urlConfigSnippet(token)}
            multiline
          />
        </>
      );
    case 'vscode':
      return (
        <>
          {steps}
          <InstallButton
            href={vscodeInstallLink(token)}
            label={t('userSettingsAi.installVscode')}
          />
          <Snippet
            label={t('userSettingsAi.snippetVscodeJson')}
            value={vscodeConfigSnippet(token)}
            multiline
          />
        </>
      );
    case 'claudeCode':
      return (
        <>
          {steps}
          <Snippet
            label={t('userSettingsAi.claudeCodeLabel')}
            value={`claude mcp add --transport http ethora ${url}`}
          />
        </>
      );
    default:
      return (
        <>
          {steps}
          <Snippet label={t('userSettingsAi.personalUrlLabel')} value={url} />
          <Snippet
            label={t('userSettingsAi.snippetJson')}
            value={urlConfigSnippet(token)}
            multiline
          />
          <Snippet
            label={t('userSettingsAi.snippetBearer')}
            value={bearerConfigSnippet(token)}
            multiline
          />
        </>
      );
  }
}

function UsageStatus({
  lastUsedAt,
  lastUsedBy,
  fresh,
  t,
}: {
  lastUsedAt?: string | null;
  lastUsedBy?: string | null;
  // The key the user just created: "not connected yet" is the honest state.
  // For older rows the same null means only "no requests recorded", which
  // an OAuth grant that connected months ago should not be called.
  fresh?: boolean;
  t: (key: string) => string;
}) {
  if (!lastUsedAt) {
    return (
      <span
        className="inline-flex items-center gap-2 whitespace-nowrap text-gray-500"
        title={t('userSettingsAi.statusWaitingHint')}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
        {t(fresh ? 'userSettingsAi.statusWaiting' : 'userSettingsAi.statusIdle')}
      </span>
    );
  }
  const client = prettyClient(lastUsedBy);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
      {t('userSettingsAi.statusConnected')}
      <span className="text-gray-500">
        {client ? `${t('userSettingsAi.statusVia').replace('{client}', client)} · ` : ''}
        {relativeAge(lastUsedAt, t)}
      </span>
    </span>
  );
}

// Days between two ISO dates, clamped to the TTL options, so a regenerated
// key keeps roughly the validity the user originally chose.
function ttlDaysOf(key: UserApiKey): number {
  const ms = new Date(key.expiresAt).getTime() - new Date(key.createdAt).getTime();
  const days = Math.round(ms / 86_400_000);
  if (!Number.isFinite(days) || days <= 0) return 90;
  return TTL_OPTIONS.reduce((best, opt) =>
    Math.abs(opt - days) < Math.abs(best - days) ? opt : best
  );
}

export function AiAssistants() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [grants, setGrants] = useState<UserOauthGrant[] | null>(null);
  const [name, setName] = useState('');
  const [ttlDays, setTtlDays] = useState<number>(90);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<UserApiKeyCreated | null>(null);
  const [client, setClient] = useState<ClientId>('claudeAi');
  const [revokeKey, setRevokeKey] = useState<UserApiKey | null>(null);
  const [regenKey, setRegenKey] = useState<UserApiKey | null>(null);
  const [revokeGrant, setRevokeGrant] = useState<UserOauthGrant | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const res = await httpListUserApiKeys();
        setKeys(res.data?.data?.items || []);
      } catch {
        if (!quiet) toast.error(t('userSettingsAi.toastError'));
      } finally {
        if (!quiet) setLoading(false);
      }
      // OAuth grants are optional: the endpoint 404s on deployments without the
      // OAuth server, in which case the whole section stays hidden.
      try {
        const res = await httpListUserOauthGrants();
        setGrants(res.data?.data?.items || []);
      } catch {
        setGrants(null);
      }
    },
    [t]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while the new-key panel is open, so the user sees the key go live.
  useEffect(() => {
    if (!created) return undefined;
    const id = window.setInterval(() => void load(true), STATUS_POLL_MS);
    return () => window.clearInterval(id);
  }, [created, load]);

  const onCreate = async () => {
    setCreating(true);
    try {
      const res = await httpCreateUserApiKey({
        name: name.trim() || undefined,
        ttlDays,
      });
      setCreated(res.data?.data || null);
      setName('');
      toast.success(t('userSettingsAi.toastCreated'));
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setCreating(false);
    }
  };

  const onRevokeKey = async () => {
    if (!revokeKey) return;
    setBusy(true);
    try {
      await httpRevokeUserApiKey(revokeKey.id);
      toast.success(t('userSettingsAi.toastRevoked'));
      if (created && created.id === revokeKey.id) setCreated(null);
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setBusy(false);
      setRevokeKey(null);
    }
  };

  // Item for a user who closed the details panel too early: the old key is
  // unrecoverable by design (shown once), so the way back is a fresh key with
  // the same name and validity, revoking the old one first.
  const onRegenerateKey = async () => {
    if (!regenKey) return;
    setBusy(true);
    try {
      const res = await httpCreateUserApiKey({
        name: regenKey.name || undefined,
        ttlDays: ttlDaysOf(regenKey),
      });
      await httpRevokeUserApiKey(regenKey.id);
      setCreated(res.data?.data || null);
      toast.success(t('userSettingsAi.toastRegenerated'));
      await load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setBusy(false);
      setRegenKey(null);
    }
  };

  const onRevokeGrant = async () => {
    if (!revokeGrant) return;
    setBusy(true);
    try {
      await httpRevokeUserOauthGrant(revokeGrant.id);
      toast.success(t('userSettingsAi.toastDisconnected'));
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setBusy(false);
      setRevokeGrant(null);
    }
  };

  const createdRow = created ? keys.find((k) => k.id === created.id) : undefined;

  return (
    <div className="md:ml-4 pb-8">
      <p className="font-sans text-regular font-semibold mb-2">
        {t('userSettingsAi.heading')}
      </p>
      <div className="text-[#8C8C8C] font-sans text-[12px] mb-4">
        {t('userSettingsAi.intro')}
      </div>

      {/* Quiet, opt-in only: connecting ChatGPT needs a verified address, so
          the state belongs on this tab. It renders nothing when the backend
          does not report one. */}
      <EmailVerification />

      {MCP_URL ? (
        <Snippet label={t('userSettingsAi.endpointLabel')} value={MCP_URL} />
      ) : (
        <div className="mb-6 text-[12px] font-sans bg-[#F5F7F9] rounded-xl px-[12px] py-[12px]">
          {t('userSettingsAi.mcpDisabled')}
        </div>
      )}

      {created && (
        <div className="mb-8 rounded-2xl border border-brand-500 p-4">
          <div className="font-sans text-regular font-semibold mb-1">
            {t('userSettingsAi.newKeyHeading')}
          </div>
          <div className="text-red-500 font-sans text-[12px] mb-4">
            {t('userSettingsAi.newKeyWarning')}
          </div>
          <Snippet label={t('userSettingsAi.keyLabel')} value={created.token} />

          {MCP_URL && (
            <>
              <div className="font-sans text-regular font-semibold mb-1">
                {t('userSettingsAi.newKeyLead')}
              </div>
              <div className="text-gray-500 font-sans text-[12px] mb-3">
                {t('userSettingsAi.pickClientHint')}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {CLIENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClient(c)}
                    className={
                      c === client
                        ? 'py-[8px] px-4 rounded-xl bg-brand-500 text-white text-[13px]'
                        : 'py-[8px] px-4 rounded-xl bg-gray-100 text-[13px] hover:bg-brand-hover'
                    }
                  >
                    {t(`userSettingsAi.client.${c}`)}
                  </button>
                ))}
              </div>
              <ClientSteps client={client} token={created.token} t={t} />
            </>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="font-sans text-[13px]">
              <UsageStatus
                lastUsedAt={createdRow?.lastUsedAt}
                lastUsedBy={createdRow?.lastUsedBy}
                fresh
                t={t}
              />
            </div>
            <button
              type="button"
              onClick={() => void load(true)}
              className="text-[13px] text-brand-500 hover:underline"
            >
              {t('userSettingsAi.refreshStatus')}
            </button>
            <button
              type="button"
              onClick={() => setCreated(null)}
              className="ml-auto py-[10px] px-6 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover"
            >
              {t('userSettingsAi.doneButton')}
            </button>
          </div>
        </div>
      )}

      <p className="font-sans text-regular font-semibold mb-1">
        {t('userSettingsAi.keysHeading')}
      </p>
      <div className="text-[#8C8C8C] font-sans text-[12px] mb-3">
        {t('userSettingsAi.keysDescription')}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 max-w-[640px]">
        <input
          type="text"
          value={name}
          maxLength={64}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('userSettingsAi.namePlaceholder')}
          className="flex-1 bg-[#F5F7F9] rounded-xl px-[12px] py-[12px] placeholder:text-[#8C8C8C] outline-none"
        />
        <label className="flex items-center gap-2 text-[13px] font-sans">
          <span className="whitespace-nowrap">{t('userSettingsAi.ttlLabel')}</span>
          <select
            value={ttlDays}
            onChange={(e) => setTtlDays(Number(e.target.value))}
            className="bg-[#F5F7F9] rounded-xl px-[12px] py-[12px] outline-none"
          >
            {TTL_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {t(`userSettingsAi.ttl${d}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={creating}
          onClick={onCreate}
          className="hover:bg-brand-darker py-[12px] px-6 rounded-xl bg-brand-500 text-white disabled:opacity-50 whitespace-nowrap"
        >
          {creating ? t('userSettingsAi.creating') : t('userSettingsAi.createButton')}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="text-[#8C8C8C] font-sans text-[12px] mb-8">
          {t('userSettingsAi.noKeys')}
        </div>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-[13px] font-sans">
            <thead>
              <tr className="text-left text-[#8C8C8C]">
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colName')}</th>
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colStatus')}</th>
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colCreated')}</th>
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colExpires')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-gray-200">
                  <td className="py-2 pr-4 break-all">{k.name || '-'}</td>
                  <td className="py-2 pr-4">
                    <UsageStatus lastUsedAt={k.lastUsedAt} lastUsedBy={k.lastUsedBy} t={t} />
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(k.createdAt)}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(k.expiresAt)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setRegenKey(k)}
                      className="text-brand-500 hover:underline mr-4"
                    >
                      {t('userSettingsAi.regenerateButton')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevokeKey(k)}
                      className="text-red-400 hover:underline"
                    >
                      {t('userSettingsAi.revokeButton')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {grants !== null && (
        <>
          <p className="font-sans text-regular font-semibold mb-1">
            {t('userSettingsAi.grantsHeading')}
          </p>
          <div className="text-[#8C8C8C] font-sans text-[12px] mb-3">
            {t('userSettingsAi.grantsDescription')}
          </div>
          {grants.length === 0 ? (
            <div className="text-[#8C8C8C] font-sans text-[12px]">
              {t('userSettingsAi.noGrants')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] font-sans">
                <thead>
                  <tr className="text-left text-[#8C8C8C]">
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colApp')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colStatus')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colScope')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colCreated')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colExpires')}</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g) => (
                    <tr key={g.id} className="border-t border-gray-200">
                      <td className="py-2 pr-4 break-all">{g.clientName || '-'}</td>
                      <td className="py-2 pr-4">
                        <UsageStatus lastUsedAt={g.lastUsedAt} lastUsedBy={g.lastUsedBy} t={t} />
                      </td>
                      <td className="py-2 pr-4">{g.scope || '-'}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(g.createdAt)}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(g.expiresAt)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setRevokeGrant(g)}
                          className="text-red-400 hover:underline"
                        >
                          {t('userSettingsAi.disconnectButton')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {revokeKey && (
        <ConfirmModal
          title={t('userSettingsAi.revokeTitle')}
          message={
            <>
              <span className="font-semibold">{revokeKey.name || revokeKey.id}</span>
              <div className="mt-2">{t('userSettingsAi.revokeMessage')}</div>
            </>
          }
          confirmLabel={t('userSettingsAi.revokeConfirm')}
          danger
          busy={busy}
          onConfirm={onRevokeKey}
          onCancel={() => setRevokeKey(null)}
        />
      )}
      {regenKey && (
        <ConfirmModal
          title={t('userSettingsAi.regenerateTitle')}
          message={
            <>
              <span className="font-semibold">{regenKey.name || regenKey.id}</span>
              <div className="mt-2">{t('userSettingsAi.regenerateMessage')}</div>
            </>
          }
          confirmLabel={t('userSettingsAi.regenerateConfirm')}
          busy={busy}
          onConfirm={onRegenerateKey}
          onCancel={() => setRegenKey(null)}
        />
      )}
      {revokeGrant && (
        <ConfirmModal
          title={t('userSettingsAi.disconnectTitle')}
          message={
            <>
              <span className="font-semibold">{revokeGrant.clientName || revokeGrant.id}</span>
              <div className="mt-2">{t('userSettingsAi.disconnectMessage')}</div>
            </>
          }
          confirmLabel={t('userSettingsAi.disconnectButton')}
          danger
          busy={busy}
          onConfirm={onRevokeGrant}
          onCancel={() => setRevokeGrant(null)}
        />
      )}
      {loading && <Loading />}
    </div>
  );
}
